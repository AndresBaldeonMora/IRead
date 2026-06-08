import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, BookOpen, Package } from 'lucide-react'
import { useBooksStore } from '@/stores/books.store'
import { useColors, useSerifFamily } from '@/stores/theme.store'

export default function LibroDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const c = useColors()
  const serif = useSerifFamily()
  const books = useBooksStore((s) => s.books)
  const toggleBook = useBooksStore((s) => s.toggleBook)
  const toggleRead = useBooksStore((s) => s.toggleRead)
  const deleteBook = useBooksStore((s) => s.deleteBook)

  const book = books.find((b) => b.id === id)
  if (!book) return (
    <div style={{ background: c.paper, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.inkSoft, fontFamily: serif, fontStyle: 'italic', fontSize: 18 }}>
      Libro no encontrado
    </div>
  )

  const backPath = book.coleccion === 'deseos' || book.coleccion === 'mi_biblioteca' ? '/deseos' : '/biblioteca'

  const handleDelete = async () => {
    if (confirm(`¿Eliminar "${book.titulo}"?`)) {
      await deleteBook(book.id)
      navigate(backPath)
    }
  }

  return (
    <div style={{ background: c.paper, color: c.ink, height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '24px 40px', maxWidth: 700 }}>
        <button onClick={() => navigate(backPath)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.inkSoft, marginBottom: 28, fontSize: 14 }}>
          <ArrowLeft size={18} /> Volver
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, marginBottom: 4 }}>
              #{book.numero} · {book.coleccion.replace('_', ' ')}
            </div>
            <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, color: c.wineDeep, lineHeight: 1.15 }}>{book.titulo}</h1>
            <p style={{ fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, marginTop: 6, fontSize: 16 }}>{book.autor}</p>
          </div>
          <button onClick={handleDelete} style={{ color: c.wineLight, padding: 8, marginLeft: 8 }}><Trash2 size={20} /></button>
        </div>

        {/* Géneros */}
        {book.generos.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {book.generos.map((g) => (
              <span key={g} style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 11,
                background: c.roseSoft, color: c.wineDeep,
              }}>{g}</span>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <button onClick={() => toggleBook(book.id)} style={{
            flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: book.tengo ? c.wine : c.paperCard,
            color: book.tengo ? '#fff' : c.inkSoft,
            border: `1px solid ${book.tengo ? c.wine : c.rule}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Package size={16} /> {book.tengo ? 'Tengo este libro' : 'Marcar como tengo'}
          </button>
          <button onClick={() => toggleRead(book.id)} style={{
            flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: book.leido ? c.wineDeep : c.paperCard,
            color: book.leido ? '#fff' : c.inkSoft,
            border: `1px solid ${book.leido ? c.wineDeep : c.rule}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <BookOpen size={16} /> {book.leido ? 'Leído' : 'Marcar como leído'}
          </button>
        </div>

        {/* Detalles */}
        <div style={{ background: c.paperCard, borderRadius: 16, padding: 20, border: `1px solid ${c.rule}` }}>
          {[
            ['Formato', book.formato ?? '—'],
            ['Fecha de salida', book.fecha_salida ?? '—'],
            ['Leído el', book.leido_en ?? '—'],
            ['Editorial', book.editorial ?? '—'],
            ['Edición', book.edicion ?? '—'],
            ['Idioma', book.idioma ?? '—'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${c.rule}` }}>
              <span style={{ fontSize: 12, letterSpacing: 0.5, color: c.inkSoft, textTransform: 'uppercase' }}>{label}</span>
              <span style={{ fontSize: 14, color: c.ink, fontFamily: serif }}>{val}</span>
            </div>
          ))}
        </div>

        {book.notas && (
          <div style={{ background: c.paperCard, borderRadius: 16, padding: 20, border: `1px solid ${c.rule}`, marginTop: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: c.inkSoft, marginBottom: 8 }}>Notas</div>
            <p style={{ fontFamily: serif, fontSize: 15, color: c.ink, lineHeight: 1.6 }}>{book.notas}</p>
          </div>
        )}
      </div>
    </div>
  )
}
