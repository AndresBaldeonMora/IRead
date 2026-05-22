import { create } from 'zustand';
import { PaletteKey, SerifKey } from '@/types';
import { PALETTES, SERIFS } from '@/utils/themes';
import * as queries from '@/db/queries';
import { STORAGE_KEYS } from '@/utils/constants';

interface ThemeState {
  palette: PaletteKey;
  serif: SerifKey;
  setPalette: (key: PaletteKey) => Promise<void>;
  setSerif: (key: SerifKey) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  palette: 'wine',
  serif: 'cormorant',

  loadTheme: async () => {
    try {
      const p = (await queries.getSetting(STORAGE_KEYS.THEME)) as PaletteKey | null;
      const s = (await queries.getSetting(STORAGE_KEYS.SERIF)) as SerifKey | null;
      set({
        palette: p && PALETTES[p] ? p : 'wine',
        serif: s && SERIFS[s] ? s : 'cormorant',
      });
    } catch (e) {
      console.error('loadTheme failed', e);
    }
  },

  setPalette: async (key) => {
    set({ palette: key });
    await queries.setSetting(STORAGE_KEYS.THEME, key);
  },

  setSerif: async (key) => {
    set({ serif: key });
    await queries.setSetting(STORAGE_KEYS.SERIF, key);
  },
}));

export function useColors() {
  const palette = useThemeStore((s) => s.palette);
  return PALETTES[palette];
}

export function useSerifFamily() {
  const serif = useThemeStore((s) => s.serif);
  return SERIFS[serif].family;
}
