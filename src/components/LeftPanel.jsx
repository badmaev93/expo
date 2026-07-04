import { useRef, useState } from 'react'
import { loadPlugin } from '../core/pluginLoader'
import { setDragType, clearDragType } from '../core/dragState'

function RailBtn({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="relative mx-auto my-1 flex h-10 w-10 items-center justify-center rounded-xl transition-all"
      style={{
        background: active ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : '',
        color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-container)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = '' }}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )
}

function PagesContent({ pages, currentPageId, onSelect, onAdd, onDelete, onRename }) {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const inputRef = useRef(null)

  const startEdit = (page, e) => {
    e.stopPropagation()
    setEditingId(page.id)
    setEditName(page.name)
    setTimeout(() => inputRef.current?.select(), 0)
  }
  const commit = () => {
    if (editingId && editName.trim()) onRename(editingId, editName.trim())
    setEditingId(null)
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="tech-label">Страницы</span>
        <button
          onClick={onAdd}
          title="Добавить страницу"
          className="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 15%, transparent)'; e.currentTarget.style.color = 'var(--accent-text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
        </button>
      </div>

      <div className="space-y-0.5 px-2 pb-4">
        {pages.map((page, i) => (
          <div
            key={page.id}
            onClick={() => onSelect(page.id)}
            className={`group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[13px] transition-all ${
              page.id === currentPageId
                ? 'bg-primary/20 text-primary-text'
                : 'text-on-surface-variant hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-on-surface'
            }`}
          >
            {editingId === page.id ? (
              <input
                ref={inputRef}
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={commit}
                onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditingId(null) }}
                onClick={e => e.stopPropagation()}
                className="w-full rounded-lg border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[13px] text-primary-text outline-none"
              />
            ) : (
              <>
                <span className="font-mono text-[10px] text-outline">{i + 1}</span>
                <span className="flex-1 truncate font-medium" onDoubleClick={e => startEdit(page, e)}>{page.name}</span>
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={e => startEdit(page, e)} className="rounded p-0.5 text-on-surface-variant hover:text-on-surface" title="Переименовать">
                    <span className="material-symbols-outlined text-[12px]">edit</span>
                  </button>
                  {pages.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); onDelete(page.id) }} className="rounded p-0.5 text-on-surface-variant hover:text-[var(--error-text)]" title="Удалить">
                      <span className="material-symbols-outlined text-[12px]">delete</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

const GROUP_ICON = {
  'Data Modules': 'analytics',
  'Data':         'analytics',
  'Данные':       'analytics',
  'Media':        'videocam',
  'Медиа':        'videocam',
  'Sensors':      'thermostat',
  'Датчики':      'thermostat',
  'Text':         'text_fields',
  'Текст':        'text_fields',
  'Мониторинг':   'monitor_heart',
  'Аналитика':    'bar_chart',
  'Управление':   'folder_open',
}

function WidgetsContent({ plugins, onAdd }) {
  const groups = plugins.reduce((acc, p) => { (acc[p.group] ||= []).push(p); return acc }, {})

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <span className="tech-label">Виджеты</span>
        <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>Перетащить или двойной клик</p>
      </div>

      <div className="overflow-y-auto pb-4">
        {plugins.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined text-2xl block mb-1" style={{ color: 'var(--border-subtle)' }}>search_off</span>
            Ничего не найдено
          </div>
        )}
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-3">
            <div className="flex items-center gap-2 px-4 py-1.5">
              <span className="material-symbols-outlined text-[14px] text-outline">
                {GROUP_ICON[group] || 'widgets'}
              </span>
              <span className="tech-label">{group}</span>
            </div>
            {items.map(p => {
              const Icon = p.icon
              return (
                <button
                  key={p.type}
                  draggable
                  onDragStart={e => {
                    setDragType(p.type)
                    e.dataTransfer.setData('application/x-widget-type', p.type)
                    e.dataTransfer.setData('text/plain', p.type)
                    e.dataTransfer.effectAllowed = 'copy'
                  }}
                  onDragEnd={() => clearDragType()}
                  onDoubleClick={() => onAdd(p.type)}
                  title={`${p.name} - двойной клик или перетащить`}
                  className="group flex w-full cursor-grab items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.03] active:bg-black/[0.06]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container text-on-surface-variant transition-all group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:text-primary-text">
                    {Icon ? <Icon /> : <span className="material-symbols-outlined text-[16px]">widgets</span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-on-surface-variant group-hover:text-on-surface">{p.name}</div>
                  </div>
                  <span className="material-symbols-outlined text-[14px] text-outline opacity-0 transition-opacity group-hover:opacity-100">arrow_forward</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}

function ProjectContent({ onNew, onSave, onLoad, onExport, onImport }) {
  const actions = [
    { icon: 'note_add',    label: 'Новый проект',   action: onNew },
    { icon: 'folder_open', label: 'Открыть проект', action: onLoad },
    { icon: 'save',        label: 'Сохранить',      action: onSave },
    { icon: 'download',    label: 'Экспорт JSON',   action: onExport },
    { icon: 'upload',      label: 'Импорт JSON',    action: onImport },
  ]
  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <span className="tech-label">Проект</span>
      </div>
      <div className="space-y-0.5 px-2 pb-4">
        {actions.map(a => (
          <button key={a.label} onClick={a.action}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
            style={{ color: 'var(--text-secondary)' }}>
            <span className="material-symbols-outlined text-[17px]" style={{ color: 'var(--text-muted)' }}>{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>
    </>
  )
}

function PluginContent({ onPluginLoaded }) {
  const [url, setUrl] = useState(`${import.meta.env.BASE_URL}plugins/sample-plugin.js`)
  const [msg, setMsg] = useState(null)

  const handle = async () => {
    setMsg({ k: 'pending', t: 'Загрузка…' })
    try {
      const r = await loadPlugin(url)
      setMsg({ k: 'ok', t: `${r.replaced ? 'Обновлён' : 'Добавлен'}: ${r.name}` })
      onPluginLoaded?.()
    } catch (e) {
      setMsg({ k: 'err', t: e.message })
    }
  }

  return (
    <div className="px-4 pt-4 pb-4">
      <span className="tech-label">Внешний плагин</span>
      <input
        value={url}
        onChange={e => setUrl(e.target.value)}
        className="mt-3 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2 font-mono text-[11px] text-on-surface outline-none focus:border-primary/50 transition-all"
        placeholder="/plugins/...js"
      />
      <button
        onClick={handle}
        className="mt-2 w-full rounded-xl bg-primary/15 py-2 text-[13px] font-semibold text-primary-text transition-colors hover:bg-primary/25 border border-primary/20"
      >
        Загрузить плагин
      </button>
      {msg && (
        <p className={`mt-2 text-[11px] ${msg.k === 'ok' ? 'text-success' : msg.k === 'err' ? 'text-error' : 'text-outline'}`}>
          {msg.t}
        </p>
      )}
    </div>
  )
}

function LeftPanel({
  plugins, onAdd, onPluginLoaded,
  pages, currentPageId, onSelectPage, onAddPage, onDeletePage, onRenamePage,
  activeTab, onTabChange,
  onNew, onSave, onLoad, onExport, onImport,
}) {
  const tabs = [
    { id: 'project', icon: 'home_storage',  label: 'Проект' },
    { id: 'pages',   icon: 'description',  label: 'Страницы' },
    { id: 'widgets', icon: 'widgets',       label: 'Виджеты' },
    { id: 'plugins', icon: 'extension',     label: 'Плагины' },
  ]

  return (
    <>
      <nav data-rail="" className="z-30 flex w-[52px] shrink-0 flex-col items-center glass-strong py-2"
        style={{ borderRight: '1px solid var(--border-subtle)' }}>
        {tabs.map(t => (
          <RailBtn
            key={t.id}
            icon={t.icon}
            label={t.label}
            active={activeTab === t.id}
            onClick={() => onTabChange(activeTab === t.id ? null : t.id)}
          />
        ))}
      </nav>

      <div className={`panel-slide-left absolute left-[52px] top-0 z-20 flex h-full w-64 flex-col glass-strong ${activeTab ? 'open' : ''}`}
        style={{ borderRight: '1px solid var(--border-subtle)' }}
        onMouseLeave={e => { if (activeTab && !e.relatedTarget?.closest?.('[data-rail]')) onTabChange(null) }}>
        {activeTab === 'project' && (
          <ProjectContent onNew={onNew} onSave={onSave} onLoad={onLoad} onExport={onExport} onImport={onImport} />
        )}
        {activeTab === 'pages' && (
          <PagesContent
            pages={pages}
            currentPageId={currentPageId}
            onSelect={onSelectPage}
            onAdd={onAddPage}
            onDelete={onDeletePage}
            onRename={onRenamePage}
          />
        )}
        {activeTab === 'widgets' && (
          <WidgetsContent plugins={plugins} onAdd={onAdd} />
        )}
        {activeTab === 'plugins' && (
          <PluginContent onPluginLoaded={onPluginLoaded} />
        )}
      </div>
    </>
  )
}

export default LeftPanel
