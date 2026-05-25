import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import { useMangasStore } from '@/store/mangas.store';
import { MANGA, MANGA_STATUS, hardShadow, tipoLabel } from '@/utils/mangaTheme';
import { handleSwitcherScroll } from '@/utils/switcherAnim';

export default function MangaCompletadosScreen() {
  const router = useRouter();
  const mangas = useMangasStore((s) => s.mangas);

  const completados = useMemo(
    () =>
      mangas
        .filter((m) => m.estado === 'completado')
        .sort((a, b) => a.titulo.localeCompare(b.titulo)),
    [mangas]
  );

  const stats = useMemo(() => {
    const manga = completados.filter((m) => m.tipo === 'manga').length;
    const manwha = completados.filter((m) => m.tipo === 'manwha').length;
    const tomosLeidos = completados
      .filter((m) => m.unidad === 'tomo')
      .reduce((sum, m) => sum + m.leidos, 0);
    const capsLeidas = completados
      .filter((m) => m.unidad === 'capitulo')
      .reduce((sum, m) => sum + m.leidos, 0);
    return { manga, manwha, tomosLeidos, capsLeidas };
  }, [completados]);

  // Distribución por tipo para el mini-chart
  const typeDist = useMemo(() => {
    const dist: { tipo: 'manga' | 'manwha'; count: number }[] = [
      { tipo: 'manga', count: stats.manga },
      { tipo: 'manwha', count: stats.manwha },
    ];
    return dist;
  }, [stats]);

  const [selectedTipo, setSelectedTipo] = useState<'manga' | 'manwha' | null>(null);

  const listDelTipo = useMemo(() => {
    if (!selectedTipo) return [];
    return completados.filter((m) => m.tipo === selectedTipo);
  }, [completados, selectedTipo]);

  const handleSelectTipo = (t: 'manga' | 'manwha') =>
    setSelectedTipo((prev) => (prev === t ? null : t));

  const maxTypeCount = Math.max(stats.manga, stats.manwha, 1);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[MANGA.bgTop, MANGA.bgBottom]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleSwitcherScroll}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Completados</Text>
          </View>

          {/* Stats pills */}
          <View style={styles.pillRow}>
            <StatPill top={completados.length} bottom="Total" />
            <StatPill top={stats.manga} bottom="Manga" />
            <StatPill top={stats.manwha} bottom="Manwha" />
            <StatPill top={stats.tomosLeidos} bottom="Tomos" />
          </View>

          {/* Distribución manga vs manwha */}
          <View style={styles.section}>
            <Text style={styles.kicker}>· manga vs manwha ·</Text>

            <View style={[styles.chartCard, hardShadow(3, 3)]}>
              {typeDist.map(({ tipo, count }) => {
                const isSelected = selectedTipo === tipo;
                const widthPct = count > 0 ? (count / maxTypeCount) * 100 : 0;
                const barColor =
                  tipo === 'manga' ? MANGA.terracotta : MANGA.goldDeep;
                return (
                  <Pressable
                    key={tipo}
                    onPress={() => handleSelectTipo(tipo)}
                    style={styles.typeBarRow}
                  >
                    <Text
                      style={[
                        styles.typeBarLabel,
                        { color: isSelected ? MANGA.sepia : MANGA.brown },
                      ]}
                    >
                      {tipoLabel(tipo)}
                    </Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${widthPct}%`,
                            backgroundColor: isSelected
                              ? MANGA.sepia
                              : barColor,
                            minWidth: count > 0 ? 8 : 0,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.barCount,
                        { color: isSelected ? MANGA.sepia : MANGA.brown },
                      ]}
                    >
                      {count}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {completados.length > 0 && (
              <Text style={styles.hint}>
                Toca para ver los títulos de ese tipo
              </Text>
            )}
          </View>

          {/* Lista del tipo seleccionado */}
          {selectedTipo && (
            <View style={styles.section}>
              <Text style={styles.kicker}>· {tipoLabel(selectedTipo)} ·</Text>
              <View style={[styles.listCard, hardShadow(3, 3)]}>
                {listDelTipo.length === 0 ? (
                  <Text style={[styles.emptyRow, { color: MANGA.brown }]}>
                    Ningún título aquí
                  </Text>
                ) : (
                  listDelTipo.map((m, i) => (
                    <Pressable
                      key={m.id}
                      onPress={() =>
                        router.push({
                          pathname: '/mangaDetalle/[id]',
                          params: { id: m.id },
                        })
                      }
                      style={[
                        styles.listRow,
                        i > 0 && {
                          borderTopColor: MANGA.panel,
                          borderTopWidth: 1.5,
                        },
                      ]}
                    >
                      <View style={[styles.colorBar, { backgroundColor: m.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listTitle} numberOfLines={1}>
                          {m.titulo}
                        </Text>
                        <Text style={styles.listMeta} numberOfLines={1}>
                          {m.autor ? `${m.autor} · ` : ''}
                          {m.leidos} {m.unidad === 'tomo' ? 'tomos' : 'caps'}
                          {m.anio > 0 ? ` · ${m.anio}` : ''}
                        </Text>
                      </View>
                      <BookOpen size={16} color={MANGA.terracotta} />
                    </Pressable>
                  ))
                )}
              </View>
            </View>
          )}

          {/* Todos los completados */}
          {!selectedTipo && completados.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.kicker}>· todos los completados ·</Text>
              <View style={[styles.listCard, hardShadow(3, 3)]}>
                {completados.map((m, i) => (
                  <Pressable
                    key={m.id}
                    onPress={() =>
                      router.push({
                        pathname: '/mangaDetalle/[id]',
                        params: { id: m.id },
                      })
                    }
                    style={[
                      styles.listRow,
                      i > 0 && {
                        borderTopColor: MANGA.panel,
                        borderTopWidth: 1.5,
                      },
                    ]}
                  >
                    <View style={[styles.colorBar, { backgroundColor: m.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listTitle} numberOfLines={1}>
                        {m.titulo}
                      </Text>
                      <Text style={styles.listMeta} numberOfLines={1}>
                        {tipoLabel(m.tipo)}
                        {m.autor ? ` · ${m.autor}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.tomosCount}>
                      {m.leidos}
                      {'\n'}
                      <Text style={styles.tomosUnit}>
                        {m.unidad === 'tomo' ? 'tomos' : 'caps'}
                      </Text>
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {completados.length === 0 && (
            <View style={[styles.emptyBox, hardShadow(3, 3)]}>
              <Text style={styles.emptyTitle}>Sin completados aún</Text>
              <Text style={styles.emptyHint}>
                Completa un manga o manwha para verlo aquí
              </Text>
            </View>
          )}

          {/* Quote */}
          <View style={[styles.quoteCard, hardShadow(3, 3)]}>
            <Text style={styles.quoteText}>
              "El manga es la literatura que dibuja el tiempo."
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatPill({ top, bottom }: { top: number; bottom: string }) {
  return (
    <View style={[styles.pill, hardShadow(2, 2)]}>
      <Text style={styles.pillNum}>{top}</Text>
      <Text style={styles.pillLabel}>{bottom}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 22, paddingTop: 72, paddingBottom: 4 },
  title: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.5,
    color: MANGA.ink,
  },

  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 22,
    marginTop: 20,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 0,
    backgroundColor: MANGA.paper,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
  },
  pillNum: {
    fontSize: 26,
    fontWeight: '800',
    color: MANGA.terracotta,
    letterSpacing: -0.5,
  },
  pillLabel: {
    fontSize: 9,
    color: MANGA.brown,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginTop: 2,
  },

  section: { paddingHorizontal: 22, marginTop: 28 },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: MANGA.brown,
    marginBottom: 10,
    textAlign: 'center',
  },

  chartCard: {
    backgroundColor: MANGA.paper,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
    padding: 16,
    gap: 10,
  },
  typeBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeBarLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    width: 58,
  },
  barTrack: {
    flex: 1,
    height: 16,
    backgroundColor: MANGA.panel,
    borderWidth: 1,
    borderColor: MANGA.ink,
    overflow: 'hidden',
  },
  barFill: { height: '100%' },
  barCount: { width: 28, fontSize: 14, fontWeight: '800', textAlign: 'right' },

  hint: {
    fontSize: 10,
    fontWeight: '600',
    color: MANGA.brown,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },

  listCard: {
    backgroundColor: MANGA.paper,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  colorBar: { width: 5, height: 40, borderRadius: 2 },
  listTitle: { fontSize: 15, fontWeight: '700', color: MANGA.ink },
  listMeta: { fontSize: 11, color: MANGA.brown, marginTop: 2, fontWeight: '600' },
  tomosCount: {
    fontSize: 16,
    fontWeight: '800',
    color: MANGA.terracotta,
    textAlign: 'right',
  },
  tomosUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: MANGA.brown,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  emptyRow: {
    padding: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 13,
  },

  emptyBox: {
    marginHorizontal: 22,
    marginTop: 28,
    padding: 40,
    alignItems: 'center',
    backgroundColor: MANGA.paper,
    borderWidth: 2,
    borderColor: MANGA.ink,
    borderStyle: 'dashed',
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: MANGA.ink },
  emptyHint: { marginTop: 4, fontSize: 13, color: MANGA.brown, textAlign: 'center' },

  quoteCard: {
    marginHorizontal: 22,
    marginTop: 32,
    padding: 22,
    backgroundColor: MANGA.paper,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    color: MANGA.sepia,
    textAlign: 'center',
  },
});
