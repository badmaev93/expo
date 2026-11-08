const React = window.__EXPO_REACT__
const h = React.createElement

function Marquee({ props }) {
  const text = props.text || 'Бегущая строка'
  return h(
    'div',
    { className: 'flex h-full items-center overflow-hidden', style: { color: props.color || '#38bdf8' } },
    h(
      'div',
      {
        style: {
          whiteSpace: 'nowrap',
          fontWeight: 600,
          fontSize: '1.25rem',
          animation: `expo-marquee ${props.speed || 12}s linear infinite`
        }
      },
      `${text}     •     ${text}     •     `
    )
  )
}

if (typeof document !== 'undefined' && !document.getElementById('expo-marquee-kf')) {
  const style = document.createElement('style')
  style.id = 'expo-marquee-kf'
  style.textContent = '@keyframes expo-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}'
  document.head.appendChild(style)
}

export default {
  type: 'marquee',
  name: 'Бегущая строка',
  group: 'Внешние плагины',
  defaultSize: { w: 6, h: 1 },
  minSize: { w: 2, h: 1 },
  defaultProps: { text: 'Добро пожаловать на ЭКСПО 2026', color: '#38bdf8', speed: 12 },
  configSchema: [
    { key: 'text', label: 'Текст', type: 'text' },
    { key: 'color', label: 'Цвет', type: 'color' },
    { key: 'speed', label: 'Скорость (сек)', type: 'number' }
  ],
  Component: Marquee
}
