import type { XMindDocument, XMindNode, XMindNodeData } from "@ljheee/xmind-parser";

export interface XMindMarkdownResult {
  markdown: string;
  warnings: string[];
}

const EXTERNAL_LINK_RE = /^(?:https?:|mailto:|tel:)/i;
const SAFE_TAG_RE = /^[A-Za-z0-9_-]+$/;

function normalizeText(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value : "";
  return text.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ").trim() || fallback;
}

function getTopicText(data: XMindNodeData, fallback: string): string {
  return normalizeText(data.text, fallback);
}

function formatLink(text: string, hyperlink: string): string {
  const label = text.replace(/\]/g, "\\]");
  const url = hyperlink.trim().replace(/\)/g, "%29");
  return `[${label}](${url})`;
}

function getTaskPrefix(progress: unknown): string {
  if (typeof progress !== "number") return "";
  if (progress === 9) return "[x] ";
  if (progress === 1) return "[ ] ";
  if (progress >= 2 && progress <= 10) return "[-] ";
  return "";
}

function addWarning(warnings: Set<string>, warning: string): void {
  warnings.add(warning);
}

function formatNodeText(
  data: XMindNodeData,
  fallback: string,
  warnings: Set<string>,
): string {
  let text = getTopicText(data, fallback);
  const hyperlink = typeof data.hyperlink === "string" ? data.hyperlink.trim() : "";

  if (hyperlink) {
    if (EXTERNAL_LINK_RE.test(hyperlink)) {
      text = formatLink(text, hyperlink);
    } else {
      addWarning(warnings, "内部链接或附件链接");
    }
  }

  if (Array.isArray(data.label)) {
    const tags = data.label
      .map((label) => normalizeText(label, ""))
      .filter((label) => SAFE_TAG_RE.test(label));
    const skippedLabels = data.label.length - tags.length;
    if (skippedLabels > 0) addWarning(warnings, "部分标签");
    if (tags.length > 0) text += ` ${tags.map((tag) => `#${tag}`).join(" ")}`;
  }

  if (data.image) addWarning(warnings, "图片和附件");
  if (data.priority !== undefined) addWarning(warnings, "优先级标记");
  if (Array.isArray(data.markers) && data.markers.length > 0) {
    addWarning(warnings, "其他图标标记");
  }
  if (data["xmind-detached"] || data["xmind-summary"]) {
    addWarning(warnings, "浮动节点或概要节点");
  }

  const taskPrefix = getTaskPrefix(data.progress);
  if (taskPrefix) text = taskPrefix + text;
  return text;
}

function appendRemark(lines: string[], level: number, note: unknown): void {
  if (typeof note !== "string" || !note.trim()) return;
  const indentation = "  ".repeat(level);
  const noteLines = note.replace(/\r\n|\r/g, "\n").split("\n");
  for (const line of noteLines) {
    lines.push(`${indentation}> ${line.trim()}`.trimEnd());
  }
}

function appendNode(
  lines: string[],
  node: XMindNode,
  level: number,
  nodeIndex: number,
  warnings: Set<string>,
): void {
  const data = node.data ?? {};
  const text = formatNodeText(data, `未命名主题 ${nodeIndex + 1}`, warnings);
  const marker = data.expandState === "collapse" ? "+" : "-";
  lines.push(`${"  ".repeat(level)}${marker} ${text}`);
  appendRemark(lines, level + 1, data.note);

  if (Array.isArray(node.children)) {
    node.children.forEach((child, index) => {
      appendNode(lines, child, level + 1, index, warnings);
    });
  }
}

function getSheetRoot(sheet: XMindDocument, index: number): XMindNode {
  if (!sheet.root || !sheet.root.data) {
    return { data: { text: `未命名主题 ${index + 1}` }, children: [] };
  }
  return sheet.root;
}

function getWorkbookTitle(fileName?: string): string {
  const title = fileName?.replace(/\.xmind$/i, "").trim();
  return title || "XMind 导入";
}

export function convertXMindSheetsToMarkdown(
  sheets: XMindDocument[],
  fileName?: string,
): XMindMarkdownResult {
  if (!Array.isArray(sheets) || sheets.length === 0) {
    throw new Error("XMind 文件不包含可导入的画布。");
  }

  const warnings = new Set<string>();
  const lines: string[] = [];

  if (sheets.length === 1) {
    appendNode(lines, getSheetRoot(sheets[0], 0), 0, 0, warnings);
  } else {
    lines.push(`- ${getWorkbookTitle(fileName)}`);
    sheets.forEach((sheet, sheetIndex) => {
      const sheetTitle = normalizeText(sheet.title, `画布 ${sheetIndex + 1}`);
      lines.push(`  - ${sheetTitle}`);
      appendNode(lines, getSheetRoot(sheet, sheetIndex), 2, 0, warnings);
    });
    addWarning(warnings, "多个画布已按画布名称分组");
  }

  return {
    markdown: `${lines.join("\n")}\n`,
    warnings: Array.from(warnings),
  };
}
