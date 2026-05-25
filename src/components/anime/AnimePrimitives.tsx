import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Anime, AnimeEstado } from '@/types';
import { ANIME, ANIME_STATUS, MONO } from '@/utils/animeTheme';

export function AnimeCover({
  anime,
  w = 64,
  h = 88,
  glyph = true,
}: {
  anime: Pick<Anime, 'color' | 'vistos' | 'imagen_url'>;
  w?: number;
  h?: number;
  glyph?: boolean;
}) {
  const color = anime.color || ANIME.cyan;
  const hasImage = !!anime.imagen_url;
  return (
    <View
      style={{
        width: w,
        height: h,
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: color,
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
      }}
    >
      <LinearGradient
        colors={[color, '#1A0E2E', '#0B0717']}
        locations={[0, 0.7, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {hasImage && (
        <Image
          source={{ uri: anime.imagen_url! }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}
      {/* corner notch */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderTopWidth: 14,
          borderLeftWidth: 14,
          borderTopColor: color,
          borderLeftColor: 'transparent',
          opacity: 0.85,
        }}
      />
      {glyph && (
        <Text
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            fontFamily: MONO,
            fontSize: w >= 100 ? 13 : 10,
            fontWeight: '600',
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: 1,
          }}
        >
          EP {String(anime.vistos).padStart(2, '0')}
        </Text>
      )}
    </View>
  );
}

export function ProgressBar({
  value,
  total,
  color = ANIME.cyan,
  thick = 4,
}: {
  value: number;
  total: number;
  color?: string;
  thick?: number;
}) {
  const pct = total ? Math.min(100, (value / total) * 100) : 0;
  return (
    <View
      style={{
        width: '100%',
        height: thick,
        borderRadius: 99,
        backgroundColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: thick,
          width: `${pct}%`,
          borderRadius: 99,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.9,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
}

export function StatusChip({
  status,
  size = 'sm',
}: {
  status: AnimeEstado;
  size?: 'sm' | 'md';
}) {
  const s = ANIME_STATUS[status];
  const small = size === 'sm';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: small ? 3 : 6,
        paddingHorizontal: small ? 9 : 12,
        borderRadius: 99,
        backgroundColor: `${s.glow}18`,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: `${s.glow}55`,
        alignSelf: 'flex-start',
      }}
    >
      <View
        style={{
          width: small ? 5 : 6,
          height: small ? 5 : 6,
          borderRadius: 99,
          backgroundColor: s.glow,
          shadowColor: s.glow,
          shadowOpacity: 1,
          shadowRadius: 4,
        }}
      />
      <Text
        style={{
          color: s.glow,
          fontSize: small ? 10.5 : 12.5,
          fontWeight: '700',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {s.label}
      </Text>
    </View>
  );
}
