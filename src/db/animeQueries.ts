import { Anime, AnimeInput } from '@/types';
import { generateId } from '@/utils/formatters';
import { getDatabase } from './schema';

interface AnimeRow {
  id: string;
  titulo: string;
  estudio: string;
  tipo: string;
  temporada: number;
  eps: number;
  vistos: number;
  serie: string;
  estado: string;
  anio: number;
  color: string;
  notas: string | null;
  rating: number | null;
  agregado_en: string;
  actualizado_en: string;
}

function rowToAnime(row: AnimeRow): Anime {
  return {
    id: row.id,
    titulo: row.titulo,
    tipo: (row.tipo ?? 'serie') as Anime['tipo'],
    temporada: row.temporada ?? 1,
    eps: row.eps,
    vistos: row.vistos,
    serie: row.serie as Anime['serie'],
    estado: row.estado as Anime['estado'],
    anio: row.anio,
    color: row.color,
    notas: row.notas,
    rating: row.rating ?? null,
    agregado_en: row.agregado_en,
    actualizado_en: row.actualizado_en,
  };
}

export async function getAllAnimes(): Promise<Anime[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<AnimeRow>(
    'SELECT * FROM animes ORDER BY titulo ASC'
  );
  return rows.map(rowToAnime);
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<AnimeRow>(
    'SELECT * FROM animes WHERE id = ?',
    [id]
  );
  return row ? rowToAnime(row) : null;
}

export async function insertAnime(input: AnimeInput): Promise<Anime> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = input.id ?? generateId();

  await db.runAsync(
    `INSERT INTO animes (id, titulo, estudio, tipo, temporada, eps, vistos, serie, estado, anio, color, notas, agregado_en, actualizado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.titulo,
      '',
      input.tipo,
      input.temporada,
      input.eps,
      input.vistos,
      input.serie,
      input.estado,
      input.anio,
      input.color,
      input.notas ?? null,
      now,
      now,
    ]
  );

  const anime = await getAnimeById(id);
  if (!anime) throw new Error('Failed to insert anime');
  return anime;
}

export async function updateAnime(
  id: string,
  patch: Partial<AnimeInput>
): Promise<Anime | null> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const cols: (keyof AnimeInput)[] = [
    'titulo',
    'tipo',
    'temporada',
    'eps',
    'vistos',
    'serie',
    'estado',
    'anio',
    'color',
    'notas',
    'rating',
  ];

  for (const col of cols) {
    if (patch[col] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(patch[col] as string | number | null);
    }
  }

  if (fields.length === 0) return getAnimeById(id);

  fields.push('actualizado_en = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE animes SET ${fields.join(', ')} WHERE id = ?`, values);

  return getAnimeById(id);
}

export async function deleteAnime(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM animes WHERE id = ?', [id]);
}
