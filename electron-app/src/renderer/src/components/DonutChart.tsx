import { useColors, useSerifFamily } from '@/stores/theme.store'

interface Props { porcentaje: number; tengo: number; faltan: number }

export default function DonutChart({ porcentaje, tengo, faltan }: Props) {
  const c = useColors()
  const serif = useSerifFamily()
  const size = 220, stroke = 18
  const r = (size - stroke) / 2, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const filled = (porcentaje / 100) * circ

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.roseSoft} strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.wine} strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: serif, fontSize: 52, fontWeight: 500, color: c.wineDeep, lineHeight: '56px' }}>
          {porcentaje}%
        </span>
        <span style={{ fontSize: 10, letterSpacing: 2, color: c.inkSoft, textTransform: 'uppercase', marginTop: 4 }}>
          {tengo} de {tengo + faltan}
        </span>
      </div>
    </div>
  )
}
