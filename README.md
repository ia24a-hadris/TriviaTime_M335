# TriviaTime_M335

Quiz-App für Modul 335 «Mobile-Applikation realisieren» · Team Tanushree & Sakina.
React Native mit Expo (SDK 58), getestet in **Expo Go**.

Fragen kommen live aus der [Open Trivia DB](https://opentdb.com) (Special Feature Netzwerk/API).
Kein Login, kein Timer, keine Werbung.

## Starten

```bash
npm install
npx expo start
```

QR-Code mit der Expo-Go-App scannen (Handy und PC im gleichen WLAN).
Im Browser: `npx expo start --web`.

## Tests

```bash
npm test             # Unit-Tests: Validierung, Quiz-API, Quiz-Logik, Bestenliste, Online-Service
npm run test:online  # Machbarkeitstest Firebase: Eintrag in scores_m335 schreiben und lesen (siehe docs/)
```

## Aufbau

```
src/
  app/                    Screens (Expo Router, dateibasiert)
    _layout.js            Root-Stack, lädt Schrift Nunito
    (tabs)/_layout.js     Tab-Bar: Spielen, Bestenliste
    (tabs)/(spielen)/     Stack: Home → Quiz-Setup → Frage → Resultat
    (tabs)/bestenliste.js
    bausteine.js          Test-Screen aller UI-Bausteine (lange auf «Trivia Time» drücken)
  components/             UI-Bausteine (Button, Karte, Antwortfeld, Formularfelder, Zustände, Modals)
  services/               Logik ohne UI: quizApi, quizLogic, storage (AsyncStorage), validation,
                          leaderboard, onlineScores (Firebase), scoreSync (Warteschlange senden)
  theme/                  Farben, Schrift, Masse gemäss Konzept
tests/                    Unit-Tests (node:test)
docs/                     Machbarkeitstest Online-Bestenliste (S2), Testkonzept (T8)
```

## Navigation (gemäss Workflow)

| Übergang | Typ |
|----------|-----|
| Home → Quiz-Setup → Frage | Stack (push) |
| Frage → Resultat, «Nochmals spielen» | Replace |
| «Ja, abbrechen», «Startseite» | popToTop (`dismissAll`) |
| Nickname ändern, Quiz abbrechen? | Modal |
| Spielen ↔ Bestenliste | Tab |

Im Quiz ist die Tab-Bar ausgeblendet; Android-Zurück öffnet dort die Rückfrage «Quiz wirklich abbrechen?».

## Online-Bestenliste

Jeder Score wird zuerst auf dem Handy gespeichert (Verlauf + Warteschlange) und dann an Firebase Firestore
(Sammlung `scores_m335`) gesendet: beim App-Start, nach jeder Runde und beim Öffnen der Bestenliste.
Ohne Netz bleibt er in der Warteschlange und wird später automatisch nachgeschickt. Details: `docs/S2_Online-Bestenliste.md`.
