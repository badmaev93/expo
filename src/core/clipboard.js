import { uid } from './schema'

let _widget = null

export function copy(widget) {
  _widget = structuredClone(widget)
}

export function paste() {
  if (!_widget) return null
  return {
    ..._widget,
    id: uid(),
    layout: {
      ..._widget.layout,
      x: Math.min(_widget.layout.x + 1, 10),
      y: _widget.layout.y + 1
    }
  }
}

export function canPaste() {
  return !!_widget
}
