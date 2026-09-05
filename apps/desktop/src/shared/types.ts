export type DesktopCommand =
  | "import-markdown"
  | "export-svg"
  | "export-png";

export interface OpenMarkdownResult {
  canceled: boolean;
  filePath?: string;
  fileName?: string;
  content?: string;
}

export interface SaveExportResult {
  canceled: boolean;
  filePath?: string;
}

export interface DesktopApi {
  openMarkdown(): Promise<OpenMarkdownResult>;
  saveSvg(content: string, suggestedName: string): Promise<SaveExportResult>;
  savePng(data: ArrayBuffer, suggestedName: string): Promise<SaveExportResult>;
  onCommand(listener: (command: DesktopCommand) => void): () => void;
}

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}
