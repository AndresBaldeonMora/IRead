import { Manga, MangaEstado, MangaTipo } from '@/types'
import { MANGA, MANGA_STATUS, hardShadow, tipoLabel } from '@/utils/mangaTheme'

/** Halftone dot screentone overlay — translated from react-native-svg */
export function Screentone({ opacity = 0.06, size = 5, radius = 0.7, color = MANGA.sepia }: {
  opacity?: number; size?: number; radius?: number; color?: string
}) {
  const pid = `st-${Math.random().toString(36).slice(2)}`
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={pid} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <circle cx={size / 2} cy={size / 2} r={radius} fill={color} />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  )
}

/** Abstract manga cover with gradient, action lines, screentone and corner cut */
export function MangaCover({ manga, w = 64, h = 88 }: {
  manga: Pick<Manga, 'color' | 'tipo'>; w?: number; h?: number
}) {
  const c = manga.color || MANGA.terracotta
  const dotsId = `dots-${Math.random().toString(36).slice(2)}`
  const tagFont = w >= 100 ? 10 : 8

  return (
    <div style={{
      width: w, height: h, borderRadius: 4, overflow: 'hidden', position: 'relative', flexShrink: 0,
      border: `1.5px solid ${MANGA.ink}`,
      boxShadow: hardShadow(2, 2),
      background: `linear-gradient(135deg, ${c} 0%, #2A1810 100%)`,
    }}>
      {/* Action lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => {
          const off = i * (w / 5)
          return (
            <line key={i}
              x1={off} y1={-h}
              x2={off - h * 0.5} y2={h}
              stroke="rgba(255,255,255,0.08)" strokeWidth={1}
            />
          )
        })}
      </svg>

      {/* Screentone corner */}
      <div style={{ position: 'absolute', bottom: -2, left: -2, width: w * 0.6, height: h * 0.5, opacity: 0.5, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" aria-hidden="true">
          <defs>
            <pattern id={dotsId} x="0" y="0" width={4} height={4} patternUnits="userSpaceOnUse">
              <circle cx={2} cy={2} r={0.8} fill="rgba(255,255,255,0.6)" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${dotsId})`} />
        </svg>
      </div>

      {/* Corner cut */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 0, height: 0,
        borderTop: `18px solid ${MANGA.paper}`,
        borderLeft: '18px solid transparent',
      }} />

      {/* Format tag */}
      <div style={{
        position: 'absolute', bottom: 6, left: 6,
        padding: '2px 6px',
        background: MANGA.paper,
        border: `1px solid ${MANGA.ink}`,
        transform: 'rotate(-2deg)',
      }}>
        <span style={{
          color: MANGA.ink, fontSize: tagFont, fontWeight: 800,
          letterSpacing: 0.8, textTransform: 'uppercase',
        }}>
          {tipoLabel(manga.tipo)}
        </span>
      </div>
    </div>
  )
}

/** Progress bar with hard border — manga panel style */
export function MProgressBar({ value, total, color = MANGA.terracotta, thick = 6 }: {
  value: number; total: number; color?: string; thick?: number
}) {
  const pct = total ? Math.min(100, (value / total) * 100) : 0
  return (
    <div style={{
      width: '100%', height: thick, borderRadius: 2,
      background: MANGA.panel,
      border: `1px solid ${MANGA.ink}`,
      overflow: 'hidden',
    }}>
      {pct > 0 && (
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${color} 0%, ${MANGA.gold} 100%)`,
          transition: 'width 0.3s',
        }} />
      )}
    </div>
  )
}

/** Status badge with hard border and offset shadow */
export function MStatusBadge({ status, size = 'sm' }: { status: MangaEstado; size?: 'sm' | 'md' }) {
  const s = MANGA_STATUS[status]
  const small = size === 'sm'
  return (
    <span style={{
      display: 'inline-block',
      padding: small ? '3px 9px' : '5px 12px',
      background: s.bg,
      border: `1.5px solid ${MANGA.ink}`,
      borderRadius: 999,
      boxShadow: hardShadow(small ? 1 : 2, small ? 1 : 2),
      color: s.text,
      fontSize: small ? 10 : 12,
      fontWeight: 700,
      letterSpacing: 0.6,
      textTransform: 'uppercase' as const,
      whiteSpace: 'nowrap' as const,
    }}>
      {s.label}
    </span>
  )
}

/** Type badge — rectangular, stamp style */
export function TypeBadge({ tipo, size = 'sm' }: { tipo: MangaTipo; size?: 'sm' | 'md' }) {
  const isManwha = tipo === 'manwha'
  return (
    <span style={{
      display: 'inline-block',
      padding: size === 'sm' ? '2px 7px' : '4px 10px',
      background: isManwha ? MANGA.paper : MANGA.sepia,
      border: `1.2px solid ${MANGA.ink}`,
      borderRadius: 0,
      color: isManwha ? MANGA.sepia : MANGA.paper,
      fontSize: size === 'sm' ? 9.5 : 11,
      fontWeight: 800,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
      whiteSpace: 'nowrap' as const,
    }}>
      {tipoLabel(tipo)}
    </span>
  )
}

/** Manga-paneled section title with optional kana label */
export function MSectionTitle({ children, kana }: { children: React.ReactNode; kana?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      paddingBottom: 6, marginBottom: 14,
      borderBottom: `2px solid ${MANGA.ink}`,
    }}>
      <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3, color: MANGA.ink }}>
        {children}
      </span>
      {kana && (
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: MANGA.terracotta, textTransform: 'uppercase' as const }}>
          {kana}
        </span>
      )}
    </div>
  )
}

/** Reusable bordered "panel" card style with hard shadow */
export function panelStyle(shadowDx = 4, shadowDy = 4): React.CSSProperties {
  return {
    background: MANGA.paper,
    border: `2px solid ${MANGA.ink}`,
    boxShadow: hardShadow(shadowDx, shadowDy),
  }
}
