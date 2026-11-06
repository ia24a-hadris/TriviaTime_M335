// Validierungsregeln für die Eingabeformulare (Nickname, Quiz-Setup).
// Reine Funktionen ohne React Native – darum auch mit `npm test` prüfbar.

export const NICKNAME_MIN = 3;
export const NICKNAME_MAX = 15;
export const QUESTIONS_MIN = 5;
export const QUESTIONS_MAX = 20;
export const DIFFICULTIES = ['easy', 'medium', 'hard'];

/** Gibt eine Fehlermeldung (Deutsch, mit Lösung) oder null zurück. */
export function validateNickname(raw) {
  const name = (raw ?? '').trim();
  if (name.length === 0) return 'Bitte gib einen Nickname ein.';
  if (name.length < NICKNAME_MIN) return `Zu kurz: mindestens ${NICKNAME_MIN} Zeichen.`;
  if (name.length > NICKNAME_MAX) return `Zu lang: höchstens ${NICKNAME_MAX} Zeichen.`;
  if (!/^[A-Za-z0-9ÄÖÜäöüß]+$/.test(name)) return 'Nur Buchstaben und Zahlen, ohne Leerzeichen.';
  return null;
}

export function validateQuestionCount(raw) {
  const text = String(raw ?? '').trim();
  if (text === '') return `Bitte gib eine Zahl von ${QUESTIONS_MIN} bis ${QUESTIONS_MAX} ein.`;
  const n = Number(text);
  if (!Number.isInteger(n)) return 'Bitte nur ganze Zahlen eingeben.';
  if (n < QUESTIONS_MIN || n > QUESTIONS_MAX) {
    return `Bitte wähle ${QUESTIONS_MIN} bis ${QUESTIONS_MAX} Fragen.`;
  }
  return null;
}

/** Prüft das ganze Quiz-Setup. Rückgabe: { category, difficulty, amount } – je Fehlertext oder null. */
export function validateQuizSetup({ categoryId, difficulty, amount }) {
  return {
    category: categoryId == null ? 'Bitte wähle eine Kategorie.' : null,
    difficulty: DIFFICULTIES.includes(difficulty) ? null : 'Bitte wähle eine Schwierigkeit.',
    amount: validateQuestionCount(amount),
  };
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
