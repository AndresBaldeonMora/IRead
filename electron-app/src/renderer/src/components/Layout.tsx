import { Outlet, NavLink } from 'react-router-dom'
import { Home, BookOpen, Heart, Tv, BookMarked, User, Settings } from 'lucide-react'
import { useColors, useSerifFamily } from '@/stores/theme.store'

const NAV = [
  { to: '/inicio',     icon: Home,       label: 'Inicio' },
  { to: '/biblioteca', icon: BookOpen,   label: 'Eternas' },
  { to: '/deseos',     icon: Heart,      label: 'Personal' },
  { to: '/anime',      icon: Tv,         label: 'Anime' },
  { to: '/manga',      icon: BookMarked, label: 'Manga' },
  { to: '/perfil',     icon: User,       label: 'Mi rincón' },
  { to: '/ajustes',    icon: Settings,   label: 'Ajustes' },
]

export default function Layout() {
  const colors = useColors()
  const serif = useSerifFamily()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <nav style={{
        width: 200, flexShrink: 0, background: colors.wineDeep,
        display: 'flex', flexDirection: 'column', padding: '24px 0',
      }}>
        <div style={{
          fontFamily: serif, fontSize: 18, fontWeight: 600,
          color: colors.gold, textAlign: 'center', marginBottom: 32,
          letterSpacing: 1, padding: '0 16px',
        }}>
          Mi Biblioteca
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive ? colors.gold : 'rgba(245,232,216,0.65)',
                fontSize: 14, fontFamily: serif, transition: 'all 0.15s',
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: colors.paper }}>
        <Outlet />
      </main>
    </div>
  )
}
