import { Palette, PaletteKey, SerifKey } from '@/types';

export const PALETTES: Record<PaletteKey, Palette> = {
  wine: {
    label: 'Vino & papel',
    paper: '#F1E6D1',
    paperCard: '#FBF3E2',
    rose: '#C99B9B',
    roseSoft: '#E8CFCB',
    wine: '#7A2E3A',
    wineLight: '#9C4555',
    wineDeep: '#4A1A26',
    ink: '#2D1810',
    inkSoft: '#7A5A48',
    gold: '#B68A4E',
    rule: 'rgba(74,26,38,0.10)',
  },
  rose: {
    label: 'Rosa pálido',
    paper: '#F6E6E1',
    paperCard: '#FCEFEB',
    rose: '#D4A8A0',
    roseSoft: '#EBD0CA',
    wine: '#A14B5C',
    wineLight: '#C56B7B',
    wineDeep: '#6B2A38',
    ink: '#3A1F1F',
    inkSoft: '#8A6968',
    gold: '#C49968',
    rule: 'rgba(107,42,56,0.10)',
  },
  midnight: {
    label: 'Tinta nocturna',
    paper: '#1F1A24',
    paperCard: '#2A232F',
    rose: '#8B5F6B',
    roseSoft: '#4A3640',
    wine: '#C99B9B',
    wineLight: '#D4B3B3',
    wineDeep: '#E8D0D0',
    ink: '#F5E8D8',
    inkSoft: '#A89488',
    gold: '#D4A968',
    rule: 'rgba(245,232,216,0.10)',
  },
};

export const SERIFS: Record<SerifKey, { label: string; family: string }> = {
  cormorant: { label: 'Cormorant', family: "'Cormorant Garamond', serif" },
  playfair: { label: 'Playfair', family: "'Playfair Display', serif" },
  eb: { label: 'EB Garamond', family: "'EB Garamond', serif" },
};
