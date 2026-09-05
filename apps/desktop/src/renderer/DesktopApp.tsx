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
import type { MindMapRef } from "@mindmap/core";
import type { DesktopCommand } from "../shared/types";

const DEFAULT_MARKDOWN = `Open MindMap
- Start with Markdown
  - Write an outline
  - Watch the map update
- Shape the structure
  - Use two spaces per level
  - Add **bold** or #tags
- Export the result
  - SVG stays sharp at any size
  - PNG supports 2x, 3x, and 4x`;

type ExportScale = 2 | 3 | 4;

function getBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.(?:md|markdown|txt)$/i, "");
  return withoutExtension.trim() || "mindmap";
}

function DesktopApp() {
  const mindMapRef = useRef<MindMapRef>(null);
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [fileName, setFileName] = useState("Untitled.md");
  const [pngScale, setPngScale] = useState<ExportScale>(3);
  const [status, setStatus] = useState("Live preview");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"import" | "svg" | "png" | null>(null);

  const baseName = useMemo(() => getBaseName(fileName), [fileName]);

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
      setFileName(result.fileName ?? "Untitled.md");
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
    setFileName("Untitled.md");
    setError(null);
    setStatus("Live preview");
  }, [busy]);

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
            <div className="brand-kicker">OPEN MINDMAP</div>
            <h1>Markdown to map</h1>
          </div>
        </div>

        <div className="document-chip" title={fileName}>
          <span className="document-dot" />
          <span className="document-name">{fileName}</span>
        </div>

        <div className="desktop-actions">
          <button
            className="toolbar-button toolbar-button-primary"
            type="button"
            onClick={() => void handleImport()}
            disabled={busy !== null}
          >
            <FileUp size={16} strokeWidth={2.2} />
            <span>Import Markdown</span>
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
            <label className="scale-select" title="PNG export scale">
              <span className="sr-only">PNG scale</span>
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

      <section className="workspace-grid" aria-label="Mind map workspace">
        <section className="editor-panel panel-surface">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">SOURCE</span>
              <h2>Write the structure</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={handleReset}
              disabled={busy !== null}
              title="Reset example"
              aria-label="Reset example"
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
            <span>Two spaces = one level</span>
            <span>{markdown.length.toLocaleString()} chars</span>
          </div>
        </section>

        <section className="map-panel panel-surface">
          <div className="map-heading">
            <div>
              <span className="panel-eyebrow">VISUAL OUTPUT</span>
              <h2>Live mind map</h2>
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
              readonly
              theme="auto"
              toolbar={{ zoom: true, history: false, search: true, tags: true }}
            />
            <div className="map-hint">
              <Maximize2 size={13} />
              Drag to pan · Scroll to zoom
            </div>
          </div>
        </section>
      </section>

      <footer className="desktop-statusbar">
        <span className="statusbar-label">LOCAL WORKSPACE</span>
        <span className="statusbar-copy">Your Markdown stays on this computer.</span>
        {error && <span className="statusbar-error" role="alert">{error}</span>}
      </footer>
    </main>
  );
}

export default DesktopApp;
