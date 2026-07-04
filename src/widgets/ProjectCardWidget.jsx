import { IconImage } from './icons'

const STATUS = {
  active:    { label: 'АКТИВНЫЙ',     color: 'var(--success)',  bg: 'color-mix(in srgb, var(--success) 10%, transparent)',   border: 'color-mix(in srgb, var(--success) 25%, transparent)' },
  draft:     { label: 'ЧЕРНОВИК',     color: 'var(--text-muted)',  bg: 'var(--bg-container)', border: 'var(--border-subtle)' },
  scheduled: { label: 'ЗАПЛАНИРОВАН', color: 'var(--data-blue)',  bg: 'color-mix(in srgb, var(--data-blue) 10%, transparent)', border: 'color-mix(in srgb, var(--data-blue) 25%, transparent)' },
}

function ProjectCardWidget({ props }) {
  const status  = STATUS[props.status || 'draft']
  const sensors = props.sensors ?? '—'
  const uptime  = props.uptime  ?? '—'

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between shrink-0 mb-2">
        <span className="tech-label">{props.name || 'Project Name'}</span>
        <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5"
          style={{ background: status.bg, border: `1px solid ${status.border}` }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
          <span className="text-[9px] font-bold tracking-widest" style={{ color: status.color }}>{status.label}</span>
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden min-h-0 relative"
        style={{ background: 'var(--bg-body)', border: '1px solid var(--border-subtle)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at center, color-mix(in srgb, ${status.color} 10%, transparent) 0%, transparent 70%)` }} />
        <div className="absolute inset-0 p-3 flex flex-col gap-2 z-10">
          <div className="h-3 rounded-sm w-1/3" style={{ background: 'var(--bg-container-high)' }} />
          <div className="flex-1 flex gap-2">
            <div className="w-1/4 rounded-sm" style={{ background: 'var(--bg-container-high)' }} />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-1/2 rounded-sm" style={{ background: 'var(--bg-container-high)' }} />
              <div className="h-1/2 rounded-sm" style={{ background: 'var(--bg-container-high)' }} />
            </div>
          </div>
          <div className="h-0.5 w-full rounded-full"
            style={{ background: `linear-gradient(to right, color-mix(in srgb, ${status.color} 50%, transparent), transparent)` }} />
        </div>
      </div>

      <div className="shrink-0 mt-2 mb-2">
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{props.description || 'Выставочный интерфейс'}</p>
      </div>

      <div className="shrink-0 grid grid-cols-2 gap-2 border-t pt-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="tech-label text-[8px] mb-0.5">ДАТЧИКИ</div>
          <div className="font-num text-[18px] font-light" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {sensors}
            {props.status === 'active' && (
              <span className="material-symbols-outlined text-[12px] ml-1 align-middle" style={{ color: 'var(--data-blue)' }}>wifi</span>
            )}
          </div>
        </div>
        <div>
          <div className="tech-label text-[8px] mb-0.5">{props.status === 'scheduled' ? 'ЗАПУСК' : 'АПТАЙМ'}</div>
          <div className="font-num text-[18px] font-light" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{uptime}</div>
        </div>
      </div>
    </div>
  )
}

export default {
  type: 'projectcard',
  name: 'Карточка проекта',
  group: 'Управление',
  icon: IconImage,
  defaultSize: { w: 4, h: 6 },
  minSize: { w: 3, h: 4 },
  defaultProps: { name: 'Умный город', description: 'Интерактивная карта главного зала', status: 'active', sensors: '142', uptime: '99.9%' , channel: 'metric.rps', wsUrl: '' },
  configSchema: [
    { key: 'name',        label: 'Название проекта', type: 'text' },
    { key: 'description', label: 'Описание',          type: 'textarea' },
    { key: 'status', label: 'Статус', type: 'select', options: [
      { value: 'active',    label: 'Активный'     },
      { value: 'draft',     label: 'Черновик'     },
      { value: 'scheduled', label: 'Запланирован' },
    ]},
    { key: 'sensors', label: 'Кол-во датчиков', type: 'text' },
    { key: 'uptime',  label: 'Аптайм / Запуск', type: 'text' },
  ],
  Component: ProjectCardWidget
}
