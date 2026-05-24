import { Platform } from 'react-native';
import { AnimeEstado } from '@/types';

export const ANIME = {
  bg: '#0C0B09',                       // negro cálido profundo
  bg2: '#141210',                       // fondo de sheets y modales
  surface: '#1E1B17',                   // superficie de tarjetas
  line: 'rgba(237,218,180,0.07)',        // divisores color pergamino tenue
  text: '#EDE8D5',                      // texto pergamino
  textSoft: 'rgba(237,232,213,0.45)',   // texto secundario
  cyan: '#C41E1E',                      // acento principal → rojo sangre
  magenta: '#C9A84C',                   // acento secundario → oro envejecido
  violet: '#7A4A2A',                    // terciario → marrón cuero
  lime: '#8B2A2A',                      // "en emisión" → carmesí oscuro
};

export const ANIME_STATUS: Record<
  AnimeEstado,
  { label: string; glow: string; deep: string }
> = {
  viendo:    { label: 'Viendo',     glow: '#C41E1E', deep: '#7A0000' },  // rojo sangre
  completado:{ label: 'Completado', glow: '#C9A84C', deep: '#7A5E1A' },  // oro
  pausado:   { label: 'Pausado',    glow: '#6E6560', deep: '#3A3330' },  // gris cálido
  pendiente: { label: 'Pendiente',  glow: '#8B7355', deep: '#4A3A25' },  // pergamino oscuro
};

// Geometric sans for headings/body and mono for technical labels.
export const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
