import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { answerStyles, colors, fonts, sizes } from '@/theme';

/**
 * Antwortfeld im Frage-Screen: breites Rechteck (64 dp hoch) mit Farbe, Symbol und Buchstabe.
 * state: 'open' | 'correct' | 'wrong' | 'dimmed'
 *  - correct: ✓ + «richtig» + weisser Rahmen
 *  - wrong:   ✗ + «deine Antwort»
 *  - dimmed:  ausgegraut (weder richtig noch gewählt)
 * So ist das Feedback auch ohne Farbe verständlich (Konzept 8.3).
 */
export default function AnswerOption({ index, label, state = 'open', onPress }) {
  const a = answerStyles[index];
  const isOpen = state === 'open';

  return (
    <Pressable
      onPress={onPress}
      disabled={!isOpen}
      accessibilityRole="button"
      accessibilityLabel={`Antwort ${a.letter}: ${label}${feedbackText(state)}`}
      style={({ pressed }) => [
        styles.box,
        { backgroundColor: a.color },
        pressed && styles.pressed,
        state === 'correct' && styles.correctBorder,
        state === 'dimmed' && styles.dimmed,
      ]}
    >
      <View style={styles.badge}>
        <Ionicons name={a.icon} size={16} color={a.color} />
      </View>
      <Text style={styles.letter}>{a.letter}</Text>
      <Text style={styles.label} numberOfLines={3}>
        {label}
      </Text>
      {state === 'correct' && <Feedback icon="checkmark-circle" text="richtig" />}
      {state === 'wrong' && <Feedback icon="close-circle" text="deine Antwort" />}
    </Pressable>
  );
}

function Feedback({ icon, text }) {
  return (
    <View style={styles.feedback}>
      <Ionicons name={icon} size={22} color={colors.white} />
      <Text style={styles.feedbackText}>{text}</Text>
    </View>
  );
}

function feedbackText(state) {
  if (state === 'correct') return ', richtig';
  if (state === 'wrong') return ', deine Antwort, falsch';
  return '';
}

const styles = StyleSheet.create({
  box: {
    minHeight: sizes.answer,
    borderRadius: sizes.radius,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  correctBorder: { borderColor: colors.white },
  dimmed: { opacity: 0.35 },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontFamily: fonts.black, fontSize: 20, color: colors.white },
  label: { flex: 1, fontFamily: fonts.extraBold, fontSize: 20, color: colors.white },
  feedback: { alignItems: 'center' },
  feedbackText: { fontFamily: fonts.bold, fontSize: 11, color: colors.white },
});
