// Quiz-Logik (Paket S5) – reine Funktionen ohne UI, darum mit `npm test` prüfbar.
//
// Ablauf einer Runde:
//   createRound → (answer → next)* → summary
// Phasen: 'question' (Antwort offen) → 'feedback' (✓/✗ sichtbar, «Weiter») → nächste Frage oder 'done'
// Punkte: pro richtige Antwort 10 (Leicht), 20 (Mittel) oder 30 (Schwer) – Konzept 1.3.

import { POINTS } from './quizApi.js';

/** Neue Runde mit den geladenen Fragen. settings: { categoryId, categoryName, difficulty, amount } */
export function createRound(settings, questions) {
  return {
    settings,
    questions,
    index: 0,
    phase: 'question',
    selected: null, // gewählte Antwort der aktuellen Frage
    correct: 0, // Anzahl richtige Antworten
    score: 0, // Punkte bisher
  };
}

export function pointsPerCorrect(difficulty) {
  return POINTS[difficulty] ?? POINTS.medium;
}

export function currentQuestion(round) {
  return round.questions[round.index];
}

/** Antwort auswählen. Mehrfaches Antippen (Doppel-Tap) ändert nichts mehr. */
export function answer(round, choice) {
  if (round.phase !== 'question') return round;
  const isCorrect = choice === currentQuestion(round).correctIndex;
  return {
    ...round,
    phase: 'feedback',
    selected: choice,
    correct: round.correct + (isCorrect ? 1 : 0),
    score: round.score + (isCorrect ? pointsPerCorrect(round.settings.difficulty) : 0),
  };
}

export function wasCorrect(round) {
  return round.selected != null && round.selected === currentQuestion(round).correctIndex;
}

export function isLastQuestion(round) {
  return round.index >= round.questions.length - 1;
}

/** Zur nächsten Frage – oder Runde beenden ('done'), wenn es die letzte war. */
export function next(round) {
  if (round.phase !== 'feedback') return round;
  if (isLastQuestion(round)) return { ...round, phase: 'done' };
  return { ...round, index: round.index + 1, phase: 'question', selected: null };
}

/** Fortschritt 0..1 für den Balken; zählt beantwortete Fragen. */
export function progress(round) {
  const answered = round.index + (round.phase === 'question' ? 0 : 1);
  return round.questions.length ? answered / round.questions.length : 0;
}

/** Zusammenfassung für Resultat und Verlauf. */
export function summary(round, date = new Date()) {
  const { categoryId, categoryName, difficulty } = round.settings;
  return {
    categoryId,
    categoryName,
    difficulty,
    amount: round.questions.length,
    correct: round.correct,
    points: round.score,
    pointsPerCorrect: pointsPerCorrect(difficulty),
    date: date.toISOString(),
  };
}

/** Lob-Text im Resultat, abhängig vom Anteil richtiger Antworten. */
export function praise(correct, amount) {
  const ratio = amount ? correct / amount : 0;
  if (ratio >= 0.8) return 'Stark';
  if (ratio >= 0.5) return 'Gut gemacht';
  return 'Weiter so';
}
