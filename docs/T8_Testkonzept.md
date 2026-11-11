# T8 · Testkonzept TriviaTime_M335

## Ziel
Wir prüfen, ob die App die Minimalanforderungen erfüllt (5 Screens, Formular mit Validierung, Persistenz,
Special Feature Netzwerk/API, Fehlerzustände) und auf beiden Handys in **Expo Go** läuft.

## Teststufen

| Stufe | Was | Wie | Wer |
|-------|-----|-----|-----|
| 1. Unit-Tests | Reine Logik ohne UI: Validierung, Quiz-API (Umwandeln, Mischen, Fehlercodes), Quiz-Logik (Punkte, Fortschritt), Bestenliste und Warteschlange, Online-Service | `npm test` (37 Tests, `node:test`) | automatisch, vor jedem Commit |
| 2. Machbarkeitstest Online | Eintrag in Firestore schreiben und wieder lesen | `npm run test:online` | Sakina (S2) |
| 3. Manuelle Tests Browser | Alle Testfälle unten im Browser in Handygrösse (375 × 812) | `npx expo start --web` | Sakina |
| 4. Manuelle Tests Gerät | Alle Testfälle unten auf beiden Handys in Expo Go | `npx expo start`, QR-Code scannen | Tanushree (Review: Sakina) |

## Testumgebung

| Gerät | System | Expo Go | Getestet von |
|-------|--------|---------|--------------|
| Browser (Laptop) | Chrome, Ansicht 375 × 812 | – (Web) | Sakina |
| Handy 1 | _iOS/Android, Version eintragen_ | _Version_ | |
| Handy 2 | _iOS/Android, Version eintragen_ | _Version_ | |

## Testfälle

Legende Resultat: ✓ bestanden · ✗ Fehler (Nr. in der Fehlerliste) · – nicht testbar · leer = noch offen

### A · Formulare und Validierung

| Nr | Schritte | Erwartet | Web 11.11. | Handy 1 | Handy 2 |
|----|----------|----------|-----------|---------|---------|
| A1 | Erster Start, Nickname leer lassen, «Los geht's» | Meldung «Bitte gib einen Nickname ein.», kein Weiter | ✓ (Unit-Test) | | |
| A2 | Nickname «ab» | «Zu kurz: mindestens 3 Zeichen.» | ✓ (Unit-Test) | | |
| A3 | Nickname «Quiz Maus» (Leerzeichen) | «Nur Buchstaben und Zahlen, ohne Leerzeichen.» | ✓ (Unit-Test) | | |
| A4 | Nickname «QuizMaus88» | Home zeigt «Hallo, QuizMaus88!» | ✓ | | |
| A5 | Home → Stift → Nickname ändern | Modal, neuer Name sofort auf Home | ✓ | | |
| A6 | Quiz-Setup: Anzahl 25 eintippen | Rotes Feld, «Bitte wähle 5 bis 20 Fragen.», «Quiz starten» gesperrt | ✓ | | |
| A7 | Quiz-Setup: + / − schnell mehrmals tippen | Zahl ändert sich bei jedem Tipp, bleibt in 5–20 | ✓ | | |

### B · Quiz spielen (Special Feature Netzwerk/API)

| Nr | Schritte | Erwartet | Web 11.11. | Handy 1 | Handy 2 |
|----|----------|----------|-----------|---------|---------|
| B1 | Science & Nature · Mittel · 10 → «Quiz starten» | Lade-Platzhalter, dann Frage 1/10 aus der Open Trivia DB | ✓ | | |
| B2 | Antwort tippen | Sofort Feedback: grün/rot mit ✓/✗ und Text, Punkte-Pille zählt hoch, Rest ausgegraut | ✓ | | |
| B3 | Zweimal schnell auf Antworten tippen | Nur die erste Antwort zählt | ✓ (Unit-Test) | | |
| B4 | Ganze Runde → «Zum Resultat» | Resultat mit Ring, Punkten, Rechenzeile | ✓ | | |
| B5 | Sonderzeichen in Fragen (z. B. «'», «&») | Werden richtig angezeigt, kein `&quot;` | ✓ | | |
| B6 | Viele Fragen in kleiner Kategorie (z. B. 20 · Schwer) | Meldung «zu wenige Fragen» mit Lösung | ✓ (Unit-Test) | | |

### C · Offline und Fehler

| Nr | Schritte | Erwartet | Web 11.11. | Handy 1 | Handy 2 |
|----|----------|----------|-----------|---------|---------|
| C1 | Flugmodus an → Quiz starten | Zustand «Keine Verbindung» mit «Erneut versuchen» und «Zurück zum Setup» | ✓ (6.11.) | | |
| C2 | Flugmodus wieder aus → «Erneut versuchen» | Fragen laden, Runde startet | – | | |
| C3 | Fragen geladen → Flugmodus an → Runde fertig spielen | Runde läuft weiter; Resultat zeigt «Offline – lokal gespeichert» + «Jetzt erneut senden» | ✓ (simuliert) | | |
| C4 | Flugmodus aus → «Jetzt erneut senden» | «Online gespeichert · Rang #…» | ✓ | | |
| C5 | Offline → Tab Bestenliste, Online | Fehlerzustand mit «Erneut versuchen» und «Lokale Resultate anzeigen»; Hinweis «1 Score wartet …» | teilweise: Hinweis ✓ | | |

### D · Persistenz

| Nr | Schritte | Erwartet | Web 11.11. | Handy 1 | Handy 2 |
|----|----------|----------|-----------|---------|---------|
| D1 | Runde spielen, App ganz schliessen (aus App-Übersicht wischen), neu öffnen | Nickname, «Letztes Quiz», «Bester Score» noch da | ✓ (Seite neu geladen) | | |
| D2 | Neu öffnen → «Schnellstart» | Startet mit den letzten Einstellungen | ✓ | | |
| D3 | Tab Bestenliste → «Lokal» | Eigene Resultate, neueste Runde dabei | ✓ | | |
| D4 | Offline gespielt, App schliessen, mit Netz neu öffnen | Score wird beim Start automatisch gesendet, erscheint online | ✓ (Senden beim Start) | | |

### E · Navigation und Abbrechen

| Nr | Schritte | Erwartet | Web 11.11. | Handy 1 | Handy 2 |
|----|----------|----------|-----------|---------|---------|
| E1 | Im Quiz auf ✕ | Modal «Quiz wirklich abbrechen?» | ✓ | | |
| E2 | «Weiterspielen» | Modal zu, gleiche Frage | ✓ | | |
| E3 | «Ja, abbrechen» | Zurück auf Home, kein Score gespeichert | ✓ | | |
| E4 | Android: Zurück-Taste im Quiz | Gleiches Modal wie ✕ | – | | |
| E5 | Android: Zurück-Taste auf Resultat | Home (nicht zurück ins Quiz) | – | | |
| E6 | Im Quiz | Tab-Bar ist ausgeblendet | ✓ | | |
| E7 | Resultat → «Bestenliste» / «Startseite» | Tab Bestenliste bzw. Home | ✓ | | |

### F · Online-Bestenliste

| Nr | Schritte | Erwartet | Web 11.11. | Handy 1 | Handy 2 |
|----|----------|----------|-----------|---------|---------|
| F1 | Runde beenden (mit Netz) | «Score wird gesendet …», dann «Online gespeichert · Rang #x von y» | ✓ | | |
| F2 | Tab Bestenliste · Online | Treppchen Top 3, darunter Rang 4–20; eigene Zeile mit «Du» | ✓ | | |
| F3 | Kategorie-Filter | Nur Einträge dieser Kategorie | ✓ | | |
| F4 | Liste nach unten ziehen | Liste wird neu geladen | – (Web) | | |
| F5 | Auf Handy 1 spielen, auf Handy 2 Bestenliste öffnen | Score von Handy 1 erscheint | | | |

## Fehlerliste

| Nr | Gefunden | Beschreibung | Status |
|----|----------|--------------|--------|
| 1 | 6.11. Web | «+» im Stepper auf schmalen Screens abgeschnitten | behoben |
| 2 | 6.11. Web | Schnelle Mehrfach-Taps auf + / − gingen verloren | behoben |
| 3 | 11.11. Web | Alte Einträge in der Warteschlange (fehlende Felder) hätten das Senden für immer blockiert | behoben: ungültige Einträge werden verworfen (Unit-Test) |
| 4 | | | |

## Was bewusst nicht getestet wird
- Mehrere Hundert Einträge online (Schulprojekt, Top 20 reicht).
- Schummeln über manipulierte Anfragen: ohne Login nicht ganz zu verhindern; die Sicherheitsregeln begrenzen Werte (Punkte 0–600, Nickname 3–15, Anzahl 5–20).
