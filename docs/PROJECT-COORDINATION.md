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
| **TRAKUNA** | Architektur/Koordination: [mouzzlii/multi-carrier-gateway](https://github.com/mouzzlii/multi-carrier-gateway); Android-App: [mouzzlii/Fuck](https://github.com/mouzzlii/Fuck). | Version 1.53 / versionCode 54. Build-CI 45293451483 erfolgreich; Debug-APK-Archiv und APK-Container sind intakt, SHA-256 stimmt mit der Prüfsummendatei überein. PR #12 gemergt (Commit `a537c81`): aktive Emulatorläufe werden nicht automatisch durch neuere Runs abgebrochen. PR #13 bleibt offen; er ergänzt Ubuntu-22.04-Diagnose und `ANDROID_I_WANT_MY_TCG=yes`, weil der Runner kein nutzbares KVM bereitstellt. Der neue Emulatorlauf 45306749474 ist noch in Arbeit; bisher ist keine erfolgreiche Instrumentierung bestätigt. Der vorherige Run 45304342508 schlug fehl, weil QEMU TCG nicht explizit aktiviert war (Software-CPU-Emulation vom Emulator abgelehnt). Kein echter Shopgerätetest. Hermes bleibt Pflichtintegration, aber ohne Carrier-/Betreiberzugang nicht produktiv integriert; bestehende Shopgeräte/Systeme bleiben unangetastet. |
| **SCAN-PROFIT** | [mouzzlii/SCAN-PROFIT](https://github.com/mouzzlii/SCAN-PROFIT) | Version 2.0.66-Prüfpaket lokal mit 155/155 Tests, statischem Build und Smoke-Test erfolgreich; Static-release-CI 45294526404 auf aktuellem Main grün. Live-Production ist weiterhin READY auf einem älteren Commit (`bf6af8d`), nicht auf dem aktuellen GitHub-Stand. Das Vercel-Free-Tier-Buildlimit verhindert derzeit ein neues Production-Deployment. Separater Quellzweig `source/next-app-2.0.66` enthält das Next.js-Manifest und das generierte Lockfile; Workflow 45305505334 bestand mit `npm ci` und `npm audit --audit-level=high` (400 Paket-Einträge, kein High-/Critical-Blocker). Vollständiger Next.js-Quellbaum ist weiterhin im lokalen Prüfpaket/Download-ZIP, nicht vollständig in GitHub importiert; Next.js-Build/ESLint und Android-Praxisprüfung sind damit offen. |
| **KREISLAUF** | [mouzzlii/Kreislauf](https://github.com/mouzzlii/Kreislauf) | Sicherheits-PR #22 gemergt (Commit `a92e5ab`); das zuvor eingebettete Preview-OAuth-Secret ist aus Main entfernt, der Broker-Schlüssel muss separat durch den Broker-Betreiber widerrufen/rotiert werden. PR #29 gemergt (Commit `7ff64cb`): begrenzte Quelltext-Allowlist und Secret-Redaktion. PR #31 für direkten und kombinierten Tausch gemergt (Commit `bd749a9`): konkrete Gegenleistung, beidseitige Abschlussbestätigung, Karma-Ausgleich erst danach und inseratgebundene Nachrichten. PR #30 ergänzt im getrennten Demo-Zweig einen Datenbank-Guard gegen Stimmen von Transaktionsparteien bei beiden Treuhand-Abstimmungen; gemergt in `demo/local-auth-off` (Commit `c46c5f2`), CI Run 45305494236 grün. PR #32 ist jetzt ebenfalls in Main gemergt (Commit `f1bd274`): Relay GPT → Claude → Llama → GPT mit Anthropic Messages API und HTTPS-Llama-Inference-Endpunkt. Relay-CI Run 45306940044 erfolgreich; Main-Push Build/TS/Test/Lint/Build Run 45307111997 läuft noch (TypeScript bereits erfolgreich, Tests in Arbeit). Keine Provider-Aufrufe oder Live-Supabase-Migration. Runtime-DB bleibt PGlite oder Neon/Postgres über `DATABASE_URL`, nicht automatisch Supabase. Öffentliche Auth-/Moderations-/Mehrbenutzerabnahme offen. |
| **CHRONOS** | [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS) | Main bleibt lokaler Fotoarchiv-Prototyp Milestone 0.5. Python-/Android-CI einschließlich Robolectric-SQLite-Tests ist dokumentiert erfolgreich. Das separate Face-Hardening-Paket 0.2.0 besteht lokal 11/11 Tests (inkl. Multi-Prozess-Lock und lokaler API-Prüfung), ist aber nicht in den Hauptquellbaum integriert und darf wegen abweichendem Datenbankschema, fehlender Benutzer-Authentifizierung und biometrischer Datenschutzanforderungen nicht öffentlich bereitgestellt werden. Echte Android-Geräte-, Backup/Restore-, Verschlüsselungs- und Großbibliothekstests bleiben offen. |

## KI-Team-Zusammenarbeit

- Die sichere GitHub-Relay-Basis ist in KREISLAUF `main` integriert. PR #29 erweiterte sie um begrenzte Quelltextauszüge und Secret-Redaktion. Der Relay reagiert nur auf einen ausdrücklich markierten Kommentar in Issue #11 und ändert selbst keinen Quellcode.
- PR #32 ist in Main integriert (Commit `f1bd274`) und stellt die Provider-Auswahl auf GPT → Claude → Llama → GPT um. Claude verwendet die Anthropic Messages API. Llama wird über einen ausdrücklich konfigurierten OpenAI-kompatiblen HTTPS-Chat-Completions-Endpunkt angebunden; das kann ein Hosting-Anbieter oder eine eigene, abgesicherte Inference-Instanz sein. Relay-CI Run 45306940044 ist erfolgreich; der erste Main-Push-Build nach Merge (Run 45307111997) prüft noch die vollständige Pipeline.
- **Meta-/Llama-Grenze:** Die aktuelle gehostete Meta Model API stellt Muse-Modelle bereit, führt laut Meta aber keine Llama-Modellgewichte aus. Echte Llama-Modelle benötigen einen Inference-Anbieter oder eigene Infrastruktur. Der Relay darf diese beiden Wege nicht fälschlich als dieselbe API ausgeben.
- Der Relay lädt README, höchstens 80 Dateipfade und bis zu vier ausgewählte Quelltextauszüge pro Repository (maximal 1.800 Zeichen je Datei und 6.500 Zeichen pro Repository) aus einer festen Allowlist. Secret-Dateien, Umgebungsdateien, Credential-, Schlüssel-, Lock- und Builddateien sind nicht Teil der Auswahl.
- Die Redaktion deckt bekannte Provider-Token, PEM-Private-Keys, JWTs, benannte Secret-Zuweisungen und 64–128-stellige Hexwerte ab. Das ist eine zusätzliche Schutzschicht, keine Garantie, dass beliebige Geheimnisse niemals erkannt werden. Daher dürfen ausgewählte Dateien weiterhin keine echten Kundendaten, Sendungsdaten oder Geheimnisse enthalten.
- Bei Aktivierung werden ausgewählte Quelltextauszüge zusammen mit der Anfrage an OpenAI, Anthropic und den ausgewählten Llama-Inference-Anbieter übertragen. Es wurden keine Provider aufgerufen und keine Schlüssel eingerichtet.
- Ein täglicher Deckel von zwei Debatten reserviert vor Provider-Aufrufen ein Kontingent im zentralen Issue #11. Das Gespräch verwendet maximal 1.000 Ausgabetokens je Modellschritt.
- Live-Freigabe bleibt ausstehend: Provider-Secrets, tatsächlich unterstützte Modellkennungen, sichere Llama-HTTPS-Adresse, read-only GitHub-Token, echte Anbieter-Ausgabenlimits und `AI_TEAM_BUDGET_CONFIRMED=true` müssen durch den Kontoinhaber eingerichtet und geprüft werden. Die Variable ist eine manuelle Bestätigung und prüft Anbieterbudgets nicht automatisch.

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
