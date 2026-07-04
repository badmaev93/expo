import { PRESETS, buildThumb } from '../core/layouts'

function Thumb({ preset }) {
  const { W, H, rects } = buildThumb(preset.items)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl"
      style={{ background: 'var(--bg-body)' }}>
      <defs>
        {rects.map((r, i) => (
          <linearGradient key={i} id={`tg${preset.id}${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={r.color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={r.color} stopOpacity="0.08" />
          </linearGradient>
        ))}
      </defs>
      {rects.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="4"
            fill={`url(#tg${preset.id}${i})`} />
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="4"
            fill="none" stroke={r.color} strokeWidth="0.8" strokeOpacity="0.7" />
          {r.w > 28 && r.h > 12 && (
            <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 3} textAnchor="middle"
              fill={r.color} fontSize="7" opacity="0.85" fontFamily="Roboto,sans-serif"
              fontWeight="600">
              {r.label.toUpperCase()}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

export default function LayoutPicker({ onApply, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onMouseDown={onClose}>
      <div className="relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl glass-strong"
        onMouseDown={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--glass-border)' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--accent-text)' }}>dashboard_customize</span>
              <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>Шаблоны раскладки</h2>
            </div>
            <p className="mt-0.5 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Виджеты текущей страницы будут заменены выбранным шаблоном
            </p>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
            style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="grid flex-1 grid-cols-4 gap-4 overflow-y-auto p-6"
          style={{ background: 'var(--bg-body)' }}>
          {PRESETS.map(preset => (
            <button key={preset.id} onClick={() => onApply(preset)}
              className="layout-card flex flex-col gap-2.5 rounded-xl p-3 text-left"
              style={{ background: 'var(--bg-container)', border: '1px solid var(--border-subtle)' }}>
              <Thumb preset={preset} />
              <div>
                <div className="layout-card-title text-[12px] font-semibold transition-colors"
                  style={{ color: 'var(--text-secondary)' }}>
                  {preset.name}
                </div>
                <div className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>{preset.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
