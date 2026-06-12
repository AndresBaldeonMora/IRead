import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Tv, Film, Disc } from 'lucide-react'
import { useAnimesStore } from '@/stores/animes.store'
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme'

const STAR_COLOR = '#FFD36E'
const STAR_EMPTY = 'rgba(237,218,180,0.15)'

export default function AnimeCompletadosPage() {
  const navigate  = useNavigate()
  const animes    = useAnimesStore((s) => s.animes)

  const completados = useMemo(() => animes.filter((a) => a.estado === 'completado'), [animes])

  const stats = useMemo(() => ({
    peliculas: completados.filter((a) => a.tipo === 'pelicula').length,
    ovas:      completados.filter((a) => a.tipo === 'ova').length,
    series:    completados.filter((a) => a.tipo === 'serie').length,
    valorados: completados.filter((a) => a.rating != null).length,
  }), [completados])

  const ratingDist = useMemo(() => {
    const dist = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: completados.filter((a) => a.rating === stars).length,
    }))
    const sinValorar = completados.filter((a) => a.rating == null).length
    return { dist, sinValorar }
  }, [completados])

  const maxRatingCount = useMemo(
    () => Math.max(...ratingDist.dist.map((d) => d.count), ratingDist.sinValorar, 1),
    [ratingDist]
  )

  const [selectedRating, setSelectedRating] = useState<number | null | undefined>(undefined)

  const listDelRating = useMemo(() => {
    if (selectedRating === undefined) return []
    if (selectedRating === null) return completados.filter((a) => a.rating == null).sort((a, b) => a.titulo.localeCompare(b.titulo))
    return completados.filter((a) => a.rating === selectedRating).sort((a, b) => a.titulo.localeCompare(b.titulo))
  }, [completados, selectedRating])

  const tipoIcon = (tipo: string) => {
    if (tipo === 'pelicula') return <Film size={14} color={ANIME_STATUS.completado.glow} />
    if (tipo === 'ova') return <Disc size={14} color={ANIME_STATUS.completado.glow} />
    return <Tv size={14} color={ANIME_STATUS.completado.glow} />
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: ANIME.bg, color: ANIME.text }}>
      <div style={{ padding: '28px 22px 40px' }}>

        <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1, color: ANIME.text, margin: '0 0 20px' }}>
          Completados
        </h1>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[
            { top: completados.length, label: 'Total' },
            { top: stats.series, label: 'Series' },
            { top: stats.peliculas, label: 'Películas' },
            { top: stats.ovas, label: 'OVAs' },
          ].map((p) => (
            <div key={p.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 8px', background: ANIME.surface, border: `0.5px solid ${ANIME.line}`, borderRadius: 14 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: ANIME_STATUS.completado.glow, letterSpacing: -0.5 }}>{p.top}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: ANIME.textSoft, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Rating chart */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: ANIME.magenta, marginBottom: 10, textAlign: 'center' }}>· por puntuación ·</div>
          <div style={{ background: ANIME.surface, border: `0.5px solid ${ANIME.line}`, borderRadius: 16, padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ratingDist.dist.map(({ stars, count }) => {
              const isSelected = selectedRating === stars
              const widthPct = maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0
              return (
                <div key={stars} onClick={() => setSelectedRating(prev => prev === stars ? undefined : stars)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: 2, width: 70 }}>
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} size={11} color={n <= stars ? STAR_COLOR : STAR_EMPTY} fill={n <= stars ? STAR_COLOR : 'transparent'} />
                    ))}
                  </div>
                  <div style={{ flex: 1, height: 10, background: 'rgba(237,218,180,0.07)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${widthPct}%`, borderRadius: 5, background: isSelected ? ANIME_STATUS.completado.glow : ANIME.cyan, minWidth: count > 0 ? 8 : 0, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ width: 24, fontSize: 12, fontWeight: 700, textAlign: 'right', color: isSelected ? ANIME_STATUS.completado.glow : ANIME.textSoft }}>{count}</span>
                </div>
              )
            })}
            {ratingDist.sinValorar > 0 && (
              <div onClick={() => setSelectedRating(prev => prev === null ? undefined : null)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0 7px', borderTop: `0.5px solid ${ANIME.line}`, cursor: 'pointer' }}>
                <span style={{ width: 70, fontSize: 10, fontFamily: MONO, letterSpacing: 0.5, color: ANIME.textSoft }}>sin valorar</span>
                <div style={{ flex: 1, height: 10, background: 'rgba(237,218,180,0.07)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(ratingDist.sinValorar / maxRatingCount) * 100}%`, borderRadius: 5, background: selectedRating === null ? ANIME_STATUS.completado.glow : ANIME.violet, minWidth: 8, transition: 'width 0.3s' }} />
                </div>
                <span style={{ width: 24, fontSize: 12, fontWeight: 700, textAlign: 'right', color: selectedRating === null ? ANIME_STATUS.completado.glow : ANIME.textSoft }}>{ratingDist.sinValorar}</span>
              </div>
            )}
          </div>
          {completados.length > 0 && (
            <div style={{ fontFamily: MONO, fontSize: 10, color: ANIME.textSoft, textAlign: 'center', marginTop: 10, fontStyle: 'italic' }}>
              Haz clic en una fila para ver los títulos
            </div>
          )}
        </div>

        {/* Lista del rating seleccionado */}
        {selectedRating !== undefined && (
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: ANIME.magenta, marginBottom: 10, textAlign: 'center' }}>
              {selectedRating === null ? '· sin valorar ·' : `· ${selectedRating} ${selectedRating === 1 ? 'estrella' : 'estrellas'} ·`}
            </div>
            <div style={{ background: ANIME.surface, border: `0.5px solid ${ANIME.line}`, borderRadius: 16, overflow: 'hidden' }}>
              {listDelRating.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: ANIME.textSoft, fontStyle: 'italic', fontSize: 13 }}>Ningún anime aquí</div>
              ) : listDelRating.map((anime, i) => (
                <div key={anime.id} onClick={() => navigate(`/anime/${anime.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderTop: i > 0 ? `0.5px solid ${ANIME.line}` : 'none', cursor: 'pointer' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: anime.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: ANIME.text }}>{anime.titulo}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      {tipoIcon(anime.tipo)}
                      <span style={{ fontFamily: MONO, fontSize: 10, color: ANIME.textSoft, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                        {anime.tipo === 'serie' ? `T${anime.temporada}` : anime.tipo === 'pelicula' ? 'Película' : 'OVA'} · {anime.anio}
                      </span>
                    </div>
                  </div>
                  {anime.rating != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(255,211,110,0.12)', padding: '4px 8px', borderRadius: 8 }}>
                      <Star size={10} color={STAR_COLOR} fill={STAR_COLOR} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: STAR_COLOR }}>{anime.rating}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quote */}
        <div style={{ marginTop: 32, padding: 22, background: ANIME.surface, border: `0.5px solid ${ANIME.line}`, borderRadius: 16 }}>
          <div style={{ fontSize: 15, fontStyle: 'italic', lineHeight: '22px', color: ANIME.text, opacity: 0.7, textAlign: 'center' }}>
            "Un buen anime no termina cuando acaba el último episodio."
          </div>
        </div>
      </div>
    </div>
  )
}
