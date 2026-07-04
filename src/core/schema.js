import { get } from './registry'

export const SCHEMA_VERSION = 2
export const DEFAULT_GRID = { cols: 12, rowHeight: 40, gap: 12 }

let _seq = 0
export function uid(prefix = 'w') {
  _seq += 1
  return `${prefix}_${Date.now().toString(36)}_${_seq.toString(36)}`
}

export function emptyPage(name = 'Страница 1') {
  return { id: uid('p'), name, grid: { ...DEFAULT_GRID }, widgets: [] }
}

export function emptyConfig(title = 'Новый проект') {
  return { version: SCHEMA_VERSION, title, pages: [emptyPage('Главная')] }
}

export function makeWidget(type, x = 0, y = 0) {
  const plugin = get(type)
  if (!plugin) throw new Error(`Неизвестный тип виджета: ${type}`)
  const { w, h } = plugin.defaultSize
  return {
    id: uid(),
    type,
    layout: { x, y, w, h },
    props: structuredClone(plugin.defaultProps || {}),
    dataSource: { channel: plugin.defaultProps?.channel || '', wsUrl: plugin.defaultProps?.wsUrl || '' },
    locked: false
  }
}

function normalizeWidget(w) {
  return {
    id: w.id || uid(),
    type: w.type,
    layout: {
      x: num(w.layout?.x, 0),
      y: num(w.layout?.y, 0),
      w: num(w.layout?.w, 3),
      h: num(w.layout?.h, 3)
    },
    props: w.props || {},
    dataSource: w.dataSource || null,
    locked: !!w.locked
  }
}

function normalizePage(p) {
  return {
    id: p.id || uid('p'),
    name: typeof p.name === 'string' ? p.name : 'Страница',
    grid: { ...DEFAULT_GRID, ...(p.grid || {}) },
    widgets: Array.isArray(p.widgets)
      ? p.widgets.filter((w) => w && w.type && w.layout).map(normalizeWidget)
      : []
  }
}

export function normalize(config) {
  if (!config || typeof config !== 'object') return emptyConfig()
  if (!config.pages) {
    return {
      version: SCHEMA_VERSION,
      title: typeof config.title === 'string' ? config.title : 'Панель',
      pages: [normalizePage({
        id: uid('p'),
        name: 'Страница 1',
        grid: config.grid,
        widgets: config.widgets
      })]
    }
  }
  return {
    version: SCHEMA_VERSION,
    title: typeof config.title === 'string' ? config.title : 'Проект',
    pages: Array.isArray(config.pages) && config.pages.length
      ? config.pages.map(normalizePage)
      : [emptyPage()]
  }
}

function num(v, d) {
  return Number.isFinite(+v) ? +v : d
}

export function toRGL(widgets) {
  return widgets.map((w) => {
    const plugin = get(w.type)
    const min = plugin?.minSize || { w: 1, h: 1 }
    return {
      i: w.id,
      ...w.layout,
      minW: min.w,
      minH: min.h,
      isDraggable: !w.locked,
      isResizable: !w.locked
    }
  })
}

export function applyLayout(widgets, layout) {
  const byId = Object.fromEntries(layout.map((l) => [l.i, l]))
  return widgets.map((w) => {
    const l = byId[w.id]
    if (!l) return w
    const { x, y, w: ww, h } = w.layout
    if (l.x === x && l.y === y && l.w === ww && l.h === h) return w
    return { ...w, layout: { x: l.x, y: l.y, w: l.w, h: l.h } }
  })
}

export function demoConfig() {
  const WS_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'wss://badmaevoleg.hlab.kz/expo-ws'
    : 'ws://localhost:8081'

  const W = (type, x, y, w, h, props = {}, channel) => ({
    id: uid(), type,
    layout: { x, y, w, h },
    props,
    dataSource: { channel: channel || '', wsUrl: channel ? WS_URL : '' },
    locked: false
  })

  const page1 = {
    id: uid('p'), name: 'Главный зал',
    grid: { cols: 12, rowHeight: 40, gap: 12 },
    widgets: [
      W('hero', 0, 0, 7, 8, {
        title: 'ЭКСПО. Технологии будущего',
        subtitle: 'Интерактивная платформа для управления выставочными стендами. Данные в реальном времени, полная настройка без кода.',
        buttonLabel: 'Подробнее', buttonUrl: 'https://badmaevoleg.hlab.kz/expo/', accent: 'var(--data-blue)',
        showStats: true,
        stat1Label: 'Посетителей', stat1Channel: 'metric.visitors',
        stat2Label: 'Датчиков',    stat2Channel: 'metric.screens',
        stat3Label: 'Аптайм',      stat3Channel: 'metric.uptime',
      }, 'metric.visitors'),
      W('chart',  7, 0, 5, 4, { title: 'Посещаемость · Сегодня', kind: 'line', color: 'var(--data-blue)' }, 'chart.visitors'),
      W('metric', 7, 4, 2, 3, { label: 'Посетители', unit: 'чел', accent: 'var(--data-blue)' }, 'metric.visitors'),
      W('metric', 9, 4, 3, 3, { label: 'Стенды онлайн', unit: '', accent: 'var(--success)' }, 'metric.screens'),
      W('chart',  0, 8, 6, 5, { title: 'Активность по часам', kind: 'bar', color: 'var(--data-teal)' }, 'chart.realtime'),
      W('gauge',  6, 8, 3, 5, { label: 'Температура', unit: '°C', min: 0, max: 50, color: 'var(--data-blue)' }, 'sensor.temp'),
      W('gauge',  9, 8, 3, 5, { label: 'Влажность', unit: '%', min: 0, max: 100, color: 'var(--data-teal)' }, 'sensor.humidity'),
    ]
  }

  const page2 = {
    id: uid('p'), name: 'Аналитика',
    grid: { cols: 12, rowHeight: 40, gap: 12 },
    widgets: [
      W('text', 0, 0, 8, 2, { text: 'ЭКСПО. Аналитический дашборд', align: 'left', size: 'lg', accent: true }),
      W('clock', 8, 0, 2, 2, { label: '', tz: 'local' }),
      W('statuscard', 10, 0, 2, 2, { label: 'Статус', icon: 'check_circle', accent: 'var(--success)', status: 'Норма' }, 'sensor.signal'),
      W('heatmap', 0, 2, 8, 8, { title: 'Зал А - Тепловая карта посещаемости', status: 'Системы в норме' }, 'metric.visitors'),
      W('radialgauge', 8, 2, 4, 5, {
        label: 'Заполненность зала', unit: '%', min: 0, max: 100,
        accent: 'var(--data-blue)', deltaText: '+2.4% /час',
        metric1Label: 'Сейчас', metric1Value: '142 чел',
        metric2Label: 'Пиковое', metric2Value: '200 чел',
      }, 'sensor.signal'),
      W('environment', 8, 7, 4, 3, { label: 'Микроклимат зала', accent: 'var(--data-blue)' }, 'sensor.temp'),
      W('chart',       0, 10, 8, 5, { title: 'Поток посетителей', kind: 'line', color: 'var(--data-blue)' }, 'chart.visitors'),
      W('activitylog', 8, 10, 4, 5, { title: 'Системный журнал' }, 'metric.errors'),
      W('metric', 0, 15, 3, 3, { label: 'Вовлечённость', unit: '%', accent: 'var(--data-teal)' }, 'metric.engagement'),
      W('metric', 3, 15, 3, 3, { label: 'Среднее время', unit: 'мин', accent: 'var(--data-blue)' }, 'metric.dwell'),
      W('metric', 6, 15, 3, 3, { label: 'Нагрузка сети', unit: 'Вт', accent: '#EAB308' }, 'sensor.load'),
      W('chart',  9, 15, 3, 3, { title: 'Зоны активности', kind: 'bar', color: 'var(--data-teal)' }, 'chart.zones'),
    ]
  }

  const page3 = {
    id: uid('p'), name: 'Тех. мониторинг',
    grid: { cols: 12, rowHeight: 40, gap: 12 },
    widgets: [
      W('text', 0, 0, 12, 1, { text: 'ТЕЛЕМЕТРИЯ ОБОРУДОВАНИЯ — Кластер А', align: 'left', size: 'lg', accent: true }),
      W('metric', 0, 1, 3, 3, { label: 'CPU · СРВ-01',  unit: '%',  accent: 'var(--data-blue)' }, 'sensor.cpu'),
      W('metric', 3, 1, 3, 3, { label: 'RAM · СРВ-01',  unit: 'ГБ', accent: 'var(--data-teal)' }, 'sensor.ram'),
      W('metric', 6, 1, 3, 3, { label: 'CPU · СРВ-02',  unit: '%',  accent: 'var(--data-blue)' }, 'sensor.disk'),
      W('radialgauge', 9, 1, 3, 7, {
        label: 'Доступность', unit: '%', min: 0, max: 100,
        accent: 'var(--success)', deltaText: '99.9% аптайм',
        metric1Label: 'СРВ-01 RAM', metric1Value: '16 ГБ',
        metric2Label: 'СРВ-02 RAM', metric2Value: '8 ГБ',
      }, 'sensor.cpu'),
      W('chart', 0, 4, 6, 4, { title: 'Производительность серверов', kind: 'line', color: 'var(--data-blue)' }, 'chart.servers'),
      W('chart', 6, 4, 3, 4, { title: 'Сетевой трафик', kind: 'bar', color: 'var(--data-teal)' }, 'chart.network'),
      W('network', 0, 8, 7, 6, { title: 'Топология сети' }, 'chart.network'),
      W('statuscard', 7, 8, 2, 3, { label: 'Активных узлов', icon: 'hub', accent: 'var(--success)', maxValue: 10, status: 'Всё в норме' }, 'metric.screens'),
      W('statuscard', 9, 8, 3, 3, { label: 'Запросов/сек', icon: 'speed', accent: 'var(--data-blue)', unit: 'rps' }, 'metric.rps'),
      W('gauge', 7, 11, 2, 3, { label: 'RAM', unit: '%', min: 0, max: 100, color: 'var(--data-teal)' }, 'sensor.ram'),
      W('gauge', 9, 11, 3, 3, { label: 'Диск', unit: '%', min: 0, max: 100, color: 'var(--success)' }, 'sensor.disk'),
    ]
  }

  const page4 = {
    id: uid('p'), name: 'Датчики',
    grid: { cols: 12, rowHeight: 40, gap: 12 },
    widgets: [
      W('statuscard', 0, 0, 3, 3, { label: 'Всего активных', icon: 'sensors', accent: 'var(--data-blue)', maxValue: 200, status: 'Все системы в норме', statusColor: 'var(--success)' }, 'metric.screens'),
      W('statuscard', 3, 0, 3, 3, { label: 'Ср. сигнал', icon: 'wifi', accent: 'var(--data-teal)', unit: '%', maxValue: 100 }, 'sensor.signal'),
      W('statuscard', 6, 0, 3, 3, { label: 'Низкий заряд', icon: 'battery_alert', accent: '#ff4466', status: 'Требует внимания', statusColor: '#ff4466' }, 'metric.errors'),
      W('statuscard', 9, 0, 3, 3, { label: 'Объём данных', icon: 'data_usage', accent: 'var(--success)', unit: 'ГБ/ч' }, 'metric.rps'),
      W('environment', 0, 3, 4, 5, { label: 'Микроклимат · Зона А', accent: 'var(--data-blue)' }, 'sensor.temp'),
      W('environment', 4, 3, 4, 5, { label: 'Безопасность · Периметр', accent: 'var(--data-teal)' }, 'sensor.motion'),
      W('environment', 8, 3, 4, 5, { label: 'Освещение · Сектор 4', accent: 'var(--success)' }, 'sensor.light'),
      W('chart', 0, 8, 6, 5, { title: 'История температуры', kind: 'line', color: 'var(--data-blue)' }, 'chart.realtime'),
      W('chart', 6, 8, 6, 5, { title: 'CO₂ / Влажность', kind: 'line', color: 'var(--data-teal)' }, 'chart.market'),
      W('gauge', 0, 13, 3, 4, { label: 'Температура', unit: '°C', min: 0, max: 50, color: 'var(--data-blue)' }, 'sensor.temp'),
      W('gauge', 3, 13, 3, 4, { label: 'Влажность', unit: '%', min: 0, max: 100, color: 'var(--data-teal)' }, 'sensor.humidity'),
      W('gauge', 6, 13, 3, 4, { label: 'CO₂', unit: 'ppm', min: 400, max: 2000, color: 'var(--success)' }, 'sensor.co2'),
      W('gauge', 9, 13, 3, 4, { label: 'Шум', unit: 'дБ', min: 0, max: 120, color: '#EAB308' }, 'sensor.noise'),
      W('gauge', 0, 17, 3, 4, { label: 'Освещение', unit: 'лк', min: 0, max: 1000, color: '#EAB308' }, 'sensor.light'),
      W('gauge', 3, 17, 3, 4, { label: 'Давление', unit: 'гПа', min: 1000, max: 1030, color: 'var(--data-teal)' }, 'sensor.pressure'),
      W('metric', 6, 17, 3, 4, { label: 'Движение', unit: 'чел/мин', accent: 'var(--success)' }, 'sensor.motion'),
      W('chart', 9, 17, 3, 4, { title: 'Активность часов', kind: 'bar', color: 'var(--data-blue)' }, 'chart.hourly'),
    ]
  }

  const page5 = {
    id: uid('p'), name: 'Медиа',
    grid: { cols: 12, rowHeight: 40, gap: 12 },
    widgets: [
      W('text', 0, 0, 9, 2, { text: 'МЕДИА И АКТИВНОСТЬ — прямые трансляции и аналитика', align: 'left', size: 'md', accent: true }),
      W('statuscard', 9, 0, 3, 2, { label: 'Активных трансляций', icon: 'fiber_manual_record', accent: '#ff4466', status: '4 активных канала' }, 'metric.screens'),
      W('video', 0, 2, 4, 4, { src: '', label: 'Зал А · Прямой эфир', loop: true }, 'metric.screens'),
      W('video', 4, 2, 4, 4, { src: '', label: 'Экспонат 3 · Прямой эфир', loop: true }, 'metric.screens'),
      W('video', 0, 6, 4, 4, { src: '', label: 'Атриум · Прямой эфир', loop: true }, 'metric.screens'),
      W('video', 4, 6, 4, 4, { src: '', label: 'Пресс-центр · Прямой эфир', loop: true }, 'metric.screens'),
      W('metric', 8, 2, 4, 3, { label: 'Посетителей сейчас', unit: 'чел', accent: 'var(--data-blue)' }, 'metric.visitors'),
      W('metric', 8, 5, 4, 3, { label: 'Стендов онлайн', unit: '', accent: 'var(--success)' }, 'metric.screens'),
      W('chart',       8, 8, 4, 5, { title: 'Активность взаимодействий', kind: 'bar', color: 'var(--data-blue)' }, 'chart.market'),
      W('activitylog', 0, 10, 8, 5, { title: 'Журнал активности посетителей' }, 'metric.visitors'),
      W('metric', 8, 13, 4, 3, { label: 'Лиды', unit: 'контактов', accent: 'var(--success)' }, 'metric.leads'),
      W('chart',  0, 15, 8, 4, { title: 'Вовлечённость посетителей', kind: 'line', color: 'var(--data-teal)' }, 'chart.engagement'),
    ]
  }

  const page6 = {
    id: uid('p'), name: 'Итоги',
    grid: { cols: 12, rowHeight: 40, gap: 12 },
    widgets: [
      W('text', 0, 0, 12, 1, { text: 'СВОДНЫЙ ОТЧЁТ — ЭКСПО', align: 'center', size: 'xl', accent: true }),
      W('statuscard', 0, 1, 3, 3, { label: 'Всего посетителей', icon: 'groups', accent: 'var(--data-blue)', maxValue: 10000, status: 'Рекордный показатель' }, 'metric.visitors'),
      W('statuscard', 3, 1, 3, 3, { label: 'Эффективность', icon: 'bolt', accent: 'var(--success)', unit: '%', maxValue: 100 }, 'sensor.signal'),
      W('statuscard', 6, 1, 3, 3, { label: 'Датчиков онлайн', icon: 'sensors', accent: 'var(--data-teal)', maxValue: 200, status: 'Все в норме' }, 'metric.screens'),
      W('statuscard', 9, 1, 3, 3, { label: 'Время работы', icon: 'verified', accent: 'var(--data-blue)', unit: '%', maxValue: 100, status: 'Без инцидентов' }, 'sensor.signal'),
      W('chart', 0, 4, 8, 5, { title: 'Посещаемость — сегодня и вчера', kind: 'line', color: 'var(--data-blue)' }, 'chart.visitors'),
      W('radialgauge', 8, 4, 4, 5, {
        label: 'Общий рейтинг', unit: '%', min: 0, max: 100,
        accent: 'var(--success)', deltaText: 'Отлично',
        metric1Label: 'Энергия', metric1Value: '142 кВт',
        metric2Label: 'Воздух AQI', metric2Value: 'Хорошо',
      }, 'sensor.signal'),
      W('environment',  0, 9, 3, 4, { label: 'Микроклимат', accent: 'var(--data-blue)' }, 'sensor.temp'),
      W('network',      3, 9, 5, 4, { title: 'Состояние сети' }, 'chart.network'),
      W('metric', 0, 13, 4, 3, { label: 'Вовлечённость', unit: '%', accent: 'var(--data-teal)' }, 'metric.engagement'),
      W('metric', 4, 13, 4, 3, { label: 'Лиды', unit: 'контактов', accent: 'var(--success)' }, 'metric.leads'),
      W('chart',  8, 13, 4, 3, { title: 'Тренды по зонам', kind: 'bar', color: '#EAB308' }, 'chart.zones'),
      W('activitylog',  8, 9, 4, 4, { title: 'Последние события' }, 'metric.errors'),
    ]
  }

  const page7 = {
    id: uid('p'), name: 'Проекты',
    grid: { cols: 12, rowHeight: 40, gap: 12 },
    widgets: [
      W('text', 0, 0, 9, 2, { text: 'АКТИВНЫЕ ПРОЕКТЫ — управление выставочными интерфейсами', align: 'left', size: 'md', accent: true }),
      W('statuscard', 9, 0, 3, 2, { label: 'Всего проектов', icon: 'folder_open', accent: 'var(--data-blue)' }, 'metric.screens'),
      W('projectcard', 0, 2, 4, 7, { name: 'Умный город', description: 'Интерактивная карта главного зала', status: 'active', sensors: '142', uptime: '99.9%' }, 'metric.rps'),
      W('projectcard', 4, 2, 4, 7, { name: 'Арт-галерея', description: 'Генеративное медиа-арт шоу', status: 'draft', sensors: '--', uptime: '--' }, 'metric.rps'),
      W('projectcard', 8, 2, 4, 7, { name: 'АвтоШоу 2026', description: 'Телеметрия транспортных средств', status: 'scheduled', sensors: '0', uptime: '14 дн.' }, 'metric.rps'),
      W('metric', 0, 9, 3, 3, { label: 'Активных сессий', unit: '', accent: 'var(--success)' }, 'metric.visitors'),
      W('metric', 3, 9, 3, 3, { label: 'API Запросов', unit: '/с', accent: 'var(--data-blue)' }, 'metric.rps'),
      W('chart',  6, 9, 6, 3, { title: 'Активность деплоев', kind: 'bar', color: 'var(--data-blue)' }, 'chart.market'),
    ]
  }

  return { version: SCHEMA_VERSION, title: 'ЭКСПО конструктор', pages: [page1, page2, page3, page4, page5, page6, page7] }
}
