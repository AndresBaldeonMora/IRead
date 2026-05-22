import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Manga } from '@/types';
import { MANGA, hardShadow } from '@/utils/mangaTheme';
import { MangaCover, MProgressBar, MStatusBadge, TypeBadge } from './MangaPrimitives';

function MangaCardBase({
  manga,
  onPress,
  onAdvance,
}: {
  manga: Manga;
  onPress: () => void;
  onAdvance: () => void;
}) {
  const showQuick = manga.estado === 'leyendo' && manga.leidos < manga.total;
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <MangaCover manga={manga} w={54} h={76} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.topRow}>
          <MStatusBadge status={manga.estado} />
          <TypeBadge tipo={manga.tipo} />
        </View>
        <Text style={styles.titulo} numberOfLines={1}>
          {manga.titulo}
        </Text>
        <Text style={styles.autor} numberOfLines={1}>
          {manga.autor} · {manga.anio}
        </Text>
        <View style={styles.progressRow}>
          <View style={{ flex: 1 }}>
            <MProgressBar value={manga.leidos} total={manga.total} color={manga.color} thick={5} />
          </View>
          <Text style={styles.count}>
            {manga.leidos}/{manga.total}
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
          style={styles.quick}
        >
          <Plus size={14} color={MANGA.ink} strokeWidth={2.6} />
        </Pressable>
      )}
    </Pressable>
  );
}

export const MangaCard = React.memo(MangaCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
    padding: 12,
    backgroundColor: MANGA.paper,
    borderWidth: 2,
    borderColor: MANGA.ink,
    borderRadius: 8,
    ...hardShadow(3, 3),
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' },
  titulo: { fontSize: 15, fontWeight: '800', color: MANGA.ink, lineHeight: 18 },
  autor: { fontSize: 11.5, fontWeight: '500', color: MANGA.brown, marginTop: 2 },
  progressRow: { marginTop: 'auto', paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  count: { fontSize: 10.5, color: MANGA.ink, fontWeight: '800' },
  quick: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    backgroundColor: MANGA.gold,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...hardShadow(1.5, 1.5),
  },
});
