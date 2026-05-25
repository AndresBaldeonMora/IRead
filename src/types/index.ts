export type Coleccion = 'novelas_eternas' | 'mi_biblioteca' | 'deseos';

export type SeccionFiltro = Coleccion;

export type LeidoFiltro = 'todos' | 'leidos' | 'sin_leer';

export type Formato = 'fisico' | 'digital';

export type FormatoFiltro = 'todos' | 'fisico' | 'digital';

export interface Book {
  id: string;
  numero: number;
  titulo: string;
  autor: string;
  fecha_salida: string | null;
  tengo: boolean;
  leido: boolean;
  leido_en: string | null;
  coleccion: Coleccion;
  formato: Formato | null;
  generos: string[];
  agregado_en: string;
  actualizado_en: string;
  notas: string | null;
  imagen_url: string | null;
  editorial: string | null;
  edicion: string | null;
  idioma: string | null;
}

export type BookInput = Omit<Book, 'id' | 'agregado_en' | 'actualizado_en'> & {
  id?: string;
};

export type Filtro = 'todos' | 'tengo' | 'faltan';

export type PaletteKey = 'wine' | 'rose' | 'midnight';

export type SerifKey = 'cormorant' | 'playfair' | 'eb';

export interface Palette {
  label: string;
  paper: string;
  paperCard: string;
  rose: string;
  roseSoft: string;
  wine: string;
  wineLight: string;
  wineDeep: string;
  ink: string;
  inkSoft: string;
  gold: string;
  rule: string;
  statusBarStyle: 'light' | 'dark';
}

export interface Stats {
  total: number;
  tengo: number;
  faltan: number;
  porcentaje: number;
  autoresUnicos: number;
}

export type AnimeEstado = 'viendo' | 'completado' | 'pausado' | 'pendiente';

export type AnimeSerie = 'emision' | 'finalizado';

export type AnimeTipo = 'serie' | 'pelicula' | 'ova';

export type AnimeFiltro = 'todos' | AnimeEstado;

export interface Anime {
  id: string;
  titulo: string;
  tipo: AnimeTipo;
  temporada: number;
  eps: number;
  vistos: number;
  serie: AnimeSerie;
  estado: AnimeEstado;
  anio: number;
  color: string;
  notas: string | null;
  rating: number | null;
  imagen_url: string | null;
  agregado_en: string;
  actualizado_en: string;
}

export type AnimeInput = Omit<Anime, 'id' | 'agregado_en' | 'actualizado_en'> & {
  id?: string;
};

export type MangaEstado = 'leyendo' | 'completado' | 'pausado' | 'pendiente';

export type MangaTipo = 'manga' | 'manwha';

export type MangaUnidad = 'tomo' | 'capitulo';

export type MangaSerie = 'serializacion' | 'finalizada' | 'pausa';

export type MangaTipoFiltro = 'todos' | MangaTipo;

export type MangaFiltro = 'todos' | MangaEstado;

export interface Manga {
  id: string;
  titulo: string;
  autor: string;
  tipo: MangaTipo;
  unidad: MangaUnidad;
  total: number;
  leidos: number;
  serie: MangaSerie;
  estado: MangaEstado;
  anio: number;
  color: string;
  notas: string | null;
  agregado_en: string;
  actualizado_en: string;
}

export type MangaInput = Omit<Manga, 'id' | 'agregado_en' | 'actualizado_en'> & {
  id?: string;
};
