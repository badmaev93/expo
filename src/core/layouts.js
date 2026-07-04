import { makeWidget, uid, emptyPage } from './schema'

const TYPE_COLOR = {
  hero:        '#0061A5',
  metric:      '#0061A5',
  chart:       '#0D99FF',
  gauge:       '#079455',
  radialgauge: '#079455',
  video:       '#0D9488',
  image:       '#0D99FF',
  text:        '#525F73',
  clock:       '#0D9488',
  statuscard:  '#7C3AED',
  environment: '#079455',
  activitylog: '#B54708',
  heatmap:     '#0D99FF',
  network:     '#7C3AED',
  markettrend: '#B54708',
  projectcard: '#0061A5',
}

const TYPE_LABEL = {
  hero: 'Баннер', metric: 'KPI', chart: 'График', gauge: 'Датчик',
  radialgauge: 'Круг', video: 'Видео', image: 'Фото', text: 'Текст',
  clock: 'Часы', statuscard: 'Статус', environment: 'Климат',
  activitylog: 'Журнал', heatmap: 'Теплокарта', network: 'Сеть',
  markettrend: 'Тренды', projectcard: 'Проект',
}

function colorOf(type) { return TYPE_COLOR[type] || '#707884' }

export function buildThumb(items, cols = 12) {
  const maxRow = Math.max(...items.map(i => i.y + i.h))
  const W = 240, H = 140
  const cw = W / cols
  const rh = H / maxRow
  return {
    W, H,
    rects: items.map(i => ({
      x: i.x * cw + 1.5, y: i.y * rh + 1.5,
      w: i.w * cw - 3,   h: i.h * rh - 3,
      color: colorOf(i.type),
      label: TYPE_LABEL[i.type] || i.type,
    }))
  }
}

export function applyPreset(preset) {
  const page = emptyPage(preset.name)
  page.grid = { ...page.grid, ...preset.grid }
  page.widgets = preset.items.map(({ type, x, y, w, h }) => {
    const widget = makeWidget(type, x, y)
    widget.id = uid()
    widget.layout.w = w
    widget.layout.h = h
    return widget
  })
  return page
}

const G = { cols: 12, rowHeight: 40, gap: 12 }

export const PRESETS = [
  {
    id: 'exhibition-hall',
    name: 'Выставочный зал',
    desc: 'Баннер + живые метрики + графики',
    grid: G,
    items: [
      { type: 'hero',   x: 0, y: 0, w: 7, h: 6 },
      { type: 'metric', x: 7, y: 0, w: 5, h: 3 },
      { type: 'metric', x: 7, y: 3, w: 5, h: 3 },
      { type: 'chart',  x: 0, y: 6, w: 7, h: 5 },
      { type: 'chart',  x: 7, y: 6, w: 5, h: 5 },
    ],
  },
  {
    id: 'analytics-hall',
    name: 'Аналитика зала',
    desc: 'Тепловая карта + заполненность + журнал',
    grid: G,
    items: [
      { type: 'heatmap',     x: 0, y: 0, w: 8, h: 8 },
      { type: 'radialgauge', x: 8, y: 0, w: 4, h: 5 },
      { type: 'environment', x: 8, y: 5, w: 4, h: 3 },
      { type: 'chart',       x: 0, y: 8, w: 8, h: 4 },
      { type: 'activitylog', x: 8, y: 8, w: 4, h: 4 },
    ],
  },
  {
    id: 'command-center',
    name: 'Центр управления',
    desc: '4 KPI + главный график + датчик',
    grid: G,
    items: [
      { type: 'metric', x: 0, y: 0, w: 3, h: 3 },
      { type: 'metric', x: 3, y: 0, w: 3, h: 3 },
      { type: 'metric', x: 6, y: 0, w: 3, h: 3 },
      { type: 'metric', x: 9, y: 0, w: 3, h: 3 },
      { type: 'chart',  x: 0, y: 3, w: 8, h: 5 },
      { type: 'gauge',  x: 8, y: 3, w: 4, h: 5 },
    ],
  },
  {
    id: 'tech-monitoring',
    name: 'Тех. мониторинг',
    desc: 'Топология сети + статусы + датчики',
    grid: G,
    items: [
      { type: 'network',    x: 0, y: 0, w: 7, h: 6 },
      { type: 'statuscard', x: 7, y: 0, w: 5, h: 3 },
      { type: 'radialgauge',x: 7, y: 3, w: 5, h: 3 },
      { type: 'chart',      x: 0, y: 6, w: 7, h: 4 },
      { type: 'activitylog',x: 7, y: 6, w: 5, h: 4 },
    ],
  },
  {
    id: 'sensor-hub',
    name: 'Датчики',
    desc: '4 датчика + климат + история',
    grid: G,
    items: [
      { type: 'gauge',       x: 0, y: 0, w: 3, h: 4 },
      { type: 'gauge',       x: 3, y: 0, w: 3, h: 4 },
      { type: 'gauge',       x: 6, y: 0, w: 3, h: 4 },
      { type: 'environment', x: 9, y: 0, w: 3, h: 4 },
      { type: 'chart',       x: 0, y: 4, w: 12, h: 4 },
    ],
  },
  {
    id: 'media-wall',
    name: 'Медиастена',
    desc: 'Видеопоток + метрики + график',
    grid: G,
    items: [
      { type: 'video',  x: 0, y: 0, w: 8, h: 6 },
      { type: 'metric', x: 8, y: 0, w: 4, h: 2 },
      { type: 'gauge',  x: 8, y: 2, w: 4, h: 4 },
      { type: 'chart',  x: 0, y: 6, w: 8, h: 4 },
      { type: 'metric', x: 8, y: 6, w: 4, h: 4 },
    ],
  },
  {
    id: 'digital-signage',
    name: 'Цифровая вывеска',
    desc: 'Часы + заголовок + изображение',
    grid: G,
    items: [
      { type: 'clock', x: 0, y: 0, w: 3, h: 2 },
      { type: 'text',  x: 3, y: 0, w: 9, h: 2 },
      { type: 'image', x: 0, y: 2, w: 12, h: 6 },
    ],
  },
  {
    id: 'summary',
    name: 'Сводный отчёт',
    desc: 'Статусы + рейтинг + тренды + журнал',
    grid: G,
    items: [
      { type: 'statuscard',  x: 0, y: 0, w: 3, h: 3 },
      { type: 'statuscard',  x: 3, y: 0, w: 3, h: 3 },
      { type: 'statuscard',  x: 6, y: 0, w: 3, h: 3 },
      { type: 'statuscard',  x: 9, y: 0, w: 3, h: 3 },
      { type: 'chart',       x: 0, y: 3, w: 8, h: 5 },
      { type: 'radialgauge', x: 8, y: 3, w: 4, h: 5 },
      { type: 'markettrend', x: 0, y: 8, w: 4, h: 5 },
      { type: 'activitylog', x: 4, y: 8, w: 4, h: 5 },
      { type: 'environment', x: 8, y: 8, w: 4, h: 5 },
    ],
  },
  {
    id: 'projects',
    name: 'Проекты',
    desc: 'Карточки проектов + метрики',
    grid: G,
    items: [
      { type: 'projectcard', x: 0, y: 0, w: 4, h: 7 },
      { type: 'projectcard', x: 4, y: 0, w: 4, h: 7 },
      { type: 'projectcard', x: 8, y: 0, w: 4, h: 7 },
      { type: 'metric',      x: 0, y: 7, w: 4, h: 3 },
      { type: 'metric',      x: 4, y: 7, w: 4, h: 3 },
      { type: 'chart',       x: 8, y: 7, w: 4, h: 3 },
    ],
  },
  {
    id: 'fullscreen',
    name: 'Полный экран',
    desc: 'Один баннер на весь холст',
    grid: G,
    items: [
      { type: 'hero', x: 0, y: 0, w: 12, h: 8 },
    ],
  },
]
