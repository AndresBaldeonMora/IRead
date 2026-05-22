export const DATABASE_NAME = 'mi_biblioteca.db';
export const DATABASE_VERSION = 1;

export const STORAGE_KEYS = {
  THEME: 'mi-biblioteca.theme',
  SERIF: 'mi-biblioteca.serif',
  SEEDED: 'mi-biblioteca.seeded',
} as const;

export const FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'tengo', label: 'Tengo' },
  { key: 'faltan', label: 'Faltan' },
] as const;

export const LEIDO_FILTROS = [
  { key: 'todos', label: 'Cualquiera' },
  { key: 'leidos', label: 'Leídos' },
  { key: 'sin_leer', label: 'Sin leer' },
] as const;

export const FORMATO_FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'fisico', label: 'Físico' },
  { key: 'digital', label: 'Digital' },
] as const;

export const GENEROS = [
  'Clásico',
  'Romance',
  'Fantasía',
  'Ciencia Ficción',
  'Misterio',
  'Thriller',
  'Terror',
  'Aventura',
  'Histórico',
  'Contemporáneo',
  'Distopía',
  'Realismo Mágico',
  'Drama',
  'Humor',
  'Biografía',
  'Ensayo',
  'Poesía',
  'Juvenil',
] as const;

export type GeneroPredefinido = typeof GENEROS[number];
