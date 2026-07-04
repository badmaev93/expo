import { useRealtime } from '../core/useRealtime'
import { IconGauge } from './icons'

function GaugeWidget({ props, dataSource }) {
  const { value } = useRealtime(dataSource?.channel, { wsUrl: dataSource?.wsUrl })
  const min = Number(props.min ?? 0)
  const max = Number(props.max ?? 100)
  const v = typeof value === 'number' ? value : min
  const t = Math.max(0, Math.min(1, (v - min) / (max - min || 1)))

  const cx = 60, cy = 62, r = 48
  const startAngle = Math.PI
  const endAngle = 2 * Math.PI
  const ang = startAngle + (endAngle - startAngle) * t
  const pt = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  const [sx, sy] = pt(startAngle)
  const [ex, ey] = pt(endAngle)
  const [px, py] = pt(ang)
  const track = `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`
  const fill  = `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${px.toFixed(1)} ${py.toFixed(1)}`
  const color = props.color || 'var(--data-blue)'

  return (
    <div className="flex h-full flex-col items-center justify-between py-1">
      <span className="tech-label">{props.label}</span>
      <svg viewBox="0 0 120 76" className="w-full max-w-[200px]">
        <path d={track} fill="none" stroke="var(--border-subtle)" strokeWidth="10" strokeLinecap="round"/>
        <path d={fill} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16,1,0.3,1)' }}/>
        <circle cx={px} cy={py} r="4" fill={color}/>
      </svg>
      <div className="-mt-6 flex flex-col items-center gap-0.5">
        <div className="leading-none" style={{ color, fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {typeof value === 'number' ? value.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) : '—'}
          {props.unit && <span className="ml-1 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{props.unit}</span>}
        </div>
        <div className="font-num flex w-full max-w-[180px] justify-between px-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span>{min}</span><span>{max}</span>
        </div>
      </div>
    </div>
  )
}

export default {
  type: 'gauge',
  name: 'Датчик',
  group: 'Данные',
  icon: IconGauge,
  realtime: true,
  defaultSize: { w: 3, h: 4 },
  minSize: { w: 2, h: 3 },
  defaultProps: { label: 'Температура', unit: '°C', min: 0, max: 50, color: '', channel: 'sensor.temp', wsUrl: '' },
  configSchema: [
    { key: 'label', label: 'Подпись', type: 'text' },
    { key: 'unit', label: 'Единица', type: 'text' },
    { key: 'min', label: 'Мин', type: 'number' },
    { key: 'max', label: 'Макс', type: 'number' },
    { key: 'color', label: 'Цвет', type: 'color' },
    { key: 'channel', label: 'Канал данных', type: 'channel', bindsDataSource: true },
    { key: 'wsUrl', label: 'URL WebSocket', type: 'url', placeholder: 'ws://host:8081', bindsDataSource: 'wsUrl' }
  ],
  Component: GaugeWidget
}
