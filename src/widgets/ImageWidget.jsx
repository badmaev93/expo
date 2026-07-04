import { IconImage } from './icons'

function ImageWidget({ props }) {
  if (!props.src) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        <IconImage width={28} height={28} />
        <span className="text-xs">Укажите URL изображения</span>
      </div>
    )
  }
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg" style={{ background: 'var(--bg-container)' }}>
      <img
        src={props.src}
        alt={props.caption || ''}
        className="h-full w-full"
        style={{ objectFit: props.fit || 'cover' }}
        loading="lazy"
      />
      {props.caption && (
        <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-slate-100">
          {props.caption}
        </span>
      )}
    </div>
  )
}

export default {
  type: 'image',
  name: 'Изображение',
  group: 'Медиа',
  icon: IconImage,
  defaultSize: { w: 3, h: 3 },
  minSize: { w: 1, h: 1 },
  defaultProps: { src: '', fit: 'cover', caption: '', channel: 'metric.visitors', wsUrl: '' },
  configSchema: [
    { key: 'src', label: 'URL изображения', type: 'text' },
    { key: 'fit', label: 'Заполнение', type: 'select', options: [{ value: 'cover', label: 'Обрезать' }, { value: 'contain', label: 'Вписать' }, { value: 'fill', label: 'Растянуть' }] },
    { key: 'caption', label: 'Подпись', type: 'text' }
  ],
  Component: ImageWidget
}
