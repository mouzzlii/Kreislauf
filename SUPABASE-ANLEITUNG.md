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

## 3. Persönliche Konten sicher aktivieren

Die derzeitige Vorschau verwendet absichtlich einen gemeinsamen Demo-Zugang. **Erst wenn SQL erfolgreich ausgeführt wurde, DATABASE_URL erreichbar ist und BETTER_AUTH_URL sowie BETTER_AUTH_SECRET gesetzt sind, darf die Anmeldung aktiviert werden.**

1. In Vercel `VITE_AUTH_ENABLED=true` für Production, Preview und Development setzen.
2. Danach einen neuen Build/Deploy abwarten und zuerst Konto anlegen, abmelden und wieder anmelden testen.
3. Die Anmeldemaske enthält E-Mail/Passwort. Google/X-Anmeldung benötigt zusätzlich eine eigene, für die KREISLAUF-Domain freigeschaltete Broker-Anwendung. Dafür sind `GROK_AUTH_ISSUER`, `GROK_AUTH_CLIENT_ID` und `GROK_AUTH_CLIENT_SECRET` erforderlich. Diese Werte müssen vom Betreiber des Auth-Brokers bereitgestellt werden; die Vorschau-Zugangsdaten sind keine Produktions-Zugangsdaten.

Die SQL-Datei markiert die Migrationen `0001_auth.sql` bis `0005_escrow_atomicity.sql` als angewendet. Dadurch werden sie beim ersten Build mit DATABASE_URL nicht nochmals ausgeführt.

## Noch nicht enthalten

- Die echte ID-Austria-Anbindung braucht die offizielle Freigabe und Zugangsdaten.
- Der Video-Upload braucht noch einen authentifizierten Upload-Endpunkt.
- Vor dem öffentlichen Start sind Mehrbenutzer-, Rollen-, Treuhand- und Datenschutztests erforderlich.
