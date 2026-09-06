import { describe, expect, it } from "vitest";
import { convertXMindSheetsToMarkdown } from "./xmind-markdown";
import type { XMindDocument } from "@ljheee/xmind-parser";

describe("convertXMindSheetsToMarkdown", () => {
  it("converts a sheet tree and supported topic metadata", () => {
    const sheets: XMindDocument[] = [
      {
        title: "项目规划",
        root: {
          data: {
            text: "项目规划",
            note: "目标\n范围",
            progress: 5,
          },
          children: [
            {
              data: {
                text: "产品方案",
                hyperlink: "https://example.com/product)",
                label: ["产品", "release-1"],
              },
            },
          ],
        },
      },
    ];

    const result = convertXMindSheetsToMarkdown(sheets);

    expect(result.markdown).toBe(
      "- [-] 项目规划\n" +
        "  > 目标\n" +
        "  > 范围\n" +
        "  - [产品方案](https://example.com/product%29) #release-1\n",
    );
    expect(result.warnings).toEqual(["部分标签"]);
  });

  it("groups multiple sheets under the workbook title", () => {
    const sheets: XMindDocument[] = [
      { title: "产品", root: { data: { text: "目标" } } },
      { title: "技术", root: { data: { text: "架构" } } },
    ];

    const result = convertXMindSheetsToMarkdown(sheets, "年度规划.xmind");

    expect(result.markdown).toBe(
      "- 年度规划\n" +
        "  - 产品\n" +
        "    - 目标\n" +
        "  - 技术\n" +
        "    - 架构\n",
    );
    expect(result.warnings).toEqual(["多个画布已按画布名称分组"]);
  });

  it("reports metadata that cannot be represented by Markdown", () => {
    const result = convertXMindSheetsToMarkdown([
      {
        root: {
          data: {
            text: "Root",
            hyperlink: "xmind:#other-topic",
            image: "data:image/png;base64,abc",
            priority: 1,
            markers: ["flag-red"],
            "xmind-detached": true,
          },
        },
      },
    ]);

    expect(result.markdown).toBe("- Root\n");
    expect(result.warnings).toEqual([
      "内部链接或附件链接",
      "图片和附件",
      "优先级标记",
      "其他图标标记",
      "浮动节点或概要节点",
    ]);
  });
});
