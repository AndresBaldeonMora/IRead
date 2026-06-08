import { useState } from 'react'
import { X } from 'lucide-react'
import { ANIME, ANIME_STATUS } from '@/utils/animeTheme'
import type { AnimeInput, AnimeEstado, AnimeTipo, AnimeSerie } from '@/types'

interface Props {
  onClose: () => void
  onSave: (input: AnimeInput) => Promise<void>
}

export default function AnimeAddModal({ onClose, onSave }: Props) {
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<AnimeTipo>('serie')
  const [estado, setEstado] = useState<AnimeEstado>('pendiente')
  const [serie, setSerie] = useState<AnimeSerie>('emision')
  const [eps, setEps] = useState('')
  const [anio, setAnio] = useState(String(new Date().getFullYear()))
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)

  const colors = {
    bg: ANIME.bg2, surface: ANIME.surface, text: ANIME.text,
    textSoft: ANIME.textSoft, line: ANIME.line, cyan: ANIME.cyan,
  }

  const handleSave = async () => {
    if (!titulo.trim()) return
    setSaving(true)
    try {
      await onSave({
        titulo: titulo.trim(), tipo, estado, serie,
        eps: parseInt(eps) || 0, vistos: 0,
        temporada: 1, anio: parseInt(anio) || new Date().getFullYear(),
        color: ANIME.cyan, notas: notas || null, rating: null, imagen_url: null,
      })
    } finally { setSaving(false) }
  }

  const input = (value: string, onChange: (v: string) => void, placeholder: string) => (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14,
        background: ANIME.bg, border: `1px solid ${ANIME.line}`, color: ANIME.text, outline: 'none',
      }} />
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: ANIME.bg2, borderRadius: 20, padding: 28, width: 480, maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: ANIME.text }}>Agregar anime</h2>
          <button onClick={onClose}><X size={20} color={ANIME.textSoft} /></button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: ANIME.textSoft, display: 'block', marginBottom: 6 }}>Título *</label>
          {input(titulo, setTitulo, 'Nombre del anime')}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: ANIME.textSoft, display: 'block', marginBottom: 6 }}>Tipo</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['serie', 'pelicula', 'ova'] as AnimeTipo[]).map((t) => (
              <button key={t} onClick={() => setTipo(t)} style={{
                flex: 1, padding: '7px', borderRadius: 9, fontSize: 12,
                background: tipo === t ? ANIME.cyan : ANIME.surface,
                color: tipo === t ? '#fff' : ANIME.textSoft,
                border: `1px solid ${tipo === t ? ANIME.cyan : ANIME.line}`,
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: ANIME.textSoft, display: 'block', marginBottom: 6 }}>Estado</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['pendiente', 'viendo', 'completado', 'pausado'] as AnimeEstado[]).map((e) => (
              <button key={e} onClick={() => setEstado(e)} style={{
                padding: '5px 12px', borderRadius: 16, fontSize: 12,
                background: estado === e ? ANIME_STATUS[e].glow : ANIME.surface,
                color: estado === e ? '#fff' : ANIME.textSoft,
                border: `1px solid ${estado === e ? ANIME_STATUS[e].glow : ANIME.line}`,
              }}>{ANIME_STATUS[e].label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: ANIME.textSoft, display: 'block', marginBottom: 6 }}>Episodios</label>
            {input(eps, setEps, '0')}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: ANIME.textSoft, display: 'block', marginBottom: 6 }}>Año</label>
            {input(anio, setAnio, '2024')}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: ANIME.textSoft, display: 'block', marginBottom: 6 }}>Notas</label>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14, background: ANIME.bg, border: `1px solid ${ANIME.line}`, color: ANIME.text, outline: 'none', resize: 'vertical' }}
            placeholder="Notas opcionales…" />
        </div>

        <button onClick={handleSave} disabled={saving || !titulo.trim()} style={{
          width: '100%', padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 600,
          background: titulo.trim() ? ANIME.cyan : ANIME.surface, color: '#fff',
          cursor: titulo.trim() ? 'pointer' : 'not-allowed',
        }}>
          {saving ? 'Guardando…' : 'Guardar anime'}
        </button>
      </div>
    </div>
  )
}
