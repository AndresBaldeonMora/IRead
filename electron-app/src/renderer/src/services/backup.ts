import { useBooksStore } from '@/stores/books.store'
import { useAnimesStore } from '@/stores/animes.store'
import { useMangasStore } from '@/stores/mangas.store'
import type { Book, Anime, Manga } from '@/types'

interface BackupFile {
  app: 'mi-biblioteca'
  version: 1
  exportado_en: string
  data: { books: Book[]; animes: Anime[]; mangas: Manga[] }
}

export async function exportarDatos(): Promise<boolean> {
  const books = useBooksStore.getState().books
  const animes = useAnimesStore.getState().animes
  const mangas = useMangasStore.getState().mangas

  const backup: BackupFile = {
    app: 'mi-biblioteca',
    version: 1,
    exportado_en: new Date().toISOString(),
    data: { books, animes, mangas },
  }

  const result = await window.electronAPI.dialog.saveJson(JSON.stringify(backup, null, 2))
  return result.ok
}

export async function importarDatos(): Promise<boolean> {
  const result = await window.electronAPI.dialog.openJson()
  if (!result.ok || !result.data) return false

  let backup: BackupFile
  try {
    backup = JSON.parse(result.data)
  } catch {
    throw new Error('El archivo no es un JSON válido')
  }

  if (backup.app !== 'mi-biblioteca' || backup.version !== 1) {
    throw new Error('El archivo no es un respaldo válido de Mi Biblioteca')
  }

  const db = window.electronAPI.db

  // Clear all tables
  await db.run('DELETE FROM books', [])
  await db.run('DELETE FROM animes', [])
  await db.run('DELETE FROM mangas', [])

  // Re-insert books
  for (const b of backup.data.books) {
    await db.run(
      `INSERT INTO books (id, numero, titulo, autor, fecha_salida, tengo, leido, leido_en, coleccion, formato, generos, agregado_en, actualizado_en, notas, imagen_url, editorial, edicion, idioma)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [b.id, b.numero, b.titulo, b.autor, b.fecha_salida,
       b.tengo ? 1 : 0, b.leido ? 1 : 0, b.leido_en,
       b.coleccion, b.formato, JSON.stringify(b.generos),
       b.agregado_en, b.actualizado_en, b.notas,
       b.imagen_url, b.editorial, b.edicion, b.idioma]
    )
  }

  // Re-insert animes
  for (const a of backup.data.animes) {
    await db.run(
      `INSERT INTO animes (id, titulo, tipo, temporada, eps, vistos, serie, estado, anio, color, notas, rating, imagen_url, agregado_en, actualizado_en)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [a.id, a.titulo, a.tipo, a.temporada, a.eps, a.vistos,
       a.serie, a.estado, a.anio, a.color, a.notas, a.rating,
       a.imagen_url, a.agregado_en, a.actualizado_en]
    )
  }

  // Re-insert mangas
  for (const m of backup.data.mangas) {
    await db.run(
      `INSERT INTO mangas (id, titulo, autor, tipo, unidad, total, leidos, serie, estado, anio, color, notas, agregado_en, actualizado_en)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [m.id, m.titulo, m.autor, m.tipo, m.unidad, m.total,
       m.leidos, m.serie, m.estado, m.anio, m.color, m.notas,
       m.agregado_en, m.actualizado_en]
    )
  }

  // Reload all stores from DB
  await useBooksStore.getState().loadBooks()
  await useAnimesStore.getState().loadAnimes()
  await useMangasStore.getState().loadMangas()

  return true
}
