import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useMangasStore } from '@/stores/mangas.store'
import { MANGA, MANGA_STATUS, tipoLabel } from '@/utils/mangaTheme'

export default function MangaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const mangas = useMangasStore((s) => s.mangas)
  const advanceManga = useMangasStore((s) => s.advanceManga)
  const deleteManga = useMangasStore((s) => s.deleteManga)
  const updateManga = useMangasStore((s) => s.updateManga)

  const manga = mangas.find((m) => m.id === id)
  if (!manga) return (
    <div style={{ background: MANGA.paper, color: MANGA.ink, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      No encontrado
    </div>
  )

  const status = MANGA_STATUS[manga.estado]
  const progreso = manga.total > 0 ? manga.leidos / manga.total : 0

  const handleDelete = async () => {
    if (confirm(`¿Eliminar "${manga.titulo}"?`)) {
      await deleteManga(manga.id)
      navigate('/manga')
    }
  }

  return (
    <div style={{ background: MANGA.paper, color: MANGA.ink, height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '24px 32px', maxWidth: 700 }}>
        <button onClick={() => navigate('/manga')} style={{ display: 'flex', alignItems: 'center', gap: 8, color: MANGA.brown, marginBottom: 24, fontSize: 14 }}>
          <ArrowLeft size={18} /> Volver
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: MANGA.sepia }}>{manga.titulo}</h1>
            <div style={{ fontSize: 14, color: MANGA.brown, marginTop: 4 }}>
              {manga.autor} · {tipoLabel(manga.tipo)} · {manga.anio}
            </div>
          </div>
          <button onClick={handleDelete} style={{ color: MANGA.terracotta, padding: 8 }}><Trash2 size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {(['leyendo','completado','pausado','pendiente'] as const).map((est) => (
            <button key={est} onClick={() => updateManga(manga.id, { estado: est })} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13,
              background: manga.estado === est ? MANGA_STATUS[est].bg : MANGA.panel,
              color: manga.estado === est ? MANGA_STATUS[est].text : MANGA.brown,
              border: `1px solid ${manga.estado === est ? MANGA_STATUS[est].bg : MANGA.sepia + '30'}`,
            }}>
              {MANGA_STATUS[est].label}
            </button>
          ))}
        </div>

        {manga.total > 0 && (
          <div style={{ background: MANGA.panel, borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: MANGA.ink }}>
              <span>{manga.unidad === 'tomo' ? 'Tomos' : 'Capítulos'} leídos</span>
              <span style={{ fontWeight: 600 }}>{manga.leidos} / {manga.total}</span>
            </div>
            <div style={{ height: 8, background: `${MANGA.sepia}20`, borderRadius: 4, marginBottom: 16 }}>
              <div style={{ height: '100%', width: `${progreso * 100}%`, background: status.bg, borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => advanceManga(manga.id, -1)} style={{
                flex: 1, padding: '10px', borderRadius: 10,
                background: MANGA.panel, color: MANGA.brown, border: `1px solid ${MANGA.sepia}30`, fontSize: 18,
              }}>−</button>
              <button onClick={() => advanceManga(manga.id, 1)} style={{
                flex: 2, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: status.bg, color: status.text,
              }}>
                + {manga.unidad === 'tomo' ? 'Tomo' : 'Capítulo'}
              </button>
            </div>
          </div>
        )}

        {manga.notas && (
          <div style={{ background: MANGA.panel, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, color: MANGA.brown, marginBottom: 6 }}>Notas</div>
            <p style={{ fontSize: 14, color: MANGA.ink, lineHeight: 1.6 }}>{manga.notas}</p>
          </div>
        )}
      </div>
    </div>
  )
}
