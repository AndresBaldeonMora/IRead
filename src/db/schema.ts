import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '@/utils/constants';
import { SEED_BOOKS } from './seed';
import { SEED_ANIMES } from './animeSeed';
import { SEED_MANGAS } from './mangaSeed';
import { SEED_MI_BIBLIOTECA } from './miBibliotecaSeed';
import { generateId } from '@/utils/formatters';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return dbInstance;
}

export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      numero INTEGER UNIQUE NOT NULL,
      titulo TEXT NOT NULL,
      autor TEXT NOT NULL DEFAULT '',
      fecha_salida TEXT,
      tengo INTEGER NOT NULL DEFAULT 0,
      leido INTEGER NOT NULL DEFAULT 0,
      leido_en TEXT,
      coleccion TEXT NOT NULL DEFAULT 'novelas_eternas',
      formato TEXT,
      generos TEXT NOT NULL DEFAULT '',
      agregado_en TEXT NOT NULL,
      actualizado_en TEXT NOT NULL,
      notas TEXT,
      imagen_url TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_books_tengo ON books(tengo);
    CREATE INDEX IF NOT EXISTS idx_books_titulo ON books(titulo);
    CREATE INDEX IF NOT EXISTS idx_books_autor ON books(autor);
    CREATE INDEX IF NOT EXISTS idx_books_numero ON books(numero);

    CREATE TABLE IF NOT EXISTS settings (
      clave TEXT PRIMARY KEY,
      valor TEXT,
      actualizado_en TEXT
    );

    CREATE TABLE IF NOT EXISTS animes (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      estudio TEXT NOT NULL DEFAULT '',
      eps INTEGER NOT NULL DEFAULT 0,
      vistos INTEGER NOT NULL DEFAULT 0,
      serie TEXT NOT NULL DEFAULT 'finalizado',
      estado TEXT NOT NULL DEFAULT 'pendiente',
      anio INTEGER NOT NULL DEFAULT 0,
      color TEXT NOT NULL DEFAULT '#00E5FF',
      notas TEXT,
      agregado_en TEXT NOT NULL,
      actualizado_en TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_animes_estado ON animes(estado);
    CREATE INDEX IF NOT EXISTS idx_animes_titulo ON animes(titulo);

    CREATE TABLE IF NOT EXISTS mangas (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      autor TEXT NOT NULL DEFAULT '',
      tipo TEXT NOT NULL DEFAULT 'manga',
      unidad TEXT NOT NULL DEFAULT 'tomo',
      total INTEGER NOT NULL DEFAULT 0,
      leidos INTEGER NOT NULL DEFAULT 0,
      serie TEXT NOT NULL DEFAULT 'serializacion',
      estado TEXT NOT NULL DEFAULT 'pendiente',
      anio INTEGER NOT NULL DEFAULT 0,
      color TEXT NOT NULL DEFAULT '#B85042',
      notas TEXT,
      agregado_en TEXT NOT NULL,
      actualizado_en TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_mangas_estado ON mangas(estado);
    CREATE INDEX IF NOT EXISTS idx_mangas_titulo ON mangas(titulo);
    CREATE INDEX IF NOT EXISTS idx_mangas_tipo ON mangas(tipo);
  `);

  await runMigrationV2();
  await runMigrationV3();
  await runMigrationV4();
  await runMigrationV5();
  await runMigrationV6();
  await runMigrationV7();
  await runMigrationV8();
  await clearTestDataOnce();
  await seedIfEmpty();
  await seedAnimesIfEmpty();
  await seedMangasIfEmpty();
}

async function runMigrationV2(): Promise<void> {
  const db = await getDatabase();
  const done = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM settings WHERE clave = 'schema_v2'"
  );
  if (done) return;

  const alterations = [
    "ALTER TABLE books ADD COLUMN leido INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE books ADD COLUMN leido_en TEXT",
    "ALTER TABLE books ADD COLUMN coleccion TEXT NOT NULL DEFAULT 'novelas_eternas'",
    "ALTER TABLE books ADD COLUMN formato TEXT",
    "ALTER TABLE books ADD COLUMN generos TEXT NOT NULL DEFAULT ''",
  ];
  for (const sql of alterations) {
    try { await db.runAsync(sql); } catch { /* columna ya existe */ }
  }

  try {
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_books_coleccion ON books(coleccion)');
  } catch { /* ignore */ }

  await db.runAsync(
    "INSERT OR REPLACE INTO settings (clave, valor, actualizado_en) VALUES ('schema_v2', '1', ?)",
    [new Date().toISOString()]
  );
}

async function runMigrationV3(): Promise<void> {
  const db = await getDatabase();
  const done = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM settings WHERE clave = 'schema_v3'"
  );
  if (done) return;

  const alterations = [
    "ALTER TABLE animes ADD COLUMN tipo TEXT NOT NULL DEFAULT 'serie'",
    "ALTER TABLE animes ADD COLUMN temporada INTEGER NOT NULL DEFAULT 1",
  ];
  for (const sql of alterations) {
    try { await db.runAsync(sql); } catch { /* columna ya existe */ }
  }

  await db.runAsync(
    "INSERT OR REPLACE INTO settings (clave, valor, actualizado_en) VALUES ('schema_v3', '1', ?)",
    [new Date().toISOString()]
  );
}

async function runMigrationV4(): Promise<void> {
  const db = await getDatabase();
  const done = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM settings WHERE clave = 'schema_v4'"
  );
  if (done) return;

  // Reemplaza los libros de novelas_eternas con la lista correcta de 75
  await db.runAsync("DELETE FROM books WHERE coleccion = 'novelas_eternas'");

  const now = new Date().toISOString();
  for (const book of SEED_BOOKS) {
    await db.runAsync(
      `INSERT INTO books (id, numero, titulo, autor, fecha_salida, tengo, leido, leido_en, coleccion, generos, agregado_en, actualizado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        book.numero,
        book.titulo,
        book.autor,
        book.fecha_salida,
        book.tengo ? 1 : 0,
        0,
        null,
        'novelas_eternas',
        '',
        now,
        now,
      ]
    );
  }

  await db.runAsync(
    "INSERT OR REPLACE INTO settings (clave, valor, actualizado_en) VALUES ('schema_v4', '1', ?)",
    [new Date().toISOString()]
  );
}

async function runMigrationV5(): Promise<void> {
  const db = await getDatabase();
  const done = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM settings WHERE clave = 'schema_v5'"
  );
  if (done) return;

  try { await db.runAsync('ALTER TABLE animes ADD COLUMN rating INTEGER'); } catch { /* columna ya existe */ }

  await db.runAsync(
    "INSERT OR REPLACE INTO settings (clave, valor, actualizado_en) VALUES ('schema_v5', '1', ?)",
    [new Date().toISOString()]
  );
}

async function runMigrationV6(): Promise<void> {
  const db = await getDatabase();
  const done = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM settings WHERE clave = 'schema_v6'"
  );
  if (done) return;

  const alterations = [
    'ALTER TABLE books ADD COLUMN editorial TEXT',
    'ALTER TABLE books ADD COLUMN edicion TEXT',
    'ALTER TABLE books ADD COLUMN idioma TEXT',
  ];
  for (const sql of alterations) {
    try { await db.runAsync(sql); } catch { /* columna ya existe */ }
  }

  await db.runAsync(
    "INSERT OR REPLACE INTO settings (clave, valor, actualizado_en) VALUES ('schema_v6', '1', ?)",
    [new Date().toISOString()]
  );
}

async function runMigrationV7(): Promise<void> {
  const db = await getDatabase();
  const done = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM settings WHERE clave = 'schema_v7'"
  );
  if (done) return;

  // Popula mi_biblioteca con los 127 libros físicos del usuario.
  // Usa el rango 10001–10127 para no colisionar jamás con novelas_eternas (1–9999).
  const now = new Date().toISOString();
  for (const book of SEED_MI_BIBLIOTECA) {
    await db.runAsync(
      `INSERT OR IGNORE INTO books
         (id, numero, titulo, autor, tengo, leido, coleccion, generos,
          editorial, edicion, idioma, agregado_en, actualizado_en)
       VALUES (?, ?, ?, ?, 1, 0, 'mi_biblioteca', '', ?, ?, ?, ?, ?)`,
      [
        generateId(),
        book.numero,
        book.titulo,
        book.autor,
        book.editorial || null,
        book.edicion  || null,
        book.idioma   || null,
        now,
        now,
      ]
    );
  }

  await db.runAsync(
    "INSERT OR REPLACE INTO settings (clave, valor, actualizado_en) VALUES ('schema_v7', '1', ?)",
    [new Date().toISOString()]
  );
}

async function runMigrationV8(): Promise<void> {
  const db = await getDatabase();
  const done = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM settings WHERE clave = 'schema_v8'"
  );
  if (done) return;

  try { await db.runAsync('ALTER TABLE animes ADD COLUMN imagen_url TEXT'); } catch { /* columna ya existe */ }

  await db.runAsync(
    "INSERT OR REPLACE INTO settings (clave, valor, actualizado_en) VALUES ('schema_v8', '1', ?)",
    [new Date().toISOString()]
  );
}

async function clearTestDataOnce(): Promise<void> {
  const db = await getDatabase();
  const flag = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM settings WHERE clave = 'cleared_test_data_v1'"
  );
  if (flag) return;

  await db.runAsync('DELETE FROM animes');
  await db.runAsync('DELETE FROM mangas');
  await db.runAsync(
    "INSERT OR REPLACE INTO settings (clave, valor, actualizado_en) VALUES ('cleared_test_data_v1', '1', ?)",
    [new Date().toISOString()]
  );
}

async function seedIfEmpty(): Promise<void> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM books'
  );

  if (result && result.count > 0) return;

  const now = new Date().toISOString();
  for (const book of SEED_BOOKS) {
    await db.runAsync(
      `INSERT INTO books (id, numero, titulo, autor, fecha_salida, tengo, leido, leido_en, coleccion, generos, agregado_en, actualizado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        book.numero,
        book.titulo,
        book.autor,
        book.fecha_salida,
        book.tengo ? 1 : 0,
        0,
        null,
        'novelas_eternas',
        '',
        now,
        now,
      ]
    );
  }
}

async function seedAnimesIfEmpty(): Promise<void> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM animes'
  );

  if (result && result.count > 0) return;

  const now = new Date().toISOString();
  for (const a of SEED_ANIMES) {
    await db.runAsync(
      `INSERT INTO animes (id, titulo, estudio, tipo, temporada, eps, vistos, serie, estado, anio, color, notas, imagen_url, agregado_en, actualizado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        a.titulo,
        '',
        a.tipo,
        a.temporada,
        a.eps,
        a.vistos,
        a.serie,
        a.estado,
        a.anio,
        a.color,
        a.notas ?? null,
        a.imagen_url ?? null,
        now,
        now,
      ]
    );
  }
}

async function seedMangasIfEmpty(): Promise<void> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM mangas'
  );

  if (result && result.count > 0) return;

  const now = new Date().toISOString();
  for (const m of SEED_MANGAS) {
    await db.runAsync(
      `INSERT INTO mangas (id, titulo, autor, tipo, unidad, total, leidos, serie, estado, anio, color, notas, agregado_en, actualizado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        m.titulo,
        m.autor,
        m.tipo,
        m.unidad,
        m.total,
        m.leidos,
        m.serie,
        m.estado,
        m.anio,
        m.color,
        m.notas ?? null,
        now,
        now,
      ]
    );
  }
}

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(
    'DROP TABLE IF EXISTS books; DROP TABLE IF EXISTS settings; DROP TABLE IF EXISTS animes; DROP TABLE IF EXISTS mangas;'
  );
  await initializeDatabase();
}
