import { useColors, useSerifFamily } from '@/stores/theme.store'

interface Props { value: number; label: string; accent?: 'wine' | 'rose' | 'gold' | 'wineDeep' }

export default function StatCard({ value, label, accent = 'wine' }: Props) {
  const c = useColors()
  const serif = useSerifFamily()
  const color = accent === 'wine' ? c.wine : accent === 'rose' ? c.rose : accent === 'gold' ? c.gold : c.wineDeep

  return (
    <div style={{
      flex: 1, padding: 14, borderRadius: 16,
      background: c.paperCard, border: `0.5px solid ${c.rule}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      <span style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, lineHeight: '34px', color }}>
        {value}
      </span>
      <span style={{ fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: c.inkSoft, textAlign: 'center' }}>
        {label}
      </span>
    </div>
  )
}
