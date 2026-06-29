
export interface Segment {
  id: number;
  type: string;
  content: string;
  bbox: [number, number, number, number] | null;
  page?: number;
}

export interface ChatMessage {
  id: number;
  type: 'user' | 'assistant';
  content: string;
}

export interface FileEntry {
  id: number;
  name: string;
  size: string;
  date: string;
}

export interface ApiKeyEntry {
  id: number;
  key: string;
  created: string;
  lastUsed: string;
}

export interface FieldSuggestion {
  key: string;
  description: string;
}

export interface ExtractionResult {
  data: Record<string, any>;
  metadata: Record<string, { value: any; references: string[] }>;
}

export interface SplitTypeConfig {
  id: string;
  name: string;
  identifierKey?: string;
}

export interface DocumentSplit {
  type: string;
  identifierValue?: string;
  chunks: string[];
  markdown: string;
}

export interface SplitExtractionResult {
  data: Record<string, any>;
  metadata: Record<string, { value: any; references: string[] }>;
}

export interface MindMapNode {
  text: string;
  children?: MindMapNode[];
}

export interface ValidationResults {
  matches: Record<string, boolean>;
  similarity: number;
  details: Record<string, string>;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  selectedModelId: string;
  modelApiKeys: Record<string, string>;
}

export interface FileSession {
  id: number;
  name: string;
  size: string;
  date: string;
  previews: string[];
  mimeType: string;
  segments: Segment[];
  markdown: string;
  json: any;
  chatMessages: ChatMessage[];
  extractionResult: ExtractionResult | null;
  splitExtractionResult: SplitExtractionResult | null;
  fieldSuggestions: FieldSuggestion[];
  splitConfigs: SplitTypeConfig[];
  mindMapData?: MindMapNode | null;
  // Added fields for translation
  translatedSegments?: Segment[];
  translatedMarkdown?: string;
  translatedJSON?: any;
  translatedExtractionResult?: ExtractionResult | null;
  outputLanguage?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  companyName: string;
  jobTitle: string;
  address: string;
}
