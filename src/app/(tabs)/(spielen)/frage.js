// Screen 3 · Frage (Pakete T4 UI + S5 Logik) – Special Feature: Fragen live aus der Open Trivia DB
//
// - Alle Fragen der Runde werden mit EINER Anfrage geladen; danach läuft die Runde ohne Netz.
// - Kein Timer: Man bestimmt das Tempo selbst mit «Weiter» (Steuerbarkeit).
// - Nach jeder Antwort sofort ✓/✗ mit Text + Balken «Leider falsch. Richtig ist: …» (Lernförderlichkeit).
// - ✕ und Android-Zurück öffnen das Modal «Quiz abbrechen?»; «Ja, abbrechen» → popToTop (Home).
// - Nach der letzten Frage: Resultat speichern, dann Replace zum Resultat (kein Zurück ins Quiz).
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusedStatusBar from '@/components/FocusedStatusBar';
import { Ionicons } from '@expo/vector-icons';
import IconButton from '@/components/IconButton';
import AnswerOption from '@/components/AnswerOption';
import AppButton from '@/components/AppButton';
import StateView from '@/components/StateView';
import ConfirmModal from '@/components/ConfirmModal';
import { fetchQuestions, errorMessage, DIFFICULTY_LABEL } from '@/services/quizApi';
import * as Quiz from '@/services/quizLogic';
import { getNickname, saveResult } from '@/services/storage';
import { colors, fonts, sizes } from '@/theme';

export default function FrageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [state, setState] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [error, setError] = useState(null);
  const [round, setRound] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const scrollRef = useRef(null);

  const load = useCallback(async () => {
    const settings = {
      categoryId: Number(params.categoryId),
      categoryName: params.categoryName,
      difficulty: params.difficulty,
      amount: Number(params.amount),
    };
    setState('loading');
    try {
      const questions = await fetchQuestions(settings);
      setRound(Quiz.createRound(settings, questions));
      setState('ok');
    } catch (err) {
      setError(errorMessage(err));
      setState('error');
    }
  }, [params.categoryId, params.categoryName, params.difficulty, params.amount]);

  useEffect(() => {
    load();
  }, [load]);

  // Android-Zurück: im Fehlerzustand normal zurück zum Setup, sonst Rückfrage zeigen
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (state === 'error') return false;
        setConfirmOpen(true);
        return true;
      });
      return () => sub.remove();
    }, [state])
  );

  function choose(i) {
    setRound((r) => Quiz.answer(r, i));
  }

  async function goNext() {
    if (!Quiz.isLastQuestion(round)) {
      setRound((r) => Quiz.next(r));
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    // Letzte Frage: Resultat lokal speichern, dann Replace zum Resultat
    setFinishing(true);
    const result = Quiz.summary(round);
    const nickname = (await getNickname()) ?? 'Gast';
    const entry = await saveResult(result, nickname);
    router.replace({
      pathname: '/resultat',
      params: {
        resultId: entry.id,
        categoryId: String(result.categoryId),
        categoryName: result.categoryName,
        difficulty: result.difficulty,
        amount: String(result.amount),
      },
    });
  }

  function abortQuiz() {
    setConfirmOpen(false);
    router.dismissAll(); // popToTop → Home; das abgebrochene Quiz wird nicht gespeichert
  }

  const q = round && Quiz.currentQuestion(round);
  const answered = round?.phase === 'feedback';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <FocusedStatusBar style="light" />

      {/* Kopfzeile: ✕ · Frage x / n · Punkte */}
      <View style={styles.top}>
        <IconButton icon="close" label="Quiz abbrechen" color={colors.white} filled={false} size={48} onPress={() => setConfirmOpen(true)} />
        <Text style={styles.counter} accessibilityRole="header">
          {round ? `Frage ${round.index + 1} / ${round.questions.length}` : 'Quiz'}
        </Text>
        {round && (
          <View style={styles.points} accessibilityLabel={`${round.score} Punkte`}>
            <Ionicons name="star" size={16} color={colors.text} />
            <Text style={styles.pointsText}>{round.score}</Text>
          </View>
        )}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${round ? Quiz.progress(round) * 100 : 0}%` }]} />
      </View>

      {state === 'loading' && <LoadingPlaceholder />}

      {state === 'error' && (
        <View style={styles.center}>
          <StateView
            kind="error"
            dark
            title="Keine Verbindung"
            message={`${error}\nPrüfe WLAN oder mobile Daten.`}
            actionTitle="Erneut versuchen"
            onAction={load}
          />
          <AppButton title="Zurück zum Setup" variant="ghost" small onPress={() => router.back()} style={styles.ghostOnDark} />
        </View>
      )}

      {state === 'ok' && q && (
        <ScrollView ref={scrollRef} contentContainerStyle={styles.body}>
          <View style={{ gap: 12 }}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {round.settings.categoryName} · {DIFFICULTY_LABEL[round.settings.difficulty]}
              </Text>
            </View>
            <View style={styles.questionCard}>
              <Text style={styles.question}>{q.question}</Text>
              <Text style={styles.source}>Frage aus der Open Trivia DB (Englisch)</Text>
            </View>
            {answered && <FeedbackBar correct={Quiz.wasCorrect(round)} answer={q.answers[q.correctIndex]} points={Quiz.pointsPerCorrect(round.settings.difficulty)} />}
          </View>

          <View style={{ gap: 10 }}>
            {q.answers.map((label, i) => (
              <AnswerOption key={`${round.index}-${i}`} index={i} label={label} state={answerState(i, round.selected, q.correctIndex)} onPress={() => choose(i)} />
            ))}
            {answered && (
              <AppButton
                title={Quiz.isLastQuestion(round) ? 'Zum Resultat' : 'Weiter'}
                icon={Quiz.isLastQuestion(round) ? 'flag' : undefined}
                iconRight={Quiz.isLastQuestion(round) ? undefined : 'chevron-forward'}
                variant="yellow"
                onPress={goNext}
                loading={finishing}
                style={{ marginTop: 6 }}
              />
            )}
          </View>
        </ScrollView>
      )}

      <ConfirmModal
        visible={confirmOpen}
        title="Quiz wirklich abbrechen?"
        message="Dein Fortschritt in dieser Runde geht verloren."
        cancelTitle="Weiterspielen"
        confirmTitle="Ja, abbrechen"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={abortQuiz}
      />
    </SafeAreaView>
  );
}

/** Balken oben: zweiter Weg neben den markierten Antworten (Konzept 8.3). */
function FeedbackBar({ correct, answer, points }) {
  return (
    <View style={[styles.feedback, { backgroundColor: correct ? colors.correct : colors.wrong }]} accessibilityLiveRegion="assertive">
      <View style={styles.feedbackIcon}>
        <Ionicons name={correct ? 'checkmark' : 'close'} size={20} color={correct ? colors.correct : colors.wrong} />
      </View>
      <Text style={styles.feedbackText}>{correct ? `Richtig! +${points} Punkte` : `Leider falsch. Richtig ist: ${answer}`}</Text>
    </View>
  );
}

/** «Fragen werden geladen …» mit Platzhaltern in der Form des Screens. */
function LoadingPlaceholder() {
  return (
    <View style={styles.body}>
      <View style={{ gap: 12 }}>
        <View style={[styles.chip, styles.skeletonDark, { width: 160, height: 32 }]} />
        <View style={[styles.questionCard, { alignItems: 'center', gap: 14, paddingVertical: 30 }]}>
          <StateView kind="loading" title="Fragen werden geladen …" message="Danach läuft die Runde auch ohne Netz." />
        </View>
      </View>
      <View style={{ gap: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.skeletonDark, { height: sizes.answer, borderRadius: sizes.radius }]} />
        ))}
      </View>
    </View>
  );
}

function answerState(i, selected, correctIndex) {
  if (selected == null) return 'open';
  if (i === correctIndex) return 'correct';
  if (i === selected) return 'wrong';
  return 'dimmed';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.game },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, paddingRight: sizes.screenPadding },
  counter: { flex: 1, fontFamily: fonts.black, fontSize: 20, color: colors.white },
  points: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.yellow,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 36,
  },
  pointsText: { fontFamily: fonts.black, fontSize: 17, color: colors.text },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: sizes.screenPadding, marginTop: 6 },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.yellow },
  center: { flex: 1, justifyContent: 'center', padding: sizes.screenPadding, gap: sizes.gap },
  ghostOnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
  body: { flexGrow: 1, padding: sizes.screenPadding, gap: 24, justifyContent: 'space-between' },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontFamily: fonts.extraBold, fontSize: 14, color: colors.white },
  questionCard: { backgroundColor: colors.white, borderRadius: 22, padding: 20, gap: 12 },
  question: { fontFamily: fonts.black, fontSize: 23, color: colors.text, lineHeight: 30 },
  source: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textMuted },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: sizes.radius, padding: 14 },
  feedbackIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  feedbackText: { flex: 1, fontFamily: fonts.black, fontSize: 17, color: colors.white },
  skeletonDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
});
