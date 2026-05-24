import React, { useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star } from 'lucide-react-native';
import { Anime } from '@/types';
import { ANIME, MONO } from '@/utils/animeTheme';
import { useAnimesStore } from '@/store/animes.store';
import { handleSwitcherScroll } from '@/utils/switcherAnim';

const STAR_COLOR = '#FFD36E';

export default function AnimeValorarScreen() {
  const animes = useAnimesStore((s) => s.animes);
  const setRating = useAnimesStore((s) => s.setRating);

  const completados = useMemo(
    () =>
      animes
        .filter((a) => a.estado === 'completado')
        .sort((a, b) => {
          if ((a.rating == null) !== (b.rating == null))
            return a.rating == null ? -1 : 1;
          return (b.rating ?? 0) - (a.rating ?? 0);
        }),
    [animes]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ANIME.bg }} edges={['top']}>
      <FlatList
        data={completados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RatingCard
            anime={item}
            onRate={(r) => setRating(item.id, r)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        onScroll={handleSwitcherScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>// COMPLETADOS</Text>
            <Text style={styles.title}>Valorar</Text>
            <Text style={styles.hint}>
              {completados.filter((a) => a.rating != null).length} de {completados.length} valorados
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin completados aún</Text>
            <Text style={styles.emptyHint}>Completa un anime para poder valorarlo</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function RatingCard({ anime, onRate }: { anime: Anime; onRate: (r: number | null) => void }) {
  const tipoLabel =
    anime.tipo === 'pelicula' ? 'Película' : anime.tipo === 'ova' ? 'OVA' : `T${anime.temporada}`;

  return (
    <View style={styles.card}>
      <View style={[styles.colorBar, { backgroundColor: anime.color }]} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {anime.titulo}
        </Text>
        <Text style={styles.cardMeta}>
          {tipoLabel} · {anime.anio}
        </Text>
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
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = rating != null && n <= rating;
        return (
          <Pressable
            key={n}
            onPress={() => onRate(rating === n ? null : n)}
            hitSlop={6}
          >
            <Star
              size={22}
              color={filled ? STAR_COLOR : ANIME.line}
              fill={filled ? STAR_COLOR : 'transparent'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 4, paddingTop: 72, paddingBottom: 14 },
  eyebrow: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: ANIME.magenta,
    marginBottom: 4,
  },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, color: ANIME.text },
  hint: { marginTop: 6, fontSize: 12, color: ANIME.textSoft, fontFamily: MONO },

  card: {
    flexDirection: 'row',
    backgroundColor: ANIME.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    overflow: 'hidden',
  },
  colorBar: { width: 4 },
  cardBody: { flex: 1, paddingVertical: 14, paddingHorizontal: 14, gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: ANIME.text },
  cardMeta: { fontFamily: MONO, fontSize: 10, letterSpacing: 1.2, color: ANIME.textSoft, textTransform: 'uppercase' },
  stars: { flexDirection: 'row', gap: 8, marginTop: 4 },

  empty: {
    margin: 30,
    padding: 40,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    borderRadius: 14,
    borderStyle: 'dashed',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: ANIME.text },
  emptyHint: { marginTop: 4, fontSize: 13, color: ANIME.textSoft },
});
