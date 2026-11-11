import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, sizes } from '@/theme';

/**
 * Stepper − / Zahl / + mit Grenzen (min/max).
 * Fehler vermeiden: − und + sind an den Grenzen gesperrt.
 * Die Zahl kann auch direkt eingetippt werden; die Prüfung macht das Formular (Fehler beim Feld).
 * value ist ein String, damit auch leere oder ungültige Eingaben angezeigt werden können.
 */
export default function Stepper({ value, onChange, min, max, hasError, label }) {
  const num = parseInt(value, 10);
  const valid = !Number.isNaN(num);
  const canMinus = valid ? num > min : true;
  const canPlus = valid ? num < max : true;

  // onChange bekommt eine Funktion (wie ein useState-Setter), damit auch schnelle
  // Mehrfach-Taps jeweils vom aktuellsten Wert aus rechnen.
  function step(delta) {
    onChange((prev) => {
      const n = parseInt(prev, 10);
      const base = Number.isNaN(n) ? min : n;
      return String(Math.min(max, Math.max(min, base + delta)));
    });
  }

  return (
    <View style={styles.row}>
      <StepButton icon="remove" label="Weniger Fragen" disabled={!canMinus} onPress={() => step(-1)} />
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, 2))}
        keyboardType="number-pad"
        accessibilityLabel={label}
        style={[styles.input, hasError && styles.inputError]}
        maxLength={2}
        selectTextOnFocus
      />
      <StepButton icon="add" label="Mehr Fragen" disabled={!canPlus} onPress={() => step(1)} />
    </View>
  );
}

function StepButton({ icon, label, disabled, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, disabled && styles.btnDisabled]}
    >
      <Ionicons name={icon} size={26} color={disabled ? colors.disabled : colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: sizes.gap * 1.5 },
  btn: {
    width: sizes.mainButton,
    height: sizes.mainButton,
    borderRadius: sizes.radiusSmall,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.primarySoft },
  btnDisabled: { backgroundColor: '#F1F0F6' },
  input: {
    flex: 1,
    minWidth: 0, // sonst wird das Feld im Web zu breit und drückt «+» aus dem Bild
    height: sizes.mainButton,
    borderRadius: sizes.radiusSmall,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    textAlign: 'center',
    fontFamily: fonts.black,
    fontSize: 22,
    color: colors.text,
  },
  inputError: { borderColor: colors.wrong, borderWidth: 2 },
});
