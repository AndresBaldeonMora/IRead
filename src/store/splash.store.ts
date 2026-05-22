import { create } from 'zustand';

export type SplashSection = 'books' | 'anime' | 'manga';

interface SplashState {
  visible: boolean;
  section: SplashSection;
  navigate: (() => void) | null;
  trigger: (section: SplashSection, navigate: () => void) => void;
  hide: () => void;
}

export const useSplashStore = create<SplashState>((set) => ({
  visible: false,
  section: 'books',
  navigate: null,
  trigger: (section, navigate) => set({ visible: true, section, navigate }),
  hide: () => set({ visible: false, navigate: null }),
}));
