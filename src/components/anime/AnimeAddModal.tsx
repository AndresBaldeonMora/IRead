import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AnimeEstado, AnimeSerie, AnimeTipo } from '@/types';
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme';
import { useAnimesStore } from '@/store/animes.store';
import { searchAnime, cacheCoverImage, JikanResult } from '@/services/jikan';

export function AnimeAddModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const addAnime = useAnimesStore((s) => s.addAnime);
  const updateAnime = useAnimesStore((s) => s.updateAnime);
  const animes = useAnimesStore((s) => s.animes);

  const [titulo, setTitulo] = useState('');
  const [sugerenciasOcultas, setSugerenciasOcultas] = useState(false);
  const [tipo, setTipo] = useState<AnimeTipo>('serie');
  const [temporada, setTemporada] = useState('1');
  const [eps, setEps] = useState('');
  const [vistos, setVistos] = useState('0');
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [serie, setSerie] = useState<AnimeSerie>('emision');
  const [estado, setEstado] = useState<AnimeEstado>('viendo');
  const [guardando, setGuardando] = useState(false);

  // Búsqueda online en Jikan (MyAnimeList)
  const [onlineResults, setOnlineResults] = useState<JikanResult[]>([]);
  const [buscandoOnline, setBuscandoOnline] = useState(false);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);

  // Debounce: busca en Jikan cuando el usuario escribe (mín. 3 chars)
  useEffect(() => {
    const q = titulo.trim();
    if (sugerenciasOcultas || q.length < 3) {
      setOnlineResults([]);
      setBuscandoOnline(false);
      return;
    }
    const controller = new AbortController();
    setBuscandoOnline(true);
    const t = setTimeout(async () => {
      try {
        const results = await searchAnime(q, controller.signal);
        setOnlineResults(results);
      } catch {
        setOnlineResults([]);
      } finally {
        setBuscandoOnline(false);
      }
    }, 500);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [titulo, sugerenciasOcultas]);

  const handleSelectOnline = (r: JikanResult) => {
    setTitulo(r.titulo);
    setTipo(r.tipo);
    if (r.eps > 0) setEps(String(r.eps));
    if (r.anio > 0) setAnio(String(r.anio));
    setImagenUrl(r.imageUrl);
    setSugerenciasOcultas(true);
    setOnlineResults([]);
  };

  const canSave = titulo.trim() && (tipo === 'pelicula' || parseInt(eps, 10) > 0);
  const accent = ANIME_STATUS[estado].glow;

  // Sugerencias: títulos únicos que coincidan con lo escrito (mín. 3 chars)
  const sugerencias = useMemo(() => {
    if (sugerenciasOcultas) return [];
    const q = titulo.trim().toLowerCase();
    if (q.length < 3) return [];
    const seen = new Set<string>();
    return animes
      .filter((a) => {
        const t = a.titulo.toLowerCase();
        if (!t.includes(q)) return false;
        if (seen.has(a.titulo)) return false;
        seen.add(a.titulo);
        return true;
      })
      .slice(0, 5);
  }, [titulo, animes, sugerenciasOcultas]);

  const handleSelectSugerencia = (tituloSel: string) => {
    setTitulo(tituloSel);
    setSugerenciasOcultas(true);
    // Calcular siguiente temporada si es serie
    const temporadasExistentes = animes
      .filter((a) => a.titulo === tituloSel && a.tipo === 'serie')
      .map((a) => a.temporada);
    if (temporadasExistentes.length > 0) {
      const maxTemp = Math.max(...temporadasExistentes);
      setTemporada(String(maxTemp + 1));
      setTipo('serie');
    }
  };

  const reset = () => {
    setTitulo('');
    setSugerenciasOcultas(false);
    setTipo('serie');
    setTemporada('1');
    setEps('');
    setVistos('0');
    setAnio(String(new Date().getFullYear()));
    setSerie('emision');
    setEstado('viendo');
    setOnlineResults([]);
    setImagenUrl(null);
  };

  const handleSave = async () => {
    if (!canSave || guardando) return;
    setGuardando(true);
    try {
      const totalEps = tipo === 'pelicula' ? 1 : parseInt(eps, 10);
      const anime = await addAnime({
        titulo: titulo.trim(),
        tipo,
        temporada: parseInt(temporada, 10) || 1,
        eps: totalEps,
        vistos: Math.max(0, Math.min(parseInt(vistos || '0', 10), totalEps)),
        anio: parseInt(anio, 10) || new Date().getFullYear(),
        serie,
        estado,
        color: accent,
        notas: null,
        rating: null,
        imagen_url: null,
      });

      // Descarga y guarda la portada localmente (best-effort, funciona offline una vez cacheada)
      if (imagenUrl) {
        const localUri = await cacheCoverImage(imagenUrl, anime.id);
        if (localUri) await updateAnime(anime.id, { imagen_url: localUri });
      }

      reset();
      onClose();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Nuevo anime</Text>

          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 480 }}>
            {/* Campo título con autocompletado */}
            <View>
              <Label>Título</Label>
              <View style={{ position: 'relative', justifyContent: 'center' }}>
                <TextInput
                  value={titulo}
                  onChangeText={(v) => { setTitulo(v); setSugerenciasOcultas(false); setImagenUrl(null); }}
                  placeholder="Escribe para buscar en MyAnimeList…"
                  placeholderTextColor={ANIME.textSoft}
                  style={styles.input}
                />
                {buscandoOnline && (
                  <ActivityIndicator
                    size="small"
                    color={ANIME.cyan}
                    style={{ position: 'absolute', right: 12 }}
                  />
                )}
              </View>

              {/* Resultados de la API (con portada) */}
              {onlineResults.length > 0 && (
                <View style={styles.onlineBox}>
                  {onlineResults.map((r, i) => (
                    <Pressable
                      key={r.malId}
                      onPress={() => handleSelectOnline(r)}
                      style={[
                        styles.onlineRow,
                        i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: ANIME.line },
                      ]}
                    >
                      {r.imageUrl ? (
                        <Image source={{ uri: r.imageUrl }} style={styles.onlineThumb} resizeMode="cover" />
                      ) : (
                        <View style={[styles.onlineThumb, { backgroundColor: ANIME.surface }]} />
                      )}
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.onlineTitle} numberOfLines={2}>{r.titulo}</Text>
                        <Text style={styles.onlineMeta}>
                          {r.tipo === 'pelicula' ? 'Película' : r.tipo === 'ova' ? 'OVA' : 'Serie'}
                          {r.anio > 0 ? ` · ${r.anio}` : ''}
                          {r.eps > 0 ? ` · ${r.eps} ep` : ''}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {imagenUrl && (
                <View style={styles.coverPreviewRow}>
                  <Image source={{ uri: imagenUrl }} style={styles.coverPreview} resizeMode="cover" />
                  <Text style={styles.coverPreviewText}>Portada seleccionada</Text>
                </View>
              )}

              {sugerencias.length > 0 && (
                <View style={styles.suggestBox}>
                  {sugerencias.map((a, i) => {
                    const temporadasExistentes = animes
                      .filter((x) => x.titulo === a.titulo && x.tipo === 'serie')
                      .map((x) => x.temporada);
                    const nextTemp = temporadasExistentes.length > 0
                      ? Math.max(...temporadasExistentes) + 1
                      : null;
                    return (
                      <Pressable
                        key={a.id}
                        onPress={() => handleSelectSugerencia(a.titulo)}
                        style={[
                          styles.suggestRow,
                          i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: ANIME.line },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suggestTitle} numberOfLines={1}>{a.titulo}</Text>
                          {nextTemp !== null && (
                            <Text style={styles.suggestHint}>
                              Serie · siguiente temporada: {nextTemp}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.suggestArrow}>→</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            <Label>Tipo</Label>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(
                [
                  { v: 'serie', l: 'Serie' },
                  { v: 'pelicula', l: 'Película' },
                  { v: 'ova', l: 'OVA' },
                ] as { v: AnimeTipo; l: string }[]
              ).map((o) => {
                const active = tipo === o.v;
                return (
                  <Pressable
                    key={o.v}
                    onPress={() => setTipo(o.v)}
                    style={[
                      styles.choice,
                      { flex: 1 },
                      active
                        ? { backgroundColor: `${accent}1a`, borderColor: accent }
                        : { borderColor: ANIME.line },
                    ]}
                  >
                    <Text style={{ color: active ? accent : ANIME.textSoft, fontWeight: '700', fontSize: 13 }}>
                      {o.l}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
              {tipo === 'serie' && (
                <Field label="Temporada" value={temporada} onChange={setTemporada} keyboard="numeric" flex />
              )}
              {tipo !== 'pelicula' && (
                <Field label="Eps. totales" value={eps} onChange={setEps} keyboard="numeric" flex />
              )}
              {tipo !== 'pelicula' && (
                <Field label="Eps. vistos" value={vistos} onChange={setVistos} keyboard="numeric" flex />
              )}
              <Field label="Año" value={anio} onChange={setAnio} keyboard="numeric" flex />
            </View>

            <Label>Estado de la serie</Label>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(
                [
                  { v: 'emision', l: 'En emisión', c: ANIME.lime },
                  { v: 'finalizado', l: 'Finalizada', c: '#FFFFFF' },
                ] as { v: AnimeSerie; l: string; c: string }[]
              ).map((o) => {
                const active = serie === o.v;
                return (
                  <Pressable
                    key={o.v}
                    onPress={() => setSerie(o.v)}
                    style={[
                      styles.choice,
                      { flex: 1 },
                      active
                        ? { backgroundColor: `${o.c}1a`, borderColor: o.c }
                        : { borderColor: ANIME.line },
                    ]}
                  >
                    <Text style={{ color: active ? o.c : ANIME.textSoft, fontWeight: '700', fontSize: 13 }}>
                      {o.l}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Label>Tu estado de visualización</Label>
            <View style={styles.grid}>
              {(Object.keys(ANIME_STATUS) as AnimeEstado[]).map((k) => {
                const s = ANIME_STATUS[k];
                const active = estado === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => setEstado(k)}
                    style={[
                      styles.choice,
                      styles.gridItem,
                      active
                        ? { backgroundColor: `${s.glow}1f`, borderColor: s.glow }
                        : { borderColor: ANIME.line },
                    ]}
                  >
                    <View style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: s.glow }} />
                    <Text style={{ color: active ? s.glow : ANIME.textSoft, fontWeight: '700', fontSize: 12 }}>
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <Pressable onPress={onClose} style={[styles.btn, styles.cancel]}>
              <Text style={{ color: ANIME.text, fontWeight: '700', fontSize: 13 }}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!canSave || guardando}
              style={[
                styles.btn,
                { flex: 2, backgroundColor: canSave && !guardando ? accent : 'rgba(255,255,255,0.05)' },
              ]}
            >
              {guardando ? (
                <ActivityIndicator size="small" color="#0E0B1A" />
              ) : (
                <Text style={{ color: canSave ? '#0E0B1A' : ANIME.textSoft, fontWeight: '800', fontSize: 13 }}>
                  Guardar
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function Field({
  label,
  value,
  onChange,
  keyboard,
  flex,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboard?: 'numeric';
  flex?: boolean;
}) {
  return (
    <View style={flex ? { flex: 1 } : undefined}>
      <Label>{label}</Label>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard === 'numeric' ? 'number-pad' : 'default'}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(8,6,18,0.7)' },
  sheet: {
    backgroundColor: ANIME.bg2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 22,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignSelf: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, color: ANIME.text, marginBottom: 12 },
  fieldLabel: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: ANIME.textSoft,
    marginBottom: 6,
    marginTop: 12,
    paddingLeft: 2,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: ANIME.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    borderRadius: 10,
    fontSize: 14,
    color: ANIME.text,
  },
  choice: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: { width: '47.5%' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancel: { borderWidth: StyleSheet.hairlineWidth, borderColor: ANIME.line },
  suggestBox: {
    marginTop: 4,
    backgroundColor: ANIME.surface,
    borderWidth: 1,
    borderColor: ANIME.cyan + '55',
    borderRadius: 10,
    overflow: 'hidden',
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    gap: 10,
  },
  suggestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ANIME.text,
  },
  suggestHint: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 0.8,
    color: ANIME.cyan,
    marginTop: 2,
  },
  suggestArrow: {
    fontSize: 14,
    color: ANIME.cyan,
    fontWeight: '700',
  },
  onlineBox: {
    marginTop: 6,
    backgroundColor: ANIME.surface,
    borderWidth: 1,
    borderColor: ANIME.cyan + '55',
    borderRadius: 10,
    overflow: 'hidden',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 12,
  },
  onlineThumb: {
    width: 40,
    height: 56,
    borderRadius: 6,
    backgroundColor: ANIME.bg2,
  },
  onlineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ANIME.text,
    lineHeight: 18,
  },
  onlineMeta: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 0.6,
    color: ANIME.textSoft,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  coverPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  coverPreview: {
    width: 34,
    height: 48,
    borderRadius: 6,
  },
  coverPreviewText: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 0.8,
    color: ANIME.cyan,
    textTransform: 'uppercase',
  },
});
