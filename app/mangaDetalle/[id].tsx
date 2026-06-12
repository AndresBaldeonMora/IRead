import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useAppAlert } from '@/components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { MangaEstado } from '@/types';
import { MANGA, MANGA_STATUS, hardShadow } from '@/utils/mangaTheme';
import { useMangasStore } from '@/store/mangas.store';
import { MangaCover, MProgressBar, MStatusBadge, TypeBadge, Screentone } from '@/components/manga/MangaPrimitives';

export default function MangaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const manga = useMangasStore((s) => s.mangas.find((m) => m.id === id));
  const updateManga = useMangasStore((s) => s.updateManga);
  const deleteManga = useMangasStore((s) => s.deleteManga);
  const advanceManga = useMangasStore((s) => s.advanceManga);

  const [notas, setNotas] = useState(manga?.notas ?? '');
  const { showAlert, AlertNode } = useAppAlert();

  useEffect(() => {
    setNotas(manga?.notas ?? '');
  }, [manga?.id]);

  if (!manga) {
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient colors={[MANGA.bgTop, MANGA.bgBottom]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.emptyWrap}>
          <StatusBar style="dark" />
          <Text style={{ color: MANGA.ink, fontWeight: '700' }}>Manga no encontrado</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: MANGA.terracotta, marginTop: 8, fontWeight: '700' }}>Volver</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  const m = manga;
  const unitShort = m.unidad === 'tomo' ? 'TOMO' : 'CAP';
  const unitWord = m.unidad === 'tomo' ? 'Tomo' : 'Capítulo';
  const pct = m.total ? Math.round((m.leidos / m.total) * 100) : 0;

  const handleDelete = () => {
    showAlert({
      title: 'Eliminar manga',
      message: `¿Eliminar "${m.titulo}" de la lista?`,
      icon: '🗑️',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteManga(m.id);
            router.back();
          },
        },
      ],
    });
  };

  const saveNotas = () => {
    if (notas !== (m.notas ?? '')) {
      updateManga(m.id, { notas: notas.trim() || null });
    }
  };

  const serieLabel =
    m.serie === 'serializacion' ? 'En serialización' : m.serie === 'finalizada' ? 'Finalizada' : 'En pausa';

  return (
    <View style={{ flex: 1 }}>
      {AlertNode}
      <LinearGradient colors={[MANGA.bgTop, MANGA.bgBottom]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          {/* hero */}
          <View style={styles.hero}>
            <Screentone opacity={0.04} />
            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
                <ChevronLeft size={20} color={MANGA.ink} strokeWidth={2.4} />
              </Pressable>
              <View style={styles.idTag}>
                <Text style={styles.idTagText}>#{String(m.id).slice(-3).toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.heroRow}>
              <MangaCover manga={m} w={112} h={156} />
              <View style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
                <View style={styles.chipRow}>
                  <MStatusBadge status={m.estado} />
                  <TypeBadge tipo={m.tipo} />
                </View>
                <Text style={styles.titulo}>{m.titulo}</Text>
                <Text style={styles.autor}>{m.autor} · {m.anio}</Text>
              </View>
            </View>

            {/* progress panel */}
            <View style={styles.progressPanel}>
              <View style={styles.progressTop}>
                <View>
                  <Text style={styles.epsLabel}>{unitShort}S LEÍDOS</Text>
                  <Text style={styles.epsValue}>
                    {m.leidos}
                    <Text style={{ color: MANGA.brown, fontWeight: '600' }}>/{m.total}</Text>
                  </Text>
                </View>
                <View style={[styles.pctTag, { backgroundColor: m.color }]}>
                  <Text style={styles.pctText}>{pct}%</Text>
                </View>
              </View>
              <MProgressBar value={m.leidos} total={m.total} color={m.color} thick={8} />
              <View style={styles.epBtns}>
                <Pressable
                  onPress={() => advanceManga(m.id, -1)}
                  disabled={m.leidos <= 0}
                  style={[styles.epBtnMinus, { opacity: m.leidos <= 0 ? 0.4 : 1 }]}
                >
                  <Text style={styles.epBtnMinusText}>− {unitShort}</Text>
                </Pressable>
                <Pressable
                  onPress={() => advanceManga(m.id, 1)}
                  disabled={m.leidos >= m.total}
                  style={[
                    styles.epBtnPlus,
                    m.leidos >= m.total ? { opacity: 0.5 } : hardShadow(2, 2),
                  ]}
                >
                  <Text style={styles.epBtnPlusText}>+ {unitWord} leído</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* status selector */}
          <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
            <View style={styles.statusGrid}>
              {(Object.keys(MANGA_STATUS) as MangaEstado[]).map((k) => {
                const s = MANGA_STATUS[k];
                const active = m.estado === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => updateManga(m.id, { estado: k })}
                    style={[
                      styles.statusBtn,
                      active ? { backgroundColor: s.bg, ...hardShadow(2, 2) } : { backgroundColor: MANGA.paper },
                    ]}
                  >
                    <View
                      style={{
                        width: 9,
                        height: 9,
                        backgroundColor: active ? s.text : s.bg,
                        borderWidth: 1,
                        borderColor: active ? s.text : MANGA.ink,
                      }}
                    />
                    <Text style={{ color: active ? s.text : MANGA.ink, fontWeight: '800', fontSize: 13 }}>
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* meta rows */}
          <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
            <View style={styles.metaCard}>
              <MetaRow k="AUTOR" v={m.autor} />
              <MetaRow k="AÑO" v={String(m.anio)} />
              <MetaRow k="FORMATO" v={m.tipo === 'manwha' ? 'Manwha (Corea)' : 'Manga (Japón)'} />
              <MetaRow
                k="SERIE"
                v={serieLabel}
                color={m.serie === 'serializacion' ? MANGA.terracotta : MANGA.ink}
              />
              <MetaRow k={`${unitShort}S`} v={`${m.total} totales`} last />
            </View>
          </View>

          {/* notes */}
          <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
            <TextInput
              value={notas}
              onChangeText={setNotas}
              onBlur={saveNotas}
              placeholder="Escribe tus impresiones, citas, arcos favoritos…"
              placeholderTextColor={MANGA.brown}
              multiline
              style={styles.notes}
            />
          </View>

          {/* delete */}
          <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
            <Pressable onPress={handleDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Eliminar de la lista</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MetaRow({ k, v, color, last }: { k: string; v: string; color?: string; last?: boolean }) {
  return (
    <View style={[styles.metaRow, !last && { borderBottomWidth: 1.5, borderBottomColor: MANGA.ink }]}>
      <Text style={styles.metaKey}>{k}</Text>
      <Text style={[styles.metaVal, { color: color ?? MANGA.ink }]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { paddingTop: 8, overflow: 'hidden' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: MANGA.paper,
    borderWidth: 2,
    borderColor: MANGA.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...hardShadow(2, 2),
  },
  idTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
    backgroundColor: MANGA.gold,
  },
  idTagText: { fontSize: 10, fontWeight: '800', color: MANGA.ink, letterSpacing: 2 },

  heroRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-end', paddingHorizontal: 22, paddingTop: 20, paddingBottom: 20 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  titulo: { fontSize: 22, lineHeight: 24, fontWeight: '800', letterSpacing: -0.4, color: MANGA.ink },
  autor: { marginTop: 6, fontSize: 13, fontWeight: '600', color: MANGA.brown },

  progressPanel: {
    marginHorizontal: 22,
    marginBottom: 20,
    padding: 16,
    backgroundColor: MANGA.paper,
    borderWidth: 2,
    borderColor: MANGA.ink,
    ...hardShadow(3, 3),
  },
  progressTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 },
  epsLabel: { fontSize: 10, letterSpacing: 1.8, color: MANGA.brown, textTransform: 'uppercase', fontWeight: '800' },
  epsValue: { marginTop: 4, fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: MANGA.ink },
  pctTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
    transform: [{ rotate: '2deg' }],
    ...hardShadow(2, 2),
  },
  pctText: { color: MANGA.paper, fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  epBtns: { flexDirection: 'row', gap: 8, marginTop: 14 },
  epBtnMinus: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: MANGA.paper,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
  },
  epBtnMinusText: { color: MANGA.ink, fontWeight: '800', fontSize: 13, letterSpacing: 0.4 },
  epBtnPlus: {
    flex: 2,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: MANGA.gold,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
  },
  epBtnPlusText: { color: MANGA.ink, fontWeight: '800', fontSize: 13, letterSpacing: 0.4 },

  metaEyebrow: { fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: MANGA.brown, marginBottom: 10, fontWeight: '800' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: {
    width: '47.5%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  metaCard: {
    backgroundColor: MANGA.paper,
    borderWidth: 2,
    borderColor: MANGA.ink,
    ...hardShadow(3, 3),
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 16 },
  metaKey: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4, color: MANGA.brown, textTransform: 'uppercase' },
  metaVal: { fontSize: 14, fontWeight: '700' },

  notes: {
    minHeight: 110,
    padding: 14,
    backgroundColor: MANGA.paper,
    borderWidth: 2,
    borderColor: MANGA.ink,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    color: MANGA.ink,
    textAlignVertical: 'top',
    shadowColor: MANGA.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  deleteBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: MANGA.terracotta,
    backgroundColor: 'transparent',
  },
  deleteText: { color: MANGA.terracotta, fontWeight: '800', fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase' },
});
