// Screen 5 · Bestenliste (Paket T5) – eigener Tab, kein Zurück.
//
// - Umschalter «Online (Top 20)» / «Lokal» und Kategorie-Filter mit allen Kategorien der Quiz-API (Individualisierbarkeit)
// - Drei Seiten Leicht → Mittel → Schwer: wischen oder Reiter antippen (DifficultyPager)
// - Siegertreppchen für die Top 3, eigene Zeile «Du» hervorgehoben (Erwartungskonformität)
// - Zustände: lädt (Platzhalter-Zeilen), kein Netz, leer («Noch niemand hat hier gespielt»), Online nicht eingerichtet
// - Herunterziehen zum Aktualisieren
// Lokal: eigene Resultate aus AsyncStorage (S6). Online: Firebase Firestore, Sammlung scores_m335.
// S7: Beim Öffnen und beim Herunterziehen werden wartende Scores zuerst gesendet; solange noch
// welche warten (z. B. offline), weist ein Hinweis darauf hin.
// Vom Resultat aus («Bestenliste») öffnet sich direkt die Seite mit Kategorie und Schwierigkeit der Runde.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import ScreenHeader from '@/components/ScreenHeader';
import SegmentedControl from '@/components/SegmentedControl';
import SelectField from '@/components/SelectField';
import StateView from '@/components/StateView';
import AppButton from '@/components/AppButton';
import InfoBox from '@/components/InfoBox';
import Podium from '@/components/Podium';
import DifficultyPager from '@/components/DifficultyPager';
import ScoreRow, { ScoreRowSkeleton } from '@/components/ScoreRow';
import { getHistory, getNickname } from '@/services/storage';
import { ALL_CATEGORIES, categoryFilterOptions, DIFFICULTIES, groupByDifficulty, topScores, TOP_LIMIT } from '@/services/leaderboard';
import { getScoresByDifficulty, isOnlineConfigured, onlineErrorMessage } from '@/services/onlineScores';
import { pendingCount, syncScores } from '@/services/scoreSync';
import { DIFFICULTY_LABEL, fetchCategories } from '@/services/quizApi';
import { colors, sizes, text } from '@/theme';

const EMPTY = { easy: [], medium: [], hard: [] };

export default function BestenlisteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [mode, setMode] = useState(isOnlineConfigured() ? 'online' : 'lokal');
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [difficulty, setDifficulty] = useState('easy');
  const [apiCategories, setApiCategories] = useState([]);
  const [nickname, setNickname] = useState(null);
  const [history, setHistory] = useState([]);
  const [online, setOnline] = useState({ state: 'idle', data: EMPTY, error: null });
  const [refreshing, setRefreshing] = useState(false);
  const [pending, setPending] = useState(0); // Scores, die noch nicht online sind

  // Vom Resultat: Kategorie und Schwierigkeit der gespielten Runde vorwählen
  useEffect(() => {
    if (DIFFICULTIES.includes(params.difficulty)) setDifficulty(params.difficulty);
    if (params.categoryName) setCategory(params.categoryName);
  }, [params.difficulty, params.categoryName]);

  // Alle Kategorien für den Filter (gleiche Liste wie im Quiz-Setup); ohne Netz reichen die aus dem Verlauf
  useEffect(() => {
    fetchCategories()
      .then(setApiCategories)
      .catch(() => {});
  }, []);

  // Lokale Daten bei jedem Öffnen des Tabs neu lesen (z. B. nach einer Runde)
  useFocusEffect(
    useCallback(() => {
      Promise.all([getHistory(), getNickname()]).then(([h, n]) => {
        setHistory(h);
        setNickname(n);
      });
    }, [])
  );

  const loadOnline = useCallback(async () => {
    if (!isOnlineConfigured()) {
      setOnline({ state: 'unconfigured', data: EMPTY, error: null });
      return;
    }
    setOnline((o) => ({ ...o, state: 'loading' }));
    try {
      const data = await getScoresByDifficulty({ categoryName: category === ALL_CATEGORIES ? undefined : category });
      setOnline({ state: 'ok', data, error: null });
    } catch (err) {
      setOnline({ state: 'error', data: EMPTY, error: onlineErrorMessage(err) });
    }
  }, [category]);

  /** Wartende Scores senden; wenn etwas neu online ist, die Liste neu laden. */
  const sync = useCallback(async () => {
    const res = await syncScores().catch(() => null);
    setPending(await pendingCount());
    return res?.sent.length > 0;
  }, []);

  // Beim Öffnen des Tabs (und bei Wechsel Modus/Kategorie): Liste sofort laden, parallel senden
  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (mode === 'online') loadOnline();
      sync().then((changed) => {
        if (active && changed && mode === 'online') loadOnline();
      });
      return () => {
        active = false;
      };
    }, [mode, loadOnline, sync])
  );

  async function refresh() {
    setRefreshing(true);
    await sync();
    const [h] = await Promise.all([getHistory(), mode === 'online' ? loadOnline() : null]);
    setHistory(h);
    setRefreshing(false);
  }

  const categoryOptions = useMemo(() => categoryFilterOptions(apiCategories, history), [apiCategories, history]);
  const selectedCategory = categoryOptions.find((o) => o.id === category);

  // Einträge pro Schwierigkeit in ein einheitliches Format bringen
  const pages = useMemo(() => {
    const source =
      mode === 'lokal'
        ? groupByDifficulty(topScores(history, { categoryName: category === ALL_CATEGORIES ? undefined : category, limit: Infinity }), TOP_LIMIT)
        : online.data;
    const toRow = (e) => ({
      key: e.id,
      nickname: e.nickname,
      points: e.points,
      meta: `${e.categoryName ?? ''} · ${shortDate(e.date)}`,
      own: mode === 'online' && !!nickname && e.nickname === nickname,
    });
    return Object.fromEntries(DIFFICULTIES.map((d) => [d, source[d].map(toRow)]));
  }, [mode, history, category, online.data, nickname]);

  /** Quiz-Setup mit dieser Kategorie und Schwierigkeit öffnen (aus dem Leer-Zustand). */
  function startQuiz(d) {
    const p = { difficulty: d };
    if (selectedCategory?.categoryId != null) p.categoryId = String(selectedCategory.categoryId);
    router.navigate({ pathname: '/setup', params: p });
  }

  function renderPage(d) {
    if (mode === 'online' && online.state === 'loading') {
      return (
        <View style={{ gap: sizes.gap }} accessibilityLabel="Bestenliste wird geladen">
          {[0, 1, 2, 3, 4].map((i) => (
            <ScoreRowSkeleton key={i} />
          ))}
        </View>
      );
    }
    const rows = pages[d];
    const where = category === ALL_CATEGORIES ? `auf ${DIFFICULTY_LABEL[d]}` : `in ${category} auf ${DIFFICULTY_LABEL[d]}`;
    if (rows.length === 0) {
      return (
        <StateView
          kind="empty"
          title={mode === 'lokal' ? 'Noch keine Resultate' : 'Noch niemand hat hier gespielt'}
          message={
            mode === 'lokal'
              ? `Du hast ${where} noch nicht gespielt.`
              : `Sei die erste Person in dieser Bestenliste (${category === ALL_CATEGORIES ? DIFFICULTY_LABEL[d] : `${category} · ${DIFFICULTY_LABEL[d]}`})!`
          }
          actionTitle="Quiz starten"
          actionIcon="play"
          onAction={() => startQuiz(d)}
        />
      );
    }
    return (
      <View style={{ gap: sizes.gap * 2 }}>
        <Podium entries={rows} />
        <View style={{ gap: sizes.gap }}>
          {rows.slice(3).map((r, i) => (
            <ScoreRow key={r.key} rank={i + 4} nickname={r.nickname} points={r.points} meta={r.meta} own={r.own} />
          ))}
        </View>
        <Text style={[text.help, { textAlign: 'center' }]}>
          {mode === 'lokal' ? 'Deine Resultate auf diesem Handy' : `Top ${TOP_LIMIT}`} · zum Aktualisieren nach unten ziehen
        </Text>
      </View>
    );
  }

  const showPager = mode === 'lokal' || online.state === 'ok' || online.state === 'loading' || online.state === 'idle';

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}>
      <ScreenHeader title="Bestenliste" />
      <SegmentedControl
        label="Bestenliste anzeigen"
        options={[
          { value: 'online', label: 'Online (Top 20)' },
          { value: 'lokal', label: 'Lokal' },
        ]}
        value={mode}
        onChange={setMode}
      />
      <SelectField label="Kategorie" value={category} options={categoryOptions} onChange={(c) => setCategory(c.id)} />

      {mode === 'online' && pending > 0 && online.state !== 'unconfigured' && (
        <InfoBox icon="cloud-upload-outline">
          {pending === 1 ? '1 Score von dir wartet' : `${pending} Scores von dir warten`} noch auf das Senden. Das passiert automatisch, sobald du
          Netz hast – oder zieh die Liste nach unten.
        </InfoBox>
      )}

      {mode === 'online' && online.state === 'unconfigured' && (
        <StateView
          kind="empty"
          title="Online-Bestenliste kommt bald"
          message="Die Online-Rangliste ist noch nicht eingerichtet. Deine eigenen Resultate siehst du unter «Lokal»."
          actionTitle="Lokale Resultate anzeigen"
          actionIcon="phone-portrait-outline"
          onAction={() => setMode('lokal')}
        />
      )}

      {mode === 'online' && online.state === 'error' && (
        <View style={{ gap: sizes.gap }}>
          <StateView kind="error" title="Online-Bestenliste nicht erreichbar" message={online.error} actionTitle="Erneut versuchen" onAction={loadOnline} />
          <AppButton title="Lokale Resultate anzeigen" variant="ghost" small onPress={() => setMode('lokal')} />
        </View>
      )}

      {showPager && <DifficultyPager value={difficulty} onChange={setDifficulty} renderPage={renderPage} />}
    </Screen>
  );
}

function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
}
