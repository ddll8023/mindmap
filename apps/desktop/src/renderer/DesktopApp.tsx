import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  FileUp,
  RotateCcw,
} from "lucide-react";
import {
  allPlugins,
  MindMap,
  MindMapTextEditor,
  stripInlineMarkdown,
} from "@mindmap/core";
import type { LayoutDirection, MindMapEvent, MindMapRef } from "@mindmap/core";
import type { DesktopCommand } from "../shared/types";
import { CustomSelect, type CustomSelectOption } from "./components/CustomSelect";

const DEFAULT_MARKDOWN = `思维导图
- 从 Markdown 开始
  - 编写大纲
  - 查看地图更新
- 梳理结构
  - 每级使用两个空格
  - 添加 **粗体** 或 #标签
- 导出结果
  - SVG 在任意尺寸都清晰
  - PNG 支持 2x、3x 和 4x`;

type ExportScale = 2 | 3 | 4;

const DIRECTION_OPTIONS: readonly CustomSelectOption<LayoutDirection>[] = [
  { value: "right", label: "向右展开" },
  { value: "left", label: "向左展开" },
  { value: "both", label: "两侧展开" },
];

const PNG_SCALE_OPTIONS: readonly CustomSelectOption<ExportScale>[] = [
  { value: 2, label: "2x" },
  { value: 3, label: "3x" },
  { value: 4, label: "4x" },
];

function getBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.(?:xmind|md|markdown|txt)$/i, "");
  return withoutExtension.trim() || "mindmap";
}

function getExportBaseName(ref: MindMapRef | null, fallback: string): string {
  const rootText = ref?.getData()[0]?.text;
  const plainRootText = rootText ? stripInlineMarkdown(rootText).trim() : "";
  return getBaseName(plainRootText || fallback);
}

function DesktopApp() {
  const mindMapRef = useRef<MindMapRef>(null);
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [fileName, setFileName] = useState("未命名.md");
  const [pngScale, setPngScale] = useState<ExportScale>(3);
  const [direction, setDirection] = useState<LayoutDirection>("right");
  const [status, setStatus] = useState("实时预览");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"import" | "svg" | "png" | null>(null);
  const [editorCollapsed, setEditorCollapsed] = useState(false);

  const baseName = useMemo(() => getBaseName(fileName), [fileName]);
  const editorToggleLabel = editorCollapsed ? "显示 Markdown 编辑器" : "隐藏 Markdown 编辑器";

  const handleDirectionChange = useCallback((nextDirection: LayoutDirection) => {
    setDirection(nextDirection);
    mindMapRef.current?.setDirection(nextDirection);
  }, []);

  const handleMindMapEvent = useCallback((event: MindMapEvent) => {
    if (event.type === "directionChange") {
      setDirection(event.direction);
    }
  }, []);

  const runAction = useCallback(
    async (action: () => Promise<void>, workingStatus: typeof busy) => {
      if (busy) return;
      setBusy(workingStatus);
      setError(null);
      try {
        await action();
      } catch (actionError) {
        const message = actionError instanceof Error ? actionError.message : "操作失败";
        setError(message);
        setStatus("需要处理");
      } finally {
        setBusy(null);
      }
    },
    [busy],
  );

  const handleImportXMind = useCallback(async () => {
    await runAction(async () => {
      const result = await window.desktopApi.openXMind();
      if (result.canceled || !result.content) return;
      setMarkdown(result.content);
      setFileName(result.fileName ?? "未命名.xmind");
      const warningSuffix = result.warnings?.length ? "（部分内容未转换）" : "";
      setStatus(`已导入 ${result.fileName ?? "XMind"}${warningSuffix}`);
      requestAnimationFrame(() => mindMapRef.current?.fitView());
    }, "import");
  }, [runAction]);

  const handleExportSvg = useCallback(async () => {
    await runAction(async () => {
      const svg = mindMapRef.current?.exportToSVG();
      if (!svg) throw new Error("思维导图尚未准备好。");
      const exportBaseName = getExportBaseName(mindMapRef.current, baseName);
      const result = await window.desktopApi.saveSvg(svg, `${exportBaseName}.svg`);
      if (result.canceled) return;
      setStatus(`SVG 已导出到 ${result.filePath ?? "目标文件"}`);
    }, "svg");
  }, [baseName, runAction]);

  const handleExportPng = useCallback(async () => {
    await runAction(async () => {
      const blob = await mindMapRef.current?.exportToPNG({ scale: pngScale });
      if (!blob) throw new Error("思维导图尚未准备好。");
      const exportBaseName = getExportBaseName(mindMapRef.current, baseName);
      const result = await window.desktopApi.savePng(
        await blob.arrayBuffer(),
        `${exportBaseName}.png`,
      );
      if (result.canceled) return;
      setStatus(`高清 PNG（${pngScale}x）已导出`);
    }, "png");
  }, [baseName, pngScale, runAction]);

  const handleReset = useCallback(() => {
    if (busy) return;
    setMarkdown(DEFAULT_MARKDOWN);
    setFileName("未命名.md");
    handleDirectionChange("right");
    setError(null);
    setStatus("实时预览");
  }, [busy, handleDirectionChange]);

  const handleToggleEditor = useCallback(() => {
    setEditorCollapsed((collapsed) => !collapsed);
    requestAnimationFrame(() => mindMapRef.current?.fitView());
  }, []);

  const handleCommand = useCallback(
    (command: DesktopCommand) => {
      if (command === "import-xmind") void handleImportXMind();
      if (command === "export-svg") void handleExportSvg();
      if (command === "export-png") void handleExportPng();
    },
    [handleExportPng, handleExportSvg, handleImportXMind],
  );

  useEffect(() => window.desktopApi.onCommand(handleCommand), [handleCommand]);

  return (
    <main className="desktop-shell">
      <header className="desktop-topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-node brand-node-center" />
            <span className="brand-node brand-node-top" />
            <span className="brand-node brand-node-bottom" />
            <span className="brand-link brand-link-top" />
            <span className="brand-link brand-link-bottom" />
          </div>
          <div>
            <h1>Markdown / XMind 转思维导图</h1>
          </div>
        </div>

        <div className="document-chip" title={fileName}>
          <span className="document-dot" />
          <span className="document-name">{fileName}</span>
        </div>

        <div className="desktop-actions">
          <CustomSelect
            className="direction-select"
            options={DIRECTION_OPTIONS}
            value={direction}
            onChange={handleDirectionChange}
            disabled={busy !== null}
            ariaLabel="思维导图结构"
            title="思维导图结构"
          />
          <button
            className="toolbar-button toolbar-button-primary"
            type="button"
            onClick={() => void handleImportXMind()}
            disabled={busy !== null}
          >
            <FileUp size={16} strokeWidth={2.2} />
            <span>导入 XMind</span>
          </button>
          <button
            className="toolbar-button"
            type="button"
            onClick={() => void handleExportSvg()}
            disabled={busy !== null}
          >
            <Download size={16} />
            <span>SVG</span>
          </button>
          <div className="png-action">
            <button
              className="toolbar-button"
              type="button"
              onClick={() => void handleExportPng()}
              disabled={busy !== null}
            >
              <FileImage size={16} />
              <span>PNG</span>
            </button>
            <CustomSelect
              className="scale-select"
              options={PNG_SCALE_OPTIONS}
              value={pngScale}
              onChange={setPngScale}
              disabled={busy !== null}
              ariaLabel="PNG 倍数"
              title="PNG 导出倍数"
            />
          </div>
        </div>
      </header>

      <section
        className={`workspace-grid panel-surface${editorCollapsed ? " is-editor-collapsed" : ""}`}
        aria-label="思维导图工作区"
      >
        <section
          id="markdown-editor-panel"
          className="editor-panel"
          aria-label="Markdown 编辑器"
          aria-hidden={editorCollapsed}
          hidden={editorCollapsed}
        >
          <div className="panel-heading">
            <h2>编写结构</h2>
            <div className="panel-heading-actions">
              <button
                className="workspace-toggle"
                type="button"
                onClick={handleToggleEditor}
                aria-expanded={!editorCollapsed}
                aria-controls="markdown-editor-panel"
                aria-label={editorToggleLabel}
                title={editorToggleLabel}
              >
                <ChevronLeft size={17} />
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={handleReset}
                disabled={busy !== null}
                title="重置示例"
                aria-label="重置示例"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
          <div className="editor-stage">
            <MindMapTextEditor
              value={markdown}
              onChange={setMarkdown}
              className="desktop-markdown-editor"
            />
          </div>
          <div className="editor-footer">
            <span>两个空格 = 一级</span>
            <span>{markdown.length.toLocaleString()} 个字符</span>
          </div>
        </section>

        <section className="map-panel">
          <div className="map-heading">
            <div className="map-heading-title">
              {editorCollapsed && (
                <button
                  className="workspace-toggle"
                  type="button"
                  onClick={handleToggleEditor}
                  aria-expanded={false}
                  aria-controls="markdown-editor-panel"
                  aria-label={editorToggleLabel}
                  title={editorToggleLabel}
                >
                  <ChevronRight size={17} />
                </button>
              )}
              <h2>实时思维导图</h2>
            </div>
            <div className="map-heading-actions">
              <div className="map-status">
                <span className="live-pulse" />
                {status}
              </div>
            </div>
          </div>
          <div className="map-stage">
            <div className="map-grid-glow" aria-hidden="true" />
            <MindMap
              ref={mindMapRef}
              markdown={markdown}
              plugins={allPlugins}
              defaultDirection="right"
              onEvent={handleMindMapEvent}
              readonly
              theme="auto"
              locale="zh-CN"
              toolbar={{ zoom: true, history: false, tags: true }}
            />
          </div>
        </section>
      </section>

      {error && (
        <footer className="desktop-statusbar">
          <span className="statusbar-error" role="alert">{error}</span>
        </footer>
      )}
    </main>
  );
}

export default DesktopApp;
