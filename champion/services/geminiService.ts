
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Initialize GoogleGenAI with a provided key or fallback to system key.
const getAI = (apiKey?: string) => new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });

/**
 * Utility for exponential backoff retries on transient API errors.
 */
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      // Handle various error formats from the SDK
      const status = err?.status || err?.error?.code || (err?.message?.includes('503') ? 503 : 0);
      const isTransient = status === 503 || status === 429 || status === "UNAVAILABLE";
      
      if (isTransient && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Gemini API busy (Status ${status}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

/**
 * Helper to translate a batch of text strings in parallel.
 */
const translateTextBatch = async (
  texts: string[],
  targetLanguage: string,
  modelName: string,
  apiKey?: string
): Promise<string[]> => {
  if (texts.length === 0) return [];
  
  return withRetry(async () => {
    const ai = getAI(apiKey);
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Translate the following array of document strings into ${targetLanguage}. 
      Maintain technical terms if appropriate but prioritize clarity in ${targetLanguage}.
      Return a JSON array of strings in the exact same order.
      
      TEXTS: ${JSON.stringify(texts)}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0,
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    try {
      const result = JSON.parse(response.text || '[]');
      return Array.isArray(result) ? result : new Array(texts.length).fill("");
    } catch (e) {
      console.error("Batch translation parsing error:", e);
      return new Array(texts.length).fill("");
    }
  });
};

export const translateResults = async (
  data: { segments?: any[], markdown?: string, extractionResult?: any },
  targetLanguage: string,
  config?: { model?: string, apiKey?: string }
) => {
  const modelName = config?.model || 'gemini-3-flash-preview';
  const apiKey = config?.apiKey;

  const tasks: { key: string; batch: string[] | string }[] = [];

  // 1. Prepare Segments for translation (Batching)
  const segments = data.segments || [];
  if (segments.length > 0) {
    const BATCH_SIZE = 20; // Larger batches to reduce request count
    for (let i = 0; i < segments.length; i += BATCH_SIZE) {
      tasks.push({ 
        key: `segments_${i}`, 
        batch: segments.slice(i, i + BATCH_SIZE).map(s => s.content) 
      });
    }
  }

  // 2. Prepare Markdown for translation
  const markdown = data.markdown || "";
  if (markdown) {
    const markdownPages = markdown.split(/--- Page \d+ ---/);
    const pageContents = markdownPages.filter(p => p.trim().length > 0);
    pageContents.forEach((page, i) => {
      tasks.push({ key: `markdown_${i}`, batch: [page] });
    });
  }

  // 3. Prepare Extraction Result for translation
  const extractionData = data.extractionResult?.data || {};
  const extractionKeys = Object.keys(extractionData);
  if (extractionKeys.length > 0) {
    tasks.push({ 
      key: 'extraction', 
      batch: extractionKeys.map(k => String(extractionData[k])) 
    });
  }

  if (tasks.length === 0) return null;

  try {
    // Process tasks with a concurrency limit to avoid 503 errors
    const CONCURRENCY_LIMIT = 3;
    const taskResults: Record<string, string[]> = {};
    const taskQueue = [...tasks];
    
    const workers = Array(CONCURRENCY_LIMIT).fill(null).map(async () => {
      while (taskQueue.length > 0) {
        const task = taskQueue.shift();
        if (!task) break;
        try {
          const batch = Array.isArray(task.batch) ? task.batch : [task.batch];
          taskResults[task.key] = await translateTextBatch(batch, targetLanguage, modelName, apiKey);
        } catch (err) {
          console.error(`Task ${task.key} failed after retries:`, err);
          taskResults[task.key] = Array.isArray(task.batch) ? new Array(task.batch.length).fill("") : [""];
        }
      }
    });

    await Promise.all(workers);

    const finalResult: any = {};

    // Reassemble segments
    if (segments.length > 0) {
      const allTranslatedSegmentContents: string[] = [];
      for (let i = 0; i < segments.length; i += 20) {
        const batchRes = taskResults[`segments_${i}`] || [];
        allTranslatedSegmentContents.push(...batchRes);
      }
      finalResult.segments = segments.map((s, i) => ({
        ...s,
        content: allTranslatedSegmentContents[i] || s.content
      }));
    }

    // Reassemble markdown
    if (markdown) {
      const pageHeaders = markdown.match(/--- Page \d+ ---/g) || [];
      let reassembledMarkdown = "";
      pageHeaders.forEach((header, i) => {
        const pageRes = taskResults[`markdown_${i}`]?.[0] || "";
        reassembledMarkdown += (reassembledMarkdown ? "\n\n" : "") + header + "\n\n" + pageRes;
      });
      finalResult.markdown = reassembledMarkdown;
    }

    // Reassemble extraction
    if (extractionKeys.length > 0) {
      const translatedValues = taskResults['extraction'] || [];
      const reassembledData: Record<string, any> = {};
      extractionKeys.forEach((k, i) => {
        reassembledData[k] = translatedValues[i] || extractionData[k];
      });
      finalResult.extractionResult = {
        ...data.extractionResult,
        data: reassembledData
      };
    }

    return finalResult;
  } catch (err) {
    console.error("Critical orchestrator failure:", err);
    return null;
  }
};

export const parseDocumentWithGemini = async (
  base64Image: string,
  mimeType: string,
  imgWidth: number,
  imgHeight: number,
  config?: { model?: string, apiKey?: string }
) => {
  const ai = getAI(config?.apiKey);
  const modelName = config?.model || 'gemini-3-flash-preview';
  
  const prompt = `Analyze this document image carefully. The image dimensions are ${imgWidth}x${imgHeight} pixels.

I need you to identify ALL visible segments/elements in the document and provide their bounding boxes.

For EACH visible element (logo, header, text block, table, form field, image/figure, etc.), provide:

Type | Description | x1,y1,x2,y2

Where coordinates are in pixels relative to the image dimensions (${imgWidth}x${imgHeight}).

CRITICAL INSTRUCTION FOR TABLES:
- If you detect a Table, the "content" field in the JSON MUST be a valid Markdown Table representation.
- Ensure rows and columns match exactly what is seen in the document.
- Include headers if present.

Format:
=== SEGMENTS ===
[Your detailed segments here, one per line]

=== MARKDOWN ===
[Full Markdown version of document content]

=== JSON ===
{
  "document_type": "technical_report",
  "chunks": [
  {
    "markdown_content": <extracted markdown content or [Image Description]>,
    "type": "Table",
    "bounding_box": [x1, y1, x2, y2],
    "content": "| Header 1 | Header 2 |\\n|---|---|\\n| Row 1 Col 1 | Row 1 Col 2 |",
    "entity": "main_table",
    "page": 1,
    "id": <uuid of chunk>
  },
  {
    "markdown_content": <extracted markdown content>,
    "type": "Text",
    "bounding_box": [x1, y1, x2, y2],
    "content": "Clean extracted text",
    "entity": "paragraph",
    "page": 1,
    "id": <uuid of chunk>
  }
  ],
  "metadata": {
    "filename": "doc.png",
    "page_count": 1
  }
}`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      temperature: 0.1,
      topP: 0.95,
      topK: 40,
    }
  });

  return response.text;
};

export const suggestFields = async (docJson: any, config?: { model?: string, apiKey?: string }) => {
  const ai = getAI(config?.apiKey);
  const modelName = config?.model || 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Analyze the provided document extraction data and identify the EXACT text labels, field names, or headers present in the document.
    
    INSTRUCTIONS:
    1. Your primary goal is to find text that acts as a label for information (e.g., "Invoice Number:", "Date of Service", "Total Amount Due").
    2. The suggested "key" MUST be the EXACT text string found in the document. Do NOT change the casing, do NOT convert to snake_case, and do NOT use generic logical names. If the doc says "DATE OF ISSUE", the key must be "DATE OF ISSUE".
    3. For visual elements like 'Image', 'Figure', or 'Logo', use a key that explicitly identifies them from the document (e.g., "Figure 1 Analysis" or "Primary Header Logo").
    4. Provide a "description" explaining the context of the field.
    
    Return as a JSON array of objects with "key" and "description".
    
    Data: ${JSON.stringify(docJson).substring(0, 8000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING, description: "The EXACT label text from the document" },
            description: { type: Type.STRING }
          },
          required: ["key", "description"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const suggestSplitConfigs = async (docJson: any, config?: { model?: string, apiKey?: string }) => {
  try {
    const ai = getAI(config?.apiKey);
    const modelName = config?.model || 'gemini-3-flash-preview';

    const chunks = docJson.chunks || [];
    if (chunks.length === 0) return [];

    const markers = chunks
      .filter((c: any) => ['Header', 'Logo', 'Table', 'Form'].includes(c.type))
      .slice(0, 30)
      .map((c: any) => `[Page ${c.page}] ${c.type}: ${String(c.content || '').substring(0, 60).trim()}`)
      .join('\n');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `You are a document structure expert. Detect logical record boundaries (e.g., where a new invoice starts) based on these markers:
      
      ${markers || 'No structural headers found. Look at the start of the document.'}
      
      Return a JSON array of splitting rules.
      - "name": A logical name for the record type (e.g., "Report Section")
      - "identifierKey": The specific label that reliably marks the start of a new record (e.g., "Account ID").`,
      config: {
        temperature: 0,
        maxOutputTokens: 600,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              identifierKey: { type: Type.STRING }
            },
            required: ["name", "identifierKey"]
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) return [];
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Critical error in suggestSplitConfigs:", error);
    return [];
  }
};

export const extractFields = async (
  docJson: any, 
  fields: {key: string, description: string}[],
  base64Image?: string,
  mimeType?: string,
  config?: { model?: string, apiKey?: string }
) => {
  const ai = getAI(config?.apiKey);
  const modelName = config?.model || 'gemini-3-flash-preview';
  
  const contents: any[] = [
    { text: `Extract the requested fields from the provided document.
    
    RULES:
    1. The provided "fields to extract" list contains strings that match EXACT labels or headers in the document. You MUST use these exact strings as the keys in your "data" and "metadata" response objects.
    2. Return a JSON object in this exact format: 
    {
      "data": {
         "Exact Label 1": "extracted value",
         "Exact Label 2": "extracted value"
      },
      "metadata": {
         "Exact Label 1": { "value": "extracted value", "references": ["chunk_id_1", "chunk_id_2"] },
         "Exact Label 2": { "value": "extracted value", "references": ["chunk_id_3"] }
      }
    }
    
    3. For fields requesting "descriptions", "details", or "summaries" of visual elements (images, figures, logos), you MUST look at the provided image and generate an accurate visual description.
    4. The "references" in metadata should match the IDs found in the source JSON chunks.
    
    Fields to extract: ${JSON.stringify(fields)}
    Source Data JSON: ${JSON.stringify(docJson).substring(0, 8000)}` }
  ];

  if (base64Image && mimeType) {
    contents.unshift({
      inlineData: {
        mimeType: mimeType,
        data: base64Image
      }
    });
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: modelName,
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json"
    }
  });
  
  try {
    const result = JSON.parse(response.text || '{"data": {}, "metadata": {}}');
    return {
      data: result.data || {},
      metadata: result.metadata || {}
    };
  } catch (e) {
    return { data: {}, metadata: {} };
  }
};

export const performDocumentSplit = async (docJson: any, splitConfigs: {name: string, identifierKey?: string}[], config?: { model?: string, apiKey?: string }) => {
  const ai = getAI(config?.apiKey);
  const modelName = config?.model || 'gemini-3-flash-preview';
  
  const prunedChunks = (docJson.chunks || []).map((c: any) => ({
    id: String(c.id),
    content: (c.content || '').substring(0, 400),
    page: c.page,
    type: c.type
  }));

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `You are a document organizer. Divide the provided chunks into logical records based on the split rules.
    
    RULES:
    1. Use the "identifierKey" from the configs to find where one document ends and another begins.
    2. Group specific Chunk IDs that belong together.
    3. Ensure every chunk belongs to at least one split.
    
    SPLIT RULES: ${JSON.stringify(splitConfigs)}
    CHUNKS: ${JSON.stringify(prunedChunks)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                split_name: { type: Type.STRING },
                identifier_value: { type: Type.STRING },
                chunk_ids: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["split_name", "identifier_value", "chunk_ids"]
            }
          }
        },
        required: ["results"]
      }
    }
  });
  
  try {
    const raw = JSON.parse(response.text || '{"results": []}');
    const data: Record<string, any> = {};
    const metadata: Record<string, any> = {};
    
    (raw.results || []).forEach((r: any) => {
      data[r.split_name] = r.identifier_value;
      metadata[r.split_name] = { 
        value: r.identifier_value, 
        references: r.chunk_ids 
      };
    });

    return { data, metadata };
  } catch (e) {
    console.error("Split parsing error:", e);
    return { data: {}, metadata: {} };
  }
};

export const performSemanticValidation = async (extractedData: Record<string, any>, excelData: Record<string, any>, config?: { model?: string, apiKey?: string }) => {
  const ai = getAI(config?.apiKey);
  const modelName = config?.model || 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Compare the following two datasets: "Extracted Data" from a document and "Excel Reference Data".
    
    Your task:
    1. For each key in the Excel Data, find the most semantically related key in the Extracted Data.
    2. Determine if the values are semantically the same (e.g., "Oct 10, 2023" is semantically same as "10/10/23").
    3. Provide match status and reasoning.
    4. Calculate an overall similarity score (0-100).
    
    Extracted Data: ${JSON.stringify(extractedData)}
    Excel Reference Data: ${JSON.stringify(excelData)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                excel_key: { type: Type.STRING, description: "The column name from the Excel data" },
                is_match: { type: Type.BOOLEAN, description: "Whether the extracted value matches the excel value semantically" },
                reasoning: { type: Type.STRING, description: "Brief explanation of the comparison" }
              },
              required: ["excel_key", "is_match", "reasoning"]
            }
          },
          similarity_score: { type: Type.NUMBER, description: "Overall percentage of matched fields" }
        },
        required: ["items", "similarity_score"]
      }
    }
  });

  try {
    const rawResult = JSON.parse(response.text || '{"items": [], "similarity_score": 0}');
    const matches: Record<string, boolean> = {};
    const details: Record<string, string> = {};
    
    (rawResult.items || []).forEach((item: any) => {
      matches[item.excel_key] = item.is_match;
      details[item.excel_key] = item.reasoning;
    });

    return {
      matches,
      similarity: rawResult.similarity_score || 0,
      details
    };
  } catch (e) {
    console.error("Failed to parse semantic validation response:", e);
    return { matches: {}, similarity: 0, details: {} };
  }
};

export const compareTableData = async (documentTableMarkdown: string, excelTableJson: any[], config?: { model?: string, apiKey?: string }) => {
  const ai = getAI(config?.apiKey);
  const modelName = config?.model || 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `You are a data validation expert. Compare the table data extracted from a document with the provided reference data (Excel/CSV).
    
    Document Table (Markdown):
    ${documentTableMarkdown}
    
    Reference Data (JSON Array):
    ${JSON.stringify(excelTableJson)}
    
    TASK:
    1. Map rows in the Reference Data to rows in the Document Table.
    2. Identify EXACT matches and MISMATCHES.
    3. For mismatches, pinpoint the specific cells or values that differ and explain the discrepancy.
    4. If a row exists in reference but is missing from the document (or vice-versa), flag it.
    
    Return a JSON structure:
    {
      "comparison_rows": [
        {
          "reference_row_summary": "Short description of the row",
          "status": "MATCH" | "MISMATCH" | "MISSING_IN_DOC" | "MISSING_IN_REF",
          "details": "Explanation of findings or discrepancies",
          "confidence_score": 0-100
        }
      ],
      "overall_accuracy": 0-100
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          comparison_rows: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                reference_row_summary: { type: Type.STRING },
                status: { type: Type.STRING },
                details: { type: Type.STRING },
                confidence_score: { type: Type.NUMBER }
              },
              required: ["reference_row_summary", "status", "details"]
            }
          },
          overall_accuracy: { type: Type.NUMBER }
        },
        required: ["comparison_rows", "overall_accuracy"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"comparison_rows": [], "overall_accuracy": 0}');
  } catch (e) {
    console.error("Table validation error:", e);
    return { comparison_rows: [], overall_accuracy: 0 };
  }
};

export const chatWithDocument = async (
  query: string,
  base64Image: string,
  mimeType: string,
  history: { role: string; text: string }[] = [],
  config?: { model?: string, apiKey?: string }
) => {
  const ai = getAI(config?.apiKey);
  const modelName = config?.model || 'gemini-3-flash-preview';

  const chat = ai.chats.create({
    model: modelName,
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    })),
    config: {
      systemInstruction: "You are a professional document analyzer. Use the provided image to answer exactly. Be concise.",
    }
  });

  const response: GenerateContentResponse = await chat.sendMessage({
    message: [
      { inlineData: { mimeType, data: base64Image } },
      { text: query }
    ]
  });

  return response.text;
};

export const generateMindMap = async (docMarkdown: string, config?: { model?: string, apiKey?: string }) => {
  const ai = getAI(config?.apiKey);
  const modelName = config?.model || 'gemini-3-flash-preview';

  const contentToAnalyze = docMarkdown.substring(0, 12000);
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Create a comprehensive and deep Knowledge Mind Map of the provided document content.
    
    HIERARCHY RULES:
    1. Central Node: The document's primary title or core subject.
    2. Primary Branches: Main themes, chapters, or major sections.
    3. Secondary Branches: Supporting details, key takeaways, and sub-points.
    4. Tertiary+ Branches: Specific examples, data points, or granular facts.
    
    Return a detailed nested JSON structure.
    
    Content: ${contentToAnalyze}`,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 4000,
      thinkingConfig: { thinkingBudget: 1000 },
      responseSchema: {
        type: Type.OBJECT,
        description: "A comprehensive nested mind map tree",
        properties: {
          text: { type: Type.STRING, description: "The central idea" },
          children: {
            type: Type.ARRAY,
            description: "Major branches",
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                children: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      children: { 
                        type: Type.ARRAY, 
                        items: { 
                          type: Type.OBJECT, 
                          properties: { 
                            text: { type: Type.STRING },
                            children: {
                               type: Type.ARRAY,
                               items: {
                                 type: Type.OBJECT,
                                 properties: { text: { type: Type.STRING } },
                                 required: ["text"]
                               }
                            }
                          },
                          required: ["text"]
                        } 
                      }
                    },
                    required: ["text"]
                  }
                }
              },
              required: ["text"]
            }
          }
        },
        required: ["text", "children"]
      }
    }
  });

  try {
    const text = response.text?.trim();
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parsing Error in generateMindMap:", e, response.text);
    return { 
      text: "Parsing Error", 
      children: [{ text: "The generated mind map was too complex or malformed. Try selecting a specific section." }] 
    };
  }
};
