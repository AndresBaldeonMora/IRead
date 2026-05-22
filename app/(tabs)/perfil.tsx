import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Palette, Sparkles } from 'lucide-react-native';
import { useBooksStore } from '@/store/books.store';
import { useColors, useSerifFamily } from '@/store/theme.store';
import { calculateStats, topAutores } from '@/services/statsService';
import { StatCard } from '@/components/StatCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { handleSwitcherScroll } from '@/utils/switcherAnim';

export default function PerfilScreen() {
  const c = useColors();
  const serif = useSerifFamily();
  const router = useRouter();
  const books = useBooksStore((s) => s.books);

  const stats = useMemo(() => calculateStats(books), [books]);
  const topAuthors = useMemo(() => topAutores(books, 5), [books]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.paper }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} onScroll={handleSwitcherScroll} scrollEventThrottle={16}>
        <ScreenHeader title="Mi rincón" subtitle="Lectora apasionada" />

        <View style={styles.statsRow}>
          <StatCard value={stats.tengo} label="Libros en casa" />
          <StatCard value={stats.autoresUnicos} label="Autores" accent="gold" />
        </View>

        <Pressable
          onPress={() => router.push('/ajustes')}
          style={[
            styles.row,
            { backgroundColor: c.paperCard, borderColor: c.rule },
          ]}
        >
          <Palette size={22} color={c.wine} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: c.wineDeep, fontFamily: serif }]}>
              Apariencia
            </Text>
            <Text style={[styles.rowHint, { color: c.inkSoft }]}>
              Paleta de colores y tipografía
            </Text>
          </View>
        </Pressable>

        {topAuthors.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.kicker, { color: c.gold }]}>· tus autores favoritos ·</Text>
            <View style={[styles.card, { backgroundColor: c.paperCard, borderColor: c.rule }]}>
              {topAuthors.map((a, i) => (
                <View key={a.autor} style={[styles.authorRow, i > 0 && { borderTopColor: c.rule, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <Sparkles size={16} color={c.gold} />
                  <Text style={[styles.authorName, { color: c.ink, fontFamily: serif }]}>
                    {a.autor}
                  </Text>
                  <Text style={[styles.authorCount, { color: c.wine }]}>
                    {a.cuenta} {a.cuenta === 1 ? 'libro' : 'libros'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.quote, { backgroundColor: c.paperCard, borderColor: c.rule }]}>
          <Text style={[styles.quoteText, { color: c.wineDeep, fontFamily: serif }]}>
            "Un cuarto sin libros es como un cuerpo sin alma."
          </Text>
          <Text style={[styles.quoteAuthor, { color: c.inkSoft }]}>— Cicerón</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 22, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 22,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowTitle: { fontSize: 17 },
  rowHint: { fontSize: 12, marginTop: 2 },
  section: { paddingHorizontal: 22, marginTop: 28 },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 4 },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  authorName: { flex: 1, fontSize: 17 },
  authorCount: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6 },
  quote: {
    marginHorizontal: 22,
    marginTop: 28,
    padding: 22,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quoteText: { fontSize: 18, fontStyle: 'italic', lineHeight: 26 },
  quoteAuthor: { fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 10 },
});
