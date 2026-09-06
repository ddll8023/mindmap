export type DesktopCommand =
  | "import-xmind"
  | "export-svg"
  | "export-png";

export interface OpenXMindResult {
  canceled: boolean;
  filePath?: string;
  fileName?: string;
  content?: string;
  warnings?: string[];
}

export interface SaveExportResult {
  canceled: boolean;
  filePath?: string;
}

export interface DesktopApi {
  openXMind(): Promise<OpenXMindResult>;
  saveSvg(content: string, suggestedName: string): Promise<SaveExportResult>;
  savePng(data: ArrayBuffer, suggestedName: string): Promise<SaveExportResult>;
  onCommand(listener: (command: DesktopCommand) => void): () => void;
}

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}
