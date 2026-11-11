import { useEffect, useRef, useState } from 'react'
import { wsManager } from './WebSocketManager'

export function useRealtime(channel, { historySize = 40 } = {}) {
  const [value, setValue] = useState(null)
  const [ts, setTs] = useState(null)
  const historyRef = useRef([])
  const [history, setHistory] = useState([])

  useEffect(() => {
    historyRef.current = []
    setHistory([])
    setValue(null)
    if (!channel) return
    let frameId = null

    const unsub = wsManager.subscribe(channel, (msg) => {
      if (Array.isArray(msg.series)) {
        historyRef.current = msg.series.slice(-historySize)
      } else if (typeof msg.value === 'number') {
        const next = [...historyRef.current, msg.value]
        historyRef.current = next.slice(-historySize)
      }

      // Throttle React state updates using requestAnimationFrame
      if (!frameId) {
        frameId = requestAnimationFrame(() => {
          setHistory([...historyRef.current]) // Spread to ensure new reference
          // Read from the end of historyRef.current to get the latest value, avoiding closure issues
          const latestValue = historyRef.current.length > 0 ? historyRef.current[historyRef.current.length - 1] : null
          setValue(latestValue)
          setTs(Date.now()) // Always set to current timestamp when rendering
          frameId = null
        })
      }
    })

    return () => {
      unsub()
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [channel, historySize])

  return { value, history, ts }
}

export function useWsStatus() {
  const [status, setStatus] = useState(wsManager.status)
  useEffect(() => wsManager.onStatus(setStatus), [])
  return status
}
