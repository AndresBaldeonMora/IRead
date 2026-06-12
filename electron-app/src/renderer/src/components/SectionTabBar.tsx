import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, List, Star, Sparkles, BookMarked, Library, User, Heart, Play, BookOpen, Plus } from 'lucide-react'
import { ANIME } from '@/utils/animeTheme'
import { MANGA } from '@/utils/mangaTheme'
import { useAnimesStore } from '@/stores/animes.store'
import { useMangasStore } from '@/stores/mangas.store'
import { useBooksStore } from '@/stores/books.store'
import AnimeAddModal from '@/components/anime/AnimeAddModal'
import MangaAddModal from '@/components/manga/MangaAddModal'
import AddBookModal from '@/components/AddBookModal'
import type { AnimeInput, MangaInput, BookInput } from '@/types'

// ─── Section detection ────────────────────────────────────────────────────────

type Section = 'books' | 'anime' | 'manga'

function detectSection(pathname: string): Section {
  if (pathname.startsWith('/anime')) return 'anime'
  if (pathname.startsWith('/manga')) return 'manga'
  return 'books'
}

// ─── Theme per section ────────────────────────────────────────────────────────

const SECTION_THEME = {
  books: {
    tabBg:      'rgba(251,243,226,0.98)',
    tabBorder:  'rgba(74,26,38,0.12)',
    activeColor: '#7A2E3A',
    inactiveColor: 'rgba(74,26,38,0.45)',
    fabBg:      '#7A2E3A',
    fabColor:   '#FBF3E2',
    subTabBg:   'rgba(251,243,226,0.98)',
    subTabBorder: 'rgba(74,26,38,0.10)',
    divider:    'rgba(74,26,38,0.12)',
    splashColor: '#7A2E3A',
    pill: {
      bg: 'rgba(251,243,226,0.95)',
      border: 'rgba(74,26,38,0.10)',
      radius: 999,
      borderWidth: '0.5px',
    },
  },
  anime: {
    tabBg:      'rgba(12,11,9,0.98)',
    tabBorder:  'rgba(255,255,255,0.08)',
    activeColor: ANIME.cyan,
    inactiveColor: ANIME.textSoft,
    fabBg:      ANIME.cyan,
    fabColor:   '#0E0B1A',
    subTabBg:   ANIME.bg2,
    subTabBorder: ANIME.line,
    divider:    ANIME.line,
    splashColor: '#1C1735',
    pill: {
      bg: 'rgba(28,23,53,0.92)',
      border: 'rgba(255,255,255,0.10)',
      radius: 999,
      borderWidth: '0.5px',
    },
  },
  manga: {
    tabBg:      'rgba(255,247,236,0.98)',
    tabBorder:  '#1A0F0A',
    activeColor: '#B85042',
    inactiveColor: 'rgba(26,15,10,0.45)',
    fabBg:      '#E8A82C',
    fabColor:   '#1A0F0A',
    subTabBg:   'rgba(255,247,236,0.98)',
    subTabBorder: '#1A0F0A',
    divider:    'rgba(26,15,10,0.15)',
    splashColor: '#FFF7EC',
    pill: {
      bg: 'rgba(255,247,236,0.96)',
      border: '#1A0F0A',
      radius: 4,
      borderWidth: '1.5px',
    },
  },
}

// ─── Sub-tabs per section ─────────────────────────────────────────────────────

const SECTION_TABS = {
  books: [
    { path: '/inicio',     label: 'Inicio',    icon: Home },
    { path: '/biblioteca', label: 'Eternas',   icon: BookMarked },
    { path: '/deseos',     label: 'Personal',  icon: Library },
    { path: '/perfil',     label: 'Yo',        icon: User },
  ],
  anime: [
    { path: '/anime',            label: 'Inicio',      icon: Home },
    { path: '/anime/lista',      label: 'Lista',        icon: List },
    { path: '/anime/valorar',    label: 'Valorar',      icon: Star },
    { path: '/anime/completados',label: 'Yo',           icon: Sparkles },
  ],
  manga: [
    { path: '/manga',            label: 'Inicio',      icon: Home },
    { path: '/manga/lista',      label: 'Lista',        icon: BookOpen },
    { path: '/manga/leyendo',    label: 'Leyendo',      icon: Heart },
    { path: '/manga/completados',label: 'Yo',           icon: Sparkles },
  ],
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SectionTabBar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const addAnime  = useAnimesStore((s) => s.addAnime)
  const addManga  = useMangasStore((s) => s.addManga)
  const addBook   = useBooksStore((s) => s.addBook)

  const section = detectSection(location.pathname)
  const theme   = SECTION_THEME[section]
  const tabs    = SECTION_TABS[section]

  // Modal state
  const [showAnimeModal, setShowAnimeModal] = useState(false)
  const [showMangaModal, setShowMangaModal] = useState(false)
  const [showBookModal,  setShowBookModal]  = useState(false)

  // Transition overlay
  const [overlay, setOverlay] = useState<{ color: string; opacity: number } | null>(null)
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (overlayTimer.current) clearTimeout(overlayTimer.current) }, [])

  const goSection = (target: Section, path: string) => {
    if (target === section) { navigate(path); return }
    const color = SECTION_THEME[target].splashColor
    setOverlay({ color, opacity: 1 })
    navigate(path)
    // Brief flash then fade out
    overlayTimer.current = setTimeout(() => {
      setOverlay((o) => o ? { ...o, opacity: 0 } : null)
      overlayTimer.current = setTimeout(() => setOverlay(null), 350)
    }, 60)
  }

  const openAdd = () => {
    if (section === 'anime') setShowAnimeModal(true)
    else if (section === 'manga') setShowMangaModal(true)
    else setShowBookModal(true)
  }

  // ─── Active tab detection ─────────────────────────────────────────────────
  const activeTab = tabs.reduce((best, t) => {
    if (location.pathname === t.path) return t.path
    if (location.pathname.startsWith(t.path + '/') && t.path !== '/anime' && t.path !== '/manga') return t.path
    return best
  }, tabs[0].path)

  // ─── Pill segment style ───────────────────────────────────────────────────
  const p = theme.pill
  const pillStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', padding: 4, gap: 0,
    background: p.bg,
    border: `${p.borderWidth} solid ${p.border}`,
    borderRadius: p.radius,
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
  }

  const segStyle = (active: boolean, seg: typeof SECTION_THEME['books']): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '7px 12px', cursor: 'pointer', border: 'none',
    borderRadius: section === 'manga' ? 2 : 999,
    background: active ? seg.activeColor : 'transparent',
    color: active ? (section === 'manga' ? MANGA.paper : section === 'anime' ? '#EDE8D5' : '#FFFFFF') : seg.inactiveColor,
    fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4,
    boxShadow: active && section !== 'manga' ? `0 0 8px ${seg.activeColor}99` : 'none',
    transition: 'all 0.15s',
  })

  return (
    <>
      {/* Transition overlay */}
      {overlay && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: overlay.color,
          opacity: overlay.opacity,
          transition: 'opacity 0.35s ease',
          pointerEvents: 'none',
        }} />
      )}

      {/* Anime add modal */}
      {showAnimeModal && (
        <AnimeAddModal
          onClose={() => setShowAnimeModal(false)}
          onSave={async (input: AnimeInput) => { await addAnime(input); setShowAnimeModal(false) }}
        />
      )}
      {/* Manga add modal */}
      {showMangaModal && (
        <MangaAddModal
          onClose={() => setShowMangaModal(false)}
          onSave={async (input: MangaInput) => { await addManga(input); setShowMangaModal(false) }}
        />
      )}
      {/* Book add modal */}
      {showBookModal && (
        <AddBookModal
          onClose={() => setShowBookModal(false)}
          onSave={async (input: Omit<BookInput, 'numero'>) => { await addBook(input); setShowBookModal(false) }}
        />
      )}

      {/* ─── Tab bar ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        background: theme.tabBg,
        borderBottom: `1px solid ${theme.tabBorder}`,
        flexShrink: 0,
      }}>

        {/* Row 1: Section pill + Add button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 0' }}>

          {/* Section switcher pill */}
          <div style={pillStyle}>
            {/* Books segment */}
            <button
              onClick={() => goSection('books', '/inicio')}
              style={segStyle(section === 'books', SECTION_THEME['books'])}
            >
              <BookOpen size={13} strokeWidth={2} />
              Libros
            </button>

            {/* Anime segment */}
            <button
              onClick={() => goSection('anime', '/anime')}
              style={segStyle(section === 'anime', SECTION_THEME['anime'])}
            >
              <Play
                size={13} strokeWidth={2}
                fill={section === 'anime' ? '#EDE8D5' : 'transparent'}
              />
              Animes
            </button>

            {/* Manga segment */}
            <button
              onClick={() => goSection('manga', '/manga')}
              style={segStyle(section === 'manga', SECTION_THEME['manga'])}
            >
              <BookMarked size={13} strokeWidth={2} />
              Manga
            </button>
          </div>

          {/* FAB — Add button */}
          <button
            onClick={openAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: section === 'manga' ? 2 : 10,
              background: theme.fabBg, color: theme.fabColor,
              border: section === 'manga' ? `1.5px solid #1A0F0A` : 'none',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              boxShadow: section === 'manga'
                ? `2px 2px 0 #1A0F0A`
                : `0 4px 12px ${theme.fabBg}66`,
              letterSpacing: section === 'manga' ? 0.4 : 0,
              textTransform: section === 'manga' ? 'uppercase' : 'none',
            }}
          >
            <Plus size={15} strokeWidth={2.6} />
            Agregar
          </button>
        </div>

        {/* Row 2: Sub-tabs */}
        <div style={{ display: 'flex', gap: 2, padding: '6px 14px 0' }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.path
            const Icon   = tab.icon
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px 10px',
                  background: 'transparent', border: 'none',
                  borderBottom: active ? `2.5px solid ${theme.activeColor}` : '2.5px solid transparent',
                  color: active ? theme.activeColor : theme.inactiveColor,
                  fontSize: 12, fontWeight: active ? 800 : 600,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
