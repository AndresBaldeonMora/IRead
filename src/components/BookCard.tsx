import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, BookOpen } from 'lucide-react-native';
import { Book } from '@/types';
import { useColors, useSerifFamily } from '@/store/theme.store';

const SPINE_PALETTES: [string, string][] = [
  ['#6B2737', '#8E3A4A'],
  ['#7A4B2A', '#9A6440'],
  ['#4D3B5C', '#6E5478'],
  ['#2F4B3C', '#4A6B58'],
  ['#8E5A2E', '#A87444'],
  ['#5C3A52', '#7A5470'],
  ['#34403D', '#52605C'],
  ['#7D3030', '#9C4848'],
  ['#3D4F6B', '#5A6E8A'],
  ['#84583D', '#A07252'],
];

const spineColors = (n: number): [string, string] =>
  SPINE_PALETTES[n % SPINE_PALETTES.length];

interface Props {
  book: Book;
  onPress?: (book: Book) => void;
  onToggle?: (book: Book) => void;
}

export const BookCard = React.memo(function BookCard({ book, onPress, onToggle }: Props) {
  const c = useColors();
  const serif = useSerifFamily();
  const [colorA, colorB] = spineColors(book.numero);

  return (
    <Pressable
      onPress={() => onPress?.(book)}
      android_ripple={{ color: c.roseSoft }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.paperCard,
          borderColor: c.rule,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <LinearGradient
        colors={[colorA, colorB]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cover}
      >
        <View style={styles.gilt} />
        {book.coleccion === 'novelas_eternas' && (
          <Text style={[styles.numero, { fontFamily: serif }]}>
            {book.numero}
          </Text>
        )}
      </LinearGradient>

      <View style={styles.info}>
        <Text
          numberOfLines={2}
          style={[styles.titulo, { color: c.wineDeep, fontFamily: serif }]}
        >
          {book.titulo}
        </Text>
        <Text numberOfLines={1} style={[styles.autor, { color: c.inkSoft }]}>
          {book.autor}
        </Text>
        <View style={styles.metaRow}>
          {book.leido && (
            <View style={[styles.badge, { backgroundColor: c.gold + '22', borderColor: c.gold + '55' }]}>
              <BookOpen size={10} color={c.gold} />
              <Text style={[styles.badgeText, { color: c.gold }]}>Leído</Text>
            </View>
          )}
          {book.formato === 'fisico' && (
            <View style={[styles.badge, { backgroundColor: c.wine + '18', borderColor: c.wine + '44' }]}>
              <Text style={[styles.badgeText, { color: c.wine }]}>Físico</Text>
            </View>
          )}
          {book.formato === 'digital' && (
            <View style={[styles.badge, { backgroundColor: c.wineLight + '22', borderColor: c.wineLight + '44' }]}>
              <Text style={[styles.badgeText, { color: c.wineLight }]}>Digital</Text>
            </View>
          )}
          {book.generos.length > 0 && (
            <Text numberOfLines={1} style={[styles.generoText, { color: c.inkSoft }]}>
              {book.generos.slice(0, 2).join(' · ')}
            </Text>
          )}
        </View>
      </View>

      {book.formato !== 'digital' && (
        <Pressable
          onPress={() => onToggle?.(book)}
          hitSlop={10}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: book.tengo }}
          accessibilityLabel={book.tengo ? 'Marcar como faltante' : 'Marcar como adquirido'}
          style={[
            styles.checkbox,
            {
              backgroundColor: book.tengo ? c.wine : 'transparent',
              borderColor: book.tengo ? c.wine : c.rose,
            },
          ]}
        >
          {book.tengo && <Check size={18} color={c.paperCard} strokeWidth={3} />}
        </Pressable>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  cover: {
    width: 48,
    height: 64,
    borderRadius: 4,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 3,
    overflow: 'hidden',
  },
  gilt: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(218,180,120,0.45)',
    borderRadius: 1,
  },
  numero: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248,232,200,0.9)',
    fontStyle: 'italic',
  },
  info: { flex: 1, gap: 3 },
  titulo: { fontSize: 18, fontWeight: '500', lineHeight: 22 },
  autor: { fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  badgeText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  generoText: { fontSize: 11 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
