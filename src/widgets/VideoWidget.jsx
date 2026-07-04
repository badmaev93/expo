import { useEffect, useRef } from 'react'
import { IconVideo } from './icons'

function VideoWidget({ props }) {
  const ref = useRef(null)
  const src = props.src?.trim()

  useEffect(() => {
    const video = ref.current
    if (!video || !src) return
    const isHls = src.endsWith('.m3u8')
    if (isHls && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
      return () => hls.destroy()
    }
    video.src = src
  }, [src])

  if (!src) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        <IconVideo width={28} height={28} />
        <span className="text-xs">{props.label || 'Видеопоток'} - укажите URL (MP4 / HLS .m3u8)</span>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={ref}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        loop={props.loop !== false}
        controls={!!props.controls}
      />
      {props.label && (
        <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-slate-200">{props.label}</span>
      )}
      <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] text-rose-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" /> ЭФИР
      </span>
    </div>
  )
}

export default {
  type: 'video',
  name: 'Видеопоток',
  group: 'Медиа',
  icon: IconVideo,
  defaultSize: { w: 6, h: 5 },
  minSize: { w: 3, h: 3 },
  defaultProps: { src: '', label: 'Видеопоток', loop: true, controls: false , channel: 'metric.screens', wsUrl: '' },
  configSchema: [
    { key: 'src', label: 'URL потока (MP4 / HLS)', type: 'text' },
    { key: 'label', label: 'Подпись', type: 'text' },
    { key: 'loop', label: 'Зациклить', type: 'boolean' },
    { key: 'controls', label: 'Элементы управления', type: 'boolean' }
  ],
  Component: VideoWidget
}
