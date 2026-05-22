import React from 'react';
import { AnimeListView } from '@/components/anime/AnimeListView';

export default function AnimeCompletadosScreen() {
  return <AnimeListView title="Completados" eyebrow="Terminados" fixedFilter="completado" />;
}
