// Online-Bestenliste (Erweiterung, Risiko R1) – Firebase Firestore.
//
// Entscheid S2: Firebase, weil das Team schon ein Firebase-Projekt (triviatime-40c70) mit
// Sicherheitsregeln hat und das Firebase-JS-SDK nachweislich in Expo Go läuft.
// TriviaTime_M335 nutzt die eigene Sammlung «scores_m335», damit sich nichts mit anderen Versionen mischt.
//
// Kern: saveScore und getTopScores (Konzept Kapitel 5); dazu getOnlineRank für die Resultat-Anzeige.
// Online landen nur Nickname, Punkte, Kategorie, Schwierigkeit, Anzahl, Richtige und Datum.

import { getApps, initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, setDoc, where } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebaseConfig.js';
import { QuizApiError, TIMEOUT_MS } from './quizApi.js';
import { rankInList } from './leaderboard.js';

export const COLLECTION = 'scores_m335';
export const TEST_CATEGORY_ID = 0; // Einträge vom Machbarkeitstest – werden nicht angezeigt

let db = null;

export function isOnlineConfigured(config = firebaseConfig) {
  return config != null && !!config.projectId;
}

function database() {
  if (!isOnlineConfigured()) throw new Error('Online-Bestenliste ist nicht konfiguriert.');
  if (!db) {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
  return db;
}

/** Firestore wartet ohne Netz sehr lange – darum ein eigenes Zeitlimit von 10 s. */
export function withTimeout(promise, ms = TIMEOUT_MS) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new QuizApiError('TIMEOUT', 'Zeitüberschreitung')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Firebase-Fehler in unsere Codes übersetzen, damit die Screens die passende Meldung zeigen. */
export function toAppError(err) {
  if (err instanceof QuizApiError) return err;
  if (err?.code === 'unavailable') return new QuizApiError('OFFLINE', err.message);
  if (err?.code === 'permission-denied') return new QuizApiError('INVALID', 'Zugriff verweigert (Regeln)');
  if (err?.code === 'invalid-argument') return new QuizApiError('INVALID', 'Ungültige Daten');
  return new QuizApiError('SERVER', err?.message ?? 'Unbekannter Fehler');
}

/** Deutsche Meldung für die Bestenliste (Ursache + Lösung, ohne Fehlercodes). */
export function onlineErrorMessage(err) {
  switch (err?.code) {
    case 'OFFLINE':
      return 'Keine Verbindung. Prüfe WLAN oder mobile Daten und versuche es erneut.';
    case 'TIMEOUT':
      return 'Die Online-Bestenliste antwortet nicht (über 10 Sekunden). Versuche es gleich nochmals.';
    default:
      return 'Die Online-Bestenliste ist gerade nicht verfügbar. Deine Resultate siehst du unter «Lokal».';
  }
}

/** Lokaler Eintrag → Firestore-Dokument. Feldnamen müssen zu den Sicherheitsregeln passen. */
export function toDoc(entry) {
  return {
    nickname: entry.nickname,
    punkte: entry.points,
    kategorie: entry.categoryName,
    kategorieId: entry.categoryId,
    schwierigkeit: entry.difficulty,
    anzahl: entry.amount,
    richtige: entry.correct,
    datum: entry.date,
  };
}

/** Firestore-Dokument → Format der App */
export function fromDoc(id, d) {
  return {
    id,
    nickname: d.nickname,
    points: d.punkte,
    categoryName: d.kategorie,
    categoryId: d.kategorieId,
    difficulty: d.schwierigkeit,
    amount: d.anzahl,
    correct: d.richtige,
    date: d.datum,
  };
}

/**
 * Score online speichern. Die lokale id wird als Dokument-ID verwendet:
 * wird derselbe Score zweimal gesendet (z. B. aus der Warteschlange), entsteht kein Duplikat.
 */
export async function saveScore(entry) {
  try {
    const ref = doc(database(), COLLECTION, entry.id);
    const existing = await withTimeout(getDoc(ref));
    if (existing.exists()) return;
    await withTimeout(setDoc(ref, toDoc(entry)));
  } catch (err) {
    throw toAppError(err);
  }
}

/**
 * Top 20 laden, optional nur eine Kategorie (Name).
 * Mit Filter wird lokal sortiert, damit Firestore keinen zusätzlichen Index braucht.
 */
export async function getTopScores({ categoryName, max = 20 } = {}) {
  try {
    const scores = collection(database(), COLLECTION);
    const q = categoryName
      ? query(scores, where('kategorie', '==', categoryName), limit(200))
      : query(scores, orderBy('punkte', 'desc'), limit(max + 10));
    const snap = await withTimeout(getDocs(q));
    return sortTop(
      snap.docs.map((d) => fromDoc(d.id, d.data())),
      max
    );
  } catch (err) {
    throw toAppError(err);
  }
}

/**
 * Online-Rang eines gesendeten Scores in seiner Kategorie → { rank, total } oder null.
 * Wie beim Filter: nur nach Kategorie abfragen und lokal sortieren (kein Firestore-Index nötig).
 */
export async function getOnlineRank(entry) {
  try {
    const q = query(collection(database(), COLLECTION), where('kategorie', '==', entry.categoryName), limit(500));
    const snap = await withTimeout(getDocs(q));
    const sorted = sortTop(
      snap.docs.map((d) => fromDoc(d.id, d.data())),
      Infinity
    );
    return rankInList(sorted, entry.id);
  } catch (err) {
    throw toAppError(err);
  }
}

/** Fehler, bei denen erneutes Senden nie hilft (von den Sicherheitsregeln abgelehnt). */
export function isPermanentError(err) {
  return err?.code === 'INVALID';
}

/** Testeinträge ausblenden, nach Punkten sortieren (Gleichstand: früher gespielt zuerst), begrenzen. */
export function sortTop(list, max = 20) {
  return list
    .filter((e) => e.categoryId !== TEST_CATEGORY_ID)
    .sort((a, b) => b.points - a.points || String(a.date).localeCompare(String(b.date)))
    .slice(0, max);
}
