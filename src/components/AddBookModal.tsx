import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useColors, useSerifFamily } from '@/store/theme.store';
import { useBooksStore } from '@/store/books.store';
import { Formato } from '@/types';
import { GENEROS } from '@/utils/constants';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddBookModal({ visible, onClose }: Props) {
  const c = useColors();
  const serif = useSerifFamily();
  const addBook = useBooksStore((s) => s.addBook);

  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [tengo, setTengo] = useState(false);
  const [leido, setLeido] = useState(false);
  const [formato, setFormato] = useState<Formato | null>(null);
  const [selectedGeneros, setSelectedGeneros] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitulo('');
    setAutor('');
    setTengo(false);
    setLeido(false);
    setFormato(null);
    setSelectedGeneros([]);
  };

  const toggleGenero = (g: string) => {
    setSelectedGeneros((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      Alert.alert('Falta el título', 'Necesitamos saber qué libro es.');
      return;
    }
    setSaving(true);
    try {
      await addBook({
        titulo: titulo.trim(),
        autor: autor.trim(),
        fecha_salida: null,
        tengo,
        leido,
        leido_en: null,
        coleccion: 'mi_biblioteca',
        formato,
        generos: selectedGeneros,
        notas: null,
        imagen_url: null,
      });
      reset();
      onClose();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el libro.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: c.paper }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.wineDeep, fontFamily: serif }]}>
              Nuevo libro
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={26} color={c.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            <Field label="Título" color={c.inkSoft}>
              <Input
                value={titulo}
                onChangeText={setTitulo}
                placeholder="El nombre del viento"
                color={c}
              />
            </Field>

            <Field label="Autor / Autora" color={c.inkSoft}>
              <Input
                value={autor}
                onChangeText={setAutor}
                placeholder="Patrick Rothfuss"
                color={c}
              />
            </Field>

            <Field label="Formato" color={c.inkSoft}>
              <View style={styles.genreGrid}>
                {([
                  { key: 'fisico', label: '📖 Físico' },
                  { key: 'digital', label: '📱 Digital' },
                ] as { key: Formato; label: string }[]).map((opt) => {
                  const active = formato === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => {
                        const next = active ? null : opt.key;
                        setFormato(next);
                        if (next === 'digital') setTengo(false);
                      }}
                      style={[
                        styles.genreChip,
                        styles.formatoChip,
                        {
                          backgroundColor: active ? c.wine : c.paperCard,
                          borderColor: active ? c.wine : c.rule,
                        },
                      ]}
                    >
                      <Text style={[styles.genreChipText, { color: active ? c.paperCard : c.inkSoft }]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <Field label="Géneros" color={c.inkSoft}>
              <View style={styles.genreGrid}>
                {GENEROS.map((g) => {
                  const active = selectedGeneros.includes(g);
                  return (
                    <Pressable
                      key={g}
                      onPress={() => toggleGenero(g)}
                      style={[
                        styles.genreChip,
                        {
                          backgroundColor: active ? c.wine : c.paperCard,
                          borderColor: active ? c.wine : c.rule,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.genreChipText,
                          { color: active ? c.paperCard : c.inkSoft },
                        ]}
                      >
                        {g}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            {formato !== 'digital' && (
              <ToggleRow
                label="Ya lo tengo"
                hint="En la repisa de casa"
                value={tengo}
                onChange={setTengo}
                c={c}
                serif={serif}
              />
            )}

            <ToggleRow
              label="Ya lo leí"
              hint="Lo terminé de leer"
              value={leido}
              onChange={setLeido}
              c={c}
              serif={serif}
            />

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[
                styles.saveBtn,
                { backgroundColor: c.wine, opacity: saving ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.saveTxt, { color: c.paperCard, fontFamily: serif }]}>
                {saving ? 'Guardando…' : 'Guardar libro'}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function Field({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.fieldLabel, { color }]}>{label}</Text>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
  c,
  serif,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
  c: ReturnType<typeof useColors>;
  serif: string;
}) {
  return (
    <View
      style={[
        styles.toggleRow,
        { backgroundColor: c.paperCard, borderColor: c.rule },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, { color: c.wineDeep, fontFamily: serif }]}>
          {label}
        </Text>
        <Text style={[styles.toggleHint, { color: c.inkSoft }]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: c.roseSoft, true: c.wine }}
        thumbColor={c.paperCard}
      />
    </View>
  );
}

function Input(props: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  color: ReturnType<typeof useColors>;
}) {
  return (
    <TextInput
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor={props.color.inkSoft}
      style={{
        backgroundColor: props.color.paperCard,
        borderColor: props.color.rule,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: props.color.ink,
      }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  title: { fontSize: 28, fontWeight: '500' },
  body: { paddingHorizontal: 22, paddingBottom: 40 },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  genreChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  formatoChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  toggleLabel: { fontSize: 18 },
  toggleHint: { fontSize: 12, marginTop: 2 },
  saveBtn: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveTxt: { fontSize: 18, fontWeight: '600' },
});
