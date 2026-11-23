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
3. Hinterlege die Verbindungszeichenfolge in Vercel zunächst ausschließlich als geheime Umgebungsvariable **DATABASE_URL** für **Production**. Für Preview und Development darf dieselbe Produktionsdatenbank nicht verwendet werden. Wenn du dort eine echte Datenbank benötigst, muss dafür eine getrennte Supabase-Datenbank mit eigenem Schema und eigenen Zugangsdaten eingerichtet werden.
4. **BETTER_AUTH_URL** und **BETTER_AUTH_SECRET** sind bereits in Vercel hinterlegt. Das Secret wurde zufällig erzeugt und verschlüsselt gespeichert; du musst es weder sehen noch weitergeben.
5. Gib Datenbankpasswort und Geheimnisse niemals im Chat, in GitHub-Dateien oder in einer `VITE_*`-Variable weiter.
6. Noch **keinen neuen Deploy starten**, bevor auch der Auth-Schalter aus Abschnitt 3 gesetzt ist. Die App verweigert absichtlich den Zugriff, wenn eine echte Datenbank aktiv ist, aber die Anmeldung ausgeschaltet bleibt.


### Aktueller Vercel-Status (zuletzt geprüft: 22.11.2026)

- `DATABASE_URL`: noch nicht vorhanden.
- `VITE_AUTH_ENABLED`: steht absichtlich auf `false`.
- `BLOB_READ_WRITE_TOKEN`: Variable ist angelegt, enthält aber derzeit keinen verwendbaren Token.
- `BETTER_AUTH_URL` und `BETTER_AUTH_SECRET`: vorhanden; geheime Werte bleiben in Vercel und werden nicht ausgelesen oder im Chat angezeigt.
- `ID_AUSTRIA_MOCK_MODE=true`: nur für den Demo-Preview-Zweig vorgesehen.

Der Produktions-Build prüft zusätzlich, ob `DATABASE_URL` eine gültige PostgreSQL-URL ist, echte Anmeldung aktiv ist, ein mindestens 32 Zeichen langes `BETTER_AUTH_SECRET`, eine HTTPS-Adresse für `BETTER_AUTH_URL`, ein eigener HTTPS-Auth-Broker samt `GROK_AUTH_CLIENT_ID` und `GROK_AUTH_CLIENT_SECRET` sowie ein Medien-Storage-Token vorhanden sind. Die fest im Quellcode enthaltenen OAuth-Vorschau-Zugangsdaten sind ausschließlich für Sandbox-Hosts bestimmt und werden nicht als Produktionszugang akzeptiert. Damit wird ein versehentlicher Start mit Vorschau-Identität oder ohne dauerhafte Datenbank/Medienablage blockiert. Die Demo-Preview bleibt davon unberührt.

## 3. Persönliche Konten sicher aktivieren

Die derzeitige Vorschau verwendet absichtlich einen gemeinsamen Demo-Zugang. **BETTER_AUTH_URL und BETTER_AUTH_SECRET sind bereits gesetzt. Es fehlt noch DATABASE_URL.** Erst wenn die Datenbankverbindung gespeichert und erreichbar ist, darf die Anmeldung aktiviert werden.

1. In Vercel `VITE_AUTH_ENABLED=true` zunächst ausschließlich für **Production** setzen, sobald die Produktionsdatenbank, die Auth-Broker-Anwendung und alle unten genannten Voraussetzungen bereitstehen. Preview bleibt bis zu einer getrennten Testdatenbank im Demo-Modus.
2. Erst wenn alle Variablen für Production gespeichert sind, einen neuen Produktions-Build/Deploy starten. Nicht zwischenzeitlich mit `DATABASE_URL` und ausgeschalteter Anmeldung deployen. Preview-Deployments dürfen keine Produktionsdatenbank verwenden.
3. Danach zuerst Konto anlegen, abmelden und wieder anmelden testen. E-Mail/Passwort ist in der Anmeldemaske vorgesehen.
4. Google/X-Anmeldung benötigt zusätzlich eine eigene, für die KREISLAUF-Domain freigeschaltete Broker-Anwendung. Dafür sind `GROK_AUTH_ISSUER`, `GROK_AUTH_CLIENT_ID` und `GROK_AUTH_CLIENT_SECRET` erforderlich. Diese Werte müssen vom Betreiber des Auth-Brokers bereitgestellt werden; die Vorschau-Zugangsdaten sind keine Produktions-Zugangsdaten.

Die SQL-Datei markiert die enthaltenen Migrationen `0001_auth.sql` bis `0007_harden_function_search_path.sql` sowie `0009` bis `0025` als angewendet. Die optionale Migration `0008_harden_legacy_function_search_path.sql` bleibt bei einer Neuinstallation absichtlich außen vor, weil sie nur eine Altbestandsfunktion absichert. Die Datenbankfunktionen erhalten einen festen `search_path`, damit sie keine fremden Objekte über eine manipulierte Namensauflösung verwenden. Die optionale Migration `0008_harden_legacy_function_search_path.sql` bleibt bei einer Neuinstallation absichtlich außen vor, weil sie nur eine Altbestandsfunktion absichert. Die Datenbankfunktionen erhalten einen festen `search_path`, damit sie keine fremden Objekte über eine manipulierte Namensauflösung verwenden.


## 4. Sicherheitsprüfung vor dem öffentlichen Start

- Die App greift serverseitig mit einer privaten PostgreSQL-Verbindung auf die Datenbank zu. Diese Verbindung darf niemals im Browser landen.
- Auch die älteren Tabellen `legacy_bookings`, `rentals` und `marketplace_items` haben RLS aktiviert. Die Browserrollen besitzen keine direkten Tabellenrechte; diese Alt-Tabellen werden nicht als öffentlicher App-Zugriffsweg verwendet.
- Die neuen KREISLAUF-Tabellen haben RLS aktiviert. Die App nutzt für den Datenzugriff serverseitige, sitzungsgeprüfte Funktionen; direkte Browserzugriffe über die Supabase-API sind nicht als App-Zugriffsweg vorgesehen.
- Vor Freigabe müssen Registrierung, Anmeldung, Abmeldung, Mehrbenutzer-Isolation, Nachrichten, Tausch, Punktebuchungen und Treuhand mit getrennten Testkonten erfolgreich getestet werden.

## Noch nicht enthalten

- Die echte ID-Austria-Anbindung braucht die offizielle Freigabe und Zugangsdaten.
- Video-Uploads sind aktuell absichtlich vollständig gesperrt. Vor der Freigabe muss die tatsächliche Laufzeit serverseitig aus der Videodatei geprüft werden.
- Vor dem öffentlichen Start sind Mehrbenutzer-, Rollen-, Treuhand- und Datenschutztests erforderlich.


### Zusätzliche Datenbank-Härtung

Die Migrationen 0009 und 0010 sperren alte Prototyp-Tabellen und entfernen automatische Standardrechte für neue Tabellen, Sequenzen und Funktionen. Die App greift ausschließlich über serverseitige PostgreSQL-Verbindungen zu. Browser-Rollen erhalten keine direkten Tabellenrechte.


### Schutz vor Nachrichten-Spam

Migration 0011 begrenzt normale Inserat-Nachrichten pro Benutzer auf 12 innerhalb einer Minute und 80 innerhalb einer Stunde. Die Datenbank prüft das vor dem Speichern und serialisiert parallele Sendeversuche desselben Kontos, damit gleichzeitige Anfragen das Limit nicht einfach umgehen. Automatische Systemmeldungen bleiben davon ausgenommen.


Die Limits werden durch atomare Datenbankzähler pro Konto durchgesetzt: maximal 12 Nachrichten pro Minute und 80 pro Stunde. Die Zählertabelle ist ebenfalls mit RLS gesperrt und für Browserrollen nicht zugänglich.

### Inseratvideos

Die geplanten Varianten bleiben: 1 Video bis 60 Sekunden, 2 Videos bis je 30 Sekunden oder 4 Videos bis je 20 Sekunden; insgesamt höchstens 60 Sekunden. Pro Datei ist eine Größenbegrenzung von 50 MB vorgesehen.

**Derzeit sind Videoauswahl und Upload in allen Umgebungen deaktiviert.** Der Endpunkt antwortet absichtlich mit HTTP 503, bis eine unabhängige serverseitige Prüfung der tatsächlichen Videodauer und des Dateiformats implementiert und getestet ist. Die Prüfung im Browser allein ist manipulierbar und reicht nicht aus. Die Datenbankspalte für Video-URLs ist bereits vorhanden.

Für die spätere Freigabe müssen persönliche Anmeldung, `DATABASE_URL`, ein gültiges `BLOB_READ_WRITE_TOKEN` und die serverseitige Medienprüfung vollständig eingerichtet und geprüft sein. Das vorhandene `BETTER_AUTH_SECRET` ist bereits verschlüsselt in Vercel gespeichert; den Wert niemals im Chat teilen.


### Datenbankleistung

Migration 0014 ergänzt Indizes für die Fremdschlüssel der aktuell verwendeten Tabellen. Auf dem verbundenen Supabase-Projekt wurden 19 Fremdschlüssel-Indizes angelegt; die Performance-Prüfung meldet keine unindizierten Fremdschlüssel mehr. Einige Indizes erscheinen derzeit als unbenutzt, weil die Plattform noch keinen echten Nutzerbetrieb mit entsprechender Datenlast hat.


## 5. Supabase-Testlauf – nur mit separatem Testprojekt

Der automatisierte Datenbank-Smoke-Test führt jetzt die Migrationen **0002 bis 0025** (die optionale Altbestandsmigration 0008 ausgenommen) sowie Reservierung, Moderationsquorum, Nachrichtenabläufe und die Bereinigung älterer, unzulässiger Treuhandstimmen aus. Migration 0025 archiviert solche Stimmen von Käufer oder Verkäufer mit Begründung und Zeitstempel und entfernt sie aus den aktiven Abstimmungen, damit sie keine Mehrheiten mehr beeinflussen.

**Wichtig:** Dafür ist ein eigenes, isoliertes Supabase-Testprojekt erforderlich. Niemals die Produktionsdatenbank oder das bestehende Live-Projekt als Testziel verwenden. Der Test verwendet die öffentliche Standardschema-Struktur, weil mehrere Migrationen ausdrücklich `public.*` referenzieren. Er startet eine Transaktion und rollt am Ende alles zurück; trotzdem ist das separate Testprojekt die Sicherheitsgrenze.

Für GitHub Actions muss die Verbindungs-URL des separaten Testprojekts als Secret `SUPABASE_TEST_DATABASE_URL` hinterlegt werden. Das Secret `SUPABASE_DATABASE_URL` wird vom Test nicht mehr verwendet. Die URL bleibt in GitHub Secrets und wird nicht in Chat, Quellcode oder Browser-Variablen kopiert.

Der Test wurde im Quellcode vorbereitet, aber noch nicht gegen ein echtes Supabase-Testprojekt ausgeführt. Ohne dieses separate Projekt bleibt der Live-Datenbanktest offen.

### Treuhand-Abstimmungen und Altstimmen

Die Migrationen 0024 und 0025 schützen beide Treuhand-Abstimmungen: Käufer und Verkäufer dürfen weder über die erste Community-Freigabe noch über die spätere Streitfallentscheidung des eigenen Falls abstimmen. Bereits vor Einführung dieser Sperre abgegebene Stimmen werden in einem privaten Audit-Archiv gesichert und aus den aktiven Abstimmungstabellen entfernt. Dadurch bleiben die Originalangaben nachvollziehbar, ohne dass diese Stimmen weiterhin die Mehrheitsberechnung beeinflussen. Die Bereinigung ist in den automatisierten PostgreSQL-kompatiblen Tests abgedeckt; sie wurde noch nicht auf dem verbundenen Supabase-Projekt ausgeführt.
