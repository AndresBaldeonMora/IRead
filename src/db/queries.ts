import { Book, BookInput, Coleccion, Formato } from '@/types';
import { generateId } from '@/utils/formatters';
import { getDatabase } from './schema';

interface BookRow {
  id: string;
  numero: number;
  titulo: string;
  autor: string;
  fecha_salida: string | null;
  tengo: number;
  leido: number;
  leido_en: string | null;
  coleccion: string;
  formato: string | null;
  generos: string;
  agregado_en: string;
  actualizado_en: string;
  notas: string | null;
  imagen_url: string | null;
}

function rowToBook(row: BookRow): Book {
  return {
    id: row.id,
    numero: row.numero,
    titulo: row.titulo,
    autor: row.autor,
    fecha_salida: row.fecha_salida,
    tengo: row.tengo === 1,
    leido: row.leido === 1,
    leido_en: row.leido_en ?? null,
    coleccion: (row.coleccion as Coleccion) || 'novelas_eternas',
    formato: (row.formato as Formato | null) ?? null,
    generos: row.generos ? row.generos.split(',').filter(Boolean) : [],
    agregado_en: row.agregado_en,
    actualizado_en: row.actualizado_en,
    notas: row.notas,
    imagen_url: row.imagen_url,
  };
}

export async function getAllBooks(): Promise<Book[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BookRow>(
    'SELECT * FROM books ORDER BY numero ASC'
  );
  return rows.map(rowToBook);
}

export async function getBookById(id: string): Promise<Book | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<BookRow>(
    'SELECT * FROM books WHERE id = ?',
    [id]
  );
  return row ? rowToBook(row) : null;
}

export async function getNextNumero(coleccion: string = 'novelas_eternas'): Promise<number> {
  const db = await getDatabase();
  if (coleccion === 'novelas_eternas') {
    const result = await db.getFirstAsync<{ max: number | null }>(
      "SELECT MAX(numero) as max FROM books WHERE coleccion = 'novelas_eternas'"
    );
    return (result?.max ?? 0) + 1;
  }
  // mi_biblioteca usa un rango separado empezando en 10001
  const result = await db.getFirstAsync<{ max: number | null }>(
    "SELECT MAX(numero) as max FROM books WHERE coleccion = 'mi_biblioteca'"
  );
  const current = result?.max ?? 10000;
  return current < 10000 ? 10001 : current + 1;
}

export async function insertBook(input: BookInput): Promise<Book> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = input.id ?? generateId();

  await db.runAsync(
    `INSERT INTO books (id, numero, titulo, autor, fecha_salida, tengo, leido, leido_en, coleccion, formato, generos, agregado_en, actualizado_en, notas, imagen_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.numero,
      input.titulo,
      input.autor,
      input.fecha_salida ?? null,
      input.tengo ? 1 : 0,
      input.leido ? 1 : 0,
      input.leido_en ?? null,
      input.coleccion ?? 'mi_biblioteca',
      input.formato ?? null,
      Array.isArray(input.generos) ? input.generos.join(',') : '',
      now,
      now,
      input.notas ?? null,
      input.imagen_url ?? null,
    ]
  );

  const book = await getBookById(id);
  if (!book) throw new Error('Failed to insert book');
  return book;
}

export async function toggleBookOwned(id: string): Promise<Book | null> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE books SET tengo = CASE WHEN tengo = 1 THEN 0 ELSE 1 END,
       actualizado_en = ? WHERE id = ?`,
    [now, id]
  );
  return getBookById(id);
}

export async function toggleBookRead(
  id: string,
  leidoEn?: string | null
): Promise<Book | null> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const current = await getBookById(id);
  if (!current) return null;

  const newLeido = !current.leido;
  const newLeidoEn = newLeido ? (leidoEn ?? null) : null;

  await db.runAsync(
    `UPDATE books SET leido = ?, leido_en = ?, actualizado_en = ? WHERE id = ?`,
    [newLeido ? 1 : 0, newLeidoEn, now, id]
  );
  return getBookById(id);
}

export async function updateBook(
  id: string,
  patch: Partial<BookInput>
): Promise<Book | null> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (patch.titulo !== undefined) {
    fields.push('titulo = ?');
    values.push(patch.titulo);
  }
  if (patch.autor !== undefined) {
    fields.push('autor = ?');
    values.push(patch.autor);
  }
  if (patch.fecha_salida !== undefined) {
    fields.push('fecha_salida = ?');
    values.push(patch.fecha_salida);
  }
  if (patch.tengo !== undefined) {
    fields.push('tengo = ?');
    values.push(patch.tengo ? 1 : 0);
  }
  if (patch.leido !== undefined) {
    fields.push('leido = ?');
    values.push(patch.leido ? 1 : 0);
  }
  if (patch.leido_en !== undefined) {
    fields.push('leido_en = ?');
    values.push(patch.leido_en);
  }
  if (patch.coleccion !== undefined) {
    fields.push('coleccion = ?');
    values.push(patch.coleccion);
  }
  if (patch.formato !== undefined) {
    fields.push('formato = ?');
    values.push(patch.formato ?? null);
  }
  if (patch.generos !== undefined) {
    fields.push('generos = ?');
    values.push(Array.isArray(patch.generos) ? patch.generos.join(',') : '');
  }
  if (patch.notas !== undefined) {
    fields.push('notas = ?');
    values.push(patch.notas);
  }
  if (patch.imagen_url !== undefined) {
    fields.push('imagen_url = ?');
    values.push(patch.imagen_url);
  }

  if (fields.length === 0) return getBookById(id);

  fields.push('actualizado_en = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE books SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return getBookById(id);
}

export async function deleteBook(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM books WHERE id = ?', [id]);
}

export async function getSetting(clave: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ valor: string }>(
    'SELECT valor FROM settings WHERE clave = ?',
    [clave]
  );
  return row?.valor ?? null;
}

export async function setSetting(clave: string, valor: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO settings (clave, valor, actualizado_en) VALUES (?, ?, ?)
     ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor, actualizado_en = excluded.actualizado_en`,
    [clave, valor, now]
  );
}
