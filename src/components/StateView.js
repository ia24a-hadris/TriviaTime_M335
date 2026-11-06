import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppButton from './AppButton';
import { colors, fonts, sizes } from '@/theme';

/**
 * Sonderzustände (Konzept 9.1 «Erklären» und «Auffangen»):
 * kind: 'loading' | 'error' | 'empty'. Immer mit klarer Meldung und – wo sinnvoll – einem Button.
 */
export default function StateView({ kind, title, message, actionTitle, onAction, actionIcon = 'refresh', dark = false }) {
  const fg = dark ? colors.white : colors.text;
  const muted = dark ? '#C9C3EE' : colors.textMuted;

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      {kind === 'loading' ? (
        <ActivityIndicator size="large" color={dark ? colors.yellow : colors.primary} />
      ) : (
        <View style={[styles.iconCircle, kind === 'error' && styles.errorCircle]}>
          <Ionicons
            name={kind === 'error' ? 'cloud-offline-outline' : 'file-tray-outline'}
            size={30}
            color={kind === 'error' ? colors.wrong : colors.primary}
          />
        </View>
      )}
      {title && <Text style={[styles.title, { color: fg }]}>{title}</Text>}
      {message && <Text style={[styles.message, { color: muted }]}>{message}</Text>}
      {actionTitle && onAction && (
        <AppButton title={actionTitle} onPress={onAction} variant={dark ? 'yellow' : 'secondary'} icon={actionIcon} small />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: sizes.gap * 1.5, padding: 20 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCircle: { backgroundColor: '#FCE8E6' },
  title: { fontFamily: fonts.extraBold, fontSize: 18, textAlign: 'center' },
  message: { fontFamily: fonts.regular, fontSize: 15, textAlign: 'center', lineHeight: 21 },
});
