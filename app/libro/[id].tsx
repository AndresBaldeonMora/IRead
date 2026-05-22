import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, BookOpen, Check, Trash2, Save, Smartphone } from 'lucide-react-native';
import { useBooksStore } from '@/store/books.store';
import { useColors, useSerifFamily } from '@/store/theme.store';
import { formatDate } from '@/utils/formatters';

export default function BookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const serif = useSerifFamily();

  const book = useBooksStore((s) => s.books.find((b) => b.id === id));
  const toggleBook = useBooksStore((s) => s.toggleBook);
  const toggleRead = useBooksStore((s) => s.toggleRead);
  const updateBook = useBooksStore((s) => s.updateBook);
  const deleteBook = useBooksStore((s) => s.deleteBook);

  const [notas, setNotas] = useState(book?.notas ?? '');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setNotas(book?.notas ?? '');
    setDirty(false);
  }, [book?.id]);

  if (!book) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.paper }}>
        <View style={styles.empty}>
          <Text style={{ color: c.ink }}>Libro no encontrado</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: c.wine, marginTop: 8 }}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const esNovelaEterna = book.coleccion === 'novelas_eternas';

  const handleSaveNotas = async () => {
    await updateBook(book.id, { notas: notas.trim() || null });
    setDirty(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar libro',
      `¿Seguro que quieres eliminar "${book.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteBook(book.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleToggleRead = () => {
    if (book.leido) {
      toggleRead(book.id);
      return;
    }
    // Marcar como leído — preguntar si guarda el mes
    const ahora = new Date();
    const mesLabel = ahora.toLocaleString('es', { month: 'long', year: 'numeric' });
    const mesISO = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;

    Alert.alert(
      '¡Libro terminado! 🎉',
      `¿Quieres guardar ${mesLabel} como el mes en que lo leíste?`,
      [
        {
          text: 'Sí, guardar mes',
          onPress: () => toggleRead(book.id, mesISO),
        },
        {
          text: 'Solo marcar como leído',
          style: 'cancel',
          onPress: () => toggleRead(book.id, null),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.paper }} edges={['top']}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={28} color={c.ink} />
        </Pressable>
        {!esNovelaEterna && (
          <Pressable onPress={handleDelete} hitSlop={10}>
            <Trash2 size={20} color={c.inkSoft} />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroWrap}>
          <View style={[styles.heroCover, {
            backgroundColor: book.formato === 'digital'
              ? c.roseSoft
              : book.tengo ? c.wine : c.roseSoft,
          }]}>
            {book.formato === 'digital'
              ? <Smartphone size={48} color={c.wineDeep} />
              : <BookOpen size={56} color={book.tengo ? c.paperCard : c.wineDeep} />
            }
            {book.coleccion === 'novelas_eternas' && (
              <Text style={[styles.heroNumero, {
                color: book.formato === 'digital'
                  ? c.wineDeep
                  : book.tengo ? c.paperCard : c.wineDeep,
              }]}>
                N° {book.numero}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.titleBlock}>
          {esNovelaEterna && (
            <Text style={[styles.coleccionTag, { color: c.gold }]}>
              · Novelas Eternas ·
            </Text>
          )}
          <Text style={[styles.kicker, { color: c.gold }]}>
            {book.formato === 'digital'
              ? '· edición digital ·'
              : book.tengo ? '· en tu biblioteca ·' : '· en tu lista de deseos ·'}
          </Text>
          <Text style={[styles.titulo, { color: c.wineDeep, fontFamily: serif }]}>
            {book.titulo}
          </Text>
          <Text style={[styles.autor, { color: c.inkSoft, fontFamily: serif }]}>
            por {book.autor}
          </Text>
          {book.fecha_salida && (
            <Text style={[styles.fecha, { color: c.gold }]}>
              {formatDate(book.fecha_salida)}
            </Text>
          )}
        </View>

        {/* Badges de géneros y formato */}
        {(book.generos.length > 0 || book.formato) && (
          <View style={styles.badgesWrap}>
            {book.formato && (
              <View style={[styles.badge, { backgroundColor: c.wine + '18', borderColor: c.wine + '44' }]}>
                <Text style={[styles.badgeText, { color: c.wine }]}>
                  {book.formato === 'fisico' ? '📖 Físico' : '📱 Digital'}
                </Text>
              </View>
            )}
            {book.generos.map((g) => (
              <View key={g} style={[styles.badge, { backgroundColor: c.paperCard, borderColor: c.rule }]}>
                <Text style={[styles.badgeText, { color: c.inkSoft }]}>{g}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Toggle tengo — solo para libros físicos */}
        {book.formato !== 'digital' && (
          <Pressable
            onPress={() => toggleBook(book.id)}
            style={[
              styles.toggleBig,
              {
                backgroundColor: book.tengo ? c.wine : c.paperCard,
                borderColor: book.tengo ? c.wine : c.rose,
              },
            ]}
          >
            {book.tengo && <Check size={22} color={c.paperCard} strokeWidth={3} />}
            <Text
              style={[
                styles.toggleText,
                { color: book.tengo ? c.paperCard : c.wineDeep, fontFamily: serif },
              ]}
            >
              {book.tengo ? 'Ya lo tengo' : 'Aún no lo tengo'}
            </Text>
          </Pressable>
        )}

        {/* Toggle leído */}
        <Pressable
          onPress={handleToggleRead}
          style={[
            styles.toggleBig,
            {
              backgroundColor: book.leido ? c.gold : c.paperCard,
              borderColor: book.leido ? c.gold : c.rule,
              marginTop: 10,
            },
          ]}
        >
          {book.leido && <Check size={22} color={c.paperCard} strokeWidth={3} />}
          <Text
            style={[
              styles.toggleText,
              { color: book.leido ? c.paperCard : c.inkSoft, fontFamily: serif },
            ]}
          >
            {book.leido
              ? `Ya lo leí${book.leido_en ? ` · ${formatMes(book.leido_en)}` : ''}`
              : 'Marcar como leído'}
          </Text>
        </Pressable>

        <View style={styles.notasSection}>
          <Text style={[styles.notasLabel, { color: c.inkSoft }]}>Mis notas</Text>
          <TextInput
            value={notas}
            onChangeText={(v) => {
              setNotas(v);
              setDirty(v !== (book.notas ?? ''));
            }}
            placeholder="Pensamientos, citas, dónde lo compré…"
            placeholderTextColor={c.inkSoft}
            multiline
            style={[
              styles.notasInput,
              {
                backgroundColor: c.paperCard,
                borderColor: c.rule,
                color: c.ink,
              },
            ]}
          />
          {dirty && (
            <Pressable
              onPress={handleSaveNotas}
              style={[styles.saveBtn, { backgroundColor: c.wine }]}
            >
              <Save size={18} color={c.paperCard} />
              <Text style={[styles.saveTxt, { color: c.paperCard }]}>Guardar notas</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatMes(leidoEn: string): string {
  const [year, month] = leidoEn.split('-');
  const idx = parseInt(month, 10) - 1;
  return `${MESES[idx] ?? month} ${year}`;
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroWrap: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  heroCover: {
    width: 140,
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroNumero: { fontSize: 13, letterSpacing: 2, fontWeight: '700' },
  titleBlock: { paddingHorizontal: 30, alignItems: 'center' },
  coleccionTag: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  kicker: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  titulo: { fontSize: 30, fontWeight: '500', textAlign: 'center', lineHeight: 36 },
  autor: { fontSize: 18, fontStyle: 'italic', marginTop: 8 },
  fecha: { fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 12 },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 30,
    marginTop: 16,
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  badgeText: { fontSize: 12, fontWeight: '500' },
  toggleBig: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 30,
    marginTop: 26,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  toggleText: { fontSize: 18 },
  notasSection: { paddingHorizontal: 22, marginTop: 32 },
  notasLabel: {
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  notasInput: {
    minHeight: 110,
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
  },
  saveTxt: { fontSize: 15, fontWeight: '600' },
});
