import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppAlert } from '@/components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, BookOpen, Calendar } from 'lucide-react-native';
import { useColors, useSerifFamily } from '@/store/theme.store';
import { useBooksStore } from '@/store/books.store';
import { Book, Formato } from '@/types';
import { GENEROS } from '@/utils/constants';

interface Props {
  visible: boolean;
  onClose: () => void;
  bookToEdit?: Book;
}

export function AddBookModal({ visible, onClose, bookToEdit }: Props) {
  const c = useColors();
  const serif = useSerifFamily();
  const addBook = useBooksStore((s) => s.addBook);
  const updateBook = useBooksStore((s) => s.updateBook);
  const isEditing = !!bookToEdit;

  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [editorial, setEditorial] = useState('');
  const [edicion, setEdicion] = useState('');
  const [idioma, setIdioma] = useState('');
  const [tengo, setTengo] = useState(false);
  const [leido, setLeido] = useState(false);
  const [leidoEn, setLeidoEn] = useState<string | null>(null);
  const [formato, setFormato] = useState<Formato | null>(null);
  const [selectedGeneros, setSelectedGeneros] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [mesSheet, setMesSheet] = useState<{ visible: boolean; mes: string; label: string } | null>(null);
  const { showAlert, AlertNode } = useAppAlert();

  useEffect(() => {
    if (bookToEdit) {
      setTitulo(bookToEdit.titulo);
      setAutor(bookToEdit.autor ?? '');
      setEditorial(bookToEdit.editorial ?? '');
      setEdicion(bookToEdit.edicion ?? '');
      setIdioma(bookToEdit.idioma ?? '');
      setTengo(bookToEdit.tengo);
      setLeido(bookToEdit.leido);
      setLeidoEn(bookToEdit.leido_en ?? null);
      setFormato(bookToEdit.formato);
      setSelectedGeneros(bookToEdit.generos);
    } else {
      reset();
    }
  }, [bookToEdit?.id, visible]);

  const reset = () => {
    setTitulo('');
    setAutor('');
    setEditorial('');
    setEdicion('');
    setIdioma('');
    setTengo(false);
    setLeido(false);
    setLeidoEn(null);
    setFormato(null);
    setSelectedGeneros([]);
  };

  const toggleGenero = (g: string) => {
    setSelectedGeneros((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleToggleLeido = (value: boolean) => {
    setLeido(value);
    if (!value) {
      setLeidoEn(null);
      return;
    }
    const now = new Date();
    const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const MESES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const labelMes = `${MESES_ES[now.getMonth()]} ${now.getFullYear()}`;
    setMesSheet({ visible: true, mes: mesActual, label: labelMes });
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      showAlert({ title: 'Falta el título', message: 'Necesitamos saber qué libro es.', icon: '📖' });
      return;
    }
    setSaving(true);
    try {
      if (isEditing && bookToEdit) {
        await updateBook(bookToEdit.id, {
          titulo: titulo.trim(),
          autor: autor.trim(),
          tengo: formato !== 'digital' ? tengo : false,
          leido,
          leido_en: leido ? leidoEn : null,
          formato,
          generos: selectedGeneros,
          editorial: editorial.trim() || null,
          edicion: edicion.trim() || null,
          idioma: idioma.trim() || null,
        } as any);
      } else {
        // Si ya lo tiene → va a Mi Biblioteca; si no → va a Deseos
        const coleccion = (formato !== 'digital' && tengo) ? 'mi_biblioteca' : 'deseos';
        await addBook({
          titulo: titulo.trim(),
          autor: autor.trim(),
          fecha_salida: null,
          tengo: formato !== 'digital' ? tengo : false,
          leido,
          leido_en: leido ? leidoEn : null,
          coleccion,
          formato,
          generos: selectedGeneros,
          notas: null,
          imagen_url: null,
          editorial: editorial.trim() || null,
          edicion: edicion.trim() || null,
          idioma: idioma.trim() || null,
        } as any);
        reset();
      }
      onClose();
    } catch (e) {
      showAlert({ title: 'Error', message: 'No se pudo guardar el libro.', icon: '❌' });
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
        {AlertNode}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.wineDeep, fontFamily: serif }]}>
              {isEditing ? 'Editar libro' : 'Nuevo libro'}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={26} color={c.ink} />
            </Pressable>
          </View>

          {mesSheet && (
            <MesSheet
              visible={mesSheet.visible}
              label={mesSheet.label}
              c={c}
              serif={serif}
              onGuardar={() => {
                setLeidoEn(mesSheet.mes);
                setMesSheet(null);
              }}
              onSinMes={() => {
                setLeidoEn(null);
                setMesSheet(null);
              }}
            />
          )}

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

            <Field label="Editorial" color={c.inkSoft}>
              <Input
                value={editorial}
                onChangeText={setEditorial}
                placeholder="Planeta, Salamandra…"
                color={c}
              />
            </Field>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Field label="Edición" color={c.inkSoft}>
                  <Input
                    value={edicion}
                    onChangeText={setEdicion}
                    placeholder="1ª ed."
                    color={c}
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Idioma" color={c.inkSoft}>
                  <Input
                    value={idioma}
                    onChangeText={setIdioma}
                    placeholder="Español"
                    color={c}
                  />
                </Field>
              </View>
            </View>

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
              onChange={handleToggleLeido}
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
                {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Guardar libro'}
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

function MesSheet({
  visible,
  label,
  c,
  serif,
  onGuardar,
  onSinMes,
}: {
  visible: boolean;
  label: string;
  c: ReturnType<typeof useColors>;
  serif: string;
  onGuardar: () => void;
  onSinMes: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onSinMes}
    >
      <Pressable style={sheetStyles.backdrop} onPress={onSinMes} />
      <View style={[sheetStyles.sheet, { backgroundColor: c.paper }]}>
        {/* Pill handle */}
        <View style={[sheetStyles.handle, { backgroundColor: c.rule }]} />

        {/* Icono + kicker */}
        <View style={sheetStyles.iconRow}>
          <View style={[sheetStyles.iconCircle, { backgroundColor: c.roseSoft }]}>
            <Calendar size={22} color={c.wine} />
          </View>
        </View>

        <Text style={[sheetStyles.kicker, { color: c.gold }]}>· mes de lectura ·</Text>
        <Text style={[sheetStyles.monthLabel, { color: c.wineDeep, fontFamily: serif }]}>
          {label}
        </Text>
        <Text style={[sheetStyles.subtitle, { color: c.inkSoft }]}>
          ¿Registrar este mes como cuando lo terminaste?
        </Text>

        {/* Botón principal */}
        <Pressable
          onPress={onGuardar}
          style={({ pressed }) => [
            sheetStyles.btnPrimary,
            { backgroundColor: c.wine, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <BookOpen size={18} color={c.paperCard} />
          <Text style={[sheetStyles.btnPrimaryTxt, { color: c.paperCard, fontFamily: serif }]}>
            Sí, guardar mes
          </Text>
        </Pressable>

        {/* Botón secundario */}
        <Pressable
          onPress={onSinMes}
          style={({ pressed }) => [
            sheetStyles.btnSecondary,
            { borderColor: c.rule, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[sheetStyles.btnSecondaryTxt, { color: c.inkSoft }]}>
            No, sin mes
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  iconRow: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  btnPrimaryTxt: {
    fontSize: 17,
    fontWeight: '600',
  },
  btnSecondary: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  btnSecondaryTxt: {
    fontSize: 15,
    fontWeight: '500',
  },
});

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
  row: { flexDirection: 'row' },
});
