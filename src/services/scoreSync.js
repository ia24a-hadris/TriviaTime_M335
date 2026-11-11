// Scores online nachsenden (Paket S7).
//
// Jeder Score landet zuerst lokal im Verlauf und in der Warteschlange (storage.saveResult).
// syncScores() schickt die Warteschlange an die Online-Bestenliste. Aufgerufen wird es
//  - beim App-Start und wenn die App wieder in den Vordergrund kommt (Root-Layout),
//  - nach jeder Runde (Resultat-Screen, mit Anzeige «wird gesendet» / «offline»),
//  - beim Öffnen und Aktualisieren der Bestenliste.
// Ohne Netz bleibt alles in der Warteschlange und wird beim nächsten Mal gesendet.

import { flushQueue, getQueue } from './storage';
import { isOnlineConfigured, isPermanentError, saveScore } from './onlineScores';

// Läufe nacheinander ausführen, damit nie zwei gleichzeitig dieselbe Warteschlange bearbeiten
let chain = Promise.resolve();

/**
 * Rückgabe: { state, sent, dropped, remaining, error }
 * state: 'unconfigured' | 'ok' (alles gesendet) | 'error' (Rest bleibt in der Warteschlange)
 */
export function syncScores() {
  if (!isOnlineConfigured()) {
    return Promise.resolve({ state: 'unconfigured', sent: [], dropped: [], remaining: [], error: null });
  }
  const run = chain.then(async () => {
    const result = await flushQueue(saveScore, { isPermanent: isPermanentError });
    return { state: result.error ? 'error' : 'ok', ...result };
  });
  chain = run.catch(() => {});
  return run;
}

/** Wartet dieser Score noch auf das Senden? */
export async function isQueued(id) {
  const queue = await getQueue();
  return queue.some((e) => e.id === id);
}

/** Anzahl Scores, die noch nicht online sind (Hinweis in der Bestenliste). */
export async function pendingCount() {
  const queue = await getQueue();
  return queue.length;
}
