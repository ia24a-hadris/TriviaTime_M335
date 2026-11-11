# Status · Stand Mi 11.11.2026

| Nr | Paket | Status | Bemerkung |
|----|-------|--------|-----------|
| S1 | Projekt-Setup | fertig | Repo auf GitHub. **Offen:** Start in Expo Go auf beiden Handys, Tanushree klont und pusht |
| S2 | Machbarkeitstest Online-Bestenliste | in Arbeit | Entscheid geändert auf **Firebase Firestore** (bestehendes Projekt triviatime-40c70, eigene Sammlung `scores_m335`). Service + Test-Skript fertig. **Offen:** Regeln aus `firestore.rules` in der Konsole veröffentlichen, dann `npm run test:online` |
| T1 | Theme & UI-Bausteine | fertig | Test-Screen `/bausteine` |
| S3 | Navigation | fertig | Android-Zurück auf echtem Android-Handy noch prüfen |
| T2 | Home + Nickname | fertig | |
| S4 | Quiz-API-Service | fertig | |
| T3 | Quiz-Setup | fertig | Stepper rechnet jetzt auch bei schnellen Mehrfach-Taps richtig |
| T4 | Screen Frage + Feedback (UI) | fertig | Spiel-Design wie Screendesign: Punkte-Pille, Fortschrittsbalken, weisse Fragekarte, Feedback-Balken, ✓/✗ mit Text, Rest ausgegraut, «Weiter ›», Lade-Platzhalter, «Keine Verbindung» |
| S5 | Quiz-Logik | fertig | `src/services/quizLogic.js`: Runde, Antwort prüfen, Punkte 10/20/30, Fortschritt, Doppel-Tap-Schutz; mit Tests |
| S6 | Persistenz | fertig (Web) | Nickname, letzte Einstellungen, Verlauf (max. 100), Warteschlange (max. 50). Nach Neuladen alles noch da. **Offen:** Neustart-Test auf dem Handy |
| T5 | Resultat + Bestenliste (UI) | fertig | Resultat: Ring, Konfetti, Rechenzeile, Status «Gespeichert · Rang #». Bestenliste: Treppchen, Liste, «Du», Online/Lokal, Kategorie-Filter, Zustände lädt/leer/kein Netz/nicht eingerichtet, Herunterziehen |

## Geprüft
- `npm test`: 31 / 31 Tests bestanden (Validierung, Quiz-API, Quiz-Logik, Bestenliste/Warteschlange, Online-Service)
- `npx expo-doctor`: 20 / 20 Checks bestanden; Android-Bundle baut fehlerfrei
- Im Browser (Handygrösse) durchgespielt: Setup → ganze Runde mit echten API-Fragen → Resultat → lokale Bestenliste → Seite neu geladen → Daten noch da

## Noch nicht geprüft
- Expo Go auf echten Handys (iOS und Android), inkl. Neustart der App und Android-Zurück

## Nächste Pakete (Do 12.11.)
S7 Online-Bestenliste (Warteschlange senden, Resultat-Status «wird gesendet» / «offline»), S8 Integration, T6 Doku, T7 Präsentation, T8 Test auf Geräten
