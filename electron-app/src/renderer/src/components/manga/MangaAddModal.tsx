import { useState } from 'react'
import { MANGA, MANGA_STATUS, hardShadow } from '@/utils/mangaTheme'
import type { MangaInput, MangaEstado, MangaTipo, MangaSerie } from '@/types'
import { useMangasStore } from '@/stores/mangas.store'

interface Props {
  onClose: () => void
  onSave: (input: MangaInput) => Promise<void>
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase' as const,
      color: MANGA.brown, marginBottom: 7, marginTop: 12, paddingLeft: 2,
    }}>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', flex }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; flex?: boolean
}) {
  return (
    <div style={flex ? { flex: 1 } : undefined}>
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        style={{
          width: '100%', padding: '11px 13px', fontSize: 14, fontWeight: 600,
          background: MANGA.paper, border: `1.5px solid ${MANGA.ink}`,
          color: MANGA.ink, outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

export default function MangaAddModal({ onClose, onSave }: Props) {
  const addManga = useMangasStore((s) => s.addManga)

  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [tipo, setTipo] = useState<MangaTipo>('manga')
  const [total, setTotal] = useState('')
  const [leidos, setLeidos] = useState('0')
  const [anio, setAnio] = useState(String(new Date().getFullYear()))
  const [serie, setSerie] = useState<MangaSerie>('serializacion')
  const [estado, setEstado] = useState<MangaEstado>('leyendo')
  const [saving, setSaving] = useState(false)

  // La unidad se determina automáticamente según el tipo, igual que en mobile
  const unidad = tipo === 'manwha' ? 'capitulo' : 'tomo'
  const accent = MANGA_STATUS[estado].bg
  const canSave = !!titulo.trim() && !!autor.trim() && parseInt(total, 10) > 0

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const totalNum = parseInt(total, 10)
      await onSave({
        titulo: titulo.trim(),
        autor: autor.trim(),
        tipo,
        unidad,
        total: totalNum,
        leidos: Math.max(0, Math.min(parseInt(leidos || '0', 10), totalNum)),
        anio: parseInt(anio, 10) || new Date().getFullYear(),
        serie,
        estado,
        color: accent,
        notas: null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,15,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={onClose}
    >
      <div
        style={{
          background: MANGA.paper, borderTop: `2px solid ${MANGA.ink}`,
          borderTopLeftRadius: 14, borderTopRightRadius: 14,
          padding: 22, paddingBottom: 34, width: 500,
          maxHeight: '88vh', overflowY: 'auto',
          position: 'relative', top: 'auto',
          borderRadius: 14, border: `2px solid ${MANGA.ink}`,
          boxShadow: hardShadow(5, 5),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + título */}
        <div style={{ width: 40, height: 4, background: MANGA.ink, margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4, color: MANGA.ink, margin: 0 }}>
            Nuevo {tipo === 'manwha' ? 'manwha' : 'manga'}
          </h2>
        </div>

        {/* Formato */}
        <Label>Formato</Label>
        <div style={{ display: 'flex', gap: 8 }}>
          {([{ v: 'manga' as MangaTipo, l: 'Manga', desc: 'Japón' }, { v: 'manwha' as MangaTipo, l: 'Manwha', desc: 'Corea' }]).map((o) => {
            const active = tipo === o.v
            return (
              <button
                key={o.v}
                onClick={() => setTipo(o.v)}
                style={{
                  flex: 1, padding: '11px 12px', border: `1.5px solid ${MANGA.ink}`,
                  background: active ? MANGA.ink : MANGA.paper,
                  boxShadow: active ? hardShadow(2, 2, MANGA.terracotta) : 'none',
                  cursor: 'pointer', textAlign: 'left' as const,
                }}
              >
                <div style={{ color: active ? MANGA.paper : MANGA.ink, fontWeight: 800, fontSize: 13 }}>{o.l}</div>
                <div style={{ color: active ? MANGA.paper : MANGA.ink, opacity: 0.7, fontWeight: 600, fontSize: 10, letterSpacing: 0.6, marginTop: 2 }}>{o.desc}</div>
              </button>
            )
          })}
        </div>

        {/* Título y autor */}
        <Field label="Título" value={titulo} onChange={setTitulo} placeholder="p. ej. Berserk" />
        <Field label="Autor / creador" value={autor} onChange={setAutor} placeholder="p. ej. Kentaro Miura" />

        {/* Campos numéricos */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label={tipo === 'manwha' ? 'Caps. totales' : 'Tomos totales'} value={total} onChange={setTotal} placeholder="12" type="number" flex />
          <Field label="Leídos" value={leidos} onChange={setLeidos} placeholder="0" type="number" flex />
          <Field label="Año" value={anio} onChange={setAnio} placeholder="2024" type="number" flex />
        </div>

        {/* Estado de la serie */}
        <Label>Estado de la serie</Label>
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            { v: 'serializacion' as MangaSerie, l: 'Activa' },
            { v: 'finalizada' as MangaSerie, l: 'Finalizada' },
            { v: 'pausa' as MangaSerie, l: 'En pausa' },
          ]).map((o) => {
            const active = serie === o.v
            return (
              <button
                key={o.v}
                onClick={() => setSerie(o.v)}
                style={{
                  flex: 1, padding: '10px 0', border: `1.5px solid ${MANGA.ink}`,
                  background: active ? MANGA.sepia : MANGA.paper,
                  color: active ? MANGA.paper : MANGA.ink,
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}
              >
                {o.l}
              </button>
            )
          })}
        </div>

        {/* Tu estado de lectura */}
        <Label>Tu estado de lectura</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
          {(Object.keys(MANGA_STATUS) as MangaEstado[]).map((k) => {
            const s = MANGA_STATUS[k]
            const active = estado === k
            return (
              <button
                key={k}
                onClick={() => setEstado(k)}
                style={{
                  width: 'calc(50% - 4px)', padding: '10px 12px', border: `1.5px solid ${MANGA.ink}`,
                  background: active ? s.bg : MANGA.paper,
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontWeight: 800, fontSize: 12, cursor: 'pointer',
                  color: active ? s.text : MANGA.ink,
                  boxShadow: active ? hardShadow(2, 2) : 'none',
                }}
              >
                <div style={{
                  width: 8, height: 8,
                  background: active ? s.text : s.bg,
                  border: `1px solid ${active ? s.text : MANGA.ink}`,
                  flexShrink: 0,
                }} />
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '14px 0', border: `1.5px solid ${MANGA.ink}`,
              background: 'transparent', color: MANGA.ink,
              fontWeight: 800, fontSize: 13, letterSpacing: 0.4,
              textTransform: 'uppercase' as const, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            style={{
              flex: 2, padding: '14px 0', border: `1.5px solid ${MANGA.ink}`,
              background: canSave && !saving ? MANGA.gold : MANGA.panel,
              color: canSave ? MANGA.ink : MANGA.brown,
              fontWeight: 800, fontSize: 13, letterSpacing: 0.4,
              textTransform: 'uppercase' as const,
              cursor: canSave && !saving ? 'pointer' : 'not-allowed',
              boxShadow: canSave && !saving ? hardShadow(3, 3) : 'none',
            }}
          >
            {saving ? 'Guardando…' : 'Guardar obra'}
          </button>
        </div>
      </div>
    </div>
  )
}
