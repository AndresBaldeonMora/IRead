import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColors, useSerifFamily } from '@/store/theme.store';
import { MesLectura } from '@/services/statsService';

interface Props {
  data: MesLectura[];
  selectedMes?: string | null;
  onSelectMes?: (mes: string) => void;
}

export function MonthlyReadingChart({ data, selectedMes, onSelectMes }: Props) {
  const c = useColors();
  const serif = useSerifFamily();

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: c.paperCard, borderColor: c.rule }]}>
        <Text style={[styles.emptyText, { color: c.inkSoft }]}>
          Aún no hay lecturas registradas con mes
        </Text>
      </View>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const recent = data.slice(-12);

  return (
    <View style={[styles.container, { backgroundColor: c.paperCard, borderColor: c.rule }]}>
      <View style={styles.bars}>
        {recent.map((item) => {
          const heightPct = maxCount > 0 ? item.count / maxCount : 0;
          const isSelected = selectedMes === item.mes;
          return (
            <Pressable
              key={item.mes}
              style={styles.barCol}
              onPress={() => onSelectMes?.(item.mes)}
            >
              <Text style={[styles.barCount, { color: c.wine }]}>
                {item.count}
              </Text>
              <View style={[styles.barTrack, { backgroundColor: c.roseSoft }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: isSelected ? c.gold : c.wine,
                      height: `${Math.round(heightPct * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.barLabel, { color: isSelected ? c.wine : c.inkSoft, fontWeight: isSelected ? '800' : '600' }]}
                numberOfLines={1}
              >
                {item.label.split(' ')[0]}
              </Text>
              <Text style={[styles.barYear, { color: c.inkSoft }]} numberOfLines={1}>
                {item.label.split(' ')[1] ?? ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 120,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barCount: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  barTrack: {
    width: '70%',
    height: 70,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  barYear: {
    fontSize: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  empty: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
