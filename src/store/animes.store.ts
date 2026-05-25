import { create } from 'zustand';
import { Anime, AnimeInput, AnimeFiltro } from '@/types';
import * as queries from '@/db/animeQueries';
import { searchAnime, cacheCoverImage } from '@/services/jikan';

interface AnimesState {
  animes: Anime[];
  loaded: boolean;
  filtro: AnimeFiltro;
  busqueda: string;
  descargandoPortadas: boolean;
  setFiltro: (filtro: AnimeFiltro) => void;
  setBusqueda: (q: string) => void;
  loadAnimes: () => Promise<void>;
  addAnime: (input: AnimeInput) => Promise<Anime>;
  updateAnime: (id: string, patch: Partial<AnimeInput>) => Promise<void>;
  deleteAnime: (id: string) => Promise<void>;
  advanceEp: (id: string, delta?: number) => Promise<void>;
  setRating: (id: string, rating: number | null) => Promise<void>;
  fetchImageForAnime: (id: string) => Promise<boolean>;
  fetchMissingImages: () => Promise<{ done: number; total: number }>;
}

export const useAnimesStore = create<AnimesState>((set, get) => ({
  animes: [],
  loaded: false,
  filtro: 'todos',
  busqueda: '',
  descargandoPortadas: false,

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
    // Si se marca como completado, los episodios vistos suben al máximo
    if (patch.estado === 'completado') {
      const anime = get().animes.find((a) => a.id === id);
      if (anime && anime.eps > 0) {
        patch = { ...patch, vistos: anime.eps };
      }
    }
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

  setRating: async (id, rating) => {
    set((state) => ({
      animes: state.animes.map((a) => (a.id === id ? { ...a, rating } : a)),
    }));
    try {
      await queries.updateAnime(id, { rating } as never);
    } catch (e) {
      console.error('setRating failed', e);
      await get().loadAnimes();
    }
  },

  // Busca la portada en Jikan por título, la guarda localmente y actualiza el anime.
  // Devuelve true si encontró y guardó una imagen.
  fetchImageForAnime: async (id) => {
    const anime = get().animes.find((a) => a.id === id);
    if (!anime) return false;
    try {
      const results = await searchAnime(anime.titulo);
      const match = results.find((r) => r.imageUrl);
      if (!match?.imageUrl) return false;
      const localUri = await cacheCoverImage(match.imageUrl, id);
      if (!localUri) return false;
      await get().updateAnime(id, { imagen_url: localUri });
      return true;
    } catch {
      return false;
    }
  },

  // Recorre los animes sin portada y descarga las que pueda (best-effort, offline-safe).
  fetchMissingImages: async () => {
    const pendientes = get().animes.filter((a) => !a.imagen_url);
    set({ descargandoPortadas: true });
    let done = 0;
    try {
      for (const a of pendientes) {
        const ok = await get().fetchImageForAnime(a.id);
        if (ok) done++;
        // Respeta el límite de Jikan (~3 req/s)
        await new Promise((r) => setTimeout(r, 400));
      }
    } finally {
      set({ descargandoPortadas: false });
    }
    return { done, total: pendientes.length };
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
