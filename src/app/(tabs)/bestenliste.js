// Screen 5 · Bestenliste (Paket T5) – eigener Tab, kein Zurück.
//
// - Umschalter «Online (Top 20)» / «Lokal» und Kategorie-Filter (Individualisierbarkeit)
// - Siegertreppchen für die Top 3, eigene Zeile «Du» hervorgehoben (Erwartungskonformität)
// - Zustände: lädt (Platzhalter-Zeilen), kein Netz, leer, Online noch nicht eingerichtet
// - Herunterziehen zum Aktualisieren
// Lokal: eigene Resultate aus AsyncStorage (S6). Online: Supabase (S7, Do 12.11.).
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import ScreenHeader from '@/components/ScreenHeader';
import SegmentedControl from '@/components/SegmentedControl';
import SelectField from '@/components/SelectField';
import StateView from '@/components/StateView';
import AppButton from '@/components/AppButton';
import Podium from '@/components/Podium';
import ScoreRow, { ScoreRowSkeleton } from '@/components/ScoreRow';
import { getHistory, getNickname } from '@/services/storage';
import { topScores, TOP_LIMIT } from '@/services/leaderboard';
import { getTopScores, isOnlineConfigured } from '@/services/onlineScores';
import { DIFFICULTY_LABEL, errorMessage } from '@/services/quizApi';
import { colors, sizes, text } from '@/theme';

const ALL = 'all';

export default function BestenlisteScreen() {
  const router = useRouter();
  const [mode, setMode] = useState(isOnlineConfigured() ? 'online' : 'lokal');
  const [category, setCategory] = useState(ALL);
  const [nickname, setNickname] = useState(null);
  const [history, setHistory] = useState([]);
  const [online, setOnline] = useState({ state: 'idle', rows: [], error: null });
  const [refreshing, setRefreshing] = useState(false);

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
      setOnline({ state: 'unconfigured', rows: [], error: null });
      return;
    }
    setOnline((o) => ({ ...o, state: 'loading' }));
    try {
      const rows = await getTopScores({ category: category === ALL ? undefined : category });
      setOnline({ state: 'ok', rows, error: null });
    } catch (err) {
      setOnline({ state: 'error', rows: [], error: errorMessage(err) });
    }
  }, [category]);

  useEffect(() => {
    if (mode === 'online') loadOnline();
  }, [mode, loadOnline]);

  async function refresh() {
    setRefreshing(true);
    const [h] = await Promise.all([getHistory(), mode === 'online' ? loadOnline() : null]);
    setHistory(h);
    setRefreshing(false);
  }

  // Kategorien für den Filter: alle, die im eigenen Verlauf vorkommen
  const categoryOptions = [
    { id: ALL, name: 'Alle Kategorien' },
    ...[...new Set(history.map((e) => e.categoryName))].sort().map((name) => ({ id: name, name })),
  ];

  // Einträge in ein einheitliches Format bringen
  const rows =
    mode === 'lokal'
      ? topScores(history, { categoryName: category === ALL ? undefined : category, limit: TOP_LIMIT }).map((e) => ({
          key: e.id,
          nickname: e.nickname,
          points: e.points,
          meta: `${e.categoryName} · ${DIFFICULTY_LABEL[e.difficulty]} · ${shortDate(e.date)}`,
          own: false,
        }))
      : online.rows.map((e, i) => ({
          key: `${e.nickname}-${e.created_at}-${i}`,
          nickname: e.nickname,
          points: e.points,
          meta: `${e.category ?? ''} · ${shortDate(e.created_at)}`,
          own: !!nickname && e.nickname === nickname,
        }));

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

      {mode === 'online' && online.state === 'loading' && (
        <View style={{ gap: sizes.gap }} accessibilityLabel="Bestenliste wird geladen">
          {[0, 1, 2, 3, 4].map((i) => (
            <ScoreRowSkeleton key={i} />
          ))}
        </View>
      )}

      {mode === 'online' && online.state === 'error' && (
        <View style={{ gap: sizes.gap }}>
          <StateView kind="error" title="Online-Bestenliste nicht erreichbar" message={online.error} actionTitle="Erneut versuchen" onAction={loadOnline} />
          <AppButton title="Lokale Resultate anzeigen" variant="ghost" small onPress={() => setMode('lokal')} />
        </View>
      )}

      {(mode === 'lokal' || online.state === 'ok') &&
        (rows.length === 0 ? (
          <StateView
            kind="empty"
            title="Noch keine Einträge"
            message={category === ALL ? 'Spiele ein Quiz, um hier zu erscheinen.' : 'In dieser Kategorie gibt es noch keine Einträge.'}
            actionTitle="Quiz starten"
            actionIcon="play"
            onAction={() => router.navigate('/setup')}
          />
        ) : (
          <>
            <Podium entries={rows} />
            <View style={{ gap: sizes.gap }}>
              {rows.slice(3).map((r, i) => (
                <ScoreRow key={r.key} rank={i + 4} nickname={r.nickname} points={r.points} meta={r.meta} own={r.own} />
              ))}
            </View>
            <Text style={[text.help, { textAlign: 'center' }]}>
              {mode === 'lokal' ? 'Deine Resultate auf diesem Handy' : `… bis Rang ${TOP_LIMIT}`} · zum Aktualisieren nach unten ziehen
            </Text>
          </>
        ))}
    </Screen>
  );
}

function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
}
