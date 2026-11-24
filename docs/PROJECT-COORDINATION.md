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
| **TRAKUNA** | Architektur/Koordination: [mouzzlii/multi-carrier-gateway](https://github.com/mouzzlii/multi-carrier-gateway); Android-App: [mouzzlii/Fuck](https://github.com/mouzzlii/Fuck). | Version 1.53 / versionCode 54. Android-Build-CI 45292752377 erfolgreich. Echter Emulator-Instrumentierungslauf 45292752417 läuft aktuell mit Tests zu verschlüsseltem Speicher, Backup/Restore und fail-closed-Verhalten. Noch kein bestätigter Shopgerätetest. Hermes bleibt Pflichtintegration, aber ohne Carrier-/Betreiberzugang nicht produktiv integriert. |
| **SCAN-PROFIT** | [mouzzlii/SCAN-PROFIT](https://github.com/mouzzlii/SCAN-PROFIT) | 2.0.66-Prüfpaket lokal mit 155/155 Tests, statischem Build und Smoke-Test erfolgreich; Static-release-CI 45292138429 auf Main grün. Vollständiger Next.js-/Test-Quellbaum noch nicht in GitHub importiert; Lockfile, npm audit, Next.js-Build und Deployment-Abgleich offen. |
| **KREISLAUF** | [mouzzlii/Kreislauf](https://github.com/mouzzlii/Kreislauf) | Main-Build/TypeScript/Tests erfolgreich. Runtime-DB ist PGlite oder Neon/Postgres über DATABASE_URL, nicht automatisch Supabase; Supabase-Projekte haben unterschiedliche Migrationstände. Preview-OAuth-Secret wurde aus Main entfernt (Commit a92e5ab…); Main-CI grün. Das alte Secret muss durch den Auth-Broker-Betreiber noch rotiert/widerrufen werden. Demo-Branch `demo/local-auth-off` enthält zentralen Nachrichten-Posteingang `/nachrichten`, inseratgebundene Chats und Moderations-Posteingang `/moderation`; Build-/TypeScript-/Tests-/Lint-CI Run 45297354678 sowie DB-/read-only-Supabase-Test Run 45297354673 grün. Öffentliche Auth-/Moderations-/Mehrbenutzerabnahme bleibt offen. |
| **CHRONOS** | [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS) | Main-Python-CI und Android-Build/Unit-Tests einschließlich Robolectric-SQLite-Test erfolgreich (Main-Commit 445869c…). Debug-APK verfügbar. Echte Geräte-, Backup/Restore-, Verschlüsselungs- und Großbibliothekstests bleiben offen. |

## KI-Team-Zusammenarbeit

- Die GitHub-Relay-Implementierung ist in KREISLAUF `main` integriert; der Relay benötigt weiterhin die explizit konfigurierten Provider-Secrets, Modellkennungen und Budgetfreigabe.
- PR #29 erweitert den Kontext von README/Dateipfaden auf ausgewählte Quelltextauszüge aus einer festen Allowlist, mit strikten Zeichenlimits und Vorrang für den Nutzerauftrag. Die ausgewählten Auszüge werden erst bei Aktivierung an externe Provider übermittelt. `AI_TEAM_REPO_READ_TOKEN` bleibt read-only Pflicht; fehlende Variablen führen zum sicheren Abbruch. Für TRAKUNA werden Architektur- und Android-Quellrepository gemeinsam berücksichtigt.
- Der Relay führt keine Codeänderungen, Merges oder Deployments aus.
- Es wurden in dieser Arbeit keine Gemini-/Grok-Provider-Aufrufe durchgeführt. Die externe KI-zu-KI-Kommunikation ist technisch vorbereitet, aber nicht Ende-zu-Ende freigegeben.
- Aktivierung erst nach Einrichtung der drei Provider-Secrets, gültiger Modellkennungen, eines read-only GitHub-Tokens, tatsächlicher Provider-Ausgabenlimits und ausdrücklicher Budgetbestätigung.

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
