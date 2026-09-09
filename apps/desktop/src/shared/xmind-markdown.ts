import type { XMindDocument, XMindNode, XMindNodeData } from "@ljheee/xmind-parser";
import { recoverXMindTitleFormulas, splitXMindNote } from "./xmind-formula";

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
  if (typeof data.text !== "string") return fallback;
  // Do not normalize whitespace inside an explicitly delimited formula.
  return data.text.split(/(\$\$[\s\S]*?\$\$|\$[^$\r\n]+\$)/g)
    .map((part, index) => index % 2 ? part : part.replace(/\s+/g, " "))
    .join("").trim() || fallback;
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
  const restored = recoverXMindTitleFormulas(getTopicText(data, fallback));
  let text = restored.text;
  if (restored.recovered) addWarning(warnings, "已推断并补全部分公式标记，请核对");
  const hyperlink = typeof data.hyperlink === "string" ? data.hyperlink.trim() : "";

  if (hyperlink) {
    if (EXTERNAL_LINK_RE.test(hyperlink)) {
      // Link labels are not recursively parsed by the core Markdown renderer.
      text = text.includes("$")
        ? `${text} ${formatLink("↗", hyperlink)}`
        : formatLink(text, hyperlink);
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
  const { remarks, formulas } = splitXMindNote(note);
  // Core parsing consumes remarks before formula follow-lines.
  if (remarks.some((line) => line.trim())) {
    for (const line of remarks) lines.push(`${indentation}> ${line}`.trimEnd());
  }
  for (const formula of formulas) {
    const block = formula.includes("\n") ? formula : `$$\n${formula.slice(2, -2)}\n$$`;
    for (const line of block.split("\n")) lines.push(`${indentation}${line}`);
  }
}

function appendNode(
  lines: string[],
  node: XMindNode,
  level: number,
  nodeIndex: number,
  warnings: Set<string>,
): void {
  const data = { ...(node.data ?? {}) };
  // Multiline display blocks cannot live inside the outline's title line.
  if (typeof data.text === "string" && /[\r\n]/.test(data.text)) {
    const titleParts = splitXMindNote(data.text);
    if (titleParts.formulas.length) {
      data.text = titleParts.remarks.join(" ").trim() || "公式";
      data.note = [typeof data.note === "string" ? data.note : "", ...titleParts.formulas].filter(Boolean).join("\n");
    }
  }
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
