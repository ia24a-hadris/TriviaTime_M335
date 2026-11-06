import { Modal, StyleSheet, Text, View } from 'react-native';
import AppButton from './AppButton';
import { colors, sizes, text } from '@/theme';

/**
 * Rückfrage-Modal, z. B. «Quiz wirklich abbrechen?» (K5).
 * Die sichere Aktion (Weiterspielen) ist der Hauptbutton, die zerstörende Aktion steht darunter.
 */
export default function ConfirmModal({ visible, title, message, confirmTitle, cancelTitle, onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.box} accessibilityViewIsModal>
          <Text style={text.title} accessibilityRole="header">
            {title}
          </Text>
          {message && <Text style={text.body}>{message}</Text>}
          <View style={styles.buttons}>
            <AppButton title={cancelTitle} onPress={onCancel} />
            <AppButton title={confirmTitle} onPress={onConfirm} variant="secondary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(28,27,46,0.6)' },
  box: { backgroundColor: colors.background, borderRadius: 24, padding: 22, gap: sizes.gap * 1.5 },
  buttons: { gap: sizes.gap * 1.5, marginTop: 8 },
});
