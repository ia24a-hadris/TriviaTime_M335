# Status · Stand Fr 6.11.2026, 16:30

| Nr | Paket | Status | Bemerkung |
|----|-------|--------|-----------|
| S1 | Projekt-Setup | erledigt (lokal) | Expo SDK 58, Expo Router, AsyncStorage, Nunito; Git-Repo lokal. **Offen:** GitHub-Repo anlegen, pushen, Tanushree einladen; Start in Expo Go auf beiden Handys prüfen |
| S2 | Machbarkeitstest Online-Bestenliste | vorbereitet | Entscheid **Supabase** (REST, läuft in Expo Go). Service + Test-Skript fertig. **Offen:** Supabase-Projekt anlegen, `npm run test:online` ausführen (Anleitung `docs/S2_Online-Bestenliste.md`) |
| T1 | Theme & UI-Bausteine | erledigt | Alle Bausteine auf dem Test-Screen `/bausteine`; Touch-Targets ≥ 48 dp, Hauptbuttons 56 dp, Antworten 64 dp |
| S3 | Navigation | erledigt | 5 Screens erreichbar; Stack, Tab, Modal, Replace, popToTop getestet (Web). Android-Zurück auf Frage/Resultat eingebaut, **auf Android-Handy noch prüfen** |
| T2 | Home + Nickname | erledigt | Erster Start mit Formular, Modal «Nickname ändern», Validierung 3–15 Zeichen beim Feld, Nickname bleibt gespeichert |
| S4 | Quiz-API-Service | erledigt | Kategorien + Fragen live, Sonderzeichen, Mischen; Offline, Timeout 10 s, Codes 1/5 mit Tests belegt (`npm test`) |
| T3 | Quiz-Setup | erledigt | Kategorie aus API, Segmente, Stepper 5–20 + Direkteingabe, Fehler beim Feld, Start gesperrt, Lade-/Fehlerzustand; letzte Einstellungen werden gespeichert (Schnellstart) |

## Geprüft
- `npm test`: 18 / 18 Tests bestanden
- `npx expo-doctor`: 20 / 20 Checks bestanden
- Android-Bundle (`npx expo export --platform android`) baut fehlerfrei
- Im Browser (Expo Web, Handygrösse) durchgespielt: Erster Start → Nickname → Home → Setup (Fehlerfall 25 Fragen) → Frage mit echten API-Fragen → Feedback → Abbrechen-Modal → Resultat (Replace) → popToTop → Nickname ändern

## Noch nicht geprüft
- Expo Go auf echten Handys (iOS und Android)

## Nächste Pakete (Mi 11.11.)
T4 Frage-UI fertig, S5 Quiz-Logik (Punkte 10/20/30, Fortschritt), S6 Persistenz (Verlauf, Warteschlange), T5 Resultat + Bestenliste
