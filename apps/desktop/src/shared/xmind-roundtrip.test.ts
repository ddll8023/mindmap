import { describe, expect, it } from "vitest";
import { xmindBufferToKm } from "@ljheee/xmind-parser";
import { allPlugins, parseMarkdownMultiRoot, parseInlineMarkdown } from "@mindmap/core";
import { convertXMindSheetsToMarkdown } from "./xmind-markdown";
import { exportMindMapToXMind } from "./xmind-export";

function formulaTokens(text: string) {
  return parseInlineMarkdown(text, allPlugins).filter((token) => token.type === "latex-inline" || token.type === "latex-block");
}

describe("XMind formula conversion", () => {
  it("attaches formulas from notes without changing children or losing other remarks", () => {
    const result = convertXMindSheetsToMarkdown([{ root: {
      data: { text: "Root" }, children: [{ data: {
        text: String.raw`因为 时钟周期=\frac{1}{主频}，所以`,
        note: "前言\n$$\nCPU执行时间=\\frac{指令条数\\times CPI}{主频}\n$$\n后记",
      }, children: [{ data: { text: "Child" } }] }],
    } }]);
    const node = parseMarkdownMultiRoot(result.markdown, allPlugins)[0].children![0];
    expect(formulaTokens(node.text)).toHaveLength(1);
    expect(node.remark).toBe("前言\n后记");
    expect(node.multiLineContent).toEqual(["$$\nCPU执行时间=\\frac{指令条数\\times CPI}{主频}\n$$"]);
    expect(node.children?.map((child) => child.text)).toEqual(["Child"]);
    expect(result.warnings).toContain("已推断并补全部分公式标记，请核对");
  });

  it("preserves explicit math whitespace and moves multiline title blocks to follow-lines", () => {
    const sheets = [{ root: { data: { text: "Root" }, children: [
      { data: { text: String.raw`$\text{a  b}$` } },
      { data: { text: "公式标题\n$$\n\\text{a  b}\n$$" } },
    ] } }];
    const original = JSON.stringify(sheets);
    const result = convertXMindSheetsToMarkdown(sheets);
    const nodes = parseMarkdownMultiRoot(result.markdown, allPlugins)[0].children!;
    expect(nodes[0].text).toBe(String.raw`$\text{a  b}$`);
    expect(nodes[1].text).toBe("公式标题");
    expect(nodes[1].multiLineContent).toEqual(["$$\n\\text{a  b}\n$$"]);
    expect(JSON.stringify(sheets)).toBe(original);
  });

  it("keeps exported code from being inferred as math", async () => {
    const roots = parseMarkdownMultiRoot("Root\n- `x^2`", allPlugins);
    const sheets = await xmindBufferToKm(exportMindMapToXMind(roots));
    const result = convertXMindSheetsToMarkdown(sheets);
    expect(result.markdown).toContain("`x^2`");
    expect(result.warnings).toEqual([]);
  });

  it("keeps explicit formulas renderable beside a hyperlink", () => {
    const result = convertXMindSheetsToMarkdown([{ root: { data: {
      text: "$x^2$", hyperlink: "https://example.com",
    } } }]);
    const node = parseMarkdownMultiRoot(result.markdown, allPlugins)[0];
    expect(formulaTokens(node.text)).toHaveLength(1);
    expect(parseInlineMarkdown(node.text, allPlugins)).toContainEqual({ type: "link", text: "↗", url: "https://example.com" });
  });

  it("preserves inline/display math through two real ZIP export-import cycles", async () => {
    let roots = parseMarkdownMultiRoot("Root\n- **单位 $K=2^{10}$**\n  > 原备注\n  $$\n  \\frac{1}{2}\n  $$\n- $x^2$ [↗](https://example.com)", allPlugins);
    for (let i = 0; i < 2; i++) {
      const sheets = await xmindBufferToKm(exportMindMapToXMind(roots));
      const converted = convertXMindSheetsToMarkdown(sheets);
      expect(converted.warnings).not.toContain("已推断并补全部分公式标记，请核对");
      roots = parseMarkdownMultiRoot(converted.markdown, allPlugins);
      expect(roots[0].children).toHaveLength(2);
      expect(roots[0].children![0].text).toBe("单位 $K=2^{10}$");
      expect(roots[0].children![0].remark).toBe("原备注");
      expect(roots[0].children![0].multiLineContent?.[0]).toContain("\\frac{1}{2}");
      expect(roots[0].children![1].text).toBe("$x^2$ [↗](https://example.com)");
    }
  });
});
