import { v4 as uuidv4 } from 'uuid';
import {
  Book, BookInput, Coleccion, Formato,
  Anime, AnimeInput,
  Manga, MangaInput,
} from '@/types';

declare global {
  interface Window {
    electronAPI: {
      db: {
        run: (sql: string, params?: unknown[]) => Promise<{ changes: number; lastInsertRowid: number }>;
        get: (sql: string, params?: unknown[]) => Promise<unknown>;
        all: (sql: string, params?: unknown[]) => Promise<unknown[]>;
      };
    };
  }
}

const db = window.electronAPI.db;

function generateId() { return uuidv4(); }

// ─── Books ────────────────────────────────────────────────────────────────────

interface BookRow {
  id: string; numero: number; titulo: string; autor: string;
  fecha_salida: string | null; tengo: number; leido: number; leido_en: string | null;
  coleccion: string; formato: string | null; generos: string;
  agregado_en: string; actualizado_en: string; notas: string | null;
  imagen_url: string | null; editorial: string | null; edicion: string | null; idioma: string | null;
}

function rowToBook(row: BookRow): Book {
  return {
    id: row.id, numero: row.numero, titulo: row.titulo, autor: row.autor,
    fecha_salida: row.fecha_salida, tengo: row.tengo === 1, leido: row.leido === 1,
    leido_en: row.leido_en ?? null, coleccion: (row.coleccion as Coleccion) || 'novelas_eternas',
    formato: (row.formato as Formato | null) ?? null,
    generos: row.generos ? row.generos.split(',').filter(Boolean) : [],
    agregado_en: row.agregado_en, actualizado_en: row.actualizado_en,
    notas: row.notas, imagen_url: row.imagen_url,
    editorial: row.editorial ?? null, edicion: row.edicion ?? null, idioma: row.idioma ?? null,
  };
}

export async function getAllBooks(): Promise<Book[]> {
  const rows = await db.all('SELECT * FROM books ORDER BY numero ASC') as BookRow[];
  return rows.map(rowToBook);
}

export async function getBookById(id: string): Promise<Book | null> {
  const row = await db.get('SELECT * FROM books WHERE id = ?', [id]) as BookRow | null;
  return row ? rowToBook(row) : null;
}

export async function getNextNumero(coleccion: string = 'novelas_eternas'): Promise<number> {
  if (coleccion === 'novelas_eternas') {
    const r = await db.get("SELECT MAX(numero) as max FROM books WHERE coleccion = 'novelas_eternas'") as { max: number | null };
    return (r?.max ?? 0) + 1;
  }
  if (coleccion === 'mi_biblioteca') {
    const r = await db.get("SELECT MAX(numero) as max FROM books WHERE coleccion = 'mi_biblioteca'") as { max: number | null };
    const cur = r?.max ?? 10000;
    return cur < 10000 ? 10001 : cur + 1;
  }
  const r = await db.get("SELECT MAX(numero) as max FROM books WHERE coleccion = 'deseos'") as { max: number | null };
  const cur = r?.max ?? 20000;
  return cur < 20000 ? 20001 : cur + 1;
}

export async function insertBook(input: BookInput): Promise<Book> {
  const now = new Date().toISOString();
  const id = input.id ?? generateId();
  await db.run(
    `INSERT INTO books (id,numero,titulo,autor,fecha_salida,tengo,leido,leido_en,coleccion,formato,generos,agregado_en,actualizado_en,notas,imagen_url,editorial,edicion,idioma)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, input.numero, input.titulo, input.autor, input.fecha_salida ?? null,
     input.tengo ? 1 : 0, input.leido ? 1 : 0, input.leido_en ?? null,
     input.coleccion ?? 'mi_biblioteca', input.formato ?? null,
     Array.isArray(input.generos) ? input.generos.join(',') : '',
     now, now, input.notas ?? null, input.imagen_url ?? null,
     (input as any).editorial ?? null, (input as any).edicion ?? null, (input as any).idioma ?? null]
  );
  return (await getBookById(id))!;
}

export async function toggleBookOwned(id: string): Promise<Book | null> {
  const now = new Date().toISOString();
  await db.run(`UPDATE books SET tengo = CASE WHEN tengo=1 THEN 0 ELSE 1 END, actualizado_en=? WHERE id=?`, [now, id]);
  return getBookById(id);
}

export async function toggleBookRead(id: string, leidoEn?: string | null): Promise<Book | null> {
  const current = await getBookById(id);
  if (!current) return null;
  const now = new Date().toISOString();
  const newLeido = !current.leido;
  await db.run(`UPDATE books SET leido=?, leido_en=?, actualizado_en=? WHERE id=?`,
    [newLeido ? 1 : 0, newLeido ? (leidoEn ?? null) : null, now, id]);
  return getBookById(id);
}

export async function updateBook(id: string, patch: Partial<BookInput>): Promise<Book | null> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: unknown[] = [];
  const map: Record<string, unknown> = {
    titulo: patch.titulo, autor: patch.autor, fecha_salida: patch.fecha_salida,
    tengo: patch.tengo !== undefined ? (patch.tengo ? 1 : 0) : undefined,
    leido: patch.leido !== undefined ? (patch.leido ? 1 : 0) : undefined,
    leido_en: patch.leido_en, coleccion: patch.coleccion, formato: patch.formato,
    generos: patch.generos !== undefined ? (Array.isArray(patch.generos) ? patch.generos.join(',') : '') : undefined,
    notas: patch.notas, imagen_url: patch.imagen_url,
    editorial: (patch as any).editorial, edicion: (patch as any).edicion, idioma: (patch as any).idioma,
  };
  for (const [col, val] of Object.entries(map)) {
    if (val !== undefined) { fields.push(`${col}=?`); values.push(val); }
  }
  if (fields.length === 0) return getBookById(id);
  fields.push('actualizado_en=?'); values.push(now); values.push(id);
  await db.run(`UPDATE books SET ${fields.join(',')} WHERE id=?`, values);
  return getBookById(id);
}

export async function deleteBook(id: string): Promise<void> {
  await db.run('DELETE FROM books WHERE id=?', [id]);
}

// ─── Anime ────────────────────────────────────────────────────────────────────

interface AnimeRow {
  id: string; titulo: string; tipo: string; temporada: number; eps: number;
  vistos: number; serie: string; estado: string; anio: number; color: string;
  notas: string | null; rating: number | null; imagen_url: string | null;
  agregado_en: string; actualizado_en: string;
}

function rowToAnime(row: AnimeRow): Anime {
  return {
    id: row.id, titulo: row.titulo, tipo: (row.tipo ?? 'serie') as Anime['tipo'],
    temporada: row.temporada ?? 1, eps: row.eps, vistos: row.vistos,
    serie: row.serie as Anime['serie'], estado: row.estado as Anime['estado'],
    anio: row.anio, color: row.color, notas: row.notas, rating: row.rating ?? null,
    imagen_url: row.imagen_url ?? null, agregado_en: row.agregado_en, actualizado_en: row.actualizado_en,
  };
}

export async function getAllAnimes(): Promise<Anime[]> {
  const rows = await db.all('SELECT * FROM animes ORDER BY titulo ASC') as AnimeRow[];
  return rows.map(rowToAnime);
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  const row = await db.get('SELECT * FROM animes WHERE id=?', [id]) as AnimeRow | null;
  return row ? rowToAnime(row) : null;
}

export async function insertAnime(input: AnimeInput): Promise<Anime> {
  const now = new Date().toISOString();
  const id = input.id ?? generateId();
  await db.run(
    `INSERT INTO animes (id,titulo,estudio,tipo,temporada,eps,vistos,serie,estado,anio,color,notas,imagen_url,agregado_en,actualizado_en)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, input.titulo, '', input.tipo, input.temporada, input.eps, input.vistos,
     input.serie, input.estado, input.anio, input.color, input.notas ?? null,
     input.imagen_url ?? null, now, now]
  );
  return (await getAnimeById(id))!;
}

export async function updateAnime(id: string, patch: Partial<AnimeInput>): Promise<Anime | null> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: unknown[] = [];
  const cols = ['titulo','tipo','temporada','eps','vistos','serie','estado','anio','color','notas','rating','imagen_url'] as const;
  for (const col of cols) {
    if ((patch as any)[col] !== undefined) { fields.push(`${col}=?`); values.push((patch as any)[col]); }
  }
  if (fields.length === 0) return getAnimeById(id);
  fields.push('actualizado_en=?'); values.push(now); values.push(id);
  await db.run(`UPDATE animes SET ${fields.join(',')} WHERE id=?`, values);
  return getAnimeById(id);
}

export async function deleteAnime(id: string): Promise<void> {
  await db.run('DELETE FROM animes WHERE id=?', [id]);
}

// ─── Manga ────────────────────────────────────────────────────────────────────

interface MangaRow {
  id: string; titulo: string; autor: string; tipo: string; unidad: string;
  total: number; leidos: number; serie: string; estado: string; anio: number;
  color: string; notas: string | null; agregado_en: string; actualizado_en: string;
}

function rowToManga(row: MangaRow): Manga {
  return {
    id: row.id, titulo: row.titulo, autor: row.autor, tipo: row.tipo as Manga['tipo'],
    unidad: row.unidad as Manga['unidad'], total: row.total, leidos: row.leidos,
    serie: row.serie as Manga['serie'], estado: row.estado as Manga['estado'],
    anio: row.anio, color: row.color, notas: row.notas,
    agregado_en: row.agregado_en, actualizado_en: row.actualizado_en,
  };
}

export async function getAllMangas(): Promise<Manga[]> {
  const rows = await db.all('SELECT * FROM mangas ORDER BY titulo ASC') as MangaRow[];
  return rows.map(rowToManga);
}

export async function getMangaById(id: string): Promise<Manga | null> {
  const row = await db.get('SELECT * FROM mangas WHERE id=?', [id]) as MangaRow | null;
  return row ? rowToManga(row) : null;
}

export async function insertManga(input: MangaInput): Promise<Manga> {
  const now = new Date().toISOString();
  const id = input.id ?? generateId();
  await db.run(
    `INSERT INTO mangas (id,titulo,autor,tipo,unidad,total,leidos,serie,estado,anio,color,notas,agregado_en,actualizado_en)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, input.titulo, input.autor, input.tipo, input.unidad, input.total, input.leidos,
     input.serie, input.estado, input.anio, input.color, input.notas ?? null, now, now]
  );
  return (await getMangaById(id))!;
}

export async function updateManga(id: string, patch: Partial<MangaInput>): Promise<Manga | null> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: unknown[] = [];
  const cols = ['titulo','autor','tipo','unidad','total','leidos','serie','estado','anio','color','notas'] as const;
  for (const col of cols) {
    if ((patch as any)[col] !== undefined) { fields.push(`${col}=?`); values.push((patch as any)[col]); }
  }
  if (fields.length === 0) return getMangaById(id);
  fields.push('actualizado_en=?'); values.push(now); values.push(id);
  await db.run(`UPDATE mangas SET ${fields.join(',')} WHERE id=?`, values);
  return getMangaById(id);
}

export async function deleteManga(id: string): Promise<void> {
  await db.run('DELETE FROM mangas WHERE id=?', [id]);
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.get('SELECT value FROM settings WHERE key=?', [key]) as { value: string } | null;
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.run(`INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`, [key, value]);
}
