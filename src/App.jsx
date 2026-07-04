import { useEffect, useState } from 'react'
import Editor from './components/Editor'
import KioskView from './components/KioskView'
import { registerBuiltins } from './widgets'
import { loadPlugin } from './core/pluginLoader'
import { wsManager } from './core/WebSocketManager'
import { demoConfig } from './core/schema'
import { useHistory } from './core/useHistory'
import * as storage from './core/storage'

registerBuiltins()

const APP_VERSION = '5.4.0'
const VER_KEY = 'expo-panel-version'
if (localStorage.getItem(VER_KEY) !== APP_VERSION) {
  storage.clear()
  localStorage.setItem(VER_KEY, APP_VERSION)
}

export default function App() {
  const { config, setConfig, undo, redo, canUndo, canRedo } = useHistory(
    () => storage.load() || demoConfig()
  )
  const [kiosk, setKiosk] = useState(() => new URLSearchParams(location.search).get('mode') === 'kiosk')
  const [kioskPageId, setKioskPageId] = useState(null)

  useEffect(() => {
    wsManager.connect()
    loadPlugin(`${import.meta.env.BASE_URL}plugins/sample-plugin.js`).catch(() => {})
  }, [])

  if (kiosk) return <KioskView config={config} initialPageId={kioskPageId} onExit={() => setKiosk(false)} />

  return (
    <Editor config={config} setConfig={setConfig} undo={undo} redo={redo}
      canUndo={canUndo} canRedo={canRedo}
      onKiosk={(pageId) => { setKioskPageId(pageId); setKiosk(true) }} />
  )
}
