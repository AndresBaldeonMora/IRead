import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useMangasStore } from '@/stores/mangas.store'
import { MANGA, hardShadow, tipoLabel } from '@/utils/mangaTheme'

export default function MangaCompletadosPage() {
  const navigate = useNavigate()
  const mangas   = useMangasStore((s) => s.mangas)

  const completados = useMemo(
    () => mangas.filter((m) => m.estado === 'completado').sort((a, b) => a.titulo.localeCompare(b.titulo)),
    [mangas]
  )

  const stats = useMemo(() => ({
    manga:       completados.filter((m) => m.tipo === 'manga').length,
    manwha:      completados.filter((m) => m.tipo === 'manwha').length,
    tomosLeidos: completados.filter((m) => m.unidad === 'tomo').reduce((s, m) => s + m.leidos, 0),
    capsLeidas:  completados.filter((m) => m.unidad === 'capitulo').reduce((s, m) => s + m.leidos, 0),
  }), [completados])

  const [selectedTipo, setSelectedTipo] = useState<'manga' | 'manwha' | null>(null)

  const listDelTipo = useMemo(() => {
    if (!selectedTipo) return []
    return completados.filter((m) => m.tipo === selectedTipo)
  }, [completados, selectedTipo])

  const maxTypeCount = Math.max(stats.manga, stats.manwha, 1)

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      background: `linear-gradient(180deg, ${MANGA.bgTop} 0%, ${MANGA.bgBottom} 100%)`,
      color: MANGA.ink,
    }}>
      <div style={{ padding: '28px 22px 40px' }}>

        <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1.5, color: MANGA.ink, margin: '0 0 20px' }}>
          Completados
        </h1>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[
            { top: completados.length, label: 'Total' },
            { top: stats.manga, label: 'Manga' },
            { top: stats.manwha, label: 'Manwha' },
            { top: stats.tomosLeidos, label: 'Tomos' },
          ].map((p) => (
            <div key={p.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 8px', background: MANGA.paper, border: `1.5px solid ${MANGA.ink}`, boxShadow: hardShadow(2, 2) }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: MANGA.terracotta, letterSpacing: -0.5 }}>{p.top}</span>
              <span style={{ fontSize: 9, color: MANGA.brown, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Chart manga vs manwha */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: MANGA.brown, marginBottom: 10, textAlign: 'center' }}>· manga vs manwha ·</div>
          <div style={{ background: MANGA.paper, border: `1.5px solid ${MANGA.ink}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: hardShadow(3, 3) }}>
            {([['manga', stats.manga, MANGA.terracotta], ['manwha', stats.manwha, MANGA.goldDeep]] as const).map(([tipo, count, barColor]) => {
              const isSelected = selectedTipo === tipo
              const widthPct = count > 0 ? (count / maxTypeCount) * 100 : 0
              return (
                <div key={tipo} onClick={() => setSelectedTipo(prev => prev === tipo ? null : tipo)} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', width: 58, color: isSelected ? MANGA.sepia : MANGA.brown }}>
                    {tipoLabel(tipo)}
                  </span>
                  <div style={{ flex: 1, height: 16, background: MANGA.panel, border: `1px solid ${MANGA.ink}`, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${widthPct}%`, background: isSelected ? MANGA.sepia : barColor, minWidth: count > 0 ? 8 : 0, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ width: 28, fontSize: 14, fontWeight: 800, textAlign: 'right', color: isSelected ? MANGA.sepia : MANGA.brown }}>{count}</span>
                </div>
              )
            })}
          </div>
          {completados.length > 0 && (
            <div style={{ fontSize: 10, fontWeight: 600, color: MANGA.brown, textAlign: 'center', marginTop: 10, fontStyle: 'italic' }}>
              Haz clic para ver los títulos de ese tipo
            </div>
          )}
        </div>

        {/* Lista del tipo seleccionado */}
        {selectedTipo && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: MANGA.brown, marginBottom: 10, textAlign: 'center' }}>· {tipoLabel(selectedTipo)} ·</div>
            <div style={{ background: MANGA.paper, border: `1.5px solid ${MANGA.ink}`, overflow: 'hidden', boxShadow: hardShadow(3, 3) }}>
              {listDelTipo.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: MANGA.brown, fontStyle: 'italic', fontSize: 13 }}>Ningún título aquí</div>
              ) : listDelTipo.map((m, i) => (
                <div key={m.id} onClick={() => navigate(`/manga/${m.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderTop: i > 0 ? `1.5px solid ${MANGA.panel}` : 'none', cursor: 'pointer' }}>
                  <div style={{ width: 5, height: 40, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: MANGA.ink }}>{m.titulo}</div>
                    <div style={{ fontSize: 11, color: MANGA.brown, marginTop: 2, fontWeight: 600 }}>{m.autor}{m.anio > 0 ? ` · ${m.anio}` : ''}</div>
                  </div>
                  <BookOpen size={16} color={MANGA.terracotta} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todos los completados */}
        {!selectedTipo && completados.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: MANGA.brown, marginBottom: 10, textAlign: 'center' }}>· todos los completados ·</div>
            <div style={{ background: MANGA.paper, border: `1.5px solid ${MANGA.ink}`, overflow: 'hidden', boxShadow: hardShadow(3, 3) }}>
              {completados.map((m, i) => (
                <div key={m.id} onClick={() => navigate(`/manga/${m.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderTop: i > 0 ? `1.5px solid ${MANGA.panel}` : 'none', cursor: 'pointer' }}>
                  <div style={{ width: 5, height: 40, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: MANGA.ink }}>{m.titulo}</div>
                    <div style={{ fontSize: 11, color: MANGA.brown, marginTop: 2, fontWeight: 600 }}>{tipoLabel(m.tipo)}{m.autor ? ` · ${m.autor}` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: MANGA.terracotta }}>{m.leidos}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: MANGA.brown, letterSpacing: 0.8, textTransform: 'uppercase' }}>{m.unidad === 'tomo' ? 'tomos' : 'caps'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completados.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', border: `2px dashed ${MANGA.ink}`, background: MANGA.paper, boxShadow: hardShadow(3, 3) }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: MANGA.ink }}>Sin completados aún</div>
            <div style={{ marginTop: 4, fontSize: 13, color: MANGA.brown }}>Completa un manga o manwha para verlo aquí</div>
          </div>
        )}

        {/* Quote */}
        <div style={{ marginTop: 32, padding: 22, background: MANGA.paper, border: `1.5px solid ${MANGA.ink}`, boxShadow: hardShadow(3, 3) }}>
          <div style={{ fontSize: 15, fontStyle: 'italic', lineHeight: '22px', color: MANGA.sepia, textAlign: 'center' }}>
            "El manga es la literatura que dibuja el tiempo."
          </div>
        </div>
      </div>
    </div>
  )
}
