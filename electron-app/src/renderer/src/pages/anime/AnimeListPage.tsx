import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import { useAnimesStore, selectFilteredAnimes } from '@/stores/animes.store'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import { ANIME, ANIME_STATUS } from '@/utils/animeTheme'
import type { AnimeFiltro, AnimeInput } from '@/types'
import AnimeAddModal from '@/components/anime/AnimeAddModal'

const FILTROS: { key: AnimeFiltro; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'viendo', label: 'Viendo' },
  { key: 'completado', label: 'Completado' },
  { key: 'pausado', label: 'Pausado' },
  { key: 'pendiente', label: 'Pendiente' },
]

export default function AnimeListPage() {
  const navigate = useNavigate()
  const filtro = useAnimesStore((s) => s.filtro)
  const busqueda = useAnimesStore((s) => s.busqueda)
  const setFiltro = useAnimesStore((s) => s.setFiltro)
  const setBusqueda = useAnimesStore((s) => s.setBusqueda)
  const addAnime = useAnimesStore((s) => s.addAnime)
  const advanceEp = useAnimesStore((s) => s.advanceEp)
  const rawAnimes = useAnimesStore((s) => s.animes)
  const animes = useMemo(
    () => selectFilteredAnimes({ animes: rawAnimes, filtro, busqueda } as any),
    [rawAnimes, filtro, busqueda]
  )
  const [showModal, setShowModal] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: ANIME.bg, color: ANIME.text }}>
      <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: ANIME.text }}>Anime</h1>
          <button onClick={() => setShowModal(true)} style={{
            background: ANIME.cyan, color: '#fff', borderRadius: 10, padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600,
          }}>
            <Plus size={16} /> Agregar
          </button>
        </div>

        {/* Búsqueda */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: ANIME.textSoft }} />
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar anime…"
            style={{
              width: '100%', padding: '9px 36px', borderRadius: 10, fontSize: 14,
              background: ANIME.surface, border: `1px solid ${ANIME.line}`,
              color: ANIME.text, outline: 'none',
            }}
          />
          {busqueda && <button onClick={() => setBusqueda('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: ANIME.textSoft }}><X size={15} /></button>}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 12, borderBottom: `1px solid ${ANIME.line}` }}>
          {FILTROS.map((f) => {
            const status = f.key !== 'todos' ? ANIME_STATUS[f.key as keyof typeof ANIME_STATUS] : null
            return (
              <button key={f.key} onClick={() => setFiltro(f.key)} style={{
                padding: '4px 12px', borderRadius: 16, fontSize: 12,
                background: filtro === f.key ? (status?.glow ?? ANIME.cyan) : ANIME.surface,
                color: filtro === f.key ? '#fff' : ANIME.textSoft,
                border: `1px solid ${filtro === f.key ? (status?.glow ?? ANIME.cyan) : ANIME.line}`,
              }}>{f.label}</button>
            )
          })}
        </div>
        <div style={{ padding: '8px 0', fontSize: 12, color: ANIME.textSoft }}>
          {animes.length} anime{animes.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 32px 32px' }}>
        {animes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: ANIME.textSoft, fontSize: 18 }}>
            No hay animes aquí
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {animes.map((anime) => {
              const status = ANIME_STATUS[anime.estado]
              const progreso = anime.eps > 0 ? anime.vistos / anime.eps : 0
              return (
                <div key={anime.id}
                  style={{
                    background: ANIME.surface, borderRadius: 12, padding: '12px 16px',
                    border: `1px solid ${ANIME.line}`, cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/anime/${anime.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: ANIME.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {anime.titulo}
                      </div>
                      <div style={{ fontSize: 12, color: ANIME.textSoft, marginTop: 2 }}>
                        {anime.anio} · {anime.tipo}
                      </div>
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: 8, fontSize: 11,
                      background: status.glow + '30', color: status.glow, flexShrink: 0, marginLeft: 8,
                    }}>
                      {status.label}
                    </span>
                  </div>

                  {anime.eps > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: ANIME.textSoft, marginBottom: 4 }}>
                        <span>{anime.vistos}/{anime.eps} eps</span>
                        <span>{Math.round(progreso * 100)}%</span>
                      </div>
                      <div style={{ height: 4, background: ANIME.line, borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${progreso * 100}%`, background: status.glow, borderRadius: 2 }} />
                      </div>
                    </div>
                  )}

                  {anime.estado === 'viendo' && anime.eps > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => advanceEp(anime.id, -1)} style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 12,
                        background: ANIME.surface, color: ANIME.textSoft, border: `1px solid ${ANIME.line}`,
                      }}>−</button>
                      <button onClick={() => advanceEp(anime.id, 1)} style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 12,
                        background: status.glow, color: '#fff',
                      }}>+ ep</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
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
