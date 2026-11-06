import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, sizes } from '@/theme';

/** Runder Icon-Button (z. B. ✎ im Header, ← Zurück, ✕ im Quiz). Immer mindestens 48 × 48 dp. */
export default function IconButton({ icon, onPress, label, color = colors.primary, filled = true, size = 56 }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        { width: Math.max(size, sizes.touchMin), height: Math.max(size, sizes.touchMin) },
        filled && styles.filled,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={24} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  filled: { backgroundColor: colors.primarySoft },
  pressed: { opacity: 0.6 },
});
