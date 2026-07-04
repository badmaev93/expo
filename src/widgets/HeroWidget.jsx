import { useRealtime } from '../core/useRealtime'
import { IconImage } from './icons'

const DEFAULT_BG = 'https://img.magnific.com/premium-photo/abstract-colorful-3d-digital-art-with-vibrant-shapes-spheres_1010509-675.jpg?semt=ais_hybrid&w=740&q=80'

function HeroStat({ icon, label, channel, fallback, sub, wsUrl }) {
  const { value } = useRealtime(channel, { wsUrl })
  const val = typeof value === 'number'
    ? value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })
    : (fallback || '—')
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'rgba(161,161,170,0.5)' }}>{icon}</span>
        <span className="tech-label truncate">{label}</span>
      </div>
      <div className="truncate" style={{ fontFamily: 'Roboto', fontSize: 'clamp(0.9rem,1.6vw,1.2rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA' }}>
        {val}
      </div>
      <div className="truncate" style={{ fontSize: 10, color: 'rgba(161,161,170,0.45)', fontFamily: 'Roboto' }}>{sub}</div>
    </div>
  )
}

function HeroWidget({ props, dataSource }) {
  const title = props.title || 'ЭКСПО. Технологии будущего'
  const subtitle = props.subtitle || 'Платформа для управления выставочными стендами. Данные в реальном времени, без кода.'
  const btnLabel = props.buttonLabel || 'Подробнее'
  const accentColor = props.accent || '#0D99FF'
  const bgImage = props.bgImage ?? DEFAULT_BG

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl"
      style={{ background: 'var(--hero-bg)' }}>

      {bgImage && (
        <>
          <img src={bgImage} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(8,14,26,0.88) 0%, rgba(8,14,26,0.6) 55%, rgba(8,14,26,0.35) 100%)' }} />
        </>
      )}

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="ha1" cx="80%" cy="20%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.12"/>
            <stop offset="100%" stopColor={accentColor} stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="ha2" cx="10%" cy="85%" r="40%">
            <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="480" cy="80" rx="200" ry="160" fill="url(#ha1)"/>
        <ellipse cx="60" cy="340" rx="160" ry="130" fill="url(#ha2)"/>
        {Array.from({length:9},(_,i) => (
          <line key={`gv${i}`} x1={i*75} y1="0" x2={i*75} y2="400"
            stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
        ))}
        {Array.from({length:7},(_,i) => (
          <line key={`gh${i}`} x1="0" y1={i*67} x2="600" y2={i*67}
            stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
        ))}
      </svg>

      <div className="relative z-10 flex h-full flex-col justify-between gap-2 p-5 overflow-hidden">
        <div className="flex flex-col gap-3 max-w-[70%]">
          <span className="badge-live" style={{ width: 'fit-content' }}>ЭКСПО · В ЭФИРЕ</span>
          <h2 style={{
            fontFamily: 'Roboto', fontWeight: 700, margin: 0,
            fontSize: 'clamp(1.1rem, 2.6vw, 2rem)',
            lineHeight: 1.1, letterSpacing: '-0.025em',
            color: '#FAFAFA',
          }}>
            {title}
          </h2>
          <p style={{
            fontFamily: 'Roboto', margin: 0,
            fontSize: 'clamp(0.75rem, 1.4vw, 0.9rem)',
            lineHeight: 1.5, color: 'rgba(200,205,215,0.75)',
            maxWidth: 380, display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {subtitle}
          </p>
          <a
            href={props.buttonUrl || undefined}
            target={props.buttonUrl ? '_blank' : undefined}
            rel={props.buttonUrl ? 'noopener noreferrer' : undefined}
            style={{
              marginTop: 8, alignSelf: 'flex-start', textDecoration: 'none',
              padding: '7px 18px', borderRadius: 8,
              background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
              border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
              color: accentColor, fontSize: 12, fontWeight: 600,
              fontFamily: 'Roboto', cursor: props.buttonUrl ? 'pointer' : 'default',
              letterSpacing: '0.01em', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `color-mix(in srgb, ${accentColor} 25%, transparent)`; e.currentTarget.style.borderColor = `color-mix(in srgb, ${accentColor} 45%, transparent)` }}
            onMouseLeave={e => { e.currentTarget.style.background = `color-mix(in srgb, ${accentColor} 15%, transparent)`; e.currentTarget.style.borderColor = `color-mix(in srgb, ${accentColor} 30%, transparent)` }}
            onMouseDown={e => e.stopPropagation()}
          >
            {btnLabel}
          </a>
        </div>

        {props.showStats !== false && (
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12,
            paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)', minHeight: 0,
          }}>
            <HeroStat icon="groups"   label={props.stat1Label || 'Посетителей'} channel={props.stat1Channel} fallback="2 847" sub="сейчас"  wsUrl={dataSource?.wsUrl} />
            <HeroStat icon="sensors"  label={props.stat2Label || 'Датчиков'}    channel={props.stat2Channel} fallback="32"    sub="онлайн" wsUrl={dataSource?.wsUrl} />
            <HeroStat icon="verified" label={props.stat3Label || 'Аптайм'}      channel={props.stat3Channel} fallback="99.9%" sub="за 30 дн" wsUrl={dataSource?.wsUrl} />
          </div>
        )}
      </div>
    </div>
  )
}

export default {
  type: 'hero',
  name: 'Баннер',
  group: 'Медиа',
  icon: IconImage,
  defaultSize: { w: 7, h: 6 },
  minSize: { w: 4, h: 4 },
  defaultProps: {
    title: 'ЭКСПО. Технологии будущего',
    subtitle: 'Платформа для управления выставочными стендами в реальном времени. Без кода.',
    buttonLabel: 'Подробнее',
    buttonUrl: '',
    accent: '',
    bgImage: DEFAULT_BG,
    showStats: true,
    stat1Label: 'Посетителей', stat1Channel: 'metric.visitors',
    stat2Label: 'Датчиков',    stat2Channel: 'metric.screens',
    stat3Label: 'Аптайм',      stat3Channel: 'metric.uptime',
    channel: 'metric.visitors', wsUrl: '',
  },
  configSchema: [
    { key: 'title', label: 'Заголовок', type: 'text' },
    { key: 'subtitle', label: 'Подзаголовок', type: 'textarea' },
    { key: 'buttonLabel', label: 'Текст кнопки', type: 'text' },
    { key: 'buttonUrl', label: 'Ссылка кнопки', type: 'url', placeholder: 'https://example.com' },
    { key: 'accent', label: 'Цвет акцента', type: 'color' },
    { key: 'bgImage', label: 'Фоновое изображение (URL)', type: 'url', placeholder: 'https://…/image.jpg' },
    { key: 'showStats', label: 'Показывать статистику', type: 'boolean' },
    { key: 'stat1Label', label: 'Стат 1 - подпись', type: 'text' },
    { key: 'stat1Channel', label: 'Стат 1 - канал', type: 'channel' },
    { key: 'stat2Label', label: 'Стат 2 - подпись', type: 'text' },
    { key: 'stat2Channel', label: 'Стат 2 - канал', type: 'channel' },
    { key: 'stat3Label', label: 'Стат 3 - подпись', type: 'text' },
    { key: 'stat3Channel', label: 'Стат 3 - канал', type: 'channel' },
  ],
  Component: HeroWidget
}
