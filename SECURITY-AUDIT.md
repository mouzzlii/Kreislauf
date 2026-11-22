# KREISLAUF – Sicherheitsprüfung

Stand: 22. November 2026  
Prüfumfang: Repository-Zweig `demo/local-auth-off`, verbundene Supabase-Datenbank und Vercel-Projekt.

## Was tatsächlich geprüft wurde

- Statische Prüfung der serverseitigen Aktionen und ihrer Authentifizierungs-Middleware.
- Prüfung der Datenbankrechte für die Rollen `anon` und `authenticated`.
- Prüfung, ob öffentliche Datenbanktabellen Row-Level-Security verwenden.
- Prüfung der Ausführungsrechte für Datenbankfunktionen und der Function-`search_path`-Einstellungen.
- Supabase Security Advisor.
- Automatisierte Projekt-, SQL-Migrations-, Typ-, Build- und Abhängigkeitstests über GitHub Actions; Ergebnisse gelten jeweils nur für den konkret geprüften Commit.
- Quellcodeprüfung der Tausch-, Buchungs-, Nachrichten- und Treuhandabläufe.

## Behobene bzw. gehärtete Punkte

1. Alte Prototyp-Tabellen werden durch Migration 0009 gesperrt: RLS aktiv, alte Policies entfernt und Browser-Rechte widerrufen.
2. Migration 0010 entzieht Standardrechte für künftig durch die App-Rolle `postgres` angelegte Tabellen, Sequenzen und Funktionen.
3. Datenbankfunktionen erhielten feste `search_path`-Einstellungen.
4. Direkte Tauschvorgänge sperren Inserat und beteiligte Konten vor der Buchung, um parallele Doppelabschlüsse zu verhindern.
5. Vercel-Antworten erhalten HSTS, `X-Content-Type-Options: nosniff` und eine restriktive Referrer-Policy.
6. Der Blob-Schlüssel ist in Vercel als Secret markiert.
7. Better Auth wurde auf 1.7.27 aktualisiert; die generische OAuth-Anmeldung nutzt die neue Social-API. Der Popup-Endpunkt akzeptiert nur die zwei explizit konfigurierten Provider.
8. CI prüfte den aktualisierten Abhängigkeitsbaum mit `npm audit`: **0 bekannte Schwachstellen**. Dependabot ist für wöchentliche Updates eingerichtet.

## Verifizierte Datenbankbefunde

- 0 öffentliche Tabellen ohne RLS.
- 0 öffentliche Tabellen mit direkten Tabellen-Lese-/Schreibrechten für `anon` oder `authenticated`.
- Der Chat-Rate-Limit-Trigger ist aktiv; seine Zählertabelle hat RLS und keine Lese-/Schreibrechte für Browserrollen.
- Keine direkten Ausführungsrechte für öffentliche Datenbankfunktionen durch diese Browser-Rollen.
- Supabase meldet noch INFO-Hinweise zu RLS-Tabellen ohne Policies. Das ist hier beabsichtigt, weil die App ausschließlich über serverseitige Datenbankverbindungen zugreift und Browser-Rollen keine Tabellenrechte erhalten.

## Grenzen – kein bestandener externer Penetrationstest

Es wurde kein Team aus 50–100 menschlichen Sicherheitsexperten beauftragt. Es fand auch kein unabhängiger externer Penetrationstest, kein Last-/DDoS-Test und kein umfassender Angriffstest gegen produktive Nutzerkonten statt. Die hier dokumentierten Ergebnisse sind automatisierte und statische Prüfungen innerhalb des verbundenen Projekts; sie sind keine Garantie, dass keine unbekannte Schwachstelle existiert.

## Noch nicht für den Produktivbetrieb freigegeben

- Vercel fehlt weiterhin `DATABASE_URL`. `BETTER_AUTH_URL` und ein zufällig erzeugtes `BETTER_AUTH_SECRET` sind bereits verschlüsselt in Vercel hinterlegt. Echte Authentifizierung bleibt deaktiviert, bis die Datenbankverbindung eingerichtet und mit getrennten Konten getestet ist.
- ID Austria ist weiterhin nur ein gekennzeichneter Mock, keine echte Behördenanbindung.
- Videoauswahl und Video-Upload sind derzeit in allen Umgebungen gesperrt. `/api/upload` antwortet absichtlich mit HTTP 503. Eine unabhängige serverseitige Prüfung der tatsächlichen Laufzeit aus der Videodatei selbst ist noch nicht implementiert. Vor Freigabe sind diese Prüfung sowie Upload-/Lösch- und Quoten-Tests erforderlich.
- Es fehlt ein vollständiger End-to-End-Test mit mehreren echten Benutzerkonten.
- Datenschutz, Nutzungsbedingungen und Impressum müssen rechtlich geprüft und ergänzt werden.

**Freigabestatus: Nicht produktionsfreigegeben.** Erst nach Konfiguration der Authentifizierung, erfolgreichen CI- und Funktionstests sowie einem unabhängigen Penetrationstest sollte die Plattform für echte Nutzer geöffnet werden.


## Aktuelle zusätzliche Datenbankmigrationen

- `0011_limit_listing_message_rate.sql`: erster Nachrichtenlimit-Schutz.
- `0012_atomic_listing_message_rate_limits.sql`: atomare, gegen parallele Anfragen gehärtete Zähler; auf dem verbundenen Supabase-Projekt eingespielt.
- `0013_listing_video_urls.sql`: persistente Video-URLs pro Inserat; auf dem verbundenen Supabase-Projekt eingespielt.


## Medien-Uploads (neuer Stand)

- Das Datenmodell kann bis zu vier Video-URLs pro Inserat speichern.
- Der Upload-Endpunkt nimmt derzeit in keiner Umgebung Dateien an. Er antwortet absichtlich mit HTTP 503, bis die tatsächliche Videodauer serverseitig aus der Datei selbst geprüft wird.
- Die geplanten Limits bleiben 1 × 60 Sekunden, 2 × 30 Sekunden oder 4 × 20 Sekunden bei maximal 60 Sekunden Gesamtzeit.
- Die Browser-Dauerprüfung ist nicht vertrauenswürdig und wird nicht als Sicherheitskontrolle verwendet. Eine unabhängige serverseitige Medienprüfung ist noch nicht implementiert.


## Aktueller Entwicklungsstand Video

- Migration `0013_listing_video_urls.sql` wurde auf dem verbundenen Supabase-Projekt eingespielt.
- Der Upload-Endpunkt `/api/upload` antwortet aktuell fail-closed mit HTTP 503 in allen Umgebungen. Das verhindert, dass manipulierte Client-Metadaten für einen Upload ausreichen.
- Der gesperrte Router-Endpunkt und die dazugehörigen Sicherheitstests wurden erfolgreich durch CI geprüft. Der Vercel-Preview-Build auf Commit `a7502d9` wurde zwar als READY markiert, der erste echte Seitenaufruf schlug jedoch beim PGLite-Start fehl (`role "anon" does not exist`). Dieser Preview-Link ist deshalb nicht als funktionierende Demo freizugeben. Der Fehler wurde im Branch mit Commit `d91b83b` durch eine PGlite-Rolleninitialisierung behoben und die CI ist erneut grün. Ein korrigierter Vercel-Preview-Build konnte wegen des Vercel-Limits von mehr als 100 Deployments pro Tag (Sperre für 24 Stunden) noch nicht erstellt werden.


## Verifikation am 22.11.2026

- GitHub Actions für Commit `a7502d931b3a0eaf288017c6be8eec353ad2c2ae`: Abhängigkeitsprüfung, Router-/Build-Prüfung, TypeScript, Tests und Lint erfolgreich.
- `npm audit --audit-level=high` erfolgreich nach Aktualisierung der betroffenen transitiven Abhängigkeiten.
- Vercel Preview-Deployment `dpl_FezUFzj6SXvaEmjWzn9UKR1Pedok`: Status `READY`, Branch `demo/local-auth-off`.
- Supabase: 0 öffentliche Tabellen ohne RLS und 0 Tabellen mit direkten Browser-Lese-/Schreibrechten für `anon` oder `authenticated`.
- Supabase Security Advisor: 23 INFO-Hinweise zu absichtlich server-only Tabellen mit RLS ohne Browser-Policies; keine neuen Browser-Tabellenrechte wurden dafür vergeben.


## Nachträglicher Laufzeitfund und Korrektur

- Der erste öffentliche Aufruf des Vercel-Preview-Builds offenbarte einen Fehler, den die vorherigen CI-Tests nicht abdeckten: PGlite hatte die Supabase-Rollen `anon`, `authenticated` und `service_role` nicht angelegt.
- `src/lib/db-roles.ts` provisioniert diese Rollen nun idempotent vor dem Einspielen der Migrationen.
- `src/lib/db-roles.test.ts` testet die Rolleninitialisierung einschließlich der realen Migration `0010_lock_down_default_privileges.sql`.
- Commit `d91b83bcba144e14eb03dbdad71aadcd6e429e26`: Sicherheitsprüfung, Build, TypeScript, Tests und Lint erfolgreich.
- Ein korrigierter Preview-Build ist inzwischen READY: Deployment `dpl_ECvvj9W7JKBFGWHu9H11vnoP4BZX`, Commit `cb117e7`, Alias `grok-workspace-git-demo-local-auth-off-kreislauf.vercel.app`. Er enthält den aktuellen Anwendungscode mit gesperrtem Video-Endpunkt und Produktionssperre für die ID-Austria-Demo. Die späteren Dokumentations- und Datenbankindexänderungen sind nicht Bestandteil dieses Builds. Ein erfolgreicher manueller Laufzeittest der Seite wurde in dieser Umgebung nicht nachgewiesen.


## Datenbankleistung – Migration 0014

- Die Migration `foreign_key_indexes` wurde am 22.11.2026 auf dem verbundenen Supabase-Projekt eingespielt.
- Auf dem verbundenen Projekt sind 19 zusätzliche Fremdschlüssel-Indizes vorhanden; die Performance-Prüfung meldet keine unindizierten Fremdschlüssel mehr.
- Die Migration im Repository erstellt bei einer Neuinstallation 14 Indizes für die tatsächlich verwendeten Schema-Tabellen. Veraltete Prototyp-Tabellen wie `marketplace_items`, `rentals`, `legacy_bookings` und `transactions` sind nicht Bestandteil des sauberen Neuaufbaus.
- Die 19 Indizes werden vom Advisor derzeit teilweise als unbenutzt gemeldet, weil noch kein echter Nutzerbetrieb mit realer Datenlast stattfindet. Sie werden deshalb nicht vorschnell entfernt.
- Nach der Migration erneut geprüft: 0 öffentliche Tabellen ohne RLS, 0 direkte Tabellenrechte für `anon` oder `authenticated`, 19 Fremdschlüssel-Indizes.
