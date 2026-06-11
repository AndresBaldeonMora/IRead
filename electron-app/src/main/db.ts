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

  // Always seed if empty (safe — checks count first)
  seedNovelaEternas()
}

function seedNovelaEternas() {
  const count = db.exec("SELECT COUNT(*) as n FROM books WHERE coleccion='novelas_eternas'")
  const n = count[0]?.values[0]?.[0] ?? 0
  if (Number(n) > 0) return

  const now = new Date().toISOString()
  const { v4: uuidv4 } = require('uuid')

  const SEED_BOOKS: { numero: number; titulo: string; autor: string; fecha_salida: string | null; tengo: boolean }[] = [
    { numero: 1,  titulo: 'Orgullo y prejuicio',                    autor: 'Jane Austen',                         fecha_salida: '1813-01-28', tengo: false },
    { numero: 2,  titulo: 'Cumbres borrascosas',                    autor: 'Emily Brontë',                        fecha_salida: '1847-12-01', tengo: true  },
    { numero: 3,  titulo: 'Mujercitas',                             autor: 'Louisa May Alcott',                   fecha_salida: '1868-09-30', tengo: true  },
    { numero: 4,  titulo: 'Jane Eyre',                              autor: 'Charlotte Brontë',                    fecha_salida: '1847-10-19', tengo: true  },
    { numero: 5,  titulo: 'Sentido y sensibilidad',                 autor: 'Jane Austen',                         fecha_salida: '1811-10-30', tengo: true  },
    { numero: 6,  titulo: 'Emma',                                   autor: 'Jane Austen',                         fecha_salida: '1815-12-23', tengo: true  },
    { numero: 7,  titulo: 'Persuasión',                             autor: 'Jane Austen',                         fecha_salida: '1817-12-20', tengo: true  },
    { numero: 8,  titulo: 'Mansfield Park',                         autor: 'Jane Austen',                         fecha_salida: '1814-07-09', tengo: false },
    { numero: 9,  titulo: 'Agnes Grey',                             autor: 'Ann Brontë',                          fecha_salida: '1847-12-01', tengo: false },
    { numero: 10, titulo: 'Lejos del mundanal ruido',               autor: 'Thomas Hardy',                        fecha_salida: '1874-11-23', tengo: false },
    { numero: 11, titulo: 'La feria de las vanidades I',            autor: 'William Makepeace Thackeray',         fecha_salida: null,         tengo: false },
    { numero: 12, titulo: 'La feria de las vanidades II',           autor: 'William Makepeace Thackeray',         fecha_salida: null,         tengo: false },
    { numero: 13, titulo: 'Las relaciones peligrosas',              autor: 'Pierre Choderlos de Laclos',          fecha_salida: '1782-03-23', tengo: false },
    { numero: 14, titulo: 'La casa del páramo',                     autor: 'Elizabeth Gaskell',                   fecha_salida: null,         tengo: false },
    { numero: 15, titulo: 'Washington Square',                      autor: 'Henry James',                         fecha_salida: '1880-06-01', tengo: false },
    { numero: 16, titulo: 'Norte y Sur',                            autor: 'Elizabeth Gaskell',                   fecha_salida: '1855-03-01', tengo: false },
    { numero: 17, titulo: 'El profesor',                            autor: 'Charlotte Brontë',                    fecha_salida: '1857-06-06', tengo: false },
    { numero: 18, titulo: 'Ana Karenina I',                         autor: 'Lev Tolstói',                         fecha_salida: '1877-04-01', tengo: false },
    { numero: 19, titulo: 'Ana Karenina II',                        autor: 'Lev Tolstói',                         fecha_salida: '1877-04-01', tengo: false },
    { numero: 20, titulo: 'La casa de la alegría',                  autor: 'Edith Wharton',                       fecha_salida: '1905-10-14', tengo: false },
    { numero: 21, titulo: 'El despertar y otros relatos',           autor: 'Kate Chopin',                         fecha_salida: '1899-04-22', tengo: false },
    { numero: 22, titulo: 'Villette',                               autor: 'Charlotte Brontë',                    fecha_salida: '1853-01-28', tengo: false },
    { numero: 23, titulo: 'Retrato de una dama I',                  autor: 'Henry James',                         fecha_salida: '1881-11-01', tengo: false },
    { numero: 24, titulo: 'Retrato de una dama II',                 autor: 'Henry James',                         fecha_salida: '1881-11-01', tengo: false },
    { numero: 25, titulo: 'Lady Susan. Los Watson. Sanditon',        autor: 'Jane Austen',                         fecha_salida: null,         tengo: false },
    { numero: 26, titulo: 'La edad de la inocencia',                autor: 'Edith Wharton',                       fecha_salida: '1920-10-01', tengo: false },
    { numero: 27, titulo: 'La letra escarlata',                     autor: 'Nathaniel Hawthorne',                 fecha_salida: '1850-03-16', tengo: false },
    { numero: 28, titulo: 'La inquilina de Wildfell Hall',          autor: 'Ann Brontë',                          fecha_salida: '1848-06-01', tengo: false },
    { numero: 29, titulo: "Tess de los d'Urberville",               autor: 'Thomas Hardy',                        fecha_salida: '1891-11-29', tengo: false },
    { numero: 30, titulo: 'La renuncia',                            autor: 'Edith Wharton',                       fecha_salida: null,         tengo: false },
    { numero: 31, titulo: 'Moll Flanders',                          autor: 'Daniel Defoe',                        fecha_salida: '1722-01-27', tengo: false },
    { numero: 32, titulo: 'Las alas de la paloma',                  autor: 'Henry James',                         fecha_salida: null,         tengo: false },
    { numero: 33, titulo: 'Las costumbres nacionales',              autor: 'Edith Wharton',                       fecha_salida: null,         tengo: false },
    { numero: 34, titulo: 'Amor y amistad',                         autor: 'Jane Austen',                         fecha_salida: null,         tengo: false },
    { numero: 35, titulo: 'Middlemarch I',                          autor: 'George Eliot',                        fecha_salida: null,         tengo: false },
    { numero: 36, titulo: 'Middlemarch II',                         autor: 'George Eliot',                        fecha_salida: null,         tengo: false },
    { numero: 37, titulo: 'La señorita Mackenzie',                  autor: 'Anthony Trollope',                    fecha_salida: null,         tengo: false },
    { numero: 38, titulo: 'Los embajadores',                        autor: 'Henry James',                         fecha_salida: null,         tengo: false },
    { numero: 39, titulo: 'La abadía de Northanger',                autor: 'Jane Austen',                         fecha_salida: null,         tengo: true  },
    { numero: 40, titulo: 'Madame Bovary',                          autor: 'Gustave Flaubert',                    fecha_salida: '1856-12-15', tengo: false },
    { numero: 41, titulo: 'Aquellas mujercitas',                    autor: 'Louisa May Alcott',                   fecha_salida: null,         tengo: true  },
    { numero: 42, titulo: 'Cranford',                               autor: 'Elizabeth Gaskell',                   fecha_salida: null,         tengo: false },
    { numero: 43, titulo: 'Ojo por ojo',                            autor: 'Anthony Trollope',                    fecha_salida: null,         tengo: false },
    { numero: 44, titulo: 'Estío',                                  autor: 'Edith Wharton',                       fecha_salida: null,         tengo: false },
    { numero: 45, titulo: 'Indiana',                                autor: 'George Sand',                         fecha_salida: null,         tengo: false },
    { numero: 46, titulo: 'Las bostonianas',                        autor: 'Henry James',                         fecha_salida: null,         tengo: false },
    { numero: 47, titulo: 'Silas Marner',                           autor: 'George Eliot',                        fecha_salida: null,         tengo: false },
    { numero: 48, titulo: 'La copa dorada I',                       autor: 'Henry James',                         fecha_salida: null,         tengo: false },
    { numero: 49, titulo: 'La copa dorada II',                      autor: 'Henry James',                         fecha_salida: null,         tengo: false },
    { numero: 50, titulo: 'Sueño crepuscular',                      autor: 'Edith Wharton',                       fecha_salida: null,         tengo: false },
    { numero: 51, titulo: 'La culpa',                               autor: 'Kate Chopin',                         fecha_salida: null,         tengo: false },
    { numero: 52, titulo: 'Un grupo de nobles damas',               autor: 'Thomas Hardy',                        fecha_salida: null,         tengo: false },
    { numero: 53, titulo: 'Pauline',                                autor: 'George Sand',                         fecha_salida: null,         tengo: false },
    { numero: 54, titulo: 'El molino junto al Floss',               autor: 'George Eliot',                        fecha_salida: null,         tengo: false },
    { numero: 55, titulo: 'Unos ojos azules',                       autor: 'Thomas Hardy',                        fecha_salida: null,         tengo: false },
    { numero: 56, titulo: 'Evelina',                                autor: 'Fanny Burney',                        fecha_salida: null,         tengo: false },
    { numero: 57, titulo: 'La pequeña Fadette',                     autor: 'George Sand',                         fecha_salida: null,         tengo: false },
    { numero: 58, titulo: 'Marianela',                              autor: 'Benito Pérez Galdós',                 fecha_salida: null,         tengo: false },
    { numero: 59, titulo: 'Shirley I',                              autor: 'Charlotte Brontë',                    fecha_salida: null,         tengo: false },
    { numero: 60, titulo: 'Shirley II',                             autor: 'Charlotte Brontë',                    fecha_salida: null,         tengo: false },
    { numero: 61, titulo: 'Effi Briest',                            autor: 'Theodor Fontane',                     fecha_salida: null,         tengo: false },
    { numero: 62, titulo: 'Los reflejos de la luna',                autor: 'Edith Wharton',                       fecha_salida: null,         tengo: false },
    { numero: 63, titulo: 'La dama de las camelias',                autor: 'Alexandre Dumas',                     fecha_salida: null,         tengo: false },
    { numero: 64, titulo: 'El secreto de lady Audley',              autor: 'Mary Elizabeth Braddon',              fecha_salida: null,         tengo: false },
    { numero: 65, titulo: 'Una pareja casi perfecta',               autor: 'Emily Eden',                          fecha_salida: null,         tengo: false },
    { numero: 66, titulo: 'Ana de las tejas verdes',                autor: 'Lucy Maud Montgomery',                fecha_salida: '1908-06-13', tengo: false },
    { numero: 67, titulo: 'Los habitantes del bosque',              autor: 'Thomas Hardy',                        fecha_salida: null,         tengo: false },
    { numero: 68, titulo: 'Ruth',                                   autor: 'Elizabeth Gaskell',                   fecha_salida: null,         tengo: false },
    { numero: 69, titulo: 'Dos en una torre',                       autor: 'Elizabeth Gaskell',                   fecha_salida: null,         tengo: false },
    { numero: 70, titulo: 'Insolación',                             autor: 'Thomas Hardy',                        fecha_salida: null,         tengo: false },
    { numero: 71, titulo: 'El secreto de Aurora Floyd',             autor: 'Elizabeth Braddon',                   fecha_salida: null,         tengo: false },
    { numero: 72, titulo: 'El misterio de Gramercy Park',           autor: 'Anna Katharine Green',                fecha_salida: null,         tengo: false },
    { numero: 73, titulo: 'Fantasía',                               autor: 'Matilde Serao',                       fecha_salida: null,         tengo: false },
    { numero: 74, titulo: 'Valentina',                              autor: 'George Sand',                         fecha_salida: null,         tengo: false },
    { numero: 75, titulo: 'Amor de perdición',                      autor: 'Camilo Castelo Branco',               fecha_salida: null,         tengo: false },
  ]

  const stmt = db.prepare(
    `INSERT INTO books (id,numero,titulo,autor,fecha_salida,tengo,leido,leido_en,coleccion,formato,generos,agregado_en,actualizado_en,notas,imagen_url,editorial,edicion,idioma)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  )
  for (const b of SEED_BOOKS) {
    stmt.run([uuidv4(), b.numero, b.titulo, b.autor, b.fecha_salida, b.tengo ? 1 : 0, 0, null,
      'novelas_eternas', 'fisico', '', now, now, null, null, null, null, null])
  }
  stmt.free()
  persist()
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
