import { useEffect, useState } from 'react'
import { IconClock } from './icons'

function ClockWidget({ props }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const opts = { hour: '2-digit', minute: '2-digit', second: '2-digit' }
  const time = now.toLocaleTimeString('ru-RU', { ...opts, hour12: false, ...(props.tz === 'UTC' ? { timeZone: 'UTC' } : {}) })
  const date = now.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short', ...(props.tz === 'UTC' ? { timeZone: 'UTC' } : {}) })

  return (
    <div className="flex h-full flex-col items-start justify-center gap-0.5 overflow-hidden">
      {props.label && (
        <span className="tech-label">{props.label}</span>
      )}
      <span className="font-num font-bold tabular-nums leading-none"
        style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.1rem, 5cqw, 1.8rem)' }}>{time}</span>
      <span className="text-[11px] capitalize truncate" style={{ color: 'var(--text-muted)' }}>{date}</span>
    </div>
  )
}

export default {
  type: 'clock',
  name: 'Часы',
  group: 'Медиа',
  icon: IconClock,
  defaultSize: { w: 3, h: 2 },
  minSize: { w: 2, h: 1 },
  defaultProps: { label: 'Время', tz: 'local', channel: 'sensor.temp', wsUrl: '' },
  configSchema: [
    { key: 'label', label: 'Подпись', type: 'text' },
    { key: 'tz', label: 'Часовой пояс', type: 'select', options: [{ value: 'local', label: 'Местный' }, { value: 'UTC', label: 'UTC' }] }
  ],
  Component: ClockWidget
}
