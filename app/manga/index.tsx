import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MangaEstado } from '@/types';
import { MANGA, MANGA_STATUS, hardShadow } from '@/utils/mangaTheme';
import { useMangasStore } from '@/store/mangas.store';
import {
  MangaCover,
  MProgressBar,
  Screentone,
  MSectionTitle,
} from '@/components/manga/MangaPrimitives';
import { handleSwitcherScroll } from '@/utils/switcherAnim';

const RANK_COLORS = ['#E8A82C', '#B85042', '#A87B5D', '#5F8B7D'];

export default function MangaDashboard() {
  const router = useRouter();
  const mangas = useMangasStore((s) => s.mangas);

  const data = useMemo(() => {
    const counts: Record<MangaEstado, number> = {
      leyendo: 0,
      completado: 0,
      pausado: 0,
      pendiente: 0,
    };
    let mangaCount = 0;
    let manwhaCount = 0;
    let totalReading = 0;
    const authorMap: Record<string, number> = {};

    for (const m of mangas) {
      counts[m.estado]++;
      if (m.tipo === 'manwha') manwhaCount++;
      else mangaCount++;
      if (m.estado === 'leyendo') totalReading += m.leidos;
      authorMap[m.autor] = (authorMap[m.autor] || 0) + 1;
    }

    const reading = mangas.filter((m) => m.estado === 'leyendo').slice(0, 5);
    const topAuthors = Object.entries(authorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return { counts, mangaCount, manwhaCount, totalReading, reading, topAuthors, readingAll: mangas.filter((m) => m.estado === 'leyendo') };
  }, [mangas]);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={[MANGA.bgTop, MANGA.bgBottom]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 60, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleSwitcherScroll}
          scrollEventThrottle={16}
        >
          {/* HEADER */}
          <View style={{ paddingHorizontal: 4 }}>
            <View style={styles.eyebrowTag}>
              <Text style={styles.eyebrowText}>★ TU COLECCIÓN ★</Text>
            </View>
            <Text style={styles.bigTitle}>
              Mi colección{'\n'}
              <Text style={styles.bigTitleAccent}>de manga</Text>
            </Text>
            <Text style={styles.subtitle}>
              {data.counts.leyendo} leyendo · {data.counts.completado} completados
            </Text>
          </View>

          {/* TOTALS card */}
          <View style={styles.totalsCard}>
            <Screentone opacity={0.05} />
            <View style={styles.cornerPanel}>
              <Text style={styles.cornerPanelText}>RESUMEN</Text>
            </View>
            <Text style={styles.totalsLabel}>Total en biblioteca</Text>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsValue}>{mangas.length}</Text>
              <Text style={styles.totalsUnit}>obras en total</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <SplitCount label="Manga" value={data.mangaCount} isManwha={false} />
              <SplitCount label="Manwha" value={data.manwhaCount} isManwha={true} />
            </View>
          </View>

          {/* STATUS grid */}
          <View style={styles.grid}>
            <StatusTile status="leyendo" value={data.counts.leyendo} />
            <StatusTile status="completado" value={data.counts.completado} />
            <StatusTile status="pausado" value={data.counts.pausado} />
            <StatusTile status="pendiente" value={data.counts.pendiente} />
          </View>

          {/* CONTINUAR LEYENDO */}
          {data.reading.length > 0 && (
            <View style={{ marginTop: 26 }}>
              <MSectionTitle kana="読書中 · ON READ">Continuar leyendo</MSectionTitle>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 8, paddingRight: 18 }}
                style={{ marginHorizontal: -18, paddingHorizontal: 18 }}
              >
                {data.reading.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => router.push({ pathname: '/mangaDetalle/[id]', params: { id: m.id } })}
                    style={styles.heroCard}
                  >
                    <MangaCover manga={m} w={152} h={120} />
                    <View style={{ padding: 12 }}>
                      <Text style={styles.heroTitle} numberOfLines={1}>
                        {m.titulo}
                      </Text>
                      <View style={styles.heroMeta}>
                        <Text style={styles.heroMetaText}>
                          {m.unidad === 'tomo' ? 'TOMO' : 'CAP'} {m.leidos}/{m.total}
                        </Text>
                        <Text style={[styles.heroMetaText, { color: m.color }]}>
                          {Math.round((m.leidos / m.total) * 100)}%
                        </Text>
                      </View>
                      <MProgressBar value={m.leidos} total={m.total} color={m.color} thick={5} />
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* READING TALLY dark card */}
          <View style={styles.tally}>
            <Screentone color={MANGA.paper} opacity={0.08} />
            <Text style={styles.tallyEyebrow}>// EN PROGRESO ACTIVO</Text>
            <View style={styles.tallyRow}>
              <Text style={styles.tallyValue}>{data.totalReading}</Text>
              <Text style={styles.tallyUnit}>tomos/caps leídos</Text>
            </View>
            <Text style={styles.tallyFoot}>
              Distribuidos en {data.readingAll.length}{' '}
              {data.readingAll.length === 1 ? 'obra activa' : 'obras activas'}
            </Text>
          </View>

          {/* TOP CREATORS */}
          {data.topAuthors.length > 0 && (
            <View style={{ marginTop: 26 }}>
              <MSectionTitle kana="作家 · CREATORS">Autores top</MSectionTitle>
              <View style={{ gap: 8 }}>
                {data.topAuthors.map(([author, count], i) => (
                  <View
                    key={author}
                    style={[
                      styles.authorRow,
                      {
                        backgroundColor: i === 0 ? MANGA.ink : MANGA.paper,
                      },
                    ]}
                  >
                    <View style={[styles.authorRank, { backgroundColor: RANK_COLORS[i % 4] }]}>
                      <Text style={styles.authorRankText}>#{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={[styles.authorName, { color: i === 0 ? MANGA.paper : MANGA.ink }]}
                        numberOfLines={1}
                      >
                        {author}
                      </Text>
                      <Text style={[styles.authorCount, { color: i === 0 ? '#E8D9C0' : MANGA.brown }]}>
                        {count} {count === 1 ? 'obra' : 'obras'} en tu lista
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SplitCount({ label, value, isManwha }: { label: string; value: number; isManwha: boolean }) {
  return (
    <View
      style={[
        styles.split,
        {
          backgroundColor: isManwha ? MANGA.sepia : MANGA.panel,
        },
      ]}
    >
      <Text style={[styles.splitLabel, { color: isManwha ? MANGA.paper : MANGA.ink }]}>{label}</Text>
      <Text style={[styles.splitValue, { color: isManwha ? MANGA.paper : MANGA.ink }]}>{value}</Text>
    </View>
  );
}

function StatusTile({ status, value }: { status: MangaEstado; value: number }) {
  const s = MANGA_STATUS[status];
  return (
    <View style={[styles.tile, { backgroundColor: s.bg }]}>
      <Screentone color={s.text} opacity={0.1} />
      <Text style={[styles.tileLabel, { color: s.text }]}>{s.label}</Text>
      <Text style={[styles.tileValue, { color: s.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrowTag: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: MANGA.ink,
    marginBottom: 10,
    transform: [{ rotate: '-1.5deg' }],
  },
  eyebrowText: { color: MANGA.paper, fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  bigTitle: { fontSize: 34, lineHeight: 35, fontWeight: '800', letterSpacing: -0.8, color: MANGA.ink },
  bigTitleAccent: { color: MANGA.terracotta, fontStyle: 'italic' },
  subtitle: { marginTop: 8, fontSize: 14, color: MANGA.brown, fontWeight: '500' },

  totalsCard: {
    marginTop: 22,
    backgroundColor: MANGA.paper,
    borderWidth: 2,
    borderColor: MANGA.ink,
    borderRadius: 14,
    padding: 18,
    paddingTop: 20,
    overflow: 'hidden',
    ...hardShadow(4, 4),
  },
  cornerPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 4,
    paddingLeft: 14,
    paddingRight: 10,
    backgroundColor: MANGA.terracotta,
  },
  cornerPanelText: { color: MANGA.paper, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  totalsLabel: { fontSize: 11, color: MANGA.brown, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase', marginTop: 4 },
  totalsRow: { marginTop: 4, marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  totalsValue: { fontSize: 56, fontWeight: '800', letterSpacing: -2, color: MANGA.ink, lineHeight: 54 },
  totalsUnit: { fontSize: 14, color: MANGA.brown, fontWeight: '600', marginBottom: 4 },

  split: { flex: 1, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1.5, borderColor: MANGA.ink },
  splitLabel: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', opacity: 0.75 },
  splitValue: { marginTop: 4, fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },

  grid: { marginTop: 22, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '47.5%',
    padding: 14,
    borderWidth: 2,
    borderColor: MANGA.ink,
    borderRadius: 8,
    overflow: 'hidden',
    ...hardShadow(3, 3),
  },
  tileLabel: { fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '800' },
  tileValue: { marginTop: 8, fontSize: 32, fontWeight: '800', letterSpacing: -1 },

  heroCard: {
    width: 156,
    backgroundColor: MANGA.paper,
    borderWidth: 2,
    borderColor: MANGA.ink,
    overflow: 'hidden',
    ...hardShadow(4, 4),
  },
  heroTitle: { fontSize: 13, fontWeight: '700', color: MANGA.ink },
  heroMeta: { marginTop: 7, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between' },
  heroMetaText: { fontSize: 10, fontWeight: '700', color: MANGA.brown },

  tally: {
    marginTop: 22,
    backgroundColor: MANGA.ink,
    borderWidth: 2,
    borderColor: MANGA.ink,
    borderRadius: 14,
    padding: 18,
    paddingVertical: 20,
    overflow: 'hidden',
    ...hardShadow(4, 4, MANGA.terracotta),
  },
  tallyEyebrow: { fontSize: 10, color: MANGA.gold, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  tallyRow: { marginTop: 8, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  tallyValue: { fontSize: 48, fontWeight: '800', letterSpacing: -1.5, color: MANGA.paper, lineHeight: 48 },
  tallyUnit: { fontSize: 13, color: '#E8D9C0', fontWeight: '600', marginBottom: 4 },
  tallyFoot: { marginTop: 14, fontSize: 12, color: '#E8D9C0' },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: MANGA.ink,
    ...hardShadow(3, 3),
  },
  authorRank: {
    width: 32,
    height: 32,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-3deg' }],
  },
  authorRankText: { fontSize: 13, fontWeight: '800', color: MANGA.ink },
  authorName: { fontSize: 14, fontWeight: '700', lineHeight: 17 },
  authorCount: { marginTop: 2, fontSize: 11, fontWeight: '600' },
});
