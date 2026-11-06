// Persistenz mit AsyncStorage (Konzept Kapitel 10).
// Heute umgesetzt: Nickname und letzte Quiz-Einstellungen.
// Später (Paket S6): Verlauf / eigene Highscores und Warteschlange für noch nicht gesendete Punkte.

import AsyncStorage from '@react-native-async-storage/async-storage';

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

export async function getNickname() {
  return AsyncStorage.getItem(KEYS.nickname);
}

export async function saveNickname(nickname) {
  await AsyncStorage.setItem(KEYS.nickname, nickname.trim());
}

/** { categoryId, categoryName, difficulty, amount } oder null */
export async function getLastSettings() {
  return readJson(KEYS.lastSettings, null);
}

export async function saveLastSettings(settings) {
  await AsyncStorage.setItem(KEYS.lastSettings, JSON.stringify(settings));
}

/** Verlauf der gespielten Runden (neueste zuerst). Wird in S6 befüllt. */
export async function getHistory() {
  return readJson(KEYS.history, []);
}

export { KEYS as STORAGE_KEYS };
