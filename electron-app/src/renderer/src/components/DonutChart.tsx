import { useColors, useSerifFamily } from '@/stores/theme.store'

interface Props { porcentaje: number; tengo: number; faltan: number }

export default function DonutChart({ porcentaje, tengo, faltan }: Props) {
  const c = useColors()
  const serif = useSerifFamily()
  const r = 60, cx = 80, cy = 80, stroke = 14
  const circ = 2 * Math.PI * r
  const filled = (porcentaje / 100) * circ

  return (
    <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
      <svg width={160} height={160} viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.roseSoft} strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.wine} strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 600, color: c.wineDeep, lineHeight: 1 }}>
          {porcentaje}%
        </span>
        <span style={{ fontSize: 10, letterSpacing: 1, color: c.inkSoft, textTransform: 'uppercase' }}>
          completado
        </span>
      </div>
    </div>
  )
}
