import { useColors, useSerifFamily } from '@/stores/theme.store'

interface Props { value: number; label: string; accent: 'wine' | 'rose' | 'gold' }

export default function StatCard({ value, label, accent }: Props) {
  const c = useColors()
  const serif = useSerifFamily()
  const color = accent === 'wine' ? c.wine : accent === 'rose' ? c.rose : c.gold

  return (
    <div style={{
      flex: 1, minWidth: 90, background: c.paperCard, borderRadius: 14,
      padding: '14px 16px', border: `1px solid ${c.rule}`,
    }}>
      <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: c.inkSoft, marginTop: 4 }}>
        {label}
      </div>
    </div>
  )
}
