import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { Anime, AnimeFiltro } from '@/types';
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme';
import { useAnimesStore } from '@/store/animes.store';
import { AnimeCard } from './AnimeCard';
import { handleSwitcherScroll } from '@/utils/switcherAnim';

const TABS: { id: AnimeFiltro; label: string; glow: string }[] = [
  { id: 'viendo',     label: 'Viendo',     glow: ANIME_STATUS.viendo.glow },
  { id: 'completado', label: 'Completados', glow: ANIME_STATUS.completado.glow },
  { id: 'pausado',    label: 'Pausados',    glow: ANIME_STATUS.pausado.glow },
  { id: 'pendiente',  label: 'Pendientes',  glow: ANIME_STATUS.pendiente.glow },
];

export function AnimeListView({
  title,
  eyebrow,
  fixedFilter,
}: {
  title: string;
  eyebrow: string;
  fixedFilter?: AnimeFiltro;
}) {
  const router = useRouter();
  const animes = useAnimesStore((s) => s.animes);
  const advanceEp = useAnimesStore((s) => s.advanceEp);

  const [filter, setFilter] = useState<AnimeFiltro>(fixedFilter ?? 'viendo');
  const [query, setQuery] = useState('');
  const activeFilter = fixedFilter ?? filter;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return animes.filter((a: Anime) => {
      if (activeFilter !== 'todos' && a.estado !== activeFilter) return false;
      if (!q) return true;
      return a.titulo.toLowerCase().includes(q);
    });
  }, [animes, activeFilter, query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ANIME.bg }} edges={['top']}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnimeCard
            anime={item}
            onPress={() => router.push({ pathname: '/animeDetalle/[id]', params: { id: item.id } })}
            onAdvance={() => advanceEp(item.id, 1)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        onScroll={handleSwitcherScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.searchWrap}>
              <Search size={18} color={ANIME.cyan} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por título…"
                placeholderTextColor={ANIME.textSoft}
                style={styles.searchInput}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <X size={16} color={ANIME.textSoft} />
                </Pressable>
              )}
            </View>

            {fixedFilter && <View style={{ height: 14 }} />}
            {!fixedFilter && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabs}
              >
                {TABS.map((t) => {
                  const active = filter === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setFilter(t.id)}
                      style={[
                        styles.tab,
                        active
                          ? { borderColor: t.glow, backgroundColor: `${t.glow}1a` }
                          : { borderColor: ANIME.line },
                      ]}
                    >
                      <Text style={{ color: active ? t.glow : ANIME.textSoft, fontWeight: '700', fontSize: 12 }}>
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nada por aquí</Text>
            <Text style={styles.emptyHint}>Cambia los filtros o agrega un anime</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 4, paddingTop: 72 },
  eyebrow: { fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: ANIME.magenta, marginBottom: 4 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, color: ANIME.text },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginTop: 14,
    backgroundColor: ANIME.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ANIME.line,
    borderRadius: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: ANIME.text, padding: 0 },
  tabs: { gap: 8, paddingVertical: 14 },
  tab: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
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
