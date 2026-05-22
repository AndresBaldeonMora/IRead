import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors, useSerifFamily } from '@/store/theme.store';

interface Props {
  title: string;
  subtitle?: string;
}

export function ScreenHeader({ title, subtitle }: Props) {
  const c = useColors();
  const serif = useSerifFamily();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.wineDeep, fontFamily: serif }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: c.inkSoft, fontFamily: serif }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 22, paddingTop: 52, paddingBottom: 8 },
  title: { fontSize: 36, fontWeight: '500', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, fontStyle: 'italic', marginTop: 2 },
});
