import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useMangasStore } from '@/stores/mangas.store'
import { MANGA, MANGA_STATUS, hardShadow } from '@/utils/mangaTheme'
import { MangaCard } from '@/components/manga/MangaCard'

export default function MangaLeyendoPage() {
  const navigate     = useNavigate()
  const mangas       = useMangasStore((s) => s.mangas)
  const advanceManga = useMangasStore((s) => s.advanceManga)
  const [query, setQuery]   = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return mangas.filter((m) => {
      if (m.estado !== 'leyendo') return false
      if (!q) return true
      return m.titulo.toLowerCase().includes(q) || m.autor.toLowerCase().includes(q)
    })
  }, [mangas, query])

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      background: `linear-gradient(180deg, ${MANGA.bgTop} 0%, ${MANGA.bgBottom} 100%)`,
      color: MANGA.ink,
    }}>
      <div style={{ padding: '28px 18px 40px' }}>

        {/* Header */}
        <div style={{ paddingLeft: 4, marginBottom: 16 }}>
          <div style={{ display: 'inline-block', padding: '3px 9px', background: MANGA.ink, marginBottom: 8 }}>
            <span style={{ color: MANGA.paper, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.8, textTransform: 'uppercase' }}>
              {visible.length} obras
            </span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.8, color: MANGA.ink, margin: 0 }}>
            Leyendo
          </h1>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={17} color={MANGA.terracotta} strokeWidth={2}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título o autor…"
            style={{
              width: '100%', padding: '11px 40px', fontSize: 14, fontWeight: 500,
              background: MANGA.paper, border: `2px solid ${MANGA.ink}`,
              borderRadius: 8, color: MANGA.ink, outline: 'none',
              boxSizing: 'border-box', boxShadow: hardShadow(2, 2),
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: MANGA.brown, cursor: 'pointer', background: 'none', border: 'none' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* List */}
        {visible.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', border: `2px dashed ${MANGA.ink}`, background: MANGA.paper }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: MANGA.ink }}>Nada por aquí</div>
            <div style={{ marginTop: 4, fontSize: 13, color: MANGA.brown }}>
              {query ? `Sin resultados para "${query}"` : 'No tienes manga marcado como Leyendo'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visible.map((manga) => (
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
  )
}
