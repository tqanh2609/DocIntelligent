# AI DocuVision Parser

An advanced document analysis workstation that uses Google's Gemini Vision models to extract structured data, segments, and Markdown from PDF and image files. Upload a document and interact with it through bounding-box visualization, intelligent chat, field extraction, mind maps, and reference-data validation.

## Features

- **Vision-based parsing** – Extracts segments, full Markdown, and structured JSON from PDFs and images, with pixel-accurate bounding boxes rendered over each page.
- **Field suggestion & extraction** – Auto-detects the exact labels present in a document and extracts their values, with references back to the source chunks.
- **Document splitting** – Detects logical record boundaries (e.g. where a new invoice begins) and groups chunks into separate records.
- **Chat with your document** – Ask questions about the uploaded document and get concise, image-grounded answers.
- **Mind map generation** – Builds a nested knowledge mind map of the document, viewable as a hierarchy or tree.
- **Validation** – Compares extracted data against an uploaded Excel/CSV reference using semantic matching and table-level comparison, with similarity scoring.
- **Result translation** – Translates segments, Markdown, and extracted fields into multiple languages on demand.
- **Multi-model support** – Switch between Gemini models (Flash, Pro, Flash Lite) and optionally supply a per-model API key.
- **Session history** – Keeps per-file sessions with their parsed output, chat, and translations.
- **Localized UI** – Interface available in English, Spanish, Chinese, German, Korean, Japanese, and Vietnamese, with light/dark themes.

## Tech Stack

- [React 19](https://react.dev/) + TypeScript
- [Vite 6](https://vitejs.dev/) for dev server and bundling
- [@google/genai](https://www.npmjs.com/package/@google/genai) for the Gemini API
- [Tailwind CSS](https://tailwindcss.com/) (via CDN) for styling
- [lucide-react](https://lucide.dev/) for icons
- [pdf.js](https://mozilla.github.io/pdf.js/) for client-side PDF rendering
- [SheetJS (xlsx)](https://sheetjs.com/) for Excel/CSV parsing

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- A [Gemini API key](https://ai.google.dev/gemini-api/docs)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root and add your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The app runs at [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script            | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite development server.           |
| `npm run build`   | Build the production bundle into `dist/`.    |
| `npm run preview` | Preview the production build locally.        |

## Configuration

The Gemini API key is read from `GEMINI_API_KEY` in `.env.local` and injected at build time via `vite.config.ts`. You can also provide a custom API key per model from within the app's settings UI, which overrides the environment key for that model.

## Project Structure

```
.
├── App.tsx                 # Main application UI and state
├── index.tsx               # React entry point
├── index.html              # HTML shell, importmap, and CDN scripts
├── types.ts                # Shared TypeScript types
├── services/
│   └── geminiService.ts    # Gemini API calls (parse, extract, split, chat, validate, translate, mind map)
├── vite.config.ts          # Vite config and env injection
└── tsconfig.json           # TypeScript configuration
```

## Security Note

Because this is a client-side application, the `GEMINI_API_KEY` is bundled into the frontend at build time and is therefore visible to anyone using the deployed app. Do not commit your `.env.local` file (it is already covered by `.gitignore`), and avoid deploying a build with a production key publicly. For a public deployment, route Gemini requests through a backend proxy that keeps the key server-side.

## License

No license has been specified for this project. Add a `LICENSE` file if you intend to make it open source.
