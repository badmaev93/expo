import { WebSocketServer } from 'ws'

const PORT = process.env.WS_PORT || 8081
const HOST = process.env.WS_HOST || '127.0.0.1'
const wss = new WebSocketServer({ port: PORT, host: HOST })

const rnd = (min, max) => min + Math.random() * (max - min)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

function walker(start, min, max, step) {
  let v = start
  return () => { v = clamp(v + rnd(-step, step), min, max); return +v.toFixed(1) }
}

function iwalker(start, min, max, step) {
  const g = walker(start, min, max, step)
  return () => Math.round(g())
}

function counter(start, min, max) {
  let v = start
  return () => { v += Math.round(rnd(min, max)); return v }
}

function seriesGen(len, min, max) {
  const data = Array.from({ length: len }, () => Math.round(rnd(min, max)))
  return () => {
    data.push(Math.round(clamp(data[data.length - 1] + rnd(-(max - min) / 6, (max - min) / 6), min, max)))
    data.shift()
    return [...data]
  }
}

const channels = {
  'sensor.temp':     { every: 1500, gen: walker(23, 18, 32, 0.8) },
  'sensor.co2':      { every: 2000, gen: walker(620, 420, 1600, 60) },
  'sensor.humidity': { every: 2000, gen: walker(45, 30, 70, 2) },
  'sensor.noise':    { every: 1200, gen: walker(55, 35, 95, 6) },
  'sensor.battery':  { every: 4000, gen: walker(82, 40, 100, 1.5) },
  'sensor.signal':   { every: 3000, gen: walker(74, 30, 100, 5) },
  'sensor.cpu':      { every: 1500, gen: walker(42, 10, 95, 8) },
  'sensor.ram':      { every: 2000, gen: walker(68, 30, 90, 3) },
  'sensor.disk':     { every: 8000, gen: walker(54, 20, 85, 1) },
  'metric.visitors': { every: 2000, gen: iwalker(127, 80, 250, 8) },
  'metric.screens':  { every: 6000, gen: () => Math.round(rnd(8, 16)) },
  'metric.leads':    { every: 5000, gen: counter(86, 0, 2) },
  'metric.uptime':   { every: 8000, gen: () => +rnd(99.2, 99.99).toFixed(2) },
  'metric.rps':      { every: 1500, gen: iwalker(340, 100, 800, 40) },
  'metric.errors':   { every: 3000, gen: walker(0.3, 0, 5, 0.2) },
  'chart.realtime':  { every: 800,  series: seriesGen(40, 20, 100) },
  'chart.market':    { every: 1200, series: seriesGen(30, 10, 90) },
  'chart.servers':   { every: 1000, series: seriesGen(35, 5, 95) },
  'chart.network':   { every: 900,  series: seriesGen(25, 15, 80) },
  'chart.visitors':  { every: 1000, series: seriesGen(40, 50, 250) },
  'sensor.aqi':        { every: 3000, gen: walker(12, 5, 45, 2) },
  'sensor.light':      { every: 2500, gen: walker(420, 150, 800, 30) },
  'sensor.load':       { every: 1500, gen: iwalker(142, 80, 195, 5) },
  'sensor.pressure':   { every: 5000, gen: walker(1013, 1005, 1025, 0.5) },
  'sensor.motion':     { every: 1000, gen: iwalker(8, 0, 30, 3) },
  'metric.engagement': { every: 2000, gen: walker(72, 40, 95, 4) },
  'metric.dwell':      { every: 3000, gen: walker(8.5, 3, 20, 0.5) },
  'metric.battery':    { every: 4000, gen: walker(82, 40, 100, 1.5) },
  'metric.uptime':     { every: 8000, gen: () => +rnd(99.2, 99.99).toFixed(2) },
  'chart.engagement':  { every: 1100, series: seriesGen(35, 40, 95) },
  'chart.hourly':      { every: 1500, series: seriesGen(24, 20, 280) },
  'chart.zones':       { every: 1200, series: seriesGen(30, 10, 100) },
}

const clients = new Set()
wss.on('connection', ws => {
  clients.add(ws)
  for (const [channel, def] of Object.entries(channels)) {
    if (def.series) ws.send(payload(channel, def.series()))
    else ws.send(payload(channel, def.gen()))
  }
  ws.on('close', () => clients.delete(ws))
})

function payload(channel, v) {
  const msg = { channel, ts: Date.now() }
  if (Array.isArray(v)) { msg.series = v; msg.value = v[v.length - 1] }
  else { msg.value = v }
  return JSON.stringify(msg)
}

function broadcast(channel, v) {
  const data = payload(channel, v)
  clients.forEach(ws => ws.readyState === ws.OPEN && ws.send(data))
}

for (const [channel, def] of Object.entries(channels)) {
  setInterval(() => broadcast(channel, def.series ? def.series() : def.gen()), def.every)
}

console.log(`[ws] Server started on ws://${HOST}:${PORT}`)
console.log(`[ws] Channels: ${Object.keys(channels).length}`)
