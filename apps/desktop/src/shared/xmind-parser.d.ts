declare module "@ljheee/xmind-parser" {
  export interface XMindNodeData {
    text?: string;
    hyperlink?: string;
    note?: string;
    label?: string[];
    priority?: number;
    progress?: number;
    markers?: string[];
    image?: string;
    imageSize?: { width?: number; height?: number };
    expandState?: string;
    [key: string]: unknown;
  }

  export interface XMindNode {
    data: XMindNodeData;
    children?: XMindNode[];
  }

  export interface XMindDocument {
    root: XMindNode;
    title?: string;
    template?: string;
    theme?: string;
  }

  export interface XMindExportOptions {
    format?: "xmind8" | "xmind2020";
    sheetName?: string;
  }

  export function xmindBufferToKm(
    buffer: ArrayBuffer,
    options?: { firstSheetOnly?: boolean },
  ): Promise<XMindDocument[]>;

  export function kmToXmindBuffer(
    kmData: XMindDocument | XMindDocument[],
    options?: XMindExportOptions,
  ): ArrayBuffer;
}
