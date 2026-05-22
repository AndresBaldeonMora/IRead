import React, { useId } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Circle, Rect, Line } from 'react-native-svg';
import { Manga, MangaEstado, MangaTipo } from '@/types';
import { MANGA, MANGA_STATUS, hardShadow, tipoLabel } from '@/utils/mangaTheme';

// Decorative half-tone dot pattern, faithful to the web `radial-gradient` screentone.
export function Screentone({
  color = MANGA.sepia,
  opacity = 0.06,
  size = 5,
  radius = 0.7,
}: {
  color?: string;
  opacity?: number;
  size?: number;
  radius?: number;
}) {
  const pid = useId().replace(/:/g, '');
  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id={pid}
            x="0"
            y="0"
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <Circle cx={size / 2} cy={size / 2} r={radius} fill={color} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${pid})`} />
      </Svg>
    </View>
  );
}

// Abstract paneled manga cover with action lines, corner cut and format tag.
export function MangaCover({
  manga,
  w = 64,
  h = 88,
}: {
  manga: Pick<Manga, 'color' | 'tipo'>;
  w?: number;
  h?: number;
}) {
  const c = manga.color || MANGA.terracotta;
  const tagFont = w >= 100 ? 10 : 8;
  const dotsId = useId().replace(/:/g, '');
  return (
    <View
      style={{
        width: w,
        height: h,
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: MANGA.ink,
        ...hardShadow(2, 2),
      }}
    >
      <LinearGradient
        colors={[c, '#2A1810']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* action lines */}
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {Array.from({ length: 14 }).map((_, i) => {
          const off = i * (w / 5);
          return (
            <Line
              key={i}
              x1={off}
              y1={-h}
              x2={off - h * 0.5}
              y2={h}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          );
        })}
      </Svg>
      {/* screentone in corner */}
      <View
        style={{
          position: 'absolute',
          bottom: -2,
          left: -2,
          width: w * 0.6,
          height: h * 0.5,
          opacity: 0.5,
        }}
        pointerEvents="none"
      >
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern
              id={dotsId}
              x="0"
              y="0"
              width={4}
              height={4}
              patternUnits="userSpaceOnUse"
            >
              <Circle cx={2} cy={2} r={0.8} fill="rgba(255,255,255,0.6)" />
            </Pattern>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${dotsId})`} />
        </Svg>
      </View>
      {/* corner cut */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderTopWidth: 18,
          borderLeftWidth: 18,
          borderTopColor: MANGA.paper,
          borderLeftColor: 'transparent',
        }}
      />
      {/* format tag */}
      <View
        style={{
          position: 'absolute',
          bottom: 6,
          left: 6,
          paddingVertical: 2,
          paddingHorizontal: 6,
          backgroundColor: MANGA.paper,
          borderWidth: 1,
          borderColor: MANGA.ink,
          transform: [{ rotate: '-2deg' }],
        }}
      >
        <Text
          style={{
            color: MANGA.ink,
            fontSize: tagFont,
            fontWeight: '800',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}
        >
          {tipoLabel(manga.tipo)}
        </Text>
      </View>
    </View>
  );
}

// Progress bar with warm gradient fill + paneled border.
export function MProgressBar({
  value,
  total,
  color = MANGA.terracotta,
  thick = 6,
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
        borderRadius: 2,
        backgroundColor: MANGA.panel,
        borderWidth: 1,
        borderColor: MANGA.ink,
        overflow: 'hidden',
      }}
    >
      {pct > 0 && (
        <LinearGradient
          colors={[color, MANGA.gold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: '100%', width: `${pct}%` }}
        />
      )}
    </View>
  );
}

export function MStatusBadge({
  status,
  size = 'sm',
}: {
  status: MangaEstado;
  size?: 'sm' | 'md';
}) {
  const s = MANGA_STATUS[status];
  const small = size === 'sm';
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingVertical: small ? 3 : 5,
        paddingHorizontal: small ? 9 : 12,
        backgroundColor: s.bg,
        borderWidth: 1.5,
        borderColor: MANGA.ink,
        borderRadius: 999,
        ...hardShadow(small ? 1 : 2, small ? 1 : 2),
      }}
    >
      <Text
        style={{
          color: s.text,
          fontSize: small ? 10 : 12,
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

export function TypeBadge({
  tipo,
  size = 'sm',
}: {
  tipo: MangaTipo;
  size?: 'sm' | 'md';
}) {
  const isManwha = tipo === 'manwha';
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingVertical: size === 'sm' ? 2 : 4,
        paddingHorizontal: size === 'sm' ? 7 : 10,
        backgroundColor: isManwha ? MANGA.paper : MANGA.sepia,
        borderWidth: 1.2,
        borderColor: MANGA.ink,
      }}
    >
      <Text
        style={{
          color: isManwha ? MANGA.sepia : MANGA.paper,
          fontSize: size === 'sm' ? 9.5 : 11,
          fontWeight: '800',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {tipoLabel(tipo)}
      </Text>
    </View>
  );
}

// Manga-paneled section title with optional kana label.
export function MSectionTitle({
  children,
  kana,
}: {
  children: React.ReactNode;
  kana?: string;
}) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{children}</Text>
      {kana ? <Text style={styles.sectionKana}>{kana}</Text> : null}
    </View>
  );
}

// Reusable bordered "panel" card with hard shadow.
export function panelStyle(shadowDx = 4, shadowDy = 4): ViewStyle {
  return {
    backgroundColor: MANGA.paper,
    borderWidth: 2,
    borderColor: MANGA.ink,
    ...hardShadow(shadowDx, shadowDy),
  };
}

const styles = StyleSheet.create({
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 14,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: MANGA.ink,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: MANGA.ink,
  },
  sectionKana: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: MANGA.terracotta,
    textTransform: 'uppercase',
  },
});
