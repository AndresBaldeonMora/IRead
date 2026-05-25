import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Star, Tv, Film, Disc } from 'lucide-react-native';
import { useAnimesStore } from '@/store/animes.store';
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme';
import { handleSwitcherScroll } from '@/utils/switcherAnim';

const STAR_COLOR = '#FFD36E';
const STAR_EMPTY = 'rgba(237,218,180,0.15)';

export default function AnimeCompletadosScreen() {
  const router = useRouter();
  const animes = useAnimesStore((s) => s.animes);

  const completados = useMemo(
    () => animes.filter((a) => a.estado === 'completado'),
    [animes]
  );

  const stats = useMemo(() => {
    const peliculas = completados.filter((a) => a.tipo === 'pelicula').length;
    const ovas = completados.filter((a) => a.tipo === 'ova').length;
    const series = completados.filter((a) => a.tipo === 'serie').length;
    const valorados = completados.filter((a) => a.rating != null).length;
    return { peliculas, ovas, series, valorados };
  }, [completados]);

  // Distribución de ratings: 5→1 + sin valorar
  const ratingDist = useMemo(() => {
    const dist = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: completados.filter((a) => a.rating === stars).length,
    }));
    const sinValorar = completados.filter((a) => a.rating == null).length;
    return { dist, sinValorar };
  }, [completados]);

  const maxRatingCount = useMemo(
    () => Math.max(...ratingDist.dist.map((d) => d.count), ratingDist.sinValorar, 1),
    [ratingDist]
  );

  const [selectedRating, setSelectedRating] = useState<number | null | undefined>(undefined);
  // undefined = nada seleccionado, null = sin valorar, number = esa puntuación

  const listDelRating = useMemo(() => {
    if (selectedRating === undefined) return [];
    if (selectedRating === null)
      return completados
        .filter((a) => a.rating == null)
        .sort((a, b) => a.titulo.localeCompare(b.titulo));
    return completados
      .filter((a) => a.rating === selectedRating)
      .sort((a, b) => a.titulo.localeCompare(b.titulo));
  }, [completados, selectedRating]);

  const handleSelectRating = (r: number | null) =>
    setSelectedRating((prev) => (prev === r ? undefined : r));

  const tipoIcon = (tipo: string) => {
    if (tipo === 'pelicula') return <Film size={14} color={ANIME_STATUS.completado.glow} />;
    if (tipo === 'ova') return <Disc size={14} color={ANIME_STATUS.completado.glow} />;
    return <Tv size={14} color={ANIME_STATUS.completado.glow} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ANIME.bg }} edges={['top']}>
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
          <StatPill top={stats.series} bottom="Series" />
          <StatPill top={stats.peliculas} bottom="Películas" />
          <StatPill top={stats.ovas} bottom="OVAs" />
        </View>

        {/* Rating chart */}
        <View style={styles.section}>
          <Text style={styles.kicker}>· por puntuación ·</Text>

          <View style={[styles.chartCard, { backgroundColor: ANIME.surface }]}>
            {ratingDist.dist.map(({ stars, count }) => {
              const isSelected = selectedRating === stars;
              const widthPct = maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;
              return (
                <Pressable
                  key={stars}
                  onPress={() => handleSelectRating(stars)}
                  style={styles.ratingRow}
                >
                  {/* Estrellas */}
                  <View style={styles.starsLabel}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={11}
                        color={n <= stars ? STAR_COLOR : STAR_EMPTY}
                        fill={n <= stars ? STAR_COLOR : 'transparent'}
                      />
                    ))}
                  </View>
                  {/* Barra */}
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${widthPct}%`,
                          backgroundColor: isSelected
                            ? ANIME_STATUS.completado.glow
                            : ANIME.cyan,
                          minWidth: count > 0 ? 8 : 0,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barCount,
                      { color: isSelected ? ANIME_STATUS.completado.glow : ANIME.textSoft },
                    ]}
                  >
                    {count}
                  </Text>
                </Pressable>
              );
            })}

            {/* Sin valorar */}
            {ratingDist.sinValorar > 0 && (
              <Pressable
                onPress={() => handleSelectRating(null)}
                style={[styles.ratingRow, styles.sinValorarRow]}
              >
                <Text style={[styles.sinValorarLabel, { color: ANIME.textSoft }]}>
                  sin valorar
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${(ratingDist.sinValorar / maxRatingCount) * 100}%`,
                        backgroundColor:
                          selectedRating === null ? ANIME_STATUS.completado.glow : ANIME.violet,
                        minWidth: 8,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barCount,
                    {
                      color:
                        selectedRating === null
                          ? ANIME_STATUS.completado.glow
                          : ANIME.textSoft,
                    },
                  ]}
                >
                  {ratingDist.sinValorar}
                </Text>
              </Pressable>
            )}
          </View>

          {completados.length > 0 && (
            <Text style={styles.hint}>
              Toca una fila para ver los títulos
            </Text>
          )}
        </View>

        {/* Lista del rating seleccionado */}
        {selectedRating !== undefined && (
          <View style={styles.section}>
            <Text style={styles.kicker}>
              {selectedRating === null
                ? '· sin valorar ·'
                : `· ${selectedRating} ${selectedRating === 1 ? 'estrella' : 'estrellas'} ·`}
            </Text>
            <View style={[styles.listCard, { backgroundColor: ANIME.surface }]}>
              {listDelRating.length === 0 ? (
                <Text style={[styles.emptyRow, { color: ANIME.textSoft }]}>
                  Ningún anime aquí
                </Text>
              ) : (
                listDelRating.map((anime, i) => (
                  <Pressable
                    key={anime.id}
                    onPress={() =>
                      router.push({
                        pathname: '/animeDetalle/[id]',
                        params: { id: anime.id },
                      })
                    }
                    style={[
                      styles.listRow,
                      i > 0 && { borderTopColor: ANIME.line, borderTopWidth: StyleSheet.hairlineWidth },
                    ]}
                  >
                    <View style={[styles.colorDot, { backgroundColor: anime.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listTitle} numberOfLines={1}>
                        {anime.titulo}
                      </Text>
                      <View style={styles.listMeta}>
                        {tipoIcon(anime.tipo)}
                        <Text style={styles.listMetaText}>
                          {anime.tipo === 'serie'
                            ? `T${anime.temporada}`
                            : anime.tipo === 'pelicula'
                            ? 'Película'
                            : 'OVA'}{' '}
                          · {anime.anio}
                        </Text>
                      </View>
                    </View>
                    {anime.rating != null && (
                      <View style={styles.ratingBadge}>
                        <Star size={10} color={STAR_COLOR} fill={STAR_COLOR} />
                        <Text style={styles.ratingBadgeText}>{anime.rating}</Text>
                      </View>
                    )}
                  </Pressable>
                ))
              )}
            </View>
          </View>
        )}

        {/* Quote */}
        <View style={[styles.quoteCard, { backgroundColor: ANIME.surface }]}>
          <Text style={styles.quoteText}>
            "Un buen anime no termina cuando acaba el último episodio."
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatPill({ top, bottom }: { top: number; bottom: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: ANIME.surface }]}>
      <Text style={styles.pillNum}>{top}</Text>
      <Text style={styles.pillLabel}>{bottom}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 22, paddingTop: 72, paddingBottom: 4 },
  title: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    color: ANIME.text,
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
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
  },
  pillNum: {
    fontSize: 26,
    fontWeight: '800',
    color: ANIME_STATUS.completado.glow,
    letterSpacing: -0.5,
  },
  pillLabel: {
    fontSize: 10,
    color: ANIME.textSoft,
    fontFamily: MONO,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  section: { paddingHorizontal: 22, marginTop: 28 },
  kicker: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: ANIME.magenta,
    marginBottom: 10,
    textAlign: 'center',
  },

  chartCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
  },
  sinValorarRow: {
    marginTop: 4,
    borderTopColor: ANIME.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  starsLabel: { flexDirection: 'row', gap: 2, width: 70 },
  sinValorarLabel: { width: 70, fontSize: 10, fontFamily: MONO, letterSpacing: 0.5 },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(237,218,180,0.07)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 5 },
  barCount: { width: 24, fontSize: 12, fontWeight: '700', textAlign: 'right' },

  hint: {
    fontFamily: MONO,
    fontSize: 10,
    color: ANIME.textSoft,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },

  listCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  colorDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  listTitle: { fontSize: 15, fontWeight: '600', color: ANIME.text },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  listMetaText: {
    fontFamily: MONO,
    fontSize: 10,
    color: ANIME.textSoft,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,211,110,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: STAR_COLOR,
  },
  emptyRow: {
    padding: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 13,
  },

  quoteCard: {
    marginHorizontal: 22,
    marginTop: 32,
    padding: 22,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    color: ANIME.text,
    opacity: 0.7,
    textAlign: 'center',
  },
});
