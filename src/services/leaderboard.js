// Bestenlisten-Berechnungen (Paket S6/T5) – reine Funktionen, mit `npm test` prüfbar.

export const TOP_LIMIT = 20;
export const HISTORY_LIMIT = 100;
export const QUEUE_LIMIT = 50;

/** Sortierung: mehr Punkte zuerst; bei Gleichstand zählt, wer früher gespielt hat. */
export function compareScores(a, b) {
  if (b.points !== a.points) return b.points - a.points;
  return String(a.date).localeCompare(String(b.date));
}

/** Top-Liste aus dem lokalen Verlauf, optional nur eine Kategorie. */
export function topScores(history, { categoryName, limit = TOP_LIMIT } = {}) {
  return history
    .filter((e) => !categoryName || e.categoryName === categoryName)
    .slice()
    .sort(compareScores)
    .slice(0, limit);
}

/** Rang (1, 2, …) eines Eintrags innerhalb seiner Kategorie im lokalen Verlauf. */
export function rankInCategory(history, entry) {
  const sameCategory = history.filter((e) => e.categoryName === entry.categoryName).sort(compareScores);
  const pos = sameCategory.findIndex((e) => e.id === entry.id);
  return pos === -1 ? null : pos + 1;
}

/** Neuen Eintrag vorne anfügen und den Verlauf begrenzen (älteste fallen weg). */
export function addToHistory(history, entry, limit = HISTORY_LIMIT) {
  return [entry, ...history].slice(0, limit);
}

export function makeId(date = new Date(), random = Math.random) {
  return `${date.getTime().toString(36)}-${Math.floor(random() * 1e6).toString(36)}`;
}

/**
 * Warteschlange abarbeiten: jeden Eintrag mit send() verschicken.
 * Erfolgreich gesendete fallen raus; beim ersten Fehler (z. B. Funkloch) wird abgebrochen,
 * der Rest bleibt in der Warteschlange und wird später nochmals versucht.
 * Rückgabe: { sent: [...], remaining: [...], error }
 */
export async function flushQueue(queue, send) {
  const sent = [];
  for (let i = 0; i < queue.length; i++) {
    try {
      await send(queue[i]);
      sent.push(queue[i]);
    } catch (error) {
      return { sent, remaining: queue.slice(i), error };
    }
  }
  return { sent, remaining: [], error: null };
}
