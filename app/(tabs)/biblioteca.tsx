import React, { useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, SlidersHorizontal } from 'lucide-react-native';
import { useBooksStore } from '@/store/books.store';
import { useColors, useSerifFamily } from '@/store/theme.store';
import { BookCard } from '@/components/BookCard';
import { SearchBar } from '@/components/SearchBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { handleSwitcherScroll } from '@/utils/switcherAnim';
import { Filtro, LeidoFiltro } from '@/types';
import { FILTROS, LEIDO_FILTROS } from '@/utils/constants';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function BibliotecaScreen() {
  const c = useColors();
  const serif = useSerifFamily();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [leidoFiltro, setLeidoFiltro] = useState<LeidoFiltro>('todos');
  const [busqueda, setBusqueda] = useState('');

  const books = useBooksStore((s) => s.books);
  const toggleBook = useBooksStore((s) => s.toggleBook);

  const novelas = useMemo(() => books.filter((b) => b.coleccion === 'novelas_eternas'), [books]);

  const filtered = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return novelas
      .filter((b) => {
        const esFisico = b.formato !== 'digital';
        if (filtro === 'tengo' && (!b.tengo || !esFisico)) return false;
        if (filtro === 'faltan' && (b.tengo || !esFisico)) return false;
        if (leidoFiltro === 'leidos' && !b.leido) return false;
        if (leidoFiltro === 'sin_leer' && b.leido) return false;
        if (!q) return true;
        return b.titulo.toLowerCase().includes(q) || b.autor.toLowerCase().includes(q);
      })
      .sort((a, b) => a.numero - b.numero);
  }, [novelas, filtro, leidoFiltro, busqueda]);

  const counts = useMemo(() => {
    const fisicos = novelas.filter((b) => b.formato !== 'digital');
    return {
      todos: novelas.length,
      tengo: fisicos.filter((b) => b.tengo).length,
      faltan: fisicos.filter((b) => !b.tengo).length,
    };
  }, [novelas]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filtro !== 'todos') n++;
    if (leidoFiltro !== 'todos') n++;
    return n;
  }, [filtro, leidoFiltro]);

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFiltersOpen((v) => !v);
  };

  const resetFilters = () => {
    setFiltro('todos');
    setLeidoFiltro('todos');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.paper }} edges={['top']}>
      <ScreenHeader
        title="Novelas Eternas"
        subtitle={`${novelas.length} títulos en la colección`}
      />

      <View style={styles.controls}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar value={busqueda} onChangeText={setBusqueda} />
          </View>
          <Pressable
            onPress={toggleFilters}
            style={[
              styles.filterToggleBtn,
              {
                backgroundColor: filtersOpen || activeFilterCount > 0 ? c.wine : c.paperCard,
                borderColor: filtersOpen || activeFilterCount > 0 ? c.wine : c.rule,
              },
            ]}
          >
            <SlidersHorizontal
              size={16}
              color={filtersOpen || activeFilterCount > 0 ? c.paperCard : c.inkSoft}
            />
            {activeFilterCount > 0 && (
              <View style={[styles.badge, { backgroundColor: c.paperCard }]}>
                <Text style={[styles.badgeText, { color: c.wine }]}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {filtersOpen && (
          <View style={[styles.filtersPanel, { backgroundColor: c.paperCard, borderColor: c.rule }]}>
            <FilterRow
              label="Estado"
              options={FILTROS}
              value={filtro}
              onChange={(k) => setFiltro(k as Filtro)}
              counts={counts}
              c={c}
            />
            <View style={styles.divider} />
            <FilterRow
              label="Lectura"
              options={LEIDO_FILTROS}
              value={leidoFiltro}
              onChange={(k) => setLeidoFiltro(k as LeidoFiltro)}
              c={c}
            />
            {activeFilterCount > 0 && (
              <Pressable onPress={resetFilters} style={styles.resetBtn}>
                <Text style={[styles.resetText, { color: c.wine }]}>Limpiar filtros</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        onScroll={handleSwitcherScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => router.push(`/libro/${item.id}`)}
            onToggle={() => toggleBook(item.id)}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        ListEmptyComponent={
          <View style={styles.empty}>
            <BookOpen size={48} color={c.rose} />
            <Text style={[styles.emptyTitle, { color: c.wineDeep, fontFamily: serif }]}>
              Nada por aquí
            </Text>
            <Text style={[styles.emptyHint, { color: c.inkSoft }]}>
              Prueba ajustando los filtros
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
  counts,
  c,
}: {
  label: string;
  options: readonly { key: string; label: string }[];
  value: string;
  onChange: (k: string) => void;
  counts?: Record<string, number>;
  c: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.filterRow}>
      <Text style={[styles.filterLabel, { color: c.inkSoft }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.filterChips}>
          {options.map((opt) => {
            const active = value === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => onChange(opt.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? c.wine : 'transparent',
                    borderColor: active ? c.wine : c.rule,
                  },
                ]}
              >
                <Text style={[styles.filterChipText, { color: active ? c.paperCard : c.inkSoft }]}>
                  {opt.label}
                  {counts ? ` · ${counts[opt.key] ?? 0}` : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 16, paddingBottom: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  filtersPanel: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  filterLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '600',
    width: 58,
    flexShrink: 0,
  },
  filterChips: { flexDirection: 'row', gap: 6 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterChipText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 12,
  },
  resetBtn: { alignItems: 'center', paddingVertical: 10, paddingTop: 6 },
  resetText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '500' },
  emptyHint: { fontSize: 14, textAlign: 'center' },
});
