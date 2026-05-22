import { Platform } from 'react-native';
import { AnimeEstado } from '@/types';

export const ANIME = {
  bg: '#0E0B1A',
  bg2: '#16122A',
  surface: '#1C1735',
  line: 'rgba(255,255,255,0.08)',
  text: '#F2EDFF',
  textSoft: 'rgba(242,237,255,0.55)',
  cyan: '#00E5FF',
  magenta: '#FF2E92',
  violet: '#8B5CFF',
  lime: '#B8FF3D',
};

export const ANIME_STATUS: Record<
  AnimeEstado,
  { label: string; glow: string; deep: string }
> = {
  viendo: { label: 'Viendo', glow: '#00E5FF', deep: '#0078A8' },
  completado: { label: 'Completado', glow: '#FF2E92', deep: '#9B0F5A' },
  pausado: { label: 'Pausado', glow: '#7C8499', deep: '#3A4055' },
  pendiente: { label: 'Pendiente', glow: '#8B5CFF', deep: '#4A2DB0' },
};

// Geometric sans for headings/body and mono for technical labels.
export const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
