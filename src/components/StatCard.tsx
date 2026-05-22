import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors, useSerifFamily } from '@/store/theme.store';

interface Props {
  value: string | number;
  label: string;
  accent?: 'wine' | 'rose' | 'gold';
}

export function StatCard({ value, label, accent = 'wine' }: Props) {
  const c = useColors();
  const serif = useSerifFamily();

  const accentColor = accent === 'wine' ? c.wine : accent === 'rose' ? c.rose : c.gold;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.paperCard, borderColor: c.rule },
      ]}
    >
      <Text style={[styles.value, { color: accentColor, fontFamily: serif }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: c.inkSoft }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 6,
  },
  value: { fontSize: 32, fontWeight: '500', lineHeight: 34 },
  label: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
