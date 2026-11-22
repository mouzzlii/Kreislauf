# KREISLAUF – Sicherheitsprüfung

Stand: 22. November 2026  
Prüfumfang: Repository-Zweig `demo/local-auth-off`, verbundene Supabase-Datenbank und Vercel-Projekt.

## Was tatsächlich geprüft wurde

- Statische Prüfung der serverseitigen Aktionen und ihrer Authentifizierungs-Middleware.
- Prüfung der Datenbankrechte für die Rollen `anon` und `authenticated`.
- Prüfung, ob öffentliche Datenbanktabellen Row-Level-Security verwenden.
- Prüfung der Ausführungsrechte für Datenbankfunktionen und der Function-`search_path`-Einstellungen.
- Supabase Security Advisor.
- Automatisierte Projekt-, SQL-Migrations-, Typ-, Build- und Abhängigkeitstests über GitHub Actions (laufend/je nach Commit).
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
- Keine direkten Ausführungsrechte für öffentliche Datenbankfunktionen durch diese Browser-Rollen.
- Supabase meldet noch INFO-Hinweise zu RLS-Tabellen ohne Policies. Das ist hier beabsichtigt, weil die App ausschließlich über serverseitige Datenbankverbindungen zugreift und Browser-Rollen keine Tabellenrechte erhalten.

## Grenzen – kein bestandener externer Penetrationstest

Es wurde kein Team aus 50–100 menschlichen Sicherheitsexperten beauftragt. Es fand auch kein unabhängiger externer Penetrationstest, kein Last-/DDoS-Test und kein umfassender Angriffstest gegen produktive Nutzerkonten statt. Die hier dokumentierten Ergebnisse sind automatisierte und statische Prüfungen innerhalb des verbundenen Projekts; sie sind keine Garantie, dass keine unbekannte Schwachstelle existiert.

## Noch nicht für den Produktivbetrieb freigegeben

- Vercel fehlen weiterhin `DATABASE_URL` und `BETTER_AUTH_SECRET`; echte Authentifizierung bleibt deaktiviert. Diese Werte müssen vom Projektinhaber direkt in Vercel hinterlegt werden und dürfen nicht im Chat geteilt werden.
- ID Austria ist weiterhin nur ein gekennzeichneter Mock, keine echte Behördenanbindung.
- Video-Upload bis 60 Sekunden ist noch nicht vollständig implementiert.
- Es fehlt ein vollständiger End-to-End-Test mit mehreren echten Benutzerkonten.
- Datenschutz, Nutzungsbedingungen und Impressum müssen rechtlich geprüft und ergänzt werden.

**Freigabestatus: Nicht produktionsfreigegeben.** Erst nach Konfiguration der Authentifizierung, erfolgreichen CI- und Funktionstests sowie einem unabhängigen Penetrationstest sollte die Plattform für echte Nutzer geöffnet werden.
