import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import SectionTabBar from '@/components/SectionTabBar'

export default function Layout() {
  const colors = useColors()
  const serif = useSerifFamily()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar — logo + ajustes only */}
      <nav style={{
        width: 56, flexShrink: 0, background: colors.wineDeep,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '20px 0 16px', gap: 0,
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: serif, fontSize: 11, fontWeight: 700,
          color: colors.gold, textAlign: 'center', letterSpacing: 1.5,
          textTransform: 'uppercase', lineHeight: '13px',
          marginBottom: 'auto', padding: '0 4px',
        }}>
          Mi<br />Bib
        </div>

        {/* Ajustes */}
        <NavLink
          to="/ajustes"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8, textDecoration: 'none',
            background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
            color: isActive ? colors.gold : 'rgba(245,232,216,0.55)',
          })}
          title="Ajustes"
        >
          <Settings size={18} />
        </NavLink>
      </nav>

      {/* Main — SectionTabBar on top, scrollable Outlet below */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: colors.paper }}>
        <SectionTabBar />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
