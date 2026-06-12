import { useEffect, useRef, useState } from 'react'
import { ANIME } from '@/utils/animeTheme'
import { MANGA } from '@/utils/mangaTheme'
import bungouImg from '@/assets/Bungou.png'
import misaImg   from '@/assets/Misa.png'
import saikiImg  from '@/assets/Saiki.png'

export type SplashSection = 'books' | 'anime' | 'manga'

const IMAGES: Record<SplashSection, string> = {
  books: bungouImg,
  anime: misaImg,
  manga: saikiImg,
}

const LABELS: Record<SplashSection, string> = {
  books: 'Cargando libros',
  anime: 'Cargando animes',
  manga: 'Cargando mangas',
}

const FRASES = [
  'Te amo',
  'Hecho con amor para ti',
  'Para mi lectora favorita',
  'Eres mi historia favorita',
  'Cada página es para ti',
  'Disfruta tu lectura, mi amor',
  'Te amo más que a todos los libros',
  'Mi persona favorita del mundo',
]

const BG: Record<SplashSection, string> = {
  books: '#F1E6D1',
  anime: ANIME.bg,
  manga: `linear-gradient(180deg, ${MANGA.bgTop} 0%, ${MANGA.bgBottom} 100%)`,
}

const TEXT_COLOR: Record<SplashSection, string> = {
  books: '#7A3B4A',
  anime: '#FFFFFF',
  manga: MANGA.ink,
}

// ─── Timings (ms) — identical to mobile ──────────────────────────────────────
const NAV_AT  = 750   // navigate to destination
const OUT_AT  = 2550  // start fade-out
const HIDE_AT = 3000  // unmount

interface Props {
  section: SplashSection
  onNavigate: () => void
  onHide: () => void
}

export default function SectionSplash({ section, onNavigate, onHide }: Props) {
  const [bgOpacity,   setBgOpacity]   = useState(0)
  const [imgScale,    setImgScale]    = useState(0.5)
  const [imgOpacity,  setImgOpacity]  = useState(0)
  const [floatY,      setFloatY]      = useState(0)
  const [dots,        setDots]        = useState('')
  const [frase]       = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)])

  const floatRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const timers    = useRef<ReturnType<typeof setTimeout>[]>([])
  const floatDir  = useRef(1)   // 1 = going up, -1 = going down
  const floatVal  = useRef(0)

  const clearAll = () => {
    timers.current.forEach(clearTimeout)
    if (floatRef.current) clearInterval(floatRef.current)
  }

  useEffect(() => {
    // Dots animation
    const dotsId = setInterval(() => setDots((d) => d.length >= 3 ? '' : d + '.'), 350)

    // Entrance: fade in bg + spring scale + fade in img
    // Simulate spring with quick rAF steps
    let frame = 0
    const springId = setInterval(() => {
      frame++
      const t = Math.min(frame / 12, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setBgOpacity(eased)
      setImgOpacity(Math.min(t * 1.5, 1))
      // Overshoot spring for scale
      const spring = t < 0.7
        ? 1 + 0.18 * Math.sin(t * Math.PI / 0.7)
        : 1
      setImgScale(0.5 + eased * 0.5 * spring)
      if (t >= 1) {
        clearInterval(springId)
        // Start floating loop
        floatRef.current = setInterval(() => {
          floatVal.current += floatDir.current * 0.45
          if (floatVal.current <= -9) floatDir.current = 1
          if (floatVal.current >= 0)  floatDir.current = -1
          setFloatY(floatVal.current)
        }, 16)
      }
    }, 16)

    // Navigate
    timers.current.push(setTimeout(() => onNavigate(), NAV_AT))

    // Fade out
    timers.current.push(setTimeout(() => {
      if (floatRef.current) clearInterval(floatRef.current)
      let f2 = 0
      const outId = setInterval(() => {
        f2++
        const t = Math.min(f2 / 14, 1)
        setImgOpacity(1 - t)
        setImgScale(1 + t * 0.12)
        if (t >= 1) clearInterval(outId)
      }, 16)
      timers.current.push(outId as unknown as ReturnType<typeof setTimeout>)
      setTimeout(() => setBgOpacity(0), 60)
    }, OUT_AT))

    // Unmount
    timers.current.push(setTimeout(() => onHide(), HIDE_AT))

    return () => {
      clearAll()
      clearInterval(dotsId)
      clearInterval(springId)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: BG[section],
      opacity: bgOpacity,
      transition: 'opacity 0.15s',
      pointerEvents: 'none',
    }}>
      {/* Pixel art image + float */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transform: `scale(${imgScale}) translateY(${floatY}px)`,
        opacity: imgOpacity,
        imageRendering: 'pixelated',
      }}>
        <img
          src={IMAGES[section]}
          style={{ width: 220, height: 220, objectFit: 'contain', imageRendering: 'pixelated' }}
          draggable={false}
        />
        <div style={{
          marginTop: 20, fontSize: 15, fontWeight: 600, letterSpacing: 0.3,
          color: TEXT_COLOR[section], minWidth: 200, textAlign: 'center',
        }}>
          {LABELS[section]}{dots}
        </div>
      </div>

      {/* Love phrase at bottom */}
      <div style={{
        position: 'absolute', bottom: 56, left: 28, right: 28,
        textAlign: 'center', fontSize: 14, fontStyle: 'italic',
        color: TEXT_COLOR[section], opacity: imgOpacity,
      }}>
        {frase}
      </div>
    </div>
  )
}
