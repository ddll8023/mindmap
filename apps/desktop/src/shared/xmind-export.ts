import { kmToXmindBuffer } from "@ljheee/xmind-parser";
import {
  allPlugins,
  parseInlineMarkdown,
} from "@mindmap/core";
import type { MindMapData, TaskStatus } from "@mindmap/core";
import type { XMindDocument, XMindNode, XMindNodeData } from "@ljheee/xmind-parser";

const TASK_PROGRESS: Record<TaskStatus, number> = {
  todo: 1,
  doing: 5,
  done: 9,
};

interface ExportText {
  text: string;
  hyperlink?: string;
  image?: string;
}

function getExportText(source: string): ExportText {
  const tokens = parseInlineMarkdown(source, allPlugins);
  let hyperlink: string | undefined;
  let image: string | undefined;

  const hasFormula = tokens.some((token) => token.type === "latex-inline" || token.type === "latex-block");
  const text = tokens
    .map((token) => {
      switch (token.type) {
        case "link":
          hyperlink ??= token.url;
          // Import uses a separate link marker to keep formulas out of link labels.
          return hasFormula && token.text === "↗" ? "" : token.text;
        case "image":
          image ??= token.url;
          return token.alt;
        case "code":
          return `\`${token.content}\``;
        case "latex-inline":
          return `$${token.content}$`;
        case "latex-block":
          return `$$${token.content}$$`;
        default:
          return "content" in token ? token.content : "";
      }
    })
    .join("").trim();

  return {
    text: text || "未命名主题",
    ...(hyperlink ? { hyperlink } : {}),
    ...(image ? { image } : {}),
  };
}

function getNodeNote(node: MindMapData): string | undefined {
  const noteParts: string[] = [];
  if (node.remark?.trim()) noteParts.push(node.remark);
  if (node.multiLineContent?.length) {
    noteParts.push(node.multiLineContent.join("\n"));
  }
  return noteParts.length > 0 ? noteParts.join("\n") : undefined;
}

function toXMindNode(node: MindMapData): XMindNode {
  const exportText = getExportText(node.text);
  const data: XMindNodeData = { text: exportText.text };

  if (exportText.hyperlink) data.hyperlink = exportText.hyperlink;
  if (exportText.image) data.image = exportText.image;

  const note = getNodeNote(node);
  if (note) data.note = note;

  const labels = node.tags?.map((tag) => tag.trim()).filter(Boolean);
  if (labels && labels.length > 0) data.label = labels;

  if (node.taskStatus) data.progress = TASK_PROGRESS[node.taskStatus];
  if (node.collapsed) data.expandState = "collapse";

  const result: XMindNode = { data };
  if (node.children && node.children.length > 0) {
    result.children = node.children.map(toXMindNode);
  }
  return result;
}

export function toXMindDocuments(roots: MindMapData[]): XMindDocument[] {
  const sourceRoots = roots.length > 0 ? roots : [{ id: "root", text: "Root" }];

  return sourceRoots.map((root, index) => {
    const xmindRoot = toXMindNode(root);
    return {
      root: xmindRoot,
      title: xmindRoot.data.text || `Sheet ${index + 1}`,
    };
  });
}

export function exportMindMapToXMind(roots: MindMapData[]): ArrayBuffer {
  return kmToXmindBuffer(toXMindDocuments(roots), { format: "xmind2020" });
}
