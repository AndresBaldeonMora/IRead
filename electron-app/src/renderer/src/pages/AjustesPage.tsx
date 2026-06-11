import { useState, useRef } from 'react'
import { Check, Download, Upload, FileSpreadsheet } from 'lucide-react'
import { useThemeStore, useColors, useSerifFamily } from '@/stores/theme.store'
import type { PaletteKey, SerifKey } from '@/types'
import { PALETTES, SERIFS } from '@/utils/themes'
import { exportarDatos, importarDatos } from '@/services/backup'
import { useBooksStore } from '@/stores/books.store'
import * as XLSX from 'xlsx'

export default function AjustesPage() {
  const c        = useColors()
  const serif    = useSerifFamily()
  const palette  = useThemeStore((s) => s.palette)
  const serifKey = useThemeStore((s) => s.serif)
  const setPalette = useThemeStore((s) => s.setPalette)
  const setSerif   = useThemeStore((s) => s.setSerif)
  const addBook  = useBooksStore((s) => s.addBook)

  const books = useBooksStore((s) => s.books)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [importandoExcel, setImportandoExcel] = useState(false)
  const [duplicados, setDuplicados] = useState<{ excel: string; existente: string }[]>([])
  const excelInputRef = useRef<HTMLInputElement>(null)

  const mostrar = (msg: string) => {
    setMensaje(msg)
    setTimeout(() => setMensaje(null), 5000)
  }

  const handleExportar = async () => {
    const ok = await exportarDatos()
    if (ok) mostrar('Respaldo guardado correctamente')
  }

  const handleImportar = async () => {
    try {
      const ok = await importarDatos()
      if (ok) mostrar('Datos restaurados correctamente')
    } catch (e: unknown) {
      mostrar((e as Error).message ?? 'Error al importar')
    }
  }

  const norm = (s: string) => s.toLowerCase().replace(/[^a-záéíóúüñ0-9]/gi, ' ').replace(/\s+/g, ' ').trim()

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImportandoExcel(true)
    setDuplicados([])
    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' }) as unknown[][]

      let headerRow = -1
      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const cells = (rows[i] as unknown[]).map((h) => String(h).trim().toLowerCase())
        if (cells.some((h) => h.includes('libro') || h.includes('titulo') || h.includes('título'))) {
          headerRow = i
          break
        }
      }
      if (headerRow < 0) { mostrar('No se encontraron encabezados (Libro/Titulo) en las primeras 10 filas'); return }

      const headers = (rows[headerRow] as unknown[]).map((h) => String(h).trim().toLowerCase())
      const col = (kw: string) => headers.findIndex((h) => h.includes(kw))

      const iLibro     = col('libro') >= 0 ? col('libro') : col('titulo')
      const iAutor     = col('autor')
      const iEditorial = col('editorial')
      const iEdicion   = col('edicion')
      const iIdioma    = col('idioma')
      const iTengo     = col('tengo')
      const iFormato   = col('formato')

      const existingNorm = books.map((b) => ({
        titulo:    norm(b.titulo),
        autor:     norm(b.autor ?? ''),
        editorial: norm(b.editorial ?? ''),
        edicion:   norm(b.edicion ?? ''),
        idioma:    norm(b.idioma ?? ''),
        tituloRaw: b.titulo,
      }))

      const encontrados: { excel: string; existente: string }[] = []
      let count = 0

      for (let r = headerRow + 1; r < rows.length; r++) {
        const row = rows[r] as unknown[]
        const titulo = iLibro >= 0 ? String(row[iLibro] ?? '').trim() : ''
        if (!titulo) continue

        const tNorm = {
          titulo:    norm(titulo),
          autor:     norm(iAutor >= 0     ? String(row[iAutor]     ?? '').trim() : ''),
          editorial: norm(iEditorial >= 0 ? String(row[iEditorial] ?? '').trim() : ''),
          edicion:   norm(iEdicion >= 0   ? String(row[iEdicion]   ?? '').trim() : ''),
          idioma:    norm(iIdioma >= 0    ? String(row[iIdioma]    ?? '').trim() : ''),
        }

        // Duplicado exacto: los 5 campos coinciden → saltar
        const exacto = existingNorm.find((b) =>
          b.titulo    === tNorm.titulo &&
          b.autor     === tNorm.autor &&
          b.editorial === tNorm.editorial &&
          b.edicion   === tNorm.edicion &&
          b.idioma    === tNorm.idioma
        )
        if (exacto) {
          encontrados.push({ excel: titulo, existente: exacto.tituloRaw })
          continue
        }

        // Similar (mismo título, algún campo distinto) → avisar pero importar
        const similar = existingNorm.find((b) => b.titulo === tNorm.titulo)
        if (similar) {
          encontrados.push({ excel: titulo, existente: similar.tituloRaw })
        }

        // Colección según "Lo tengo"
        const tengoRaw = iTengo >= 0 ? String(row[iTengo] ?? '').trim().toLowerCase() : ''
        const tengo    = tengoRaw === 'si' || tengoRaw === 'sí' || tengoRaw === 'yes' || tengoRaw === 's'
        const coleccion = tengo ? 'mi_biblioteca' : 'deseos'

        // Formato
        const formatoRaw = iFormato >= 0 ? String(row[iFormato] ?? '').trim().toLowerCase() : ''
        const formato = formatoRaw.includes('digital') ? 'digital' : formatoRaw.includes('f') ? 'fisico' : null

        await addBook({
          titulo,
          autor:      iAutor >= 0     ? String(row[iAutor]     ?? '').trim() : '',
          editorial:  iEditorial >= 0 ? String(row[iEditorial] ?? '').trim() || null : null,
          edicion:    iEdicion >= 0   ? String(row[iEdicion]   ?? '').trim() || null : null,
          idioma:     iIdioma >= 0    ? String(row[iIdioma]    ?? '').trim() || null : null,
          coleccion,
          tengo,
          generos: [], leido: false, leido_en: null,
          fecha_salida: null, formato, notas: null, imagen_url: null,
        })
        count++
      }

      if (encontrados.length > 0) setDuplicados(encontrados)
      mostrar(`${count} libro${count !== 1 ? 's' : ''} importado${count !== 1 ? 's' : ''}${encontrados.length > 0 ? ` · ${encontrados.length} aviso${encontrados.length !== 1 ? 's' : ''} abajo` : ''}`)
    } catch (err) {
      console.error(err)
      mostrar('Error al leer el archivo Excel')
    } finally {
      setImportandoExcel(false)
    }
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: c.paper }}>
      <div style={{ paddingBottom: 40 }}>

        {/* Header */}
        <div style={{ padding: '20px 22px 8px' }}>
          <h1 style={{ fontFamily: serif, fontSize: 30, fontWeight: 500, color: c.wineDeep, margin: 0 }}>
            Ajustes
          </h1>
        </div>

        {/* Datos */}
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, textAlign: 'center', padding: '12px 22px 0' }}>
          · datos ·
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 22px 0' }}>
          <button onClick={handleExportar} style={btnStyle(c)}>
            <Download size={18} color={c.wineDeep} />
            <span style={{ fontFamily: serif, fontSize: 16, color: c.wineDeep }}>Exportar respaldo</span>
          </button>
          <button onClick={handleImportar} style={btnStyle(c)}>
            <Upload size={18} color={c.wineDeep} />
            <span style={{ fontFamily: serif, fontSize: 16, color: c.wineDeep }}>Restaurar respaldo</span>
          </button>
          <input ref={excelInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportExcel} />
          <button onClick={() => excelInputRef.current?.click()} disabled={importandoExcel} style={btnStyle(c)}>
            <FileSpreadsheet size={18} color={c.wineDeep} />
            <span style={{ fontFamily: serif, fontSize: 16, color: c.wineDeep }}>
              {importandoExcel ? 'Importando…' : 'Importar desde Excel'}
            </span>
          </button>
          {mensaje && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, background: c.paperCard,
              border: `1px solid ${c.wine}`, fontSize: 13, color: c.wineDeep, textAlign: 'center',
            }}>
              {mensaje}
            </div>
          )}
          {duplicados.length > 0 && (
            <div style={{
              borderRadius: 12, background: c.paperCard, border: `1px solid ${c.roseSoft}`,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: c.wineDeep, marginBottom: 8 }}>
                ⚠ Posibles duplicados detectados ({duplicados.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {duplicados.map((d, i) => (
                  <div key={i} style={{ fontSize: 12, color: c.ink }}>
                    <span style={{ color: c.wineDeep, fontWeight: 500 }}>{d.excel}</span>
                    <span style={{ color: c.inkSoft }}> → ya existe: </span>
                    <span style={{ fontStyle: 'italic' }}>{d.existente}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setDuplicados([])}
                style={{ marginTop: 10, fontSize: 11, color: c.inkSoft, background: 'none', cursor: 'pointer', padding: 0 }}
              >
                Cerrar aviso
              </button>
            </div>
          )}
        </div>

        <div style={{ borderBottom: `0.5px solid ${c.rule}`, margin: '24px 22px 0' }} />

        {/* Apariencia */}
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, textAlign: 'center', padding: '24px 22px 0' }}>
          · apariencia ·
        </div>

        {/* Paleta */}
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, textAlign: 'center', padding: '12px 22px 0' }}>
          · paleta ·
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 22px 0' }}>
          {(Object.keys(PALETTES) as PaletteKey[]).map((k) => {
            const p = PALETTES[k]
            const active = palette === k
            return (
              <button
                key={k}
                onClick={() => setPalette(k)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: 14, borderRadius: 14,
                  background: c.paperCard,
                  border: `1.5px solid ${active ? c.wine : c.rule}`,
                  cursor: 'pointer', textAlign: 'left', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', gap: -8 }}>
                  {[p.paper, p.rose, p.wine, p.gold].map((col, i) => (
                    <div key={i} style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: col, border: '0.5px solid rgba(0,0,0,0.08)',
                      marginLeft: i > 0 ? -8 : 0,
                    }} />
                  ))}
                </div>
                <span style={{ fontFamily: serif, fontSize: 18, color: c.wineDeep, flex: 1 }}>{p.label}</span>
                {active && <Check size={20} color={c.wine} />}
              </button>
            )
          })}
        </div>

        {/* Tipografía */}
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.gold, textAlign: 'center', padding: '24px 22px 0' }}>
          · tipografía ·
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 22px 0' }}>
          {(Object.keys(SERIFS) as SerifKey[]).map((k) => {
            const s = SERIFS[k]
            const active = serifKey === k
            return (
              <button
                key={k}
                onClick={() => setSerif(k)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: 14, borderRadius: 14,
                  background: c.paperCard,
                  border: `1.5px solid ${active ? c.wine : c.rule}`,
                  cursor: 'pointer', textAlign: 'left', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontFamily: s.family, fontSize: 18, color: c.wineDeep, flex: 1 }}>{s.label}</span>
                <span style={{ fontFamily: s.family, fontStyle: 'italic', fontSize: 18, color: c.inkSoft }}>Aa Bb Cc</span>
                {active && <Check size={20} color={c.wine} />}
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}

function btnStyle(c: ReturnType<typeof useColors>): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 14,
    background: c.paperCard,
    border: `1.5px solid ${c.rule}`,
    cursor: 'pointer', textAlign: 'left', outline: 'none',
  }
}
