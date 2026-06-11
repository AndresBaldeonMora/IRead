import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useMangasStore } from '@/stores/mangas.store'
import { MANGA, MANGA_STATUS, hardShadow, tipoLabel } from '@/utils/mangaTheme'
import { MangaCover, MProgressBar, MStatusBadge, TypeBadge, Screentone } from '@/components/manga/MangaPrimitives'
import ConfirmDialog from '@/components/ConfirmDialog'
import type { MangaEstado } from '@/types'

function MetaRow({ k, v, color, last }: { k: string; v: string; color?: string; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 16px',
      borderBottom: last ? 'none' : `1.5px solid ${MANGA.ink}`,
    }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, color: MANGA.brown, textTransform: 'uppercase' }}>
        {k}
      </span>
      <span style={{ fontSize: 14, fontWeight: 700, color: color ?? MANGA.ink }}>
        {v}
      </span>
    </div>
  )
}

export default function MangaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const mangas       = useMangasStore((s) => s.mangas)
  const advanceManga = useMangasStore((s) => s.advanceManga)
  const deleteManga  = useMangasStore((s) => s.deleteManga)
  const updateManga  = useMangasStore((s) => s.updateManga)

  const manga = mangas.find((m) => m.id === id)
  const [notas, setNotas] = useState(manga?.notas ?? '')
  const [dialog, setDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  useEffect(() => { setNotas(manga?.notas ?? '') }, [manga?.id])

  if (!manga) return (
    <div style={{ flex: 1, background: `linear-gradient(180deg, ${MANGA.bgTop}, ${MANGA.bgBottom})`, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: MANGA.ink, fontWeight: 700 }}>Manga no encontrado</span>
      <button onClick={() => navigate('/manga')} style={{ color: MANGA.terracotta, marginTop: 8, fontWeight: 700, cursor: 'pointer', background: 'none' }}>
        Volver
      </button>
    </div>
  )

  const unitShort = manga.unidad === 'tomo' ? 'TOMO' : 'CAP'
  const unitWord  = manga.unidad === 'tomo' ? 'Tomo' : 'Capítulo'
  const pct = manga.total ? Math.round((manga.leidos / manga.total) * 100) : 0
  const serieLabel = manga.serie === 'serializacion' ? 'En serialización' : manga.serie === 'finalizada' ? 'Finalizada' : 'En pausa'

  const saveNotas = () => {
    if (notas !== (manga.notas ?? '')) {
      updateManga(manga.id, { notas: notas.trim() || null })
    }
  }

  const handleDelete = () => {
    setDialog({
      message: `¿Eliminar "${manga.titulo}" de la lista?`,
      onConfirm: () => { deleteManga(manga.id); navigate('/manga') },
    })
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      background: `linear-gradient(180deg, ${MANGA.bgTop} 0%, ${MANGA.bgBottom} 100%)`,
      color: MANGA.ink,
    }}>
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

        {/* Hero */}
        <div style={{ overflow: 'hidden', position: 'relative', paddingTop: 8 }}>
          <Screentone opacity={0.04} />

          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 0 }}>
            <button
              onClick={() => navigate('/manga')}
              style={{
                width: 40, height: 40,
                background: MANGA.paper, border: `2px solid ${MANGA.ink}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: hardShadow(2, 2), cursor: 'pointer',
              }}
            >
              <ChevronLeft size={20} color={MANGA.ink} strokeWidth={2.4} />
            </button>

            {/* ID tag */}
            <div style={{
              padding: '3px 8px',
              border: `1.5px solid ${MANGA.ink}`,
              background: MANGA.gold,
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: MANGA.ink, letterSpacing: 2 }}>
                #{String(manga.id).slice(-3).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Hero row: cover + info */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', padding: '20px 22px' }}>
            <MangaCover manga={manga} w={112} h={156} />
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <MStatusBadge status={manga.estado} />
                <TypeBadge tipo={manga.tipo} />
              </div>
              <h1 style={{ fontSize: 22, lineHeight: '24px', fontWeight: 800, letterSpacing: -0.4, color: MANGA.ink, margin: '0 0 6px' }}>
                {manga.titulo}
              </h1>
              <div style={{ fontSize: 13, fontWeight: 600, color: MANGA.brown }}>
                {manga.autor} · {manga.anio}
              </div>
            </div>
          </div>

          {/* Progress panel */}
          <div style={{
            margin: '0 22px 20px',
            padding: 16,
            background: MANGA.paper,
            border: `2px solid ${MANGA.ink}`,
            boxShadow: hardShadow(3, 3),
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 1.8, color: MANGA.brown, textTransform: 'uppercase', fontWeight: 800 }}>
                  {unitShort}S LEÍDOS
                </div>
                <div style={{ marginTop: 4, fontSize: 32, fontWeight: 800, letterSpacing: -0.8, color: MANGA.ink }}>
                  {manga.leidos}
                  <span style={{ color: MANGA.brown, fontWeight: 600 }}>/{manga.total}</span>
                </div>
              </div>
              {/* % tag rotado */}
              <div style={{
                padding: '6px 12px',
                background: manga.color,
                border: `1.5px solid ${MANGA.ink}`,
                transform: 'rotate(2deg)',
                boxShadow: hardShadow(2, 2),
              }}>
                <span style={{ color: MANGA.paper, fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>{pct}%</span>
              </div>
            </div>

            <MProgressBar value={manga.leidos} total={manga.total} color={manga.color} thick={8} />

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                onClick={() => advanceManga(manga.id, -1)}
                disabled={manga.leidos <= 0}
                style={{
                  flex: 1, padding: '11px 0', textAlign: 'center',
                  background: MANGA.paper, border: `1.5px solid ${MANGA.ink}`,
                  color: MANGA.ink, fontWeight: 800, fontSize: 13,
                  letterSpacing: 0.4, cursor: manga.leidos <= 0 ? 'not-allowed' : 'pointer',
                  opacity: manga.leidos <= 0 ? 0.4 : 1,
                }}
              >
                − {unitShort}
              </button>
              <button
                onClick={() => advanceManga(manga.id, 1)}
                disabled={manga.leidos >= manga.total}
                style={{
                  flex: 2, padding: '11px 0', textAlign: 'center',
                  background: MANGA.gold, border: `1.5px solid ${MANGA.ink}`,
                  color: MANGA.ink, fontWeight: 800, fontSize: 13,
                  letterSpacing: 0.4, cursor: manga.leidos >= manga.total ? 'not-allowed' : 'pointer',
                  opacity: manga.leidos >= manga.total ? 0.5 : 1,
                  boxShadow: manga.leidos >= manga.total ? 'none' : hardShadow(2, 2),
                }}
              >
                + {unitWord} leído
              </button>
            </div>
          </div>
        </div>

        {/* Estado selector */}
        <div style={{ padding: '0 22px', marginTop: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(MANGA_STATUS) as MangaEstado[]).map((k) => {
              const s = MANGA_STATUS[k]
              const active = manga.estado === k
              return (
                <button
                  key={k}
                  onClick={() => updateManga(manga.id, { estado: k })}
                  style={{
                    width: 'calc(50% - 4px)', padding: '12px 14px',
                    border: `1.5px solid ${MANGA.ink}`,
                    background: active ? s.bg : MANGA.paper,
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontWeight: 800, fontSize: 13,
                    color: active ? s.text : MANGA.ink,
                    cursor: 'pointer',
                    boxShadow: active ? hardShadow(2, 2) : 'none',
                  }}
                >
                  <div style={{
                    width: 9, height: 9,
                    background: active ? s.text : s.bg,
                    border: `1px solid ${active ? s.text : MANGA.ink}`,
                  }} />
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Meta rows */}
        <div style={{ padding: '0 22px', marginTop: 20 }}>
          <div style={{
            background: MANGA.paper,
            border: `2px solid ${MANGA.ink}`,
            boxShadow: hardShadow(3, 3),
          }}>
            <MetaRow k="AUTOR"   v={manga.autor} />
            <MetaRow k="AÑO"     v={String(manga.anio)} />
            <MetaRow k="FORMATO" v={manga.tipo === 'manwha' ? 'Manwha (Corea)' : 'Manga (Japón)'} />
            <MetaRow k="SERIE"   v={serieLabel} color={manga.serie === 'serializacion' ? MANGA.terracotta : MANGA.ink} />
            <MetaRow k={`${unitShort}S`} v={`${manga.total} totales`} last />
          </div>
        </div>

        {/* Notas */}
        <div style={{ padding: '0 22px', marginTop: 20 }}>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            onBlur={saveNotas}
            placeholder="Escribe tus impresiones, citas, arcos favoritos…"
            rows={5}
            style={{
              width: '100%', padding: 14,
              background: MANGA.paper, border: `2px solid ${MANGA.ink}`,
              fontSize: 14, fontWeight: 500, lineHeight: '21px',
              color: MANGA.ink, outline: 'none', resize: 'vertical',
              boxSizing: 'border-box',
              boxShadow: hardShadow(3, 3),
            }}
          />
        </div>

        {/* Eliminar */}
        <div style={{ padding: '0 22px', marginTop: 20 }}>
          <button
            onClick={handleDelete}
            style={{
              width: '100%', padding: '12px 0', textAlign: 'center',
              border: `1.5px solid ${MANGA.terracotta}`,
              background: 'transparent', color: MANGA.terracotta,
              fontWeight: 800, fontSize: 13, letterSpacing: 0.4,
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Eliminar de la lista
          </button>
        </div>

      </div>
    </div>
  )
}
