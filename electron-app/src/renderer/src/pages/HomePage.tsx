import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useBooksStore } from '@/stores/books.store'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import { calculateStats, lecturasPorMes } from '@/services/statsService'
import DonutChart from '@/components/DonutChart'
import StatCard from '@/components/StatCard'
import MonthlyReadingChart from '@/components/MonthlyReadingChart'

export default function HomePage() {
  const books = useBooksStore((s) => s.books)
  const navigate = useNavigate()
  const c = useColors()
  const serif = useSerifFamily()

  const novelasEternas = useMemo(() => books.filter((b) => b.coleccion === 'novelas_eternas'), [books])
  const stats = useMemo(() => calculateStats(novelasEternas), [novelasEternas])
  const recientes = useMemo(() =>
    [...novelasEternas].sort((a, b) => (b.actualizado_en ?? '').localeCompare(a.actualizado_en ?? ''))
      .filter((b) => b.tengo).slice(0, 5),
    [novelasEternas])
  const lecturasMensuales = useMemo(() => lecturasPorMes(books), [books])

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, marginBottom: 4 }}>
            · tu biblioteca ·
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 42, fontWeight: 500, color: c.wineDeep, lineHeight: 1.1 }}>
            Mi Biblioteca
          </h1>
          <p style={{ fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, marginTop: 4, fontSize: 15 }}>
            Un cuarto sin libros es como un cuerpo sin alma
          </p>
        </div>
        <button onClick={() => navigate('/ajustes')} style={{ color: c.inkSoft, padding: 8 }}>
          <Settings size={22} />
        </button>
      </div>

      {/* Sección Novelas Eternas */}
      <div style={{ borderBottom: `1px solid ${c.rule}`, paddingBottom: 6, marginBottom: 16, textAlign: 'center' }}>
        <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold }}>
          · Novelas Eternas · {novelasEternas.length} títulos ·
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 32, flexWrap: 'wrap' }}>
        <DonutChart porcentaje={stats.porcentaje} tengo={stats.tengo} faltan={stats.faltan} />
        <div style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
          <StatCard value={stats.tengo} label="Ya tengo" accent="wine" />
          <StatCard value={stats.faltan} label="Faltan" accent="rose" />
          <StatCard value={stats.autoresUnicos} label="Autores" accent="gold" />
        </div>
      </div>

      {/* Últimas adquisiciones */}
      {recientes.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, color: c.wineDeep }}>Últimas adquisiciones</h2>
            <button onClick={() => navigate('/biblioteca')} style={{ color: c.wine, fontSize: 13, fontWeight: 600 }}>
              Ver todo
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recientes.map((b) => (
              <div key={b.id}
                onClick={() => navigate(`/libro/${b.id}`)}
                style={{
                  background: c.paperCard, borderRadius: 12, padding: '12px 16px',
                  cursor: 'pointer', border: `1px solid ${c.rule}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: serif, fontSize: 16, color: c.ink }}>{b.titulo}</div>
                  <div style={{ fontSize: 12, color: c.inkSoft, marginTop: 2 }}>{b.autor}</div>
                </div>
                <div style={{ fontSize: 11, color: b.leido ? c.wine : c.inkSoft }}>
                  {b.leido ? '✓ Leído' : 'Pendiente'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lectura mensual */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, color: c.wineDeep }}>Lectura por mes</h2>
          <span style={{ fontSize: 12, color: c.inkSoft }}>{books.filter((b) => b.leido).length} leídos en total</span>
        </div>
        <MonthlyReadingChart data={lecturasMensuales} />
      </div>

      {/* Cita */}
      <div style={{
        background: c.paperCard, borderRadius: 18, padding: 22,
        border: `1px solid ${c.rule}`, marginBottom: 32,
      }}>
        <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 18, color: c.wineDeep, lineHeight: 1.5 }}>
          "Siempre imaginé que el Paraíso sería algún tipo de biblioteca."
        </p>
        <p style={{ fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: c.inkSoft, marginTop: 10 }}>
          — Jorge Luis Borges
        </p>
      </div>
    </div>
  )
}
