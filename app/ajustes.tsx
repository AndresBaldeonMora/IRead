import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Check } from 'lucide-react-native';
import { useColors, useSerifFamily, useThemeStore } from '@/store/theme.store';
import { PALETTES, SERIFS } from '@/utils/themes';
import { PaletteKey, SerifKey } from '@/types';

export default function AjustesScreen() {
  const c = useColors();
  const serif = useSerifFamily();
  const router = useRouter();

  const palette = useThemeStore((s) => s.palette);
  const serifKey = useThemeStore((s) => s.serif);
  const setPalette = useThemeStore((s) => s.setPalette);
  const setSerif = useThemeStore((s) => s.setSerif);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.paper }} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.wineDeep, fontFamily: serif }]}>
          Apariencia
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <X size={26} color={c.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.section, { color: c.gold }]}>· paleta ·</Text>
        <View style={styles.list}>
          {(Object.keys(PALETTES) as PaletteKey[]).map((k) => {
            const p = PALETTES[k];
            const active = palette === k;
            return (
              <Pressable
                key={k}
                onPress={() => setPalette(k)}
                style={[
                  styles.option,
                  { backgroundColor: c.paperCard, borderColor: active ? c.wine : c.rule },
                ]}
              >
                <View style={styles.swatchRow}>
                  <Swatch color={p.paper} />
                  <Swatch color={p.rose} />
                  <Swatch color={p.wine} />
                  <Swatch color={p.gold} />
                </View>
                <Text style={[styles.optionLabel, { color: c.wineDeep, fontFamily: serif }]}>
                  {p.label}
                </Text>
                {active && <Check size={20} color={c.wine} />}
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.section, { color: c.gold, marginTop: 24 }]}>· tipografía ·</Text>
        <View style={styles.list}>
          {(Object.keys(SERIFS) as SerifKey[]).map((k) => {
            const s = SERIFS[k];
            const active = serifKey === k;
            return (
              <Pressable
                key={k}
                onPress={() => setSerif(k)}
                style={[
                  styles.option,
                  { backgroundColor: c.paperCard, borderColor: active ? c.wine : c.rule },
                ]}
              >
                <Text style={[styles.optionLabel, { color: c.wineDeep, fontFamily: s.family, flex: 1 }]}>
                  {s.label}
                </Text>
                <Text style={[styles.preview, { color: c.inkSoft, fontFamily: s.family }]}>
                  Aa Bb Cc
                </Text>
                {active && <Check size={20} color={c.wine} />}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: color,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.08)',
      }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  title: { fontSize: 30, fontWeight: '500' },
  section: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 12,
    marginHorizontal: 22,
    textAlign: 'center',
  },
  list: { paddingHorizontal: 22, marginTop: 12, gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  swatchRow: { flexDirection: 'row', gap: -8 },
  optionLabel: { fontSize: 18 },
  preview: { fontSize: 18, fontStyle: 'italic' },
});
