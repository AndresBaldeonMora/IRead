import { File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getDatabase } from '@/db/schema';

const BACKUP_VERSION = 1;
const TABLES = ['books', 'animes', 'mangas'] as const;
type Tabla = (typeof TABLES)[number];

interface BackupFile {
  app: 'mi-biblioteca';
  version: number;
  exportado_en: string;
  data: Record<Tabla, Record<string, unknown>[]>;
}

function fechaArchivo(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

/**
 * Exporta toda la información (libros, animes, mangas) a un archivo JSON
 * y abre el menú de compartir para que el usuario lo guarde donde quiera
 * (Descargas, Drive, enviárselo, etc.).
 */
export async function exportarDatos(): Promise<{ ok: boolean; mensaje: string }> {
  const db = await getDatabase();

  const data = {} as Record<Tabla, Record<string, unknown>[]>;
  for (const tabla of TABLES) {
    data[tabla] = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM ${tabla}`);
  }

  const backup: BackupFile = {
    app: 'mi-biblioteca',
    version: BACKUP_VERSION,
    exportado_en: new Date().toISOString(),
    data,
  };

  const file = new File(Paths.cache, `mibiblioteca_respaldo_${fechaArchivo()}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(backup, null, 2));

  const total = data.books.length + data.animes.length + data.mangas.length;

  if (!(await Sharing.isAvailableAsync())) {
    return { ok: true, mensaje: `Respaldo guardado en: ${file.uri}` };
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Guardar respaldo de Mi Biblioteca',
    UTI: 'public.json',
  });

  return { ok: true, mensaje: `${total} registros exportados` };
}

function esBackupValido(obj: unknown): obj is BackupFile {
  if (!obj || typeof obj !== 'object') return false;
  const b = obj as Partial<BackupFile>;
  return (
    b.app === 'mi-biblioteca' &&
    typeof b.version === 'number' &&
    !!b.data &&
    Array.isArray(b.data.books) &&
    Array.isArray(b.data.animes) &&
    Array.isArray(b.data.mangas)
  );
}

// Las portadas se guardan como rutas locales (file://). Tras reinstalar la app
// esas rutas dejan de existir, así que las anulamos para que el botón
// "Descargar portadas" las vuelva a bajar desde la API.
function limpiarPortadasRotas(animes: Record<string, unknown>[]): void {
  for (const a of animes) {
    const uri = a.imagen_url;
    if (typeof uri !== 'string' || !uri) continue;
    try {
      if (!new File(uri).exists) a.imagen_url = null;
    } catch {
      a.imagen_url = null;
    }
  }
}

async function insertarFilas(
  db: Awaited<ReturnType<typeof getDatabase>>,
  tabla: Tabla,
  filas: Record<string, unknown>[]
): Promise<void> {
  for (const fila of filas) {
    const cols = Object.keys(fila);
    if (cols.length === 0) continue;
    const placeholders = cols.map(() => '?').join(', ');
    const values = cols.map((c) => fila[c] as string | number | null);
    await db.runAsync(
      `INSERT OR REPLACE INTO ${tabla} (${cols.join(', ')}) VALUES (${placeholders})`,
      values
    );
  }
}

/**
 * Permite elegir un archivo JSON de respaldo y restaura toda la información.
 * REEMPLAZA los datos actuales por los del respaldo.
 */
export async function importarDatos(): Promise<{ ok: boolean; mensaje: string }> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (picked.canceled || !picked.assets?.[0]) {
    return { ok: false, mensaje: 'Importación cancelada' };
  }

  let parsed: unknown;
  try {
    const contenido = await FileSystem.readAsStringAsync(picked.assets[0].uri);
    parsed = JSON.parse(contenido);
  } catch {
    return { ok: false, mensaje: 'No se pudo leer el archivo' };
  }

  if (!esBackupValido(parsed)) {
    return { ok: false, mensaje: 'El archivo no es un respaldo válido de Mi Biblioteca' };
  }

  limpiarPortadasRotas(parsed.data.animes);

  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const tabla of TABLES) {
      await db.runAsync(`DELETE FROM ${tabla}`);
      await insertarFilas(db, tabla, parsed.data[tabla]);
    }
  });

  const total =
    parsed.data.books.length + parsed.data.animes.length + parsed.data.mangas.length;

  return { ok: true, mensaje: `${total} registros restaurados` };
}
