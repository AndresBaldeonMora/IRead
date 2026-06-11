import { Plus } from 'lucide-react'
import { Manga } from '@/types'
import { MANGA, hardShadow } from '@/utils/mangaTheme'
import { MangaCover, MProgressBar, MStatusBadge, TypeBadge } from './MangaPrimitives'

interface Props {
  manga: Manga
  onPress: () => void
  onAdvance: () => void
}

export function MangaCard({ manga, onPress, onAdvance }: Props) {
  const showQuick = manga.estado === 'leyendo' && manga.leidos < manga.total

  return (
    <div
      onClick={onPress}
      style={{
        display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'stretch',
        padding: 12,
        background: MANGA.paper,
        border: `2px solid ${MANGA.ink}`,
        borderRadius: 8,
        boxShadow: hardShadow(3, 3),
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <MangaCover manga={manga} w={54} h={76} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Estado + tipo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
          <MStatusBadge status={manga.estado} />
          <TypeBadge tipo={manga.tipo} />
        </div>

        <div style={{ fontSize: 15, fontWeight: 800, color: MANGA.ink, lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {manga.titulo}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 500, color: MANGA.brown, marginTop: 2 }}>
          {manga.autor} · {manga.anio}
        </div>

        {/* Progress */}
        <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <MProgressBar value={manga.leidos} total={manga.total} color={manga.color} thick={5} />
          </div>
          <span style={{ fontSize: 10.5, color: MANGA.ink, fontWeight: 800 }}>
            {manga.leidos}/{manga.total}
          </span>
        </div>
      </div>

      {/* Quick advance button */}
      {showQuick && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdvance() }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 26, height: 26,
            background: MANGA.gold,
            border: `1.5px solid ${MANGA.ink}`,
            borderRadius: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: hardShadow(1.5, 1.5),
            cursor: 'pointer',
          }}
        >
          <Plus size={14} color={MANGA.ink} strokeWidth={2.6} />
        </button>
      )}
    </div>
  )
}
