import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAnimesStore } from '@/stores/animes.store'
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme'
import { AnimeCover, ProgressBar, StatusChip } from '@/components/anime/AnimePrimitives'
import ConfirmDialog from '@/components/ConfirmDialog'
import type { AnimeEstado } from '@/types'

function MetaRow({ k, v, color, last }: { k: string; v: string; color?: string; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 16px',
      borderBottom: last ? 'none' : `0.5px solid ${ANIME.line}`,
    }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, color: ANIME.textSoft }}>
        {k}
      </span>
      <span style={{ fontSize: 14, fontWeight: 700, color: color ?? ANIME.text }}>
        {v}
      </span>
    </div>
  )
}

export default function AnimeDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const animes       = useAnimesStore((s) => s.animes)
  const advanceEp    = useAnimesStore((s) => s.advanceEp)
  const deleteAnime  = useAnimesStore((s) => s.deleteAnime)
  const updateAnime  = useAnimesStore((s) => s.updateAnime)

  const anime = animes.find((a) => a.id === id)
  const [notas, setNotas] = useState(anime?.notas ?? '')
  const [dialog, setDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  useEffect(() => { setNotas(anime?.notas ?? '') }, [anime?.id])

  if (!anime) return (
    <div style={{ background: ANIME.bg, color: ANIME.textSoft, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic' }}>
      Anime no encontrado
    </div>
  )

  const pct = anime.eps ? Math.round((anime.vistos / anime.eps) * 100) : 0

  const handleDelete = () => {
    setDialog({
      message: `¿Eliminar "${anime.titulo}" de la lista?`,
      onConfirm: () => { deleteAnime(anime.id); navigate('/anime') },
    })
  }

  const saveNotas = () => {
    if (notas !== (anime.notas ?? '')) {
      updateAnime(anime.id, { notas: notas.trim() || null })
    }
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: ANIME.bg, color: ANIME.text }}>
      {dialog && (
        <ConfirmDialog
          message={dialog.message}
          confirmLabel="Eliminar"
          danger
          onConfirm={() => { dialog.onConfirm(); setDialog(null) }}
          onCancel={() => setDialog(null)}
        />
      )}
      <div style={{ paddingBottom: 60 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
          <button
            onClick={() => navigate('/anime')}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: `0.5px solid ${ANIME.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: ANIME.text,
            }}
          >
            <ChevronLeft size={22} color={ANIME.text} />
          </button>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: anime.color }}>
            ID·{anime.id.slice(-3).toUpperCase()}
          </span>
        </div>

        {/* Hero row: cover + info */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', padding: '20px 22px' }}>
          <AnimeCover anime={anime} w={112} h={156} glyph={false} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <StatusChip status={anime.estado} />
              {anime.serie === 'emision' && (
                <span style={{ fontFamily: MONO, fontSize: 9, color: ANIME.lime, letterSpacing: 1, textTransform: 'uppercase' }}>
                  ● EMISIÓN
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4, color: ANIME.text, lineHeight: '26px', margin: '0 0 6px' }}>
              {anime.titulo}
            </h1>
            <div style={{ marginTop: 6, fontSize: 13, color: ANIME.textSoft }}>
              {anime.tipo === 'pelicula' ? 'Película' : anime.tipo === 'ova' ? 'OVA' : `Temporada ${anime.temporada}`} · {anime.anio}
            </div>
          </div>
        </div>

        {/* Progress block */}
        {anime.eps > 0 && (
          <div style={{
            margin: '0 22px 20px',
            padding: 16,
            background: ANIME.surface,
            border: `0.5px solid ${ANIME.line}`,
            borderRadius: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: ANIME.textSoft, textTransform: 'uppercase' }}>
                  EPISODIOS
                </div>
                <div style={{ marginTop: 4, fontSize: 28, fontWeight: 800, letterSpacing: -0.6, color: ANIME.text }}>
                  {anime.vistos}
                  <span style={{ color: ANIME.textSoft, fontWeight: 500 }}>/{anime.eps}</span>
                </div>
              </div>
              <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 800, color: anime.color }}>
                {pct}%
              </span>
            </div>

            <ProgressBar value={anime.vistos} total={anime.eps} color={anime.color} thick={6} />

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                onClick={() => advanceEp(anime.id, -1)}
                disabled={anime.vistos <= 0}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  border: `0.5px solid ${ANIME.line}`,
                  background: 'transparent', color: ANIME.text,
                  fontWeight: 700, fontSize: 13, cursor: anime.vistos <= 0 ? 'not-allowed' : 'pointer',
                  opacity: anime.vistos <= 0 ? 0.4 : 1,
                }}
              >
                – Episodio
              </button>
              <button
                onClick={() => advanceEp(anime.id, 1)}
                disabled={anime.vistos >= anime.eps}
                style={{
                  flex: 2, padding: '12px 0', borderRadius: 10,
                  background: anime.color, color: '#0E0B1A',
                  border: 'none',
                  fontWeight: 800, fontSize: 13, cursor: anime.vistos >= anime.eps ? 'not-allowed' : 'pointer',
                  opacity: anime.vistos >= anime.eps ? 0.4 : 1,
                }}
              >
                + Marcar episodio visto
              </button>
            </div>
          </div>
        )}

        {/* Status selector */}
        <div style={{ padding: '0 22px', marginTop: 22 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(ANIME_STATUS) as AnimeEstado[]).map((k) => {
              const s = ANIME_STATUS[k]
              const active = anime.estado === k
              return (
                <button
                  key={k}
                  onClick={() => updateAnime(anime.id, { estado: k })}
                  style={{
                    width: 'calc(50% - 4px)', padding: '12px 14px',
                    borderRadius: 12,
                    border: `0.5px solid ${active ? s.glow : ANIME.line}`,
                    background: active ? `${s.glow}1f` : ANIME.surface,
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontWeight: 700, fontSize: 13,
                    color: active ? s.glow : ANIME.text,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.glow, flexShrink: 0 }} />
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Meta card */}
        <div style={{ padding: '0 22px', marginTop: 22 }}>
          <div style={{
            background: ANIME.surface,
            border: `0.5px solid ${ANIME.line}`,
            borderRadius: 14, overflow: 'hidden',
          }}>
            <MetaRow k="TIPO" v={anime.tipo === 'pelicula' ? 'Película' : anime.tipo === 'ova' ? 'OVA' : 'Serie'} />
            {anime.tipo === 'serie' && <MetaRow k="TEMPORADA" v={`T${anime.temporada}`} />}
            <MetaRow k="AÑO" v={String(anime.anio)} />
            <MetaRow
              k="SERIE"
              v={anime.serie === 'emision' ? 'En emisión' : 'Finalizada'}
              color={anime.serie === 'emision' ? ANIME.lime : ANIME.text}
            />
            <MetaRow k="EPISODIOS" v={`${anime.eps} totales`} last />
          </div>
        </div>

        {/* Notes */}
        <div style={{ padding: '0 22px', marginTop: 22 }}>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            onBlur={saveNotas}
            placeholder="Escribe tus impresiones, citas, episodios favoritos…"
            rows={5}
            style={{
              width: '100%', padding: 14,
              background: ANIME.surface,
              border: `0.5px solid ${ANIME.line}`,
              borderRadius: 12,
              fontSize: 14, lineHeight: '21px',
              color: ANIME.text, outline: 'none', resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Delete */}
        <div style={{ padding: '0 22px', marginTop: 22 }}>
          <button
            onClick={handleDelete}
            style={{
              width: '100%', padding: '13px 0', textAlign: 'center',
              borderRadius: 12, border: `0.5px solid #FF2E9255`,
              background: 'transparent', color: ANIME.magenta,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            Eliminar de la lista
          </button>
        </div>

      </div>
    </div>
  )
}
