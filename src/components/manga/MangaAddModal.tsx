import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MangaEstado, MangaSerie, MangaTipo } from '@/types';
import { MANGA, MANGA_STATUS, hardShadow } from '@/utils/mangaTheme';
import { useMangasStore } from '@/store/mangas.store';

export function MangaAddModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const addManga = useMangasStore((s) => s.addManga);

  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [tipo, setTipo] = useState<MangaTipo>('manga');
  const [total, setTotal] = useState('');
  const [leidos, setLeidos] = useState('0');
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [serie, setSerie] = useState<MangaSerie>('serializacion');
  const [estado, setEstado] = useState<MangaEstado>('leyendo');

  const canSave = !!titulo.trim() && !!autor.trim() && parseInt(total, 10) > 0;
  const accent = MANGA_STATUS[estado].bg;
  const unidad = tipo === 'manwha' ? 'capitulo' : 'tomo';

  const reset = () => {
    setTitulo('');
    setAutor('');
    setTipo('manga');
    setTotal('');
    setLeidos('0');
    setAnio(String(new Date().getFullYear()));
    setSerie('serializacion');
    setEstado('leyendo');
  };

  const handleSave = async () => {
    if (!canSave) return;
    const totalNum = parseInt(total, 10);
    await addManga({
      titulo: titulo.trim(),
      autor: autor.trim(),
      tipo,
      unidad,
      total: totalNum,
      leidos: Math.max(0, Math.min(parseInt(leidos || '0', 10), totalNum)),
      anio: parseInt(anio, 10) || new Date().getFullYear(),
      serie,
      estado,
      color: accent,
      notas: null,
    });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.titleRow}>
            <Text style={styles.title}>Nuevo {tipo === 'manwha' ? 'manwha' : 'manga'}</Text>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 460 }}>
            {/* tipo / formato */}
            <Label>Formato</Label>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(
                [
                  { v: 'manga', l: 'Manga', desc: 'Japón' },
                  { v: 'manwha', l: 'Manwha', desc: 'Corea' },
                ] as { v: MangaTipo; l: string; desc: string }[]
              ).map((o) => {
                const active = tipo === o.v;
                return (
                  <Pressable
                    key={o.v}
                    onPress={() => setTipo(o.v)}
                    style={[
                      styles.formatBtn,
                      active
                        ? { backgroundColor: MANGA.ink, ...hardShadow(2, 2, MANGA.terracotta) }
                        : { backgroundColor: MANGA.paper },
                    ]}
                  >
                    <Text style={{ color: active ? MANGA.paper : MANGA.ink, fontWeight: '800', fontSize: 13 }}>
                      {o.l}
                    </Text>
                    <Text style={{ color: active ? MANGA.paper : MANGA.ink, opacity: 0.7, fontWeight: '600', fontSize: 10, letterSpacing: 0.6 }}>
                      {o.desc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Field label="Título" value={titulo} onChange={setTitulo} placeholder="p. ej. Berserk" />
            <Field label="Autor / creador" value={autor} onChange={setAutor} placeholder="p. ej. Kentaro Miura" />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Field
                label={tipo === 'manwha' ? 'Caps. totales' : 'Tomos totales'}
                value={total}
                onChange={setTotal}
                placeholder="12"
                keyboard="numeric"
                flex
              />
              <Field label="Leídos" value={leidos} onChange={setLeidos} placeholder="0" keyboard="numeric" flex />
              <Field label="Año" value={anio} onChange={setAnio} placeholder="2024" keyboard="numeric" flex />
            </View>

            <Label>Estado de la serie</Label>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(
                [
                  { v: 'serializacion', l: 'Activa' },
                  { v: 'finalizada', l: 'Finalizada' },
                  { v: 'pausa', l: 'En pausa' },
                ] as { v: MangaSerie; l: string }[]
              ).map((o) => {
                const active = serie === o.v;
                return (
                  <Pressable
                    key={o.v}
                    onPress={() => setSerie(o.v)}
                    style={[
                      styles.serieBtn,
                      { backgroundColor: active ? MANGA.sepia : MANGA.paper },
                    ]}
                  >
                    <Text style={{ color: active ? MANGA.paper : MANGA.ink, fontWeight: '700', fontSize: 12 }}>
                      {o.l}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Label>Tu estado de lectura</Label>
            <View style={styles.grid}>
              {(Object.keys(MANGA_STATUS) as MangaEstado[]).map((k) => {
                const s = MANGA_STATUS[k];
                const active = estado === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => setEstado(k)}
                    style={[
                      styles.statusBtn,
                      active
                        ? { backgroundColor: s.bg, ...hardShadow(2, 2) }
                        : { backgroundColor: MANGA.paper },
                    ]}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: active ? s.text : s.bg,
                        borderWidth: 1,
                        borderColor: active ? s.text : MANGA.ink,
                      }}
                    />
                    <Text style={{ color: active ? s.text : MANGA.ink, fontWeight: '800', fontSize: 12 }}>
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <Pressable onPress={onClose} style={[styles.btn, styles.cancel]}>
              <Text style={{ color: MANGA.ink, fontWeight: '800', fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={[
                styles.btn,
                {
                  flex: 2,
                  backgroundColor: canSave ? MANGA.gold : MANGA.panel,
                  ...(canSave ? hardShadow(3, 3) : {}),
                },
              ]}
            >
              <Text style={{ color: canSave ? MANGA.ink : MANGA.brown, fontWeight: '800', fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Guardar obra
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard,
  flex,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboard?: 'numeric';
  flex?: boolean;
}) {
  return (
    <View style={flex ? { flex: 1 } : undefined}>
      <Label>{label}</Label>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={MANGA.brown}
        keyboardType={keyboard === 'numeric' ? 'number-pad' : 'default'}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,15,10,0.55)' },
  sheet: {
    backgroundColor: MANGA.paper,
    borderTopWidth: 2,
    borderTopColor: MANGA.ink,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 22,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: MANGA.ink,
    alignSelf: 'center',
    marginBottom: 18,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, color: MANGA.ink },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: MANGA.brown,
    marginBottom: 7,
    marginTop: 12,
    paddingLeft: 2,
  },
  input: {
    paddingVertical: 11,
    paddingHorizontal: 13,
    backgroundColor: MANGA.paper,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
    fontSize: 14,
    fontWeight: '600',
    color: MANGA.ink,
  },
  formatBtn: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
  },
  serieBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: MANGA.ink,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: {
    width: '47.5%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: MANGA.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: MANGA.ink },
  cancel: { backgroundColor: 'transparent' },
});
