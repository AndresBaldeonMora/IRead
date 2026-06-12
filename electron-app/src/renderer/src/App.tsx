import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore, useColors, useSerifFamily } from '@/stores/theme.store'
import { useBooksStore } from '@/stores/books.store'
import { useAnimesStore } from '@/stores/animes.store'
import { useMangasStore } from '@/stores/mangas.store'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import BibliotecaPage from '@/pages/BibliotecaPage'
import DeseosPage from '@/pages/DeseosPage'
import AjustesPage from '@/pages/AjustesPage'
import AnimeDashboardPage from '@/pages/anime/AnimeDashboardPage'
import AnimeListPage from '@/pages/anime/AnimeListPage'
import AnimeDetallePage from '@/pages/anime/AnimeDetallePage'
import MangaDashboardPage from '@/pages/manga/MangaDashboardPage'
import MangaListPage from '@/pages/manga/MangaListPage'
import MangaDetallePage from '@/pages/manga/MangaDetallePage'
import MangaLeyendoPage from '@/pages/manga/MangaLeyendoPage'
import MangaCompletadosPage from '@/pages/manga/MangaCompletadosPage'
import AnimeValorarPage from '@/pages/anime/AnimeValorarPage'
import AnimeCompletadosPage from '@/pages/anime/AnimeCompletadosPage'
import LibroDetallePage from '@/pages/LibroDetallePage'
import PerfilPage from '@/pages/PerfilPage'

export default function App() {
  const [ready, setReady] = useState(false)
  const loadTheme = useThemeStore((s) => s.loadTheme)
  const loadBooks = useBooksStore((s) => s.loadBooks)
  const loadAnimes = useAnimesStore((s) => s.loadAnimes)
  const loadMangas = useMangasStore((s) => s.loadMangas)
  const colors = useColors()
  const serif = useSerifFamily()

  useEffect(() => {
    Promise.all([loadTheme(), loadBooks(), loadAnimes(), loadMangas()])
      .finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#F1E6D1', fontFamily: "'Cormorant Garamond', serif",
        fontSize: 22, color: '#7A2E3A', letterSpacing: 2,
      }}>
        Mi Biblioteca
      </div>
    )
  }

  return (
    <div style={{ '--color-paper': colors.paper, '--color-paperCard': colors.paperCard,
      '--color-wine': colors.wine, '--color-wineLight': colors.wineLight,
      '--color-wineDeep': colors.wineDeep, '--color-ink': colors.ink,
      '--color-inkSoft': colors.inkSoft, '--color-gold': colors.gold,
      '--color-rose': colors.rose, '--color-roseSoft': colors.roseSoft,
      '--color-rule': colors.rule, '--font-serif': serif,
      height: '100%', background: colors.paper, color: colors.ink,
    } as React.CSSProperties}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/biblioteca" element={<BibliotecaPage />} />
          <Route path="/deseos" element={<DeseosPage />} />
          <Route path="/anime" element={<AnimeDashboardPage />} />
          <Route path="/anime/lista" element={<AnimeListPage />} />
          <Route path="/anime/valorar" element={<AnimeValorarPage />} />
          <Route path="/anime/completados" element={<AnimeCompletadosPage />} />
          <Route path="/anime/:id" element={<AnimeDetallePage />} />
          <Route path="/manga" element={<MangaDashboardPage />} />
          <Route path="/manga/lista" element={<MangaListPage />} />
          <Route path="/manga/leyendo" element={<MangaLeyendoPage />} />
          <Route path="/manga/completados" element={<MangaCompletadosPage />} />
          <Route path="/manga/:id" element={<MangaDetallePage />} />
          <Route path="/libro/:id" element={<LibroDetallePage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/ajustes" element={<AjustesPage />} />
        </Route>
      </Routes>
    </div>
  )
}
