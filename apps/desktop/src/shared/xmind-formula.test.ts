import { describe, expect, it } from "vitest";
import { recoverXMindTitleFormulas, splitXMindNote } from "./xmind-formula";

describe("legacy XMind formula recovery", () => {
  it.each([
    ["K=2^{10}", "$K=2^{10}$"],
    ["若 MAR 为 n 位，则最多可以表示 2^n 个不同地址", "若 MAR 为 n 位，则最多可以表示 $2^n$ 个不同地址"],
    [String.raw`因为 时钟周期=\frac{1}{主频}，所以`, String.raw`因为 $时钟周期=\frac{1}{主频}$，所以`],
    [String.raw`最终计算形式为 A+\overline{B}+1`, String.raw`最终计算形式为 $A+\overline{B}+1$`],
    [String.raw`范围为 0 \sim 2^n-1`, String.raw`范围为 $0 \sim 2^n-1$`],
    [String.raw`说明 A \ge B`, String.raw`说明 $A \ge B$`],
    [String.raw`一次传送 m\ bit 数据`, String.raw`一次传送 $m\ bit$ 数据`],
    ["最小整数为 -2^n", "最小整数为 $-2^n$"],
  ])("recovers %s without wrapping prose", (input, expected) => {
    expect(recoverXMindTitleFormulas(input)).toEqual({ text: expected, recovered: true });
    expect(recoverXMindTitleFormulas(expected)).toEqual({ text: expected, recovered: false });
  });

  it.each([
    "普通中文 n+1 位", "C++11", "A/B", "x-y", "版本 2_1", "user_id",
    String.raw`$x^2$ 和 $$\frac{1}{2}$$`, "`x^2`", "[x^2](https://example.com)",
    "https://example.com/x^2", String.raw`\unknown^2`, String.raw`\frac{1}{`,
    "$x^2", "`x^2", "x^2+", "v2.1^2",
  ])("leaves protected or ambiguous input unchanged: %s", (text) => {
    expect(recoverXMindTitleFormulas(text)).toEqual({ text, recovered: false });
  });

  it("extracts complete display blocks and preserves note order and formula whitespace", () => {
    expect(splitXMindNote("前言\r\n$$\r\n  \\frac{1}{2}\r\n\r\n$$\r\n后记\r\n$$x^2$$")).toEqual({
      remarks: ["前言", "后记"], formulas: ["$$\n  \\frac{1}{2}\n\n$$", "$$x^2$$"],
    });
  });

  it("does not extract fenced or incomplete formulas", () => {
    const note = "```tex\n$$\nx^2\n$$\n```\n$$\nunclosed";
    expect(splitXMindNote(note)).toEqual({ remarks: note.split("\n"), formulas: [] });
  });
});
