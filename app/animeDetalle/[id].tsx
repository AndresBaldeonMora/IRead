import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { AnimeEstado } from '@/types';
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme';
import { useAnimesStore } from '@/store/animes.store';
import { AnimeCover, ProgressBar, StatusChip } from '@/components/anime/AnimePrimitives';

export default function AnimeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const anime = useAnimesStore((s) => s.animes.find((a) => a.id === id));
  const updateAnime = useAnimesStore((s) => s.updateAnime);
  const deleteAnime = useAnimesStore((s) => s.deleteAnime);
  const advanceEp = useAnimesStore((s) => s.advanceEp);

  const [notas, setNotas] = useState(anime?.notas ?? '');

  useEffect(() => {
    setNotas(anime?.notas ?? '');
  }, [anime?.id]);

  if (!anime) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: ANIME.bg }}>
        <StatusBar style="light" />
        <View style={styles.empty}>
          <Text style={{ color: ANIME.text }}>Anime no encontrado</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: ANIME.cyan, marginTop: 8 }}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const pct = anime.eps ? Math.round((anime.vistos / anime.eps) * 100) : 0;

  const handleDelete = () => {
    Alert.alert('Eliminar anime', `¿Eliminar "${anime.titulo}" de la lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteAnime(anime.id);
          router.back();
        },
      },
    ]);
  };

  const saveNotas = () => {
    if (notas !== (anime.notas ?? '')) {
      updateAnime(anime.id, { notas: notas.trim() || null });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ANIME.bg }} edges={['top']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <ChevronLeft size={22} color={ANIME.text} />
          </Pressable>
          <Text style={[styles.idTag, { color: anime.color }]}>ID·{anime.id.slice(-3).toUpperCase()}</Text>
        </View>

        <View style={styles.heroRow}>
          <AnimeCover anime={anime} w={112} h={156} glyph={false} />
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={styles.chipRow}>
              <StatusChip status={anime.estado} />
              {anime.serie === 'emision' && (
                <Text style={styles.emision}>● EMISIÓN</Text>
              )}
            </View>
            <Text style={styles.titulo}>{anime.titulo}</Text>
            <Text style={styles.estudio}>
              {anime.tipo === 'pelicula' ? 'Película' : anime.tipo === 'ova' ? 'OVA' : `Temporada ${anime.temporada}`} · {anime.anio}
            </Text>
          </View>
        </View>

        {/* progress block */}
        <View style={styles.block}>
          <View style={styles.blockTop}>
            <View>
              <Text style={styles.epsLabel}>EPISODIOS</Text>
              <Text style={styles.epsValue}>
                {anime.vistos}
                <Text style={{ color: ANIME.textSoft, fontWeight: '500' }}>/{anime.eps}</Text>
              </Text>
            </View>
            <Text style={[styles.pct, { color: anime.color }]}>{pct}%</Text>
          </View>
          <ProgressBar value={anime.vistos} total={anime.eps} color={anime.color} thick={6} />
          <View style={styles.epBtns}>
            <Pressable
              onPress={() => advanceEp(anime.id, -1)}
              disabled={anime.vistos <= 0}
              style={[styles.epBtnMinus, { opacity: anime.vistos <= 0 ? 0.4 : 1 }]}
            >
              <Text style={{ color: ANIME.text, fontWeight: '700', fontSize: 13 }}>– Episodio</Text>
            </Pressable>
            <Pressable
              onPress={() => advanceEp(anime.id, 1)}
              disabled={anime.vistos >= anime.eps}
              style={[
                styles.epBtnPlus,
                { backgroundColor: anime.color, opacity: anime.vistos >= anime.eps ? 0.4 : 1 },
              ]}
            >
              <Text style={{ color: '#0E0B1A', fontWeight: '800', fontSize: 13 }}>
                + Marcar episodio visto
              </Text>
            </Pressable>
          </View>
        </View>

        {/* status selector */}
        <View style={{ paddingHorizontal: 22, marginTop: 22 }}>
          <Text style={styles.metaEyebrow}>// CAMBIAR ESTADO</Text>
          <View style={styles.statusGrid}>
            {(Object.keys(ANIME_STATUS) as AnimeEstado[]).map((k) => {
              const s = ANIME_STATUS[k];
              const active = anime.estado === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => updateAnime(anime.id, { estado: k })}
                  style={[
                    styles.statusBtn,
                    active
                      ? { backgroundColor: `${s.glow}1f`, borderColor: s.glow }
                      : { backgroundColor: ANIME.surface, borderColor: ANIME.line },
                  ]}
                >
                  <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: s.glow }} />
                  <Text style={{ color: active ? s.glow : ANIME.text, fontWeight: '700', fontSize: 13 }}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* meta rows */}
        <View style={{ paddingHorizontal: 22, marginTop: 22 }}>
          <View style={styles.metaCard}>
            <MetaRow k="TIPO" v={anime.tipo === 'pelicula' ? 'Película' : anime.tipo === 'ova' ? 'OVA' : 'Serie'} />
            {anime.tipo === 'serie' && <MetaRow k="TEMPORADA" v={`T${anime.temporada}`} />}
            <MetaRow k="AÑO" v={String(anime.anio)} />
            <MetaRow
              k="SERIE"
              v={anime.serie === 'emision' ? 'En emisión' : 'Finalizada'}
              color={anime.serie === 'emision' ? ANIME.lime : ANIME.text}
            />
            <MetaRow k="EPISODIOS" v={`${anime.eps} totales`} last />
          </View>
        </View>

        {/* notes */}
        <View style={{ paddingHorizontal: 22, marginTop: 22 }}>
          <Text style={styles.metaEyebrow}>// OBSERVACIONES</Text>
          <TextInput
            value={notas}
            onChangeText={setNotas}
            onBlur={saveNotas}
            placeholder="Escribe tus impresiones, citas, episodios favoritos…"
            placeholderTextColor={ANIME.textSoft}
            multiline
            style={styles.notes}
          />
        </View>

        {/* delete */}
        <View style={{ paddingHorizontal: 22, marginTop: 22 }}>
          <Pressable onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={{ color: ANIME.magenta, fontWeight: '700', fontSize: 13 }}>
              Eliminar de la lista
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MetaRow({ k, v, color, last }: { k: string; v: string; color?: string; last?: boolean }) {
  return (
    <View
      style={[
        styles.metaRow,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ANIME.line },
      ]}
    >
      <Text style={styles.metaKey}>{k}</Text>
      <Text style={[styles.metaVal, { color: color ?? ANIME.text }]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idTag: { fontFamily: MONO, fontSize: 10, letterSpacing: 2 },
  heroRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-end', paddingHorizontal: 22, paddingTop: 20, paddingBottom: 22 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  emision: { fontFamily: MONO, fontSize: 9, color: ANIME.lime, letterSpacing: 1, textTransform: 'uppercase' },
  titulo: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, color: ANIME.text, lineHeight: 26 },
  estudio: { marginTop: 6, fontSize: 13, color: ANIME.textSoft },

  block: {
    marginHorizontal: 22,
    padding: 16,
    backgroundColor: ANIME.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    borderRadius: 14,
  },
  blockTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 },
  epsLabel: { fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: ANIME.textSoft, textTransform: 'uppercase' },
  epsValue: { marginTop: 4, fontSize: 28, fontWeight: '800', letterSpacing: -0.6, color: ANIME.text },
  pct: { fontFamily: MONO, fontSize: 22, fontWeight: '800' },
  epBtns: { flexDirection: 'row', gap: 8, marginTop: 14 },
  epBtnMinus: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    alignItems: 'center',
  },
  epBtnPlus: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },

  metaEyebrow: { fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: ANIME.textSoft, marginBottom: 10 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: {
    width: '47.5%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  metaCard: {
    backgroundColor: ANIME.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    borderRadius: 14,
    overflow: 'hidden',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 16 },
  metaKey: { fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, color: ANIME.textSoft },
  metaVal: { fontSize: 14, fontWeight: '700' },

  notes: {
    minHeight: 110,
    padding: 14,
    backgroundColor: ANIME.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 21,
    color: ANIME.text,
    textAlignVertical: 'top',
  },
  deleteBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FF2E9255',
    alignItems: 'center',
  },
});
