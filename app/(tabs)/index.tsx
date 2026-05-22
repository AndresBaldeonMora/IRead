import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useBooksStore } from '@/store/books.store';
import { useColors, useSerifFamily } from '@/store/theme.store';
import { calculateStats, lecturasPorMes } from '@/services/statsService';
import { DonutChart } from '@/components/DonutChart';
import { StatCard } from '@/components/StatCard';
import { BookCard } from '@/components/BookCard';
import { MonthlyReadingChart } from '@/components/MonthlyReadingChart';
import { handleSwitcherScroll } from '@/utils/switcherAnim';

export default function DashboardScreen() {
  const books = useBooksStore((s) => s.books);
  const toggleBook = useBooksStore((s) => s.toggleBook);
  const router = useRouter();
  const c = useColors();
  const serif = useSerifFamily();

  const novelasEternas = useMemo(
    () => books.filter((b) => b.coleccion === 'novelas_eternas'),
    [books]
  );

  const stats = useMemo(() => calculateStats(novelasEternas), [novelasEternas]);

  const recientes = useMemo(
    () =>
      [...novelasEternas]
        .sort((a, b) => (b.actualizado_en ?? '').localeCompare(a.actualizado_en ?? ''))
        .filter((b) => b.tengo)
        .slice(0, 3),
    [novelasEternas]
  );

  const lecturasMensuales = useMemo(() => lecturasPorMes(books), [books]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.paper }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleSwitcherScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: c.gold }]}>· tu biblioteca ·</Text>
            <Text style={[styles.title, { color: c.wineDeep, fontFamily: serif }]}>
              Mi Biblioteca
            </Text>
            <Text style={[styles.subtitle, { color: c.inkSoft, fontFamily: serif }]}>
              Un cuarto sin libros es como un cuerpo sin alma
            </Text>
          </View>
          <Pressable onPress={() => router.push('/ajustes')} hitSlop={10}>
            <Settings size={22} color={c.inkSoft} />
          </Pressable>
        </View>

        {/* Colección Novelas Eternas */}
        <View style={[styles.sectionLabel, { borderColor: c.rule }]}>
          <Text style={[styles.sectionKicker, { color: c.gold }]}>
            · Novelas Eternas · {novelasEternas.length} títulos ·
          </Text>
        </View>

        <View style={styles.chartWrap}>
          <DonutChart
            porcentaje={stats.porcentaje}
            tengo={stats.tengo}
            faltan={stats.faltan}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard value={stats.tengo} label="Ya tengo" accent="wine" />
          <StatCard value={stats.faltan} label="Faltan" accent="rose" />
          <StatCard value={stats.autoresUnicos} label="Autores" accent="gold" />
        </View>

        {recientes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.wineDeep, fontFamily: serif }]}>
                Últimas adquisiciones
              </Text>
              <Pressable onPress={() => router.push('/(tabs)/biblioteca')}>
                <Text style={[styles.sectionAction, { color: c.wine }]}>Ver todo</Text>
              </Pressable>
            </View>
            {recientes.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onPress={() => router.push(`/libro/${book.id}`)}
                onToggle={() => toggleBook(book.id)}
              />
            ))}
          </View>
        )}

        {/* Gráfica de lectura mensual */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.wineDeep, fontFamily: serif }]}>
              Lectura por mes
            </Text>
            <Text style={[styles.sectionMeta, { color: c.inkSoft }]}>
              {books.filter((b) => b.leido).length} leídos en total
            </Text>
          </View>
          <MonthlyReadingChart data={lecturasMensuales} />
        </View>

        <View style={[styles.quote, { backgroundColor: c.paperCard, borderColor: c.rule }]}>
          <Text style={[styles.quoteText, { color: c.wineDeep, fontFamily: serif }]}>
            "Siempre imaginé que el Paraíso sería algún tipo de biblioteca."
          </Text>
          <Text style={[styles.quoteAuthor, { color: c.inkSoft }]}>— Jorge Luis Borges</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 64,
    paddingBottom: 12,
  },
  kicker: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 42, fontWeight: '500', lineHeight: 46 },
  subtitle: { fontSize: 15, fontStyle: 'italic', marginTop: 4 },
  sectionLabel: {
    marginHorizontal: 22,
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 6,
  },
  sectionKicker: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  chartWrap: { alignItems: 'center', marginTop: 8, marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 22 },
  section: { paddingHorizontal: 22, marginTop: 32 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 22, fontWeight: '500' },
  sectionAction: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  sectionMeta: { fontSize: 12 },
  quote: {
    marginHorizontal: 22,
    marginTop: 28,
    padding: 22,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quoteText: { fontSize: 18, fontStyle: 'italic', lineHeight: 26 },
  quoteAuthor: {
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 10,
  },
});
