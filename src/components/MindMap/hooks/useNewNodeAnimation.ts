import { useState, useEffect, useRef } from 'react'
import type { LayoutNode } from '../types'

export function useNewNodeAnimation(nodes: LayoutNode[]): Set<string> {
  const [newNodeIds, setNewNodeIds] = useState<Set<string>>(new Set())
  const prevNodeIdsRef = useRef<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
  }, [])

  useEffect(() => {
    const currentIds = new Set(nodes.map((n) => n.id))
    if (prevNodeIdsRef.current.size > 0) {
      const added = new Set<string>()
      for (const id of currentIds) {
        if (!prevNodeIdsRef.current.has(id)) {
          added.add(id)
        }
      }
      if (added.size > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: detect new nodes and trigger animation
        setNewNodeIds(added)
        if (timerRef.current !== null) clearTimeout(timerRef.current)
        // Layout-only updates must not cancel removal of the animation class.
        timerRef.current = setTimeout(() => {
          setNewNodeIds(new Set())
          timerRef.current = null
        }, 300)
      }
    }
    prevNodeIdsRef.current = currentIds
  }, [nodes])

  return newNodeIds
}
