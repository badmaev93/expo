import { useEffect, useRef, useState } from 'react'
import { wsManager } from '../core/WebSocketManager'

const LAG_KEY = 'expo-lag-threshold'
const LAG_OPTIONS = [5, 10, 15, 30, 60]
const NTFY_TOPIC_KEY = 'expo-ntfy-topic'
const NTFY_PUSH_KEY = 'expo-ntfy-push'
const NOTIFY_COOLDOWN_MS = 60000

function genTopic() {
  return 'expo-panel-' + Math.random().toString(36).slice(2, 10)
}

function fmtAge(sec) {
  if (!Number.isFinite(sec)) return 'нет данных'
  if (sec < 90) return `${Math.round(sec)} с`
  return `${Math.round(sec / 60)} мин`
}

async function postNtfy(topic, { title, body, priority = 'default', tags = '' }) {
  const res = await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    headers: { Title: title, Priority: priority, Tags: tags },
    body,
  })
  if (!res.ok) throw new Error(`ntfy HTTP ${res.status}`)
}

async function sendNtfy(topic, alerts) {
  const body = alerts
    .map(a => `${a.widget}: канал ${a.channel} молчит ${fmtAge(a.age)}`)
    .join('\n')
  try {
    await postNtfy(topic, { title: 'EXPO: zaderzhka dannykh', body, priority: 'high', tags: 'warning' })
  } catch (err) {
    console.warn('ntfy недоступен:', err)
  }
}

function Notifications({ channels }) {
  const [alerts, setAlerts] = useState([])
  const [open, setOpen] = useState(false)
  const [lagSec, setLagSec] = useState(() => Number(localStorage.getItem(LAG_KEY)) || 15)
  const [topic, setTopic] = useState(() => localStorage.getItem(NTFY_TOPIC_KEY) || '')
  const [push, setPush] = useState(() => localStorage.getItem(NTFY_PUSH_KEY) === '1')
  const [copied, setCopied] = useState(false)
  const notifiedAt = useRef(new Map())
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h, true)
    return () => document.removeEventListener('mousedown', h, true)
  }, [])

  useEffect(() => {
    const check = () => {
      const now = Date.now()
      const list = []
      channels.forEach(({ channel, widget }) => {
        const last = wsManager.last.get(channel)
        const age = last?._rx ? (now - last._rx) / 1000 : Infinity
        if (age > lagSec) list.push({ channel, widget, age })
      })
      setAlerts(list)

      if (push && topic && list.length) {
        const fresh = list.filter(a => now - (notifiedAt.current.get(a.channel) || 0) > NOTIFY_COOLDOWN_MS)
        if (fresh.length) {
          fresh.forEach(a => notifiedAt.current.set(a.channel, now))
          sendNtfy(topic, fresh)
        }
      }
    }
    check()
    const t = setInterval(check, 5000)
    return () => clearInterval(t)
  }, [channels, push, topic, lagSec])

  const ensureTopic = () => {
    if (topic) return topic
    const t = genTopic()
    localStorage.setItem(NTFY_TOPIC_KEY, t)
    setTopic(t)
    return t
  }

  const [testState, setTestState] = useState(null)

  const sendTest = async (t) => {
    setTestState('pending')
    try {
      const body = alerts.length
        ? alerts.map(a => `${a.widget}: канал ${a.channel} молчит ${fmtAge(a.age)}`).join('\n')
        : 'Связь с панелью установлена. Все данные поступают вовремя.'
      await postNtfy(t, { title: 'EXPO konstruktor: test', body, tags: 'white_check_mark' })
      setTestState('ok')
    } catch (err) {
      console.warn('ntfy тест не прошёл:', err)
      setTestState('err')
    }
    setTimeout(() => setTestState(null), 2500)
  }

  const togglePush = () => {
    const next = !push
    localStorage.setItem(NTFY_PUSH_KEY, next ? '1' : '0')
    setPush(next)
    if (next) sendTest(ensureTopic())
  }

  const copyLink = async () => {
    const t = ensureTopic()
    try {
      await navigator.clipboard.writeText(`https://ntfy.sh/${t}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.warn('Буфер обмена недоступен:', err)
    }
  }

  const hasAlerts = alerts.length > 0

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)} title="Оповещения"
        className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-all"
        style={{
          color: hasAlerts ? 'var(--warning-text)' : open ? 'var(--accent-text)' : 'var(--text-secondary)',
          background: open ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : '',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'var(--bg-container)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = '' }}>
        <span className="material-symbols-outlined text-[18px]">
          {hasAlerts ? 'notifications_active' : 'notifications'}
        </span>
        {hasAlerts && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
            style={{ background: 'var(--error)' }}>
            {alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-xl glass-strong">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[15px]" style={{ color: 'var(--accent-text)' }}>notifications</span>
              <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Оповещения</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Порог задержки</span>
              <select value={lagSec}
                onChange={e => { const v = Number(e.target.value); setLagSec(v); localStorage.setItem(LAG_KEY, String(v)) }}
                className="rounded-lg px-2 py-1 text-[11px] outline-none"
                style={{ background: 'var(--bg-container)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                {LAG_OPTIONS.map(v => <option key={v} value={v}>{v} с</option>)}
              </select>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-2">
            {!hasAlerts && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-3"
                style={{ background: 'color-mix(in srgb, var(--success) 7%, transparent)' }}>
                <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--success)' }}>check_circle</span>
                <span className="text-[12px]" style={{ color: 'var(--success)' }}>Все данные поступают вовремя</span>
              </div>
            )}
            {alerts.map(a => (
              <div key={a.channel + a.widget} className="flex items-start gap-2.5 rounded-lg px-3 py-2">
                <span className="material-symbols-outlined mt-0.5 text-[15px]" style={{ color: 'var(--warning-text)' }}>warning</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{a.widget}</div>
                  <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {a.channel} · молчит {fmtAge(a.age)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 px-4 py-3" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>Пуш на телефон (ntfy)</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Отправлять предупреждения на устройство</div>
              </div>
              <button onClick={togglePush}
                className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${push ? 'bg-[var(--accent)]' : 'bg-[rgba(0,0,0,0.15)]'}`}>
                <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${push ? 'translate-x-4' : ''}`} />
              </button>
            </div>

            {(push || topic) && (
              <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-container)', border: '1px solid var(--border-subtle)' }}>
                <div className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Установите приложение <b>ntfy</b> и подпишитесь на тему, либо откройте ссылку на телефоне:
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <a href={`https://ntfy.sh/${topic || ''}`} target="_blank" rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate rounded-md px-2 py-1 font-mono text-[10px]"
                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', color: 'var(--accent-text)' }}>
                    ntfy.sh/{topic || '…'}
                  </a>
                  <button onClick={copyLink} title="Копировать ссылку"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors"
                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', color: copied ? 'var(--success)' : 'var(--text-secondary)' }}>
                    <span className="material-symbols-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
                  </button>
                </div>
                <button onClick={() => sendTest(ensureTopic())} disabled={testState === 'pending'}
                  className="mt-1.5 w-full rounded-md py-1.5 text-[11px] font-medium transition-colors disabled:opacity-50"
                  style={{
                    background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                    color: testState === 'ok' ? 'var(--success)' : testState === 'err' ? 'var(--error-text)' : 'var(--accent-text)',
                  }}>
                  {testState === 'pending' ? 'Отправка…' : testState === 'ok' ? 'Отправлено — проверьте телефон' : testState === 'err' ? 'Ошибка отправки' : 'Отправить тестовое уведомление'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications
