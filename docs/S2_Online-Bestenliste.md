# S2 · Machbarkeitstest Online-Bestenliste

## Entscheid: Firebase Firestore

Ursprünglich war Supabase vorgesehen. Entschieden haben wir uns für **Firebase Firestore**, weil:

- das Team schon ein Firebase-Projekt **triviatime-40c70** mit Sicherheitsregeln hat (aus einer früheren Version),
- das Firebase-JS-SDK dort nachweislich in **Expo Go** lief (kein natives Modul nötig),
- so kein zusätzliches Konto und keine neue Datenbank eingerichtet werden müssen.

**Eigene Sammlung:** TriviaTime_M335 schreibt in `scores_m335`. Die Sammlung `scores` der früheren Version bleibt
unverändert; so mischen sich die Bestenlisten nicht (wichtig für die Demo).

Code: `src/services/onlineScores.js` (nur `saveScore` und `getTopScores`), Konfiguration: `src/config/firebaseConfig.js`.
Plan B bleibt gültig: Klappt es bis Do 12.11., 12:00 nicht, bleibt die Bestenliste lokal (AsyncStorage).

## Gespeicherte Felder (Dokument in `scores_m335`)

| Feld | Beispiel | Bemerkung |
|------|----------|-----------|
| nickname | QuizMaus88 | 3–15 Zeichen, frei gewählt, kein Login |
| punkte | 160 | ganze Zahl 0–600 |
| kategorie / kategorieId | Science & Nature / 17 | für den Kategorie-Filter |
| schwierigkeit | medium | easy / medium / hard |
| anzahl / richtige | 10 / 8 | Anzahl 5–20 |
| datum | 2026-11-11T10:00:00Z | ISO-Datum |

Dokument-ID = lokale ID des Resultats → doppeltes Senden aus der Warteschlange erzeugt kein Duplikat.

## Einrichten (einmalig)

1. Firebase-Konsole → Projekt **triviatime-40c70** → *Firestore Database* → *Regeln*.
2. Den ganzen Inhalt von `firestore.rules` (im Projektordner) einfügen → **Veröffentlichen**.
   Die Regeln enthalten weiterhin die alte Sammlung `scores` und neu `scores_m335`.
3. Test ausführen:

```
npm run test:online
```

Erwartet: «ERGEBNIS: Machbarkeitstest bestanden ✓». Der Testeintrag hat `kategorieId 0` und wird in der App nicht angezeigt
(löschen ist durch die Regeln gesperrt; bei Bedarf in der Konsole von Hand löschen).

## Datenschutz
Online gespeichert werden nur Nickname, Punkte, Kategorie, Schwierigkeit, Anzahl, Richtige und Datum (Konzept Kapitel 10).
Kein Login, keine E-Mail. Der Firebase-`apiKey` ist bei Web-Apps öffentlich; geschützt wird über die Sicherheitsregeln.
