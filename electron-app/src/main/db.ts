import path from 'path'
import fs from 'fs'
import { app } from 'electron'

// sql.js — pure JS SQLite, no native compilation needed
// eslint-disable-next-line @typescript-eslint/no-require-imports
const initSqlJs = require('sql.js')

let db: any
let dbPath: string

export async function initDB() {
  const SQL = await initSqlJs()
  dbPath = path.join(app.getPath('userData'), 'mibiblioteca.db')

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  db.run('PRAGMA journal_mode = WAL')
  db.run('PRAGMA foreign_keys = ON')
  runMigrations()
  persist()
}

function persist() {
  const data = db.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

function runMigrations() {
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  const stmt = db.prepare(`SELECT value FROM settings WHERE key = 'schema_version'`)
  const row = stmt.getAsObject({})
  stmt.free()
  const version = row.value ? parseInt(row.value as string) : 0

  if (version < 1) {
    db.run(`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        numero INTEGER UNIQUE,
        titulo TEXT NOT NULL,
        autor TEXT,
        fecha_salida TEXT,
        tengo INTEGER DEFAULT 0,
        leido INTEGER DEFAULT 0,
        leido_en TEXT,
        coleccion TEXT DEFAULT 'novelas_eternas',
        formato TEXT DEFAULT 'fisico',
        generos TEXT,
        agregado_en TEXT,
        actualizado_en TEXT,
        notas TEXT,
        imagen_url TEXT,
        editorial TEXT,
        edicion TEXT,
        idioma TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_books_tengo ON books(tengo);
      CREATE INDEX IF NOT EXISTS idx_books_titulo ON books(titulo);
      CREATE INDEX IF NOT EXISTS idx_books_numero ON books(numero);
      CREATE INDEX IF NOT EXISTS idx_books_coleccion ON books(coleccion);

      CREATE TABLE IF NOT EXISTS animes (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        estudio TEXT,
        tipo TEXT DEFAULT 'serie',
        temporada INTEGER DEFAULT 1,
        eps INTEGER DEFAULT 0,
        vistos INTEGER DEFAULT 0,
        serie TEXT DEFAULT 'emision',
        estado TEXT DEFAULT 'pendiente',
        anio INTEGER,
        color TEXT,
        notas TEXT,
        rating INTEGER,
        imagen_url TEXT,
        agregado_en TEXT,
        actualizado_en TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_animes_estado ON animes(estado);
      CREATE INDEX IF NOT EXISTS idx_animes_titulo ON animes(titulo);

      CREATE TABLE IF NOT EXISTS mangas (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        autor TEXT,
        tipo TEXT DEFAULT 'manga',
        unidad TEXT DEFAULT 'tomo',
        total INTEGER DEFAULT 0,
        leidos INTEGER DEFAULT 0,
        serie TEXT DEFAULT 'serializacion',
        estado TEXT DEFAULT 'pendiente',
        anio INTEGER,
        color TEXT,
        notas TEXT,
        agregado_en TEXT,
        actualizado_en TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_mangas_estado ON mangas(estado);
      CREATE INDEX IF NOT EXISTS idx_mangas_titulo ON mangas(titulo);
    `)

    db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('schema_version', '1')`)
    persist()
  }
}

export function runQuery(sql: string, params: unknown[] = []): { changes: number; lastInsertRowid: number } {
  db.run(sql, params)
  persist()
  return { changes: db.getRowsModified(), lastInsertRowid: 0 }
}

export function runGet(sql: string, params: unknown[] = []): unknown {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const row = stmt.step() ? stmt.getAsObject() : null
  stmt.free()
  return row
}

export function runAll(sql: string, params: unknown[] = []): unknown[] {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows: unknown[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}
