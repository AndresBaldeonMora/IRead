import { useColors, useSerifFamily } from '@/stores/theme.store'
import { MesLectura } from '@/services/statsService'

interface Props { data: MesLectura[] }

export default function MonthlyReadingChart({ data }: Props) {
  const c = useColors()
  const serif = useSerifFamily()

  if (data.length === 0) {
    return (
      <div style={{
        background: c.paperCard, borderRadius: 14, padding: 32, textAlign: 'center',
        border: `1px solid ${c.rule}`, fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, fontSize: 15,
      }}>
        Aún no hay lecturas registradas
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.count))
  const recent = data.slice(-12)
  const BAR_HEIGHT = 120

  return (
    <div style={{ background: c.paperCard, borderRadius: 14, padding: '20px 24px', border: `1px solid ${c.rule}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: BAR_HEIGHT + 36 }}>
        {recent.map((d) => {
          const barH = max > 0 ? Math.max(4, Math.round((d.count / max) * BAR_HEIGHT)) : 4
          const [year, month] = d.mes.split('-')
          const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
          const label = MESES[parseInt(month, 10) - 1] ?? month
          return (
            <div key={d.mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, justifyContent: 'flex-end', height: '100%' }}>
              <span style={{ fontSize: 10, color: c.wine, fontWeight: 600, opacity: d.count > 0 ? 1 : 0 }}>
                {d.count}
              </span>
              <div style={{
                width: '100%', background: c.wine, borderRadius: '4px 4px 0 0',
                height: barH, transition: 'height 0.3s', opacity: 0.85,
              }} />
              <span style={{ fontSize: 10, color: c.inkSoft, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                {label}
              </span>
              <span style={{ fontSize: 9, color: c.inkSoft, opacity: 0.6 }}>{year}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
