import { useState, useCallback } from 'react'
import { get } from '../core/registry'
import { useWsStatus } from '../core/useRealtime'

const inputCls = 'w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-container)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 transition-all placeholder:text-[var(--text-muted)]'

function Lbl({ id, label, children, hint, inline }) {
  if (inline) return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label className="tech-label">{label}</label>
        {hint && <p className="mt-0.5 text-[10px]" style={{color:'var(--text-muted)'}}>{hint}</p>}
      </div>
      {children}
    </div>
  )
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="tech-label">{label}</label>
      {children}
    </div>
  )
}

function Divider({ label }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="tech-label">{label}</span>
      <div className="flex-1 h-px bg-[var(--border-subtle)]" />
    </div>
  )
}

function Field({ field, value, onChange }) {
  const id = `f_${field.key}`
  if (field.type === 'textarea') return <Lbl id={id} label={field.label}><textarea id={id} rows={3} value={value??''} onChange={e=>onChange(e.target.value)} className={inputCls} style={{resize:'vertical',minHeight:'64px',maxHeight:'320px'}}/></Lbl>
  if (field.type === 'select') return (
    <Lbl id={id} label={field.label}>
      <div className="relative">
        <select id={id} value={value??''} onChange={e=>onChange(e.target.value)} className={inputCls+' appearance-none pr-8'}>
          {field.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none" style={{color:'var(--text-muted)'}}>unfold_more</span>
      </div>
    </Lbl>
  )
  if (field.type === 'boolean') return (
    <Lbl id={id} label={field.label} inline>
      <button id={id} onClick={()=>onChange(!value)} className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${value?'bg-[var(--accent)]':'bg-[rgba(0,0,0,0.15)]'}`}>
        <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${value?'translate-x-4':''}`}/>
      </button>
    </Lbl>
  )
  if (field.type === 'color') return (
    <Lbl id={id} label={field.label}>
      <div className="flex gap-2">
        <input type="color" id={id} value={value||'#0061A5'} onChange={e=>onChange(e.target.value)} className="h-8 w-10 shrink-0 cursor-pointer rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-container)]"/>
        <input value={value||''} onChange={e=>onChange(e.target.value)} className={inputCls+' font-mono text-xs'}/>
      </div>
    </Lbl>
  )
  if (field.type === 'number') return <Lbl id={id} label={field.label}><input type="number" id={id} value={value??''} onChange={e=>onChange(e.target.value===''?'':Number(e.target.value))} className={inputCls+' font-num'}/></Lbl>
  if (field.type === 'channel') return (
    <Lbl id={id} label={field.label}>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none" style={{color:'var(--text-muted)'}}>bolt</span>
        <select id={id} value={value??''} onChange={e=>onChange(e.target.value)} className={inputCls+' pl-8 pr-8 font-mono text-xs appearance-none'}>
          <option value="">— без канала —</option>
          {KNOWN_CHANNELS.map(g=>(
            <optgroup key={g.group} label={g.group}>
              {g.channels.map(ch=><option key={ch} value={ch}>{ch}</option>)}
            </optgroup>
          ))}
          {value&&!KNOWN_CHANNELS.some(g=>g.channels.includes(value))&&<option value={value}>{value}</option>}
        </select>
        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none" style={{color:'var(--text-muted)'}}>unfold_more</span>
      </div>
    </Lbl>
  )
  if (field.type === 'url') return (
    <Lbl id={id} label={field.label}>
      <div className="flex gap-1.5">
        <input id={id} value={value??''} onChange={e=>onChange(e.target.value)} placeholder={field.placeholder??'https://'} className={inputCls+' flex-1 font-mono text-xs'}/>
        {value && !value.startsWith('ws') && <a href={value} target="_blank" rel="noopener noreferrer" className="flex items-center rounded-xl border border-[var(--border-subtle)] px-2" style={{color:'var(--text-secondary)'}}><span className="material-symbols-outlined text-[13px]">open_in_new</span></a>}
      </div>
    </Lbl>
  )
  return <Lbl id={id} label={field.label}><input id={id} value={value??''} onChange={e=>onChange(e.target.value)} className={inputCls}/></Lbl>
}

const KNOWN_CHANNELS = [
  { group: 'Датчики', channels: ['sensor.temp','sensor.co2','sensor.humidity','sensor.noise','sensor.light','sensor.load','sensor.pressure','sensor.motion','sensor.aqi','sensor.battery','sensor.signal','sensor.cpu','sensor.ram','sensor.disk'] },
  { group: 'Метрики', channels: ['metric.visitors','metric.screens','metric.rps','metric.errors','metric.engagement','metric.dwell','metric.leads','metric.battery','metric.uptime'] },
  { group: 'Графики', channels: ['chart.realtime','chart.market','chart.servers','chart.network','chart.visitors','chart.engagement','chart.hourly','chart.zones'] },
]

function useDiscoverChannels(wsUrl) {
  const [channels, setChannels] = useState([])
  const [discovering, setDiscovering] = useState(false)

  const discover = useCallback(() => {
    if (!wsUrl || discovering) return
    setDiscovering(true)
    setChannels([])
    const discovered = new Set()
    let ws
    try {
      ws = new WebSocket(wsUrl)
      ws.onmessage = e => {
        try { const msg = JSON.parse(e.data); if (msg?.channel) discovered.add(msg.channel) } catch {}
      }
      setTimeout(() => {
        ws?.close()
        setChannels([...discovered].sort())
        setDiscovering(false)
      }, 3000)
    } catch { setDiscovering(false) }
  }, [wsUrl, discovering])

  return { channels, discovering, discover }
}

function WsSection({ widget, onChange }) {
  const ds = widget.dataSource || {}
  const wsUrl = ds.wsUrl || ''
  const channel = ds.channel || ''
  const status = useWsStatus()
  const ok = status === 'open'
  const setDs = (key, val) => onChange(w => ({ ...w, dataSource: { ...(w.dataSource || {}), [key]: val } }))

  const effectiveUrl = wsUrl || 'wss://badmaevoleg.hlab.kz/expo-ws'
  const { channels: discoveredChannels, discovering, discover } = useDiscoverChannels(effectiveUrl)

  const channelBtn = (ch, fullLabel) => (
    <button key={ch} onClick={() => setDs('channel', ch)}
      className="rounded-md px-2 py-0.5 text-[10px] font-mono transition-all"
      style={ch === channel
        ? { background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent-text)', border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)' }
        : { background: 'var(--bg-container)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
      onMouseEnter={e => ch !== channel && (e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={e => ch !== channel && (e.currentTarget.style.color = 'var(--text-muted)')}>
      {fullLabel || ch.split('.')[1]}
    </button>
  )

  return (
    <div className="space-y-3">
      <Divider label="WebSocket"/>

      <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 border"
        style={ok
          ? { background: 'color-mix(in srgb, var(--success) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--success) 25%, transparent)' }
          : { background: 'var(--bg-container)', borderColor: 'var(--border-subtle)' }}>
        <span className={`h-2 w-2 shrink-0 rounded-full ${ok ? 'animate-pulse' : ''}`}
          style={{ background: ok ? 'var(--success)' : 'var(--text-muted)' }}/>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold" style={{ color: ok ? 'var(--success)' : 'var(--text-muted)' }}>
            {ok ? 'Подключено' : status === 'connecting' ? 'Подключение…' : 'Нет связи'}
          </div>
          {wsUrl && <div className="truncate font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{wsUrl}</div>}
        </div>
      </div>

      <Lbl label="Адрес сервера" hint="пусто = глобальный">
        <input value={wsUrl} onChange={e => setDs('wsUrl', e.target.value)}
          placeholder="wss://badmaevoleg.hlab.kz/expo-ws"
          className={inputCls + ' font-mono text-xs'}/>
      </Lbl>

      <Lbl label="Канал">
        <div className="space-y-1.5">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none"
              style={{ color: 'var(--text-muted)' }}>bolt</span>
            <input value={channel} onChange={e => setDs('channel', e.target.value)}
              placeholder="например: metric.visitors"
              className={inputCls + ' pl-8 pr-20 font-mono text-xs'}/>
            <button onClick={discover} disabled={discovering}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all disabled:opacity-50"
              style={{ background: 'var(--bg-container)', color: 'var(--accent-text)', border: '1px solid var(--border-subtle)' }}>
              {discovering ? '...' : 'Найти'}
            </button>
          </div>

          {discoveredChannels.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="px-2 py-1 tech-label" style={{ background: 'var(--bg-container)' }}>
                Найдено ({discoveredChannels.length})
              </div>
              <div className="flex flex-wrap gap-1 p-2" style={{ background: 'var(--bg-panel)' }}>
                {discoveredChannels.map(ch => channelBtn(ch, ch))}
              </div>
            </div>
          )}

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
            {KNOWN_CHANNELS.map(g => (
              <div key={g.group}>
                <div className="px-2 py-1 tech-label" style={{ background: 'var(--bg-container)' }}>{g.group}</div>
                <div className="flex flex-wrap gap-1 p-2" style={{ background: 'var(--bg-panel)' }}>
                  {g.channels.map(ch => channelBtn(ch))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Lbl>
    </div>
  )
}

export function PageSettings({ page, onPageChange }) {
  const setGrid=(key,val)=>onPageChange(p=>({...p,grid:{...p.grid,[key]:val}}))
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      <Divider label="Сетка"/>
      {[{key:'cols',label:'Колонок',min:1,max:48},{key:'rowHeight',label:'Высота строки',min:10,max:200},{key:'gap',label:'Отступ',min:0,max:40}].map(({key,label,min,max})=>(
        <Lbl key={key} label={label}>
          <input type="number" value={page.grid[key]} min={min} max={max}
            onChange={e=>{const v=Number(e.target.value);if(v>=min&&v<=max)setGrid(key,v)}}
            className={inputCls+' font-num'}/>
        </Lbl>
      ))}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-container)] p-3 text-[11px] leading-relaxed" style={{color:'var(--text-secondary)'}}>
        Выберите виджет для редактирования<br/>
        <span style={{color:'var(--text-muted)'}}>Ctrl+Z · Delete · Ctrl+D · Ctrl+C/V</span>
      </div>
    </div>
  )
}

function PropertiesPanel({ widget, page, onChange, onRemove, onPageChange, onClose }) {
  const plugin = get(widget?.type)
  const schema = plugin?.configSchema||[]
  const mainFields = schema.filter(f=>!f.bindsDataSource)

  const update=(field,val)=>onChange(w=>{
    const props={...w.props,[field.key]:val}
    let dataSource=w.dataSource
    if(field.bindsDataSource){const dsKey=field.bindsDataSource===true?'channel':field.bindsDataSource;dataSource={...(w.dataSource||{}),[dsKey]:val}}
    return{...w,props,dataSource}
  })

  return (
    <div className="flex h-full flex-col glass-strong">
      <div className="flex shrink-0 items-center justify-between px-4 py-3" style={{borderBottom:'1px solid var(--glass-border)'}}>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[13px]" style={{color:'var(--accent-text)'}}>settings</span>
            <span className="tech-label" style={{color:'var(--accent-text)'}}>Свойства</span>
          </div>
          <div className="mt-0.5 text-[14px] font-semibold" style={{color:'var(--text-primary)'}}>
            {widget?(plugin?.name||widget.type):(page?.name||'Страница')}
          </div>
          {widget&&<div className="mt-0.5 font-mono text-[10px]" style={{color:'var(--text-muted)'}}>ID:#{widget.id.slice(-8).toUpperCase()}</div>}
        </div>
      </div>

      <div className="flex-1 space-y-3.5 overflow-y-auto p-4">
        {!widget&&page&&<PageSettings page={page} onPageChange={onPageChange}/>}
        {widget&&(
          <>
            {mainFields.length>0&&(<><Divider label="Внешний вид"/>{mainFields.map(f=><Field key={f.key} field={f} value={widget.props[f.key]} onChange={v=>update(f,v)}/>)}</>)}
            <WsSection widget={widget} onChange={onChange}/>
            <Divider label="Положение"/>
            <div className="grid grid-cols-4 gap-2">
              {[{k:'x',l:'X'},{k:'y',l:'Y'},{k:'w',l:'Ширина'},{k:'h',l:'Высота'}].map(({k,l})=>(
                <div key={k} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-container)] px-2 py-1.5">
                  <div className="tech-label text-[8px] mb-0.5">{l}</div>
                  <input type="number" min={k==='w'||k==='h'?1:0} value={widget.layout[k]}
                    onChange={e=>{const v=Number(e.target.value);if(Number.isFinite(v)&&v>=0)onChange(w=>({...w,layout:{...w.layout,[k]:v}}))}}
                    className="w-full bg-transparent font-mono text-[13px] font-semibold outline-none"
                    style={{color:'var(--text-primary)'}}/>
                </div>
              ))}
            </div>
            <Lbl label="Блокировка" hint="Запретить перемещение" inline>
              <button onClick={()=>onChange(w=>({...w,locked:!w.locked}))}
                className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${widget.locked?'bg-amber-400':'bg-[rgba(0,0,0,0.15)]'}`}>
                <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${widget.locked?'translate-x-4':''}`}/>
              </button>
            </Lbl>
          </>
        )}
      </div>

      {widget&&(
        <div className="shrink-0 p-4" style={{borderTop:'1px solid var(--glass-border)'}}>
          <button onClick={onRemove}
            className="flex w-full items-center justify-center gap-1.5 py-2 rounded-xl border border-red-500/20 text-[12px] font-medium transition-colors hover:bg-red-500/10"
            style={{color:'var(--error-text)'}}>
            <span className="material-symbols-outlined text-[14px]">delete</span>
            Удалить виджет
          </button>
        </div>
      )}
    </div>
  )
}

export default PropertiesPanel
