import { useMemo } from "react";
import { measureNodeContent } from '../utils/content-layout';
import { buildFormulaOverlays } from '../utils/inline-markdown';
import type { LayoutNode, LayoutDirection } from "../types";
import { getLevel1TextColor } from "../utils/theme";
import type { ThemeColors } from "../utils/theme";
import type { MindMapPlugin } from "../plugins/types";
import type { TokenLayout } from "../utils/inline-markdown";
import { INLINE_IMAGE_HEIGHT } from "../utils/inline-markdown";
import {
  runRenderNodeDecoration,
  runRenderInlineToken,
} from "../plugins/runner";

const MONO_FONT =
  "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";

export interface MindMapNodeProps {
  node: LayoutNode;
  offset?: { x: number; y: number };
  isEditing: boolean;
  isPendingEdit: boolean;
  isSelected: boolean;
  isDropTarget?: boolean;
  isNew: boolean;
  isGhost?: boolean;
  animClass: string;
  editText: string;
  theme: ThemeColors;
  direction: LayoutDirection;
  readonly?: boolean;
  plugins?: MindMapPlugin[];
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onClick: (e: React.MouseEvent, nodeId: string) => void;
  onDoubleClick: (e: React.MouseEvent, nodeId: string, text: string) => void;
  onContextMenu?: (e: React.MouseEvent, nodeId: string) => void;
  onEditChange: (text: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onAddChild: (
    e: React.MouseEvent,
    parentId: string,
    side?: "left" | "right",
  ) => void;
  onRemarkHover?: (nodeId: string | null) => void;
  onFoldToggle?: (nodeId: string) => void;
  foldExpandLabel?: string;
  foldCollapseLabel?: string;
  expandDelay?: number;
  isFilterDimmed?: boolean;
}

function FoldToggle({
  node,
  x,
  theme,
  onFoldToggle,
  expandLabel = "Expand node",
  collapseLabel = "Collapse node",
}: {
  node: LayoutNode;
  x: number;
  theme: ThemeColors;
  onFoldToggle: (nodeId: string) => void;
  expandLabel?: string;
  collapseLabel?: string;
}) {
  if (!node.hasChildren) return null;

  const isCollapsed = node.isCollapsed === true;
  const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopPropagation();
    onFoldToggle(node.id);
  };

  return (
    <g
      className={`mindmap-fold-btn${isCollapsed ? " is-collapsed" : ""}${x < 0 ? " is-left" : ""}`}
      style={{ color: theme.node.textColor }}
      role="button"
      tabIndex={0}
      aria-label={isCollapsed ? expandLabel : collapseLabel}
      aria-expanded={!isCollapsed}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onFoldToggle(node.id);
      }}
      onKeyDown={handleKeyDown}
    >
      <title>{isCollapsed ? expandLabel : collapseLabel}</title>
      <circle className="mindmap-fold-hit" cx={x} cy={0} r={14} fill="transparent" />
      <rect
        className="mindmap-fold-surface"
        x={x - 10} y={-10} width={20} height={20} rx={6}
        fill="transparent" stroke="transparent" strokeWidth={1.5}
      />
      {/* Keep icon rotation separate from its position and the node layout. */}
      <g transform={`translate(${x}, 0)`} aria-hidden="true" pointerEvents="none">
        <path
          className="mindmap-fold-chevron"
          d="M -2 -4 L 2 0 L -2 4"
          fill="none" stroke="currentColor" strokeWidth={1.6}
          strokeLinecap="round" strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

// --- SVG token rendering helpers ---

function renderTokenTspan(
  layout: TokenLayout,
  key: number,
  plugins?: MindMapPlugin[],
  highlightTextColor?: string,
) {
  const { token } = layout;

  // Try plugin rendering for custom token types
  if (
    token.type !== "text" &&
    token.type !== "bold" &&
    token.type !== "italic" &&
    token.type !== "strikethrough" &&
    token.type !== "code" &&
    token.type !== "highlight" &&
    token.type !== "link" &&
    token.type !== "image"
  ) {
    if (plugins && plugins.length > 0) {
      const el = runRenderInlineToken(plugins, layout, key);
      if (el) return el;
    }
  }

  switch (token.type) {
    case "bold":
      return (
        <tspan key={key} className="mindmap-text-bold" fontWeight={700}>
          {token.content}
        </tspan>
      );
    case "italic":
      return (
        <tspan key={key} className="mindmap-text-italic" fontStyle="italic">
          {token.content}
        </tspan>
      );
    case "strikethrough":
      return (
        <tspan
          key={key}
          className="mindmap-text-strikethrough"
          textDecoration="line-through"
          opacity={0.6}
        >
          {token.content}
        </tspan>
      );
    case "code":
      return (
        <tspan
          key={key}
          className="mindmap-text-code"
          fontFamily={MONO_FONT}
          fontSize="0.88em"
        >
          {token.content}
        </tspan>
      );
    case "highlight":
      return (
        <tspan
          key={key}
          className="mindmap-text-highlight"
          fill={highlightTextColor || "#FFEB3B"}
        >
          {token.content}
        </tspan>
      );
    case "link":
      return (
        <a
          key={key}
          className="mindmap-text-link"
          href={token.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <tspan fill="#2563EB" textDecoration="underline">
            {token.text}
          </tspan>
        </a>
      );
    case "image":
      return (
        <tspan key={key} className="mindmap-text-image" dx={layout.width} />
      );
    case "latex-inline":
    case "latex-block":
      // Fallback: italic monospace
      return (
        <tspan
          key={key}
          className="mindmap-text-latex"
          fontFamily={MONO_FONT}
          fontStyle="italic"
          fontSize="0.9em"
        >
          {token.content}
        </tspan>
      );
    case "text":
    default:
      return (
        <tspan key={key} className="mindmap-text-plain">
          {token.content}
        </tspan>
      );
  }
}

function TaskStatusSvgIcon({ status, size }: { status: string; size: number }) {
  if (status === "done") {
    return (
      <g>
        <rect
          x={0}
          y={0}
          width={size}
          height={size}
          rx={size * 0.2}
          fill="#22C55E"
        />
        <path
          d={`M${size * 0.28} ${size * 0.5}L${size * 0.44} ${size * 0.66}L${size * 0.72} ${size * 0.34}`}
          stroke="white"
          strokeWidth={size * 0.13}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    );
  }
  if (status === "doing") {
    return (
      <g>
        <rect
          x={0}
          y={0}
          width={size}
          height={size}
          rx={size * 0.2}
          fill="none"
          stroke="#FBBF24"
          strokeWidth={size * 0.1}
        />
        <rect
          x={size * 0.25}
          y={size * 0.25}
          width={size * 0.5}
          height={size * 0.5}
          rx={size * 0.1}
          fill="#FBBF24"
          opacity={0.6}
        />
      </g>
    );
  }
  // todo
  return (
    <rect
      x={0}
      y={0}
      width={size}
      height={size}
      rx={size * 0.2}
      fill="none"
      stroke="#999"
      strokeWidth={size * 0.1}
      opacity={0.4}
    />
  );
}

// --- SVG-native node text content ---

function SvgNodeContent({
  node,
  fontSize,
  fontWeight,
  fontFamily,
  textColor,
  onRemarkHover,
  plugins,
  highlightTextColor,
  highlightBgColor,
}: {
  node: LayoutNode;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  textColor: string;
  onRemarkHover?: (id: string | null) => void;
  plugins?: MindMapPlugin[];
  highlightTextColor?: string;
  highlightBgColor?: string;
}) {
  const content = useMemo(() => measureNodeContent(node, fontSize, fontWeight, fontFamily, plugins),
    [node, fontSize, fontWeight, fontFamily, plugins]);
  const { layouts, width: textContentWidth } = content.main;
  const taskIconWidth = node.taskStatus ? fontSize * 0.85 + 4 : 0;
  const remarkWidth = node.remark ? fontSize * 0.7 + 4 : 0;
  const totalWidth = taskIconWidth + textContentWidth + remarkWidth;

  const startX = -totalWidth / 2;
  const textStartX = startX + taskIconWidth;
  const iconSize = fontSize * 0.85;
  const bgRectY = -fontSize / 2 - 2;
  const bgRectH = fontSize + 4;
  const remarkFontSize = fontSize * 0.7;
  const remarkGap = 4;

  // Multi-line content offset
  const multiLineContent = node.multiLineContent;

  return (
    <g className="mindmap-node-content">
      {/* Task status icon */}
      {node.taskStatus && (
        <g
          className={`mindmap-task-icon mindmap-task-${node.taskStatus}`}
          transform={`translate(${startX}, ${-iconSize / 2})`}
        >
          <TaskStatusSvgIcon status={node.taskStatus} size={iconSize} />
        </g>
      )}

      {/* Background rects for code/highlight tokens */}
      {layouts.map((layout, i) => {
        if (layout.token.type === "code") {
          return (
            <rect
              className="mindmap-code-bg"
              key={`bg-${i}`}
              x={textStartX + layout.x - 2}
              y={bgRectY}
              width={layout.width + 4}
              height={bgRectH}
              rx={3}
              fill="rgba(128,128,128,0.12)"
            />
          );
        }
        if (layout.token.type === "highlight") {
          return (
            <rect
              className="mindmap-highlight-bg"
              key={`bg-${i}`}
              x={textStartX + layout.x - 1}
              y={bgRectY}
              width={layout.width + 2}
              height={bgRectH}
              rx={2}
              fill={highlightBgColor || "rgba(255,213,79,0.3)"}
            />
          );
        }
        return null;
      })}

      {/* Text element with tspan segments */}
      <text
        className="mindmap-node-text"
        xmlSpace="preserve"
        textAnchor="start"
        dominantBaseline="central"
        x={textStartX}
        fill={textColor}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fontFamily={fontFamily}
      >
        {layouts.map((layout, i) => (
          <tspan key={i} x={textStartX + layout.x}>
            {renderTokenTspan(layout, i, plugins, highlightTextColor)}
          </tspan>
        ))}
      </text>

      {layouts.map((layout, i) => {
        const { token } = layout;
        if (token.type !== "image") return null;
        return (
          <image
            key={`image-${i}`}
            className="mindmap-inline-image"
            href={token.url}
            x={textStartX + layout.x}
            y={-INLINE_IMAGE_HEIGHT / 2}
            width={layout.width}
            height={INLINE_IMAGE_HEIGHT}
            preserveAspectRatio="xMidYMid meet"
          >
            <title>{token.alt || "image"}</title>
          </image>
        );
      })}

      <g className="mindmap-formula-overlays" dangerouslySetInnerHTML={{
        __html: buildFormulaOverlays(layouts, textStartX, 0, fontSize, textColor),
      }} />

      {/* Multi-line content (from | lines) with inline markdown support */}
      {multiLineContent &&
        multiLineContent.length > 0 &&
        content.multiLines.map((line, i) => {
          const mlFontSize = fontSize * 0.85;
          const mlLayouts = line.layouts;
          const mlStartX = -line.width / 2;
          const mlY = line.y;
          const mlBgRectY = mlY - mlFontSize / 2 - 2;
          const mlBgRectH = mlFontSize + 4;
          return (
            <g className="mindmap-multiline" key={`ml-${i}`}>
              {/* Background rects for code/highlight tokens in multi-line */}
              {mlLayouts.map((layout, j) => {
                if (layout.token.type === "code") {
                  return (
                    <rect
                      className="mindmap-code-bg"
                      key={`ml-bg-${j}`}
                      x={mlStartX + layout.x - 2}
                      y={mlBgRectY}
                      width={layout.width + 4}
                      height={mlBgRectH}
                      rx={3}
                      fill="rgba(128,128,128,0.12)"
                    />
                  );
                }
                if (layout.token.type === "highlight") {
                  return (
                    <rect
                      className="mindmap-highlight-bg"
                      key={`ml-bg-${j}`}
                      x={mlStartX + layout.x - 1}
                      y={mlBgRectY}
                      width={layout.width + 2}
                      height={mlBgRectH}
                      rx={2}
                      fill={highlightBgColor || "rgba(255,213,79,0.3)"}
                    />
                  );
                }
                return null;
              })}
              <text
                className="mindmap-multiline-text"
                xmlSpace="preserve"
                x={mlStartX}
                y={mlY}
                textAnchor="start"
                dominantBaseline="central"
                fill={textColor}
                fontSize={mlFontSize}
                fontWeight={400}
                fontFamily={fontFamily}
                opacity={0.8}
              >
                {mlLayouts.map((layout, j) => (
                  <tspan key={j} x={mlStartX + layout.x}>
                    {renderTokenTspan(layout, j, plugins, highlightTextColor)}
                  </tspan>
                ))}
              </text>
              {mlLayouts.map((layout, j) => {
                const { token } = layout;
                if (token.type !== "image") return null;
                return (
                  <image
                    key={`ml-image-${i}-${j}`}
                    className="mindmap-inline-image"
                    href={token.url}
                    x={mlStartX + layout.x}
                    y={mlY - INLINE_IMAGE_HEIGHT / 2}
                    width={layout.width}
                    height={INLINE_IMAGE_HEIGHT}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <title>{token.alt || "image"}</title>
                  </image>
                );
              })}
              <g className="mindmap-formula-overlays" opacity={0.8} dangerouslySetInnerHTML={{
                __html: buildFormulaOverlays(mlLayouts, mlStartX, mlY, mlFontSize, textColor),
              }} />
            </g>
          );
        })}

      {/* Tags badges */}
      {node.tags &&
        node.tags.length > 0 &&
        (() => {
          const tagFontSize = fontSize * 0.65;
          const tagY = content.tagY;
          const tagRowWidth = node.tags!.reduce((sum, tag) => sum + tag.length * tagFontSize * 0.65 + 10, 0) + (node.tags!.length - 1) * 4;
          let tagX = -tagRowWidth / 2;
          return node.tags!.map((tag, i) => {
            const tagWidth = tag.length * tagFontSize * 0.65 + 10;
            const x = tagX;
            tagX += tagWidth + 4;
            const colors = [
              "#3B82F6",
              "#8B5CF6",
              "#EC4899",
              "#F59E0B",
              "#10B981",
              "#6366F1",
            ];
            const color = colors[i % colors.length];
            return (
              <g className="mindmap-tag" key={`tag-${i}`}>
                <rect
                  className="mindmap-tag-bg"
                  x={x}
                  y={tagY}
                  width={tagWidth}
                  height={tagFontSize + 6}
                  rx={3}
                  fill={color}
                  opacity={0.15}
                />
                <text
                  className="mindmap-tag-text"
                  x={x + tagWidth / 2}
                  y={tagY + (tagFontSize + 6) / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={tagFontSize}
                  fill={color}
                  fontFamily={fontFamily}
                >
                  {tag}
                </text>
              </g>
            );
          });
        })()}

      {/* Remark indicator */}
      {node.remark && (
        <text
          className="mindmap-remark-indicator"
          x={textStartX + textContentWidth + remarkGap}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={remarkFontSize}
          opacity={0.5}
          onMouseEnter={() => onRemarkHover?.(node.id)}
          onMouseLeave={() => onRemarkHover?.(null)}
        >
          <title>{node.remark}</title>
          💬
        </text>
      )}
    </g>
  );
}

// --- Main node component ---

export function MindMapNode({
  node,
  offset,
  isEditing,
  isPendingEdit,
  isSelected,
  isDropTarget = false,
  isNew,
  isGhost,
  animClass,
  editText,
  theme,
  direction,
  readonly: readonlyProp,
  plugins,
  onMouseDown,
  onClick,
  onDoubleClick,
  onContextMenu,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onAddChild,
  onRemarkHover,
  onFoldToggle,
  foldExpandLabel,
  foldCollapseLabel,
  expandDelay,
  isFilterDimmed,
}: MindMapNodeProps) {
  const nx = node.x + (offset?.x ?? 0);
  const ny = node.y + (offset?.y ?? 0);
  const showInput = isEditing || isPendingEdit;
  const displayEditText = isPendingEdit && !isEditing ? "" : editText;
  const newClass = isNew && expandDelay === undefined ? "mindmap-node-new" : "";
  const placeholderClass = node.placeholder ? "mindmap-node-placeholder" : "";
  const expandClass = expandDelay !== undefined ? "mindmap-node-expanding" : "";
  const dimmedClass = isFilterDimmed ? " mindmap-node-filter-dimmed" : "";
  const dropTargetClass = isDropTarget ? " mindmap-node-drop-target" : "";
  const expandStyle =
    expandDelay !== undefined
      ? { animationDelay: `${expandDelay}ms` }
      : undefined;

  const taskPrefix =
    node.taskStatus === "done"
      ? "[x] "
      : node.taskStatus === "doing"
        ? "[-] "
        : node.taskStatus === "todo"
          ? "[ ] "
          : "";
  const rawEditText = taskPrefix + node.text;

  // Plugin decorations
  const pluginDecorations =
    plugins && plugins.length > 0
      ? runRenderNodeDecoration(plugins, node, theme)
      : null;

  if (node.depth === 0) {
    const bgColor = theme.root.bgColor;
    return (
      <g
        key={node.id}
        transform={`translate(${nx}, ${ny})`}
        className={`mindmap-node-g mindmap-node-root ${animClass} ${newClass} ${placeholderClass} ${expandClass}${isGhost ? ' mindmap-node-ghost' : ''}${dimmedClass}${dropTargetClass}`}
        data-branch-index={node.branchIndex}
        role="treeitem"
        aria-label={node.text}
        tabIndex={readonlyProp ? undefined : -1}
        onMouseDown={(e) => onMouseDown(e, node.id)}
        onClick={(e) => onClick(e, node.id)}
        onDoubleClick={(e) => onDoubleClick(e, node.id, rawEditText)}
        onContextMenu={(e) => onContextMenu?.(e, node.id)}
        style={expandStyle}
      >
        <rect
          className="mindmap-node-bg"
          x={-node.width / 2}
          y={-node.height / 2}
          width={node.width}
          height={node.height}
          rx={node.height / 2}
          ry={node.height / 2}
          fill={bgColor}
          stroke={isDropTarget || isSelected ? theme.selection.strokeColor : "none"}
          strokeWidth={isDropTarget ? 3 : isSelected ? 2.5 : 0}
          strokeDasharray={isDropTarget ? "6 4" : undefined}
        />
        {showInput ? (
          <foreignObject
            x={-node.width / 2}
            y={-node.height / 2}
            width={node.width}
            height={node.height}
          >
            <input
              className="mindmap-edit-input mindmap-edit-root"
              value={displayEditText}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditCommit();
              }}
              onBlur={onEditCommit}
              autoFocus
              style={{
                fontSize: theme.root.fontSize,
                fontWeight: theme.root.fontWeight,
                fontFamily: theme.root.fontFamily,
              }}
            />
          </foreignObject>
        ) : (
          <SvgNodeContent
            node={node}
            fontSize={theme.root.fontSize}
            fontWeight={theme.root.fontWeight}
            fontFamily={theme.root.fontFamily}
            textColor={theme.root.textColor}
            onRemarkHover={onRemarkHover}
            plugins={plugins}
            highlightTextColor={theme.highlight.textColor}
            highlightBgColor={theme.highlight.bgColor}
          />
        )}
        {/* Plugin decorations */}
        {pluginDecorations}
        {/* + buttons based on direction */}
        {!readonlyProp &&
          !isGhost &&
          (direction === "right" || direction === "both") && (
            <g
              className="mindmap-add-btn"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => onAddChild(e, node.id, "right")}
            >
              <circle
                cx={node.width / 2 + 18}
                cy={0}
                r={11}
                fill={theme.addBtn.fill}
              />
              <line
                x1={node.width / 2 + 14}
                y1={0}
                x2={node.width / 2 + 22}
                y2={0}
                stroke={theme.addBtn.iconColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <line
                x1={node.width / 2 + 18}
                y1={-4}
                x2={node.width / 2 + 18}
                y2={4}
                stroke={theme.addBtn.iconColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </g>
          )}
        {!readonlyProp &&
          !isGhost &&
          (direction === "left" || direction === "both") && (
            <g
              className="mindmap-add-btn"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => onAddChild(e, node.id, "left")}
            >
              <circle
                cx={-(node.width / 2 + 18)}
                cy={0}
                r={11}
                fill={theme.addBtn.fill}
              />
              <line
                x1={-(node.width / 2 + 22)}
                y1={0}
                x2={-(node.width / 2 + 14)}
                y2={0}
                stroke={theme.addBtn.iconColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
              <line
                x1={-(node.width / 2 + 18)}
                y1={-4}
                x2={-(node.width / 2 + 18)}
                y2={4}
                stroke={theme.addBtn.iconColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </g>
          )}
        {readonlyProp && !isGhost && onFoldToggle && (
          <FoldToggle
            node={node}
            x={direction === "left" ? -(node.width / 2 + 14) : node.width / 2 + 14}
            theme={theme}
            onFoldToggle={onFoldToggle}
            expandLabel={foldExpandLabel}
            collapseLabel={foldCollapseLabel}
          />
        )}
      </g>
    );
  }

  // Child node rendering
  const isLevel1 = node.depth === 1;
  const fontSize = isLevel1 ? theme.level1.fontSize : theme.node.fontSize;
  const fontWeight = isLevel1 ? theme.level1.fontWeight : theme.node.fontWeight;
  const nodeTextColor = isLevel1
    ? getLevel1TextColor(node.color, node.branchIndex)
    : theme.node.textColor;
  const textW = node.width - theme.node.paddingH * 2;
  const underlineY = Math.max(fontSize / 2 + 4, measureNodeContent(node, fontSize, fontWeight, theme.node.fontFamily, plugins).main.bottom + 4);
  const addBtnOffset =
    node.side === "left" ? -node.width / 2 - 18 : node.width / 2 + 18;

  return (
    <g
      key={node.id}
      transform={`translate(${nx}, ${ny})`}
      className={`mindmap-node-g mindmap-node-child${isLevel1 ? " mindmap-node-level1" : ""} ${animClass} ${newClass} ${placeholderClass} ${expandClass}${isGhost ? ' mindmap-node-ghost' : ''}${dimmedClass}${dropTargetClass}`}
      style={expandStyle}
      data-branch-index={node.branchIndex}
      role="treeitem"
      aria-label={node.text}
      tabIndex={readonlyProp ? undefined : -1}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onClick={(e) => onClick(e, node.id)}
      onDoubleClick={(e) => onDoubleClick(e, node.id, rawEditText)}
      onContextMenu={(e) => onContextMenu?.(e, node.id)}
    >
      {/* First-level cards and transparent descendant hit areas */}
      <rect
        className="mindmap-node-bg"
        x={-node.width / 2}
        y={-node.height / 2}
        width={node.width}
        height={node.height}
        fill={isLevel1 ? node.color : isDropTarget || isSelected ? theme.selection.fillColor : "transparent"}
        stroke={isDropTarget || isSelected ? theme.selection.strokeColor : "none"}
        strokeWidth={isDropTarget ? 2.5 : isSelected ? 1.5 : 0}
        strokeDasharray={isDropTarget ? "6 4" : undefined}
        rx={isLevel1 ? 8 : 4}
        ry={isLevel1 ? 8 : 4}
      />
      {showInput ? (
        <foreignObject
          x={-Math.max(node.width, 80) / 2}
          y={-node.height / 2}
          width={Math.max(node.width, 80)}
          height={node.height}
        >
          <input
            className="mindmap-edit-input mindmap-edit-child"
            value={displayEditText}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditCommit();
              if (e.key === "Escape") onEditCancel();
            }}
            onBlur={onEditCommit}
            autoFocus
            style={{
              fontSize,
              fontWeight,
              fontFamily: theme.node.fontFamily,
              color: nodeTextColor,
              textAlign: "center",
              borderBottom: isLevel1 ? "none" : `2.5px solid ${node.color}`,
            }}
          />
        </foreignObject>
      ) : (
        <>
          <SvgNodeContent
            node={node}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontFamily={theme.node.fontFamily}
            textColor={nodeTextColor}
            onRemarkHover={onRemarkHover}
            plugins={plugins}
            highlightTextColor={theme.highlight.textColor}
            highlightBgColor={theme.highlight.bgColor}
          />
          {!isLevel1 && (
            <line
              className="mindmap-node-underline"
              x1={-textW / 2}
              y1={underlineY}
              x2={textW / 2}
              y2={underlineY}
              stroke={node.color}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )}
        </>
      )}
      {/* Plugin decorations */}
      {pluginDecorations}
      {/* + button */}
      {!readonlyProp && !isGhost && (
        <g
          className="mindmap-add-btn"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => onAddChild(e, node.id)}
        >
          <circle cx={addBtnOffset} cy={0} r={11} fill={theme.addBtn.fill} />
          <line
            x1={addBtnOffset - 4}
            y1={0}
            x2={addBtnOffset + 4}
            y2={0}
            stroke={theme.addBtn.iconColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={addBtnOffset}
            y1={-4}
            x2={addBtnOffset}
            y2={4}
            stroke={theme.addBtn.iconColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      )}
      {readonlyProp && !isGhost && onFoldToggle && (
        <FoldToggle
          node={node}
          x={addBtnOffset}
          theme={theme}
          onFoldToggle={onFoldToggle}
          expandLabel={foldExpandLabel}
          collapseLabel={foldCollapseLabel}
        />
      )}
    </g>
  );
}
