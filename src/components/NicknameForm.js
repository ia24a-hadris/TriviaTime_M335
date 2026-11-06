import { useState } from 'react';
import { Modal, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import TextField from './TextField';
import AppButton from './AppButton';
import { validateNickname, NICKNAME_MAX } from '@/services/validation';
import { colors, sizes, text } from '@/theme';

const HELP = '3–15 Zeichen, nur Buchstaben und Zahlen.';

/**
 * Nickname-Formular (Kernaktivität K1). Wird an zwei Orten gebraucht:
 * beim ersten Start (eingebettet in Home) und im Modal «Nickname ändern».
 * Gleiche Validierung an beiden Orten (Konsistenz).
 */
export function NicknameForm({ initialValue = '', submitTitle = 'Los geht’s', onSubmit, onCancel }) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const error = validateNickname(value);
  const showError = touched && error;

  async function submit() {
    setTouched(true);
    if (error) return;
    setSaving(true);
    try {
      await onSubmit(value.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <TextField
        label="Nickname"
        value={value}
        onChangeText={(t) => {
          setValue(t);
          if (t.length >= 3) setTouched(true); // ab 3 Zeichen live prüfen
        }}
        onBlur={() => value.length > 0 && setTouched(true)}
        error={showError ? error : null}
        help={HELP}
        placeholder="z. B. QuizMaus88"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={NICKNAME_MAX + 5}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <View style={styles.buttons}>
        <AppButton title={submitTitle} onPress={submit} loading={saving} disabled={touched && !!error} />
        {onCancel && <AppButton title="Abbrechen" variant="ghost" onPress={onCancel} small />}
      </View>
    </View>
  );
}

/** Modal «Nickname ändern» (Workflow: ✎ antippen → Modal → Speichern / Abbrechen → Home). */
export function NicknameModal({ visible, currentNickname, onSave, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <Text style={text.title} accessibilityRole="header">
            Nickname ändern
          </Text>
          <Text style={text.help}>Der neue Name gilt für alle künftigen Scores.</Text>
          {/* key sorgt dafür, dass das Formular beim Öffnen mit dem aktuellen Namen startet */}
          <NicknameForm
            key={visible ? 'open' : 'closed'}
            initialValue={currentNickname ?? ''}
            submitTitle="Speichern"
            onSubmit={onSave}
            onCancel={onClose}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  form: { gap: sizes.gap * 2 },
  buttons: { gap: sizes.gap },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(28,27,46,0.45)' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 32,
    gap: sizes.gap * 1.5,
  },
});
