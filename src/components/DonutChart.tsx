import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useColors, useSerifFamily } from '@/store/theme.store';

interface Props {
  porcentaje: number;
  tengo: number;
  faltan: number;
  size?: number;
}

export function DonutChart({ porcentaje, tengo, faltan, size = 220 }: Props) {
  const c = useColors();
  const serif = useSerifFamily();

  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (porcentaje / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={c.roseSoft}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={c.wine}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      <View style={[styles.center, { width: size, height: size }]} pointerEvents="none">
        <Text style={[styles.porcentaje, { color: c.wineDeep, fontFamily: serif }]}>
          {porcentaje}%
        </Text>
        <Text style={[styles.label, { color: c.inkSoft }]}>
          {tengo} de {tengo + faltan}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  porcentaje: { fontSize: 52, fontWeight: '500', lineHeight: 56 },
  label: { fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 },
});
