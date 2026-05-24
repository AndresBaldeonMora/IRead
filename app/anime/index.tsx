import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AnimeEstado } from '@/types';
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme';
import { useAnimesStore } from '@/store/animes.store';
import { AnimeCover, ProgressBar } from '@/components/anime/AnimePrimitives';
import { handleSwitcherScroll } from '@/utils/switcherAnim';

export default function AnimeDashboard() {
  const router = useRouter();
  const animes = useAnimesStore((s) => s.animes);

  const data = useMemo(() => {
    const counts: Record<AnimeEstado, number> = {
      viendo: 0,
      completado: 0,
      pausado: 0,
      pendiente: 0,
    };
    for (const a of animes) {
      counts[a.estado]++;
    }

    const watching = animes.filter((a) => a.estado === 'viendo').slice(0, 6);

    return { counts, watching };
  }, [animes]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ANIME.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false} onScroll={handleSwitcherScroll} scrollEventThrottle={16}>
        <View style={styles.headerWrap}>
          <Text style={styles.bigTitle}>Mi lista de animes</Text>
          <Text style={styles.subtitle}>
            {data.counts.viendo} viendo · {data.counts.completado} completados
          </Text>
        </View>

        {data.watching.length > 0 && (
          <View style={{ marginTop: 22 }}>
            <SectionTitle eyebrow="EN PROGRESO" accent={ANIME.cyan}>
              Continuar viendo
            </SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 18, paddingBottom: 8 }}
            >
              {data.watching.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => router.push({ pathname: '/animeDetalle/[id]', params: { id: a.id } })}
                  style={styles.heroCard}
                >
                  <AnimeCover anime={a} w={156} h={110} glyph={false} />
                  <View style={{ padding: 12 }}>
                    <Text style={styles.heroTitle} numberOfLines={1}>
                      {a.titulo}
                    </Text>
                    <View style={styles.heroMeta}>
                      <Text style={styles.heroMetaText}>EP {a.vistos}/{a.eps}</Text>
                      <Text style={[styles.heroMetaText, { color: a.color }]}>
                        {Math.round((a.vistos / a.eps) * 100)}%
                      </Text>
                    </View>
                    <ProgressBar value={a.vistos} total={a.eps} color={a.color} />
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.grid}>
          <StatusTile status="viendo" value={data.counts.viendo} />
          <StatusTile status="completado" value={data.counts.completado} />
          <StatusTile status="pausado" value={data.counts.pausado} />
          <StatusTile status="pendiente" value={data.counts.pendiente} />
        </View>

        <View style={styles.tally}>
          <Text style={styles.tallyLabel}>ANIMES COMPLETADOS · TOTAL</Text>
          <Text style={styles.tallyValue}>
            {data.counts.completado}
            <Text style={styles.tallyTotal}> / {animes.length}</Text>
          </Text>
          <View style={{ marginTop: 12 }}>
            <ProgressBar value={data.counts.completado} total={animes.length} color={ANIME.magenta} thick={6} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({
  children,
  eyebrow,
  accent,
}: {
  children: React.ReactNode;
  eyebrow: string;
  accent: string;
}) {
  return (
    <View style={{ marginBottom: 12, paddingHorizontal: 20 }}>
      <Text style={[styles.sectionEyebrow, { color: accent }]}>// {eyebrow}</Text>
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  );
}

function StatusTile({ status, value }: { status: AnimeEstado; value: number }) {
  const s = ANIME_STATUS[status];
  return (
    <View style={[styles.tile, { borderColor: `${s.glow}33` }]}>
      <View style={styles.tileLabelRow}>
        <View style={[styles.tileDot, { backgroundColor: s.glow }]} />
        <Text style={[styles.tileLabel, { color: s.glow }]}>{s.label}</Text>
      </View>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: 20, paddingTop: 72 },
  bigTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, color: ANIME.text },
  subtitle: { marginTop: 6, fontSize: 14, color: ANIME.textSoft },

  heroCard: {
    width: 180,
    backgroundColor: ANIME.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    overflow: 'hidden',
  },
  heroTitle: { fontSize: 13, fontWeight: '700', color: ANIME.text },
  heroMeta: { marginTop: 8, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between' },
  heroMetaText: { fontFamily: MONO, fontSize: 10, color: ANIME.textSoft },

  grid: { marginTop: 22, paddingHorizontal: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '47.5%',
    padding: 14,
    backgroundColor: ANIME.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
  },
  tileLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tileDot: { width: 5, height: 5, borderRadius: 99 },
  tileLabel: { fontFamily: MONO, fontSize: 9, letterSpacing: 1.6, textTransform: 'uppercase' },
  tileValue: { marginTop: 8, fontSize: 32, fontWeight: '800', letterSpacing: -1, color: ANIME.text },

  tally: {
    marginTop: 22,
    marginHorizontal: 18,
    padding: 18,
    backgroundColor: ANIME.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    borderRadius: 16,
  },
  tallyLabel: { fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: ANIME.textSoft },
  tallyValue: { marginTop: 6, fontSize: 44, fontWeight: '800', letterSpacing: -1, color: ANIME.text },
  tallyTotal: { fontSize: 22, color: ANIME.textSoft, fontWeight: '500' },

  sectionEyebrow: { fontFamily: MONO, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, color: ANIME.text },

});
