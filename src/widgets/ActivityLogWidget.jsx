import { useEffect, useRef, useState } from 'react'
import { useRealtime } from '../core/useRealtime'
import { IconList } from './icons'

const SEVERITIES = {
  ok:      { color: 'var(--success)'  },
  success: { color: 'var(--success)'  },
  info:    { color: 'var(--data-blue)' },
  warn:    { color: 'var(--warning)'  },
  warning: { color: 'var(--warning)'  },
  error:   { color: 'var(--error)'    },
  idle:    { color: 'var(--text-muted)'    },
}

const DEFAULT_EVENTS = [
  { id: 1, severity: 'info',    text: 'Посетитель зарегистрирован · Зал А',              time: '09:12', source: 'Рег-01'     },
  { id: 2, severity: 'success', text: 'QR-код отсканирован · Стенд №12',                 time: '09:15', source: 'Стенд-12'   },
  { id: 3, severity: 'warning', text: 'Датчик движения · Зона Б · Высокая активность',   time: '09:18', source: 'СДВ-Б'      },
  { id: 4, severity: 'info',    text: 'Новый экспонат активирован · Секция 3',            time: '09:21', source: 'Секция-3'   },
  { id: 5, severity: 'success', text: 'Автоматическая резервная копия создана',           time: '09:24', source: 'Система'    },
  { id: 6, severity: 'info',    text: 'Обновление контента · Главный экран',              time: '09:27', source: 'CMS'        },
  { id: 7, severity: 'warning', text: 'HVAC · Превышен порог температуры (24.2°C)',      time: '09:30', source: 'Климат'     },
  { id: 8, severity: 'success', text: 'WebSocket переподключение · Стабильно',           time: '09:33', source: 'WS-Srv'     },
]

function ActivityLogWidget({ props, dataSource }) {
  const title = props.title || 'Системный журнал'
  const channel = dataSource?.channel
  const { value } = useRealtime(channel, { wsUrl: dataSource?.wsUrl })
  const [events, setEvents] = useState([])
  const seq = useRef(0)

  useEffect(() => {
    if (value == null || !channel) return
    seq.current += 1
    const v = typeof value === 'number' ? value.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) : String(value)
    const ev = {
      id: seq.current,
      severity: typeof value === 'number' && value > (Number(props.warnAbove) || Infinity) ? 'warning' : 'info',
      text: `${channel} → ${v}`,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source: channel.split('.')[0],
    }
    setEvents(prev => [ev, ...prev].slice(0, Number(props.maxEvents) || 20))
  }, [value, channel, props.maxEvents, props.warnAbove])

  const shown = events.length ? events : DEFAULT_EVENTS

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--text-muted)' }}>receipt_long</span>
          <span className="tech-label">{title}</span>
        </div>
        <span className="tech-label text-[9px]" style={{ color: 'var(--success)' }}>В ЭФИРЕ</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
        {shown.map((ev, i) => {
          const sev = SEVERITIES[ev.severity] || SEVERITIES.idle
          return (
            <div key={ev.id} className="flex gap-2.5 items-start" style={{ opacity: Math.max(0.4, 1 - i * 0.06) }}>
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: sev.color }} />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {ev.text}
                </div>
                <div className="flex gap-2 mt-0.5">
                  <span className="tech-label text-[9px]" style={{ color: 'var(--text-muted)' }}>{ev.time}</span>
                  <span className="tech-label text-[9px]" style={{ color: 'var(--text-muted)' }}>• {ev.source}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default {
  type: 'activitylog',
  name: 'Журнал событий',
  group: 'Мониторинг',
  icon: IconList,
  realtime: true,
  defaultSize: { w: 4, h: 5 },
  minSize: { w: 3, h: 3 },
  defaultProps: { title: 'Системный журнал', maxEvents: 20, warnAbove: '', channel: 'metric.errors', wsUrl: '' },
  configSchema: [
    { key: 'title', label: 'Заголовок', type: 'text' },
    { key: 'maxEvents', label: 'Макс. событий', type: 'number' },
    { key: 'warnAbove', label: 'Порог предупреждения', type: 'number' },
    { key: 'channel', label: 'Канал данных', type: 'channel', bindsDataSource: true },
    { key: 'wsUrl', label: 'URL WebSocket', type: 'url', placeholder: 'ws://host:8081', bindsDataSource: 'wsUrl' },
  ],
  Component: ActivityLogWidget,
}
