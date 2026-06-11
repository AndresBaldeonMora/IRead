import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Upload } from 'lucide-react'
import { useBooksStore } from '@/stores/books.store'
import { useColors, useSerifFamily } from '@/stores/theme.store'
import { lecturasPorMes, formatMesLargo, librosLeidosPorMes } from '@/services/statsService'
import MonthlyReadingChart from '@/components/MonthlyReadingChart'
import { exportarDatos, importarDatos } from '@/services/backup'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function PerfilPage() {
  const c = useColors()
  const serif = useSerifFamily()
  const navigate = useNavigate()
  const books = useBooksStore((s) => s.books)

  const [selectedMes, setSelectedMes] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [dialog, setDialog] = useState(false)

  const totalLeidos = useMemo(() => books.filter((b) => b.leido).length, [books])
  const totalDigital = useMemo(() => books.filter((b) => b.formato === 'digital').length, [books])
  const mesData = useMemo(() => lecturasPorMes(books), [books])
  const librosDelMes = useMemo(
    () => selectedMes ? librosLeidosPorMes(books, selectedMes) : [],
    [books, selectedMes]
  )

  const handleExport = async () => {
    setExporting(true)
    setMsg(null)
    try {
      const ok = await exportarDatos()
      if (ok) setMsg({ text: 'Respaldo exportado correctamente', ok: true })
    } catch (e: any) {
      setMsg({ text: `Error al exportar: ${e.message}`, ok: false })
    } finally {
      setExporting(false)
    }
  }

  const handleImport = () => setDialog(true)

  const doImport = async () => {
    setDialog(false)
    setImporting(true)
    setMsg(null)
    try {
      const ok = await importarDatos()
      if (ok) setMsg({ text: 'Datos restaurados correctamente', ok: true })
    } catch (e: any) {
      setMsg({ text: `Error al importar: ${e.message}`, ok: false })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%', background: c.paper }}>
      {dialog && (
        <ConfirmDialog
          message="¿Importar respaldo? Esto reemplazará todos tus datos actuales."
          confirmLabel="Importar"
          danger
          onConfirm={doImport}
          onCancel={() => setDialog(false)}
        />
      )}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '36px 32px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.inkSoft, marginBottom: 6 }}>
            · mi rincón ·
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 36, fontWeight: 500, color: c.wineDeep, margin: 0 }}>
            Tu progreso
          </h1>
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <StatPill value={totalLeidos} label="libros leídos" c={c} serif={serif} accent={c.wine} />
          <StatPill value={totalDigital} label="en digital" c={c} serif={serif} accent={c.inkSoft} />
        </div>

        {/* Monthly chart */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.inkSoft, marginBottom: 12 }}>
            · lecturas por mes ·
          </div>
          <MonthlyReadingChart data={mesData} selectedMes={selectedMes} onSelectMes={setSelectedMes} />
        </div>

        {/* Books of selected month */}
        {selectedMes && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: c.inkSoft, marginBottom: 10, fontFamily: serif, fontStyle: 'italic' }}>
              Leídos en {formatMesLargo(selectedMes)}
            </div>
            {librosDelMes.length === 0 ? (
              <div style={{ fontSize: 14, color: c.inkSoft, fontStyle: 'italic' }}>Sin registros</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {librosDelMes.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => navigate(`/libro/${b.id}`)}
                    style={{
                      background: c.paperCard, borderRadius: 10, padding: '10px 14px',
                      border: `1px solid ${c.rule}`, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', gap: 2,
                    }}
                  >
                    <span style={{ fontFamily: serif, fontSize: 15, color: c.ink }}>{b.titulo}</span>
                    <span style={{ fontSize: 12, color: c.inkSoft }}>{b.autor}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Backup section */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.inkSoft, marginBottom: 14 }}>
            · respaldo ·
          </div>

          {msg && (
            <div style={{
              marginBottom: 14, padding: '10px 14px', borderRadius: 10, fontSize: 13,
              background: msg.ok ? `${c.wine}18` : '#FF2E9218',
              color: msg.ok ? c.wine : '#FF2E92',
              border: `1px solid ${msg.ok ? c.wine + '44' : '#FF2E9244'}`,
            }}>
              {msg.text}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={handleExport} disabled={exporting} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
              background: c.paperCard, border: `1px solid ${c.rule}`,
              color: c.ink, fontSize: 14, textAlign: 'left',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${c.wine}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={18} color={c.wine} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: c.ink }}>Exportar datos</div>
                <div style={{ fontSize: 12, color: c.inkSoft, marginTop: 2 }}>
                  {exporting ? 'Exportando…' : 'Guarda un archivo JSON con todos tus datos'}
                </div>
              </div>
            </button>

            <button onClick={handleImport} disabled={importing} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
              background: c.paperCard, border: `1px solid ${c.rule}`,
              color: c.ink, fontSize: 14, textAlign: 'left',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${c.gold}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={18} color={c.gold} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: c.ink }}>Importar respaldo</div>
                <div style={{ fontSize: 12, color: c.inkSoft, marginTop: 2 }}>
                  {importing ? 'Importando…' : 'Restaura datos desde un archivo de respaldo'}
                </div>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

function StatPill({ value, label, c, serif, accent }: {
  value: number; label: string; c: any; serif: string; accent: string
}) {
  return (
    <div style={{
      padding: '14px 20px', borderRadius: 14, background: c.paperCard,
      border: `1px solid ${c.rule}`, display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 500, color: accent, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: c.inkSoft }}>
        {label}
      </span>
    </div>
  )
}
