import css from '../MindMap.css?raw'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MindMapCanvas } from './MindMapCanvas'
import { getTheme } from '../utils/theme'
import type { LayoutNode } from '../types'

const child: LayoutNode = {
  id: 'child', text: 'Child', x: 240, y: 90, width: 100, height: 32,
  color: '#2563eb', depth: 1, side: 'right', parentId: 'root', hasChildren: true,
}

function renderCanvas(isCollapsed: boolean, side: 'left' | 'right' = 'right') {
  const node = { ...child, isCollapsed, side }
  return renderToStaticMarkup(
    <svg>
      <MindMapCanvas
        nodes={[node]}
        nodeMap={{ child: node }}
        edges={[{ key: 'edge', fromId: 'root', toId: 'child', color: node.color,
          path: 'M0,0 C120,0 120,90 240,90', strokeDasharray: '4 4' }]}
        theme={getTheme('light')}
        direction="right"
        pan={{ x: 0, y: 0 }}
        zoom={1}
        initialReady
        draggingCanvas={false}
        expandDelays={{ child: 45 }}
        newNodeIds={new Set(['child'])}
        dimmedNodes={new Set()}
        readonly
        onFoldToggle={() => {}}
      />
    </svg>,
  )
}

describe('fold presentation', () => {
  it('applies the expansion delay to children without also starting a new-node animation', () => {
    const html = renderCanvas(false)
    expect(html).toContain('translate(240, 90)')
    expect(html).toContain('mindmap-node-expanding')
    expect(html).toContain('animation-delay:45ms')
    expect(html).not.toContain('mindmap-node-new')
    expect(html).toContain('stroke-dasharray="4 4"')
  })

  it('uses a chevron with the collapsed state and preserves accessible state', () => {
    expect(renderCanvas(true)).toContain('mindmap-fold-chevron')
    expect(renderCanvas(true, 'left')).toContain('mindmap-fold-btn is-collapsed is-left')
    expect(renderCanvas(true)).toContain('mindmap-fold-btn is-collapsed')
    expect(renderCanvas(true)).toContain('aria-expanded="false"')
    expect(renderCanvas(false)).not.toContain('mindmap-fold-btn is-collapsed')
    expect(renderCanvas(false)).toContain('aria-expanded="true"')
  })

  it('keeps entrance keyframes from overriding SVG node positions', () => {
    const entrance = css.match(/@keyframes mindmap-node-appear\s*\{([\s\S]*?)\n\}/)?.[1]
    expect(entrance).toBeDefined()
    expect(entrance).not.toContain('transform:')
    expect(css).toContain('prefers-reduced-motion: reduce')
  })
})
