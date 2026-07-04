import { useEffect, useRef, useState } from 'react'
import Canvas from './Canvas'
import PerfBadge from './PerfBadge'

const noop = () => {}

function KioskView({ config, initialPageId, onExit }) {
  const pages = config.pages || []
  const [pageId, setPageId] = useState(() => initialPageId || pages[0]?.id || null)
  const page = pages.find(p => p.id === pageId) || pages[0]

  const [chromeVisible, setChromeVisible] = useState(true)
  const hideTimer = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onExit()
    window.addEventListener('keydown', onKey)
    document.documentElement.requestFullscreen?.().catch(() => {})
    return () => {
      window.removeEventListener('keydown', onKey)
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    }
  }, [onExit])

  useEffect(() => {
    const poke = () => {
      setChromeVisible(true)
      clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setChromeVisible(false), 3000)
    }
    poke()
    window.addEventListener('mousemove', poke)
    window.addEventListener('touchstart', poke)
    return () => {
      clearTimeout(hideTimer.current)
      window.removeEventListener('mousemove', poke)
      window.removeEventListener('touchstart', poke)
    }
  }, [])

  if (!page) return (
    <div className="flex min-h-[100dvh] items-center justify-center canvas-grid-bg">
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Нет страниц для показа</span>
    </div>
  )

  const measureKey = `kiosk:${page.id}:${page.widgets.length}`

  return (
    <div className="relative min-h-[100dvh] canvas-grid-bg p-4">
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 transition-opacity duration-500"
        style={{ opacity: chromeVisible ? 1 : 0, pointerEvents: chromeVisible ? 'auto' : 'none' }}>
        <div className="rounded-md glass-strong"><PerfBadge count={page.widgets.length} measureKey={measureKey} /></div>
        <button onClick={onExit}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs glass-strong transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          title="Выход (Esc)">
          <span className="material-symbols-outlined text-[14px]">close_fullscreen</span>
          Выйти
        </button>
      </div>

      {pages.length > 1 && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-2 py-1.5 glass-strong transition-opacity duration-500"
          style={{ opacity: chromeVisible ? 1 : 0, pointerEvents: chromeVisible ? 'auto' : 'none' }}>
          {pages.map(p => (
            <button key={p.id} onClick={() => setPageId(p.id)} title={p.name}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: p.id === page.id ? 20 : 10,
                background: p.id === page.id ? 'var(--accent)' : 'var(--border-subtle)',
              }} />
          ))}
        </div>
      )}

      <Canvas
        config={page}
        setConfig={noop}
        selectedId={null}
        setSelectedId={noop}
        editable={false}
      />
    </div>
  )
}

export default KioskView
