import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Anime } from '@/types';
import { ANIME, MONO } from '@/utils/animeTheme';
import { AnimeCover, ProgressBar, StatusChip } from './AnimePrimitives';

function AnimeCardBase({
  anime,
  onPress,
  onAdvance,
}: {
  anime: Anime;
  onPress: () => void;
  onAdvance: () => void;
}) {
  const showQuick = anime.estado === 'viendo' && anime.vistos < anime.eps;
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <AnimeCover anime={anime} w={56} h={76} glyph={false} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.topRow}>
          <StatusChip status={anime.estado} />
          {anime.serie === 'emision' && (
            <Text style={styles.emision}>● EN EMISIÓN</Text>
          )}
        </View>
        <Text style={styles.titulo} numberOfLines={1}>
          {anime.titulo}
        </Text>
        <Text style={styles.estudio} numberOfLines={1}>
          {anime.tipo === 'pelicula' ? 'Película' : anime.tipo === 'ova' ? 'OVA' : `T${anime.temporada}`} · {anime.anio}
        </Text>
        <View style={styles.progressRow}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={anime.vistos} total={anime.eps} color={anime.color} thick={3} />
          </View>
          <Text style={styles.count}>
            {anime.vistos}/{anime.eps}
          </Text>
        </View>
      </View>
      {showQuick && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onAdvance();
          }}
          hitSlop={8}
          style={[
            styles.quick,
            { backgroundColor: `${anime.color}22`, borderColor: `${anime.color}55` },
          ]}
        >
          <Plus size={14} color={anime.color} strokeWidth={2.4} />
        </Pressable>
      )}
    </Pressable>
  );
}

export const AnimeCard = React.memo(AnimeCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 12,
    backgroundColor: ANIME.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    borderRadius: 14,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  emision: {
    fontFamily: MONO,
    fontSize: 9,
    color: ANIME.lime,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  titulo: { fontSize: 15, fontWeight: '700', color: ANIME.text, lineHeight: 19 },
  estudio: { fontSize: 11.5, color: ANIME.textSoft, marginTop: 2 },
  progressRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  count: { fontFamily: MONO, fontSize: 10.5, color: ANIME.text, fontWeight: '600' },
  quick: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
