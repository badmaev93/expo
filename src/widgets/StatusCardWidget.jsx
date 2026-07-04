import { useRealtime } from '../core/useRealtime'
import { IconMetric } from './icons'

function StatusCardWidget({ props, dataSource }) {
  const { value } = useRealtime(dataSource?.channel, { wsUrl: dataSource?.wsUrl })
  const display = value != null ? value : props.value ?? '—'
  const accent = props.accent || 'var(--accent-text)'
  const icon = props.icon || 'monitoring'
  const label = props.label || 'Метрика'
  const unit = props.unit || ''
  const status = props.status || ''
  const statusColor = props.statusColor || 'var(--success)'
  const maxValue = props.maxValue ? Number(props.maxValue) : null
  const pct = maxValue && typeof display === 'number' ? Math.min(100, (display / maxValue) * 100) : null

  return (
    <div className="flex h-full flex-col justify-between p-0.5 gap-0.5 overflow-hidden">
      <div className="flex items-center justify-between min-h-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in srgb, ${accent} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)` }}>
            <span className="material-symbols-outlined text-[14px]" style={{ color: accent }}>{icon}</span>
          </div>
          <span className="tech-label truncate">{label}</span>
        </div>
        {pct != null && (
          <div className="h-1 w-16 shrink-0 overflow-hidden rounded-full" style={{ background: 'var(--border-subtle)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: accent }}/>
          </div>
        )}
      </div>

      <div className="flex items-end gap-1 min-h-0">
        <span className="font-num leading-none"
          style={{ fontWeight: 700, letterSpacing: '-0.02em',
            fontSize: 'clamp(1.1rem, 14cqw, 2rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
          {typeof display === 'number' ? display.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) : display}
        </span>
        {unit && <span className="mb-1 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{unit}</span>}
      </div>

      {status && (
        <div className="flex items-center gap-1.5 min-h-0 shrink">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: statusColor }}/>
          <span className="text-[10px] font-medium truncate" style={{ color: statusColor }}>{status}</span>
        </div>
      )}
    </div>
  )
}

export default {
  type: 'statuscard',
  name: 'Статус-карта',
  group: 'Мониторинг',
  icon: IconMetric,
  realtime: true,
  defaultSize: { w: 3, h: 3 },
  minSize: { w: 2, h: 2 },
  defaultProps: {
    label: 'Всего активных', unit: '', icon: 'sensors',
    accent: 'var(--accent-text)', maxValue: '',
    status: 'Все системы в норме', statusColor: '',
    channel: 'metric.visitors', wsUrl: '',
  },
  configSchema: [
    { key: 'label',       label: 'Подпись',        type: 'text'   },
    { key: 'unit',        label: 'Единица',         type: 'text'   },
    { key: 'icon',        label: 'Иконка',          type: 'text'   },
    { key: 'accent',      label: 'Цвет акцента',    type: 'color'  },
    { key: 'maxValue',    label: 'Макс. значение',  type: 'number' },
    { key: 'status',      label: 'Текст статуса',   type: 'text'   },
    { key: 'statusColor', label: 'Цвет статуса',    type: 'color'  },
    { key: 'channel',     label: 'Канал WS',        type: 'channel', bindsDataSource: true },
    { key: 'wsUrl',       label: 'URL WS',          type: 'url', placeholder: 'ws://host:8081', bindsDataSource: 'wsUrl' },
  ],
  Component: StatusCardWidget,
}
