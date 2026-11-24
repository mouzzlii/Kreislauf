# Gemeinsame Projektsteuerung

Stand: 2026-11-24

Dieses Dokument koordiniert die vier Entwicklungsprojekte. Es ersetzt keine projektspezifischen Anforderungen, Tests oder Betreiberfreigaben. Statusangaben unterscheiden strikt zwischen vorhandenem Code, automatisierten Prüfungen, externen Tests und Produktionsfreigabe.

## Gemeinsame Regeln

- GitHub ist die verbindliche Quelle für eingecheckten Code und dokumentierte Entscheidungen.
- Änderungen erfolgen grundsätzlich auf Aufgaben-Branches und werden über Pull Requests integriert.
- Keine parallelen Änderungen an denselben Dateien ohne vorherige Abstimmung.
- Vor jeder Änderung: aktuellen Stand, README, Projektanweisungen, offene Issues und CI lesen.
- Nach jeder Änderung: passende Tests ausführen und Ergebnisse samt Commit-SHA dokumentieren.
- Keine Zugangsdaten, Kundendaten, privaten Fotos, Produktionsdatenbanken oder echten `.env`-Dateien committen.
- Externe Dienste gelten erst nach erfolgreicher Integration und echtem Ende-zu-Ende-Test als einsatzbereit.
- Ein grüner CI-Lauf beweist nur die darin ausgeführten automatisierten Prüfungen, nicht die Produktionsreife.
- Keine kostenpflichtigen Provider-Aufrufe, produktiven Buchungen oder externen Freigaben ohne ausdrückliche Autorisierung.

## Projektübersicht

| Projekt | Quellcode / Repository | Verifizierter Stand und offene Grenzen |
|---|---|---|
| **TRAKUNA** | Architektur/Koordination: [mouzzlii/multi-carrier-gateway](https://github.com/mouzzlii/multi-carrier-gateway); Android-App: [mouzzlii/Fuck](https://github.com/mouzzlii/Fuck). | Version 1.53 / versionCode 54. Build-CI 45293451483 war erfolgreich; die Debug-APK wurde unabhängig als ZIP geprüft, ihr SHA-256 stimmt mit der Prüfsummendatei überein. Emulator-Lauf 45292752417 wurde während des Bootens wegen wiederholtem ADB-Status `device offline` abgebrochen; es wurden keine Instrumentierungstests ausgeführt. PR #12 verhindert inzwischen das automatische Abbrechen eines aktiven Emulatorlaufs durch spätere Commits. Der neue Main-Lauf 45302795724 ist noch nicht als erfolgreich bestätigt. Kein echter Shopgerätetest. Hermes bleibt Pflichtintegration, aber ohne Carrier-/Betreiberzugang nicht produktiv integriert; die vorhandenen Shopgeräte/Systeme bleiben unangetastet. |
| **SCAN-PROFIT** | [mouzzlii/SCAN-PROFIT](https://github.com/mouzzlii/SCAN-PROFIT) | Version 2.0.66-Prüfpaket lokal mit 155/155 Tests, statischem Build und Smoke-Test erfolgreich; Static-release-CI 45292138429 grün. Das Live-Produktionsdeployment ist weiterhin READY auf einem älteren Commit (`bf6af8d`), nicht auf dem geprüften neueren Quellpaket. Vercel hat das Free-Tier-Buildlimit erreicht; ein neuer Deployment-Abgleich war daher noch nicht möglich. Der vollständige Next.js-/Test-Quellbaum ist noch nicht in GitHub importiert. `package-lock.json` fehlt; die Offline-Erzeugung scheiterte an nicht gecachten npm-Metadaten. npm audit, reproduzierbarer Clean-Install und Next.js-Build sind damit noch nicht unabhängig belegt. |
| **KREISLAUF** | [mouzzlii/Kreislauf](https://github.com/mouzzlii/Kreislauf) | Sicherheits-PR #22 wurde gemergt (Commit `a92e5ab`); das zuvor eingebettete Preview-OAuth-Secret ist aus Main entfernt, der Broker-Schlüssel muss aber separat durch den Broker-Betreiber widerrufen/rotiert werden. PR #29 wurde als Commit `7ff64cb` gemergt: der KI-Relay lädt nur ausgewählte Quelltextauszüge aus einer festen Allowlist, begrenzt die Größe, redigiert bekannte Secret-Formate einschließlich 64–128-stelliger Hexwerte und erhält den Nutzerauftrag trotz großer Repository-Kontexte. Main-Build/TypeScript/Tests/Lint/Produktions-Build Run 45302778918 erfolgreich; Relay-CI Run 45302233645 erfolgreich vor Merge. Es wurden keine externen KI-Provider aufgerufen. Runtime-DB ist PGlite oder Neon/Postgres über `DATABASE_URL`, nicht automatisch Supabase. Demo-Branch `demo/local-auth-off` enthält Nachrichten, Moderation und Treuhand-Demo, ist aber deutlich divergiert und nicht in Main integriert. Öffentliche Auth-/Moderations-/Mehrbenutzerabnahme offen. |
| **CHRONOS** | [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS) | Main bleibt lokaler Fotoarchiv-Prototyp Milestone 0.5. Python-/Android-CI einschließlich Robolectric-SQLite-Tests ist dokumentiert erfolgreich. Das separate Face-Hardening-Paket 0.2.0 besteht lokal 11/11 Tests (inkl. Multi-Prozess-Lock und lokaler API-Prüfung), ist aber nicht in den Hauptquellbaum integriert und darf wegen abweichendem Datenbankschema, fehlender Benutzer-Authentifizierung und biometrischer Datenschutzanforderungen nicht öffentlich bereitgestellt werden. Echte Android-Geräte-, Backup/Restore-, Verschlüsselungs- und Großbibliothekstests bleiben offen. |

## KI-Team-Zusammenarbeit

- Der GitHub-Relay ist in KREISLAUF `main` integriert. Er reagiert nur auf einen ausdrücklich markierten Kommentar und bleibt vor jedem Provider-Aufruf gesperrt, solange Pflicht-Secrets, Modellkennungen, ein read-only GitHub-Repository-Token oder die manuelle Budgetfreigabe fehlen.
- PR #29 ist gemergt. Der Relay lädt README, höchstens 80 Dateipfade und bis zu vier ausgewählte Quelltextauszüge pro Repository (maximal 1.800 Zeichen je Datei und 6.500 Zeichen pro Repository) aus einer festen Allowlist. Secret-Dateien, Umgebungsdateien, Credential-, Schlüssel-, Lock- und Builddateien sind nicht Teil der Auswahl.
- Die Redaktion deckt bekannte Provider-Token, PEM-Private-Keys, JWTs, benannte Secret-Zuweisungen und 64–128-stellige Hexwerte ab. Das ist eine zusätzliche Schutzschicht, keine Garantie, dass beliebige Geheimnisse niemals erkannt werden. Daher dürfen ausgewählte Dateien weiterhin keine echten Kundendaten, Sendungsdaten oder Geheimnisse enthalten.
- Bei Aktivierung werden ausgewählte Quelltextauszüge zusammen mit der Anfrage an OpenAI, Gemini und xAI übertragen. Es gab in dieser Arbeit keine Provider-Aufrufe; kein Schlüssel und keine Modellvariable wurde eingerichtet oder verändert.
- Der Relay führt keine Codeänderungen, Merges oder Deployments aus. Ein täglicher Deckel von zwei Debatten reserviert vor jedem Provider-Aufruf ein Kontingent im zentralen Issue #11.
- Live-Freigabe bleibt ausstehend: Provider-Secrets, tatsächlich unterstützte Modellkennungen, read-only GitHub-Token, echte Anbieter-Ausgabenlimits und `AI_TEAM_BUDGET_CONFIRMED=true` müssen durch den Kontoinhaber eingerichtet und geprüft werden. Die Variable ist eine manuelle Bestätigung und prüft Anbieterbudgets nicht automatisch.

## Abnahme-Gates je Projekt

1. Anforderungen und Nicht-Ziele dokumentiert.
2. Vollständiger, reproduzierbarer Quellcode und Abhängigkeiten versioniert.
3. Automatisierte Tests und Produktionsbuild erfolgreich.
4. Sicherheits- und Datenschutzprüfung abgeschlossen.
5. Ende-zu-Ende-Prüfung auf realistischen Geräten/Umgebungen abgeschlossen.
6. Externe Anbieter-/API-Freigaben und produktive Zugangsdaten rechtmäßig eingerichtet.
7. Wiederherstellung, Backup, Fehlerbehandlung und Monitoring dokumentiert.
8. Release-Artefakt, Installationsanleitung und Rollback-Verfahren erstellt.
9. Offene Einschränkungen transparent dokumentiert; keine kritischen Blocker.

## Statussprache

- **Implementiert:** Code ist vorhanden.
- **Automatisiert geprüft:** konkrete CI-/Testläufe sind erfolgreich.
- **Extern geprüft:** realer Anbieter-/Geräte-/Produktionsablauf wurde tatsächlich getestet.
- **Produktionsbereit:** alle Abnahme-Gates sind erfüllt und nötige Betreiberfreigaben liegen vor.

Nie einen dieser Status aus einem anderen ableiten.
