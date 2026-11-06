# S2 · Machbarkeitstest Online-Bestenliste

## Entscheid: Supabase

| Kriterium | Supabase | Firebase Firestore |
|-----------|----------|--------------------|
| Läuft in Expo Go | Ja, nur `fetch` (REST), kein SDK nötig | JS-SDK läuft, ist aber gross und braucht mehr Konfiguration |
| Aufwand für 2 Aktionen (`saveScore`, `getTopScores`) | 2 HTTP-Anfragen | SDK, Collection, Query, Index |
| Sortieren + Top 20 | `order=points.desc&limit=20` in der URL | braucht ggf. zusammengesetzten Index |
| Zugriffsregeln ohne Login | Row Level Security (SQL) | Security Rules |

**Entscheid:** Supabase über die REST-Schnittstelle. Der Code liegt in `src/services/onlineScores.js`.
Plan B bleibt gültig: Klappt es bis Do 12.11., 12:00 nicht, bleibt die Bestenliste lokal (AsyncStorage).

## Einrichten (einmalig, ca. 10 Min.)

1. Auf supabase.com ein kostenloses Projekt «triviatime» anlegen (eigenes Konto).
2. Im SQL-Editor ausführen:

```sql
create table public.scores (
  id         bigint generated always as identity primary key,
  nickname   text not null check (char_length(nickname) between 3 and 15),
  points     integer not null check (points between 0 and 600),
  category   text,
  created_at timestamptz not null default now()
);

alter table public.scores enable row level security;

-- ohne Login: alle dürfen lesen und neue Einträge anlegen, aber nichts ändern oder löschen
create policy "scores lesen"    on public.scores for select to anon using (true);
create policy "scores eintragen" on public.scores for insert to anon with check (true);
```

3. Unter *Project Settings → API* die Projekt-URL und den Publishable Key (bzw. «anon public» Key) kopieren.
4. Im Projektordner die Datei `.env.local` anlegen (wird nicht committet):

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=dein-publishable-key
```

5. Test ausführen:

```
npm run test:online
```

Erwartet: «ERGEBNIS: Machbarkeitstest bestanden ✓». Danach den Test-Eintrag «TestS2» im Table Editor löschen.

## Datenschutz
Online gespeichert werden nur Nickname, Punkte, Kategorie und Datum (Konzept Kapitel 10). Kein Login, keine E-Mail.
