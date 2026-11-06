import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, sizes } from '@/theme';

/**
 * Segmente (z. B. Leicht / Mittel / Schwer). Die Segmente grenzen bewusst aneinander,
 * weil genau eine Auswahl möglich ist (Konzept 6.2). Jedes Segment ≥ 48 dp hoch.
 */
export default function SegmentedControl({ options, value, onChange, label }) {
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.segment, active && styles.active, pressed && !active && styles.pressed]}
          >
            <Text style={[styles.text, active && styles.activeText]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: '#ECEBF3',
    borderRadius: sizes.radius,
    padding: 4,
  },
  segment: {
    flex: 1,
    minHeight: sizes.mainButton - 8,
    borderRadius: sizes.radiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { backgroundColor: colors.primary },
  pressed: { backgroundColor: '#DFDDEB' },
  text: { fontFamily: fonts.extraBold, fontSize: 17, color: colors.textMuted },
  activeText: { color: colors.white },
});
