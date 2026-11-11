import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, sizes, text } from '@/theme';

/**
 * Hauptbutton der App.
 * variant: 'primary' (gefüllt, eine Hauptaktion pro Screen), 'secondary' (Rahmen),
 *          'yellow' (Spiel: «Weiter»), 'ghost' (nur Text).
 * Höhe 56 dp (Hauptbutton) bzw. mindestens 48 dp – siehe Konzept 8.5.
 */
export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  disabled = false,
  loading = false,
  small = false,
  style,
  accessibilityHint,
}) {
  const v = variants[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.base,
        { minHeight: small ? sizes.touchMin : sizes.mainButton },
        v.container,
        pressed && !isDisabled && v.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={v.textColor} />
        ) : (
          icon && <Ionicons name={icon} size={20} color={v.textColor} />
        )}
        <Text style={[text.button, { color: isDisabled ? colors.textMuted : v.textColor }]}>
          {title}
        </Text>
        {iconRight && !loading && <Ionicons name={iconRight} size={20} color={v.textColor} />}
      </View>
    </Pressable>
  );
}

const variants = {
  primary: {
    container: { backgroundColor: colors.primary },
    pressed: { backgroundColor: colors.primaryPressed },
    textColor: colors.white,
  },
  secondary: {
    container: { backgroundColor: colors.card, borderWidth: 2.5, borderColor: colors.primary },
    pressed: { backgroundColor: colors.primarySoft },
    textColor: colors.primary,
  },
  yellow: {
    container: { backgroundColor: colors.yellow },
    pressed: { opacity: 0.85 },
    textColor: colors.text,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    pressed: { backgroundColor: colors.primarySoft },
    textColor: colors.primary,
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: sizes.radius,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled },
});
