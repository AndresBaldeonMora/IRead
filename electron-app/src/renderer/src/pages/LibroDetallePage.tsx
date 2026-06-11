import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, BookOpen, Check, Trash2, Save, Smartphone, Pencil } from 'lucide-react'
import { useBooksStore } from '@/stores/books.store'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import AddBookModal from '@/components/AddBookModal'
import ConfirmDialog from '@/components/ConfirmDialog'

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function formatMes(leidoEn: string): string {
  const [year, month] = leidoEn.split('-')
  const idx = parseInt(month, 10) - 1
  return `${MESES[idx] ?? month} ${year}`
}

const SPINE_PALETTES: [string, string][] = [
  ['#6B2737', '#8E3A4A'], ['#7A4B2A', '#9A6440'], ['#4D3B5C', '#6E5478'],
  ['#2F4B3C', '#4A6B58'], ['#8E5A2E', '#A87444'], ['#5C3A52', '#7A5470'],
  ['#34403D', '#52605C'], ['#7D3030', '#9C4848'], ['#3D4F6B', '#5A6E8A'],
  ['#84583D', '#A07252'],
]
const spineColors = (n: number): [string, string] => SPINE_PALETTES[n % SPINE_PALETTES.length]

export default function LibroDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const c            = useColors()
  const serif        = useSerifFamily()
  const books        = useBooksStore((s) => s.books)
  const toggleBook   = useBooksStore((s) => s.toggleBook)
  const toggleRead   = useBooksStore((s) => s.toggleRead)
  const updateBook   = useBooksStore((s) => s.updateBook)
  const deleteBook   = useBooksStore((s) => s.deleteBook)

  const book = books.find((b) => b.id === id)
  const [notas, setNotas] = useState(book?.notas ?? '')
  const [dirty, setDirty] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [dialog, setDialog] = useState<{
    message: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
    onConfirm: () => void
    onCancel?: () => void
  } | null>(null)

  useEffect(() => {
    setNotas(book?.notas ?? '')
    setDirty(false)
  }, [book?.id])

  if (!book) return (
    <div style={{ background: c.paper, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, fontSize: 18 }}>
      Libro no encontrado
    </div>
  )

  const [colorA, colorB] = spineColors(book.numero)
  const backPath = book.coleccion === 'deseos' || book.coleccion === 'mi_biblioteca' ? '/deseos' : '/biblioteca'
  const esNovelaEterna = book.coleccion === 'novelas_eternas'

  const handleSaveNotas = () => {
    updateBook(book.id, { notas: notas.trim() || null })
    setDirty(false)
  }

  const handleDelete = () => {
    setDialog({
      message: `¿Seguro que quieres eliminar "${book.titulo}"?`,
      confirmLabel: 'Eliminar',
      danger: true,
      onConfirm: () => { deleteBook(book.id); navigate(backPath) },
    })
  }

  const handleToggleRead = () => {
    if (book.leido) {
      toggleRead(book.id)
    } else {
      const ahora = new Date()
      const mesISO = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`
      setDialog({
        message: `¿Quieres guardar ${ahora.toLocaleString('es', { month: 'long', year: 'numeric' })} como el mes en que lo leíste?`,
        confirmLabel: 'Sí, guardar mes',
        cancelLabel: 'No, solo marcar',
        onConfirm: () => { toggleRead(book.id, mesISO); setDialog(null) },
        onCancel: () => { toggleRead(book.id, null); setDialog(null) },
      })
    }
  }

  return (
    <div style={{ background: c.paper, color: c.ink, height: '100%', overflowY: 'auto' }}>
      {dialog && (
        <ConfirmDialog
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          danger={dialog.danger}
          onConfirm={() => { dialog.onConfirm(); setDialog(null) }}
          onCancel={() => { dialog.onCancel?.(); setDialog(null) }}
        />
      )}

      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px' }}>
        <button onClick={() => navigate(backPath)} style={{ background: 'none', cursor: 'pointer', color: c.ink, display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={28} color={c.ink} />
        </button>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <button onClick={() => setEditVisible(true)} style={{ background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Pencil size={20} color={c.inkSoft} />
          </button>
          {!esNovelaEterna && (
            <button onClick={handleDelete} style={{ background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={20} color={c.inkSoft} />
            </button>
          )}
        </div>
      </div>

      {editVisible && (
        <AddBookModal
          coleccion={book.coleccion}
          onClose={() => setEditVisible(false)}
          onSave={async (input) => { await updateBook(book.id, input); setEditVisible(false) }}
          initial={{
            id: book.id, titulo: book.titulo, autor: book.autor,
            generos: book.generos, formato: book.formato ?? 'fisico',
            tengo: book.tengo, leido: book.leido, leido_en: book.leido_en,
            notas: book.notas ?? undefined,
            editorial: book.editorial ?? undefined, edicion: book.edicion ?? undefined, idioma: book.idioma ?? undefined,
            coleccion: book.coleccion,
          }}
        />
      )}

      <div style={{ paddingBottom: 40 }}>

        {/* Hero cover */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, marginBottom: 24 }}>
          <div style={{
            width: 140, height: 200, borderRadius: 12,
            background: book.formato === 'digital' ? c.roseSoft : book.tengo ? colorA : c.roseSoft,
            backgroundImage: book.formato !== 'digital' ? `linear-gradient(135deg, ${colorA}, ${colorB})` : undefined,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
            boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
            position: 'relative',
          }}>
            {book.formato === 'digital'
              ? <Smartphone size={48} color={c.wineDeep} />
              : <BookOpen size={56} color={book.tengo ? 'rgba(248,232,200,0.9)' : c.wineDeep} />
            }
            {book.coleccion === 'novelas_eternas' && (
              <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 13, fontWeight: 600, color: 'rgba(248,232,200,0.9)' }}>
                N° {book.numero}
              </span>
            )}
          </div>
        </div>

        {/* Title block */}
        <div style={{ paddingLeft: 30, paddingRight: 30, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {esNovelaEterna && (
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, marginBottom: 4 }}>
              · Novelas Eternas ·
            </div>
          )}
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, marginBottom: 8 }}>
            {book.formato === 'digital' ? '· edición digital ·' : book.tengo ? '· en tu biblioteca ·' : '· en tu lista de deseos ·'}
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 30, fontWeight: 500, color: c.wineDeep, textAlign: 'center', lineHeight: '36px', margin: '0 0 8px' }}>
            {book.titulo}
          </h1>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 18, color: c.inkSoft, margin: 0 }}>
            por {book.autor}
          </p>
        </div>

        {/* Genre badges */}
        {(book.generos.length > 0 || book.formato) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '16px 30px', justifyContent: 'center' }}>
            {book.formato && (
              <span style={{
                padding: '4px 10px', borderRadius: 10, fontSize: 12,
                background: c.wine + '18', border: `0.5px solid ${c.wine}44`, color: c.wine,
              }}>
                {book.formato === 'fisico' ? '📖 Físico' : '📱 Digital'}
              </span>
            )}
            {book.generos.map((g) => (
              <span key={g} style={{
                padding: '4px 10px', borderRadius: 10, fontSize: 12,
                background: c.paperCard, border: `0.5px solid ${c.rule}`, color: c.inkSoft,
              }}>
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Toggle tengo */}
        {book.formato !== 'digital' && (
          <button
            onClick={() => toggleBook(book.id)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              margin: '26px 30px 0',
              padding: 16, borderRadius: 16, borderWidth: 1.5, width: 'calc(100% - 60px)',
              background: book.tengo ? c.wine : c.paperCard,
              color: book.tengo ? '#fff' : c.wineDeep,
              border: `1.5px solid ${book.tengo ? c.wine : c.rose}`,
              cursor: 'pointer', fontSize: 18, fontFamily: serif,
            }}
          >
            {book.tengo && <Check size={22} color="#fff" strokeWidth={3} />}
            {book.tengo ? 'Ya lo tengo' : 'Aún no lo tengo'}
          </button>
        )}

        {/* Toggle leído */}
        <button
          onClick={handleToggleRead}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            margin: '10px 30px 0',
            padding: 16, borderRadius: 16, width: 'calc(100% - 60px)',
            background: book.leido ? c.gold : c.paperCard,
            color: book.leido ? '#fff' : c.inkSoft,
            border: `1.5px solid ${book.leido ? c.gold : c.rule}`,
            cursor: 'pointer', fontSize: 18, fontFamily: serif,
          }}
        >
          {book.leido && <Check size={22} color="#fff" strokeWidth={3} />}
          {book.leido
            ? `Ya lo leí${book.leido_en ? ` · ${formatMes(book.leido_en)}` : ''}`
            : 'Marcar como leído'}
        </button>

        {/* Notas */}
        <div style={{ padding: '32px 22px 0' }}>
          <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: c.inkSoft, marginBottom: 8 }}>
            Mis notas
          </div>
          <textarea
            value={notas}
            onChange={(e) => {
              setNotas(e.target.value)
              setDirty(e.target.value !== (book.notas ?? ''))
            }}
            placeholder="Pensamientos, citas, dónde lo compré…"
            rows={6}
            style={{
              width: '100%', padding: 16, borderRadius: 14,
              border: `0.5px solid ${c.rule}`,
              background: c.paperCard, color: c.ink,
              fontSize: 15, lineHeight: '22px',
              outline: 'none', resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          {dirty && (
            <button
              onClick={handleSaveNotas}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', marginTop: 12, padding: 14, borderRadius: 12,
                background: c.wine, color: '#fff',
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Save size={18} color="#fff" />
              Guardar notas
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
