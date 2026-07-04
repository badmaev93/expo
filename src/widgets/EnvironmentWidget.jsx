import { useRealtime } from '../core/useRealtime'
import { IconGauge } from './icons'

function EnvironmentWidget({ props, dataSource }) {
  const wsUrl = dataSource?.wsUrl
  const { value: temp }     = useRealtime('sensor.temp',     { wsUrl })
  const { value: humidity } = useRealtime('sensor.humidity', { wsUrl })
  const { value: co2 }      = useRealtime('sensor.co2',      { wsUrl })
  const { value: noise }    = useRealtime('sensor.noise',    { wsUrl })
  const { value: aqi }      = useRealtime('sensor.aqi',      { wsUrl })
  const accent = props.accent || 'var(--data-blue)'
  const label  = props.label  || 'Окружающая среда'

  const row = (icon, name, value, unit, color) => (
    <div key={name} className="flex items-center justify-between py-1.5"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px]" style={{ color: color || 'var(--text-muted)' }}>{icon}</span>
        <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{name}</span>
      </div>
      <span className="font-num text-[12px] font-semibold" style={{ color: color || 'var(--text-primary)' }}>
        {value != null ? `${typeof value === 'number' ? value.toFixed(1) : value}${unit ? ' ' + unit : ''}` : '—'}
      </span>
    </div>
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 shrink-0 mb-3">
        <span className="material-symbols-outlined text-[14px]" style={{ color: accent }}>eco</span>
        <span className="tech-label">{label}</span>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        {row('thermostat', 'Температура', temp, '°C', temp > 26 ? 'var(--warning)' : 'var(--data-blue)')}
        {row('water_drop', 'Влажность',   humidity, '%', null)}
        {row('air',        'CO₂',         co2, 'ppm', typeof co2 === 'number' && co2 > 800 ? 'var(--warning)' : 'var(--success)')}
        {row('volume_up',  'Шум',         noise, 'дБ', typeof noise === 'number' && noise > 70 ? 'var(--warning)' : null)}
        {aqi != null ? row('air_quality', 'AQI', aqi, '', typeof aqi === 'number' && aqi < 25 ? 'var(--success)' : 'var(--warning)') : null}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }}/>
          <span className="text-[10px]" style={{ color: 'var(--success)' }}>HVAC · Авто</span>
        </div>
      </div>
    </div>
  )
}

export default {
  type: 'environment',
  name: 'Окружающая среда',
  group: 'Датчики',
  icon: IconGauge,
  realtime: true,
  defaultSize: { w: 3, h: 4 },
  minSize: { w: 2, h: 3 },
  defaultProps: { label: 'Микроклимат', accent: 'var(--data-blue)', channel: 'sensor.temp', wsUrl: '' },
  configSchema: [
    { key: 'label',  label: 'Подпись',     type: 'text'  },
    { key: 'accent', label: 'Цвет акцента', type: 'color' },
  ],
  Component: EnvironmentWidget,
}
