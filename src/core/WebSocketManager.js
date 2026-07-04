
function defaultUrl() {
  if (typeof window === 'undefined') return 'ws://localhost:8081'
  const { hostname, protocol, host } = window.location
  if (protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1') return 'ws://localhost:8081'
  const wsProto = protocol === 'https:' ? 'wss' : 'ws'
  return `${wsProto}://${host}/expo-ws`
}

const DEFAULT_URL = defaultUrl()

class WebSocketManager {
  constructor() {
    this.url = DEFAULT_URL
    this.ws = null
    this.channels = new Map()
    this.last = new Map()
    this.statusListeners = new Set()
    this.status = 'idle'
    this.reconnectDelay = 1500
    this._timer = null
  }

  connect(url) {
    if (url) this.url = url
    if (this.ws && (this.status === 'open' || this.status === 'connecting')) return
    this._setStatus('connecting')
    try {
      this.ws = new WebSocket(this.url)
    } catch {
      this._scheduleReconnect()
      return
    }
    this.ws.onopen = () => this._setStatus('open')
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg && msg.channel) this._dispatch(msg.channel, msg)
      } catch {
      }
    }
    this.ws.onclose = () => {
      this._setStatus('closed')
      this._scheduleReconnect()
    }
    this.ws.onerror = () => this.ws && this.ws.close()
  }

  _scheduleReconnect() {
    clearTimeout(this._timer)
    this._timer = setTimeout(() => this.connect(), this.reconnectDelay)
  }

  _dispatch(channel, msg) {
    this.last.set(channel, { ...msg, _rx: Date.now() })
    const subs = this.channels.get(channel)
    if (subs) subs.forEach((fn) => fn(msg))
  }

  subscribe(channel, fn) {
    if (!channel) return () => {}
    if (!this.channels.has(channel)) this.channels.set(channel, new Set())
    this.channels.get(channel).add(fn)
    if (this.last.has(channel)) fn(this.last.get(channel))
    return () => {
      const subs = this.channels.get(channel)
      if (subs) subs.delete(fn)
    }
  }

  _setStatus(s) {
    this.status = s
    this.statusListeners.forEach((fn) => fn(s))
  }

  onStatus(fn) {
    this.statusListeners.add(fn)
    fn(this.status)
    return () => this.statusListeners.delete(fn)
  }
}

export const wsManager = new WebSocketManager()
