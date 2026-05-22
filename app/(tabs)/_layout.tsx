import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, BookMarked, Library, Sparkles, Plus } from 'lucide-react-native';
import { useColors } from '@/store/theme.store';
import { AddBookModal } from '@/components/AddBookModal';
import { SectionSwitcher } from '@/components/anime/SectionSwitcher';

export default function TabsLayout() {
  const c = useColors();
  const [adding, setAdding] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.wine,
          tabBarInactiveTintColor: c.inkSoft,
          tabBarStyle: {
            backgroundColor: c.paperCard,
            borderTopColor: c.rule,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: 78,
            paddingTop: 8,
            paddingBottom: 16,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            fontWeight: '600',
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
          name="biblioteca"
          options={{
            title: 'Eternas',
            tabBarIcon: ({ color, size }) => <BookMarked size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="agregar"
          options={{
            title: '',
            tabBarIcon: () => (
              <View style={[styles.addFab, { backgroundColor: c.wine, shadowColor: c.wineDeep }]}>
                <Plus size={26} color={c.paperCard} strokeWidth={2.4} />
              </View>
            ),
            tabBarButton: (props) => (
              <Pressable
                {...(props as object)}
                onPress={() => setAdding(true)}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <View style={[styles.addFab, { backgroundColor: c.wine, shadowColor: c.wineDeep }]}>
                  <Plus size={26} color={c.paperCard} strokeWidth={2.4} />
                </View>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="deseos"
          options={{
            title: 'Personal',
            tabBarIcon: ({ color, size }) => <Library size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Yo',
            tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
          }}
        />
      </Tabs>

      <AddBookModal visible={adding} onClose={() => setAdding(false)} />
      <SectionSwitcher section="books" />
    </>
  );
}

const styles = StyleSheet.create({
  addFab: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginTop: -8,
  },
});
