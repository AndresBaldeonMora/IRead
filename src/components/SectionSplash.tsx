import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSplashStore, SplashSection } from '@/store/splash.store';
import { ANIME } from '@/utils/animeTheme';
import { MANGA } from '@/utils/mangaTheme';

const IMAGES: Record<SplashSection, ImageSourcePropType> = {
  books: require('../../assets/Bungou.png'),
  anime: require('../../assets/Naruto.png'),
  manga: require('../../assets/Saiki.png'),
};

const LABELS: Record<SplashSection, string> = {
  books: 'Cargando libros',
  anime: 'Cargando animes',
  manga: 'Cargando mangas',
};

const FRASES = [
  'Te amo',
  'Hecho con amor para ti',
  'Para mi lectora favorita',
  'Eres mi historia favorita',
  'Cada página es para ti',
  'Disfruta tu lectura, mi amor',
  'Te amo más que a todos los libros',
  'Mi persona favorita del mundo',
];

function textColor(section: SplashSection): string {
  if (section === 'books') return '#7A3B4A';
  return '#FFFFFF';
}

const NAV_AT = 750;
const OUT_AT = 2550;
const HIDE_AT = 3000;

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

  const [dots, setDots] = useState('');
  const [frase, setFrase] = useState(FRASES[0]);

  useEffect(() => {
    if (!visible) {
      setDots('');
      return;
    }
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 350);
    return () => clearInterval(id);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    setFrase(FRASES[Math.floor(Math.random() * FRASES.length)]);
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
      <View style={styles.center}>
        <Animated.View
          style={{ opacity: imgOpacity, transform: [{ scale: imgScale }, { translateY: floatY }] }}
        >
          <Image source={IMAGES[section]} style={styles.image} resizeMode="contain" />
        </Animated.View>
        <Animated.Text style={[styles.loading, { color: textColor(section), opacity: imgOpacity }]}>
          {LABELS[section]}
          {dots}
        </Animated.Text>
      </View>
      <Animated.Text style={[styles.frase, { color: textColor(section), opacity: imgOpacity }]}>
        {frase}
      </Animated.Text>
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 180,
    height: 180,
  },
  loading: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    minWidth: 200,
    textAlign: 'center',
  },
  frase: {
    position: 'absolute',
    bottom: 56,
    left: 28,
    right: 28,
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
