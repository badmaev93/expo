import { useState, useEffect } from 'react'
import { IconChart } from './icons'

const METRICS = [
  { key: 'visitors',   label: 'Посетители',  unit: 'чел', color: 'var(--data-blue)',   base: 1240, range: 200 },
  { key: 'engagement', label: 'Активность',  unit: '%',   color: 'var(--data-teal)',   base: 72,   range: 15  },
  { key: 'rating',     label: 'Рейтинг',     unit: '/10', color: 'var(--success)',     base: 8.4,  range: 0.8 },
  { key: 'stands',     label: 'Стенды',      unit: 'шт',  color: 'var(--data-amber)',  base: 48,   range: 4   },
]

function Trend({ pct }) {
  const up = pct >= 0
  return (
    <span className="font-num text-[10px] font-semibold flex items-center gap-0.5"
      style={{ color: up ? 'var(--success)' : 'var(--error)' }}>
      {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

function MarketTrendWidget({ props }) {
  const [data, setData] = useState(() =>
    METRICS.map(m => ({ ...m, value: m.base + (Math.random() - 0.5) * m.range, pct: (Math.random() - 0.3) * 8 }))
  )
  const interval = Math.max(500, Number(props.interval) || 2500)
  useEffect(() => {
    const t = setInterval(() => {
      setData(prev => prev.map(m => ({
        ...m,
        value: m.base + (Math.random() - 0.5) * m.range,
        pct: (Math.random() - 0.3) * 8,
      })))
    }, interval)
    return () => clearInterval(t)
  }, [interval])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between shrink-0 mb-3">
        <span className="tech-label">{props.title || 'Тренды ЭКСПО'}</span>
        <span className="badge-live">LIVE</span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {data.map(m => (
          <div key={m.key} className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ background: 'var(--bg-container)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full" style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }}/>
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-num text-[13px] font-semibold" style={{ color: m.color }}>
                {m.value < 10 ? m.value.toFixed(1) : Math.round(m.value).toLocaleString('ru-RU')}
                <span className="text-[10px] ml-0.5 font-normal" style={{ color: 'var(--text-muted)' }}>{m.unit}</span>
              </span>
              <Trend pct={m.pct}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default {
  type: 'markettrend',
  name: 'Тренды ЭКСПО',
  group: 'Аналитика',
  icon: IconChart,
  defaultSize: { w: 4, h: 6 },
  minSize: { w: 3, h: 4 },
  defaultProps: { title: 'Тренды ЭКСПО', interval: 2500, channel: 'metric.engagement', wsUrl: '' },
  configSchema: [
    { key: 'title', label: 'Заголовок', type: 'text' },
    { key: 'interval', label: 'Интервал обновления, мс', type: 'number' },
  ],
  Component: MarketTrendWidget
}
