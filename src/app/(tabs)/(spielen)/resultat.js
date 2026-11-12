// Screen 4 · Resultat (Paket T5 UI, Daten aus S5/S6)
//
// Wird mit Replace geöffnet → kein Zurück ins beendete Quiz.
// «Nochmals spielen» → Replace zur Frage · «Startseite» → popToTop
// «Bestenliste» → Tab, direkt auf der Seite mit Kategorie und Schwierigkeit dieser Runde
// Der Score ist beim Öffnen schon lokal gespeichert (Frage-Screen, saveResult).
// S7: Danach wird er online gesendet; der Status zeigt «wird gesendet», «online gespeichert · Rang»
// oder «offline – lokal gespeichert» mit «Jetzt erneut senden» (Selbstbeschreibungsfähigkeit, Fehlertoleranz).
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FocusedStatusBar from '@/components/FocusedStatusBar';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '@/components/AppButton';
import ScoreRing from '@/components/ScoreRing';
import StateView from '@/components/StateView';
import { getHistory } from '@/services/storage';
import { rankInCategory } from '@/services/leaderboard';
import { praise } from '@/services/quizLogic';
import { isQueued, syncScores } from '@/services/scoreSync';
import { getOnlineRank, isOnlineConfigured } from '@/services/onlineScores';
import { DIFFICULTY_LABEL } from '@/services/quizApi';
import { answerStyles, colors, fonts, sizes } from '@/theme';

export default function ResultatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [entry, setEntry] = useState(undefined); // undefined = lädt, null = nicht gefunden
  const [rank, setRank] = useState(null);
  // Online-Status: unconfigured | sending | sent | offline | rejected
  const [online, setOnline] = useState({ state: isOnlineConfigured() ? 'sending' : 'unconfigured' });
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getHistory().then((history) => {
        if (!active) return;
        const found = history.find((e) => e.id === params.resultId) ?? null;
        setEntry(found);
        setRank(found ? rankInCategory(history, found) : null);
      });
      return () => {
        active = false;
      };
    }, [params.resultId])
  );

  const sendNow = useCallback(async (e) => {
    if (!isOnlineConfigured()) return;
    setOnline({ state: 'sending' });
    try {
      const res = await syncScores();
      if (!mounted.current) return;
      if (res.dropped.some((x) => x.id === e.id)) return setOnline({ state: 'rejected' });
      if (await isQueued(e.id)) return mounted.current && setOnline({ state: 'offline', error: res.error });
      setOnline({ state: 'sent', rank: null });
      const r = await getOnlineRank(e).catch(() => null);
      if (mounted.current) setOnline({ state: 'sent', rank: r });
    } catch (err) {
      if (mounted.current) setOnline({ state: 'offline', error: err });
    }
  }, []);

  // Einmal senden, sobald das Resultat geladen ist
  const entryId = entry?.id;
  useEffect(() => {
    if (entryId) sendNow(entry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId, sendNow]);

  // Android-Zurück führt zur Startseite statt zurück ins Setup
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        router.dismissAll();
        return true;
      });
      return () => sub.remove();
    }, [router])
  );

  function playAgain() {
    router.replace({
      pathname: '/frage',
      params: {
        categoryId: params.categoryId,
        categoryName: params.categoryName,
        difficulty: params.difficulty,
        amount: params.amount,
      },
    });
  }

  if (entry === undefined) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (entry === null) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + 40 }]}>
        <StateView kind="empty" title="Resultat nicht gefunden" message="Starte eine neue Runde." actionTitle="Startseite" actionIcon="home" onAction={() => router.dismissAll()} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 24 }}>
      <FocusedStatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <Confetti />
        <Text style={styles.heroTitle} accessibilityRole="header">
          Resultat
        </Text>
        <Text style={styles.praise}>
          {praise(entry.correct, entry.amount)}, {entry.nickname}!
        </Text>
        <ScoreRing correct={entry.correct} amount={entry.amount} />
        <Text style={styles.points}>{entry.points} Punkte</Text>
        <Text style={styles.meta}>
          {entry.categoryName} · {DIFFICULTY_LABEL[entry.difficulty]} · {entry.amount} Fragen
        </Text>
      </View>

      <View style={styles.content}>
        {/* Rechenzeile: So versteht man das Punktesystem ohne Anleitung (Lernförderlichkeit) */}
        <View style={styles.formula}>
          <Text style={styles.formulaText}>
            So zählt es: {entry.correct} richtig × {entry.pointsPerCorrect} Punkte ({DIFFICULTY_LABEL[entry.difficulty]}) = {entry.points}
          </Text>
        </View>

        {/* Status: Ist der Score sicher gespeichert – lokal und online? (Selbstbeschreibungsfähigkeit) */}
        <SaveStatus online={online} rank={rank} categoryName={entry.categoryName} onRetry={() => sendNow(entry)} />

        <AppButton title="Nochmals spielen" icon="refresh" onPress={playAgain} />
        <View style={styles.row}>
          <AppButton title="Bestenliste" variant="secondary" onPress={() => router.navigate({ pathname: '/bestenliste', params: { categoryName: entry.categoryName, difficulty: entry.difficulty } })} style={{ flex: 1 }} />
          <AppButton title="Startseite" variant="secondary" onPress={() => router.dismissAll()} style={{ flex: 1 }} />
        </View>
      </View>
    </ScrollView>
  );
}

const OFFLINE_TEXT = {
  OFFLINE: 'Keine Verbindung.',
  TIMEOUT: 'Die Online-Bestenliste antwortet nicht.',
};

/** Statuskarte unter dem Resultat: lokal immer gespeichert, online je nach Netz. */
function SaveStatus({ online, rank, categoryName, onRetry }) {
  const local = (
    <>
      Rang <Text style={{ fontFamily: fonts.black }}>#{rank}</Text> in {categoryName} auf diesem Handy.
    </>
  );
  const variants = {
    unconfigured: { tone: 'ok', icon: 'checkmark', title: 'Gespeichert', body: <>Du bist auf {local}</> },
    sending: { tone: 'busy', title: 'Score wird gesendet …', body: <>Lokal schon gespeichert: {local}</> },
    sent: {
      tone: 'ok',
      icon: 'cloud-done-outline',
      title: 'Online gespeichert',
      body: online.rank ? (
        <>
          Rang <Text style={{ fontFamily: fonts.black }}>#{online.rank.rank}</Text> von {online.rank.total} in {categoryName} online · auf diesem Handy{' '}
          <Text style={{ fontFamily: fonts.black }}>#{rank}</Text>.
        </>
      ) : (
        <>Du bist in der Online-Bestenliste. {local}</>
      ),
    },
    offline: {
      tone: 'warn',
      icon: 'cloud-offline-outline',
      title: 'Offline – lokal gespeichert',
      body: `${OFFLINE_TEXT[online.error?.code] ?? 'Die Online-Bestenliste ist gerade nicht erreichbar.'} Dein Score wird automatisch gesendet, sobald du wieder Netz hast.`,
    },
    rejected: {
      tone: 'warn',
      icon: 'alert-circle-outline',
      title: 'Nur auf diesem Handy gespeichert',
      body: 'Die Online-Bestenliste hat diesen Score nicht angenommen.',
    },
  };
  const v = variants[online.state];
  const tone = tones[v.tone];

  return (
    <View style={[styles.status, { borderColor: tone.border, backgroundColor: tone.bg }]} accessibilityLiveRegion="polite">
      <View style={styles.statusRow}>
        <View style={[styles.statusIcon, { backgroundColor: tone.border }]}>
          {v.tone === 'busy' ? <ActivityIndicator color={colors.white} /> : <Ionicons name={v.icon} size={22} color={colors.white} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>{v.title}</Text>
          <Text style={styles.statusText}>{v.body}</Text>
        </View>
      </View>
      {online.state === 'offline' && <AppButton title="Jetzt erneut senden" icon="refresh" variant="secondary" small onPress={onRetry} />}
    </View>
  );
}

const tones = {
  ok: { border: colors.correct, bg: '#E7F4EA' },
  busy: { border: colors.primary, bg: colors.primarySoft },
  warn: { border: '#B45309', bg: '#FFF4DE' },
};

/** Ein paar Konfetti-Streifen in den Antwortfarben (reine Dekoration). */
function Confetti() {
  const bits = [
    // nur an den Rändern neben dem Ring, damit kein Text verdeckt wird
    { top: '36%', left: '7%', rotate: '25deg', color: answerStyles[2].color },
    { top: '30%', right: '8%', rotate: '-10deg', color: answerStyles[2].color },
    { top: '56%', right: '6%', rotate: '-50deg', color: answerStyles[1].color },
    { top: '62%', left: '5%', rotate: '60deg', color: answerStyles[3].color },
    { top: '46%', left: '14%', rotate: '-35deg', color: colors.yellow },
  ];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false}>
      {bits.map((b, i) => (
        <View key={i} style={[styles.confetti, { top: b.top, left: b.left, right: b.right, backgroundColor: b.color, transform: [{ rotate: b.rotate }] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { flex: 1, backgroundColor: colors.background, padding: sizes.screenPadding },
  hero: {
    backgroundColor: colors.game,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    paddingHorizontal: sizes.screenPadding,
    paddingBottom: 28,
    gap: 12,
  },
  heroTitle: { alignSelf: 'flex-start', fontFamily: fonts.black, fontSize: 26, color: colors.white },
  praise: { fontFamily: fonts.black, fontSize: 26, color: colors.white, textAlign: 'center' },
  points: { fontFamily: fonts.black, fontSize: 36, color: colors.yellow },
  meta: { fontFamily: fonts.semiBold, fontSize: 16, color: '#D6D0F5', marginTop: -6, textAlign: 'center' },
  confetti: { position: 'absolute', width: 9, height: 22, borderRadius: 4 },
  content: { padding: sizes.screenPadding, gap: sizes.gap * 2 },
  formula: { alignSelf: 'center', backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  formulaText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  status: { gap: 12, padding: 16, borderRadius: sizes.radius, borderWidth: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statusIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.correct, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontFamily: fonts.black, fontSize: 17, color: colors.text },
  statusText: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, lineHeight: 21 },
  row: { flexDirection: 'row', gap: sizes.gap * 1.5 },
});
