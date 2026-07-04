
import { memo } from 'react'

const registry = new Map()
const listeners = new Set()

export function register(plugin) {
  if (!plugin || !plugin.type) throw new Error('Плагин обязан иметь поле type')
  registry.set(plugin.type, {
    group: 'Прочее',
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 1, h: 1 },
    defaultProps: {},
    configSchema: [],
    realtime: false,
    ...plugin,
    Component: plugin.Component ? memo(plugin.Component) : plugin.Component,
  })
  listeners.forEach((fn) => fn())
}

export function get(type) {
  return registry.get(type)
}

export function list() {
  return [...registry.values()]
}

export function has(type) {
  return registry.has(type)
}

export function onChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
