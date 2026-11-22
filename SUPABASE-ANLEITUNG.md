# KREISLAUF – Supabase vorbereiten

Diese Anleitung ist für das vorhandene Supabase-Projekt gedacht. Die SQL-Datei legt die Tabellen und Funktionen für KREISLAUF an, **ohne Demo-Mitglieder, Demo-Inserate oder künstliche Karma-Guthaben einzuspielen**.

## 1. Datenbankschema anlegen

1. Öffne dein bestehendes Supabase-Projekt.
2. Öffne links den **SQL Editor**.
3. Öffne im GitHub-Projekt die Datei `SUPABASE-SETUP.sql`.
4. Kopiere den vollständigen Inhalt in eine neue SQL-Abfrage und führe sie einmal aus.
5. Supabase muss die Ausführung erfolgreich bestätigen. Bei einem Fehler nicht mehrfach blind ausführen; zuerst die konkrete Fehlermeldung prüfen.

## 2. Vercel-Datenbankverbindung vorbereiten

1. Öffne im Supabase-Dashboard **Connect** und wähle die PostgreSQL-Verbindungszeichenfolge für den **Session Pooler**.
2. Verwende die URI für Serververbindungen. Achte darauf, dass Sonderzeichen im Datenbankpasswort URL-kodiert sind.
3. Hinterlege die Verbindungszeichenfolge in Vercel als geheime Umgebungsvariable **DATABASE_URL** für Production, Preview und Development.
4. Lege zusätzlich **BETTER_AUTH_URL** auf die dauerhaft verwendete öffentliche KREISLAUF-Domain und **BETTER_AUTH_SECRET** als zufälliges, starkes Geheimnis an.
5. Gib Datenbankpasswort und Geheimnisse niemals im Chat, in GitHub-Dateien oder in einer `VITE_*`-Variable weiter.

## 3. Erst danach persönliche Konten aktivieren

Die derzeitige Vorschau verwendet absichtlich einen gemeinsamen Demo-Zugang. **Die Anmeldung darf erst aktiviert werden, wenn die SQL-Ausführung bestätigt und DATABASE_URL in Vercel korrekt gesetzt ist.** Andernfalls wären Konten und Sitzungen nicht dauerhaft und der Mehrbenutzerbetrieb nicht sicher.

Die SQL-Datei markiert die Migrationen `0001_auth.sql` bis `0005_escrow_atomicity.sql` als angewendet. Dadurch werden sie beim ersten Build mit DATABASE_URL nicht nochmals ausgeführt.

## Noch nicht enthalten

- Die echte ID-Austria-Anbindung braucht die offizielle Freigabe und Zugangsdaten.
- Der Video-Upload braucht noch einen authentifizierten Upload-Endpunkt.
- Vor dem öffentlichen Start sind Mehrbenutzer-, Rollen-, Treuhand- und Datenschutztests erforderlich.
