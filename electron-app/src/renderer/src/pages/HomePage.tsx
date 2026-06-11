import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooksStore } from '@/stores/books.store'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import { calculateStats, lecturasPorMes } from '@/services/statsService'
import DonutChart from '@/components/DonutChart'
import StatCard from '@/components/StatCard'
import MonthlyReadingChart from '@/components/MonthlyReadingChart'
import { Settings } from 'lucide-react'

const SPINE_PALETTES: [string, string][] = [
  ['#6B2737', '#8E3A4A'], ['#7A4B2A', '#9A6440'], ['#4D3B5C', '#6E5478'],
  ['#2F4B3C', '#4A6B58'], ['#8E5A2E', '#A87444'], ['#5C3A52', '#7A5470'],
  ['#34403D', '#52605C'], ['#7D3030', '#9C4848'], ['#3D4F6B', '#5A6E8A'],
  ['#84583D', '#A07252'],
]
const spineColors = (n: number): [string, string] => SPINE_PALETTES[n % SPINE_PALETTES.length]

export default function HomePage() {
  const books    = useBooksStore((s) => s.books)
  const toggleBook = useBooksStore((s) => s.toggleBook)
  const navigate = useNavigate()
  const c        = useColors()
  const serif    = useSerifFamily()

  const novelasEternas = useMemo(() => books.filter((b) => b.coleccion === 'novelas_eternas'), [books])
  const stats = useMemo(() => calculateStats(novelasEternas), [novelasEternas])

  const recientes = useMemo(() =>
    [...novelasEternas]
      .sort((a, b) => (b.actualizado_en ?? '').localeCompare(a.actualizado_en ?? ''))
      .filter((b) => b.tengo)
      .slice(0, 3),
    [novelasEternas]
  )

  const lecturasMensuales = useMemo(() => lecturasPorMes(books), [books])

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: c.paper }}>
      <div style={{ paddingBottom: 32 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', padding: '32px 22px 12px', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, marginBottom: 4 }}>
              · tu biblioteca ·
            </div>
            <h1 style={{ fontFamily: serif, fontSize: 42, fontWeight: 500, lineHeight: '46px', color: c.wineDeep, margin: 0 }}>
              Mi Biblioteca
            </h1>
            <p style={{ fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, fontSize: 15, marginTop: 4, margin: '4px 0 0' }}>
              Un cuarto sin libros es como un cuerpo sin alma
            </p>
          </div>
          <button onClick={() => navigate('/ajustes')} style={{ background: 'none', cursor: 'pointer', marginTop: 8 }}>
            <Settings size={22} color={c.inkSoft} />
          </button>
        </div>

        {/* Colección label */}
        <div style={{ margin: '0 22px 8px', borderBottom: `0.5px solid ${c.rule}`, paddingBottom: 6 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, textAlign: 'center' }}>
            · Novelas Eternas · {novelasEternas.length} títulos ·
          </div>
        </div>

        {/* Donut */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, marginBottom: 24 }}>
          <DonutChart porcentaje={stats.porcentaje} tengo={stats.tengo} faltan={stats.faltan} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, padding: '0 22px' }}>
          <StatCard value={stats.tengo} label="Ya tengo" accent="wine" />
          <StatCard value={stats.faltan} label="Faltan" accent="rose" />
          <StatCard value={stats.autoresUnicos} label="Autores" accent="gold" />
        </div>

        {/* Últimas adquisiciones */}
        {recientes.length > 0 && (
          <div style={{ padding: '32px 22px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, color: c.wineDeep, margin: 0 }}>
                Últimas adquisiciones
              </h2>
              <button onClick={() => navigate('/biblioteca')} style={{ color: c.wine, fontSize: 13, fontWeight: 600, background: 'none', cursor: 'pointer' }}>
                Ver todo
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recientes.map((book) => {
                const [colorA, colorB] = spineColors(book.numero)
                return (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/libro/${book.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                      borderRadius: 18, marginBottom: 10,
                      background: c.paperCard, border: `0.5px solid ${c.rule}`,
                      cursor: 'pointer',
                    }}
                  >
                    {/* Spine cover */}
                    <div style={{
                      width: 48, height: 64, borderRadius: 4, flexShrink: 0,
                      background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', inset: 5,
                        border: '0.5px solid rgba(218,180,120,0.45)',
                        borderRadius: 1,
                      }} />
                      {book.coleccion === 'novelas_eternas' && (
                        <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 13, fontWeight: 600, color: 'rgba(248,232,200,0.9)' }}>
                          {book.numero}
                        </span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 500, color: c.wineDeep, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '22px' }}>
                        {book.titulo}
                      </div>
                      <div style={{ fontSize: 13, color: c.inkSoft, marginTop: 2 }}>{book.autor}</div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBook(book.id) }}
                      style={{
                        width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                        background: book.tengo ? c.wine : 'transparent',
                        border: `1.5px solid ${book.tengo ? c.wine : c.rose}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      {/* empty circle */}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Lectura mensual */}
        <div style={{ padding: '32px 22px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, color: c.wineDeep, margin: 0 }}>
              Lectura por mes
            </h2>
            <span style={{ fontSize: 12, color: c.inkSoft }}>{books.filter((b) => b.leido).length} leídos en total</span>
          </div>
          <MonthlyReadingChart data={lecturasMensuales} />
        </div>

        {/* Quote */}
        <div style={{
          margin: '28px 22px 0',
          padding: 22, borderRadius: 18,
          background: c.paperCard, border: `0.5px solid ${c.rule}`,
        }}>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 18, color: c.wineDeep, lineHeight: '26px', margin: 0 }}>
            "Siempre imaginé que el Paraíso sería algún tipo de biblioteca."
          </p>
          <p style={{ fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: c.inkSoft, margin: '10px 0 0' }}>
            — Jorge Luis Borges
          </p>
        </div>

      </div>
    </div>
  )
}
