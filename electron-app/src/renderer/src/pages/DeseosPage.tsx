import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X, Trash2, ArrowRight, Trash } from 'lucide-react'
import { useBooksStore } from '@/stores/books.store'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import AddBookModal from '@/components/AddBookModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import type { Coleccion } from '@/types'

const TABS: { key: Coleccion; label: string }[] = [
  { key: 'mi_biblioteca', label: 'Mi Biblioteca' },
  { key: 'deseos', label: 'Lista de Deseos' },
]

export default function DeseosPage() {
  const c = useColors()
  const serif = useSerifFamily()
  const navigate = useNavigate()

  const books = useBooksStore((s) => s.books)
  const addBook = useBooksStore((s) => s.addBook)
  const moveToLibrary = useBooksStore((s) => s.moveToLibrary)
  const deleteBook = useBooksStore((s) => s.deleteBook)
  const deleteAllByColeccion = useBooksStore((s) => s.deleteAllByColeccion)
  const toggleRead = useBooksStore((s) => s.toggleRead)

  const [tab, setTab] = useState<Coleccion>('mi_biblioteca')
  const [busqueda, setBusqueda] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [dialog, setDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  const countByTab = useMemo((): Record<string, number> => ({
    mi_biblioteca: books.filter((b) => b.coleccion === 'mi_biblioteca').length,
    deseos: books.filter((b) => b.coleccion === 'deseos').length,
  }), [books])

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return books
      .filter((b) => b.coleccion === tab)
      .filter((b) => !q || b.titulo.toLowerCase().includes(q) || b.autor.toLowerCase().includes(q))
  }, [books, tab, busqueda])

  const handleDelete = (e: React.MouseEvent, id: string, titulo: string) => {
    e.stopPropagation()
    setDialog({
      message: `¿Eliminar "${titulo}"?`,
      onConfirm: () => deleteBook(id),
    })
  }

  const handleDeleteAll = () => {
    const label = tab === 'mi_biblioteca' ? 'Mi Biblioteca' : 'Lista de Deseos'
    const n = countByTab[tab]
    setDialog({
      message: `¿Eliminar todos los ${n} libros de ${label}? Esta acción no se puede deshacer.`,
      onConfirm: () => deleteAllByColeccion(tab),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {dialog && (
        <ConfirmDialog
          message={dialog.message}
          confirmLabel="Eliminar"
          danger
          onConfirm={() => { dialog.onConfirm(); setDialog(null) }}
          onCancel={() => setDialog(null)}
        />
      )}

      {/* Header fijo */}
      <div style={{ padding: '28px 36px 0', background: c.paper, flexShrink: 0 }}>

        {/* Título + botón */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, color: c.wineDeep, margin: 0 }}>
            Personal
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {countByTab[tab] > 0 && (
              <button
                onClick={handleDeleteAll}
                title={`Eliminar toda la ${tab === 'mi_biblioteca' ? 'biblioteca' : 'lista de deseos'}`}
                style={{
                  background: 'transparent', color: c.inkSoft, borderRadius: 10, padding: '9px 14px',
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', border: `1px solid ${c.rule}`,
                }}
              >
                <Trash size={14} /> Eliminar lista
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: c.wine, color: '#fff', borderRadius: 10, padding: '9px 18px',
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={15} /> Agregar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: `2px solid ${c.rule}` }}>
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '8px 20px', fontSize: 14, fontFamily: serif,
                  color: active ? c.wineDeep : c.inkSoft,
                  fontWeight: active ? 600 : 400,
                  borderBottom: `2px solid ${active ? c.wine : 'transparent'}`,
                  marginBottom: -2, background: 'transparent', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
                <span style={{
                  marginLeft: 6, fontSize: 11,
                  background: active ? c.wine : c.rule,
                  color: active ? '#fff' : c.inkSoft,
                  borderRadius: 10, padding: '1px 7px',
                }}>
                  {countByTab[t.key]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Búsqueda */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.inkSoft }} />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título o autor…"
            style={{
              width: '100%', padding: '9px 36px', borderRadius: 10, fontSize: 14,
              background: c.paperCard, border: `1px solid ${c.rule}`, color: c.ink,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: c.inkSoft, cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ borderBottom: `1px solid ${c.rule}`, paddingBottom: 7, fontSize: 12, color: c.inkSoft }}>
          {lista.length} libro{lista.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 36px 32px' }}>
        {lista.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, fontSize: 17,
          }}>
            {busqueda
              ? `Sin resultados para "${busqueda}"`
              : tab === 'deseos'
                ? 'Tu lista de deseos está vacía'
                : 'No hay libros en tu biblioteca personal'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {lista.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/libro/${book.id}`)}
                style={{
                  background: c.paperCard, borderRadius: 12, padding: '11px 16px',
                  border: `1px solid ${c.rule}`, display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer',
                }}
              >
                {/* Número */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, width: 28 }}>
                  <div style={{
                    width: 4, height: 28, borderRadius: 2,
                    background: tab === 'deseos' ? c.roseSoft : (book.leido ? c.wine : c.wineLight),
                  }} />
                  <span style={{ fontSize: 10, color: c.inkSoft }}>#{book.numero}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: serif, fontSize: 15, color: c.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {book.titulo}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: c.inkSoft }}>{book.autor}</span>
                    {book.generos.slice(0, 2).map((g) => (
                      <span key={g} style={{
                        fontSize: 10, padding: '1px 7px', borderRadius: 8,
                        background: c.roseSoft, color: c.wineDeep,
                      }}>{g}</span>
                    ))}
                    {book.generos.length > 2 && (
                      <span style={{ fontSize: 10, color: c.inkSoft }}>+{book.generos.length - 2}</span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  {tab === 'mi_biblioteca' && (
                    <button
                      onClick={() => toggleRead(book.id)}
                      style={{
                        padding: '4px 11px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                        background: book.leido ? c.wine : 'transparent',
                        color: book.leido ? '#fff' : c.inkSoft,
                        border: `1px solid ${book.leido ? c.wine : c.rule}`,
                        fontWeight: book.leido ? 600 : 400,
                      }}
                    >
                      {book.leido ? '✓ Leído' : 'Sin leer'}
                    </button>
                  )}

                  {tab === 'deseos' && (
                    <button
                      onClick={() => moveToLibrary(book.id)}
                      style={{
                        padding: '4px 11px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: c.wine, color: '#fff',
                        border: `1px solid ${c.wine}`,
                      }}
                    >
                      <ArrowRight size={11} /> Mover
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDelete(e, book.id, book.titulo)}
                    style={{
                      padding: 6, borderRadius: 8, cursor: 'pointer',
                      color: c.inkSoft, background: 'transparent',
                      border: `1px solid transparent`,
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddBookModal
          onClose={() => setShowModal(false)}
          onSave={async (input) => { await addBook(input); setShowModal(false) }}
        />
      )}
    </div>
  )
}
