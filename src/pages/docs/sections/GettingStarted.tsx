import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading, SubHeading } from "../components/SectionHeading";

export default function GettingStarted() {
  return (
    <>
          <SectionHeading id="getting-started">快速开始</SectionHeading>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            开放思维导图是一款零运行时依赖的 React 组件库，用于创建可交互的 SVG 思维导图。
            它支持 Markdown 输入（可接收 AI 流式输出）、扩展语法插件，并支持导出 SVG、PNG 和 Markdown。
          </p>

          <SubHeading>安装</SubHeading>
          <CodeBlock lang="bash">{`# 使用 npm
npm install @xiangfa/mindmap

# 使用 pnpm
pnpm add @xiangfa/mindmap

# 使用 yarn
yarn add @xiangfa/mindmap`}</CodeBlock>

          <p className="text-sm text-slate-500 dark:text-slate-500 mt-3 mb-6">
            如需渲染 LaTeX 数学公式，还需安装 KaTeX（可选）：
          </p>
          <CodeBlock lang="bash">npm install katex</CodeBlock>

          <SubHeading>快速上手</SubHeading>
          <CodeBlock lang="tsx">{`import { MindMap } from "@xiangfa/mindmap";
import "@xiangfa/mindmap/style.css";

const data = \`
我的思维导图
  - 第一个主题
    - 子主题 A
    - 子主题 B
  - 第二个主题
\`;

function App() {
  return <MindMap markdown={data} />;
}`}</CodeBlock>

          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-xl p-4 mt-4 mb-6">
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              <span className="font-bold text-primary">提示：</span>
              组件会填充父容器，请确保父容器具有明确的宽度和高度。
            </p>
          </div>

          <SubHeading>Markdown 输入</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            可以直接传入 Markdown 列表，非常适合接收 AI 流式响应：
          </p>
          <CodeBlock lang="tsx">{`const markdown = \`
机器学习
  - 监督学习
    - 分类
    - 回归
  - 无监督学习

应用领域
  - 自然语言处理
  - 计算机视觉
\`;

<MindMap markdown={markdown} />`}</CodeBlock>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 mb-6">
            在 Markdown 中使用空行分隔不同的根节点树。
          </p>

          <SubHeading>深色模式</SubHeading>
          <CodeBlock lang="tsx">{`<MindMap data={data} theme="auto" />  {/* 跟随系统（默认） */}
<MindMap data={data} theme="dark" />  {/* 始终使用深色 */}
<MindMap data={data} theme="light" /> {/* 始终使用浅色 */}`}</CodeBlock>

          <SubHeading>布局方向</SubHeading>
          <CodeBlock lang="tsx">{`<MindMap data={data} defaultDirection="both" />  {/* 左右平衡（默认） */}
<MindMap data={data} defaultDirection="right" /> {/* 所有子节点在右侧 */}
<MindMap data={data} defaultDirection="left" />  {/* 所有子节点在左侧 */}`}</CodeBlock>

          <SubHeading>只读模式</SubHeading>
          <CodeBlock lang="tsx">{`<MindMap data={data} readonly />`}</CodeBlock>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 mb-6">
            用户仍然可以平移、缩放和选择节点，但不能新建、编辑或删除节点。右键菜单会隐藏编辑操作。
          </p>

          <SubHeading>轻量查看器</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            对于关注打包体积的只读场景（数据面板、文档、嵌入页面），可以使用
            <code className="text-primary bg-primary/5 px-1.5 py-0.5 rounded text-sm">MindMapViewer</code>。
            这是一个独立组件，不包含编辑钩子、AI 输入、右键菜单和导出工具，打包体积约减少 48%。
          </p>
          <CodeBlock lang="tsx">{`// 通过子路径导入获得最小体积：
import { MindMapViewer } from "@xiangfa/mindmap/viewer";
import "@xiangfa/mindmap/style.css";

<MindMapViewer markdown={markdown} />

// 也可以从主入口导入（支持 Tree Shaking）：
import { MindMapViewer } from "@xiangfa/mindmap";`}</CodeBlock>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 mb-6">
            支持主题、插件、平移缩放、折叠切换、备注提示和键盘快捷键等渲染功能。
            不包含编辑、拖放排序、AI 生成、右键菜单、导出或文本编辑器。
          </p>

          <SubHeading>文本编辑模式</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            传入 <code className="text-primary bg-primary/5 px-1.5 py-0.5 rounded text-sm">MindMapTextEditor</code> 组件，
            即可启用带语法高亮的文本编辑模式。用户可以通过右下角的按钮，在可视化思维导图和 Markdown 文本编辑器之间切换。
          </p>
          <CodeBlock lang="tsx">{`import { MindMap, MindMapTextEditor } from "@xiangfa/mindmap";

<MindMap markdown={markdown} textEditor={MindMapTextEditor} />`}</CodeBlock>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 mb-6">
            文本编辑器是可选功能并支持 Tree Shaking，只有在导入并传入组件时才会被打包。
            如果不传入，文本模式切换按钮会隐藏。
          </p>

          <SubHeading>插件</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            默认启用全部 7 个内置插件，也可以按需选择要启用的插件：
          </p>
          <CodeBlock lang="tsx">{`import {
  MindMap,
  allPlugins,          // 全部 7 个插件
  frontMatterPlugin,   // YAML 前置元数据
  dottedLinePlugin,    // 虚线连接
  foldingPlugin,       // 可折叠节点
  multiLinePlugin,     // 多行内容
  tagsPlugin,          // 标签支持
  crossLinkPlugin,     // 节点间引用
  latexPlugin,         // LaTeX 数学公式（需要 KaTeX）
} from "@xiangfa/mindmap";

{/* 使用全部插件（默认） */}
<MindMap data={data} plugins={allPlugins} />

{/* 只使用指定插件 */}
<MindMap data={data} plugins={[foldingPlugin, tagsPlugin]} />

{/* 禁用全部插件 */}
<MindMap data={data} plugins={[]} />`}</CodeBlock>

          <SubHeading>Ref 接口</SubHeading>
          <CodeBlock lang="tsx">{`import { useRef } from "react";
import { MindMap, type MindMapRef } from "@xiangfa/mindmap";

function App() {
  const ref = useRef<MindMapRef>(null);

  const handleExportPNG = async () => {
    const blob = await ref.current!.exportToPNG();
    // ... 下载 Blob
  };

  return <MindMap ref={ref} data={data} />;
}`}</CodeBlock>

          <SubHeading>监听变更</SubHeading>
          <CodeBlock lang="tsx">{`<MindMap
  data={data}
  onDataChange={(newData) => {
    console.log("思维导图已更新：", newData);
  }}
/>`}</CodeBlock>

          <SubHeading>国际化</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            界面语言会自动从浏览器检测。组件内置中文（<code className="text-xs">zh-CN</code>）和英文（<code className="text-xs">en-US</code>）支持，未识别时回退到英文；需要固定中文时可传入 <code className="text-xs">locale="zh-CN"</code>。
          </p>
          <CodeBlock lang="tsx">{`{/* 自动检测（默认） */}
<MindMap data={data} />

{/* 强制指定语言 */}
<MindMap data={data} locale="zh-CN" />

{/* 覆盖指定文案 */}
<MindMap data={data} locale="zh-CN" messages={{ newNode: "新建" }} />

{/* 完全自定义语言 */}
<MindMap
  data={data}
  messages={{
    newNode: "新节点",
    zoomIn: "放大",
    zoomOut: "缩小",
    // ... 覆盖 MindMapMessages 中的任意文案
  }}
/>`}</CodeBlock>
    </>
  );
}
