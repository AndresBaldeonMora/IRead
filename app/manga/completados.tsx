import React from 'react';
import { MangaListView } from '@/components/manga/MangaListView';

export default function MangaCompletadosScreen() {
  return <MangaListView title="Completados" fixedFilter="completado" />;
}
