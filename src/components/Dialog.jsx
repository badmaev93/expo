export default function Dialog({ title, message, actions, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 glass-strong"
        style={{ boxShadow: 'var(--glass-inset), 0 24px 64px rgba(0,0,0,0.25)' }}>
        <div>
          <h3 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          {message && <p className="mt-1.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>{message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          {actions.map((a, i) => (
            <button key={i} onClick={a.action}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all"
              style={a.primary
                ? { background: 'var(--accent-dim)', color: '#fff', boxShadow: '0 0 12px color-mix(in srgb, var(--accent) 40%, transparent)' }
                : a.danger
                ? { background: 'rgba(239,68,68,0.12)', color: 'var(--error-text)', border: '1px solid rgba(239,68,68,0.2)' }
                : { background: 'var(--bg-container)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }
              }
              onMouseEnter={e => !a.primary && !a.danger && (e.currentTarget.style.background = 'var(--bg-container-high)')}
              onMouseLeave={e => !a.primary && !a.danger && (e.currentTarget.style.background = 'var(--bg-container)')}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
