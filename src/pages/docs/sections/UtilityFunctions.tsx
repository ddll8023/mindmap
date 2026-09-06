import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading } from "../components/SectionHeading";

export default function UtilityFunctions() {
  return (
    <>
          <SectionHeading id="utility-functions">
            工具函数
          </SectionHeading>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            以下函数可供高级场景使用：
          </p>

          <CodeBlock lang="typescript">{`import {
  // Markdown 解析
  parseMarkdownList,            // Markdown 字符串 → 单个 MindMapData
  toMarkdownList,               // 单个 MindMapData → Markdown 字符串
  parseMarkdownMultiRoot,       // Markdown 字符串 → MindMapData[]
  toMarkdownMultiRoot,          // MindMapData[] → Markdown 字符串
  parseMarkdownWithFrontMatter, // Markdown 字符串 → MindMapData[]（带插件）

  // Markdown 行内格式
  parseInlineMarkdown,          // 文本 → 行内标记
  stripInlineMarkdown,          // 从文本中移除 Markdown 格式

  // 导出
  exportMindMapToSVG,          // 数据/Markdown → SVG 字符串
  buildExportSVG,               // 以编程方式生成 SVG
  exportToPNG,                  // SVG 字符串 → PNG Blob

  // 国际化
  resolveMessages,              // 构建完整的 MindMapMessages 对象
  detectLocale,                 // 检测浏览器语言

  // 插件
  allPlugins,                   // 全部 7 个内置插件
  frontMatterPlugin,
  dottedLinePlugin,
  foldingPlugin,
  multiLinePlugin,
  tagsPlugin,
  crossLinkPlugin,
  latexPlugin,

  // 轻量查看器
  MindMapViewer,                  // 只读查看器（也可通过 @xiangfa/mindmap/viewer 导入）

  // 高级类型
  type ExportMindMapToSVGOptions,
  type LayoutNode,
  type Edge,
  type MindMapAIRequestPayload,
  type MindMapAIContentPart,
} from "@xiangfa/mindmap";`}</CodeBlock>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            使用 <code>exportMindMapToSVG</code> 可以在不挂载 React 组件的情况下导出思维导图。
            默认导出完整树；传入 <code>readonly: true</code> 可导出只读视图中实际可见的折叠树。
          </p>

          <CodeBlock lang="typescript">{`import { exportMindMapToSVG, allPlugins } from "@xiangfa/mindmap";

const svg = exportMindMapToSVG({
  markdown,
  plugins: allPlugins,
});`}</CodeBlock>
    </>
  );
}
