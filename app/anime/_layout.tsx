import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Home, List, Play, Sparkles, Plus } from 'lucide-react-native';
import { ANIME } from '@/utils/animeTheme';
import { AnimeAddModal } from '@/components/anime/AnimeAddModal';
import { SectionSwitcher } from '@/components/anime/SectionSwitcher';

export default function AnimeTabsLayout() {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: ANIME.cyan,
          tabBarInactiveTintColor: ANIME.textSoft,
          sceneStyle: { backgroundColor: ANIME.bg },
          tabBarStyle: {
            backgroundColor: ANIME.bg2,
            borderTopColor: ANIME.line,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: 78,
            paddingTop: 8,
            paddingBottom: 16,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            fontWeight: '700',
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
            tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
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
                  <Plus size={26} color="#0E0B1A" strokeWidth={2.6} />
                </View>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="viendo"
          options={{
            title: 'Viendo',
            tabBarIcon: ({ color, size }) => <Play size={size} color={color} fill={color} />,
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

      <AnimeAddModal visible={adding} onClose={() => setAdding(false)} />
      <SectionSwitcher section="anime" />
    </>
  );
}

const styles = StyleSheet.create({
  addFab: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ANIME.cyan,
    shadowColor: ANIME.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginTop: -8,
  },
});
