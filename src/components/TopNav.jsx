import { useState, useRef, useEffect } from 'react'
import { useWsStatus } from '../core/useRealtime'
import PerfBadge from './PerfBadge'
import Notifications from './Notifications'

function SettingsMenu({ onLayouts, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const row = (icon, label, action) => (
    <button onClick={() => { action?.(); setOpen(false) }}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-container)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}>
      <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--text-muted)' }}>{icon}</span>
      <span className="flex-1 font-medium">{label}</span>
    </button>
  )

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
        style={{
          color: open ? 'var(--accent-text)' : 'var(--text-secondary)',
          background: open ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : '',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'var(--bg-container)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = open ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : '' }}>
        <span className="material-symbols-outlined text-[18px]">settings</span>
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl p-1.5 glass-strong">
          {row(theme === 'dark' ? 'light_mode' : 'dark_mode', theme === 'dark' ? 'Светлая тема' : 'Тёмная тема', onToggleTheme)}

          <div className="my-1 h-px" style={{ background: 'var(--border-subtle)' }} />
          {row('dashboard_customize', 'Шаблоны раскладки', onLayouts)}

          <div className="my-1 h-px" style={{ background: 'var(--border-subtle)' }} />
          {row('info', 'О программе', () => window.open('https://github.com/badmaev93/expo', '_blank', 'noopener'))}
        </div>
      )}
    </div>
  )
}

function WsIndicator({ live, status }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 cursor-default"
      style={{ borderLeft: '1px solid var(--border-subtle)' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className={`h-2 w-2 rounded-full shrink-0 ${live ? 'animate-pulse' : ''}`}
        style={{ background: live ? 'var(--success)' : 'var(--text-muted)' }} />
      <span className="text-[11px] font-medium hidden sm:inline"
        style={{ color: live ? 'var(--success)' : 'var(--text-muted)' }}>
        {live ? 'В эфире' : status === 'connecting' ? '…' : 'Откл'}
      </span>
      {show && (
        <div className="absolute top-full right-0 mt-1.5 rounded-lg px-3 py-1.5 text-[11px] whitespace-nowrap z-50 glass-strong"
          style={{ color: 'var(--text-secondary)' }}>
          WebSocket: {live ? 'подключено' : status === 'connecting' ? 'подключение…' : 'отключено'}
        </div>
      )}
    </div>
  )
}

const Sep = () => <div className="h-5 w-px mx-1" style={{ background: 'var(--border-subtle)' }} />

function TopNav({
  widgetCount, measureKey,
  canUndo, canRedo, onUndo, onRedo,
  onLayouts, onKiosk,
  theme, onToggleTheme,
  searchQuery, onSearch, searchResults, onPickResult,
  watchChannels,
}) {
  const status = useWsStatus()
  const live = status === 'open'

  const iconBtn = (icon, action, disabled, title) => (
    <button onClick={action} disabled={disabled} title={title}
      className="flex h-8 w-8 items-center justify-center rounded-lg transition-all disabled:opacity-30"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 10%, var(--bg-container))' }}
      onMouseLeave={e => e.currentTarget.style.background = ''}>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  )

  const btnGroup = (children) => (
    <div className="flex items-center gap-0.5 rounded-xl p-0.5"
      style={{ background: 'var(--bg-container)', border: '1px solid var(--border-subtle)' }}>
      {children}
    </div>
  )

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-4 z-40"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        borderBottom: '1px solid var(--glass-border)',
      }}>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
          style={{ background: 'var(--accent-dim)' }}>
          <span className="material-symbols-outlined text-white text-[17px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>layers</span>
        </div>
        <span className="hidden lg:block text-[12px] font-black uppercase"
          style={{ color: 'var(--accent-text)', letterSpacing: '0.1em' }}>
          ЭКСПО
        </span>
      </div>

      <Sep />

      {btnGroup(<>
        {iconBtn('undo', onUndo, !canUndo, 'Отмена Ctrl+Z')}
        {iconBtn('redo', onRedo, !canRedo, 'Повтор Ctrl+Y')}
      </>)}

      <div className="flex-1" />

      <div className="relative hidden md:flex items-center">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none"
          style={{ color: 'var(--text-muted)' }}>search</span>
        <input
          value={searchQuery || ''}
          onChange={e => onSearch?.(e.target.value)}
          placeholder="Поиск виджетов на холсте…"
          className="w-64 rounded-full py-1.5 pl-8 pr-3 text-[13px] outline-none transition-all"
          style={{ background: 'var(--bg-container)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        />
        {searchQuery && (
          <button onClick={() => onSearch?.('')} className="absolute right-2 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        )}
        {searchQuery && (
          <div className="absolute top-full right-0 mt-1.5 w-72 max-h-72 overflow-y-auto rounded-xl p-1.5 z-50 glass-strong">
            {searchResults?.length ? searchResults.map(r => (
              <button key={r.id} onMouseDown={e => { e.preventDefault(); onPickResult?.(r.id) }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-container)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <span className="material-symbols-outlined text-[15px]" style={{ color: 'var(--text-muted)' }}>widgets</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</span>
                  <span className="block truncate text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.typeName}</span>
                </span>
              </button>
            )) : (
              <div className="px-3 py-3 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>Ничего не найдено</div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-container)', border: '1px solid var(--border-subtle)' }}>
        <PerfBadge count={widgetCount} measureKey={measureKey} />
        <WsIndicator live={live} status={status} />
      </div>

      <button onClick={onKiosk}
        className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-bold text-white transition-all hover:brightness-110"
        style={{ background: 'var(--accent-dim)' }}>
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
        <span className="hidden sm:inline">Просмотр</span>
      </button>

      <Notifications channels={watchChannels || []} />

      <SettingsMenu onLayouts={onLayouts} theme={theme} onToggleTheme={onToggleTheme} />
    </header>
  )
}

export default TopNav
