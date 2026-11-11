import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { answerStyles, colors, fonts, sizes } from '@/theme';

/**
 * Antwortfeld im Frage-Screen: breites Rechteck (64 dp hoch) mit Farbe, Symbol und Buchstabe.
 * state: 'open' | 'correct' | 'wrong' | 'dimmed'
 *  - correct: «richtig» + ✓ + weisser Rahmen
 *  - wrong:   «deine Antwort» + ✗
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
      accessibilityState={{ disabled: !isOpen }}
      style={({ pressed }) => [
        styles.box,
        { backgroundColor: a.color },
        pressed && styles.pressed,
        state === 'correct' && styles.correctBorder,
        state === 'dimmed' && styles.dimmed,
      ]}
    >
      <View style={styles.iconBox}>
        <Ionicons name={a.icon} size={20} color={colors.white} />
      </View>
      <Text style={styles.label} numberOfLines={3}>
        {label}
      </Text>
      {state === 'correct' && <Feedback text="richtig" icon="checkmark" color={colors.correct} />}
      {state === 'wrong' && <Feedback text="deine Antwort" icon="close" color={colors.wrong} />}
      <View style={styles.letterBox}>
        <Text style={styles.letter}>{a.letter}</Text>
      </View>
    </Pressable>
  );
}

function Feedback({ text, icon, color }) {
  return (
    <View style={styles.feedback}>
      <Text style={styles.feedbackText}>{text}</Text>
      <View style={styles.feedbackCircle}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  correctBorder: { borderColor: colors.white },
  dimmed: { opacity: 0.3 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontFamily: fonts.black, fontSize: 20, color: colors.white },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  feedbackText: { fontFamily: fonts.extraBold, fontSize: 14, color: colors.white },
  feedbackCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontFamily: fonts.black, fontSize: 15, color: colors.white },
});
