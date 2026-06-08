import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, X } from 'lucide-react'
import { useBooksStore, selectFilteredBooks } from '@/stores/books.store'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import { FILTROS, LEIDO_FILTROS, FORMATO_FILTROS } from '@/utils/constants'
import type { Filtro, LeidoFiltro, FormatoFiltro, BookInput } from '@/types'
import AddBookModal from '@/components/AddBookModal'

export default function BibliotecaPage() {
  const c = useColors()
  const serif = useSerifFamily()
  const navigate = useNavigate()

  const seccion = useBooksStore((s) => s.seccion)
  const filtro = useBooksStore((s) => s.filtro)
  const leidoFiltro = useBooksStore((s) => s.leidoFiltro)
  const formatoFiltro = useBooksStore((s) => s.formatoFiltro)
  const busqueda = useBooksStore((s) => s.busqueda)
  const setSeccion = useBooksStore((s) => s.setSeccion)
  const setFiltro = useBooksStore((s) => s.setFiltro)
  const setLeidoFiltro = useBooksStore((s) => s.setLeidoFiltro)
  const setFormatoFiltro = useBooksStore((s) => s.setFormatoFiltro)
  const setBusqueda = useBooksStore((s) => s.setBusqueda)
  const toggleBook = useBooksStore((s) => s.toggleBook)
  const addBook = useBooksStore((s) => s.addBook)

  const rawBooks = useBooksStore((s) => s.books)
  const books = useMemo(
    () => selectFilteredBooks({ books: rawBooks, seccion, filtro, leidoFiltro, formatoFiltro, busqueda } as any),
    [rawBooks, seccion, filtro, leidoFiltro, formatoFiltro, busqueda]
  )
  const [showModal, setShowModal] = useState(false)

  const SECCIONES = [
    { key: 'novelas_eternas', label: 'Novelas Eternas' },
    { key: 'mi_biblioteca', label: 'Mi Biblioteca' },
  ] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header fijo */}
      <div style={{ padding: '28px 32px 0', background: c.paper, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, color: c.wineDeep }}>
            Colección
          </h1>
          <button onClick={() => setShowModal(true)} style={{
            background: c.wine, color: '#fff', borderRadius: 10, padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600,
          }}>
            <Plus size={16} /> Agregar
          </button>
        </div>

        {/* Secciones */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {SECCIONES.map((s) => (
            <button key={s.key} onClick={() => setSeccion(s.key as any)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13,
              background: seccion === s.key ? c.wine : c.paperCard,
              color: seccion === s.key ? '#fff' : c.inkSoft,
              border: `1px solid ${seccion === s.key ? c.wine : c.rule}`,
            }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.inkSoft }} />
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título o autor…"
            style={{
              width: '100%', padding: '9px 36px', borderRadius: 10, fontSize: 14,
              background: c.paperCard, border: `1px solid ${c.rule}`, color: c.ink,
              outline: 'none',
            }}
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: c.inkSoft }}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 12, borderBottom: `1px solid ${c.rule}` }}>
          {FILTROS.map((f) => (
            <button key={f.key} onClick={() => setFiltro(f.key as Filtro)} style={{
              padding: '4px 12px', borderRadius: 16, fontSize: 12,
              background: filtro === f.key ? c.wineDeep : c.paperCard,
              color: filtro === f.key ? '#fff' : c.inkSoft,
              border: `1px solid ${filtro === f.key ? c.wineDeep : c.rule}`,
            }}>{f.label}</button>
          ))}
          {LEIDO_FILTROS.map((f) => (
            <button key={f.key} onClick={() => setLeidoFiltro(f.key as LeidoFiltro)} style={{
              padding: '4px 12px', borderRadius: 16, fontSize: 12,
              background: leidoFiltro === f.key ? c.wine : c.paperCard,
              color: leidoFiltro === f.key ? '#fff' : c.inkSoft,
              border: `1px solid ${leidoFiltro === f.key ? c.wine : c.rule}`,
            }}>{f.label}</button>
          ))}
          {FORMATO_FILTROS.map((f) => (
            <button key={f.key} onClick={() => setFormatoFiltro(f.key as FormatoFiltro)} style={{
              padding: '4px 12px', borderRadius: 16, fontSize: 12,
              background: formatoFiltro === f.key ? c.rose : c.paperCard,
              color: formatoFiltro === f.key ? '#fff' : c.inkSoft,
              border: `1px solid ${formatoFiltro === f.key ? c.rose : c.rule}`,
            }}>{f.label}</button>
          ))}
        </div>

        <div style={{ padding: '8px 0', fontSize: 12, color: c.inkSoft }}>
          {books.length} libro{books.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 32px 32px' }}>
        {books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, fontSize: 18 }}>
            No hay libros en esta sección
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {books.map((book) => (
              <div key={book.id}
                style={{
                  background: c.paperCard, borderRadius: 12, padding: '12px 16px',
                  border: `1px solid ${c.rule}`, display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/libro/${book.id}`)}
              >
                <div style={{
                  width: 6, height: 40, borderRadius: 3, flexShrink: 0,
                  background: book.tengo ? c.wine : c.roseSoft,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: serif, fontSize: 16, color: c.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {book.titulo}
                  </div>
                  <div style={{ fontSize: 12, color: c.inkSoft, marginTop: 2 }}>{book.autor}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {book.leido && <span style={{ fontSize: 11, color: c.wine }}>✓ Leído</span>}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBook(book.id) }}
                    style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 11,
                      background: book.tengo ? c.wine : 'transparent',
                      color: book.tengo ? '#fff' : c.inkSoft,
                      border: `1px solid ${book.tengo ? c.wine : c.rule}`,
                    }}
                  >
                    {book.tengo ? 'Tengo' : 'Falta'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddBookModal
          coleccion={seccion === 'novelas_eternas' ? 'mi_biblioteca' : seccion}
          onClose={() => setShowModal(false)}
          onSave={async (input) => { await addBook(input); setShowModal(false) }}
        />
      )}
    </div>
  )
}
