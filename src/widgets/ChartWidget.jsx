import { useRealtime } from '../core/useRealtime'
import Sparkline from './Sparkline'
import { IconChart } from './icons'

function ChartWidget({ props, dataSource }) {
  const { history } = useRealtime(dataSource?.channel, { wsUrl: dataSource?.wsUrl })
  const data = history.length ? history : props.sample || []
  const last = data.at(-1)
  const first = data[0]
  const trend = data.length > 1 && last != null && first != null ? last - first : null
  const up = trend != null && trend >= 0

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{props.title}</span>
          {trend != null && (
            <span className="text-[11px] font-semibold" style={{ color: up ? 'var(--success)' : 'var(--error)' }}>
              {up ? '▲' : '▼'} {Math.abs(trend).toLocaleString('ru-RU', { maximumFractionDigits: 1 })}
            </span>
          )}
        </div>
      </div>
      <div className="mt-1 min-h-0 flex-1">
        <Sparkline data={data} kind={props.kind} color={props.color || 'var(--data-blue)'} />
      </div>
      {dataSource?.channel && last != null && (
        <div className="mt-1 flex justify-end">
          <span className="font-num text-[11px] font-semibold" style={{ color: props.color || 'var(--data-blue)' }}>
            {typeof last === 'number' ? last.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) : last}
          </span>
        </div>
      )}
    </div>
  )
}

export default {
  type: 'chart',
  name: 'График',
  group: 'Данные',
  icon: IconChart,
  realtime: true,
  defaultSize: { w: 5, h: 4 },
  minSize: { w: 2, h: 3 },
  defaultProps: { title: 'Данные в реальном времени', kind: 'line', color: '', channel: 'chart.realtime', wsUrl: '' },
  configSchema: [
    { key: 'title', label: 'Заголовок', type: 'text' },
    { key: 'kind', label: 'Тип', type: 'select', options: [{ value: 'line', label: 'Линейный' }, { value: 'bar', label: 'Столбчатый' }] },
    { key: 'color', label: 'Цвет', type: 'color' },
    { key: 'channel', label: 'Канал данных', type: 'channel', bindsDataSource: true },
    { key: 'wsUrl', label: 'URL WebSocket', type: 'url', placeholder: 'ws://host:8081', bindsDataSource: 'wsUrl' }
  ],
  Component: ChartWidget
}
