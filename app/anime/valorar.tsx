import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Trophy } from 'lucide-react-native';
import { Anime } from '@/types';
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme';
import { useAnimesStore } from '@/store/animes.store';
import { handleSwitcherScroll } from '@/utils/switcherAnim';

const STAR_COLOR = '#FFD36E';
const STAR_EMPTY = 'rgba(237,218,180,0.18)';

export default function AnimeValorarScreen() {
  const animes = useAnimesStore((s) => s.animes);
  const setRating = useAnimesStore((s) => s.setRating);

  const completados = useMemo(
    () => animes.filter((a) => a.estado === 'completado'),
    [animes]
  );

  const valorados = useMemo(
    () =>
      completados
        .filter((a) => a.rating != null)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
    [completados]
  );

  const sinValorar = useMemo(
    () =>
      completados
        .filter((a) => a.rating == null)
        .sort((a, b) => a.titulo.localeCompare(b.titulo)),
    [completados]
  );

  const promedio = useMemo(() => {
    if (valorados.length === 0) return null;
    const sum = valorados.reduce((acc, a) => acc + (a.rating ?? 0), 0);
    return (sum / valorados.length).toFixed(1);
  }, [valorados]);

  const progresoPct =
    completados.length > 0
      ? (valorados.length / completados.length) * 100
      : 0;

  // Lista con separadores de sección
  type Item =
    | { type: 'section'; label: string; count: number }
    | { type: 'anime'; anime: Anime; rank?: number };

  const listData = useMemo((): Item[] => {
    const items: Item[] = [];
    if (valorados.length > 0) {
      items.push({ type: 'section', label: 'Valorados', count: valorados.length });
      valorados.forEach((a, i) =>
        items.push({ type: 'anime', anime: a, rank: i + 1 })
      );
    }
    if (sinValorar.length > 0) {
      items.push({ type: 'section', label: 'Por valorar', count: sinValorar.length });
      sinValorar.forEach((a) => items.push({ type: 'anime', anime: a }));
    }
    return items;
  }, [valorados, sinValorar]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ANIME.bg }} edges={['top']}>
      <FlatList
        data={listData}
        keyExtractor={(item, i) =>
          item.type === 'section' ? `sec-${i}` : item.anime.id
        }
        renderItem={({ item }) => {
          if (item.type === 'section') {
            return <SectionHeader label={item.label} count={item.count} />;
          }
          return (
            <RatingCard
              anime={item.anime}
              rank={item.rank}
              onRate={(r) => setRating(item.anime.id, r)}
            />
          );
        }}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 36 }}
        ItemSeparatorComponent={({ leadingItem }) =>
          (leadingItem as Item).type === 'section' ? null : (
            <View style={{ height: 8 }} />
          )
        }
        showsVerticalScrollIndicator={false}
        onScroll={handleSwitcherScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Valorar</Text>

            {/* Promedio + progreso */}
            {completados.length > 0 && (
              <View style={styles.statsRow}>
                {promedio ? (
                  <View style={[styles.avgPill, { backgroundColor: ANIME.surface }]}>
                    <Star size={14} color={STAR_COLOR} fill={STAR_COLOR} />
                    <Text style={styles.avgNum}>{promedio}</Text>
                    <Text style={styles.avgLabel}>promedio</Text>
                  </View>
                ) : null}

                <View style={[styles.progressBox, { backgroundColor: ANIME.surface }]}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>
                      {valorados.length} de {completados.length} valorados
                    </Text>
                    <Text style={styles.progressPct}>
                      {Math.round(progresoPct)}%
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progresoPct}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Trophy size={36} color={ANIME_STATUS.completado.glow} />
            <Text style={styles.emptyTitle}>Sin completados aún</Text>
            <Text style={styles.emptyHint}>
              Completa un anime para poder valorarlo
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );
}

function RatingCard({
  anime,
  rank,
  onRate,
}: {
  anime: Anime;
  rank?: number;
  onRate: (r: number | null) => void;
}) {
  const tipoLabel =
    anime.tipo === 'pelicula'
      ? 'Película'
      : anime.tipo === 'ova'
      ? 'OVA'
      : `T${anime.temporada}`;

  const isTop = rank != null && rank <= 3;
  const rankColor =
    rank === 1
      ? '#FFD36E'
      : rank === 2
      ? '#C0C0C0'
      : rank === 3
      ? '#CD7F32'
      : ANIME.textSoft;

  return (
    <View style={[styles.card, { borderColor: isTop ? `${anime.color}44` : ANIME.line }]}>
      {/* Barra de color lateral */}
      <View style={[styles.colorBar, { backgroundColor: anime.color }]} />

      <View style={styles.cardBody}>
        {/* Fila título + ranking */}
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {anime.titulo}
          </Text>
          {rank != null && (
            <Text style={[styles.rankNum, { color: rankColor }]}>
              #{rank}
            </Text>
          )}
        </View>

        {/* Meta */}
        <Text style={styles.cardMeta}>
          {tipoLabel}
          {anime.anio > 0 ? ` · ${anime.anio}` : ''}
          {anime.eps > 0 ? ` · ${anime.eps} ep` : ''}
        </Text>

        {/* Estrellas */}
        <StarRow rating={anime.rating} onRate={onRate} />
      </View>
    </View>
  );
}

function StarRow({
  rating,
  onRate,
}: {
  rating: number | null;
  onRate: (r: number | null) => void;
}) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = rating != null && n <= rating;
        return (
          <Pressable
            key={n}
            onPress={() => onRate(rating === n ? null : n)}
            hitSlop={8}
          >
            <Star
              size={26}
              color={filled ? STAR_COLOR : STAR_EMPTY}
              fill={filled ? STAR_COLOR : 'transparent'}
              strokeWidth={filled ? 0 : 1.5}
            />
          </Pressable>
        );
      })}
      {rating != null && (
        <Text style={styles.ratingNum}>{rating}.0</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 4,
    paddingTop: 72,
    paddingBottom: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    color: ANIME.text,
    marginBottom: 16,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  avgPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${STAR_COLOR}33`,
  },
  avgNum: {
    fontSize: 20,
    fontWeight: '800',
    color: STAR_COLOR,
    letterSpacing: -0.5,
  },
  avgLabel: {
    fontSize: 9,
    color: ANIME.textSoft,
    fontFamily: MONO,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  progressBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    justifyContent: 'center',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    color: ANIME.textSoft,
    fontFamily: MONO,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '700',
    color: ANIME_STATUS.completado.glow,
  },
  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(237,218,180,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ANIME_STATUS.completado.glow,
    borderRadius: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: ANIME.magenta,
    fontFamily: MONO,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: ANIME.line,
  },
  sectionCount: {
    fontSize: 10,
    color: ANIME.textSoft,
    fontFamily: MONO,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: ANIME.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  colorBar: { width: 5 },
  cardBody: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: ANIME.text,
    lineHeight: 21,
  },
  rankNum: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 1,
  },
  cardMeta: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 1,
    color: ANIME.textSoft,
    textTransform: 'uppercase',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  ratingNum: {
    fontSize: 14,
    fontWeight: '700',
    color: STAR_COLOR,
    marginLeft: 4,
  },

  empty: {
    marginTop: 60,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ANIME.text,
  },
  emptyHint: {
    fontSize: 13,
    color: ANIME.textSoft,
    textAlign: 'center',
    lineHeight: 19,
  },
});
