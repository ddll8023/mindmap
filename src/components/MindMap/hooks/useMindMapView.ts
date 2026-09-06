import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { getFormulaRevision, initFormulaEngine, subscribeFormulaEngine } from '../utils/formula';
import { parseInlineMarkdown } from '../utils/inline-markdown';
import type { LayoutDirection, MindMapData } from "../types";
import type { MindMapPlugin } from "../plugins/types";
import { layoutMultiRoot } from "../utils/layout";
import { analyzeMindMapTagFilter } from "../utils/tag-filter";
import { usePanZoom } from "./usePanZoom";
import { useNewNodeAnimation } from "./useNewNodeAnimation";

interface RemarkTooltip {
  nodeId: string;
  text: string;
  x: number;
  y: number;
}

export interface UseMindMapViewParams {
  svgRef: React.RefObject<SVGSVGElement | null>;
  mapData: MindMapData[];
  direction: LayoutDirection;
  colorMap: Record<string, string>;
  setColorMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  foldOverrides: Record<string, boolean>;
  /** Editor-only branch split state; viewer omits it (defaults to {}). */
  splitIndices?: Record<string, number>;
  plugins?: MindMapPlugin[];
  readonly?: boolean;
  activeTags: string[];
  /** Notified when the user changes zoom (skips the initial render). */
  onZoomChange?: (zoom: number) => void;
}

/**
 * Shared view layer for {@link MindMap} and {@link MindMapViewer}: turns the
 * tree data into laid-out nodes/edges and owns the purely visual concerns
 * (pan/zoom, branch-color persistence, tag filtering, expand animation,
 * and the remark tooltip). Data ownership, drag/canvas-pan, and the entrance
 * auto-fit effect stay in the consuming component because they differ.
 */
export function useMindMapView({
  svgRef,
  mapData,
  direction,
  colorMap,
  setColorMap,
  foldOverrides,
  splitIndices,
  plugins,
  readonly = false,
  activeTags,
  onZoomChange,
}: UseMindMapViewParams) {
  const formulaRevision = useSyncExternalStore(subscribeFormulaEngine, getFormulaRevision, () => 0);
  const formulasEnabled = useMemo(() => {
    if (!plugins?.some((plugin) => plugin.name === 'latex')) return false;
    const pending = [...mapData];
    while (pending.length) {
      const node = pending.pop()!;
      if ([node.text, ...(node.multiLineContent ?? [])].some((text) =>
        parseInlineMarkdown(text, plugins).some((token) => token.type === 'latex-inline' || token.type === 'latex-block'),
      )) return true;
      pending.push(...(node.children ?? []));
    }
    return false;
  }, [mapData, plugins]);
  useEffect(() => {
    if (formulasEnabled) {
      // Preview keeps visible source on failure; PNG retries and reports the error.
      void initFormulaEngine().catch(() => {});
    }
  }, [formulasEnabled]);

  // --- Layout ---
  const { nodes, edges } = useMemo(
    () => {
      // Engine readiness invalidates geometry, not just the formula overlay.
      void formulaRevision;
      return layoutMultiRoot(
        mapData,
        direction,
        colorMap,
        splitIndices ?? {},
        plugins,
        readonly,
        foldOverrides,
      );
    },
    [mapData, direction, colorMap, splitIndices, plugins, readonly, foldOverrides, formulaRevision],
  );

  // Persist colors for level-1 nodes (so they survive swaps)
  useEffect(() => {
    const updates: Record<string, string> = {};
    let hasNew = false;
    for (const node of nodes) {
      if (node.depth === 1 && !colorMap[node.id]) {
        updates[node.id] = node.color;
        hasNew = true;
      }
    }
    if (hasNew) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- persist generated branch colors across later layout recalculations
      setColorMap((prev) => ({ ...prev, ...updates }));
    }
  }, [nodes, colorMap, setColorMap]);

  const nodeMap = useMemo(() => {
    const map: Record<string, (typeof nodes)[number]> = {};
    for (const n of nodes) map[n.id] = n;
    return map;
  }, [nodes]);

  const tagFilterState = useMemo(
    () => analyzeMindMapTagFilter(mapData, activeTags),
    [mapData, activeTags],
  );

  // --- Expand animation (BFS stagger from the expanded node) ---
  const [expansion, setExpansion] = useState<{ nodeId: string } | null>(null);
  const triggerExpandAnimation = useCallback((nodeId: string) => {
    setExpansion({ nodeId });
  }, []);

  useEffect(() => {
    if (!expansion) return;
    // 180ms maximum stagger + 260ms entrance; cancel stale timers on retoggle.
    const timer = setTimeout(() => setExpansion(null), 460);
    return () => clearTimeout(timer);
  }, [expansion]);

  const expandDelays = useMemo(() => {
    if (!expansion) return {};
    const delays: Record<string, number> = {};
    const children = new Map<string, string[]>();
    for (const node of nodes) {
      if (!node.parentId) continue;
      const siblings = children.get(node.parentId) ?? [];
      siblings.push(node.id);
      children.set(node.parentId, siblings);
    }
    const queue = (children.get(expansion.nodeId) ?? []).map((id) => ({ id, depth: 0 }));
    for (let i = 0; i < queue.length; i++) {
      const { id, depth } = queue[i];
      delays[id] = Math.min(depth * 45, 180);
      for (const childId of children.get(id) ?? []) {
        queue.push({ id: childId, depth: depth + 1 });
      }
    }
    return delays;
  }, [expansion, nodes]);

  // --- Pan / Zoom ---
  const panZoom = usePanZoom(svgRef, nodes);
  const { pan, zoom, autoFit, animateTo } = panZoom;

  // --- New node animation ---
  const newNodeIds = useNewNodeAnimation(nodes);

  // --- Remark tooltip ---
  const [remarkTooltip, setRemarkTooltip] = useState<RemarkTooltip | null>(null);
  const handleRemarkHover = useCallback(
    (nodeId: string | null) => {
      if (!nodeId) {
        setRemarkTooltip(null);
        return;
      }
      const node = nodeMap[nodeId];
      if (!node || !node.remark) {
        setRemarkTooltip(null);
        return;
      }
      const svgEl = svgRef.current;
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      const screenX = (node.x + node.width / 2) * zoom + pan.x;
      const screenY = (node.y - node.height / 2) * zoom + pan.y;
      setRemarkTooltip({
        nodeId,
        text: node.remark,
        x: Math.min(screenX, rect.width - 300),
        y: screenY - 8,
      });
    },
    [nodeMap, zoom, pan, svgRef],
  );

  const handleAutoFit = useCallback(() => {
    const fit = autoFit();
    if (fit) animateTo(fit.zoom, fit.panX, fit.panY);
  }, [autoFit, animateTo]);

  // --- Emit zoom changes (skip initial render) ---
  const prevZoomRef = useRef(zoom);
  useEffect(() => {
    if (zoom !== prevZoomRef.current) {
      prevZoomRef.current = zoom;
      onZoomChange?.(zoom);
    }
  }, [zoom, onZoomChange]);

  return {
    nodes,
    edges,
    nodeMap,
    tagFilterState,
    expandDelays,
    ...panZoom,
    newNodeIds,
    remarkTooltip,
    handleRemarkHover,
    handleAutoFit,
    triggerExpandAnimation,
  };
}
