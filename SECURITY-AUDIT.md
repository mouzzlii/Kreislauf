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

- Vercel fehlen weiterhin `DATABASE_URL` und `BETTER_AUTH_SECRET`; echte Authentifizierung bleibt deaktiviert. Diese Werte müssen vom Projektinhaber direkt in Vercel hinterlegt werden und dürfen nicht im Chat geteilt werden.
- ID Austria ist weiterhin nur ein gekennzeichneter Mock, keine echte Behördenanbindung.
- Der Video-Upload-Code ist vorhanden, bleibt in der gemeinsamen Demo aber absichtlich gesperrt. Die Videodauer wird derzeit im Browser ausgelesen und als Metadatum mitgesendet; eine unabhängige Prüfung der tatsächlichen Laufzeit aus der Videodatei selbst ist noch nicht implementiert. Vor Echtbetrieb sind diese Prüfung sowie Upload-/Lösch- und Quoten-Tests erforderlich.
- Es fehlt ein vollständiger End-to-End-Test mit mehreren echten Benutzerkonten.
- Datenschutz, Nutzungsbedingungen und Impressum müssen rechtlich geprüft und ergänzt werden.

**Freigabestatus: Nicht produktionsfreigegeben.** Erst nach Konfiguration der Authentifizierung, erfolgreichen CI- und Funktionstests sowie einem unabhängigen Penetrationstest sollte die Plattform für echte Nutzer geöffnet werden.


## Aktuelle zusätzliche Datenbankmigrationen

- `0011_limit_listing_message_rate.sql`: erster Nachrichtenlimit-Schutz.
- `0012_atomic_listing_message_rate_limits.sql`: atomare, gegen parallele Anfragen gehärtete Zähler; auf dem verbundenen Supabase-Projekt eingespielt.
- `0013_listing_video_urls.sql`: persistente Video-URLs pro Inserat; auf dem verbundenen Supabase-Projekt eingespielt.


## Medien-Uploads (neuer Stand)

- Inseratvideos werden über einen authentifizierten Vercel-Blob-Client-Upload direkt vom Browser übertragen; der App-Server nimmt keine großen Videodateien entgegen.
- Der Upload-Endpunkt lehnt Uploads ohne aktivierte echte Anmeldung, Datenbankverbindung, Blob-Token und verifiziertes Mitgliedsprofil ab, prüft Same-Site-Anfragen, bindet den Pfad an die verifizierte Benutzer-ID und erlaubt nur MP4, WebM und QuickTime bis 50 MB pro Datei.
- Inserate speichern höchstens vier Video-URLs; die URLs werden serverseitig auf den eigenen Benutzerpfad und den Vercel-Blob-Host geprüft.
- Die gemeinsame Demo bleibt absichtlich ohne Video-Upload, solange persönliche Anmeldung deaktiviert ist.
- Die Dauerprüfung erfolgt in der Browseroberfläche und wird vom Upload-Endpunkt zusätzlich auf höchstens 60 Sekunden je Clip begrenzt. Eine serverseitige Transkodierung/forensische Medienprüfung ist nicht implementiert.


## Aktueller Entwicklungsstand Video

- Migration `0013_listing_video_urls.sql` wurde auf dem verbundenen Supabase-Projekt eingespielt.
- Der Upload-Endpunkt `/api/upload` wurde ergänzt und ist bis zur Konfiguration von `DATABASE_URL`, echter Authentifizierung und `BLOB_READ_WRITE_TOKEN` fail-closed.
- Der neue Router-Endpunkt und die Upload-Validierung wurden erfolgreich durch CI geprüft. Der Vercel-Preview-Build auf Commit `a7502d9` wurde zwar als READY markiert, der erste echte Seitenaufruf schlug jedoch beim PGLite-Start fehl (`role "anon" does not exist`). Dieser Preview-Link ist deshalb nicht als funktionierende Demo freizugeben. Der Fehler wurde im Branch mit Commit `d91b83b` durch eine PGlite-Rolleninitialisierung behoben und die CI ist erneut grün. Ein korrigierter Vercel-Preview-Build konnte wegen des Vercel-Limits von mehr als 100 Deployments pro Tag (Sperre für 24 Stunden) noch nicht erstellt werden.


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
- Der korrigierte Code ist noch nicht auf Vercel bereitgestellt. Vercel meldet `api-deployments-free-per-day` und `retryAfter: 86400`; ein CLI-Fallback ist in der verfügbaren Umgebung nicht eingerichtet.
