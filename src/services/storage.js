// Persistenz mit AsyncStorage (Paket S6, Konzept Kapitel 10).
//
// Gespeichert wird nur, was die App beim nächsten Start braucht:
//  - Nickname                 → Begrüssung, jeder Score-Eintrag
//  - letzte Quiz-Einstellungen → «Schnellstart»
//  - Verlauf (eigene Resultate) → Home, lokale Bestenliste, auch ohne Netz
//  - Warteschlange            → noch nicht online gesendete Punkte (wird in S7 abgearbeitet)
// Ein laufendes Quiz wird bewusst NICHT gespeichert.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToHistory, makeId, QUEUE_LIMIT, flushQueue as flushWith } from './leaderboard';

const KEYS = {
  nickname: 'tt.nickname',
  lastSettings: 'tt.lastSettings',
  history: 'tt.history',
  queue: 'tt.scoreQueue',
};

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback; // kaputte Daten sollen die App nicht abstürzen lassen
  }
}

async function writeJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ---------- Nickname ----------
export async function getNickname() {
  return AsyncStorage.getItem(KEYS.nickname);
}

export async function saveNickname(nickname) {
  await AsyncStorage.setItem(KEYS.nickname, nickname.trim());
}

// ---------- Letzte Einstellungen (Schnellstart) ----------
/** { categoryId, categoryName, difficulty, amount } oder null */
export async function getLastSettings() {
  return readJson(KEYS.lastSettings, null);
}

export async function saveLastSettings(settings) {
  await writeJson(KEYS.lastSettings, settings);
}

// ---------- Verlauf ----------
/** Eigene Resultate, neueste zuerst. */
export async function getHistory() {
  return readJson(KEYS.history, []);
}

/**
 * Resultat einer beendeten Runde speichern: zuerst lokal im Verlauf,
 * dann in die Warteschlange für die Online-Bestenliste.
 * Rückgabe: der gespeicherte Eintrag (mit id).
 */
export async function saveResult(result, nickname) {
  const entry = { id: makeId(new Date(result.date)), nickname, ...result };
  const history = await getHistory();
  await writeJson(KEYS.history, addToHistory(history, entry));
  await enqueueScore(entry);
  return entry;
}

// ---------- Warteschlange ----------
export async function getQueue() {
  return readJson(KEYS.queue, []);
}

/** Nur die Daten, die online landen dürfen (siehe onlineScores.toDoc). */
export async function enqueueScore(entry) {
  const queue = await getQueue();
  const item = {
    id: entry.id,
    nickname: entry.nickname,
    points: entry.points,
    categoryName: entry.categoryName,
    categoryId: entry.categoryId,
    difficulty: entry.difficulty,
    amount: entry.amount,
    correct: entry.correct,
    date: entry.date,
  };
  await writeJson(KEYS.queue, [...queue, item].slice(-QUEUE_LIMIT));
}

/** Warteschlange mit send() abarbeiten; nicht gesendete bleiben gespeichert. */
export async function flushQueue(send) {
  const queue = await getQueue();
  const result = await flushWith(queue, send);
  await writeJson(KEYS.queue, result.remaining);
  return result;
}

export { KEYS as STORAGE_KEYS };
