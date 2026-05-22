import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { Manga, MangaFiltro, MangaTipoFiltro } from '@/types';
import { MANGA, hardShadow } from '@/utils/mangaTheme';
import { useMangasStore } from '@/store/mangas.store';
import { MangaCard } from './MangaCard';
import { handleSwitcherScroll } from '@/utils/switcherAnim';

const TABS: { id: MangaFiltro; label: string; bg: string }[] = [
  { id: 'todos', label: 'Todos', bg: '#1A0F0A' },
  { id: 'leyendo', label: 'Leyendo', bg: '#B85042' },
  { id: 'completado', label: 'Completados', bg: '#D4A02C' },
  { id: 'pausado', label: 'Pausados', bg: '#8C7B6B' },
  { id: 'pendiente', label: 'Pendientes', bg: '#A87B5D' },
];

const TYPE_TABS: { id: MangaTipoFiltro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'manga', label: 'Manga' },
  { id: 'manwha', label: 'Manwha' },
];

export function MangaListView({
  title,
  fixedFilter,
}: {
  title: string;
  fixedFilter?: MangaFiltro;
}) {
  const router = useRouter();
  const mangas = useMangasStore((s) => s.mangas);
  const advanceManga = useMangasStore((s) => s.advanceManga);

  const [filter, setFilter] = useState<MangaFiltro>(fixedFilter ?? 'todos');
  const [typeFilter, setTypeFilter] = useState<MangaTipoFiltro>('todos');
  const [query, setQuery] = useState('');
  const activeFilter = fixedFilter ?? filter;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mangas.filter((m: Manga) => {
      if (activeFilter !== 'todos' && m.estado !== activeFilter) return false;
      if (typeFilter !== 'todos' && m.tipo !== typeFilter) return false;
      if (!q) return true;
      return m.titulo.toLowerCase().includes(q) || m.autor.toLowerCase().includes(q);
    });
  }, [mangas, activeFilter, typeFilter, query]);

  const manwhaCount = mangas.filter((m) => m.tipo === 'manwha').length;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[MANGA.bgTop, MANGA.bgBottom]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MangaCard
              manga={item}
              onPress={() => router.push({ pathname: '/mangaDetalle/[id]', params: { id: item.id } })}
              onAdvance={() => advanceManga(item.id, 1)}
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
                <View style={styles.eyebrowTag}>
                  <Text style={styles.eyebrowText}>
                    {mangas.length} obras · {manwhaCount} manwha
                  </Text>
                </View>
                <Text style={styles.title}>{title}</Text>
              </View>

              <View style={styles.searchWrap}>
                <Search size={18} color={MANGA.terracotta} strokeWidth={2} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Buscar por título o autor…"
                  placeholderTextColor={MANGA.brown}
                  style={styles.searchInput}
                />
                {query.length > 0 && (
                  <Pressable onPress={() => setQuery('')} hitSlop={8}>
                    <X size={16} color={MANGA.brown} />
                  </Pressable>
                )}
              </View>

              {!fixedFilter && (
                <>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabs}
                  >
                    {TABS.map((t) => {
                      const active = filter === t.id;
                      const activeText = t.bg === '#D4A02C' ? MANGA.ink : MANGA.paper;
                      return (
                        <Pressable
                          key={t.id}
                          onPress={() => setFilter(t.id)}
                          style={[
                            styles.tab,
                            active
                              ? { backgroundColor: t.bg, ...hardShadow(2, 2), transform: [{ translateX: -1 }, { translateY: -1 }] }
                              : { backgroundColor: MANGA.paper },
                          ]}
                        >
                          <Text style={{ color: active ? activeText : MANGA.ink, fontWeight: '700', fontSize: 12 }}>
                            {t.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <View style={styles.typeRow}>
                    <Text style={styles.typeLabel}>Tipo</Text>
                    {TYPE_TABS.map((t) => {
                      const active = typeFilter === t.id;
                      return (
                        <Pressable
                          key={t.id}
                          onPress={() => setTypeFilter(t.id)}
                          style={[
                            styles.typeTab,
                            { backgroundColor: active ? MANGA.ink : 'transparent' },
                          ]}
                        >
                          <Text style={{ color: active ? MANGA.paper : MANGA.ink, fontWeight: '700', fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                            {t.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nada por aquí</Text>
              <Text style={styles.emptyHint}>Ajusta los filtros o agrega un manga</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 4, paddingTop: 44 },
  eyebrowTag: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 9,
    backgroundColor: MANGA.ink,
    marginBottom: 6,
  },
  eyebrowText: {
    color: MANGA.paper,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8, color: MANGA.ink },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginTop: 14,
    backgroundColor: MANGA.paper,
    borderWidth: 2,
    borderColor: MANGA.ink,
    borderRadius: 8,
    ...hardShadow(2, 2),
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', color: MANGA.ink, padding: 0 },
  tabs: { gap: 7, paddingVertical: 12 },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
  },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 14 },
  typeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: MANGA.brown,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginRight: 4,
  },
  typeTab: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: MANGA.ink,
  },
  empty: {
    margin: 30,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MANGA.ink,
    borderStyle: 'dashed',
    backgroundColor: MANGA.paper,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: MANGA.ink },
  emptyHint: { marginTop: 4, fontSize: 13, color: MANGA.brown },
});
