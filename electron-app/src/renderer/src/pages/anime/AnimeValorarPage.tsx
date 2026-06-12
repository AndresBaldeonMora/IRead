import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Trophy } from 'lucide-react'
import { useAnimesStore } from '@/stores/animes.store'
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme'
import type { Anime } from '@/types'

const STAR_COLOR = '#FFD36E'
const STAR_EMPTY = 'rgba(237,218,180,0.18)'

export default function AnimeValorarPage() {
  const navigate   = useNavigate()
  const animes     = useAnimesStore((s) => s.animes)
  const setRating  = useAnimesStore((s) => s.setRating)

  const completados = useMemo(() => animes.filter((a) => a.estado === 'completado'), [animes])

  const valorados = useMemo(
    () => completados.filter((a) => a.rating != null).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
    [completados]
  )
  const sinValorar = useMemo(
    () => completados.filter((a) => a.rating == null).sort((a, b) => a.titulo.localeCompare(b.titulo)),
    [completados]
  )

  const promedio = useMemo(() => {
    if (!valorados.length) return null
    const sum = valorados.reduce((acc, a) => acc + (a.rating ?? 0), 0)
    return (sum / valorados.length).toFixed(1)
  }, [valorados])

  const progresoPct = completados.length > 0 ? (valorados.length / completados.length) * 100 : 0

  if (completados.length === 0) return (
    <div style={{ height: '100%', background: ANIME.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Trophy size={36} color={ANIME_STATUS.completado.glow} />
      <div style={{ fontSize: 18, fontWeight: 700, color: ANIME.text }}>Sin completados aún</div>
      <div style={{ fontSize: 13, color: ANIME.textSoft, textAlign: 'center' }}>Completa un anime para poder valorarlo</div>
    </div>
  )

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: ANIME.bg, color: ANIME.text }}>
      <div style={{ padding: '28px 22px 40px' }}>

        <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1, color: ANIME.text, margin: '0 0 20px' }}>
          Valorar
        </h1>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          {promedio && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: ANIME.surface, border: `0.5px solid ${STAR_COLOR}33`, borderRadius: 12 }}>
              <Star size={14} color={STAR_COLOR} fill={STAR_COLOR} />
              <span style={{ fontSize: 20, fontWeight: 800, color: STAR_COLOR, letterSpacing: -0.5 }}>{promedio}</span>
              <span style={{ fontSize: 9, color: ANIME.textSoft, fontFamily: MONO, letterSpacing: 1, textTransform: 'uppercase' }}>promedio</span>
            </div>
          )}
          <div style={{ flex: 1, padding: '10px 14px', background: ANIME.surface, border: `0.5px solid ${ANIME.line}`, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: ANIME.textSoft, fontFamily: MONO }}>{valorados.length} de {completados.length} valorados</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: ANIME_STATUS.completado.glow }}>{Math.round(progresoPct)}%</span>
            </div>
            <div style={{ height: 5, background: 'rgba(237,218,180,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progresoPct}%`, background: ANIME_STATUS.completado.glow, borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>

        {/* Valorados */}
        {valorados.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader label="Valorados" count={valorados.length} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {valorados.map((anime, i) => (
                <RatingCard key={anime.id} anime={anime} rank={i + 1} onRate={(r) => setRating(anime.id, r)} onPress={() => navigate(`/anime/${anime.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* Sin valorar */}
        {sinValorar.length > 0 && (
          <div>
            <SectionHeader label="Por valorar" count={sinValorar.length} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sinValorar.map((anime) => (
                <RatingCard key={anime.id} anime={anime} onRate={(r) => setRating(anime.id, r)} onPress={() => navigate(`/anime/${anime.id}`)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: ANIME.magenta, fontFamily: MONO, letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: 0.5, background: ANIME.line }} />
      <span style={{ fontSize: 10, color: ANIME.textSoft, fontFamily: MONO }}>{count}</span>
    </div>
  )
}

function RatingCard({ anime, rank, onRate, onPress }: { anime: Anime; rank?: number; onRate: (r: number | null) => void; onPress: () => void }) {
  const STAR_COLOR = '#FFD36E'
  const STAR_EMPTY = 'rgba(237,218,180,0.18)'
  const isTop = rank != null && rank <= 3
  const rankColor = rank === 1 ? '#FFD36E' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : ANIME.textSoft
  const tipoLabel = anime.tipo === 'pelicula' ? 'Película' : anime.tipo === 'ova' ? 'OVA' : `T${anime.temporada}`

  return (
    <div style={{
      display: 'flex', flexDirection: 'row', background: ANIME.surface,
      border: `0.5px solid ${isTop ? anime.color + '44' : ANIME.line}`,
      borderRadius: 14, overflow: 'hidden',
    }}>
      <div style={{ width: 5, background: anime.color, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '14px 14px', cursor: 'pointer' }} onClick={onPress}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: ANIME.text, lineHeight: '21px' }}>{anime.titulo}</span>
          {rank != null && <span style={{ fontSize: 16, fontWeight: 800, color: rankColor, letterSpacing: -0.5, flexShrink: 0 }}>#{rank}</span>}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1, color: ANIME.textSoft, textTransform: 'uppercase', marginBottom: 10 }}>
          {tipoLabel}{anime.anio > 0 ? ` · ${anime.anio}` : ''}{anime.eps > 0 ? ` · ${anime.eps} ep` : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={(e) => e.stopPropagation()}>
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = anime.rating != null && n <= anime.rating
            return (
              <button key={n} onClick={() => onRate(anime.rating === n ? null : n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <Star size={24} color={filled ? STAR_COLOR : STAR_EMPTY} fill={filled ? STAR_COLOR : 'transparent'} strokeWidth={filled ? 0 : 1.5} />
              </button>
            )
          })}
          {anime.rating != null && (
            <span style={{ fontSize: 14, fontWeight: 700, color: STAR_COLOR, marginLeft: 4 }}>{anime.rating}.0</span>
          )}
        </div>
      </div>
    </div>
  )
}
