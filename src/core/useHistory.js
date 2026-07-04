import { useCallback, useState } from 'react'

const MAX = 50

export function useHistory(getInitial) {
  const [hist, setHist] = useState(() => {
    const initial = typeof getInitial === 'function' ? getInitial() : getInitial
    return { past: [], present: initial, future: [] }
  })

  const set = useCallback((updater) => {
    setHist((h) => {
      const next = typeof updater === 'function' ? updater(h.present) : updater
      if (next === h.present) return h
      return {
        past: [...h.past.slice(-(MAX - 1)), h.present],
        present: next,
        future: []
      }
    })
  }, [])

  const undo = useCallback(() => {
    setHist((h) => {
      if (!h.past.length) return h
      return {
        past: h.past.slice(0, -1),
        present: h.past[h.past.length - 1],
        future: [h.present, ...h.future]
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHist((h) => {
      if (!h.future.length) return h
      const [next, ...rest] = h.future
      return { past: [...h.past, h.present], present: next, future: rest }
    })
  }, [])

  return {
    config: hist.present,
    setConfig: set,
    undo,
    redo,
    canUndo: hist.past.length > 0,
    canRedo: hist.future.length > 0
  }
}
