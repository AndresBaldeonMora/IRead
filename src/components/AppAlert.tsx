import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors, useSerifFamily } from '@/store/theme.store';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AlertConfig {
  title: string;
  message?: string;
  icon?: string;
  buttons?: AlertButton[];
}

export function useAppAlert() {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = (cfg: AlertConfig) => setConfig(cfg);

  const AlertNode = config ? (
    <AppAlert
      {...config}
      visible
      onDismiss={() => setConfig(null)}
    />
  ) : null;

  return { showAlert, AlertNode };
}

interface AppAlertProps extends AlertConfig {
  visible: boolean;
  onDismiss: () => void;
}

export function AppAlert({
  visible,
  title,
  message,
  icon,
  buttons = [{ text: 'OK' }],
  onDismiss,
}: AppAlertProps) {
  const c = useColors();
  const serif = useSerifFamily();

  const handlePress = (btn: AlertButton) => {
    onDismiss();
    btn.onPress?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: c.paper, shadowColor: c.wineDeep }]}>
          {icon ? (
            <Text style={styles.icon}>{icon}</Text>
          ) : null}

          <Text style={[styles.title, { color: c.wineDeep, fontFamily: serif }]}>
            {title}
          </Text>

          {message ? (
            <Text style={[styles.message, { color: c.inkSoft }]}>
              {message}
            </Text>
          ) : null}

          <View style={[styles.divider, { backgroundColor: c.rule }]} />

          <View style={styles.btnCol}>
            {[...buttons].reverse().map((btn, i) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';

              return (
                <Pressable
                  key={i}
                  onPress={() => handlePress(btn)}
                  style={({ pressed }) => [
                    styles.btn,
                    isDestructive && [styles.btnDestructive, { borderColor: '#E53935' + '55' }],
                    isCancel && [styles.btnCancel, { borderColor: c.rule }],
                    !isDestructive && !isCancel && [styles.btnPrimary, { backgroundColor: c.wine }],
                    pressed && { opacity: 0.72 },
                  ]}
                >
                  <Text
                    style={[
                      styles.btnText,
                      isDestructive && { color: '#E53935', fontFamily: serif },
                      isCancel && { color: c.inkSoft },
                      !isDestructive && !isCancel && { color: c.paperCard, fontFamily: serif },
                    ]}
                  >
                    {btn.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 10, 20, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 14,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 6,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginTop: 18,
    marginBottom: 16,
  },
  btnCol: {
    width: '100%',
    gap: 10,
  },
  btn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnPrimary: {},
  btnDestructive: {
    borderWidth: 1,
  },
  btnCancel: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
