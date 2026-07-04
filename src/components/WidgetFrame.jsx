import React from 'react'
import { get } from '../core/registry'

class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null } }
  static getDerivedStateFromError(err) { return { err } }
  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.err) this.setState({ err: null })
  }
  render() {
    if (this.state.err) return (
      <div className="flex h-full items-center justify-center rounded-xl p-3 text-center text-[11px]"
        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error-text)' }}>
        {String(this.state.err.message || this.state.err)}
      </div>
    )
    return this.props.children
  }
}

const DragDots = () => (
  <svg width="22" height="8" viewBox="0 0 22 8" style={{ display: 'block' }}>
    {[0, 8, 16].flatMap(x => [1, 5].map(y => (
      <circle key={`${x}${y}`} cx={x + 2} cy={y} r="1.4" fill="currentColor" />
    )))}
  </svg>
)

function WidgetFrame({ widget, selected, editable, onSelect, onOpenProps, onRemove, onDuplicate }) {
  const plugin = get(widget.type)
  const locked = widget.locked

  return (
    <div
      data-wid={widget.id}
      className={['group relative h-full w-full overflow-hidden transition-all duration-150',
        selected ? 'widget-card-selected' : 'widget-card',
        locked && editable ? 'ring-1 ring-amber-400/25' : ''
      ].join(' ')}
      onMouseDown={editable ? () => onSelect(widget.id) : undefined}
    >
      <div className="h-full w-full overflow-hidden p-3">
        {plugin ? (
          <Boundary resetKey={JSON.stringify(widget.props)}>
            <plugin.Component props={widget.props} dataSource={widget.dataSource} />
          </Boundary>
        ) : (
          <div className="flex h-full items-center justify-center text-[12px]"
            style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
            Неизвестный тип: {widget.type}
          </div>
        )}
      </div>

      {editable && (
        <div
          className="widget-drag-handle absolute inset-x-0 top-0 z-20 flex h-5 items-center justify-center
            opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-grab"
          style={{ color: 'var(--text-muted)' }}
          onMouseDown={() => onSelect(widget.id)}
        >
          <DragDots />
        </div>
      )}

      {editable && (
        <div
          className="absolute top-1.5 right-1.5 z-30 flex gap-0.5
            opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          onMouseDown={e => e.stopPropagation()}
        >
          {locked && (
            <span className="flex h-5 items-center px-1 rounded text-[9px] font-bold"
              style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--warning-text)' }}>ЗАБ</span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onOpenProps(widget.id) }}
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
            style={{ background: 'var(--bg-widget-action)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 15%, var(--bg-panel))' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-widget-action)' }}
            title="Свойства"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>tune</span>
          </button>
          {onDuplicate && (
            <button
              onClick={e => { e.stopPropagation(); onDuplicate(widget.id) }}
              className="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
              style={{ background: 'var(--bg-widget-action)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 15%, var(--bg-panel))' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-widget-action)' }}
              title="Дублировать"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>content_copy</span>
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onRemove(widget.id) }}
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
            style={{ background: 'var(--bg-widget-action)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--error-text)'; e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-widget-action)' }}
            title="Удалить"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default React.memo(WidgetFrame)
