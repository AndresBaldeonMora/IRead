import { useState } from 'react'
import { X } from 'lucide-react'
import { MANGA, MANGA_STATUS } from '@/utils/mangaTheme'
import type { MangaInput, MangaEstado, MangaTipo, MangaUnidad, MangaSerie } from '@/types'

interface Props {
  onClose: () => void
  onSave: (input: MangaInput) => Promise<void>
}

export default function MangaAddModal({ onClose, onSave }: Props) {
  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [tipo, setTipo] = useState<MangaTipo>('manga')
  const [unidad, setUnidad] = useState<MangaUnidad>('tomo')
  const [estado, setEstado] = useState<MangaEstado>('pendiente')
  const [serie, setSerie] = useState<MangaSerie>('serializacion')
  const [total, setTotal] = useState('')
  const [anio, setAnio] = useState(String(new Date().getFullYear()))
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!titulo.trim()) return
    setSaving(true)
    try {
      await onSave({
        titulo: titulo.trim(), autor: autor.trim(), tipo, unidad, estado, serie,
        total: parseInt(total) || 0, leidos: 0,
        anio: parseInt(anio) || new Date().getFullYear(),
        color: MANGA.terracotta, notas: notas || null,
      })
    } finally { setSaving(false) }
  }

  const inp = (val: string, set: (v: string) => void, ph: string) => (
    <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
      style={{ width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14, background: MANGA.paper, border: `1px solid ${MANGA.sepia}30`, color: MANGA.ink, outline: 'none' }} />
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: MANGA.panel, borderRadius: 20, padding: 28, width: 480, maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: MANGA.sepia }}>Agregar manga</h2>
          <button onClick={onClose}><X size={20} color={MANGA.brown} /></button>
        </div>

        {[['Título *', titulo, setTitulo, 'Nombre del manga'], ['Autor', autor, setAutor, 'Nombre del autor']].map(([label, val, set, ph]) => (
          <div key={label as string} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: MANGA.brown, display: 'block', marginBottom: 6 }}>{label as string}</label>
            {inp(val as string, set as any, ph as string)}
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: MANGA.brown, display: 'block', marginBottom: 6 }}>Tipo</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['manga', 'manwha'] as MangaTipo[]).map((t) => (
              <button key={t} onClick={() => setTipo(t)} style={{
                flex: 1, padding: '7px', borderRadius: 9, fontSize: 12,
                background: tipo === t ? MANGA.terracotta : MANGA.paper,
                color: tipo === t ? '#fff' : MANGA.brown,
                border: `1px solid ${tipo === t ? MANGA.terracotta : MANGA.sepia + '30'}`,
              }}>{t === 'manga' ? 'Manga' : 'Manwha'}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: MANGA.brown, display: 'block', marginBottom: 6 }}>Estado</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['pendiente', 'leyendo', 'completado', 'pausado'] as MangaEstado[]).map((e) => (
              <button key={e} onClick={() => setEstado(e)} style={{
                padding: '5px 12px', borderRadius: 16, fontSize: 12,
                background: estado === e ? MANGA_STATUS[e].bg : MANGA.paper,
                color: estado === e ? MANGA_STATUS[e].text : MANGA.brown,
                border: `1px solid ${estado === e ? MANGA_STATUS[e].bg : MANGA.sepia + '30'}`,
              }}>{MANGA_STATUS[e].label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: MANGA.brown, display: 'block', marginBottom: 6 }}>Unidad</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['tomo', 'capitulo'] as MangaUnidad[]).map((u) => (
              <button key={u} onClick={() => setUnidad(u)} style={{
                flex: 1, padding: '7px', borderRadius: 9, fontSize: 12,
                background: unidad === u ? MANGA.gold : MANGA.paper,
                color: unidad === u ? MANGA.sepia : MANGA.brown,
                border: `1px solid ${unidad === u ? MANGA.gold : MANGA.sepia + '30'}`,
              }}>{u === 'tomo' ? 'Tomos' : 'Capítulos'}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: MANGA.brown, display: 'block', marginBottom: 6 }}>Total</label>
            {inp(total, setTotal, '0')}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: MANGA.brown, display: 'block', marginBottom: 6 }}>Año</label>
            {inp(anio, setAnio, '2024')}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: MANGA.brown, display: 'block', marginBottom: 6 }}>Notas</label>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14, background: MANGA.paper, border: `1px solid ${MANGA.sepia}30`, color: MANGA.ink, outline: 'none', resize: 'vertical' }} />
        </div>

        <button onClick={handleSave} disabled={saving || !titulo.trim()} style={{
          width: '100%', padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 600,
          background: titulo.trim() ? MANGA.terracotta : MANGA.panel, color: '#fff',
          cursor: titulo.trim() ? 'pointer' : 'not-allowed',
        }}>
          {saving ? 'Guardando…' : 'Guardar manga'}
        </button>
      </div>
    </div>
  )
}
