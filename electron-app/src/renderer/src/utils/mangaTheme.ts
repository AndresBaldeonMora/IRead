import { MangaEstado, MangaTipo } from '@/types';

export const MANGA = {
  ink: '#1A0F0A',
  paper: '#FFF7EC',
  panel: '#E8D9C0',
  terracotta: '#B85042',
  gold: '#E8A82C',
  goldDeep: '#D4A02C',
  sepia: '#3A2614',
  brown: '#6B4830',
  bgTop: '#F4E4C8',
  bgBottom: '#EAD0A8',
};

export const MANGA_STATUS: Record<MangaEstado, { label: string; bg: string; text: string }> = {
  leyendo:    { label: 'Leyendo',    bg: '#B85042', text: '#FFF7EC' },
  completado: { label: 'Completado', bg: '#D4A02C', text: '#3A2614' },
  pausado:    { label: 'Pausado',    bg: '#8C7B6B', text: '#FFF7EC' },
  pendiente:  { label: 'Pendiente',  bg: '#A87B5D', text: '#FFF7EC' },
};

export function tipoLabel(tipo: MangaTipo): string {
  return tipo === 'manwha' ? 'Manwha' : 'Manga';
}

/** Hard-offset shadow with no blur — faithful manga panel aesthetic */
export function hardShadow(dx = 3, dy = 3, color = MANGA.ink): string {
  return `${dx}px ${dy}px 0 ${color}`;
}
