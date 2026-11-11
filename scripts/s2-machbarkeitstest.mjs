// Machbarkeitstest S2: einen Eintrag in Firestore (Sammlung scores_m335) schreiben und wieder lesen.
// Aufruf:  npm run test:online
// Der Testeintrag hat kategorieId 0 und wird in der App nicht angezeigt.
import { getApps, initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../src/config/firebaseConfig.js';
import { COLLECTION, TEST_CATEGORY_ID, saveScore, toAppError } from '../src/services/onlineScores.js';

const id = `test-${Date.now().toString(36)}`;
const entry = {
  id,
  nickname: 'Testlauf',
  points: 0,
  categoryName: 'Machbarkeitstest',
  categoryId: TEST_CATEGORY_ID,
  difficulty: 'easy',
  amount: 5,
  correct: 0,
  date: new Date().toISOString(),
};

console.log(`Projekt: ${firebaseConfig.projectId} · Sammlung: ${COLLECTION}`);
const start = Date.now();
try {
  console.log('1) Schreiben …');
  await saveScore(entry);
  console.log('2) Lesen …');
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  const snap = await getDoc(doc(getFirestore(app), COLLECTION, id));
  const ok = snap.exists() && snap.data().nickname === 'Testlauf';
  console.log(ok ? `ERGEBNIS: Machbarkeitstest bestanden ✓ (${Date.now() - start} ms, Dokument ${id})` : 'ERGEBNIS: Eintrag nicht gefunden ✗');
  process.exit(ok ? 0 : 1);
} catch (err) {
  const e = toAppError(err);
  const hint = e.code === 'INVALID' ? ' → Regeln für scores_m335 in der Firebase-Konsole veröffentlicht?' : '';
  console.error(`ERGEBNIS: fehlgeschlagen ✗ (${e.code}: ${e.message})${hint}`);
  process.exit(1);
}
