import { Anime, AnimeEstado } from '@/types'
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme'

/** Gradient cover with corner notch and optional EP glyph */
export function AnimeCover({
  anime,
  w = 64,
  h = 88,
  glyph = true,
}: {
  anime: Pick<Anime, 'color' | 'vistos' | 'imagen_url'>
  w?: number
  h?: number
  glyph?: boolean
}) {
  const color = anime.color || ANIME.cyan

  return (
    <div style={{
      width: w, height: h, borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative',
      background: `linear-gradient(160deg, ${color} 0%, #1A0E2E 70%, #0B0717 100%)`,
      boxShadow: `0 6px 20px ${color}55`,
    }}>
      {anime.imagen_url && (
        <img src={anime.imagen_url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
      )}
      {/* Corner notch — top-right */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 0, height: 0,
        borderTop: `14px solid ${color}`,
        borderLeft: '14px solid transparent',
        opacity: 0.85,
      }} />
      {glyph && (
        <span style={{
          position: 'absolute', bottom: 8, left: 8,
          fontFamily: MONO, fontSize: w >= 100 ? 13 : 10, fontWeight: 600,
          color: 'rgba(255,255,255,0.92)', letterSpacing: 1,
        }}>
          EP {String(anime.vistos).padStart(2, '0')}
        </span>
      )}
    </div>
  )
}

/** Rounded progress bar with glow effect */
export function ProgressBar({
  value,
  total,
  color = ANIME.cyan,
  thick = 4,
}: {
  value: number; total: number; color?: string; thick?: number
}) {
  const pct = total ? Math.min(100, (value / total) * 100) : 0
  return (
    <div style={{
      width: '100%', height: thick, borderRadius: 99,
      background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
    }}>
      {pct > 0 && (
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 99,
          background: color,
          boxShadow: `0 0 6px ${color}`,
          transition: 'width 0.3s',
        }} />
      )}
    </div>
  )
}

/** Status chip with dot + glow border */
export function StatusChip({ status, size = 'sm' }: { status: AnimeEstado; size?: 'sm' | 'md' }) {
  const s = ANIME_STATUS[status]
  const small = size === 'sm'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: small ? '3px 9px' : '6px 12px',
      borderRadius: 99,
      background: `${s.glow}18`,
      border: `0.5px solid ${s.glow}55`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: small ? 5 : 6, height: small ? 5 : 6, borderRadius: '50%',
        background: s.glow, flexShrink: 0,
        boxShadow: `0 0 4px ${s.glow}`,
        display: 'inline-block',
      }} />
      <span style={{
        color: s.glow, fontSize: small ? 10.5 : 12.5,
        fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
      }}>
        {s.label}
      </span>
    </span>
  )
}
