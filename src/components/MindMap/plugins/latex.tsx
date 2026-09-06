import type { MindMapPlugin } from './types'
import type { InlineToken } from '../utils/inline-markdown'
import { escapeXml } from '../utils/inline-markdown'

const MONO_FONT = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"

/** Parsing and fallback only. Shared token layout/rendering emits pure SVG paths. */
export const latexPlugin: MindMapPlugin = {
  name: 'latex',

  inlineTokenPattern() {
    return { pattern: '\\$\\$(.+?)\\$\\$|\\$([^$]+?)\\$', priority: 3 }
  },

  createInlineToken(match, groupOffset) {
    const block = match[groupOffset + 1]
    const inline = match[groupOffset + 2]
    if (block !== undefined) return { type: 'latex-block', content: block } as InlineToken
    if (inline !== undefined) return { type: 'latex-inline', content: inline } as InlineToken
    return null
  },

  renderInlineToken(layout, key) {
    if (layout.token.type !== 'latex-inline' && layout.token.type !== 'latex-block') return null
    if (layout.formula) return <tspan key={key} />
    return <tspan key={key} fontFamily={MONO_FONT} fontStyle="italic" fontSize="0.9em">{layout.token.content}</tspan>
  },

  exportInlineToken(layout) {
    if (layout.token.type !== 'latex-inline' && layout.token.type !== 'latex-block') return ''
    if (layout.formula) return '<tspan></tspan>'
    return `<tspan font-family="${MONO_FONT}" font-style="italic" font-size="0.9em">${escapeXml(layout.token.content)}</tspan>`
  },
}
