import {
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Terminal,
  Check,
  Copy,
  CircleCheck,
  Bot,
  Image,
  Smartphone,
  Moon,
  Palette,
  Keyboard,
  Package,
  MousePointerClick,
  Languages,
  Download,
  NotebookPen,
  Gauge,
  Settings,
  Spline,
  FoldVertical,
  NotebookText,
  Tag,
  Workflow,
  SquareFunction,
} from "lucide-react";
import MindMapPlayground from "../components/MindMapPlayground";
import { version } from "../../package.json";
import "../App.css";

// ---------------------------------------------------------------------------
// LandingPage Component
// ---------------------------------------------------------------------------

function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [copied, setCopied] = useState(false);

  // ---- Navbar scroll handler ----
  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---- Scroll-triggered animations ----
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    document
      .querySelectorAll("[data-animate]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ---- Copy install command ----
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("npm install @xiangfa/mindmap");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <div className="min-h-screen">
      {/* ================================================================= */}
      {/* Navbar                                                            */}
      {/* ================================================================= */}
      <nav
        className={`fixed top-0 w-full z-50 glass-effect border-b transition-all duration-300 ${
          navScrolled
            ? "bg-white/95 dark:bg-slate-900/95 border-surface-container-high dark:border-slate-700 shadow-sm"
            : "bg-white/80 dark:bg-slate-900/80 border-surface-container-high/50 dark:border-slate-700/50"
        }`}
      >
        <div className="flex justify-between items-center px-4 md:px-6 py-3 max-w-7xl mx-auto">
          <div className="flex">
            <a
              href="#/"
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 no-underline"
            >
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white">
              <img src="/logo.png" className="scale-150" alt="开放思维导图标志" />
              </span>
              <span className="hidden sm:block">开放思维导图</span>
            </a>
            <div className="flex ml-10 items-center gap-8 text-[13px] font-medium">
              <a className="text-slate-900 dark:text-white" href="#features">
                首页
              </a>
              <a
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                href="#/docs"
              >
                文档
              </a>
              <a
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                href="https://github.com/u14app/mindmap"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#/live"
              className="bg-primary text-white px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all hover:bg-primary/90 hover:scale-105"
            >
              开始使用
            </a>
          </div>
        </div>
      </nav>

      {/* ================================================================= */}
      {/* Main Content                                                      */}
      {/* ================================================================= */}
      <main className="hero-gradient overflow-hidden">
        {/* --------------------------------------------------------------- */}
        {/* Hero Section                                                     */}
        {/* --------------------------------------------------------------- */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-16 text-center">
          <div className="hero-animate inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[11px] font-bold tracking-wider uppercase mb-6 md:mb-8">
            <Terminal size={14} />
            {`v${version}`} &middot; 开源项目
          </div>

          <h1 className="hero-animate text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 md:mb-8 text-gradient leading-tight">
            面向 AI 的
            <br />
            React 思维导图。
          </h1>

          <p className="hero-animate-delayed text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8 md:mb-12 font-medium">
            用自然语言将复杂的思维模型转化为结构化的可视化系统。开源、可扩展，适合现代 Web 应用。
          </p>

          {/* npm install snippet */}
          <div className="hero-animate-delayed max-w-md mx-auto mb-10 md:mb-16 relative">
            <div className="bg-slate-900 rounded-xl p-3 text-left font-mono text-xs md:text-sm code-glow border border-slate-800 flex items-center justify-between group">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <span className="text-primary-fixed-dim shrink-0">$</span>
                <span className="text-slate-300 truncate">
                  npm install{" "}
                  <span className="text-white">@xiangfa/mindmap</span>
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="text-slate-500 hover:text-white transition-colors shrink-0 ml-2 p-1"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="hero-animate-delayed-2 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <a
              href="#demo"
              className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 md:py-3.5 rounded-full text-sm md:text-base font-semibold transition-all hover:bg-slate-800 dark:hover:bg-slate-100 hover:scale-[1.02] text-center"
            >
              开始构建
            </a>
            <a
              href="#demo"
              className="w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-8 py-3 md:py-3.5 rounded-full text-sm md:text-base font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-[1.02] text-center"
            >
              查看演示
            </a>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Interactive Experience Section                                   */}
        {/* --------------------------------------------------------------- */}
        <section
          id="demo"
          className="max-w-7xl mx-auto px-4 md:px-6 mb-20 md:mb-40"
          data-animate
        >
          <MindMapPlayground />
        </section>

        {/* --------------------------------------------------------------- */}
        {/* AI Streaming Feature Section                                     */}
        {/* --------------------------------------------------------------- */}
        <section
          id="features"
          className="max-w-7xl mx-auto px-4 md:px-6 mb-20 md:mb-40"
          data-animate
        >
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 md:p-16 border border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 overflow-hidden relative">
            <div className="flex-1 z-10">
              <span className="text-primary font-bold text-[11px] uppercase tracking-widest mb-4 block">
                核心引擎
              </span>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 md:mb-6">
                实时 AI 流式生成。
              </h2>
              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-6 md:mb-8">
                体验低延迟的可视化效果。LLM 生成内容时，开放思维导图会实时构建布局，并通过高效的纯 SVG 处理数千个节点。
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <CircleCheck className="text-primary" size={20} />
                  10 毫秒以内完成布局重算
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <CircleCheck className="text-primary" size={20} />
                  原生支持流式输出
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <CircleCheck className="text-primary" size={20} />
                  兼容 OpenAI 的 API
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <CircleCheck className="text-primary" size={20} />
                  内置 AI 输入和文件附件
                </li>
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full aspect-square flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse" />
                <div className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-primary/10">
                  <div className="space-y-3">
                    <div className="h-2 w-48 bg-primary/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary w-2/3"
                        style={{
                          animation: "shimmer 2s infinite",
                        }}
                      />
                    </div>
                    <div className="h-2 w-32 bg-primary/10 rounded-full" />
                    <div className="h-2 w-40 bg-primary/10 rounded-full" />
                  </div>
                </div>
                <div className="absolute top-10 right-10 w-4 h-4 rounded-full bg-primary/20 animate-float" />
                <div className="absolute bottom-20 left-0 w-6 h-6 rounded-full bg-primary/10 animate-float-delayed" />
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Feature Highlights Grid                                          */}
        {/* --------------------------------------------------------------- */}
        <section
          id="highlights"
          className="max-w-7xl mx-auto px-4 md:px-6 mb-20 md:mb-40"
          data-animate
        >
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              你需要的一切。
            </h2>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              完整的思维导图工具包——零运行时依赖、纯 SVG、键盘优先，并适配移动端。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: Bot,
                title: "AI 生成",
                desc: "内置 AI 输入栏，支持兼容 OpenAI 的流式输出和文件附件。",
              },
              {
                icon: Image,
                title: "纯 SVG 渲染",
                desc: "不使用 Canvas 或外部布局引擎，在任意缩放级别都保持清晰。",
              },
              {
                icon: Smartphone,
                title: "iOS 风格界面",
                desc: "磨砂玻璃控件、圆角设计和流畅动画。",
              },
              {
                icon: Moon,
                title: "深色模式",
                desc: "自动跟随系统明暗偏好，也可手动指定浅色或深色主题。",
              },
              {
                icon: Palette,
                title: "CSS 可定制",
                desc: "提供 30 多个 CSS 自定义属性和语义化类名，可直接覆盖颜色、字体和分支样式。",
              },
              {
                icon: Keyboard,
                title: "键盘优先",
                desc: "Enter 新建、Delete 删除、Command+C/V 复制粘贴，以及更多快捷操作。",
              },
              {
                icon: Package,
                title: "零运行时依赖",
                desc: "仅将 React 作为同级依赖，体积小、性能高。",
              },
              {
                icon: MousePointerClick,
                title: "移动端与触控",
                desc: "支持单指平移和双指缩放，在各种设备上都能使用。",
              },
              {
                icon: Languages,
                title: "国际化",
                desc: "自动识别浏览器语言，内置中文和英文界面。",
              },
              {
                icon: Download,
                title: "随处导出",
                desc: "开箱即用地导出 SVG、高清 PNG 和 Markdown。",
              },
              {
                icon: NotebookPen,
                title: "文本编辑器",
                desc: "可选的 Markdown 语法高亮编辑器，可在可视化模式和文本模式之间切换。",
              },
              {
                icon: Gauge,
                title: "轻量查看器",
                desc: "只读 MindMapViewer 组件，打包体积约减少 48%，适合嵌入页面和数据面板。",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-shadow duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
                  <f.icon className="text-primary" size={20} />
                </div>
                <div className="font-bold text-slate-900 dark:text-white mb-1">{f.title}</div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Plugin Showcase                                                  */}
        {/* --------------------------------------------------------------- */}
        <section
          id="plugins"
          className="max-w-7xl mx-auto px-4 md:px-6 mb-20 md:mb-40"
          data-animate
        >
          <div className="text-center mb-10 md:mb-16">
            <span className="text-primary font-bold text-[11px] uppercase tracking-widest mb-4 block">
              可扩展
            </span>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              使用插件扩展功能。
            </h2>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              内置 7 个插件扩展核心语法，可自由组合，也可以创建自己的插件。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Settings,
                name: "前置元数据",
                syntax: "---\ndirection: right\ntheme: dark\n---",
                desc: "通过 YAML 文件头设置方向和主题",
              },
              {
                icon: Spline,
                name: "虚线",
                syntax: "-. 虚线子节点",
                desc: "为弱关联关系使用虚线连接",
              },
              {
                icon: FoldVertical,
                name: "折叠",
                syntax: "+ 折叠分组\n  - 隐藏子节点",
                desc: "支持折叠和展开节点分组",
              },
              {
                icon: NotebookText,
                name: "多行内容",
                syntax: "- 标题\n  | 详细内容一\n  | 详细内容二",
                desc: "在单个节点中展示多行内容",
              },
              {
                icon: Tag,
                name: "标签",
                syntax: "- React #前端 #组件",
                desc: "使用带颜色的标签进行可视化分类",
              },
              {
                icon: Workflow,
                name: "交叉链接",
                syntax: '- 节点 {#a}\n  -> {#b} "引用"',
                desc: "在任意两个节点之间绘制连接",
              },
              {
                icon: SquareFunction,
                name: "LaTeX 数学公式",
                syntax: "- 行内：$E = mc^2$\n- 块级：$$\\sum x_i$$",
                desc: "数学公式以 SVG 路径渲染，支持高清 PNG 导出",
              },
            ].map((p) => (
              <div
                key={p.name}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 hover:bg-white dark:hover:bg-slate-800 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <p.icon className="text-primary" size={18} />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{p.desc}</p>
                <pre className="text-[12px] font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                  {p.syntax}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Rich Markdown Syntax                                             */}
        {/* --------------------------------------------------------------- */}
        <section
          id="syntax"
          className="max-w-7xl mx-auto px-4 md:px-6 mb-20 md:mb-40"
          data-animate
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 md:mb-6">
                编写 Markdown。
                <br />
                查看思维导图。
              </h2>
              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-6 md:mb-8">
                使用熟悉的 Markdown 语法描述想法。开放思维导图会实时解析内容，并渲染出美观、可交互的可视化结果。
              </p>
              <ul className="space-y-4">
                {[
                  "行内格式——粗体、斜体、代码、删除线和高亮",
                  "任务复选框——待办、已完成和进行中状态",
                  "备注——为任意节点附加多行说明",
                  "多根节点——在同一画布上展示多个独立树",
                  "拖放——通过拖动节点调整同级顺序",
                  "文本编辑模式——在可视化编辑与 Markdown 编辑之间切换",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    <Check className="text-primary mt-0.5 shrink-0" size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 rounded-2xl p-1 overflow-hidden shadow-2xl">
              <div className="bg-slate-800/50 p-6 font-mono text-[13px] leading-relaxed text-slate-300">
                <div className="flex gap-2 mb-6 opacity-30">
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>
                <pre
                  className="whitespace-pre"
                  dangerouslySetInnerHTML={{
                    __html: [
                      `<span class="text-white font-bold">项目路线图</span>`,
                      `<span class="text-slate-500">-</span> <span class="text-orange-300">**阶段一**</span> — 基础`,
                      `  <span class="text-slate-500">-</span> <span class="text-green-400">[x]</span> 初始化仓库`,
                      `  <span class="text-slate-500">-</span> <span class="text-green-400">[x]</span> 核心架构`,
                      `  <span class="text-slate-500">-</span> <span class="text-amber-400">[-]</span> API 设计`,
                      `    <span class="text-primary/60">&gt; REST 接口已定义</span>`,
                      `    <span class="text-primary/60">&gt; GraphQL 结构开发中</span>`,
                      `<span class="text-slate-500">-</span> <span class="text-orange-300">*阶段二*</span> — 功能`,
                      `  <span class="text-slate-500">-</span> <span class="text-slate-400">[ ]</span> 用户认证`,
                      `  <span class="text-slate-500">-</span> <span class="text-slate-400">[ ]</span> <span class="text-rose-400">\`WebSocket\`</span> 支持`,
                      `  <span class="text-slate-500">-</span> <span class="text-slate-400">[ ]</span> <span class="text-amber-400">==数据面板==</span>`,
                      `<span class="text-slate-500">-</span> 资源`,
                      `  <span class="text-slate-500">-</span> <span class="text-blue-400">[文档](https://docs.example.com)</span>`,
                      `  <span class="text-slate-500">-</span> <span class="text-slate-400 line-through">~~已弃用的知识库~~</span>`,
                    ].join("\n"),
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* React Integration Section                                        */}
        {/* --------------------------------------------------------------- */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-6 mb-20 md:mb-40"
          data-animate
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 md:mb-6">
                为 React 生态而生。
              </h2>
              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-6 md:mb-8">
                只需一个组件，就能将强大的思维导图引擎接入应用。支持完全受控、类型安全，并可通过丰富的插件系统扩展。
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white mb-1">
                    TypeScript 原生支持
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    为每个节点和连接属性提供完善的类型定义。
                  </p>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white mb-1">
                    插件系统
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    通过标签、交叉链接、LaTeX、折叠等功能扩展语法。
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-1 overflow-hidden shadow-2xl">
              <div className="bg-slate-800/50 p-6 font-mono text-sm leading-relaxed text-slate-300">
                <div className="flex gap-2 mb-6 opacity-30">
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>
                <pre
                  className="whitespace-pre"
                  dangerouslySetInnerHTML={{
                    __html: [
                      `<span class="text-purple-400">import</span> { MindMap } <span class="text-purple-400">from</span> <span class="text-green-400">"@xiangfa/mindmap"</span>;`,
                      `<span class="text-purple-400">import</span> <span class="text-green-400">"@xiangfa/mindmap/style.css"</span>;`,
                      ``,
                      `<span class="text-purple-400">export default function</span> <span class="text-yellow-400">App</span>() {`,
                      `  <span class="text-purple-400">return</span> (`,
                      `    &lt;<span class="text-blue-400">MindMap</span>`,
                      `      <span class="text-orange-400">markdown</span>={content}`,
                      `      <span class="text-orange-400">theme</span>=<span class="text-green-400">"light"</span>`,
                      `      <span class="text-orange-400">onDataChange</span>={(data) =&gt; <span class="text-blue-400">save</span>(data)}`,
                      `    /&gt;`,
                      `  );`,
                      `}`,
                    ].join("\n"),
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Final CTA Section                                                */}
        {/* --------------------------------------------------------------- */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-6 mb-20 md:mb-40"
          data-animate
        >
          <div className="bg-slate-900 rounded-2xl p-8 md:p-20 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,122,255,0.15)_0%,transparent_70%)]" />
            <h2 className="text-3xl text-white md:text-6xl font-bold mb-6 md:mb-8 relative z-10 tracking-tight">
              让思考更清晰。
            </h2>
            <p className="text-slate-400 text-base md:text-xl max-w-xl mx-auto mb-8 md:mb-12 relative z-10 leading-relaxed font-medium">
              面向 React 生态的开源可视化思维工具。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 relative z-10">
              <a
                href="#demo"
                className="w-full sm:w-auto bg-primary text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full text-base md:text-lg font-bold transition-all hover:bg-primary/90 hover:scale-[1.02] text-center"
              >
                免费开始使用
              </a>
              <a
                href="#/docs"
                className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full text-base md:text-lg font-bold transition-all hover:bg-white/10 text-center"
              >
                查看使用文档
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================================= */}
      {/* Footer                                                            */}
      {/* ================================================================= */}
      <footer className="w-full py-8 px-4 md:px-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                开放思维导图
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                开源共建。
                <br />
                为现代 Web 而生。
              </p>
            </div>
            <div>
              <h5 className="font-bold text-[11px] mb-6 uppercase tracking-widest text-slate-400">
                开发资源
              </h5>
              <ul className="space-y-4 text-[13px] font-semibold text-slate-600 dark:text-slate-400">
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#/docs"
                  >
                    使用文档
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#/docs#api-reference"
                  >
                    API 参考
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#/docs#getting-started"
                  >
                    React 组件包
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#/docs#extended-syntax"
                  >
                    插件指南
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              &copy; 2026 开放思维导图。开源项目。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
