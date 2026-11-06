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
npm test             # Unit-Tests: Validierung, Quiz-API, Online-Bestenliste
npm run test:online  # Machbarkeitstest Supabase (braucht .env.local, siehe docs/)
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
  services/               Logik ohne UI: quizApi, storage (AsyncStorage), validation, onlineScores
  theme/                  Farben, Schrift, Masse gemäss Konzept
tests/                    Unit-Tests (node:test)
docs/                     Entscheide und Anleitungen
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
