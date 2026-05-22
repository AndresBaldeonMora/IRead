import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSplashStore, SplashSection } from '@/store/splash.store';
import { ANIME } from '@/utils/animeTheme';
import { MANGA } from '@/utils/mangaTheme';

const IMAGES: Record<SplashSection, ReturnType<typeof require>> = {
  books: require('../../assets/Bungou.png'),
  anime: require('../../assets/Naruto.png'),
  manga: require('../../assets/Saiki.png'),
};

const NAV_AT = 750;
const OUT_AT = 1350;
const HIDE_AT = 1800;

export function SectionSplash() {
  const visible = useSplashStore((s) => s.visible);
  const section = useSplashStore((s) => s.section);
  const navigate = useSplashStore((s) => s.navigate);
  const hide = useSplashStore((s) => s.hide);

  const bgOpacity = useRef(new Animated.Value(0)).current;
  const imgScale = useRef(new Animated.Value(0.5)).current;
  const imgOpacity = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  const floatLoop = useRef<Animated.CompositeAnimation | null>(null);
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t3 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;

    bgOpacity.setValue(0);
    imgScale.setValue(0.5);
    imgOpacity.setValue(0);
    floatY.setValue(0);

    Animated.parallel([
      Animated.timing(bgOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(imgScale, { toValue: 1, tension: 140, friction: 8, useNativeDriver: true }),
      Animated.timing(imgOpacity, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start(() => {
      floatLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(floatY, { toValue: -9, duration: 720, useNativeDriver: true }),
          Animated.timing(floatY, { toValue: 0, duration: 720, useNativeDriver: true }),
        ])
      );
      floatLoop.current.start();
    });

    t1.current = setTimeout(() => navigate?.(), NAV_AT);

    t2.current = setTimeout(() => {
      floatLoop.current?.stop();
      Animated.parallel([
        Animated.timing(imgScale, { toValue: 1.12, duration: 210, useNativeDriver: true }),
        Animated.timing(imgOpacity, { toValue: 0, duration: 210, useNativeDriver: true }),
        Animated.timing(bgOpacity, { toValue: 0, duration: 300, delay: 60, useNativeDriver: true }),
      ]).start();
    }, OUT_AT);

    t3.current = setTimeout(() => hide(), HIDE_AT);

    return () => {
      [t1, t2, t3].forEach((r) => { if (r.current) clearTimeout(r.current); });
      floatLoop.current?.stop();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.overlay, { opacity: bgOpacity }]}
      pointerEvents="none"
    >
      <Background section={section} />
      <Animated.View
        style={{ opacity: imgOpacity, transform: [{ scale: imgScale }, { translateY: floatY }] }}
      >
        <Image source={IMAGES[section]} style={styles.image} resizeMode="contain" />
      </Animated.View>
    </Animated.View>
  );
}

function Background({ section }: { section: SplashSection }) {
  if (section === 'manga') {
    return <LinearGradient colors={[MANGA.bgTop, MANGA.bgBottom]} style={StyleSheet.absoluteFill} />;
  }
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: section === 'anime' ? ANIME.bg : '#F1E6D1' }]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 180,
    height: 180,
  },
});
