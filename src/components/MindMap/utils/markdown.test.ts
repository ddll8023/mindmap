import { describe, expect, it } from 'vitest'
import type { MindMapData } from '../types'
import { parseMarkdownMultiRoot, toMarkdownMultiRoot } from './markdown'

// Compare structure only — parsing assigns fresh ids, so ids are ignored.
const shape = (n: MindMapData): unknown => ({
  text: n.text,
  children: n.children?.map(shape),
})

describe('markdown round-trip', () => {
  it('parses ATX headings and their following lists as one hierarchy', () => {
    const roots = parseMarkdownMultiRoot(`# Root

## First section
- Item A
  - Detail A
### Nested section
- Item B
## Second section
- Item C`)

    expect(roots.map(shape)).toEqual([
      {
        text: 'Root',
        children: [
          {
            text: 'First section',
            children: [
              { text: 'Item A', children: [{ text: 'Detail A' }] },
              { text: 'Nested section', children: [{ text: 'Item B' }] },
            ],
          },
          { text: 'Second section', children: [{ text: 'Item C' }] },
        ],
      },
    ])
  })

  it('removes heading markers without confusing #tags for headings', () => {
    const roots = parseMarkdownMultiRoot('# Root\n- Topic #important')

    expect(roots[0].text).toBe('Root')
    expect(roots[0].children?.[0].text).toBe('Topic #important')
  })

  it('is idempotent on structure across parse → serialize → parse', () => {
    const first = parseMarkdownMultiRoot('- Root\n  - A\n    - A1\n  - B')
    const round = parseMarkdownMultiRoot(toMarkdownMultiRoot(first))
    expect(round.map(shape)).toEqual(first.map(shape))
  })

  it('preserves a deeply nested outline', () => {
    const first = parseMarkdownMultiRoot(
      '- Root\n  - One\n    - One-A\n      - One-A-i\n  - Two',
    )
    const round = parseMarkdownMultiRoot(toMarkdownMultiRoot(first))
    expect(round.map(shape)).toEqual(first.map(shape))
    expect(first[0].text).toBe('Root')
    expect(first[0].children?.map((c) => c.text)).toEqual(['One', 'Two'])
  })

  it('keeps node text content in the serialized output', () => {
    const md = toMarkdownMultiRoot([
      { id: 'r', text: 'Topic', children: [{ id: 'a', text: 'Detail' }] },
    ])
    expect(md).toContain('Topic')
    expect(md).toContain('Detail')
  })

  it('parses nested and flat-title conventions to the same structure', () => {
    // The serializer emits the root's children at column 0 ("flat title"),
    // while authored input usually nests them under the root bullet. Both must
    // yield identical structure, or export → re-import would mangle depth ≥ 2.
    const nested = parseMarkdownMultiRoot('- Root\n  - A\n    - A1\n  - B')
    const flat = parseMarkdownMultiRoot('Root\n- A\n  - A1\n- B')
    expect(flat.map(shape)).toEqual(nested.map(shape))
    expect(nested[0].children?.[0].children?.[0].text).toBe('A1')
  })
})
