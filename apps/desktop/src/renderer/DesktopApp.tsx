import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  FileImage,
  FileUp,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import {
  allPlugins,
  MindMap,
  MindMapTextEditor,
} from "@mindmap/core";
import type { LayoutDirection, MindMapEvent, MindMapRef } from "@mindmap/core";
import type { DesktopCommand } from "../shared/types";

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

function getBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.(?:md|markdown|txt)$/i, "");
  return withoutExtension.trim() || "mindmap";
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

  const baseName = useMemo(() => getBaseName(fileName), [fileName]);

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

  const handleImport = useCallback(async () => {
    await runAction(async () => {
      const result = await window.desktopApi.openMarkdown();
      if (result.canceled || !result.content) return;
      setMarkdown(result.content);
      setFileName(result.fileName ?? "未命名.md");
      setStatus(`已导入 ${result.fileName ?? "Markdown"}`);
    }, "import");
  }, [runAction]);

  const handleExportSvg = useCallback(async () => {
    await runAction(async () => {
      const svg = mindMapRef.current?.exportToSVG();
      if (!svg) throw new Error("思维导图尚未准备好。");
      const result = await window.desktopApi.saveSvg(svg, `${baseName}.svg`);
      if (result.canceled) return;
      setStatus(`SVG 已导出到 ${result.filePath ?? "目标文件"}`);
    }, "svg");
  }, [baseName, runAction]);

  const handleExportPng = useCallback(async () => {
    await runAction(async () => {
      const blob = await mindMapRef.current?.exportToPNG({ scale: pngScale });
      if (!blob) throw new Error("思维导图尚未准备好。");
      const result = await window.desktopApi.savePng(
        await blob.arrayBuffer(),
        `${baseName}-${pngScale}x.png`,
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

  const handleCommand = useCallback(
    (command: DesktopCommand) => {
      if (command === "import-markdown") void handleImport();
      if (command === "export-svg") void handleExportSvg();
      if (command === "export-png") void handleExportPng();
    },
    [handleExportPng, handleExportSvg, handleImport],
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
            <div className="brand-kicker">开放思维导图</div>
            <h1>Markdown 转思维导图</h1>
          </div>
        </div>

        <div className="document-chip" title={fileName}>
          <span className="document-dot" />
          <span className="document-name">{fileName}</span>
        </div>

        <div className="desktop-actions">
          <label className="direction-select" title="思维导图结构">
            <span className="sr-only">思维导图结构</span>
            <select
              value={direction}
              onChange={(event) => handleDirectionChange(event.target.value as LayoutDirection)}
              disabled={busy !== null}
              aria-label="思维导图结构"
            >
              <option value="right">向右展开</option>
              <option value="left">向左展开</option>
              <option value="both">两侧展开</option>
            </select>
          </label>
          <button
            className="toolbar-button toolbar-button-primary"
            type="button"
            onClick={() => void handleImport()}
            disabled={busy !== null}
          >
            <FileUp size={16} strokeWidth={2.2} />
            <span>导入 Markdown</span>
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
            <label className="scale-select" title="PNG 导出倍数">
              <span className="sr-only">PNG 倍数</span>
              <select
                value={pngScale}
                onChange={(event) => setPngScale(Number(event.target.value) as ExportScale)}
                disabled={busy !== null}
              >
                <option value={2}>2x</option>
                <option value={3}>3x</option>
                <option value={4}>4x</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      <section className="workspace-grid" aria-label="思维导图工作区">
        <section className="editor-panel panel-surface">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">源文本</span>
              <h2>编写结构</h2>
            </div>
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

        <section className="map-panel panel-surface">
          <div className="map-heading">
            <div>
              <span className="panel-eyebrow">可视化结果</span>
              <h2>实时思维导图</h2>
            </div>
            <div className="map-status">
              <span className="live-pulse" />
              {status}
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
            <div className="map-hint">
              <Maximize2 size={13} />
              拖动平移 · 滚轮缩放
            </div>
          </div>
        </section>
      </section>

      <footer className="desktop-statusbar">
        <span className="statusbar-label">本地工作区</span>
        <span className="statusbar-copy">你的 Markdown 会保存在这台电脑上。</span>
        {error && <span className="statusbar-error" role="alert">{error}</span>}
      </footer>
    </main>
  );
}

export default DesktopApp;
