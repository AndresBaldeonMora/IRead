import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, X } from 'lucide-react'
import { useBooksStore, selectFilteredBooks, BooksFilterState } from '@/stores/books.store'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import { FILTROS, LEIDO_FILTROS, FORMATO_FILTROS } from '@/utils/constants'
import type { Filtro, LeidoFiltro, FormatoFiltro } from '@/types'
import AddBookModal from '@/components/AddBookModal'

const SECCIONES = [
  { key: 'novelas_eternas' as const, label: 'Novelas Eternas' },
  { key: 'mi_biblioteca' as const, label: 'Mi Biblioteca' },
]

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
    () => selectFilteredBooks({ books: rawBooks, seccion, filtro, leidoFiltro, formatoFiltro, busqueda } as BooksFilterState),
    [rawBooks, seccion, filtro, leidoFiltro, formatoFiltro, busqueda]
  )

  const countBySeccion = useMemo(() => ({
    novelas_eternas: rawBooks.filter((b) => b.coleccion === 'novelas_eternas').length,
    mi_biblioteca: rawBooks.filter((b) => b.coleccion === 'mi_biblioteca').length,
  }), [rawBooks])

  const [showModal, setShowModal] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header fijo */}
      <div style={{ padding: '28px 36px 0', background: c.paper, flexShrink: 0 }}>

        {/* Título + botón */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, color: c.wineDeep, margin: 0 }}>
            Colección
          </h1>
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

        {/* Tabs de sección */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: `2px solid ${c.rule}` }}>
          {SECCIONES.map((s) => {
            const active = seccion === s.key
            return (
              <button
                key={s.key}
                onClick={() => setSeccion(s.key)}
                style={{
                  padding: '8px 20px', fontSize: 14, fontFamily: serif,
                  color: active ? c.wineDeep : c.inkSoft,
                  fontWeight: active ? 600 : 400,
                  borderBottom: `2px solid ${active ? c.wine : 'transparent'}`,
                  marginBottom: -2, background: 'transparent', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {s.label}
                <span style={{
                  marginLeft: 6, fontSize: 11, background: active ? c.wine : c.rule,
                  color: active ? '#fff' : c.inkSoft, borderRadius: 10, padding: '1px 7px',
                }}>
                  {countBySeccion[s.key]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Búsqueda */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
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

        {/* Filtros en grupos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', paddingBottom: 10, borderBottom: `1px solid ${c.rule}` }}>
          {/* Grupo posesión */}
          {FILTROS.map((f) => (
            <button key={f.key} onClick={() => setFiltro(f.key as Filtro)} style={{
              padding: '4px 11px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
              background: filtro === f.key ? c.wineDeep : c.paperCard,
              color: filtro === f.key ? '#fff' : c.inkSoft,
              border: `1px solid ${filtro === f.key ? c.wineDeep : c.rule}`,
            }}>{f.label}</button>
          ))}

          <div style={{ width: 1, height: 18, background: c.rule, margin: '0 4px' }} />

          {/* Grupo lectura */}
          {LEIDO_FILTROS.map((f) => (
            <button key={f.key} onClick={() => setLeidoFiltro(f.key as LeidoFiltro)} style={{
              padding: '4px 11px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
              background: leidoFiltro === f.key ? c.wine : c.paperCard,
              color: leidoFiltro === f.key ? '#fff' : c.inkSoft,
              border: `1px solid ${leidoFiltro === f.key ? c.wine : c.rule}`,
            }}>{f.label}</button>
          ))}

          <div style={{ width: 1, height: 18, background: c.rule, margin: '0 4px' }} />

          {/* Grupo formato */}
          {FORMATO_FILTROS.map((f) => (
            <button key={f.key} onClick={() => setFormatoFiltro(f.key as FormatoFiltro)} style={{
              padding: '4px 11px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
              background: formatoFiltro === f.key ? c.rose : c.paperCard,
              color: formatoFiltro === f.key ? '#fff' : c.inkSoft,
              border: `1px solid ${formatoFiltro === f.key ? c.rose : c.rule}`,
            }}>{f.label}</button>
          ))}
        </div>

        <div style={{ padding: '7px 0', fontSize: 12, color: c.inkSoft }}>
          {books.length} libro{books.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 36px 32px' }}>
        {books.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            fontFamily: serif, fontStyle: 'italic', color: c.inkSoft, fontSize: 17,
          }}>
            {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay libros en esta sección'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/libro/${book.id}`)}
                style={{
                  background: c.paperCard, borderRadius: 12, padding: '11px 16px',
                  border: `1px solid ${c.rule}`, display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', transition: 'border-color 0.15s',
                }}
              >
                {/* Indicador de posesión + número */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, width: 28 }}>
                  <div style={{
                    width: 4, height: 28, borderRadius: 2,
                    background: book.tengo ? c.wine : c.roseSoft,
                  }} />
                  <span style={{ fontSize: 10, color: c.inkSoft, lineHeight: 1 }}>#{book.numero}</span>
                </div>

                {/* Título + autor + géneros */}
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

                {/* Estado + toggle tengo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {book.leido && (
                    <span style={{ fontSize: 11, color: c.wine, fontWeight: 600 }}>✓ Leído</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBook(book.id) }}
                    style={{
                      padding: '4px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                      background: book.tengo ? c.wine : 'transparent',
                      color: book.tengo ? '#fff' : c.inkSoft,
                      border: `1px solid ${book.tengo ? c.wine : c.rule}`,
                      fontWeight: book.tengo ? 600 : 400,
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
          coleccion={seccion}
          onClose={() => setShowModal(false)}
          onSave={async (input) => { await addBook(input); setShowModal(false) }}
        />
      )}
    </div>
  )
}
