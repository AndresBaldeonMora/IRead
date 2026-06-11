import { Plus } from 'lucide-react'
import { Anime } from '@/types'
import { ANIME, MONO } from '@/utils/animeTheme'
import { AnimeCover, ProgressBar, StatusChip } from './AnimePrimitives'

interface Props {
  anime: Anime
  onPress: () => void
  onAdvance: () => void
}

export function AnimeCard({ anime, onPress, onAdvance }: Props) {
  const showQuick = anime.estado === 'viendo' && anime.vistos < anime.eps

  return (
    <div
      onClick={onPress}
      style={{
        display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center',
        padding: 12,
        background: ANIME.surface,
        border: `0.5px solid ${ANIME.line}`,
        borderRadius: 14,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <AnimeCover anime={anime} w={56} h={76} glyph={false} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Status + EN EMISIÓN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <StatusChip status={anime.estado} />
          {anime.serie === 'emision' && (
            <span style={{ fontFamily: MONO, fontSize: 9, color: ANIME.lime, letterSpacing: 1, textTransform: 'uppercase' }}>
              ● EN EMISIÓN
            </span>
          )}
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, color: ANIME.text, lineHeight: '19px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {anime.titulo}
        </div>

        <div style={{ fontSize: 11.5, color: ANIME.textSoft, marginTop: 2 }}>
          {anime.tipo === 'pelicula' ? 'Película' : anime.tipo === 'ova' ? 'OVA' : `T${anime.temporada}`} · {anime.anio}
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <ProgressBar value={anime.vistos} total={anime.eps} color={anime.color} thick={3} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: ANIME.text, fontWeight: 600 }}>
            {anime.vistos}/{anime.eps}
          </span>
        </div>
      </div>

      {/* Quick advance */}
      {showQuick && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdvance() }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 28, height: 28, borderRadius: 8,
            background: `${anime.color}22`,
            border: `0.5px solid ${anime.color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Plus size={14} color={anime.color} strokeWidth={2.4} />
        </button>
      )}
    </div>
  )
}
