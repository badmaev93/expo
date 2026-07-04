import React from 'react'
import { register, has } from './registry'

if (typeof window !== 'undefined') window.__EXPO_REACT__ = React

export async function loadPlugin(url) {
  let mod
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const code = await res.text()
    const blobUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))
    try {
      mod = await import( blobUrl)
    } finally {
      URL.revokeObjectURL(blobUrl)
    }
  } catch (e) {
    mod = await import( url)
  }
  const plugin = mod.default || mod.plugin
  if (!plugin || !plugin.type) throw new Error('Модуль не экспортирует валидный плагин (нужен default с полем type)')
  const already = has(plugin.type)
  register(plugin)
  return { type: plugin.type, name: plugin.name, replaced: already }
}
