// Tests für den Online-Bestenlisten-Service (Firebase) – ohne echte Verbindung:
// geprüft werden Umwandlung, Sortierung, Zeitlimit und Fehler-Übersetzung.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toDoc, fromDoc, sortTop, withTimeout, toAppError, isOnlineConfigured, isPermanentError, COLLECTION } from '../src/services/onlineScores.js';

const entry = {
  id: 'abc',
  nickname: 'Nikola',
  points: 160,
  categoryName: 'Science & Nature',
  categoryId: 17,
  difficulty: 'medium',
  amount: 10,
  correct: 8,
  date: '2026-11-11T10:00:00.000Z',
  pointsPerCorrect: 20, // darf NICHT online landen
};

test('eigene Sammlung für TriviaTime_M335', () => {
  assert.equal(COLLECTION, 'scores_m335');
});

test('ohne Konfiguration gilt Online als nicht eingerichtet', () => {
  assert.equal(isOnlineConfigured(null), false);
  assert.equal(isOnlineConfigured({ projectId: 'x' }), true);
});

test('Dokument hat genau die Felder, die die Sicherheitsregeln erlauben', () => {
  const d = toDoc(entry);
  assert.deepEqual(Object.keys(d).sort(), ['anzahl', 'datum', 'kategorie', 'kategorieId', 'nickname', 'punkte', 'richtige', 'schwierigkeit']);
  assert.equal(d.punkte, 160);
  assert.ok(Number.isInteger(d.punkte) && Number.isInteger(d.anzahl)); // Regeln verlangen int
});

test('Hin- und Rückweg ergibt wieder denselben Eintrag', () => {
  const { pointsPerCorrect, ...expected } = entry;
  assert.deepEqual(fromDoc('abc', toDoc(entry)), expected);
});

test('Top-Liste: sortiert, Testeinträge ausgeblendet, begrenzt', () => {
  const list = [
    { id: 1, points: 100, categoryId: 9, date: 'b' },
    { id: 2, points: 300, categoryId: 9, date: 'b' },
    { id: 3, points: 999, categoryId: 0, date: 'a' }, // Machbarkeitstest
    { id: 4, points: 300, categoryId: 9, date: 'a' },
  ];
  assert.deepEqual(
    sortTop(list).map((e) => e.id),
    [4, 2, 1]
  );
  assert.equal(sortTop(list, 1).length, 1);
});

test('Zeitlimit: keine Antwort → TIMEOUT', async () => {
  await assert.rejects(withTimeout(new Promise(() => {}), 30), { code: 'TIMEOUT' });
});

test('Firebase-Fehler werden übersetzt', () => {
  assert.equal(toAppError({ code: 'unavailable' }).code, 'OFFLINE');
  assert.equal(toAppError({ code: 'permission-denied' }).code, 'INVALID');
});

test('Nur «von den Regeln abgelehnt» gilt als endgültiger Fehler', () => {
  assert.equal(isPermanentError(toAppError({ code: 'permission-denied' })), true);
  assert.equal(isPermanentError(toAppError({ code: 'invalid-argument' })), true); // z. B. fehlendes Feld
  assert.equal(isPermanentError(toAppError({ code: 'unavailable' })), false);
  assert.equal(isPermanentError(new Error('x')), false);
});
