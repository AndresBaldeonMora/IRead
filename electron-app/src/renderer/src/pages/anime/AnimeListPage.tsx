import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import { useAnimesStore, selectFilteredAnimes, AnimesFilterState } from '@/stores/animes.store'
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme'
import type { AnimeFiltro, AnimeInput } from '@/types'
import AnimeAddModal from '@/components/anime/AnimeAddModal'
import { AnimeCard } from '@/components/anime/AnimeCard'

const TABS: { id: AnimeFiltro; label: string; glow: string }[] = [
  { id: 'viendo',     label: 'Viendo',     glow: ANIME_STATUS.viendo.glow },
  { id: 'completado', label: 'Completados', glow: ANIME_STATUS.completado.glow },
  { id: 'pausado',    label: 'Pausados',    glow: ANIME_STATUS.pausado.glow },
  { id: 'pendiente',  label: 'Pendientes',  glow: ANIME_STATUS.pendiente.glow },
]

export default function AnimeListPage() {
  const navigate   = useNavigate()
  const filtro     = useAnimesStore((s) => s.filtro)
  const busqueda   = useAnimesStore((s) => s.busqueda)
  const setFiltro  = useAnimesStore((s) => s.setFiltro)
  const setBusqueda = useAnimesStore((s) => s.setBusqueda)
  const addAnime   = useAnimesStore((s) => s.addAnime)
  const advanceEp  = useAnimesStore((s) => s.advanceEp)
  const rawAnimes  = useAnimesStore((s) => s.animes)

  const animes = useMemo(
    () => selectFilteredAnimes({ animes: rawAnimes, filtro, busqueda } as AnimesFilterState),
    [rawAnimes, filtro, busqueda]
  )

  const [showModal, setShowModal] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: ANIME.bg, color: ANIME.text }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '0 18px 28px' }}>

          {/* Header */}
          <div style={{ paddingTop: 28, paddingBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h1 style={{
                fontSize: 34, fontWeight: 800, letterSpacing: -0.5,
                color: ANIME.text, margin: 0,
              }}>
                Anime
              </h1>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px',
                  background: ANIME.cyan, color: '#fff',
                  borderRadius: 10,
                  border: 'none',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Plus size={15} strokeWidth={2.5} /> Agregar
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px', marginBottom: 14,
            background: ANIME.surface,
            border: `0.5px solid ${ANIME.line}`,
            borderRadius: 12,
          }}>
            <Search size={18} color={ANIME.cyan} strokeWidth={2} />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título…"
              style={{
                flex: 1, fontSize: 14, background: 'transparent',
                color: ANIME.text, border: 'none', outline: 'none', padding: 0,
              }}
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} style={{ color: ANIME.textSoft, cursor: 'pointer', background: 'none' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 14 }}>
            {TABS.map((t) => {
              const active = filtro === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setFiltro(t.id)}
                  style={{
                    padding: '7px 14px', borderRadius: 10,
                    border: `0.5px solid ${active ? t.glow : ANIME.line}`,
                    background: active ? `${t.glow}1a` : 'transparent',
                    color: active ? t.glow : ANIME.textSoft,
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* List */}
          {animes.length === 0 ? (
            <div style={{
              margin: '8px 0', padding: 40, textAlign: 'center',
              border: `0.5px dashed ${ANIME.line}`,
              borderRadius: 14,
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: ANIME.text }}>Nada por aquí</div>
              <div style={{ marginTop: 4, fontSize: 13, color: ANIME.textSoft }}>
                {busqueda ? `Sin resultados para "${busqueda}"` : 'Cambia los filtros o agrega un anime'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {animes.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onPress={() => navigate(`/anime/${anime.id}`)}
                  onAdvance={() => advanceEp(anime.id, 1)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AnimeAddModal
          onClose={() => setShowModal(false)}
          onSave={async (input: AnimeInput) => { await addAnime(input); setShowModal(false) }}
        />
      )}
    </div>
  )
}
