import { beforeAll, describe, expect, it } from 'vitest'
import { initFormulaEngine, requireFormula } from './formula'
import { buildExportSVG, exportPreparedPNG } from './export'
import { layoutMultiRoot } from './layout'
import { parseInlineMarkdown, computeTokenLayouts } from './inline-markdown'
import { measureNodeContent } from './content-layout'
import { latexPlugin } from '../plugins/latex'
import { multiLinePlugin } from '../plugins/multi-line'
import { tagsPlugin } from '../plugins/tags'
import { THEME } from './theme'

const formulas = [
  String.raw`E = mc^2`,
  String.raw`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`,
  String.raw`S = \pi r^2`,
  String.raw`\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}`,
  String.raw`\sum_{i=1}^{n} i = \frac{n(n+1)}{2}`,
  String.raw`\begin{bmatrix} a & b \\ c & d \end{bmatrix}`,
]
const plugins = [latexPlugin, multiLinePlugin, tagsPlugin]

beforeAll(() => initFormulaEngine())

describe('formula paths for PNG', () => {
  it.each(formulas)('renders a standalone, measurable formula: %s', (tex) => {
    const formula = requireFormula(tex, true)
    expect(formula.width).toBeGreaterThan(0)
    expect(formula.ascent + formula.descent).toBeGreaterThan(0)
    expect(formula.body).toContain('<path')
    expect(formula.body).not.toMatch(/<(?:foreignObject|image|script)|(?:xlink:)?href=/)
    expect(formula.body).not.toContain('merror')
    expect(formula.viewBox.split(' ').map(Number).every(Number.isFinite)).toBe(true)
  })

  it('uses full inline expressions rather than the first MathJax line-break segment', () => {
    const expression = requireFormula('x=1+2+3', false)
    expect(expression.width).toBeGreaterThan(requireFormula('x', false).width * 4)
  })

  it('emits paths in pngSafe mode, including multi-line formulas', () => {
    const data = [{ id: 'root', text: '公式测试', children: formulas.map((tex, index) => ({
      id: `formula-${index}`, text: `公式：$${tex}$ 后缀`,
      ...(index === 5 ? { multiLineContent: [`$$${tex}$$`], tags: ['matrix'] } : {}),
    })) }]
    const { nodes, edges } = layoutMultiRoot(data, 'right', {}, {}, plugins)
    const svg = buildExportSVG(nodes, edges, { pngSafe: true }, THEME, plugins)
    expect(svg.match(/class="mindmap-formula"/g)).toHaveLength(7)
    expect(svg).not.toContain('foreignObject')
    expect(svg).not.toContain('opacity="0"')
    expect(svg).not.toContain('font-style="italic" font-size="0.9em"')
    expect(svg).not.toContain('cdn.jsdelivr')
  })

  it('shares token metrics and reserves height for stacked formulas and tags', () => {
    const text = `$${formulas[5]}$`
    const node = { id: 'r', text, multiLineContent: [text, text], tags: ['matrix'] }
    const metrics = measureNodeContent(node, 20, 400, 'sans-serif', plugins)
    expect(metrics.multiLines[0].y + metrics.multiLines[0].top).toBeGreaterThan(metrics.main.bottom)
    expect(metrics.multiLines[1].y + metrics.multiLines[1].top)
      .toBeGreaterThan(metrics.multiLines[0].y + metrics.multiLines[0].bottom)
    expect(metrics.tagY).toBeGreaterThan(metrics.multiLines[1].y + metrics.multiLines[1].bottom)
    const { nodes } = layoutMultiRoot([node], 'right', {}, {}, plugins)
    const rootMetrics = measureNodeContent(node, THEME.root.fontSize, THEME.root.fontWeight, THEME.root.fontFamily, plugins)
    expect(nodes[0].height).toBeGreaterThan(rootMetrics.height)
    const tokens = computeTokenLayouts(parseInlineMarkdown(`前 ${text} 后`, plugins), 20, 400, 'sans-serif')
    expect(tokens[1].formula).toBeDefined()
    expect(tokens[2].x).toBe(tokens[1].x + tokens[1].formula!.width)
  })

  it('rejects invalid formulas instead of silently exporting source', async () => {
    await expect(exportPreparedPNG({
      data: [{ id: 'r', text: String.raw`$\notARealMacro$` }], direction: 'right',
      colorMap: {}, splitIndices: {}, foldOverrides: {}, readonly: false, theme: THEME, plugins,
    })).rejects.toThrow('公式无法渲染')
  })

  it('does not leak user macro definitions between formulas', () => {
    requireFormula(String.raw`\newcommand{\myLocalMacro}{x}\myLocalMacro`, false)
    expect(() => requireFormula(String.raw`\myLocalMacro`, false)).toThrow('公式无法渲染')
  })
})
