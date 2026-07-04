import { useEffect, useState } from 'react'
import { useRealtime } from '../core/useRealtime'
import { IconChart } from './icons'

const NODES = [
  { id: 'gw',    x: 250, y: 40,  r: 14, kind: 'router', label: 'Шлюз',        ip: '10.0.0.1'  },
  { id: 'core',  x: 250, y: 130, r: 12, kind: 'switch', label: 'Коммутатор',  ip: '10.0.0.2'  },
  { id: 'srv1',  x: 90,  y: 130, r: 11, kind: 'server', label: 'Сервер-01',   ip: '10.0.1.10' },
  { id: 'srv2',  x: 410, y: 130, r: 11, kind: 'server', label: 'Сервер-02',   ip: '10.0.1.11' },
  { id: 'wifi',  x: 120, y: 225, r: 10, kind: 'wifi',   label: 'Wi-Fi Зал А', ip: '10.0.2.1'  },
  { id: 'kiosk', x: 250, y: 235, r: 10, kind: 'screen', label: 'Экраны ×6',   ip: '10.0.3.x'  },
  { id: 'sens',  x: 380, y: 225, r: 10, kind: 'sensor', label: 'Датчики ×32', ip: '10.0.4.x'  },
]

const EDGES = [
  { from: 'gw',   to: 'core',  main: true  },
  { from: 'core', to: 'srv1',  main: true  },
  { from: 'core', to: 'srv2',  main: true  },
  { from: 'core', to: 'wifi',  main: false },
  { from: 'core', to: 'kiosk', main: false },
  { from: 'core', to: 'sens',  main: false },
]

const KIND_ICON = {
  router: 'router', switch: 'lan', server: 'dns',
  wifi: 'wifi', screen: 'monitor', sensor: 'sensors',
}

const NODE_MAP = Object.fromEntries(NODES.map(n => [n.id, n]))

function jitter(base, spread) {
  return Math.round((base + (Math.random() - 0.5) * spread) * 10) / 10
}

function NetworkTopologyWidget({ props, dataSource }) {
  const title = props.title || 'Топология сети'
  const { value: traffic } = useRealtime(dataSource?.channel, { wsUrl: dataSource?.wsUrl })

  const [stats, setStats] = useState(() =>
    Object.fromEntries(NODES.map(n => [n.id, { ping: jitter(6, 6), load: jitter(40, 30), up: true }]))
  )
  useEffect(() => {
    const t = setInterval(() => {
      setStats(prev => Object.fromEntries(Object.entries(prev).map(([id, s]) => [id, {
        ping: Math.max(1, jitter(s.ping, 4)),
        load: Math.min(98, Math.max(4, jitter(s.load, 12))),
        up: id === 'sens' ? Math.random() > 0.06 : true,
      }])))
    }, 3000)
    return () => clearInterval(t)
  }, [])

  const online = NODES.filter(n => stats[n.id]?.up).length
  const avgPing = (NODES.reduce((a, n) => a + (stats[n.id]?.ping || 0), 0) / NODES.length).toFixed(1)
  const mbps = typeof traffic === 'number' ? traffic.toFixed(1) : '—'

  const statusColor = s => !s?.up ? 'var(--error)' : s.load > 80 ? 'var(--warning)' : 'var(--success)'

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-2 shrink-0">
        <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--accent-text)' }}>hub</span>
        <span className="tech-label">{title}</span>
        <div className="ml-auto flex gap-3">
          {[
            { color: 'var(--success)', label: 'В сети' },
            { color: 'var(--warning)', label: 'Нагрузка' },
            { color: 'var(--error)',   label: 'Сбой' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} />
              <span className="text-[9px] tech-label">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden min-h-0"
        style={{ background: 'var(--bg-container)', border: '1px solid var(--border-subtle)' }}>
        <svg viewBox="0 0 500 290" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {EDGES.map((e, i) => {
            const a = NODE_MAP[e.from], b = NODE_MAP[e.to]
            const down = !stats[e.to]?.up
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={down ? 'var(--error)' : 'var(--accent)'}
                  strokeWidth={e.main ? 1.6 : 1}
                  strokeOpacity={down ? 0.5 : 0.3}
                  strokeDasharray={down ? '3 4' : 'none'} />
                {!down && (
                  <circle r={e.main ? 2.4 : 1.8} fill="var(--accent)" opacity="0.85">
                    <animateMotion dur={`${2.2 + i * 0.4}s`} repeatCount="indefinite"
                      path={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} />
                  </circle>
                )}
              </g>
            )
          })}

          {NODES.map(n => {
            const s = stats[n.id]
            const c = statusColor(s)
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={n.r + 5} fill={c} fillOpacity="0.08" />
                <circle cx={n.x} cy={n.y} r={n.r} fill="var(--bg-widget)" stroke={c} strokeWidth="1.5" />
                <text x={n.x} y={n.y + n.r * 0.38} textAnchor="middle" fontSize={n.r}
                  fill={c} fontFamily="Material Symbols Outlined">{KIND_ICON[n.kind]}</text>
                <text x={n.x} y={n.y - n.r - 7} textAnchor="middle" fontSize="9.5" fontWeight="600"
                  fill="var(--text-primary)" fontFamily="Roboto, sans-serif">{n.label}</text>
                <text x={n.x} y={n.y + n.r + 12} textAnchor="middle" fontSize="7.5"
                  fill="var(--text-muted)" fontFamily="Roboto Mono, monospace">
                  {s?.up ? `${n.ip} · ${s.ping} мс` : 'нет связи'}
                </text>
                {n.kind === 'server' && s?.up && (
                  <>
                    <rect x={n.x - 16} y={n.y + n.r + 17} width="32" height="3" rx="1.5" fill="var(--border-subtle)" />
                    <rect x={n.x - 16} y={n.y + n.r + 17} width={32 * (s.load / 100)} height="3" rx="1.5" fill={c} />
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 shrink-0">
        {[
          { label: 'Узлов в сети', val: `${online}/${NODES.length}`, color: online === NODES.length ? 'var(--success)' : 'var(--warning)' },
          { label: 'Ср. задержка', val: `${avgPing} мс`, color: 'var(--text-primary)' },
          { label: 'Трафик', val: `${mbps} Мбит/с`, color: 'var(--accent-text)' },
        ].map(m => (
          <div key={m.label} className="rounded-lg px-2 py-1.5"
            style={{ background: 'var(--bg-container)', border: '1px solid var(--border-subtle)' }}>
            <div className="tech-label text-[8px]">{m.label}</div>
            <div className="font-num text-[13px] font-semibold" style={{ color: m.color }}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default {
  type: 'network',
  name: 'Топология сети',
  group: 'Мониторинг',
  icon: IconChart,
  realtime: true,
  defaultSize: { w: 6, h: 6 },
  minSize: { w: 4, h: 4 },
  defaultProps: { title: 'Топология сети', channel: 'chart.network', wsUrl: '' },
  configSchema: [
    { key: 'title', label: 'Заголовок', type: 'text' },
    { key: 'channel', label: 'Канал трафика', type: 'channel', bindsDataSource: true },
    { key: 'wsUrl', label: 'URL WebSocket', type: 'url', placeholder: 'ws://host:8081', bindsDataSource: 'wsUrl' },
  ],
  Component: NetworkTopologyWidget,
}
