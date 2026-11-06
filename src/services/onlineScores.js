// Online-Bestenliste (Erweiterung, Risiko R1) – Supabase über die REST-Schnittstelle.
//
// Entscheid S2: Supabase statt Firebase, weil
//  - es nur zwei einfache HTTP-Anfragen braucht (fetch), kein zusätzliches SDK und kein natives Modul
//    → läuft garantiert in Expo Go,
//  - die Tabelle «scores» mit SQL und Zugriffsregeln (Row Level Security) klar definiert ist.
//
// Nur zwei Aktionen: saveScore und getTopScores (Konzept Kapitel 5).
// Die Zugangsdaten kommen aus .env.local (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_KEY)
// und werden nicht ins Repo eingecheckt.

import { fetchJson } from './quizApi.js';

const TABLE = 'scores';

export function getOnlineConfig(env = process.env) {
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const key = env.EXPO_PUBLIC_SUPABASE_KEY;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

export function isOnlineConfigured(env) {
  return getOnlineConfig(env) !== null;
}

function headers(key) {
  return { apikey: key, 'Content-Type': 'application/json' };
}

/** Score online speichern: { nickname, points, category } → gespeicherter Eintrag */
export async function saveScore({ nickname, points, category }, { config = getOnlineConfig(), fetchImpl = globalThis.fetch } = {}) {
  if (!config) throw new Error('Online-Bestenliste ist nicht konfiguriert.');
  const res = await fetchImpl(`${config.url}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: { ...headers(config.key), Prefer: 'return=representation' },
    body: JSON.stringify({ nickname, points, category }),
  });
  if (!res.ok) throw new Error(`Speichern fehlgeschlagen (HTTP ${res.status})`);
  const [row] = await res.json();
  return row;
}

/** Top 20 laden, optional gefiltert nach Kategorie. */
export async function getTopScores({ limit = 20, category } = {}, { config = getOnlineConfig(), fetchImpl = globalThis.fetch } = {}) {
  if (!config) throw new Error('Online-Bestenliste ist nicht konfiguriert.');
  let url = `${config.url}/rest/v1/${TABLE}?select=nickname,points,category,created_at&order=points.desc,created_at.asc&limit=${limit}`;
  if (category) url += `&category=eq.${encodeURIComponent(category)}`;
  // fetchJson bringt Timeout (10 s) und die Unterscheidung «kein Netz» mit
  return fetchJson(url, { fetchImpl: (u, opts) => fetchImpl(u, { ...opts, headers: headers(config.key) }) });
}
