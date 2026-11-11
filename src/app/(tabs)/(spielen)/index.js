// Screen 1 · Home (Paket T2)
// - Erster Start: Nickname-Formular (K1)
// - Danach: Begrüssung, «Letztes Quiz», «Dein bester Score», «Neues Quiz starten», «Schnellstart» (K3)
// - ✎ im Header öffnet das Modal «Nickname ändern»
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/Screen';
import ScreenHeader from '@/components/ScreenHeader';
import IconButton from '@/components/IconButton';
import Card from '@/components/Card';
import AppButton from '@/components/AppButton';
import StateView from '@/components/StateView';
import { NicknameForm, NicknameModal } from '@/components/NicknameForm';
import { getHistory, getLastSettings, getNickname, saveNickname } from '@/services/storage';
import { DIFFICULTY_LABEL } from '@/services/quizApi';
import { answerStyles, colors, fonts, sizes, text } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState(null);
  const [lastSettings, setLastSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Bei jedem Fokus neu laden (z. B. nach einer Runde)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [name, settings, hist] = await Promise.all([getNickname(), getLastSettings(), getHistory()]);
        if (!active) return;
        setNickname(name);
        setLastSettings(settings);
        setHistory(hist);
        setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  async function handleSaveNickname(name) {
    await saveNickname(name);
    setNickname(name);
    setModalOpen(false);
  }

  // Schnellstart: letzte Einstellungen aus dem Setup, sonst die des letzten gespielten Quiz
  const quick =
    lastSettings ??
    (history[0] && {
      categoryId: history[0].categoryId,
      categoryName: history[0].categoryName,
      difficulty: history[0].difficulty,
      amount: history[0].amount,
    });

  function quickStart() {
    router.push({
      pathname: '/frage',
      params: {
        categoryId: String(quick.categoryId),
        categoryName: quick.categoryName,
        difficulty: quick.difficulty,
        amount: String(quick.amount),
      },
    });
  }

  if (loading) {
    return (
      <Screen>
        <StateView kind="loading" title="Wird geladen …" />
      </Screen>
    );
  }

  // ---------- Erster Start: Nickname wählen ----------
  if (!nickname) {
    return (
      <Screen>
        <ScreenHeader title="Trivia Time" />
        <Card dark>
          <View style={styles.welcomeRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.welcomeTitle}>Willkommen!</Text>
              <Text style={styles.welcomeSub}>Wie sollen wir dich nennen?</Text>
            </View>
            <AnswerSymbols />
          </View>
        </Card>
        <Text style={text.body}>
          Kein Login, keine Werbung. Dein Nickname erscheint bei deinen Scores und in der Bestenliste.
        </Text>
        <NicknameForm onSubmit={handleSaveNickname} />
      </Screen>
    );
  }

  // ---------- Hauptzustand ----------
  const lastQuiz = history[0];
  const best = history.length ? history.reduce((a, b) => (b.points > a.points ? b : a)) : null;

  return (
    <Screen
      footer={
        <>
          <AppButton title="Neues Quiz starten" icon="play" onPress={() => router.push('/setup')} />
          <AppButton
            title="Schnellstart: letzte Einstellungen"
            icon="refresh"
            variant="secondary"
            onPress={quickStart}
            disabled={!quick}
            accessibilityHint="Startet ein Quiz mit den zuletzt gewählten Einstellungen"
          />
          <Text style={[text.help, styles.center]}>
            {quick
              ? `${quick.categoryName} · ${DIFFICULTY_LABEL[quick.difficulty]} · ${quick.amount} Fragen`
              : 'Schnellstart ist nach deinem ersten Quiz verfügbar.'}
          </Text>
        </>
      }
    >
      <ScreenHeader
        title="Trivia Time"
        onTitleLongPress={__DEV__ ? () => router.push('/bausteine') : undefined}
        right={<IconButton icon="pencil" label="Nickname ändern" onPress={() => setModalOpen(true)} />}
      />

      <Card dark>
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.welcomeTitle} numberOfLines={2}>
              Hallo, {nickname}!
            </Text>
            <Text style={styles.welcomeSub}>Bereit für die nächste Runde?</Text>
          </View>
          <AnswerSymbols />
        </View>
      </Card>

      <Card>
        <Text style={text.overline}>Letztes Quiz</Text>
        {lastQuiz ? (
          <>
            <Text style={styles.cardTitle}>
              {lastQuiz.categoryName} · {DIFFICULTY_LABEL[lastQuiz.difficulty]} · {lastQuiz.amount} Fragen
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(lastQuiz.correct / lastQuiz.amount) * 100}%` }]} />
            </View>
            <Text style={text.help}>
              {lastQuiz.correct} / {lastQuiz.amount} richtig · {lastQuiz.points} Punkte · {formatDate(lastQuiz.date)}
            </Text>
          </>
        ) : (
          <Text style={[text.body, styles.mt]}>Noch kein Quiz gespielt. Starte unten deine erste Runde!</Text>
        )}
      </Card>

      <Card>
        <View style={styles.bestRow}>
          <View style={styles.trophy}>
            <Ionicons name="trophy" size={30} color={colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={text.overline}>Dein bester Score</Text>
            <Text style={styles.bestPoints}>{best ? `${best.points} Punkte` : '– Punkte'}</Text>
            <Text style={text.help}>{best ? best.categoryName : 'Spiele eine Runde, um Punkte zu sammeln.'}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.navigate('/bestenliste')}
          accessibilityRole="link"
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.linkText}>Zur Bestenliste</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </Pressable>
      </Card>

      <NicknameModal
        visible={modalOpen}
        currentNickname={nickname}
        onSave={handleSaveNickname}
        onClose={() => setModalOpen(false)}
      />
    </Screen>
  );
}

/** Die vier Antwort-Symbole als Wiedererkennung (Stern, Blitz, Herz, Mond). */
function AnswerSymbols() {
  return (
    <View style={styles.symbols} accessible={false}>
      {answerStyles.map((a) => (
        <View key={a.letter} style={[styles.symbol, { backgroundColor: a.color }]}>
          <Ionicons name={a.icon} size={18} color={colors.white} />
        </View>
      ))}
    </View>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  welcomeTitle: { fontFamily: fonts.black, fontSize: 24, color: colors.white },
  welcomeSub: { fontFamily: fonts.regular, fontSize: 15, color: '#D6D0F5' },
  symbols: { width: 76, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  symbol: { width: 35, height: 35, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fonts.extraBold, fontSize: 17, color: colors.text, marginTop: 6 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.primarySoft, marginVertical: 12 },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  bestRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  trophy: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestPoints: { fontFamily: fonts.black, fontSize: 24, color: colors.text },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: sizes.touchMin, marginTop: 4 },
  linkText: { fontFamily: fonts.extraBold, fontSize: 16, color: colors.primary },
  center: { textAlign: 'center' },
  mt: { marginTop: 6 },
});
