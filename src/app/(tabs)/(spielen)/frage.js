// Screen 3 · Frage (Special Feature: Fragen live aus der Open Trivia DB)
//
// Stand Fr 6.11.: Platzhalter für die Navigation (S3) + Anbindung des Quiz-API-Service (S4).
// Die Fragen werden schon echt geladen (inkl. «lädt» und «keine Verbindung»).
// Das fertige Spiel-Design (T4) und die Quiz-Logik mit Punkten (S5) folgen am Mi 11.11.
//
// Navigation: ✕ und Android-Zurück öffnen das Modal «Quiz abbrechen?»;
// «Ja, abbrechen» → popToTop (Home); letzte Frage → Replace zum Resultat.
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import IconButton from '@/components/IconButton';
import AnswerOption from '@/components/AnswerOption';
import AppButton from '@/components/AppButton';
import StateView from '@/components/StateView';
import ConfirmModal from '@/components/ConfirmModal';
import { fetchQuestions, errorMessage } from '@/services/quizApi';
import { colors, fonts, sizes } from '@/theme';

export default function FrageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const settings = {
    categoryId: Number(params.categoryId),
    difficulty: params.difficulty,
    amount: Number(params.amount),
  };

  const [state, setState] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    setSelected(null);
    try {
      // EINE Anfrage für die ganze Runde – danach braucht die Runde kein Netz mehr
      const qs = await fetchQuestions(settings);
      setQuestions(qs);
      setState('ok');
    } catch (err) {
      setError(errorMessage(err));
      setState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.categoryId, params.difficulty, params.amount]);

  useEffect(() => {
    load();
  }, [load]);

  // Android-Zurück: nicht einfach verlassen, sondern Rückfrage zeigen
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (state === 'error') return false; // ohne Fragen normal zurück zum Setup
        setConfirmOpen(true);
        return true;
      });
      return () => sub.remove();
    }, [state])
  );

  function abortQuiz() {
    setConfirmOpen(false);
    router.dismissAll(); // popToTop → Home
  }

  function finish() {
    // Platzhalter-Resultat bis S5: richtig gezählt wird erst mit der Quiz-Logik
    router.replace({
      pathname: '/resultat',
      params: { ...params, correct: '0' },
    });
  }

  const q = questions[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.top}>
        <IconButton icon="close" label="Quiz abbrechen" color={colors.white} filled={false} size={48} onPress={() => setConfirmOpen(true)} />
        <Text style={styles.counter}>{state === 'ok' ? `Frage 1 / ${questions.length}` : 'Quiz'}</Text>
        <View style={{ width: 48 }} />
      </View>

      {state === 'loading' && (
        <View style={styles.center}>
          <StateView kind="loading" dark title="Fragen werden geladen …" message="Danach läuft die Runde auch ohne Netz." />
        </View>
      )}

      {state === 'error' && (
        <View style={styles.center}>
          <StateView kind="error" dark title="Keine Verbindung" message={error} actionTitle="Erneut versuchen" onAction={load} />
          <AppButton title="Zurück zum Setup" variant="ghost" small onPress={() => router.back()} />
        </View>
      )}

      {state === 'ok' && q && (
        <View style={styles.body}>
          <View style={styles.questionCard}>
            <Text style={styles.meta}>
              {q.category} · Englisch
            </Text>
            <Text style={styles.question}>{q.question}</Text>
          </View>

          <View style={{ gap: 10 }}>
            {q.answers.map((answer, i) => (
              <AnswerOption
                key={answer}
                index={i}
                label={answer}
                state={answerState(i, selected, q.correctIndex)}
                onPress={() => setSelected(i)}
              />
            ))}
          </View>

          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Platzhalter: {questions.length} Fragen geladen. Spielablauf und Punkte folgen mit S5.
            </Text>
            <AppButton title="Letzte Frage → Resultat" variant="yellow" onPress={finish} />
          </View>
        </View>
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

function answerState(i, selected, correctIndex) {
  if (selected == null) return 'open';
  if (i === correctIndex) return 'correct';
  if (i === selected) return 'wrong';
  return 'dimmed';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.game },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  counter: { fontFamily: fonts.extraBold, fontSize: 16, color: colors.white },
  center: { flex: 1, justifyContent: 'center', padding: sizes.screenPadding, gap: sizes.gap },
  body: { flex: 1, padding: sizes.screenPadding, gap: sizes.gap * 2, justifyContent: 'space-between' },
  questionCard: { backgroundColor: '#33246F', borderRadius: 20, padding: 20, gap: 10 },
  meta: { fontFamily: fonts.bold, fontSize: 13, color: '#C9C3EE' },
  question: { fontFamily: fonts.black, fontSize: 23, color: colors.white, lineHeight: 30 },
  placeholder: { gap: sizes.gap },
  placeholderText: { fontFamily: fonts.regular, fontSize: 13, color: '#C9C3EE', textAlign: 'center' },
});
