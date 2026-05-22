import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Home, BookOpen, Heart, Sparkles, Plus } from 'lucide-react-native';
import { MANGA, hardShadow } from '@/utils/mangaTheme';
import { MangaAddModal } from '@/components/manga/MangaAddModal';
import { SectionSwitcher } from '@/components/anime/SectionSwitcher';

export default function MangaTabsLayout() {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: MANGA.terracotta,
          tabBarInactiveTintColor: MANGA.brown,
          sceneStyle: { backgroundColor: MANGA.bgTop },
          tabBarStyle: {
            backgroundColor: MANGA.paper,
            borderTopColor: MANGA.ink,
            borderTopWidth: 2,
            height: 80,
            paddingTop: 8,
            paddingBottom: 16,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            fontWeight: '800',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="lista"
          options={{
            title: 'Lista',
            tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="agregar"
          options={{
            title: '',
            tabBarButton: (props) => (
              <Pressable
                {...(props as object)}
                onPress={() => setAdding(true)}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <View style={styles.addFab}>
                  <Plus size={26} color={MANGA.ink} strokeWidth={2.6} />
                </View>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="leyendo"
          options={{
            title: 'Leyendo',
            tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="completados"
          options={{
            title: 'Done',
            tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
          }}
        />
      </Tabs>

      <MangaAddModal visible={adding} onClose={() => setAdding(false)} />
      <SectionSwitcher section="manga" />
    </>
  );
}

const styles = StyleSheet.create({
  addFab: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MANGA.gold,
    borderWidth: 2,
    borderColor: MANGA.ink,
    marginTop: -8,
    ...hardShadow(3, 3),
  },
});
