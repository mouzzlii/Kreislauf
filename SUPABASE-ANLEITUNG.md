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
6. Noch **keinen neuen Deploy starten**, bevor auch der Auth-Schalter aus Abschnitt 3 gesetzt ist. Die App verweigert absichtlich den Zugriff, wenn eine echte Datenbank aktiv ist, aber die Anmeldung ausgeschaltet bleibt.

## 3. Persönliche Konten sicher aktivieren

Die derzeitige Vorschau verwendet absichtlich einen gemeinsamen Demo-Zugang. **Erst wenn SQL erfolgreich ausgeführt wurde, DATABASE_URL erreichbar ist und BETTER_AUTH_URL sowie BETTER_AUTH_SECRET gesetzt sind, darf die Anmeldung aktiviert werden.**

1. In Vercel **zusammen mit den Datenbank- und Better-Auth-Werten** `VITE_AUTH_ENABLED=true` für Production, Preview und Development setzen.
2. Erst wenn alle Variablen gespeichert sind, einen neuen Build/Deploy starten. Nicht zwischenzeitlich mit `DATABASE_URL` und ausgeschalteter Anmeldung deployen.
3. Danach zuerst Konto anlegen, abmelden und wieder anmelden testen. E-Mail/Passwort ist in der Anmeldemaske vorgesehen.
4. Google/X-Anmeldung benötigt zusätzlich eine eigene, für die KREISLAUF-Domain freigeschaltete Broker-Anwendung. Dafür sind `GROK_AUTH_ISSUER`, `GROK_AUTH_CLIENT_ID` und `GROK_AUTH_CLIENT_SECRET` erforderlich. Diese Werte müssen vom Betreiber des Auth-Brokers bereitgestellt werden; die Vorschau-Zugangsdaten sind keine Produktions-Zugangsdaten.

Die SQL-Datei markiert die Migrationen `0001_auth.sql` bis `0008_harden_legacy_function_search_path.sql` als angewendet und setzt für Datenbankfunktionen einen festen `search_path`. Dadurch werden sie beim ersten Build mit DATABASE_URL nicht nochmals ausgeführt.


## 4. Sicherheitsprüfung vor dem öffentlichen Start

- Die App greift serverseitig mit einer privaten PostgreSQL-Verbindung auf die Datenbank zu. Diese Verbindung darf niemals im Browser landen.
- Supabase meldet bei älteren, nicht mehr verwendeten Tabellen `legacy_bookings` und `rentals` deaktivierte RLS. Vorhandene Daten und Abhängigkeiten müssen vor einer Änderung geprüft werden; diese Tabellen nicht öffentlich freigeben.
- Die neuen KREISLAUF-Tabellen haben RLS aktiviert. Die App nutzt für den Datenzugriff serverseitige, sitzungsgeprüfte Funktionen; direkte Browserzugriffe über die Supabase-API sind nicht als App-Zugriffsweg vorgesehen.
- Vor Freigabe müssen Registrierung, Anmeldung, Abmeldung, Mehrbenutzer-Isolation, Nachrichten, Tausch, Punktebuchungen und Treuhand mit getrennten Testkonten erfolgreich getestet werden.

## Noch nicht enthalten

- Die echte ID-Austria-Anbindung braucht die offizielle Freigabe und Zugangsdaten.
- Der Video-Upload braucht noch einen authentifizierten Upload-Endpunkt.
- Vor dem öffentlichen Start sind Mehrbenutzer-, Rollen-, Treuhand- und Datenschutztests erforderlich.


### Zusätzliche Datenbank-Härtung

Die Migrationen 0009 und 0010 sperren alte Prototyp-Tabellen und entfernen automatische Standardrechte für neue Tabellen, Sequenzen und Funktionen. Die App greift ausschließlich über serverseitige PostgreSQL-Verbindungen zu. Browser-Rollen erhalten keine direkten Tabellenrechte.


### Schutz vor Nachrichten-Spam

Migration 0011 begrenzt normale Inserat-Nachrichten pro Benutzer auf 12 innerhalb einer Minute und 80 innerhalb einer Stunde. Die Datenbank prüft das vor dem Speichern und serialisiert parallele Sendeversuche desselben Kontos, damit gleichzeitige Anfragen das Limit nicht einfach umgehen. Automatische Systemmeldungen bleiben davon ausgenommen.


Die Limits werden durch atomare Datenbankzähler pro Konto durchgesetzt: maximal 12 Nachrichten pro Minute und 80 pro Stunde. Die Zählertabelle ist ebenfalls mit RLS gesperrt und für Browserrollen nicht zugänglich.
