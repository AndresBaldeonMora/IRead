import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageDown, List } from 'lucide-react'
import { useAnimesStore } from '@/stores/animes.store'
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme'
import { AnimeCover, ProgressBar } from '@/components/anime/AnimePrimitives'
import type { AnimeEstado } from '@/types'

export default function AnimeDashboardPage() {
  const navigate = useNavigate()
  const animes = useAnimesStore((s) => s.animes)
  const fetchMissingImages = useAnimesStore((s) => s.fetchMissingImages)
  const descargandoPortadas = useAnimesStore((s) => s.descargandoPortadas)

  const sinPortada = useMemo(() => animes.filter((a) => !a.imagen_url).length, [animes])

  const data = useMemo(() => {
    const counts: Record<AnimeEstado, number> = { viendo: 0, completado: 0, pausado: 0, pendiente: 0 }
    for (const a of animes) counts[a.estado]++

    const porTitulo = new Map<string, AnimeEstado[]>()
    for (const a of animes) {
      const estados = porTitulo.get(a.titulo) ?? []
      estados.push(a.estado)
      porTitulo.set(a.titulo, estados)
    }
    const totalSeries = porTitulo.size
    let seriesCompletadas = 0
    for (const estados of porTitulo.values()) {
      if (estados.every((e) => e === 'completado')) seriesCompletadas++;
    }

    const watching = animes.filter((a) => a.estado === 'viendo').slice(0, 6)
    return { counts, watching, totalSeries, seriesCompletadas }
  }, [animes])

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: ANIME.bg, color: ANIME.text }}>
      <div style={{ paddingBottom: 40 }}>

        {/* Header */}
        <div style={{ padding: '28px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5, color: ANIME.text, margin: 0 }}>
                Mi lista de animes
              </h1>
              <div style={{ marginTop: 6, fontSize: 14, color: ANIME.textSoft }}>
                {data.counts.viendo} viendo · {data.counts.completado} completados
              </div>
            </div>
            <button
              onClick={() => navigate('/anime/lista')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 10,
                background: 'transparent', border: `0.5px solid ${ANIME.line}`,
                color: ANIME.textSoft, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <List size={15} /> Ver lista
            </button>
          </div>

          {sinPortada > 0 && (
            <button
              onClick={() => fetchMissingImages()}
              disabled={descargandoPortadas}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
                padding: '9px 14px', borderRadius: 10,
                background: `${ANIME.cyan}14`, border: `0.5px solid ${ANIME.cyan}55`,
                color: ANIME.cyan, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <ImageDown size={16} />
              {descargandoPortadas
                ? 'Descargando portadas…'
                : `Descargar ${sinPortada} portada${sinPortada === 1 ? '' : 's'}`}
            </button>
          )}
        </div>

        {/* Continuar viendo */}
        {data.watching.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ paddingLeft: 20, marginBottom: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4, color: ANIME.text }}>
                Continuar viendo
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, paddingLeft: 20, paddingRight: 20, overflowX: 'auto', paddingBottom: 8 }}>
              {data.watching.map((a) => (
                <div
                  key={a.id}
                  onClick={() => navigate(`/anime/${a.id}`)}
                  style={{
                    width: 180, flexShrink: 0, cursor: 'pointer',
                    background: ANIME.surface, borderRadius: 14,
                    border: `0.5px solid ${ANIME.line}`, overflow: 'hidden',
                  }}
                >
                  <AnimeCover anime={a} w={180} h={110} glyph={false} />
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ANIME.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.titulo}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: ANIME.textSoft }}>EP {a.vistos}/{a.eps}</span>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: a.color }}>{Math.round((a.vistos / a.eps) * 100)}%</span>
                    </div>
                    <ProgressBar value={a.vistos} total={a.eps} color={a.color} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status tiles */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 10, padding: '22px 18px 0' }}>
          {(Object.keys(ANIME_STATUS) as AnimeEstado[]).map((k) => {
            const s = ANIME_STATUS[k]
            return (
              <div
                key={k}
                onClick={() => navigate('/anime/lista')}
                style={{
                  width: 'calc(50% - 5px)', padding: 14, boxSizing: 'border-box',
                  background: ANIME.surface, borderRadius: 14,
                  border: `0.5px solid ${s.glow}33`, cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.glow }} />
                  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1.6, textTransform: 'uppercase', color: s.glow }}>
                    {s.label}
                  </span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, color: ANIME.text }}>
                  {data.counts[k]}
                </div>
              </div>
            )
          })}
        </div>

        {/* Series completadas */}
        <div style={{
          margin: '22px 18px 0',
          padding: 18,
          background: ANIME.surface,
          border: `0.5px solid ${ANIME.line}`,
          borderRadius: 16,
        }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: ANIME.textSoft }}>
            Series completadas · Total
          </div>
          <div style={{ marginTop: 6, fontSize: 44, fontWeight: 800, letterSpacing: -1, color: ANIME.text }}>
            {data.seriesCompletadas}
            <span style={{ fontSize: 22, color: ANIME.textSoft, fontWeight: 500 }}> / {data.totalSeries}</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <ProgressBar value={data.seriesCompletadas} total={data.totalSeries} color={ANIME.magenta} thick={6} />
          </div>
        </div>

      </div>
    </div>
  )
}
