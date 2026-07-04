import { memo, useCallback, useMemo, useRef, useState, useLayoutEffect } from 'react'
import GridLayout from 'react-grid-layout'
import WidgetFrame from './WidgetFrame'
import { toRGL, applyLayout, makeWidget, uid } from '../core/schema'
import { get } from '../core/registry'
import { getDragType, clearDragType } from '../core/dragState'

function Canvas({ config, setConfig, selectedId, setSelectedId, onOpenProps, editable = true, onDuplicate }) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(null)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    setWidth(el.clientWidth)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const layout = useMemo(() => toRGL(config.widgets), [config.widgets])
  const { cols, rowHeight, gap } = config.grid

  const onLayoutChange = (next) =>
    setConfig(c => ({ ...c, widgets: applyLayout(c.widgets, next) }))

  const selRef = useRef(selectedId)
  selRef.current = selectedId
  const removeWidget = useCallback(id => {
    setConfig(c => ({ ...c, widgets: c.widgets.filter(w => w.id !== id) }))
    if (selRef.current === id) setSelectedId(null)
  }, [setConfig, setSelectedId])

  const onDrop = (lay, item, e) => {
    const type = (e?.dataTransfer?.getData('application/x-widget-type')) || getDragType()
    clearDragType()
    if (!type || !get(type)) return
    const placed = lay.find(l => l.i === '__drop__')
    const x = placed ? placed.x : Math.max(0, item.x)
    const y = placed ? placed.y : Math.max(0, item.y)
    const w = makeWidget(type, x, y)
    w.id = uid()
    setConfig(c => ({ ...c, widgets: [...c.widgets, w] }))
    setSelectedId(w.id)
  }

  return (
    <div ref={wrapRef} className={`min-h-full ${editable ? '' : 'kiosk'}`}
      onMouseDown={e => { if (editable && !e.target.closest('[data-wid]')) setSelectedId(null) }}
      onDragOver={editable ? e => e.preventDefault() : undefined}>
      {width != null && <GridLayout
        className="layout"
        layout={layout}
        cols={cols}
        rowHeight={rowHeight}
        width={width}
        margin={[gap, gap]}
        isDraggable={editable}
        isResizable={editable}
        isDroppable={editable}
        draggableHandle=".widget-drag-handle"
        onDrop={onDrop}
        onDropDragOver={() => ({ w: 3, h: 3 })}
        droppingItem={{ i: '__drop__', w: 3, h: 3 }}
        onLayoutChange={onLayoutChange}
        compactType={null}
        preventCollision={true}
        resizeHandles={['s', 'n', 'e', 'se']}
      >
        {config.widgets.map((w, i) => (
          <div key={w.id} className="h-full" onMouseDown={e => e.stopPropagation()}>
            <div className="h-full widget-enter" style={{ animationDelay: `${Math.min(i * 35, 400)}ms` }}>
            <WidgetFrame
              widget={w}
              editable={editable}
              selected={selectedId === w.id}
              onSelect={setSelectedId}
              onOpenProps={onOpenProps}
              onRemove={removeWidget}
              onDuplicate={onDuplicate}
            />
            </div>
          </div>
        ))}
      </GridLayout>}
    </div>
  )
}

export default memo(Canvas)
