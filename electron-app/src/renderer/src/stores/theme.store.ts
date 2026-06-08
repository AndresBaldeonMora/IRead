import { create } from 'zustand';
import { PaletteKey, SerifKey } from '@/types';
import { PALETTES, SERIFS } from '@/utils/themes';
import { getSetting, setSetting } from '@/db';

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
      const p = (await getSetting('theme')) as PaletteKey | null;
      const s = (await getSetting('serif')) as SerifKey | null;
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
    await setSetting('theme', key);
  },

  setSerif: async (key) => {
    set({ serif: key });
    await setSetting('serif', key);
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
