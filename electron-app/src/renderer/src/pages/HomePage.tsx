import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
    [...novelasEternas]
      .sort((a, b) => (b.actualizado_en ?? '').localeCompare(a.actualizado_en ?? ''))
      .filter((b) => b.tengo)
      .slice(0, 6),
    [novelasEternas]
  )

  const pendientes = useMemo(() =>
    novelasEternas.filter((b) => b.tengo && !b.leido).slice(0, 6),
    [novelasEternas]
  )

  const lecturasMensuales = useMemo(() => lecturasPorMes(books), [books])

  return (
    <div style={{ padding: '32px 40px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, marginBottom: 4 }}>
          · tu biblioteca ·
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 40, fontWeight: 500, color: c.wineDeep, lineHeight: 1.1, margin: 0 }}>
          Mi Biblioteca
        </h1>
        <p style={{ fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, marginTop: 6, fontSize: 15, margin: '6px 0 0' }}>
          Un cuarto sin libros es como un cuerpo sin alma
        </p>
      </div>

      {/* Sección Novelas Eternas — título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: c.rule }} />
        <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, whiteSpace: 'nowrap' }}>
          Novelas Eternas · {novelasEternas.length} títulos
        </span>
        <div style={{ flex: 1, height: 1, background: c.rule }} />
      </div>

      {/* Fila principal: Donut + Stats */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'stretch', flexWrap: 'wrap' }}>
        {/* Donut */}
        <div style={{
          background: c.paperCard, borderRadius: 16, padding: '24px 28px',
          border: `1px solid ${c.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <DonutChart porcentaje={stats.porcentaje} tengo={stats.tengo} faltan={stats.faltan} />
        </div>

        {/* Stat cards en grid 2x2 */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minWidth: 280 }}>
          <StatCard value={stats.tengo} label="Ya tengo" accent="wine" />
          <StatCard value={stats.faltan} label="Faltan" accent="rose" />
          <StatCard value={stats.autoresUnicos} label="Autores" accent="gold" />
          <StatCard value={stats.leidos} label="Leídos" accent="wineDeep" />
        </div>
      </div>

      {/* Fila media: Últimas adquisiciones + Pendientes por leer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Últimas adquisiciones */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: serif, fontSize: 18, fontWeight: 500, color: c.wineDeep, margin: 0 }}>
              Últimas adquisiciones
            </h2>
            <button onClick={() => navigate('/biblioteca')} style={{ color: c.wine, fontSize: 12, fontWeight: 600 }}>
              Ver todo →
            </button>
          </div>
          {recientes.length === 0 ? (
            <div style={{ fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, fontSize: 14, padding: '20px 0' }}>
              Aún no hay libros
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recientes.map((b) => (
                <div key={b.id}
                  onClick={() => navigate(`/libro/${b.id}`)}
                  style={{
                    background: c.paperCard, borderRadius: 10, padding: '10px 14px',
                    cursor: 'pointer', border: `1px solid ${c.rule}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: serif, fontSize: 14, color: c.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.titulo}
                    </div>
                    <div style={{ fontSize: 11, color: c.inkSoft, marginTop: 2 }}>{b.autor}</div>
                  </div>
                  <div style={{ fontSize: 11, color: b.leido ? c.wine : c.inkSoft, flexShrink: 0 }}>
                    {b.leido ? '✓' : '·'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pendientes por leer */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: serif, fontSize: 18, fontWeight: 500, color: c.wineDeep, margin: 0 }}>
              Pendientes por leer
            </h2>
            <span style={{ fontSize: 12, color: c.inkSoft }}>{novelasEternas.filter((b) => b.tengo && !b.leido).length} libros</span>
          </div>
          {pendientes.length === 0 ? (
            <div style={{ fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, fontSize: 14, padding: '20px 0' }}>
              ¡Todo leído! 🎉
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pendientes.map((b) => (
                <div key={b.id}
                  onClick={() => navigate(`/libro/${b.id}`)}
                  style={{
                    background: c.paperCard, borderRadius: 10, padding: '10px 14px',
                    cursor: 'pointer', border: `1px solid ${c.rule}`,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <div style={{ width: 5, height: 32, borderRadius: 3, background: c.roseSoft, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: serif, fontSize: 14, color: c.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.titulo}
                    </div>
                    <div style={{ fontSize: 11, color: c.inkSoft, marginTop: 2 }}>{b.autor}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gráfico mensual */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontFamily: serif, fontSize: 18, fontWeight: 500, color: c.wineDeep, margin: 0 }}>
            Lectura mensual
          </h2>
          <span style={{ fontSize: 12, color: c.inkSoft }}>{stats.leidos} leídos en total</span>
        </div>
        <MonthlyReadingChart data={lecturasMensuales} />
      </div>

      {/* Cita */}
      <div style={{
        background: c.paperCard, borderRadius: 16, padding: '20px 28px',
        border: `1px solid ${c.rule}`, borderLeft: `4px solid ${c.gold}`,
      }}>
        <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 17, color: c.wineDeep, lineHeight: 1.6, margin: 0 }}>
          "Siempre imaginé que el Paraíso sería algún tipo de biblioteca."
        </p>
        <p style={{ fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: c.inkSoft, marginTop: 10, margin: '10px 0 0' }}>
          — Jorge Luis Borges
        </p>
      </div>

    </div>
  )
}
