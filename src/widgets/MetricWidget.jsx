import { useRealtime } from '../core/useRealtime'
import Sparkline from './Sparkline'
import { IconMetric } from './icons'

function MetricWidget({ props, dataSource }) {
  const { value, history } = useRealtime(dataSource?.channel, { wsUrl: dataSource?.wsUrl })
  const display = value ?? props.value ?? '—'
  const prev = history.length > 1 ? history[history.length - 2] : null
  const delta = typeof value === 'number' && prev != null ? value - prev : null
  const up = delta != null && delta >= 0
  const pct = typeof value === 'number' && prev != null && prev !== 0
    ? ((delta / Math.abs(prev)) * 100).toFixed(1) : null
  const accent = props.accent || 'var(--data-blue)'
  const sparkData = history.slice(-30)

  return (
    <div className="flex h-full flex-col justify-between gap-1 p-0.5">
      <div className="flex items-start justify-between">
        <span className="tech-label">{props.label}</span>
        {pct != null && (
          <span className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: up ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'color-mix(in srgb, var(--error) 12%, transparent)', color: up ? 'var(--success)' : 'var(--error)' }}>
            {up ? '▲' : '▼'} {Math.abs(Number(pct))}%
          </span>
        )}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="font-num leading-none" style={{
          color: accent,
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {typeof display === 'number' ? display.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) : display}
        </span>
        {props.unit && <span className="mb-1 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{props.unit}</span>}
      </div>
      {delta != null && delta !== 0 && (
        <span className="font-num text-xs font-semibold" style={{ color: up ? 'var(--success)' : 'var(--error)' }}>
          {up ? '▲' : '▼'} {Math.abs(delta).toLocaleString('ru-RU', { maximumFractionDigits: 1 })}
        </span>
      )}
      <div className="mt-auto min-h-0" style={{ height: '32px' }}>
        <Sparkline data={sparkData.length > 1 ? sparkData : [0,0.3,0.6,0.4,0.8,1]} kind="line" color={accent} />
      </div>
    </div>
  )
}

export default {
  type: 'metric',
  name: 'Метрика (KPI)',
  group: 'Данные',
  icon: IconMetric,
  realtime: true,
  defaultSize: { w: 3, h: 3 },
  minSize: { w: 2, h: 2 },
  defaultProps: { label: 'Посетители онлайн', unit: 'чел', accent: '', channel: 'metric.visitors', wsUrl: '' },
  configSchema: [
    { key: 'label', label: 'Подпись', type: 'text' },
    { key: 'unit', label: 'Единица', type: 'text' },
    { key: 'accent', label: 'Цвет акцента', type: 'color' },
    { key: 'channel', label: 'Канал данных', type: 'channel', bindsDataSource: true },
    { key: 'wsUrl', label: 'URL WebSocket', type: 'url', placeholder: 'ws://host:8081', bindsDataSource: 'wsUrl' }
  ],
  Component: MetricWidget
}
