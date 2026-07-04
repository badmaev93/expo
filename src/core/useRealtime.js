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
    const unsub = wsManager.subscribe(channel, (msg) => {
      if (Array.isArray(msg.series)) {
        historyRef.current = msg.series.slice(-historySize)
      } else if (typeof msg.value === 'number') {
        const next = [...historyRef.current, msg.value]
        historyRef.current = next.slice(-historySize)
      }
      setHistory(historyRef.current)
      setValue(msg.value)
      setTs(msg.ts || Date.now())
    })
    return unsub
  }, [channel, historySize])

  return { value, history, ts }
}

export function useWsStatus() {
  const [status, setStatus] = useState(wsManager.status)
  useEffect(() => wsManager.onStatus(setStatus), [])
  return status
}
