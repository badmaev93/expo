import { useEffect, useState } from 'react'

function PerfBadge({ count, measureKey }) {
  const [ms, setMs] = useState(null)
  useEffect(() => {
    let raf1, raf2, cancelled = false
    const ready = document.fonts?.ready || Promise.resolve()
    ready.then(() => {
      if (cancelled) return
      const start = performance.now()
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setMs(performance.now() - start))
      })
    })
    return () => { cancelled = true; cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [measureKey])

  const ok = ms != null && ms < 300
  const color = ms == null ? 'var(--text-muted)' : ok ? 'var(--success)' : 'var(--warning)'

  return (
    <div className="font-num flex items-center gap-1.5 px-2.5 py-1.5 text-[11px]"
      style={{ color }}
      title={`Время рендера: ${ms?.toFixed(0) ?? '…'} мс - KPI < 300 мс`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="font-medium">{ms == null ? '…' : `${ms.toFixed(0)} мс`}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{count} вдж</span>
    </div>
  )
}

export default PerfBadge
