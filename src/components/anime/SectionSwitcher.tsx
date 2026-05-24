import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { switcherY } from '@/utils/switcherAnim';
import { useRouter } from 'expo-router';
import { BookOpen, Play, BookMarked } from 'lucide-react-native';
import { ANIME } from '@/utils/animeTheme';
import { MANGA } from '@/utils/mangaTheme';
import { useSplashStore } from '@/store/splash.store';

const WINE = '#7A2E3A';

type Section = 'books' | 'anime' | 'manga';

export function SectionSwitcher({ section }: { section: Section }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const trigger = useSplashStore((s) => s.trigger);
  const isManga = section === 'manga';

  function goTo(target: Section, path: string) {
    if (section === target) return;
    trigger(target, () => router.replace(path as never));
  }

  const containerStyle =
    section === 'anime'
      ? { backgroundColor: 'rgba(28,23,53,0.92)', borderColor: 'rgba(255,255,255,0.10)', borderRadius: 999, borderWidth: StyleSheet.hairlineWidth }
      : isManga
      ? { backgroundColor: 'rgba(255,247,236,0.96)', borderColor: MANGA.ink, borderRadius: 4, borderWidth: 1.5 }
      : { backgroundColor: 'rgba(251,243,226,0.95)', borderColor: 'rgba(74,26,38,0.10)', borderRadius: 999, borderWidth: StyleSheet.hairlineWidth };

  const inactiveColor =
    section === 'anime' ? 'rgba(242,237,255,0.6)' : isManga ? MANGA.brown : 'rgba(74,26,38,0.55)';

  return (
    <Animated.View
      style={[styles.wrap, { top: insets.top + 6, transform: [{ translateY: switcherY }] }]}
      pointerEvents="box-none"
    >
      <View style={[styles.pill, containerStyle, isManga ? styles.pillManga : null]}>
        <Seg
          active={section === 'books'}
          onPress={() => goTo('books', '/')}
          label="Libros"
          icon={<BookOpen size={13} color={section === 'books' ? '#FFFFFF' : inactiveColor} strokeWidth={2} />}
          activeBg={WINE}
          inactiveColor={inactiveColor}
          square={isManga}
        />
        <Seg
          active={section === 'anime'}
          onPress={() => goTo('anime', '/anime')}
          label="Animes"
          icon={
            <Play
              size={13}
              color={section === 'anime' ? '#EDE8D5' : inactiveColor}
              fill={section === 'anime' ? '#EDE8D5' : 'transparent'}
              strokeWidth={2}
            />
          }
          activeBg={ANIME.cyan}
          activeText="#EDE8D5"
          inactiveColor={inactiveColor}
          square={isManga}
        />
        <Seg
          active={isManga}
          onPress={() => goTo('manga', '/manga')}
          label="Manga"
          icon={<BookMarked size={13} color={isManga ? '#FFF7EC' : inactiveColor} strokeWidth={2} />}
          activeBg={MANGA.terracotta}
          activeText="#FFF7EC"
          inactiveColor={inactiveColor}
          square={isManga}
        />
      </View>
    </Animated.View>
  );
}

function Seg({
  active,
  onPress,
  label,
  icon,
  activeBg,
  activeText = '#FFFFFF',
  inactiveColor,
  square,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  icon: React.ReactNode;
  activeBg: string;
  activeText?: string;
  inactiveColor: string;
  square?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.seg,
        square ? styles.segSquare : null,
        active && {
          backgroundColor: activeBg,
          ...(square
            ? { borderWidth: 1.5, borderColor: MANGA.ink }
            : { shadowColor: activeBg, shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 1 } }),
        },
      ]}
    >
      {icon}
      <Text
        style={{
          fontSize: 11.5,
          fontWeight: square ? '800' : '700',
          letterSpacing: 0.4,
          color: active ? activeText : inactiveColor,
          textTransform: square && active ? 'uppercase' : 'none',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pillManga: {
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: MANGA.ink,
    shadowOffset: { width: 3, height: 3 },
  },
  seg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  segSquare: {
    borderRadius: 2,
  },
});
