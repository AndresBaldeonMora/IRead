import { create } from 'zustand';
import { Manga, MangaInput, MangaFiltro, MangaTipoFiltro } from '@/types';
import * as queries from '@/db/mangaQueries';

interface MangasState {
  mangas: Manga[];
  loaded: boolean;
  filtro: MangaFiltro;
  tipoFiltro: MangaTipoFiltro;
  busqueda: string;
  setFiltro: (filtro: MangaFiltro) => void;
  setTipoFiltro: (tipoFiltro: MangaTipoFiltro) => void;
  setBusqueda: (q: string) => void;
  loadMangas: () => Promise<void>;
  addManga: (input: MangaInput) => Promise<Manga>;
  updateManga: (id: string, patch: Partial<MangaInput>) => Promise<void>;
  deleteManga: (id: string) => Promise<void>;
  advanceManga: (id: string, delta?: number) => Promise<void>;
}

export const useMangasStore = create<MangasState>((set, get) => ({
  mangas: [],
  loaded: false,
  filtro: 'todos',
  tipoFiltro: 'todos',
  busqueda: '',

  setFiltro: (filtro) => set({ filtro }),
  setTipoFiltro: (tipoFiltro) => set({ tipoFiltro }),
  setBusqueda: (busqueda) => set({ busqueda }),

  loadMangas: async () => {
    const mangas = await queries.getAllMangas();
    set({ mangas, loaded: true });
  },

  addManga: async (input) => {
    const manga = await queries.insertManga(input);
    set((state) => ({ mangas: [...state.mangas, manga] }));
    return manga;
  },

  updateManga: async (id, patch) => {
    const updated = await queries.updateManga(id, patch);
    if (updated) {
      set((state) => ({
        mangas: state.mangas.map((m) => (m.id === id ? updated : m)),
      }));
    }
  },

  deleteManga: async (id) => {
    await queries.deleteManga(id);
    set((state) => ({ mangas: state.mangas.filter((m) => m.id !== id) }));
  },

  advanceManga: async (id, delta = 1) => {
    const manga = get().mangas.find((m) => m.id === id);
    if (!manga) return;

    const leidos = Math.max(0, Math.min(manga.total, manga.leidos + delta));
    let estado = manga.estado;
    if (leidos >= manga.total && manga.serie === 'finalizada') estado = 'completado';
    else if (leidos > 0 && estado === 'pendiente') estado = 'leyendo';

    set((state) => ({
      mangas: state.mangas.map((m) =>
        m.id === id ? { ...m, leidos, estado } : m
      ),
    }));

    try {
      await queries.updateManga(id, { leidos, estado });
    } catch (e) {
      console.error('advanceManga failed', e);
      await get().loadMangas();
    }
  },
}));

export function selectFilteredMangas(state: MangasState): Manga[] {
  const q = state.busqueda.trim().toLowerCase();
  return state.mangas.filter((m) => {
    if (state.filtro !== 'todos' && m.estado !== state.filtro) return false;
    if (state.tipoFiltro !== 'todos' && m.tipo !== state.tipoFiltro) return false;
    if (!q) return true;
    return (
      m.titulo.toLowerCase().includes(q) || m.autor.toLowerCase().includes(q)
    );
  });
}
