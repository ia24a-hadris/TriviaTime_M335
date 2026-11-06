// Screen 2 · Quiz-Setup = Eingabeformular mit Validierung (Paket T3, Kernaktivität K2)
// - Kategorie aus der API (Special Feature), Schwierigkeit, Anzahl Fragen 5–20
// - Fehler direkt beim Feld; «Quiz starten» bleibt gesperrt, solange etwas ungültig ist
// - Sonderzustände: Kategorien laden / kein Netz mit «Erneut versuchen»
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import ScreenHeader from '@/components/ScreenHeader';
import SelectField from '@/components/SelectField';
import SegmentedControl from '@/components/SegmentedControl';
import Stepper from '@/components/Stepper';
import InfoBox, { bold } from '@/components/InfoBox';
import AppButton from '@/components/AppButton';
import StateView from '@/components/StateView';
import { fetchCategories, errorMessage, DIFFICULTY_LABEL, POINTS } from '@/services/quizApi';
import { getLastSettings, saveLastSettings } from '@/services/storage';
import { validateQuizSetup, hasErrors, QUESTIONS_MIN, QUESTIONS_MAX } from '@/services/validation';
import { colors, fonts, sizes, text } from '@/theme';

const DEFAULT_CATEGORY_ID = 9; // General Knowledge – vorausgefüllt (Fehler vermeiden)

const difficultyOptions = ['easy', 'medium', 'hard'].map((d) => ({ value: d, label: DIFFICULTY_LABEL[d] }));

export default function SetupScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [loadError, setLoadError] = useState(null);

  const [categoryId, setCategoryId] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [amount, setAmount] = useState('10');

  const loadCategories = useCallback(async () => {
    setLoadState('loading');
    try {
      const [cats, last] = await Promise.all([fetchCategories(), getLastSettings()]);
      setCategories(cats);
      // Letzte Einstellungen übernehmen, sonst Standardwerte
      if (last) {
        setCategoryId(cats.some((c) => c.id === last.categoryId) ? last.categoryId : DEFAULT_CATEGORY_ID);
        setDifficulty(last.difficulty ?? 'medium');
        setAmount(String(last.amount ?? 10));
      } else {
        setCategoryId(DEFAULT_CATEGORY_ID);
      }
      setLoadState('ok');
    } catch (err) {
      setLoadError(errorMessage(err));
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const errors = validateQuizSetup({ categoryId, difficulty, amount });
  const invalid = hasErrors(errors);

  async function startQuiz() {
    if (invalid) return;
    const category = categories.find((c) => c.id === categoryId);
    const settings = { categoryId, categoryName: category.name, difficulty, amount: Number(amount) };
    await saveLastSettings(settings); // für «Schnellstart» auf Home
    router.push({
      pathname: '/frage',
      params: {
        categoryId: String(settings.categoryId),
        categoryName: settings.categoryName,
        difficulty: settings.difficulty,
        amount: String(settings.amount),
      },
    });
  }

  const header = <ScreenHeader title="Quiz einrichten" onBack={() => router.back()} />;

  if (loadState !== 'ok') {
    return (
      <Screen>
        {header}
        {loadState === 'loading' ? (
          <StateView kind="loading" title="Kategorien werden geladen …" />
        ) : (
          <StateView
            kind="error"
            title="Kategorien nicht verfügbar"
            message={loadError}
            actionTitle="Erneut versuchen"
            onAction={loadCategories}
          />
        )}
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <AppButton
          title="Quiz starten"
          onPress={startQuiz}
          disabled={invalid}
          accessibilityHint={invalid ? 'Gesperrt, bis alle Angaben gültig sind' : undefined}
        />
      }
    >
      {header}

      <SelectField
        label="Kategorie"
        value={categoryId}
        options={categories}
        onChange={(c) => setCategoryId(c.id)}
        error={errors.category}
      />

      <View style={{ gap: 6 }}>
        <Text style={text.label}>Schwierigkeit</Text>
        <SegmentedControl label="Schwierigkeit" options={difficultyOptions} value={difficulty} onChange={setDifficulty} />
        <Text style={text.help}>
          Leicht {POINTS.easy} · Mittel {POINTS.medium} · Schwer {POINTS.hard} Punkte pro richtige Antwort
        </Text>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={text.label}>
          Anzahl Fragen ({QUESTIONS_MIN}–{QUESTIONS_MAX})
        </Text>
        <Stepper
          label="Anzahl Fragen"
          value={amount}
          onChange={setAmount}
          min={QUESTIONS_MIN}
          max={QUESTIONS_MAX}
          hasError={!!errors.amount}
        />
        {errors.amount ? (
          <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.wrong }} accessibilityLiveRegion="polite">
            ⚠ {errors.amount}
          </Text>
        ) : (
          <Text style={text.help}>Mit − / + oder direkt eintippen.</Text>
        )}
      </View>

      <InfoBox>
        Die Fragen kommen live aus der Open Trivia DB und sind auf <Text style={bold}>Englisch</Text>.
      </InfoBox>
      <View style={{ height: sizes.gap }} />
    </Screen>
  );
}
