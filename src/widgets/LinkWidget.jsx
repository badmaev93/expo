import { IconLink } from './icons'

const STYLES = {
  button: 'bg-sky-600 hover:bg-sky-500 text-white',
  outline: 'border-2 border-sky-500 hover:bg-sky-500/10 text-sky-400 hover:text-sky-300',
  card: 'border border-edge bg-panel hover:border-accent/60 text-slate-200',
}

function LinkWidget({ props }) {
  const open = () => {
    if (props.url) window.open(props.url, props.target || '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={open}
      className={`flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl transition-all duration-150 ${STYLES[props.style] || STYLES.button}`}
    >
      {props.icon && <span className="text-3xl leading-none">{props.icon}</span>}
      <span className="px-3 text-sm font-semibold leading-tight">{props.label || 'Ссылка'}</span>
      {props.showUrl && props.url && (
        <span className="max-w-full truncate px-2 text-[10px] opacity-50">{props.url}</span>
      )}
    </button>
  )
}

export default {
  type: 'link',
  name: 'Ссылка / кнопка',
  group: 'Контент',
  icon: IconLink,
  defaultSize: { w: 2, h: 2 },
  minSize: { w: 1, h: 1 },
  defaultProps: { label: 'Перейти', url: '', icon: '🔗', style: 'button', target: '_blank', showUrl: false },
  configSchema: [
    { key: 'label', label: 'Текст кнопки', type: 'text' },
    { key: 'url', label: 'URL (ссылка)', type: 'url' },
    { key: 'icon', label: 'Эмодзи-иконка', type: 'text' },
    { key: 'style', label: 'Стиль', type: 'select', options: [
      { value: 'button', label: 'Кнопка (заливка)' },
      { value: 'outline', label: 'Кнопка (обводка)' },
      { value: 'card', label: 'Карточка' },
    ]},
    { key: 'target', label: 'Открыть в', type: 'select', options: [
      { value: '_blank', label: 'Новой вкладке' },
      { value: '_self', label: 'Той же вкладке' },
    ]},
    { key: 'showUrl', label: 'Показать URL', type: 'boolean' },
  ],
  Component: LinkWidget,
}
