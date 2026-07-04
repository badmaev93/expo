import { useRealtime } from '../core/useRealtime'
import { IconGauge } from './icons'

const C = 283

function RadialGaugeWidget({ props, dataSource }) {
  const { value } = useRealtime(dataSource?.channel, { wsUrl: dataSource?.wsUrl })
  const min = Number(props.min ?? 0)
  const max = Number(props.max ?? 100)
  const v   = typeof value === 'number' ? value : (min + max) / 2
  const pct = Math.max(0, Math.min(1, (v - min) / (max - min || 1)))
  const dashOffset = C - pct * C
  const accent = props.accent || 'var(--data-blue)'
  const delta  = props.deltaText || ''

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 shrink-0 mb-1">
        <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--text-muted)' }}>bolt</span>
        <span className="tech-label">{props.label || 'Эффективность'}</span>
      </div>

      <div className="flex flex-1 items-center justify-center relative min-h-0">
        <svg className="w-full max-w-[140px] max-h-[140px]" viewBox="0 0 100 100"
          style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <filter id="rg-glow-u">
              <feGaussianBlur stdDeviation="2.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="45" fill="none"
            stroke="var(--border-subtle)" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none"
            stroke={accent} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-num leading-none"
            style={{ fontSize: 'clamp(1.1rem,3vw,1.7rem)', fontWeight: 700,
              letterSpacing: '-0.02em', color: accent }}>
            {typeof v === 'number' ? v.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) : '—'}
            <span className="text-base ml-0.5">{props.unit || '%'}</span>
          </div>
          {delta && (
            <div className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--success)' }}>{delta}</div>
          )}
        </div>
      </div>

      {(props.metric1Label || props.metric2Label) && (
        <div className="grid grid-cols-2 gap-2 shrink-0 mt-1">
          {[
            { label: props.metric1Label, value: props.metric1Value },
            { label: props.metric2Label, value: props.metric2Value },
          ].filter(m => m.label).map(m => (
            <div key={m.label} className="rounded-lg px-2 py-1.5"
              style={{ background: 'var(--bg-container-high)', border: '1px solid var(--border-subtle)' }}>
              <div className="tech-label text-[8px] mb-0.5">{m.label}</div>
              <div className="text-[12px] font-medium font-num" style={{ color: 'var(--text-primary)' }}>{m.value || '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default {
  type: 'radialgauge',
  name: 'Круговой датчик',
  group: 'Данные',
  icon: IconGauge,
  realtime: true,
  defaultSize: { w: 3, h: 5 },
  minSize: { w: 2, h: 4 },
  defaultProps: {
    label: 'Эффективность', unit: '%', min: 0, max: 100,
    accent: 'var(--data-blue)', deltaText: '+2.4% /час',
    metric1Label: 'Тек. нагрузка', metric1Value: '142.5 кВт',
    metric2Label: 'Пик (оценка)', metric2Value: '160.0 кВт',
    channel: 'sensor.signal', wsUrl: '',
  },
  configSchema: [
    { key: 'label',        label: 'Подпись',        type: 'text'   },
    { key: 'unit',         label: 'Единица',         type: 'text'   },
    { key: 'min',          label: 'Мин',            type: 'number' },
    { key: 'max',          label: 'Макс',           type: 'number' },
    { key: 'accent',       label: 'Цвет',           type: 'color'  },
    { key: 'deltaText',    label: 'Дельта',         type: 'text'   },
    { key: 'metric1Label', label: 'Метрика 1',      type: 'text'  },
    { key: 'metric1Value', label: 'Значение 1',     type: 'text'  },
    { key: 'metric2Label', label: 'Метрика 2',      type: 'text'  },
    { key: 'metric2Value', label: 'Значение 2',     type: 'text'  },
    { key: 'channel', label: 'Канал WS', type: 'channel', bindsDataSource: true },
    { key: 'wsUrl',   label: 'URL WS',   type: 'url', placeholder: 'ws://host:8081', bindsDataSource: 'wsUrl' },
  ],
  Component: RadialGaugeWidget,
}
