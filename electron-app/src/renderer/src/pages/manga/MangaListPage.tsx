import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import { useMangasStore, selectFilteredMangas, MangasFilterState } from '@/stores/mangas.store'
import { MANGA, MANGA_STATUS, hardShadow } from '@/utils/mangaTheme'
import type { MangaFiltro, MangaTipoFiltro, MangaInput } from '@/types'
import MangaAddModal from '@/components/manga/MangaAddModal'
import { MangaCard } from '@/components/manga/MangaCard'

const TABS: { id: MangaFiltro; label: string; bg: string }[] = [
  { id: 'todos',      label: 'Todos',      bg: MANGA.ink },
  { id: 'leyendo',    label: 'Leyendo',    bg: MANGA_STATUS.leyendo.bg },
  { id: 'completado', label: 'Completados',bg: MANGA_STATUS.completado.bg },
  { id: 'pausado',    label: 'Pausados',   bg: MANGA_STATUS.pausado.bg },
  { id: 'pendiente',  label: 'Pendientes', bg: MANGA_STATUS.pendiente.bg },
]

const TYPE_TABS: { id: MangaTipoFiltro; label: string }[] = [
  { id: 'todos',  label: 'Todos' },
  { id: 'manga',  label: 'Manga' },
  { id: 'manwha', label: 'Manwha' },
]

export default function MangaListPage() {
  const navigate      = useNavigate()
  const filtro        = useMangasStore((s) => s.filtro)
  const tipoFiltro    = useMangasStore((s) => s.tipoFiltro)
  const busqueda      = useMangasStore((s) => s.busqueda)
  const setFiltro     = useMangasStore((s) => s.setFiltro)
  const setTipoFiltro = useMangasStore((s) => s.setTipoFiltro)
  const setBusqueda   = useMangasStore((s) => s.setBusqueda)
  const addManga      = useMangasStore((s) => s.addManga)
  const advanceManga  = useMangasStore((s) => s.advanceManga)
  const rawMangas     = useMangasStore((s) => s.mangas)

  const mangas = useMemo(
    () => selectFilteredMangas({ mangas: rawMangas, filtro, tipoFiltro, busqueda } as MangasFilterState),
    [rawMangas, filtro, tipoFiltro, busqueda]
  )

  const manwhaCount = rawMangas.filter((m) => m.tipo === 'manwha').length
  const [showModal, setShowModal] = useState(false)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: `linear-gradient(180deg, ${MANGA.bgTop} 0%, ${MANGA.bgBottom} 100%)`,
      color: MANGA.ink,
    }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '0 18px 28px' }}>

          {/* Header */}
          <div style={{ paddingTop: 32, paddingBottom: 16 }}>
            {/* Eyebrow tag */}
            <div style={{
              display: 'inline-block', padding: '3px 9px',
              background: MANGA.ink, marginBottom: 8,
            }}>
              <span style={{
                color: MANGA.paper, fontSize: 9.5, fontWeight: 800,
                letterSpacing: 1.8, textTransform: 'uppercase',
              }}>
                {rawMangas.length} obras · {manwhaCount} manwha
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.8, color: MANGA.ink, margin: 0 }}>
                Mi colección
              </h1>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px',
                  background: MANGA.terracotta, color: MANGA.paper,
                  border: `1.5px solid ${MANGA.ink}`,
                  fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  boxShadow: hardShadow(2, 2),
                }}
              >
                <Plus size={15} strokeWidth={2.6} /> Agregar
              </button>
            </div>
          </div>

          {/* Búsqueda */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={17} color={MANGA.terracotta} strokeWidth={2}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título o autor…"
              style={{
                width: '100%', padding: '11px 40px', fontSize: 14, fontWeight: 500,
                background: MANGA.paper, border: `2px solid ${MANGA.ink}`,
                borderRadius: 8, color: MANGA.ink, outline: 'none',
                boxSizing: 'border-box', boxShadow: hardShadow(2, 2),
              }}
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                color: MANGA.brown, cursor: 'pointer', background: 'none',
              }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Tabs de estado */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', paddingBottom: 12 }}>
            {TABS.map((t) => {
              const active = filtro === t.id
              const isGold = t.bg === MANGA_STATUS.completado.bg
              const textColor = isGold ? MANGA.ink : MANGA.paper
              return (
                <button
                  key={t.id}
                  onClick={() => setFiltro(t.id)}
                  style={{
                    padding: '7px 14px',
                    border: `1.5px solid ${MANGA.ink}`,
                    background: active ? t.bg : MANGA.paper,
                    color: active ? textColor : MANGA.ink,
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    boxShadow: active ? hardShadow(2, 2) : 'none',
                    transform: active ? 'translate(-1px, -1px)' : 'none',
                    transition: 'all 0.1s',
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* Filtro tipo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 16 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, color: MANGA.brown,
              letterSpacing: 1.4, textTransform: 'uppercase', marginRight: 4,
            }}>Tipo</span>
            {TYPE_TABS.map((t) => {
              const active = tipoFiltro === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTipoFiltro(t.id)}
                  style={{
                    padding: '4px 10px',
                    border: `1px solid ${MANGA.ink}`,
                    background: active ? MANGA.ink : 'transparent',
                    color: active ? MANGA.paper : MANGA.ink,
                    fontWeight: 700, fontSize: 10.5,
                    letterSpacing: 0.8, textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* Lista */}
          {mangas.length === 0 ? (
            <div style={{
              margin: '8px 0', padding: 40, textAlign: 'center',
              border: `2px dashed ${MANGA.ink}`,
              background: MANGA.paper,
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: MANGA.ink }}>Nada por aquí</div>
              <div style={{ marginTop: 4, fontSize: 13, color: MANGA.brown }}>
                {busqueda ? `Sin resultados para "${busqueda}"` : 'Ajusta los filtros o agrega un manga'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mangas.map((manga) => (
                <MangaCard
                  key={manga.id}
                  manga={manga}
                  onPress={() => navigate(`/manga/${manga.id}`)}
                  onAdvance={() => advanceManga(manga.id, 1)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <MangaAddModal
          onClose={() => setShowModal(false)}
          onSave={async (input: MangaInput) => { await addManga(input); setShowModal(false) }}
        />
      )}
    </div>
  )
}
