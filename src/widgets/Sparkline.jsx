import { memo } from 'react'

function Spark({ data, kind = 'line', color = 'var(--data-blue)', width = 300, height = 120 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
        ожидание данных…
      </div>
    )
  }

  const pad = 4
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const n = data.length
  const x = i => pad + (i * (width - 2 * pad)) / Math.max(1, n - 1)
  const y = v => height - pad - ((v - min) / span) * (height - 2 * pad)

  const gid = `sg${Math.abs(color.split('').reduce((a, c) => a + c.charCodeAt(0), 0))}`

  if (kind === 'bar') {
    const bw = (width - 2 * pad) / n
    const barGid = `bg${Math.abs(color.split('').reduce((a, c) => a + c.charCodeAt(0), 0))}`
    return (
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={barGid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
          </linearGradient>
        </defs>
        {data.map((v, i) => (
          <rect key={i}
            x={pad + i * bw + bw * 0.18} y={y(v)}
            width={bw * 0.64} height={height - pad - y(v)}
            rx={2} fill={`url(#${barGid})`}
            opacity={i === n - 1 ? 1 : 0.7}
          />
        ))}
      </svg>
    )
  }

  const pts = data.map((v, i) => [x(i), y(v)])
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  const area = `${line} L${last[0].toFixed(1)} ${(height - pad).toFixed(1)} L${pts[0][0].toFixed(1)} ${(height - pad).toFixed(1)} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="75%" stopColor={color} stopOpacity="0.06"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`}/>
      <path d={line} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round"
        vectorEffect="non-scaling-stroke"/>
      {last && (
        <>
          <circle cx={last[0]} cy={last[1]} r="3" fill={color}/>
          <circle cx={last[0]} cy={last[1]} r="5" fill={color} opacity="0.15"/>
        </>
      )}
    </svg>
  )
}

export default memo(Spark)
