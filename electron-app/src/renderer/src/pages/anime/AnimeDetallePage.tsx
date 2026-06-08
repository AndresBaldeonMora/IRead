import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Trash2 } from 'lucide-react'
import { useAnimesStore } from '@/stores/animes.store'
import { ANIME, ANIME_STATUS } from '@/utils/animeTheme'

export default function AnimeDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const animes = useAnimesStore((s) => s.animes)
  const advanceEp = useAnimesStore((s) => s.advanceEp)
  const setRating = useAnimesStore((s) => s.setRating)
  const deleteAnime = useAnimesStore((s) => s.deleteAnime)
  const updateAnime = useAnimesStore((s) => s.updateAnime)

  const anime = animes.find((a) => a.id === id)
  if (!anime) return (
    <div style={{ background: ANIME.bg, color: ANIME.text, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      No encontrado
    </div>
  )

  const status = ANIME_STATUS[anime.estado]
  const progreso = anime.eps > 0 ? anime.vistos / anime.eps : 0

  const handleDelete = async () => {
    if (confirm(`¿Eliminar "${anime.titulo}"?`)) {
      await deleteAnime(anime.id)
      navigate('/anime')
    }
  }

  return (
    <div style={{ background: ANIME.bg, color: ANIME.text, height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '24px 32px', maxWidth: 700 }}>
        <button onClick={() => navigate('/anime')} style={{ display: 'flex', alignItems: 'center', gap: 8, color: ANIME.textSoft, marginBottom: 24, fontSize: 14 }}>
          <ArrowLeft size={18} /> Volver
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: ANIME.text, marginBottom: 4 }}>{anime.titulo}</h1>
            <div style={{ fontSize: 14, color: ANIME.textSoft }}>{anime.anio} · {anime.tipo} · T{anime.temporada}</div>
          </div>
          <button onClick={handleDelete} style={{ color: '#C41E1E', padding: 8 }}><Trash2 size={20} /></button>
        </div>

        {/* Estado */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {(['viendo','completado','pausado','pendiente'] as const).map((est) => (
            <button key={est} onClick={() => updateAnime(anime.id, { estado: est })} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13,
              background: anime.estado === est ? ANIME_STATUS[est].glow : ANIME.surface,
              color: anime.estado === est ? '#fff' : ANIME.textSoft,
              border: `1px solid ${anime.estado === est ? ANIME_STATUS[est].glow : ANIME.line}`,
            }}>
              {ANIME_STATUS[est].label}
            </button>
          ))}
        </div>

        {/* Progreso */}
        {anime.eps > 0 && (
          <div style={{ background: ANIME.surface, borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: ANIME.text }}>
              <span>Episodios vistos</span>
              <span style={{ fontWeight: 600 }}>{anime.vistos} / {anime.eps}</span>
            </div>
            <div style={{ height: 8, background: ANIME.line, borderRadius: 4, marginBottom: 16 }}>
              <div style={{ height: '100%', width: `${progreso * 100}%`, background: status.glow, borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => advanceEp(anime.id, -1)} style={{
                flex: 1, padding: '10px', borderRadius: 10, fontSize: 18,
                background: ANIME.surface, color: ANIME.textSoft, border: `1px solid ${ANIME.line}`,
              }}>−</button>
              <button onClick={() => advanceEp(anime.id, 1)} style={{
                flex: 2, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: status.glow, color: '#fff',
              }}>+ Episodio</button>
            </div>
          </div>
        )}

        {/* Rating */}
        <div style={{ background: ANIME.surface, borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: ANIME.textSoft, marginBottom: 10 }}>Valoración</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3,4,5].map((n) => (
              <button key={n} onClick={() => setRating(anime.id, anime.rating === n ? null : n)} style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 16,
                background: (anime.rating ?? 0) >= n ? ANIME.magenta + '40' : ANIME.surface,
                color: (anime.rating ?? 0) >= n ? ANIME.magenta : ANIME.textSoft,
                border: `1px solid ${(anime.rating ?? 0) >= n ? ANIME.magenta : ANIME.line}`,
              }}>
                <Star size={16} fill={(anime.rating ?? 0) >= n ? ANIME.magenta : 'none'} />
              </button>
            ))}
          </div>
        </div>

        {/* Notas */}
        {anime.notas && (
          <div style={{ background: ANIME.surface, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, color: ANIME.textSoft, marginBottom: 6 }}>Notas</div>
            <p style={{ fontSize: 14, color: ANIME.text, lineHeight: 1.6 }}>{anime.notas}</p>
          </div>
        )}
      </div>
    </div>
  )
}
