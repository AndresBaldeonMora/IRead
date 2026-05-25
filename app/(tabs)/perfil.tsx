import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Download, Upload } from 'lucide-react-native';
import { useBooksStore } from '@/store/books.store';
import { useAnimesStore } from '@/store/animes.store';
import { useMangasStore } from '@/store/mangas.store';
import { useColors, useSerifFamily } from '@/store/theme.store';
import { lecturasPorMes, librosLeidosPorMes, formatMesLargo } from '@/services/statsService';
import { exportarDatos, importarDatos } from '@/services/backup';
import { MonthlyReadingChart } from '@/components/MonthlyReadingChart';
import { ScreenHeader } from '@/components/ScreenHeader';
import { handleSwitcherScroll } from '@/utils/switcherAnim';

export default function PerfilScreen() {
  const c = useColors();
  const serif = useSerifFamily();
  const router = useRouter();
  const books = useBooksStore((s) => s.books);
  const loadBooks = useBooksStore((s) => s.loadBooks);
  const loadAnimes = useAnimesStore((s) => s.loadAnimes);
  const loadMangas = useMangasStore((s) => s.loadMangas);

  const [respaldando, setRespaldando] = useState(false);

  const handleExportar = async () => {
    if (respaldando) return;
    setRespaldando(true);
    try {
      const r = await exportarDatos();
      if (!r.ok) Alert.alert('Exportar', r.mensaje);
    } catch {
      Alert.alert('Exportar', 'Ocurrió un error al exportar');
    } finally {
      setRespaldando(false);
    }
  };

  const handleImportar = () => {
    Alert.alert(
      'Importar respaldo',
      'Esto reemplazará TODOS tus datos actuales (libros, animes y mangas) por los del archivo. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: async () => {
            setRespaldando(true);
            try {
              const r = await importarDatos();
              if (r.ok) {
                await Promise.all([loadBooks(), loadAnimes(), loadMangas()]);
                Alert.alert('Importar', `Listo. ${r.mensaje}.`);
              } else {
                Alert.alert('Importar', r.mensaje);
              }
            } catch {
              Alert.alert('Importar', 'Ocurrió un error al importar');
            } finally {
              setRespaldando(false);
            }
          },
        },
      ]
    );
  };

  const meses = useMemo(() => lecturasPorMes(books), [books]);
  const totalLeidos = useMemo(() => books.filter((b) => b.leido).length, [books]);
  const totalDigital = useMemo(() => books.filter((b) => b.leido && b.formato === 'digital').length, [books]);
  const [selectedMes, setSelectedMes] = useState<string | null>(null);

  const librosDelMes = useMemo(
    () => (selectedMes ? librosLeidosPorMes(books, selectedMes) : []),
    [books, selectedMes]
  );

  const handleSelectMes = (mes: string) =>
    setSelectedMes((prev) => (prev === mes ? null : mes));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.paper }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} onScroll={handleSwitcherScroll} scrollEventThrottle={16}>
        <ScreenHeader title="Mi rincón" subtitle="Lectora apasionada" />

        <View style={styles.statsRow}>
          <View style={[styles.statPill, { backgroundColor: c.paperCard, borderColor: c.rule }]}>
            <Text style={[styles.totalNum, { color: c.wine, fontFamily: serif }]}>{totalLeidos}</Text>
            <Text style={[styles.totalLabel, { color: c.inkSoft }]}>Total</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: c.paperCard, borderColor: c.rule }]}>
            <Text style={[styles.totalNum, { color: c.wine, fontFamily: serif }]}>{totalDigital}</Text>
            <Text style={[styles.totalLabel, { color: c.inkSoft }]}>Digital</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.kicker, { color: c.gold }]}>· lecturas por mes ·</Text>
          <MonthlyReadingChart
            data={meses}
            selectedMes={selectedMes}
            onSelectMes={handleSelectMes}
          />
          {meses.length > 0 && (
            <Text style={[styles.hint, { color: c.inkSoft }]}>
              Toca una barra para ver los libros de ese mes
            </Text>
          )}
        </View>

        {selectedMes && (
          <View style={styles.section}>
            <Text style={[styles.kicker, { color: c.gold }]}>
              · {formatMesLargo(selectedMes)} ·
            </Text>
            <View style={[styles.card, { backgroundColor: c.paperCard, borderColor: c.rule }]}>
              {librosDelMes.length === 0 ? (
                <View style={styles.bookRow}>
                  <Text style={[styles.bookTitle, { color: c.inkSoft, fontStyle: 'italic' }]}>
                    Sin lecturas este mes
                  </Text>
                </View>
              ) : (
                librosDelMes.map((b, i) => (
                  <Pressable
                    key={b.id}
                    onPress={() => router.push(`/libro/${b.id}`)}
                    style={[
                      styles.bookRow,
                      i > 0 && { borderTopColor: c.rule, borderTopWidth: StyleSheet.hairlineWidth },
                    ]}
                  >
                    <BookOpen size={16} color={c.wine} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.bookTitle, { color: c.ink, fontFamily: serif }]} numberOfLines={1}>
                        {b.titulo}
                      </Text>
                      {!!b.autor && (
                        <Text style={[styles.bookAuthor, { color: c.inkSoft }]} numberOfLines={1}>
                          {b.autor}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.kicker, { color: c.gold }]}>· respaldo ·</Text>
          <View style={styles.backupRow}>
            <Pressable
              onPress={handleExportar}
              disabled={respaldando}
              style={[styles.backupBtn, { backgroundColor: c.wine, opacity: respaldando ? 0.6 : 1 }]}
            >
              {respaldando ? (
                <ActivityIndicator size="small" color={c.paper} />
              ) : (
                <Download size={18} color={c.paper} />
              )}
              <Text style={[styles.backupBtnText, { color: c.paper }]}>Exportar</Text>
            </Pressable>
            <Pressable
              onPress={handleImportar}
              disabled={respaldando}
              style={[
                styles.backupBtn,
                { backgroundColor: c.paperCard, borderWidth: 1.5, borderColor: c.wine, opacity: respaldando ? 0.6 : 1 },
              ]}
            >
              <Upload size={18} color={c.wine} />
              <Text style={[styles.backupBtnText, { color: c.wine }]}>Importar</Text>
            </Pressable>
          </View>
          <Text style={[styles.hint, { color: c.inkSoft }]}>
            Exporta un archivo con toda tu información para guardarlo. Impórtalo si reinstalas la app.
          </Text>
        </View>

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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 22,
    marginTop: 20,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  totalNum: { fontSize: 32, fontWeight: '700' },
  totalLabel: { fontSize: 13, marginTop: 2 },
  section: { paddingHorizontal: 22, marginTop: 28 },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  hint: { fontSize: 11, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
  backupRow: { flexDirection: 'row', gap: 10 },
  backupBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  backupBtnText: { fontSize: 15, fontWeight: '700' },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 4 },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  bookTitle: { fontSize: 16 },
  bookAuthor: { fontSize: 12, marginTop: 2 },
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
