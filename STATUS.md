# Status · Stand Mi 11.11.2026 (Abend)

| Nr | Paket | Status | Bemerkung |
|----|-------|--------|-----------|
| S1 | Projekt-Setup | fertig | Repo auf GitHub. **Offen:** Start in Expo Go auf beiden Handys, Tanushree klont und pusht |
| S2 | Machbarkeitstest Online-Bestenliste | fertig | Entscheid **Firebase Firestore** (bestehendes Projekt triviatime-40c70, eigene Sammlung `scores_m335`). Regeln veröffentlicht; Machbarkeitstest am 11.11. bestanden (schreiben + lesen in 470 ms); ungültige Einträge werden abgelehnt |
| T1 | Theme & UI-Bausteine | fertig | Test-Screen `/bausteine` |
| S3 | Navigation | fertig | Android-Zurück auf echtem Android-Handy noch prüfen |
| T2 | Home + Nickname | fertig | |
| S4 | Quiz-API-Service | fertig | |
| T3 | Quiz-Setup | fertig | Stepper rechnet jetzt auch bei schnellen Mehrfach-Taps richtig |
| T4 | Screen Frage + Feedback (UI) | fertig | Spiel-Design wie Screendesign: Punkte-Pille, Fortschrittsbalken, weisse Fragekarte, Feedback-Balken, ✓/✗ mit Text, Rest ausgegraut, «Weiter ›», Lade-Platzhalter, «Keine Verbindung» |
| S5 | Quiz-Logik | fertig | `src/services/quizLogic.js`: Runde, Antwort prüfen, Punkte 10/20/30, Fortschritt, Doppel-Tap-Schutz; mit Tests |
| S6 | Persistenz | fertig (Web) | Nickname, letzte Einstellungen, Verlauf (max. 100), Warteschlange (max. 50). Nach Neuladen alles noch da. **Offen:** Neustart-Test auf dem Handy |
| T5 | Resultat + Bestenliste (UI) | fertig | Resultat: Ring, Konfetti, Rechenzeile, Status «Gespeichert · Rang #». Bestenliste: Treppchen, Liste, «Du», Online/Lokal, Kategorie-Filter, Zustände lädt/leer/kein Netz/nicht eingerichtet, Herunterziehen |
| S7 | Online-Bestenliste | fertig | `src/services/scoreSync.js`: Warteschlange wird beim App-Start, wenn die App wieder aktiv wird, nach jeder Runde und beim Öffnen/Herunterziehen der Bestenliste gesendet. Resultat zeigt «Score wird gesendet …», «Online gespeichert · Rang #x von y» oder «Offline – lokal gespeichert» mit «Jetzt erneut senden». Bestenliste zeigt «1 Score wartet noch auf das Senden». Ungültige Einträge blockieren die Warteschlange nicht |
| S8 | Integration & Bugfixes | fertig (Web) | Alle 5 Screens zusammen durchgespielt; Expo-Pakete auf die aktuellen Patch-Versionen gebracht (`npx expo install --fix`). **Offen:** auf beiden Handys |
| T8 | Testkonzept + Test auf Gerät | in Arbeit | `docs/T8_Testkonzept.md`: Teststufen, 34 Testfälle (Formular, Quiz, Offline, Persistenz, Abbrechen, Online), Spalte Web ausgefüllt. **Offen:** Spalten Handy 1 und Handy 2 |
| T6 | Technische Dokumentation | – | nicht nötig (Entscheid Team) |
| T7 | Präsentation | – | nicht nötig (Entscheid Team) |

## Geprüft
- `npm test`: 37 / 37 Tests bestanden (Validierung, Quiz-API, Quiz-Logik, Bestenliste/Warteschlange, Online-Service)
- `npx expo-doctor`: 20 / 20 Checks bestanden; Android-Bundle baut fehlerfrei
- Im Browser (Handygrösse) durchgespielt: Setup → Runde → Resultat «Online gespeichert · Rang» → Bestenliste online mit «Du»; Offline simuliert → «Offline – lokal gespeichert» → «Jetzt erneut senden» → online; Validierung (25 Fragen) und Abbrechen geprüft

## Noch nicht geprüft
- Expo Go auf echten Handys (iOS und Android): Neustart der App, Android-Zurück, echter Flugmodus (siehe Testkonzept)

## Hinweis für die Demo
Beim Testen sind in `scores_m335` Einträge mit dem Nickname «QuizMaus88» entstanden. Wer eine leere Online-Bestenliste
zeigen will, löscht sie in der Firebase-Konsole (Firestore → scores_m335); die App selbst kann nicht löschen (Regeln).
