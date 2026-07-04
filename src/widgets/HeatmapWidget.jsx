import { IconImage } from './icons'

function HeatmapWidget({ props }) {
  const title  = props.title  || 'Тепловая карта посещаемости'
  const status = props.status || 'Системы в норме'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--data-blue)' }}>view_in_ar</span>
          <span className="tech-label">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-live">LIVE</span>
        </div>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden min-h-0"
        style={{ background: 'var(--heatmap-bg)', border: '1px solid var(--border-subtle)' }}>
        <svg viewBox="0 0 500 340" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="hm-zone-a" cx="38%" cy="48%" r="22%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.85"/>
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="hm-zone-b" cx="65%" cy="55%" r="18%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.75"/>
              <stop offset="50%" stopColor="#2DD4BF" stopOpacity="0.28"/>
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="hm-zone-c" cx="52%" cy="35%" r="14%">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.6"/>
              <stop offset="60%" stopColor="#22C55E" stopOpacity="0.18"/>
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="hm-zone-d" cx="22%" cy="62%" r="13%">
              <stop offset="0%" stopColor="#EAB308" stopOpacity="0.55"/>
              <stop offset="60%" stopColor="#EAB308" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#EAB308" stopOpacity="0"/>
            </radialGradient>
            <filter id="hm-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="10"/>
            </filter>
            <filter id="hm-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <g transform="translate(250,170)">
            <polygon points="-200,0 0,-100 200,0 0,100"
              fill="var(--heatmap-floor)" stroke="var(--heatmap-line-strong)" strokeWidth="1"/>

            {[-150,-100,-50,0,50,100,150].map((offset,i) => (
              <line key={`gx${i}`}
                x1={offset*0.95-200*0.05} y1={offset*0.5+100*0.05}
                x2={offset*0.95+200*0.05} y2={offset*0.5-100*0.05}
                stroke="var(--heatmap-line)" strokeWidth="0.5"/>
            ))}
            {[-150,-100,-50,0,50,100,150].map((offset,i) => (
              <line key={`gy${i}`}
                x1={-200+offset*0.05} y1={offset*0.5}
                x2={200+offset*0.05} y2={offset*0.5-100}
                stroke="var(--heatmap-line)" strokeWidth="0.5"/>
            ))}

            <polygon points="-200,0 -200,60 0,160 0,100"
              fill="var(--heatmap-wall)" stroke="var(--heatmap-line-strong)" strokeWidth="0.5"/>
            <polygon points="200,0 200,60 0,160 0,100"
              fill="var(--heatmap-wall)" stroke="var(--heatmap-line)" strokeWidth="0.5"/>

            <line x1="-200" y1="0" x2="0" y2="-100" stroke="var(--heatmap-line-strong)" strokeWidth="1"/>
            <line x1="200" y1="0" x2="0" y2="-100" stroke="var(--heatmap-line-strong)" strokeWidth="1"/>
            <line x1="-200" y1="0" x2="0" y2="100" stroke="var(--heatmap-line-strong)" strokeWidth="1"/>
            <line x1="200" y1="0" x2="0" y2="100" stroke="var(--heatmap-line-strong)" strokeWidth="1"/>
            <line x1="-200" y1="60" x2="0" y2="160" stroke="var(--heatmap-line-strong)" strokeWidth="0.5"/>
            <line x1="200" y1="60" x2="0" y2="160" stroke="var(--heatmap-line-strong)" strokeWidth="0.5"/>
          </g>

          <g filter="url(#hm-blur)" opacity="0.9">
            <ellipse cx="192" cy="180" rx="88" ry="45" fill="url(#hm-zone-a)" transform="skewX(-25)"/>
            <ellipse cx="318" cy="195" rx="70" ry="38" fill="url(#hm-zone-b)" transform="skewX(-22)"/>
            <ellipse cx="258" cy="148" rx="55" ry="30" fill="url(#hm-zone-c)" transform="skewX(-20)"/>
            <ellipse cx="140" cy="218" rx="50" ry="28" fill="url(#hm-zone-d)" transform="skewX(-25)"/>
          </g>

          <g filter="url(#hm-glow)">
            <text x="188" y="182" fill="var(--heatmap-label)" fontSize="8" fontFamily="Roboto,sans-serif"
              textAnchor="middle" opacity="0.9" transform="skewX(-12)">ЗАЛ А</text>
            <text x="315" y="196" fill="var(--heatmap-label)" fontSize="8" fontFamily="Roboto,sans-serif"
              textAnchor="middle" opacity="0.9" transform="skewX(-12)">ЗАЛ Б</text>
            <text x="255" y="150" fill="var(--heatmap-label)" fontSize="7" fontFamily="Roboto,sans-serif"
              textAnchor="middle" opacity="0.8" transform="skewX(-12)">ФОЙЕ</text>
            <text x="138" y="220" fill="var(--heatmap-label)" fontSize="7" fontFamily="Roboto,sans-serif"
              textAnchor="middle" opacity="0.7" transform="skewX(-12)">ВЫХОД</text>
          </g>

          {[[188,172,'#60A5FA'],[315,186,'#2DD4BF'],[255,142,'#22C55E'],[138,212,'#EAB308']].map(([cx,cy,c],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="5" fill={c} opacity="0.9" filter="url(#hm-glow)"/>
              <circle cx={cx} cy={cy} r="10" fill={c} opacity="0.15"/>
            </g>
          ))}
        </svg>

        <div className="absolute top-3 left-3">
          <span className="badge-live">{status}</span>
        </div>

        <div className="absolute bottom-3 right-3 flex gap-2">
          {[['#60A5FA','Высокая'],['#2DD4BF','Средняя'],['#EAB308','Низкая']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }}/>
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default {
  type: 'heatmap',
  name: 'Тепловая карта',
  group: 'Аналитика',
  icon: IconImage,
  defaultSize: { w: 8, h: 8 },
  minSize: { w: 4, h: 5 },
  defaultProps: {
    title: 'Тепловая карта посещаемости',
    zone: 'Зона А',
    status: 'Системы в норме',
    channel: 'metric.visitors', wsUrl: '',
  },
  configSchema: [
    { key: 'title',  label: 'Заголовок', type: 'text' },
    { key: 'zone',   label: 'Зона',      type: 'text' },
    { key: 'status', label: 'Статус',    type: 'text' },
  ],
  Component: HeatmapWidget
}
