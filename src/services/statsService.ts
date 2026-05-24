import { Book, Stats } from '@/types';

export function calculateStats(books: Book[]): Stats {
  const fisicos = books.filter((b) => b.formato !== 'digital');
  const total = fisicos.length;
  const tengo = fisicos.filter((b) => b.tengo).length;
  const faltan = total - tengo;
  const porcentaje = total > 0 ? Math.round((tengo / total) * 100) : 0;
  const autoresUnicos = new Set(fisicos.map((b) => b.autor.trim()).filter(Boolean)).size;

  return { total, tengo, faltan, porcentaje, autoresUnicos };
}

export function topAutores(books: Book[], limit = 5): { autor: string; cuenta: number }[] {
  const counts = new Map<string, number>();
  for (const b of books) {
    if (!b.autor) continue;
    counts.set(b.autor, (counts.get(b.autor) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([autor, cuenta]) => ({ autor, cuenta }))
    .sort((a, b) => b.cuenta - a.cuenta)
    .slice(0, limit);
}

export interface MesLectura {
  mes: string;
  label: string;
  count: number;
}

const MESES_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

export function lecturasPorMes(books: Book[]): MesLectura[] {
  const counts = new Map<string, number>();
  for (const b of books) {
    if (b.leido && b.leido_en) {
      counts.set(b.leido_en, (counts.get(b.leido_en) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([mes, count]) => {
      const [year, month] = mes.split('-');
      const mesIdx = parseInt(month, 10) - 1;
      const label = `${MESES_ES[mesIdx] ?? mes} ${year}`;
      return { mes, label, count };
    })
    .sort((a, b) => a.mes.localeCompare(b.mes));
}

export function formatMesLargo(mes: string): string {
  const [year, month] = mes.split('-');
  const mesIdx = parseInt(month, 10) - 1;
  return `${MESES_ES[mesIdx] ?? mes} ${year}`;
}

export function librosLeidosPorMes(books: Book[], mes: string): Book[] {
  return books
    .filter((b) => b.leido && b.leido_en === mes)
    .sort((a, b) => a.titulo.localeCompare(b.titulo));
}
