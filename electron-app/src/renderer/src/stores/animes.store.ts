import { create } from 'zustand';
import { Anime, AnimeInput, AnimeFiltro } from '@/types';
import * as db from '@/db';

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
  setRating: (id: string, rating: number | null) => Promise<void>;
}

export const useAnimesStore = create<AnimesState>((set, get) => ({
  animes: [],
  loaded: false,
  filtro: 'todos',
  busqueda: '',

  setFiltro: (filtro) => set({ filtro }),
  setBusqueda: (busqueda) => set({ busqueda }),

  loadAnimes: async () => {
    const animes = await db.getAllAnimes();
    set({ animes, loaded: true });
  },

  addAnime: async (input) => {
    const anime = await db.insertAnime(input);
    set((s) => ({ animes: [...s.animes, anime] }));
    return anime;
  },

  updateAnime: async (id, patch) => {
    if (patch.estado === 'completado') {
      const anime = get().animes.find((a) => a.id === id);
      if (anime && anime.eps > 0) patch = { ...patch, vistos: anime.eps };
    }
    const updated = await db.updateAnime(id, patch);
    if (updated) set((s) => ({ animes: s.animes.map((a) => a.id === id ? updated : a) }));
  },

  deleteAnime: async (id) => {
    await db.deleteAnime(id);
    set((s) => ({ animes: s.animes.filter((a) => a.id !== id) }));
  },

  advanceEp: async (id, delta = 1) => {
    const anime = get().animes.find((a) => a.id === id);
    if (!anime) return;
    const vistos = Math.max(0, Math.min(anime.eps, anime.vistos + delta));
    let estado = anime.estado;
    if (vistos >= anime.eps && anime.serie === 'finalizado') estado = 'completado';
    else if (vistos > 0 && estado === 'pendiente') estado = 'viendo';
    set((s) => ({ animes: s.animes.map((a) => a.id === id ? { ...a, vistos, estado } : a) }));
    try {
      await db.updateAnime(id, { vistos, estado });
    } catch {
      await get().loadAnimes();
    }
  },

  setRating: async (id, rating) => {
    set((s) => ({ animes: s.animes.map((a) => a.id === id ? { ...a, rating } : a) }));
    try {
      await db.updateAnime(id, { rating } as never);
    } catch {
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
