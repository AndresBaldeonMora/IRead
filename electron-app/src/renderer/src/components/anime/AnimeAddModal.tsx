import { useState, useMemo, useEffect } from 'react'
import { X } from 'lucide-react'
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme'
import type { AnimeInput, AnimeEstado, AnimeTipo, AnimeSerie } from '@/types'
import { useAnimesStore } from '@/stores/animes.store'
import { searchAnime, type JikanResult } from '@/services/jikan'

interface Props {
  onClose: () => void
  onSave: (input: AnimeInput) => Promise<void>
}

const label = (text: string) => (
  <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase' as const, color: ANIME.textSoft, marginBottom: 6, marginTop: 12, fontFamily: MONO }}>
    {text}
  </div>
)

export default function AnimeAddModal({ onClose, onSave }: Props) {
  const animes = useAnimesStore((s) => s.animes)

  const [titulo, setTitulo] = useState('')
  const [sugerenciasOcultas, setSugerenciasOcultas] = useState(false)
  const [tipo, setTipo] = useState<AnimeTipo>('serie')
  const [temporada, setTemporada] = useState('1')
  const [eps, setEps] = useState('')
  const [vistos, setVistos] = useState('0')
  const [anio, setAnio] = useState(String(new Date().getFullYear()))
  const [serie, setSerie] = useState<AnimeSerie>('emision')
  const [estado, setEstado] = useState<AnimeEstado>('viendo')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)
  const [imagenUrl, setImagenUrl] = useState<string | null>(null)

  const [onlineResults, setOnlineResults] = useState<JikanResult[]>([])
  const [buscandoOnline, setBuscandoOnline] = useState(false)

  useEffect(() => {
    const q = titulo.trim()
    if (sugerenciasOcultas || q.length < 3) {
      setOnlineResults([])
      setBuscandoOnline(false)
      return
    }
    const controller = new AbortController()
    setBuscandoOnline(true)
    const t = setTimeout(async () => {
      try {
        const results = await searchAnime(q, controller.signal)
        setOnlineResults(results)
      } catch {
        setOnlineResults([])
      } finally {
        setBuscandoOnline(false)
      }
    }, 500)
    return () => { controller.abort(); clearTimeout(t) }
  }, [titulo, sugerenciasOcultas])

  const handleSelectOnline = (r: JikanResult) => {
    setTitulo(r.titulo)
    setTipo(r.tipo)
    if (r.eps > 0) setEps(String(r.eps))
    if (r.anio > 0) setAnio(String(r.anio))
    setImagenUrl(r.imageUrl)
    setSugerenciasOcultas(true)
    setOnlineResults([])
  }

  const sugerencias = useMemo(() => {
    if (sugerenciasOcultas) return []
    const q = titulo.trim().toLowerCase()
    if (q.length < 3) return []
    const seen = new Set<string>()
    return animes.filter((a) => {
      const t = a.titulo.toLowerCase()
      if (!t.includes(q)) return false
      if (seen.has(a.titulo)) return false
      seen.add(a.titulo)
      return true
    }).slice(0, 5)
  }, [titulo, animes, sugerenciasOcultas])

  const handleSelectSugerencia = (tituloSel: string) => {
    setTitulo(tituloSel)
    setSugerenciasOcultas(true)
    const temporadasExistentes = animes
      .filter((a) => a.titulo === tituloSel && a.tipo === 'serie')
      .map((a) => a.temporada)
    if (temporadasExistentes.length > 0) {
      const maxTemp = Math.max(...temporadasExistentes)
      setTemporada(String(maxTemp + 1))
      setTipo('serie')
    }
  }

  const accent = ANIME_STATUS[estado].glow
  const canSave = titulo.trim() && (tipo === 'pelicula' || parseInt(eps, 10) > 0)

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const totalEps = tipo === 'pelicula' ? 1 : parseInt(eps, 10)
      await onSave({
        titulo: titulo.trim(), tipo, estado, serie,
        temporada: parseInt(temporada, 10) || 1,
        eps: totalEps,
        vistos: Math.max(0, Math.min(parseInt(vistos || '0', 10), totalEps)),
        anio: parseInt(anio, 10) || new Date().getFullYear(),
        color: accent,
        notas: notas.trim() || null,
        rating: null,
        imagen_url: imagenUrl,
      })
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14,
    background: ANIME.bg, border: `1px solid ${ANIME.line}`, color: ANIME.text,
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={onClose}
    >
      <div
        style={{ background: ANIME.bg2, borderRadius: 20, padding: 28, width: 500, maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: ANIME.text, margin: 0 }}>Nuevo anime</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color={ANIME.textSoft} />
          </button>
        </div>

        {/* Título con Jikan autocomplete */}
        {label('Título')}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <input
              value={titulo}
              onChange={(e) => { setTitulo(e.target.value); setSugerenciasOcultas(false); setImagenUrl(null) }}
              placeholder="Escribe para buscar en MyAnimeList…"
              style={inputStyle}
            />
            {buscandoOnline && (
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, border: `2px solid ${ANIME.cyan}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            )}
          </div>

          {/* Resultados Jikan */}
          {onlineResults.length > 0 && (
            <div style={{ marginTop: 4, background: ANIME.surface, border: `1px solid ${ANIME.cyan}55`, borderRadius: 10, overflow: 'hidden' }}>
              {onlineResults.map((r, i) => (
                <div
                  key={r.malId}
                  onClick={() => handleSelectOnline(r)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 10px', cursor: 'pointer',
                    borderTop: i > 0 ? `0.5px solid ${ANIME.line}` : 'none',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = ANIME.surface)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {r.imageUrl ? (
                    <img src={r.imageUrl} style={{ width: 40, height: 56, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} alt="" />
                  ) : (
                    <div style={{ width: 40, height: 56, borderRadius: 6, background: ANIME.bg2, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ANIME.text, lineHeight: '18px' }}>{r.titulo}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 0.6, color: ANIME.textSoft, marginTop: 3, textTransform: 'uppercase' }}>
                      {r.tipo === 'pelicula' ? 'Película' : r.tipo === 'ova' ? 'OVA' : 'Serie'}
                      {r.anio > 0 ? ` · ${r.anio}` : ''}
                      {r.eps > 0 ? ` · ${r.eps} ep` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Preview portada seleccionada */}
          {imagenUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <img src={imagenUrl} style={{ width: 34, height: 48, borderRadius: 6, objectFit: 'cover' }} alt="" />
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 0.8, color: ANIME.cyan, textTransform: 'uppercase' }}>Portada seleccionada</span>
            </div>
          )}

          {/* Sugerencias locales */}
          {sugerencias.length > 0 && (
            <div style={{ marginTop: 4, background: ANIME.surface, border: `1px solid ${ANIME.cyan}55`, borderRadius: 10, overflow: 'hidden' }}>
              {sugerencias.map((a, i) => {
                const temporadasExistentes = animes.filter((x) => x.titulo === a.titulo && x.tipo === 'serie').map((x) => x.temporada)
                const nextTemp = temporadasExistentes.length > 0 ? Math.max(...temporadasExistentes) + 1 : null
                return (
                  <div
                    key={a.id}
                    onClick={() => handleSelectSugerencia(a.titulo)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 14px', cursor: 'pointer',
                      borderTop: i > 0 ? `0.5px solid ${ANIME.line}` : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ANIME.text }}>{a.titulo}</div>
                      {nextTemp !== null && (
                        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 0.8, color: ANIME.cyan, marginTop: 2 }}>
                          Serie · siguiente temporada: {nextTemp}
                        </div>
                      )}
                    </div>
                    <span style={{ color: ANIME.cyan, fontWeight: 700 }}>→</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tipo */}
        {label('Tipo')}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['serie', 'pelicula', 'ova'] as AnimeTipo[]).map((t) => {
            const active = tipo === t
            return (
              <button
                key={t}
                onClick={() => setTipo(t)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: active ? `${accent}1a` : 'transparent',
                  color: active ? accent : ANIME.textSoft,
                  border: `1px solid ${active ? accent : ANIME.line}`,
                }}
              >
                {t === 'pelicula' ? 'Película' : t === 'ova' ? 'OVA' : 'Serie'}
              </button>
            )
          })}
        </div>

        {/* Campos numéricos */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          {tipo === 'serie' && (
            <div style={{ flex: 1 }}>
              {label('Temporada')}
              <input value={temporada} onChange={(e) => setTemporada(e.target.value)} type="number" style={inputStyle} />
            </div>
          )}
          {tipo !== 'pelicula' && (
            <div style={{ flex: 1 }}>
              {label('Eps. totales')}
              <input value={eps} onChange={(e) => setEps(e.target.value)} type="number" style={inputStyle} />
            </div>
          )}
          {tipo !== 'pelicula' && (
            <div style={{ flex: 1 }}>
              {label('Eps. vistos')}
              <input value={vistos} onChange={(e) => setVistos(e.target.value)} type="number" style={inputStyle} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            {label('Año')}
            <input value={anio} onChange={(e) => setAnio(e.target.value)} type="number" style={inputStyle} />
          </div>
        </div>

        {/* Estado de la serie */}
        {label('Estado de la serie')}
        <div style={{ display: 'flex', gap: 8 }}>
          {([{ v: 'emision' as AnimeSerie, l: 'En emisión', c: ANIME.lime }, { v: 'finalizado' as AnimeSerie, l: 'Finalizada', c: '#EDE8D5' }]).map((o) => {
            const active = serie === o.v
            return (
              <button
                key={o.v}
                onClick={() => setSerie(o.v)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: active ? `${o.c}1a` : 'transparent',
                  color: active ? o.c : ANIME.textSoft,
                  border: `1px solid ${active ? o.c : ANIME.line}`,
                }}
              >
                {o.l}
              </button>
            )
          })}
        </div>

        {/* Tu estado de visualización */}
        {label('Tu estado de visualización')}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
          {(Object.keys(ANIME_STATUS) as AnimeEstado[]).map((k) => {
            const s = ANIME_STATUS[k]
            const active = estado === k
            return (
              <button
                key={k}
                onClick={() => setEstado(k)}
                style={{
                  width: 'calc(50% - 4px)', padding: '11px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: active ? `${s.glow}1f` : 'transparent',
                  color: active ? s.glow : ANIME.textSoft,
                  border: `1px solid ${active ? s.glow : ANIME.line}`,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.glow, flexShrink: 0 }} />
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Notas */}
        {label('Notas')}
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Notas opcionales…"
          style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
        />

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: 'transparent', color: ANIME.text, border: `0.5px solid ${ANIME.line}`,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            style={{
              flex: 2, padding: '13px 0', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: canSave && !saving ? 'pointer' : 'not-allowed',
              background: canSave && !saving ? accent : 'rgba(255,255,255,0.05)',
              color: canSave && !saving ? '#0E0B1A' : ANIME.textSoft,
              border: 'none',
            }}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  )
}
