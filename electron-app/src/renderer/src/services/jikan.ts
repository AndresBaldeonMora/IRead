import type { AnimeTipo } from '@/types'

const JIKAN_BASE = 'https://api.jikan.moe/v4'

export interface JikanResult {
  malId: number
  titulo: string
  tipo: AnimeTipo
  eps: number
  anio: number
  imageUrl: string | null
}

interface JikanRawAnime {
  mal_id: number
  title: string
  title_english: string | null
  type: string | null
  episodes: number | null
  year: number | null
  aired?: { from: string | null }
  images: {
    jpg?: { image_url?: string; large_image_url?: string }
    webp?: { image_url?: string; large_image_url?: string }
  }
}

function mapTipo(type: string | null): AnimeTipo {
  switch ((type ?? '').toLowerCase()) {
    case 'movie': return 'pelicula'
    case 'ova':
    case 'ona':
    case 'special': return 'ova'
    default: return 'serie'
  }
}

function mapResult(raw: JikanRawAnime): JikanResult {
  const img =
    raw.images?.jpg?.large_image_url ||
    raw.images?.jpg?.image_url ||
    raw.images?.webp?.large_image_url ||
    null
  const anio =
    raw.year ??
    (raw.aired?.from ? new Date(raw.aired.from).getFullYear() : 0) ??
    0
  return {
    malId: raw.mal_id,
    titulo: raw.title_english || raw.title,
    tipo: mapTipo(raw.type),
    eps: raw.episodes ?? 0,
    anio: Number.isFinite(anio) ? anio : 0,
    imageUrl: img,
  }
}

export async function searchAnime(query: string, signal?: AbortSignal): Promise<JikanResult[]> {
  const q = query.trim()
  if (q.length < 3) return []
  const url = `${JIKAN_BASE}/anime?q=${encodeURIComponent(q)}&limit=8&sfw=true&order_by=popularity`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Jikan ${res.status}`)
  const json = (await res.json()) as { data: JikanRawAnime[] }
  return (json.data ?? []).map(mapResult)
}
