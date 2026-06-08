import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import { useMangasStore, selectFilteredMangas } from '@/stores/mangas.store'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import { MANGA, MANGA_STATUS, tipoLabel } from '@/utils/mangaTheme'
import type { MangaFiltro, MangaTipoFiltro, MangaInput } from '@/types'
import MangaAddModal from '@/components/manga/MangaAddModal'

const FILTROS: { key: MangaFiltro; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'leyendo', label: 'Leyendo' },
  { key: 'completado', label: 'Completado' },
  { key: 'pausado', label: 'Pausado' },
  { key: 'pendiente', label: 'Pendiente' },
]

export default function MangaListPage() {
  const navigate = useNavigate()
  const filtro = useMangasStore((s) => s.filtro)
  const tipoFiltro = useMangasStore((s) => s.tipoFiltro)
  const busqueda = useMangasStore((s) => s.busqueda)
  const setFiltro = useMangasStore((s) => s.setFiltro)
  const setTipoFiltro = useMangasStore((s) => s.setTipoFiltro)
  const setBusqueda = useMangasStore((s) => s.setBusqueda)
  const addManga = useMangasStore((s) => s.addManga)
  const advanceManga = useMangasStore((s) => s.advanceManga)
  const rawMangas = useMangasStore((s) => s.mangas)
  const mangas = useMemo(
    () => selectFilteredMangas({ mangas: rawMangas, filtro, tipoFiltro, busqueda } as any),
    [rawMangas, filtro, tipoFiltro, busqueda]
  )
  const [showModal, setShowModal] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: MANGA.paper, color: MANGA.ink }}>
      <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: MANGA.sepia }}>Manga</h1>
          <button onClick={() => setShowModal(true)} style={{
            background: MANGA.terracotta, color: '#fff', borderRadius: 10, padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600,
          }}>
            <Plus size={16} /> Agregar
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: MANGA.brown }} />
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar manga…"
            style={{
              width: '100%', padding: '9px 36px', borderRadius: 10, fontSize: 14,
              background: MANGA.panel, border: `1px solid ${MANGA.sepia}30`,
              color: MANGA.ink, outline: 'none',
            }}
          />
          {busqueda && <button onClick={() => setBusqueda('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: MANGA.brown }}><X size={15} /></button>}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 8 }}>
          {FILTROS.map((f) => {
            const status = f.key !== 'todos' ? MANGA_STATUS[f.key as keyof typeof MANGA_STATUS] : null
            return (
              <button key={f.key} onClick={() => setFiltro(f.key)} style={{
                padding: '4px 12px', borderRadius: 16, fontSize: 12,
                background: filtro === f.key ? (status?.bg ?? MANGA.terracotta) : MANGA.panel,
                color: filtro === f.key ? (status?.text ?? '#fff') : MANGA.brown,
                border: `1px solid ${filtro === f.key ? (status?.bg ?? MANGA.terracotta) : MANGA.sepia + '30'}`,
              }}>{f.label}</button>
            )
          })}
          {(['todos','manga','manwha'] as MangaTipoFiltro[]).map((t) => (
            <button key={t} onClick={() => setTipoFiltro(t)} style={{
              padding: '4px 12px', borderRadius: 16, fontSize: 12,
              background: tipoFiltro === t ? MANGA.gold : MANGA.panel,
              color: tipoFiltro === t ? MANGA.sepia : MANGA.brown,
              border: `1px solid ${tipoFiltro === t ? MANGA.gold : MANGA.sepia + '30'}`,
            }}>{t === 'todos' ? 'Todos los tipos' : tipoLabel(t as 'manga' | 'manwha')}</button>
          ))}
        </div>
        <div style={{ paddingBottom: 8, borderBottom: `1px solid ${MANGA.sepia}20`, fontSize: 12, color: MANGA.brown }}>
          {mangas.length} manga{mangas.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 32px 32px' }}>
        {mangas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, fontStyle: 'italic', color: MANGA.brown, fontSize: 18 }}>
            No hay mangas aquí
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mangas.map((manga) => {
              const status = MANGA_STATUS[manga.estado]
              const progreso = manga.total > 0 ? manga.leidos / manga.total : 0
              return (
                <div key={manga.id}
                  style={{ background: MANGA.panel, borderRadius: 12, padding: '12px 16px', cursor: 'pointer', border: `1px solid ${MANGA.sepia}20` }}
                  onClick={() => navigate(`/manga/${manga.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: MANGA.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{manga.titulo}</div>
                      <div style={{ fontSize: 12, color: MANGA.brown, marginTop: 2 }}>{manga.autor} · {tipoLabel(manga.tipo)}</div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 11, background: status.bg, color: status.text, flexShrink: 0, marginLeft: 8 }}>
                      {status.label}
                    </span>
                  </div>
                  {manga.total > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: MANGA.brown, marginBottom: 3 }}>
                        <span>{manga.leidos}/{manga.total} {manga.unidad}s</span>
                        <span>{Math.round(progreso * 100)}%</span>
                      </div>
                      <div style={{ height: 4, background: `${MANGA.sepia}20`, borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${progreso * 100}%`, background: status.bg, borderRadius: 2 }} />
                      </div>
                    </div>
                  )}
                  {manga.estado === 'leyendo' && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => advanceManga(manga.id, -1)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, background: MANGA.panel, color: MANGA.brown, border: `1px solid ${MANGA.sepia}30` }}>−</button>
                      <button onClick={() => advanceManga(manga.id, 1)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, background: MANGA.terracotta, color: '#fff' }}>+</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
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
