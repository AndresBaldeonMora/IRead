import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { initializeDatabase } from '@/db/schema';
import { useBooksStore } from '@/store/books.store';
import { useAnimesStore } from '@/store/animes.store';
import { useMangasStore } from '@/store/mangas.store';
import { useThemeStore, useColors } from '@/store/theme.store';
import { SectionSplash } from '@/components/SectionSplash';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadBooks = useBooksStore((s) => s.loadBooks);
  const loadAnimes = useAnimesStore((s) => s.loadAnimes);
  const loadMangas = useMangasStore((s) => s.loadMangas);
  const loadTheme = useThemeStore((s) => s.loadTheme);

  useEffect(() => {
    (async () => {
      try {
        await initializeDatabase();
        await loadTheme();
        await loadBooks();
        await loadAnimes();
        await loadMangas();
        setReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      } catch (e) {
        console.error('Init error', e);
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [loadBooks, loadAnimes, loadMangas, loadTheme]);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Error al iniciar</Text>
        <Text style={{ textAlign: 'center', color: '#888' }}>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return <Loading />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemedShell />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedShell() {
  const c = useColors();
  return (
    <>
      <StatusBar style={c.statusBarStyle === 'dark' ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.paper },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="anime" options={{ animation: 'none' }} />
        <Stack.Screen name="manga" options={{ animation: 'none' }} />
        <Stack.Screen
          name="libro/[id]"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="animeDetalle/[id]"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="mangaDetalle/[id]"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ajustes"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
      <SectionSplash />
    </>
  );
}

function Loading() {
  const floatY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatY, { toValue: -9, duration: 720, useNativeDriver: true }),
          Animated.timing(floatY, { toValue: 0, duration: 720, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1E6D1' }}>
      <Animated.View style={{ alignItems: 'center', gap: 16, opacity, transform: [{ translateY: floatY }] }}>
        <Image
          source={require('../assets/Bungou.png')}
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
        <Text style={{ color: '#7A2E3A', fontStyle: 'italic', fontSize: 16, letterSpacing: 0.5 }}>
          Mi Biblioteca
        </Text>
      </Animated.View>
    </View>
  );
}
