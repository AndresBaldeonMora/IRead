import { create } from 'zustand';
import { Book, BookInput, Filtro, FormatoFiltro, LeidoFiltro, SeccionFiltro } from '@/types';
import * as queries from '@/db/queries';

interface BooksState {
  books: Book[];
  loaded: boolean;
  seccion: SeccionFiltro;
  filtro: Filtro;
  leidoFiltro: LeidoFiltro;
  formatoFiltro: FormatoFiltro;
  busqueda: string;
  setSeccion: (seccion: SeccionFiltro) => void;
  setFiltro: (filtro: Filtro) => void;
  setLeidoFiltro: (filtro: LeidoFiltro) => void;
  setFormatoFiltro: (filtro: FormatoFiltro) => void;
  setBusqueda: (q: string) => void;
  loadBooks: () => Promise<void>;
  toggleBook: (id: string) => Promise<void>;
  toggleRead: (id: string, leidoEn?: string | null) => Promise<void>;
  addBook: (input: Omit<BookInput, 'numero'>) => Promise<Book>;
  updateBook: (id: string, patch: Partial<BookInput>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  moveToLibrary: (id: string) => Promise<void>;
}

export const useBooksStore = create<BooksState>((set, get) => ({
  books: [],
  loaded: false,
  seccion: 'novelas_eternas',
  filtro: 'todos',
  leidoFiltro: 'todos',
  formatoFiltro: 'todos',
  busqueda: '',

  setSeccion: (seccion) => set({ seccion }),
  setFiltro: (filtro) => set({ filtro }),
  setLeidoFiltro: (leidoFiltro) => set({ leidoFiltro }),
  setFormatoFiltro: (formatoFiltro) => set({ formatoFiltro }),
  setBusqueda: (busqueda) => set({ busqueda }),

  loadBooks: async () => {
    const books = await queries.getAllBooks();
    set({ books, loaded: true });
  },

  toggleBook: async (id) => {
    set((state) => ({
      books: state.books.map((b) =>
        b.id === id ? { ...b, tengo: !b.tengo } : b
      ),
    }));
    try {
      await queries.toggleBookOwned(id);
    } catch (e) {
      console.error('toggleBook failed', e);
      set((state) => ({
        books: state.books.map((b) =>
          b.id === id ? { ...b, tengo: !b.tengo } : b
        ),
      }));
    }
  },

  toggleRead: async (id, leidoEn) => {
    const book = get().books.find((b) => b.id === id);
    if (!book) return;
    const newLeido = !book.leido;
    const newLeidoEn = newLeido ? (leidoEn ?? null) : null;

    set((state) => ({
      books: state.books.map((b) =>
        b.id === id ? { ...b, leido: newLeido, leido_en: newLeidoEn } : b
      ),
    }));
    try {
      await queries.toggleBookRead(id, leidoEn);
    } catch (e) {
      console.error('toggleRead failed', e);
      set((state) => ({
        books: state.books.map((b) =>
          b.id === id ? { ...b, leido: book.leido, leido_en: book.leido_en } : b
        ),
      }));
    }
  },

  addBook: async (input) => {
    const numero = await queries.getNextNumero(input.coleccion ?? 'mi_biblioteca');
    const book = await queries.insertBook({ ...input, numero });
    set((state) => ({ books: [...state.books, book] }));
    return book;
  },

  updateBook: async (id, patch) => {
    const updated = await queries.updateBook(id, patch);
    if (updated) {
      set((state) => ({
        books: state.books.map((b) => (b.id === id ? updated : b)),
      }));
    }
  },

  deleteBook: async (id) => {
    await queries.deleteBook(id);
    set((state) => ({ books: state.books.filter((b) => b.id !== id) }));
  },

  moveToLibrary: async (id) => {
    // Optimista: mueve el libro de deseos → mi_biblioteca con tengo=true
    set((state) => ({
      books: state.books.map((b) =>
        b.id === id ? { ...b, coleccion: 'mi_biblioteca', tengo: true } : b
      ),
    }));
    try {
      await queries.updateBook(id, { coleccion: 'mi_biblioteca', tengo: true } as any);
    } catch (e) {
      console.error('moveToLibrary failed', e);
      set((state) => ({
        books: state.books.map((b) =>
          b.id === id ? { ...b, coleccion: 'deseos', tengo: false } : b
        ),
      }));
    }
  },
}));

export function selectFilteredBooks(state: BooksState): Book[] {
  const q = state.busqueda.trim().toLowerCase();
  return state.books
    .filter((b) => {
      if (b.coleccion !== state.seccion) return false;
      if (state.filtro === 'tengo' && (!b.tengo || b.formato === 'digital')) return false;
      if (state.filtro === 'faltan' && (b.tengo || b.formato === 'digital')) return false;
      if (state.leidoFiltro === 'leidos' && !b.leido) return false;
      if (state.leidoFiltro === 'sin_leer' && b.leido) return false;
      if (state.formatoFiltro === 'fisico' && b.formato !== 'fisico') return false;
      if (state.formatoFiltro === 'digital' && b.formato !== 'digital') return false;
      if (!q) return true;
      return (
        b.titulo.toLowerCase().includes(q) ||
        b.autor.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.numero - b.numero);
}
