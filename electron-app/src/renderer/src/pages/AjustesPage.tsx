import { useThemeStore, useColors, useSerifFamily } from '@/stores/theme.store'
import type { PaletteKey, SerifKey } from '@/types'
import { PALETTES, SERIFS } from '@/utils/themes'

export default function AjustesPage() {
  const c = useColors()
  const serif = useSerifFamily()
  const { palette, setPalette, setSerif, serif: serifKey } = useThemeStore()

  return (
    <div style={{ padding: '32px 40px', maxWidth: 600 }}>
      <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, color: c.wineDeep, marginBottom: 32 }}>
        Ajustes
      </h1>

      {/* Tema */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: serif, fontSize: 20, color: c.wineDeep, marginBottom: 16 }}>Tema de color</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(Object.keys(PALETTES) as PaletteKey[]).map((key) => {
            const p = PALETTES[key]
            return (
              <button key={key} onClick={() => setPalette(key)} style={{
                padding: '12px 20px', borderRadius: 14, cursor: 'pointer',
                background: p.paper, border: `2px solid ${palette === key ? p.wine : p.rule}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 120,
              }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[p.wine, p.rose, p.gold].map((col, i) => (
                    <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: col }} />
                  ))}
                </div>
                <span style={{ fontSize: 13, color: p.ink }}>{p.label}</span>
                {palette === key && <span style={{ fontSize: 10, color: p.wine }}>✓ Activo</span>}
              </button>
            )
          })}
        </div>
      </section>

      {/* Fuente */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: serif, fontSize: 20, color: c.wineDeep, marginBottom: 16 }}>Tipografía</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(Object.keys(SERIFS) as SerifKey[]).map((key) => (
            <button key={key} onClick={() => setSerif(key)} style={{
              padding: '14px 20px', borderRadius: 14, cursor: 'pointer',
              background: c.paperCard, border: `2px solid ${serifKey === key ? c.wine : c.rule}`,
              minWidth: 140,
            }}>
              <div style={{ fontFamily: SERIFS[key].family, fontSize: 22, color: c.ink, marginBottom: 4 }}>
                Mi Biblioteca
              </div>
              <div style={{ fontSize: 12, color: c.inkSoft }}>{SERIFS[key].label}</div>
              {serifKey === key && <div style={{ fontSize: 10, color: c.wine, marginTop: 4 }}>✓ Activo</div>}
            </button>
          ))}
        </div>
      </section>

      <div style={{ borderTop: `1px solid ${c.rule}`, paddingTop: 20, fontSize: 12, color: c.inkSoft }}>
        Mi Biblioteca Desktop v1.0
      </div>
    </div>
  )
}
