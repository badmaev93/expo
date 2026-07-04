import { IconText } from './icons'

const SIZE = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl', xl: 'text-4xl tracking-tight' }
const ALIGN = { left: 'text-left items-start', center: 'text-center items-center', right: 'text-right items-end' }

function TextWidget({ props }) {
  return (
    <div className={`flex h-full flex-col justify-center ${ALIGN[props.align] || ALIGN.left}`}>
      <span
        className={`${SIZE[props.size] || SIZE.md} font-semibold leading-tight`}
        style={{ color: props.accent ? 'var(--accent)' : props.color || 'var(--text-primary)', textShadow: props.accent ? '0 0 20px color-mix(in srgb, var(--accent) 40%, transparent)' : undefined }}
      >
        {props.text}
      </span>
    </div>
  )
}

export default {
  type: 'text',
  name: 'Текст / заголовок',
  group: 'Медиа',
  icon: IconText,
  defaultSize: { w: 4, h: 1 },
  minSize: { w: 1, h: 1 },
  defaultProps: { text: 'Заголовок', size: 'lg', align: 'left', accent: false, channel: 'metric.visitors', wsUrl: '' },
  configSchema: [
    { key: 'text', label: 'Текст', type: 'textarea' },
    { key: 'size', label: 'Размер', type: 'select', options: [{ value: 'sm', label: 'Мелкий' }, { value: 'md', label: 'Средний' }, { value: 'lg', label: 'Крупный' }, { value: 'xl', label: 'Огромный' }] },
    { key: 'align', label: 'Выравнивание', type: 'select', options: [{ value: 'left', label: 'Слева' }, { value: 'center', label: 'По центру' }, { value: 'right', label: 'Справа' }] },
    { key: 'accent', label: 'Акцентный цвет', type: 'boolean' }
  ],
  Component: TextWidget
}
