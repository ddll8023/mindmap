import type { MindMapData } from '../types'
import type { MindMapPlugin } from '../plugins/types'
import { computeTokenLayouts, parseInlineMarkdown, INLINE_IMAGE_HEIGHT } from './inline-markdown'
import type { TokenLayout } from './inline-markdown'

export function measureContentLine(text: string, fontSize: number, fontWeight: number, fontFamily: string, plugins?: MindMapPlugin[]) {
  const layouts = computeTokenLayouts(parseInlineMarkdown(text, plugins), fontSize, fontWeight, fontFamily)
  return { layouts, ...measureLineBounds(layouts, fontSize) }
}

function measureLineBounds(layouts: TokenLayout[], fontSize: number) {
  let top = -fontSize / 2 - 2
  let bottom = fontSize / 2 + 2
  for (const layout of layouts) {
    if (layout.formula) {
      top = Math.min(top, fontSize * 0.3 - layout.formula.ascent)
      bottom = Math.max(bottom, fontSize * 0.3 + layout.formula.descent)
    }
    if (layout.token.type === 'image') {
      top = Math.min(top, -INLINE_IMAGE_HEIGHT / 2)
      bottom = Math.max(bottom, INLINE_IMAGE_HEIGHT / 2)
    }
  }
  const last = layouts.at(-1)
  return { width: last ? last.x + last.width : 0, top, bottom }
}

/** Shared vertical positions keep tall formulas, follow-lines and tags from overlapping. */
export function measureNodeContent(
  node: Pick<MindMapData, 'text' | 'taskStatus' | 'remark' | 'multiLineContent' | 'tags'>,
  fontSize: number,
  fontWeight: number,
  fontFamily: string,
  plugins?: MindMapPlugin[],
) {
  const main = measureContentLine(node.text, fontSize, fontWeight, fontFamily, plugins)
  const taskWidth = node.taskStatus ? fontSize * 0.85 + 4 : 0
  const remarkWidth = node.remark ? fontSize * 0.7 + 4 : 0
  let width = main.width + taskWidth + remarkWidth
  let bottom = main.bottom
  const multiLines = (node.multiLineContent ?? []).map((text, index) => {
    const line = measureContentLine(text, fontSize * 0.85, 400, fontFamily, plugins)
    const originalY = fontSize / 2 + 8 + index * fontSize * 1.4
    const y = Math.max(originalY, bottom + 6 - line.top)
    bottom = y + line.bottom
    width = Math.max(width, line.width)
    return { ...line, y }
  })
  const tagY = Math.max(fontSize / 2 + 6 + multiLines.length * fontSize * 1.4, bottom + 4)
  if (node.tags?.length) {
    const tagSize = fontSize * 0.65
    const tagWidth = node.tags.reduce((sum, tag) => sum + tag.length * tagSize * 0.65 + 10, 0) + (node.tags.length - 1) * 4
    width = Math.max(width, tagWidth)
    bottom = tagY + tagSize + 6
  }
  // Nodes are positioned around their title's center. Reserve both sides so
  // the existing centered node bounds/edge geometry remain correct.
  return { main, multiLines, tagY, width, height: 2 * Math.max(-main.top, bottom) }
}
