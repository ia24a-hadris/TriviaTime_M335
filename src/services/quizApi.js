// Quiz-API-Service (Special Feature Netzwerk/API) – Open Trivia DB, https://opentdb.com
//
// - Kategorien laden (für das Quiz-Setup)
// - Alle Fragen einer Runde mit EINER Anfrage laden; danach läuft die Runde offline
// - Sonderzeichen: Wir holen die Daten mit encode=url3986 und wandeln sie mit
//   decodeURIComponent um. So werden &, ', «, é usw. korrekt angezeigt.
// - Antworten mischen
// - Fehler abfangen: kein Netz, Timeout (10 s), API-Code 1 (zu wenige Fragen),
//   API-Code 5 (zu viele Anfragen → nach 5 s automatisch einmal wiederholen)
//
// Keine React-Native-Imports: Der Service ist mit `npm test` (Node) testbar.

export const API_BASE = 'https://opentdb.com';
export const TIMEOUT_MS = 10000;
export const RATE_LIMIT_WAIT_MS = 5000;

export const POINTS = { easy: 10, medium: 20, hard: 30 };
export const DIFFICULTY_LABEL = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };

/** Fehler mit festem Code, damit die Screens die passende Meldung zeigen können. */
export class QuizApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'QuizApiError';
    this.code = code; // 'OFFLINE' | 'TIMEOUT' | 'NOT_ENOUGH' | 'RATE_LIMIT' | 'INVALID' | 'SERVER'
  }
}

/** Deutsche Meldung für den Screen (Ursache + Lösung, ohne Fehlercodes). */
export function errorMessage(err) {
  switch (err?.code) {
    case 'OFFLINE':
      return 'Keine Verbindung. Prüfe dein Internet und versuche es erneut.';
    case 'TIMEOUT':
      return 'Der Server antwortet nicht (über 10 Sekunden). Versuche es gleich nochmals.';
    case 'NOT_ENOUGH':
      return 'Für diese Auswahl gibt es zu wenige Fragen. Wähle weniger Fragen oder eine andere Schwierigkeit.';
    case 'RATE_LIMIT':
      return 'Zu viele Anfragen kurz hintereinander. Warte ein paar Sekunden und versuche es erneut.';
    default:
      return 'Die Fragen konnten nicht geladen werden. Versuche es erneut.';
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** fetch mit Timeout. Wandelt Netzwerkfehler in QuizApiError um. */
export async function fetchJson(url, { timeoutMs = TIMEOUT_MS, fetchImpl = globalThis.fetch } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { signal: controller.signal });
    if (res.status === 429) throw new QuizApiError('RATE_LIMIT', 'HTTP 429');
    if (!res.ok) throw new QuizApiError('SERVER', `HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err instanceof QuizApiError) throw err;
    if (err?.name === 'AbortError') throw new QuizApiError('TIMEOUT', 'Zeitüberschreitung');
    throw new QuizApiError('OFFLINE', err?.message ?? 'Netzwerkfehler');
  } finally {
    clearTimeout(timer);
  }
}

/** Kategorien laden, alphabetisch sortiert: [{ id, name }] */
export async function fetchCategories(options) {
  const data = await fetchJson(`${API_BASE}/api_category.php`, options);
  const list = data?.trivia_categories;
  if (!Array.isArray(list)) throw new QuizApiError('SERVER', 'Unerwartete Antwort');
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

export function buildQuestionsUrl({ amount, categoryId, difficulty }) {
  const params = [`amount=${amount}`, 'type=multiple', 'encode=url3986'];
  if (categoryId != null) params.push(`category=${categoryId}`);
  if (difficulty) params.push(`difficulty=${difficulty}`);
  return `${API_BASE}/api.php?${params.join('&')}`;
}

/**
 * Fragen einer Runde laden. Rückgabe: [{ id, question, category, difficulty, answers[4], correctIndex }]
 * options.sleepImpl / options.random sind nur für Tests austauschbar.
 */
export async function fetchQuestions(settings, options = {}) {
  const { sleepImpl = sleep, random = Math.random, retryOnRateLimit = true } = options;
  const url = buildQuestionsUrl(settings);

  let data;
  try {
    data = await fetchJson(url, options);
    if (data?.response_code === 5) throw new QuizApiError('RATE_LIMIT', 'API-Code 5');
  } catch (err) {
    if (err.code !== 'RATE_LIMIT' || !retryOnRateLimit) throw err;
    // Open Trivia DB erlaubt nur 1 Anfrage pro 5 s → einmal automatisch wiederholen
    await sleepImpl(RATE_LIMIT_WAIT_MS);
    return fetchQuestions(settings, { ...options, retryOnRateLimit: false });
  }

  switch (data?.response_code) {
    case 0:
      break;
    case 1:
      throw new QuizApiError('NOT_ENOUGH', 'API-Code 1');
    case 5:
      throw new QuizApiError('RATE_LIMIT', 'API-Code 5');
    case 2:
      throw new QuizApiError('INVALID', 'API-Code 2');
    default:
      throw new QuizApiError('SERVER', `API-Code ${data?.response_code}`);
  }

  return data.results.map((raw, i) => toQuestion(raw, i, random));
}

/** Eine Rohfrage der API in unser Format umwandeln (dekodieren + Antworten mischen). */
export function toQuestion(raw, index, random = Math.random) {
  const correct = decode(raw.correct_answer);
  const answers = shuffle([correct, ...raw.incorrect_answers.map(decode)], random);
  return {
    id: index,
    question: decode(raw.question).trim(),
    category: decode(raw.category),
    difficulty: raw.difficulty,
    answers,
    correctIndex: answers.indexOf(correct),
  };
}

export function decode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text; // falls ein Text nicht kodiert ist, unverändert zurückgeben
  }
}

/** Fisher-Yates-Mischen; gibt ein neues Array zurück. */
export function shuffle(list, random = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
