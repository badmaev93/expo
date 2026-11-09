import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../core/theme'
import TopNav from './TopNav'
import LeftPanel from './LeftPanel'
import Canvas from './Canvas'
import PropertiesPanel from './PropertiesPanel'
import LayoutPicker from './LayoutPicker'
import Dialog from './Dialog'
import { list as listPlugins, get as getPlugin, onChange as onRegistryChange } from '../core/registry'
import { makeWidget, uid, emptyConfig, emptyPage, demoConfig } from '../core/schema'
import { applyPreset } from '../core/layouts'
import * as storage from '../core/storage'
import * as clipboard from '../core/clipboard'

function DraggablePropsPanel({ selected, currentPage, onUpdate, onRemove, onPageChange, onClose, canvasRef }) {
  const [pos, setPos] = useState(null)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)
  const panelRef = useRef(null)

  useLayoutEffect(() => {
    if (!canvasRef?.current || !panelRef?.current) return
    const cr = canvasRef.current.getBoundingClientRect()
    const panelW = panelRef.current.offsetWidth || 320
    const panelH = panelRef.current.offsetHeight || 480
    const margin = 16

    const el = selected?.id ? canvasRef.current.querySelector(`[data-wid="${selected.id}"]`) : null
    if (!el) {
      setPos({ x: Math.max(margin, cr.width - panelW - margin), y: margin })
      return
    }
    const wr = el.getBoundingClientRect()
    const left = wr.left - cr.left
    const right = wr.right - cr.left
    const top = wr.top - cr.top

    let x
    if (right + margin + panelW <= cr.width - margin) x = right + margin
    else if (left - margin - panelW >= margin) x = left - margin - panelW
    else x = wr.left - cr.left < cr.width / 2 ? cr.width - panelW - margin : margin

    const y = Math.min(Math.max(margin, top), Math.max(margin, cr.height - panelH - margin))
    setPos({ x, y })
  }, [selected?.id])

  const onHandleMouseDown = e => {
    if (e.target.closest('button,input,select,textarea,a')) return
    e.preventDefault()
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos?.x ?? 16, py: pos?.y ?? 16 }
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    let frameId = null
    const onMove = e => {
      const d = dragStart.current
      if (!d) return

      if (frameId) cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        setPos({ x: d.px + e.clientX - d.mx, y: d.py + e.clientY - d.my })
        frameId = null
      })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [dragging])

  useEffect(() => {
    const onDown = e => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [onClose])

  const x = pos?.x ?? 16
  const y = pos?.y ?? 16

  return (
    <>
      <div
        ref={panelRef}
        className="absolute z-40 w-80 rounded-2xl overflow-hidden flex flex-col"
        style={{
          left: x, top: y,
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0px 8px 30px rgba(0,0,0,0.08), 0 0 0 1px var(--border-subtle)',
          maxHeight: 'calc(100% - 32px)',
          cursor: dragging ? 'grabbing' : 'default',
          userSelect: dragging ? 'none' : undefined,
          visibility: pos ? 'visible' : 'hidden',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        <div
          className="relative flex items-center justify-center h-10 shrink-0 cursor-grab active:cursor-grabbing"
          style={{ background: 'var(--bg-container)', borderBottom: '1px solid var(--border-subtle)' }}
          onMouseDown={onHandleMouseDown}
        >
          <div className="w-8 h-1 rounded-full" style={{ background: 'var(--text-muted)', opacity: 0.4 }} />
          <button
            onMouseDown={e => { e.stopPropagation(); onClose() }}
            title="Закрыть (Esc)"
            className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.09]"
            style={{ color: 'var(--text-secondary)' }}>
            <span className="material-symbols-outlined text-[20px] pointer-events-none">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <PropertiesPanel
            widget={selected}
            page={!selected ? currentPage : null}
            onChange={onUpdate}
            onRemove={onRemove}
            onPageChange={onPageChange}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  )
}

function Editor({ config, setConfig, undo, redo, canUndo, canRedo, onKiosk }) {
  const [selectedId, setSelectedId] = useState(null)
  const [currentPageId, setCurrentPageId] = useState(() => config.pages?.[0]?.id || null)
  const [pluginVersion, setPluginVersion] = useState(0)
  const [showLayouts, setShowLayouts] = useState(false)
  const [leftTab, setLeftTab] = useState(null)
  const [showProps, setShowProps] = useState(false)
  const [dialog, setDialog] = useState(null)
  const { theme, toggle: toggleTheme } = useTheme()
  const canvasAreaRef = useRef(null)

  useEffect(() => onRegistryChange(() => setPluginVersion(v => v + 1)), [])
  const allPlugins = useMemo(() => listPlugins(), [pluginVersion])

  const currentPage = useMemo(
    () => config.pages.find(p => p.id === currentPageId) || config.pages[0],
    [config.pages, currentPageId]
  )

  const watchChannels = useMemo(() => {
    if (!currentPage) return []
    const seen = new Set()
    return currentPage.widgets
      .filter(w => w.dataSource?.channel)
      .filter(w => { const k = w.dataSource.channel; if (seen.has(k)) return false; seen.add(k); return true })
      .map(w => ({
        channel: w.dataSource.channel,
        widget: w.props?.title || w.props?.label || getPlugin(w.type)?.name || w.type,
      }))
  }, [currentPage])

  useEffect(() => {
    if (!config.pages.find(p => p.id === currentPageId)) {
      setCurrentPageId(config.pages[0]?.id || null)
      setSelectedId(null)
    }
  }, [config.pages, currentPageId])

  const openProps = useCallback((id) => { setSelectedId(id); setShowProps(true) }, [])

  useEffect(() => {
    if (!leftTab) return
    const onDown = e => {
      const panel = document.querySelector('.panel-slide-left.open')
      const rail = document.querySelector('nav[data-rail]')
      if (panel && !panel.contains(e.target) && rail && !rail.contains(e.target)) {
        setLeftTab(null)
      }
    }
    document.addEventListener('mousedown', onDown, true)
    return () => document.removeEventListener('mousedown', onDown, true)
  }, [leftTab])

  const setPage = useCallback((updater) => {
    const pid = currentPage?.id
    setConfig(proj => ({
      ...proj,
      pages: proj.pages.map(p => p.id === pid ? (typeof updater === 'function' ? updater(p) : updater) : p)
    }))
  }, [setConfig, currentPage?.id])

  const selected = currentPage?.widgets.find(w => w.id === selectedId) || null

  const addWidget = useCallback((type) => {
    const w = makeWidget(type, 0, 0)
    setPage(page => ({ ...page, widgets: [...page.widgets, w] }))
    setSelectedId(w.id)
  }, [setPage])

  const removeWidget = useCallback((id) => {
    setPage(page => ({ ...page, widgets: page.widgets.filter(w => w.id !== id) }))
    setSelectedId(sel => sel === id ? null : sel)
    if (selectedId === id) setShowProps(false)
  }, [setPage, selectedId])

  const updateSelected = useCallback((updater) => {
    setPage(page => ({ ...page, widgets: page.widgets.map(w => w.id === selectedId ? updater(w) : w) }))
  }, [setPage, selectedId])

  const duplicateWidget = useCallback((id) => {
    setPage(page => {
      const w = page.widgets.find(x => x.id === id)
      if (!w) return page
      const copy = { ...structuredClone(w), id: uid(), layout: { ...w.layout, x: Math.min(w.layout.x + 1, 10), y: w.layout.y + 1 } }
      setSelectedId(copy.id)
      return { ...page, widgets: [...page.widgets, copy] }
    })
  }, [setPage])

  const addPage = useCallback(() => {
    const page = emptyPage(`Страница ${config.pages.length + 1}`)
    setConfig(proj => ({ ...proj, pages: [...proj.pages, page] }))
    setCurrentPageId(page.id)
    setSelectedId(null)
  }, [setConfig, config.pages.length])

  const deletePage = useCallback((pageId) => {
    if (config.pages.length <= 1) return
    const idx = config.pages.findIndex(p => p.id === pageId)
    setConfig(proj => ({ ...proj, pages: proj.pages.filter(p => p.id !== pageId) }))
    if (currentPageId === pageId) {
      setCurrentPageId(config.pages[Math.max(0, idx - 1)]?.id || config.pages[0]?.id)
      setSelectedId(null)
    }
  }, [setConfig, config.pages, currentPageId])

  const renamePage = useCallback((pageId, name) => {
    setConfig(proj => ({ ...proj, pages: proj.pages.map(p => p.id === pageId ? { ...p, name } : p) }))
  }, [setConfig])

  const applyLayout = useCallback((preset) => {
    const newPage = applyPreset(preset)
    const pid = currentPage?.id
    setConfig(proj => ({ ...proj, pages: proj.pages.map(p => p.id === pid ? { ...newPage, id: pid, name: p.name } : p) }))
    setSelectedId(null)
    setShowLayouts(false)
    flash('Шаблон применён')
  }, [setConfig, currentPage?.id])

  const handleImport = async () => {
    try {
      const cfg = await storage.importFile()
      setConfig(cfg)
      setCurrentPageId(cfg.pages?.[0]?.id || null)
      setSelectedId(null)
    } catch (e) { alert(e.message) }
  }

  const handleNew = () => {
    if (canUndo) {
      setDialog({
        title: 'Создать новый проект?',
        message: 'Несохранённые изменения будут потеряны.',
        actions: [
          { label: 'Отмена', action: () => setDialog(null) },
          { label: 'Загрузить демо', action: () => {
            const d = demoConfig()
            setConfig(d); setCurrentPageId(d.pages[0].id); setSelectedId(null); setDialog(null)
          }},
          { label: 'Новый пустой', danger: true, action: () => {
            const c = emptyConfig()
            setConfig(c); setCurrentPageId(c.pages[0].id); setSelectedId(null); setDialog(null)
          }},
        ]
      })
    } else {
      const c = emptyConfig(); setConfig(c); setCurrentPageId(c.pages[0].id); setSelectedId(null)
    }
  }

  const actRef = useRef({})
  useEffect(() => { actRef.current = { selectedId, selected, undo, redo, setPage, setSelectedId, duplicateWidget, removeWidget } })

  useEffect(() => {
    const onKey = e => {
      const a = actRef.current
      const inInput = ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)
      if (e.key === 'Escape') { a.setSelectedId(null); setShowProps(false); return }
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); a.undo(); return }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); a.redo(); return }
      if (inInput) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && a.selectedId) { e.preventDefault(); a.removeWidget(a.selectedId); return }
      if (mod && e.key === 'c' && a.selected) { e.preventDefault(); clipboard.copy(a.selected); return }
      if (mod && e.key === 'v') { const w = clipboard.paste(); if (w) { e.preventDefault(); a.setPage(p => ({ ...p, widgets: [...p.widgets, w] })); a.setSelectedId(w.id) }; return }
      if (mod && e.key === 'd' && a.selectedId) { e.preventDefault(); a.duplicateWidget(a.selectedId) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const measureKey = `${currentPage?.widgets.length}:${currentPage?.widgets.map(w => w.id).join(',')}`

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-body)' }}>
      {showLayouts && <LayoutPicker onApply={applyLayout} onClose={() => setShowLayouts(false)} />}
      {dialog && <Dialog {...dialog} onClose={() => setDialog(null)} />}

      <TopNav
        widgetCount={currentPage?.widgets.length || 0}
        measureKey={measureKey}
        canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo}
        onLayouts={() => setShowLayouts(true)}
        onKiosk={() => onKiosk(currentPage?.id)}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentPage={currentPage}
        onPickResult={id => { setSelectedId(id); setShowProps(true) }}
        watchChannels={watchChannels}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <LeftPanel
          plugins={allPlugins}
          onAdd={addWidget}
          onPluginLoaded={() => setPluginVersion(v => v + 1)}
          pages={config.pages}
          currentPageId={currentPage?.id}
          onSelectPage={id => { setCurrentPageId(id); setSelectedId(null) }}
          onAddPage={addPage}
          onDeletePage={deletePage}
          onRenamePage={renamePage}
          activeTab={leftTab}
          onTabChange={setLeftTab}
          onNew={() => { handleNew(); setLeftTab(null) }}
          onSave={() => { storage.save(config); flash('Сохранено') }}
          onLoad={() => { const cfg = storage.load(); if (cfg) { setConfig(cfg); setCurrentPageId(cfg.pages?.[0]?.id || null); setSelectedId(null); flash('Проект загружен') } else flash('Нет сохранённой панели') }}
          onExport={() => storage.exportFile(config)}
          onImport={handleImport}
        />

        <main
          ref={canvasAreaRef}
          className="flex min-w-0 flex-1 flex-col relative"
          onMouseDown={() => { setSelectedId(null); setShowProps(false) }}
        >
          <div className="canvas-grid-bg min-h-0 flex-1 overflow-auto p-5"
            onMouseDown={e => e.stopPropagation()}>
            {currentPage && (
              <Canvas
                config={currentPage}
                setConfig={setPage}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                onOpenProps={openProps}
                onDuplicate={duplicateWidget}
              />
            )}
          </div>

          {showProps && (
            <DraggablePropsPanel
              selected={selected}
              currentPage={!selected ? currentPage : null}
              onUpdate={updateSelected}
              onRemove={() => removeWidget(selectedId)}
              onPageChange={setPage}
              onClose={() => { setShowProps(false); setSelectedId(null) }}
              canvasRef={canvasAreaRef}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function flash(text) {
  const el = document.createElement('div')
  el.textContent = text
  el.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-4 py-2.5 text-[13px] font-medium border'
  el.style.cssText = 'background:var(--bg-panel);color:var(--accent-text);border-color:color-mix(in srgb, var(--accent) 30%, transparent);box-shadow:0px 8px 30px rgba(0,0,0,0.12)'
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 1800)
}

export default Editor
