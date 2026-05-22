import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Filtro } from '@/types';
import { FILTROS } from '@/utils/constants';
import { useColors } from '@/store/theme.store';

interface Props {
  value: Filtro;
  onChange: (value: Filtro) => void;
  counts?: Record<Filtro, number>;
}

export function FilterTabs({ value, onChange, counts }: Props) {
  const c = useColors();

  return (
    <View style={[styles.container, { backgroundColor: c.paperCard, borderColor: c.rule }]}>
      {FILTROS.map((f) => {
        const active = value === f.key;
        return (
          <Pressable
            key={f.key}
            onPress={() => onChange(f.key)}
            style={[
              styles.tab,
              active && { backgroundColor: c.wine },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? c.paperCard : c.inkSoft },
              ]}
            >
              {f.label}
              {counts && (
                <Text style={{ opacity: 0.7 }}> · {counts[f.key]}</Text>
              )}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
