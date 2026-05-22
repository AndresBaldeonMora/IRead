import { create } from 'zustand';
import { Anime, AnimeInput, AnimeFiltro } from '@/types';
import * as queries from '@/db/animeQueries';

interface AnimesState {
  animes: Anime[];
  loaded: boolean;
  filtro: AnimeFiltro;
  busqueda: string;
  setFiltro: (filtro: AnimeFiltro) => void;
  setBusqueda: (q: string) => void;
  loadAnimes: () => Promise<void>;
  addAnime: (input: AnimeInput) => Promise<Anime>;
  updateAnime: (id: string, patch: Partial<AnimeInput>) => Promise<void>;
  deleteAnime: (id: string) => Promise<void>;
  advanceEp: (id: string, delta?: number) => Promise<void>;
}

export const useAnimesStore = create<AnimesState>((set, get) => ({
  animes: [],
  loaded: false,
  filtro: 'todos',
  busqueda: '',

  setFiltro: (filtro) => set({ filtro }),
  setBusqueda: (busqueda) => set({ busqueda }),

  loadAnimes: async () => {
    const animes = await queries.getAllAnimes();
    set({ animes, loaded: true });
  },

  addAnime: async (input) => {
    const anime = await queries.insertAnime(input);
    set((state) => ({ animes: [...state.animes, anime] }));
    return anime;
  },

  updateAnime: async (id, patch) => {
    const updated = await queries.updateAnime(id, patch);
    if (updated) {
      set((state) => ({
        animes: state.animes.map((a) => (a.id === id ? updated : a)),
      }));
    }
  },

  deleteAnime: async (id) => {
    await queries.deleteAnime(id);
    set((state) => ({ animes: state.animes.filter((a) => a.id !== id) }));
  },

  advanceEp: async (id, delta = 1) => {
    const anime = get().animes.find((a) => a.id === id);
    if (!anime) return;

    const vistos = Math.max(0, Math.min(anime.eps, anime.vistos + delta));
    let estado = anime.estado;
    if (vistos >= anime.eps && anime.serie === 'finalizado') estado = 'completado';
    else if (vistos > 0 && estado === 'pendiente') estado = 'viendo';

    set((state) => ({
      animes: state.animes.map((a) =>
        a.id === id ? { ...a, vistos, estado } : a
      ),
    }));

    try {
      await queries.updateAnime(id, { vistos, estado });
    } catch (e) {
      console.error('advanceEp failed', e);
      await get().loadAnimes();
    }
  },
}));

export function selectFilteredAnimes(state: AnimesState): Anime[] {
  const q = state.busqueda.trim().toLowerCase();
  return state.animes.filter((a) => {
    if (state.filtro !== 'todos' && a.estado !== state.filtro) return false;
    if (!q) return true;
    return a.titulo.toLowerCase().includes(q);
  });
}
