import { Manga, MangaInput } from '@/types';
import { generateId } from '@/utils/formatters';
import { getDatabase } from './schema';

interface MangaRow {
  id: string;
  titulo: string;
  autor: string;
  tipo: string;
  unidad: string;
  total: number;
  leidos: number;
  serie: string;
  estado: string;
  anio: number;
  color: string;
  notas: string | null;
  agregado_en: string;
  actualizado_en: string;
}

function rowToManga(row: MangaRow): Manga {
  return {
    id: row.id,
    titulo: row.titulo,
    autor: row.autor,
    tipo: row.tipo as Manga['tipo'],
    unidad: row.unidad as Manga['unidad'],
    total: row.total,
    leidos: row.leidos,
    serie: row.serie as Manga['serie'],
    estado: row.estado as Manga['estado'],
    anio: row.anio,
    color: row.color,
    notas: row.notas,
    agregado_en: row.agregado_en,
    actualizado_en: row.actualizado_en,
  };
}

export async function getAllMangas(): Promise<Manga[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MangaRow>(
    'SELECT * FROM mangas ORDER BY titulo ASC'
  );
  return rows.map(rowToManga);
}

export async function getMangaById(id: string): Promise<Manga | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<MangaRow>(
    'SELECT * FROM mangas WHERE id = ?',
    [id]
  );
  return row ? rowToManga(row) : null;
}

export async function insertManga(input: MangaInput): Promise<Manga> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = input.id ?? generateId();

  await db.runAsync(
    `INSERT INTO mangas (id, titulo, autor, tipo, unidad, total, leidos, serie, estado, anio, color, notas, agregado_en, actualizado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.titulo,
      input.autor,
      input.tipo,
      input.unidad,
      input.total,
      input.leidos,
      input.serie,
      input.estado,
      input.anio,
      input.color,
      input.notas ?? null,
      now,
      now,
    ]
  );

  const manga = await getMangaById(id);
  if (!manga) throw new Error('Failed to insert manga');
  return manga;
}

export async function updateManga(
  id: string,
  patch: Partial<MangaInput>
): Promise<Manga | null> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const cols: (keyof MangaInput)[] = [
    'titulo',
    'autor',
    'tipo',
    'unidad',
    'total',
    'leidos',
    'serie',
    'estado',
    'anio',
    'color',
    'notas',
  ];

  for (const col of cols) {
    if (patch[col] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(patch[col] as string | number | null);
    }
  }

  if (fields.length === 0) return getMangaById(id);

  fields.push('actualizado_en = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE mangas SET ${fields.join(', ')} WHERE id = ?`, values);

  return getMangaById(id);
}

export async function deleteManga(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM mangas WHERE id = ?', [id]);
}
