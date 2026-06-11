import { Book, Stats } from '@/types'

const MESES_LARGO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export function formatMesLargo(mes: string): string {
  const [year, month] = mes.split('-')
  return `${MESES_LARGO[parseInt(month, 10) - 1] ?? mes} ${year}`
}

export function librosLeidosPorMes(books: Book[], mes: string): Book[] {
  return books.filter((b) => b.leido && b.leido_en === mes)
}

export function calculateStats(books: Book[]): Stats {
  const fisicos = books.filter((b) => b.formato !== 'digital')
  const total = fisicos.length
  const tengo = fisicos.filter((b) => b.tengo).length
  const faltan = total - tengo
  const porcentaje = total > 0 ? Math.round((tengo / total) * 100) : 0
  const autoresUnicos = new Set(fisicos.map((b) => b.autor.trim()).filter(Boolean)).size
  const leidos = books.filter((b) => b.leido).length
  return { total, tengo, faltan, porcentaje, autoresUnicos, leidos }
}

const MESES_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export interface MesLectura { mes: string; label: string; count: number }

export function lecturasPorMes(books: Book[]): MesLectura[] {
  const counts = new Map<string, number>()
  for (const b of books) {
    if (b.leido && b.leido_en) counts.set(b.leido_en, (counts.get(b.leido_en) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([mes, count]) => {
      const [year, month] = mes.split('-')
      const label = `${MESES_ES[parseInt(month, 10) - 1] ?? mes} ${year}`
      return { mes, label, count }
    })
    .sort((a, b) => a.mes.localeCompare(b.mes))
}
