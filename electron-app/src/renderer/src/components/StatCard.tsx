import { useColors, useSerifFamily } from '@/stores/theme.store'

interface Props { value: number; label: string; accent: 'wine' | 'rose' | 'gold' | 'wineDeep' }

export default function StatCard({ value, label, accent }: Props) {
  const c = useColors()
  const serif = useSerifFamily()
  const color = accent === 'wine' ? c.wine : accent === 'rose' ? c.rose : accent === 'gold' ? c.gold : c.wineDeep

  return (
    <div style={{
      flex: 1, minWidth: 100, background: c.paperCard, borderRadius: 14,
      padding: '16px 18px', border: `1px solid ${c.rule}`,
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontFamily: serif, fontSize: 34, fontWeight: 600, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: c.inkSoft, marginTop: 6 }}>
        {label}
      </div>
    </div>
  )
}
