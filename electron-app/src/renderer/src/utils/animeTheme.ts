import { AnimeEstado } from '@/types';

export const ANIME = {
  bg: '#0C0B09',
  bg2: '#141210',
  surface: '#1E1B17',
  line: 'rgba(237,218,180,0.07)',
  text: '#EDE8D5',
  textSoft: 'rgba(237,232,213,0.45)',
  cyan: '#C41E1E',
  magenta: '#C9A84C',
  violet: '#7A4A2A',
  lime: '#8B2A2A',
};

export const ANIME_STATUS: Record<AnimeEstado, { label: string; glow: string; deep: string }> = {
  viendo:     { label: 'Viendo',     glow: '#C41E1E', deep: '#7A0000' },
  completado: { label: 'Completado', glow: '#C9A84C', deep: '#7A5E1A' },
  pausado:    { label: 'Pausado',    glow: '#6E6560', deep: '#3A3330' },
  pendiente:  { label: 'Pendiente',  glow: '#8B7355', deep: '#4A3A25' },
};

export const MONO = 'monospace';
