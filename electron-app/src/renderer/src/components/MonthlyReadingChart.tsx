import { useColors, useSerifFamily } from '@/stores/theme.store'
import { MesLectura } from '@/services/statsService'

interface Props { data: MesLectura[] }

export default function MonthlyReadingChart({ data }: Props) {
  const c = useColors()
  const serif = useSerifFamily()

  if (data.length === 0) {
    return (
      <div style={{
        background: c.paperCard, borderRadius: 14, padding: 24, textAlign: 'center',
        border: `1px solid ${c.rule}`, fontFamily: serif, fontStyle: 'italic', color: c.inkSoft,
      }}>
        Aún no hay lecturas registradas
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.count))
  const recent = data.slice(-12)

  return (
    <div style={{
      background: c.paperCard, borderRadius: 14, padding: '16px 20px',
      border: `1px solid ${c.rule}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
        {recent.map((d) => (
          <div key={d.mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', background: c.wine, borderRadius: 3,
              height: max > 0 ? `${(d.count / max) * 64}px` : '4px',
              minHeight: 4, transition: 'height 0.3s',
            }} />
            <span style={{ fontSize: 9, color: c.inkSoft, textAlign: 'center', lineHeight: 1 }}>
              {d.label.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
