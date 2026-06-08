import { useState } from 'react'
import { X } from 'lucide-react'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import { GENEROS } from '@/utils/constants'
import type { BookInput, Coleccion, Formato } from '@/types'

interface Props {
  coleccion: Coleccion
  onClose: () => void
  onSave: (input: Omit<BookInput, 'numero'>) => Promise<void>
  initial?: Partial<BookInput>
}

export default function AddBookModal({ coleccion, onClose, onSave, initial }: Props) {
  const c = useColors()
  const serif = useSerifFamily()
  const [titulo, setTitulo] = useState(initial?.titulo ?? '')
  const [autor, setAutor] = useState(initial?.autor ?? '')
  const [generos, setGeneros] = useState<string[]>(initial?.generos ?? [])
  const [formato, setFormato] = useState<Formato>(initial?.formato ?? 'fisico')
  const [notas, setNotas] = useState(initial?.notas ?? '')
  const [saving, setSaving] = useState(false)

  const toggleGenero = (g: string) =>
    setGeneros((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])

  const handleSave = async () => {
    if (!titulo.trim()) return
    setSaving(true)
    try {
      await onSave({ titulo: titulo.trim(), autor: autor.trim(), coleccion, formato, generos, notas: notas || null, tengo: false, leido: false, leido_en: null, fecha_salida: null, imagen_url: null })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div style={{
        background: c.paperCard, borderRadius: 20, padding: 28, width: 500, maxHeight: '85vh',
        overflowY: 'auto', position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: serif, fontSize: 22, color: c.wineDeep }}>Agregar libro</h2>
          <button onClick={onClose}><X size={20} color={c.inkSoft} /></button>
        </div>

        <Field label="Título *" c={c}>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
            style={inputStyle(c)} placeholder="Título del libro" />
        </Field>

        <Field label="Autor" c={c}>
          <input value={autor} onChange={(e) => setAutor(e.target.value)}
            style={inputStyle(c)} placeholder="Nombre del autor" />
        </Field>

        <Field label="Formato" c={c}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['fisico', 'digital'] as Formato[]).map((f) => (
              <button key={f} onClick={() => setFormato(f)} style={{
                flex: 1, padding: '8px', borderRadius: 10, fontSize: 13,
                background: formato === f ? c.wine : c.paper,
                color: formato === f ? '#fff' : c.inkSoft,
                border: `1px solid ${formato === f ? c.wine : c.rule}`,
              }}>
                {f === 'fisico' ? 'Físico' : 'Digital'}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Géneros" c={c}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {GENEROS.map((g) => (
              <button key={g} onClick={() => toggleGenero(g)} style={{
                padding: '4px 10px', borderRadius: 14, fontSize: 12,
                background: generos.includes(g) ? c.wine : c.paper,
                color: generos.includes(g) ? '#fff' : c.inkSoft,
                border: `1px solid ${generos.includes(g) ? c.wine : c.rule}`,
              }}>{g}</button>
            ))}
          </div>
        </Field>

        <Field label="Notas" c={c}>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
            rows={3} style={{ ...inputStyle(c), resize: 'vertical' }} placeholder="Notas opcionales…" />
        </Field>

        <button onClick={handleSave} disabled={saving || !titulo.trim()} style={{
          width: '100%', padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 600,
          background: titulo.trim() ? c.wine : c.roseSoft, color: '#fff', marginTop: 8,
          cursor: titulo.trim() ? 'pointer' : 'not-allowed',
        }}>
          {saving ? 'Guardando…' : 'Guardar libro'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, c, children }: { label: string; c: any; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: c.inkSoft, display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function inputStyle(c: any) {
  return {
    width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14,
    background: c.paper, border: `1px solid ${c.rule}`, color: c.ink, outline: 'none',
  }
}
