import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, sizes, text } from '@/theme';

/**
 * Eingabefeld mit Label, Hilfetext und Fehlermeldung direkt beim Feld
 * (Fehlertoleranz: Ursache + Lösung in einfachem Deutsch, ohne Fehlercodes).
 */
export default function TextField({ label, value, onChangeText, error, help, ...inputProps }) {
  return (
    <View style={styles.wrap}>
      {label && <Text style={text.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        style={[styles.input, error && styles.inputError]}
        {...inputProps}
      />
      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Ionicons name="warning" size={16} color={colors.wrong} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        help && <Text style={text.help}>{help}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: {
    minHeight: sizes.mainButton,
    borderRadius: sizes.radiusSmall,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
  },
  inputError: { borderColor: colors.wrong, borderWidth: 2 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  error: { fontFamily: fonts.bold, fontSize: 13, color: colors.wrong, flex: 1 },
});
