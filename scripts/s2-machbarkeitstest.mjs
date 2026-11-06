// Machbarkeitstest S2: einen Eintrag online schreiben und wieder lesen.
// Aufruf:  npm run test:online   (liest die Zugangsdaten aus .env.local)
import { getOnlineConfig, saveScore, getTopScores } from '../src/services/onlineScores.js';

const config = getOnlineConfig();
if (!config) {
  console.error('Fehlt: EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_KEY in .env.local (siehe docs/S2_Online-Bestenliste.md)');
  process.exit(1);
}

const entry = { nickname: 'TestS2', points: 160, category: 'Science & Nature' };
console.log('1) Schreiben …', entry);
const saved = await saveScore(entry);
console.log('   gespeichert:', saved);

console.log('2) Lesen (Top 20) …');
const top = await getTopScores();
console.table(top);

const found = top.some((r) => r.nickname === entry.nickname && r.points === entry.points);
console.log(found ? 'ERGEBNIS: Machbarkeitstest bestanden ✓' : 'ERGEBNIS: Eintrag nicht gefunden ✗');
process.exit(found ? 0 : 1);
