import { useState } from 'react'
import { X } from 'lucide-react'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import { GENEROS } from '@/utils/constants'
import type { BookInput, Coleccion, Formato } from '@/types'

interface Props {
  onClose: () => void
  onSave: (input: Omit<BookInput, 'numero'>) => Promise<void>
  initial?: Partial<BookInput>
  /** Colección forzada (para edición o colecciones especiales). Si no se pasa, se determina por tengo/formato. */
  coleccion?: Coleccion
}

const now = new Date()
const currentMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

const MESES_LABELS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

export default function AddBookModal({ onClose, onSave, initial, coleccion: coleccionForzada }: Props) {
  const c = useColors()
  const serif = useSerifFamily()
  const isEdit = !!initial?.id

  const [titulo, setTitulo] = useState(initial?.titulo ?? '')
  const [autor, setAutor] = useState(initial?.autor ?? '')
  const [editorial, setEditorial] = useState(initial?.editorial ?? '')
  const [edicion, setEdicion] = useState(initial?.edicion ?? '')
  const [idioma, setIdioma] = useState(initial?.idioma ?? '')
  const [generos, setGeneros] = useState<string[]>(initial?.generos ?? [])
  const [formato, setFormato] = useState<Formato>(initial?.formato ?? 'fisico')
  const [tengo, setTengo] = useState(initial?.tengo ?? false)
  const [leido, setLeido] = useState(initial?.leido ?? false)
  const [leidoEn, setLeidoEn] = useState(initial?.leido_en ?? currentMes)
  const [showMesPicker, setShowMesPicker] = useState(false)
  const [mesYear, setMesYear] = useState(now.getFullYear())
  const [notas, setNotas] = useState(initial?.notas ?? '')
  const [saving, setSaving] = useState(false)

  const toggleGenero = (g: string) =>
    setGeneros((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])

  const handleToggleLeido = () => {
    const next = !leido
    setLeido(next)
    if (next) setShowMesPicker(true)
  }

  const handleSelectMes = (m: number) => {
    const mesStr = `${mesYear}-${String(m + 1).padStart(2, '0')}`
    setLeidoEn(mesStr)
    setShowMesPicker(false)
  }

  const handleSave = async () => {
    if (!titulo.trim()) return
    setSaving(true)
    try {
      const coleccion = coleccionForzada
        ?? (isEdit ? (initial?.coleccion ?? 'deseos') : (formato !== 'digital' && tengo) ? 'mi_biblioteca' : 'deseos')
      await onSave({
        id: initial?.id,
        titulo: titulo.trim(),
        autor: autor.trim(),
        coleccion,
        formato,
        generos,
        tengo: formato !== 'digital' ? tengo : false,
        leido,
        leido_en: leido ? leidoEn : null,
        notas: notas || null,
        editorial: editorial || null,
        edicion: edicion || null,
        idioma: idioma || null,
        fecha_salida: initial?.fecha_salida ?? null,
        imagen_url: initial?.imagen_url ?? null,
      })
    } finally {
      setSaving(false)
    }
  }

  const [mesMonthIdx, mesMesYear] = leidoEn
    ? [parseInt(leidoEn.split('-')[1], 10) - 1, parseInt(leidoEn.split('-')[0], 10)]
    : [now.getMonth(), now.getFullYear()]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div style={{
        background: c.paperCard, borderRadius: 20, padding: 28, width: 520,
        maxHeight: '90vh', overflowY: 'auto', position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>

        {/* Mes picker overlay */}
        {showMesPicker && (
          <div style={{
            position: 'absolute', inset: 0, background: c.paperCard, borderRadius: 20,
            padding: 28, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: serif, fontSize: 18, color: c.wineDeep, margin: 0 }}>¿Cuándo lo terminaste?</h3>
              <button onClick={() => setShowMesPicker(false)}><X size={18} color={c.inkSoft} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => setMesYear((y) => y - 1)} style={{ fontSize: 18, color: c.wine, cursor: 'pointer', background: 'none', border: 'none', padding: '0 8px' }}>‹</button>
              <span style={{ fontFamily: serif, fontSize: 20, color: c.ink }}>{mesYear}</span>
              <button onClick={() => setMesYear((y) => y + 1)} style={{ fontSize: 18, color: c.wine, cursor: 'pointer', background: 'none', border: 'none', padding: '0 8px' }}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {MESES_LABELS.map((label, i) => {
                const mesStr = `${mesYear}-${String(i + 1).padStart(2, '0')}`
                const selected = mesStr === leidoEn
                return (
                  <button key={i} onClick={() => handleSelectMes(i)} style={{
                    padding: '10px 0', borderRadius: 10, fontSize: 13,
                    background: selected ? c.wine : c.paper,
                    color: selected ? '#fff' : c.ink,
                    border: `1px solid ${selected ? c.wine : c.rule}`,
                    fontWeight: selected ? 600 : 400, cursor: 'pointer',
                  }}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: serif, fontSize: 22, color: c.wineDeep, margin: 0 }}>
            {isEdit ? 'Editar libro' : 'Agregar libro'}
          </h2>
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

        <Field label="Editorial" c={c}>
          <input value={editorial} onChange={(e) => setEditorial(e.target.value)}
            style={inputStyle(c)} placeholder="Editorial (opcional)" />
        </Field>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle(c)}>Edición</label>
            <input value={edicion} onChange={(e) => setEdicion(e.target.value)}
              style={inputStyle(c)} placeholder="Ej: 1ª" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle(c)}>Idioma</label>
            <input value={idioma} onChange={(e) => setIdioma(e.target.value)}
              style={inputStyle(c)} placeholder="Ej: Español" />
          </div>
        </div>

        <Field label="Formato" c={c}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['fisico', 'digital'] as Formato[]).map((f) => (
              <button key={f} onClick={() => { setFormato(f); if (f === 'digital') setTengo(false) }} style={{
                flex: 1, padding: '8px', borderRadius: 10, fontSize: 13,
                background: formato === f ? c.wine : c.paper,
                color: formato === f ? '#fff' : c.inkSoft,
                border: `1px solid ${formato === f ? c.wine : c.rule}`,
                cursor: 'pointer',
              }}>
                {f === 'fisico' ? 'Físico' : 'Digital'}
              </button>
            ))}
          </div>
        </Field>

        {formato !== 'digital' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '12px 14px', background: c.paper, borderRadius: 10, border: `1px solid ${c.rule}` }}>
            <span style={{ fontSize: 14, color: c.ink }}>Lo tengo</span>
            <Toggle on={tengo} onToggle={() => setTengo((v) => !v)} c={c} />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '12px 14px', background: c.paper, borderRadius: 10, border: `1px solid ${c.rule}` }}>
          <div>
            <div style={{ fontSize: 14, color: c.ink }}>Ya lo leí</div>
            {leido && (
              <button onClick={() => setShowMesPicker(true)} style={{ marginTop: 3, fontSize: 12, color: c.wine, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                {MESES_LABELS[mesMonthIdx]} {mesMesYear} ›
              </button>
            )}
          </div>
          <Toggle on={leido} onToggle={handleToggleLeido} c={c} />
        </div>

        <Field label="Géneros" c={c}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {GENEROS.map((g) => (
              <button key={g} onClick={() => toggleGenero(g)} style={{
                padding: '4px 10px', borderRadius: 14, fontSize: 12,
                background: generos.includes(g) ? c.wine : c.paper,
                color: generos.includes(g) ? '#fff' : c.inkSoft,
                border: `1px solid ${generos.includes(g) ? c.wine : c.rule}`,
                cursor: 'pointer',
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
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar libro'}
        </button>
      </div>
    </div>
  )
}

function Toggle({ on, onToggle, c }: { on: boolean; onToggle: () => void; c: any }) {
  return (
    <button onClick={onToggle} style={{
      width: 42, height: 24, borderRadius: 12, cursor: 'pointer', border: 'none',
      background: on ? c.wine : c.rule, position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3, width: 18, height: 18,
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function Field({ label, c, children }: { label: string; c: any; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle(c)}>{label}</label>
      {children}
    </div>
  )
}

function labelStyle(c: any) {
  return { fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' as const, color: c.inkSoft, display: 'block', marginBottom: 6 }
}

function inputStyle(c: any) {
  return {
    width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14,
    background: c.paper, border: `1px solid ${c.rule}`, color: c.ink, outline: 'none',
    boxSizing: 'border-box' as const,
  }
}
