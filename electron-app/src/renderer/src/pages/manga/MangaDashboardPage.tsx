import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { List } from 'lucide-react'
import { useMangasStore } from '@/stores/mangas.store'
import { MANGA, MANGA_STATUS, hardShadow } from '@/utils/mangaTheme'
import { MangaCover, MProgressBar, Screentone, MSectionTitle } from '@/components/manga/MangaPrimitives'
import type { MangaEstado } from '@/types'

const RANK_COLORS = ['#E8A82C', '#B85042', '#A87B5D', '#5F8B7D']

export default function MangaDashboardPage() {
  const navigate = useNavigate()
  const mangas = useMangasStore((s) => s.mangas)

  const data = useMemo(() => {
    const counts: Record<MangaEstado, number> = { leyendo: 0, completado: 0, pausado: 0, pendiente: 0 }
    let mangaCount = 0
    let manwhaCount = 0
    let totalReading = 0
    const authorMap: Record<string, number> = {}

    for (const m of mangas) {
      counts[m.estado]++
      if (m.tipo === 'manwha') manwhaCount++
      else mangaCount++
      if (m.estado === 'leyendo') totalReading += m.leidos
      authorMap[m.autor] = (authorMap[m.autor] || 0) + 1
    }

    const reading = mangas.filter((m) => m.estado === 'leyendo').slice(0, 5)
    const topAuthors = Object.entries(authorMap).sort((a, b) => b[1] - a[1]).slice(0, 4)
    const readingAll = mangas.filter((m) => m.estado === 'leyendo')

    return { counts, mangaCount, manwhaCount, totalReading, reading, topAuthors, readingAll }
  }, [mangas])

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      background: `linear-gradient(180deg, ${MANGA.bgTop} 0%, ${MANGA.bgBottom} 100%)`,
      color: MANGA.ink,
    }}>
      <div style={{ padding: '0 18px 60px', paddingTop: 32 }}>

        {/* Header */}
        <div style={{ paddingLeft: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                display: 'inline-block', padding: '4px 10px', background: MANGA.ink,
                marginBottom: 10, transform: 'rotate(-1.5deg)',
              }}>
                <span style={{ color: MANGA.paper, fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>
                  ★ TU COLECCIÓN ★
                </span>
              </div>
              <div style={{ fontSize: 34, lineHeight: '35px', fontWeight: 800, letterSpacing: -0.8, color: MANGA.ink }}>
                Mi colección
                <span style={{ color: MANGA.terracotta, fontStyle: 'italic' }}> de manga</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 14, color: MANGA.brown, fontWeight: 500 }}>
                {data.counts.leyendo} leyendo · {data.counts.completado} completados
              </div>
            </div>
            <button
              onClick={() => navigate('/manga/lista')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                background: 'transparent', border: `1.5px solid ${MANGA.ink}`,
                color: MANGA.ink, fontWeight: 800, fontSize: 12, cursor: 'pointer',
                letterSpacing: 0.4,
              }}
            >
              <List size={14} /> Ver lista
            </button>
          </div>
        </div>

        {/* Total en biblioteca */}
        <div style={{
          marginTop: 22, padding: '20px 18px 18px', position: 'relative', overflow: 'hidden',
          background: MANGA.paper, border: `2px solid ${MANGA.ink}`,
          borderRadius: 14, boxShadow: hardShadow(4, 4),
        }}>
          <Screentone opacity={0.05} />
          <div style={{
            position: 'absolute', top: 0, right: 0,
            padding: '4px 10px 4px 14px', background: MANGA.terracotta,
          }}>
            <span style={{ color: MANGA.paper, fontSize: 9, fontWeight: 800, letterSpacing: 2 }}>RESUMEN</span>
          </div>
          <div style={{ fontSize: 11, color: MANGA.brown, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', marginTop: 4 }}>
            Total en biblioteca
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 4, marginBottom: 16 }}>
            <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2, color: MANGA.ink, lineHeight: '54px' }}>{mangas.length}</span>
            <span style={{ fontSize: 14, color: MANGA.brown, fontWeight: 600, marginBottom: 4 }}>obras en total</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Manga', value: data.mangaCount, isManwha: false },
              { label: 'Manwha', value: data.manwhaCount, isManwha: true },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1, padding: '12px 14px', border: `1.5px solid ${MANGA.ink}`,
                  background: s.isManwha ? MANGA.sepia : MANGA.panel,
                }}
              >
                <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', opacity: 0.75, color: s.isManwha ? MANGA.paper : MANGA.ink }}>
                  {s.label}
                </div>
                <div style={{ marginTop: 4, fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: s.isManwha ? MANGA.paper : MANGA.ink }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 10, marginTop: 22 }}>
          {(Object.keys(MANGA_STATUS) as MangaEstado[]).map((k) => {
            const s = MANGA_STATUS[k]
            return (
              <div
                key={k}
                onClick={() => navigate('/manga/lista')}
                style={{
                  width: 'calc(50% - 5px)', padding: 14, boxSizing: 'border-box',
                  background: s.bg, border: `2px solid ${MANGA.ink}`,
                  borderRadius: 8, overflow: 'hidden', position: 'relative',
                  boxShadow: hardShadow(3, 3), cursor: 'pointer',
                }}
              >
                <Screentone color={s.text} opacity={0.1} />
                <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 800, color: s.text }}>
                  {s.label}
                </div>
                <div style={{ marginTop: 8, fontSize: 32, fontWeight: 800, letterSpacing: -1, color: s.text }}>
                  {data.counts[k]}
                </div>
              </div>
            )
          })}
        </div>

        {/* Continuar leyendo */}
        {data.reading.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <MSectionTitle kana="読書中 · ON READ">Continuar leyendo</MSectionTitle>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginLeft: -18, marginRight: -18, paddingLeft: 18, paddingRight: 18 }}>
              {data.reading.map((m) => (
                <div
                  key={m.id}
                  onClick={() => navigate(`/manga/${m.id}`)}
                  style={{
                    width: 156, flexShrink: 0, cursor: 'pointer',
                    background: MANGA.paper, border: `2px solid ${MANGA.ink}`,
                    overflow: 'hidden', boxShadow: hardShadow(4, 4),
                  }}
                >
                  <MangaCover manga={m} w={156} h={120} />
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: MANGA.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.titulo}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: MANGA.brown }}>
                        {m.unidad === 'tomo' ? 'TOMO' : 'CAP'} {m.leidos}/{m.total}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: m.color }}>
                        {Math.round((m.leidos / m.total) * 100)}%
                      </span>
                    </div>
                    <MProgressBar value={m.leidos} total={m.total} color={m.color} thick={5} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reading tally — dark card */}
        <div style={{
          marginTop: 22, padding: '20px 18px', position: 'relative', overflow: 'hidden',
          background: MANGA.ink, border: `2px solid ${MANGA.ink}`,
          borderRadius: 14, boxShadow: hardShadow(4, 4, MANGA.terracotta),
        }}>
          <Screentone color={MANGA.paper} opacity={0.08} />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1.5, color: MANGA.paper, lineHeight: '48px' }}>
              {data.totalReading}
            </span>
            <span style={{ fontSize: 13, color: '#E8D9C0', fontWeight: 600, marginBottom: 4 }}>
              tomos/caps leídos
            </span>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: '#E8D9C0' }}>
            Distribuidos en {data.readingAll.length}{' '}
            {data.readingAll.length === 1 ? 'obra activa' : 'obras activas'}
          </div>
        </div>

        {/* Top autores */}
        {data.topAuthors.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <MSectionTitle kana="作家 · CREATORS">Autores top</MSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.topAuthors.map(([author, count], i) => (
                <div
                  key={author}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', border: `2px solid ${MANGA.ink}`,
                    background: i === 0 ? MANGA.ink : MANGA.paper,
                    boxShadow: hardShadow(3, 3),
                  }}
                >
                  <div style={{
                    width: 32, height: 32, flexShrink: 0,
                    background: RANK_COLORS[i % 4], border: `1.5px solid ${MANGA.ink}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: 'rotate(-3deg)',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: MANGA.ink }}>#{i + 1}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700, lineHeight: '17px',
                      color: i === 0 ? MANGA.paper : MANGA.ink,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {author}
                    </div>
                    <div style={{ marginTop: 2, fontSize: 11, fontWeight: 600, color: i === 0 ? '#E8D9C0' : MANGA.brown }}>
                      {count} {count === 1 ? 'obra' : 'obras'} en tu lista
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
