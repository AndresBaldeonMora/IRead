import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Heart } from 'lucide-react'
import { useBooksStore } from '@/stores/books.store'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import AddBookModal from '@/components/AddBookModal'

export default function DeseosPage() {
  const c = useColors()
  const serif = useSerifFamily()
  const navigate = useNavigate()
  const books = useBooksStore((s) => s.books)
  const addBook = useBooksStore((s) => s.addBook)
  const moveToLibrary = useBooksStore((s) => s.moveToLibrary)
  const deleteBook = useBooksStore((s) => s.deleteBook)
  const [showModal, setShowModal] = useState(false)
  const [tab, setTab] = useState<'mi_biblioteca' | 'deseos'>('mi_biblioteca')

  const lista = books.filter((b) => b.coleccion === tab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, color: c.wineDeep }}>Personal</h1>
          <button onClick={() => setShowModal(true)} style={{
            background: c.wine, color: '#fff', borderRadius: 10, padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600,
          }}>
            <Plus size={16} /> Agregar
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {([['mi_biblioteca', 'Mi Biblioteca'], ['deseos', 'Lista de Deseos']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13,
              background: tab === key ? c.wine : c.paperCard,
              color: tab === key ? '#fff' : c.inkSoft,
              border: `1px solid ${tab === key ? c.wine : c.rule}`,
            }}>{label}</button>
          ))}
        </div>
        <div style={{ borderBottom: `1px solid ${c.rule}`, paddingBottom: 8, fontSize: 12, color: c.inkSoft }}>
          {lista.length} libro{lista.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 32px 32px' }}>
        {lista.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, fontSize: 18 }}>
            {tab === 'deseos' ? 'Tu lista de deseos está vacía' : 'No hay libros en tu biblioteca personal'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lista.map((book) => (
              <div key={book.id} style={{
                background: c.paperCard, borderRadius: 12, padding: '12px 16px',
                border: `1px solid ${c.rule}`, display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer',
              }} onClick={() => navigate(`/libro/${book.id}`)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: serif, fontSize: 15, color: c.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.titulo}</div>
                  <div style={{ fontSize: 12, color: c.inkSoft, marginTop: 2 }}>{book.autor}</div>
                </div>
                {tab === 'deseos' && (
                  <button onClick={(e) => { e.stopPropagation(); moveToLibrary(book.id) }} style={{
                    padding: '4px 10px', borderRadius: 8, fontSize: 11,
                    background: c.wine, color: '#fff',
                  }}>
                    Mover a biblioteca
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddBookModal
          coleccion={tab}
          onClose={() => setShowModal(false)}
          onSave={async (input) => { await addBook(input); setShowModal(false) }}
        />
      )}
    </div>
  )
}
