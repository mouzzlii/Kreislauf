# Gemeinsame Projektsteuerung

Stand: 2026-11-24

Dieses Dokument koordiniert die verifizierten Entwicklungsprojekte und kennzeichnet historische bzw. unklassifizierte Repositories getrennt. Es ersetzt keine projektspezifischen Anforderungen, Tests oder Betreiberfreigaben. Statusangaben unterscheiden strikt zwischen vorhandenem Code, automatisierten Prüfungen, externen Tests und Produktionsfreigabe.

## Gemeinsame Regeln

- GitHub ist die verbindliche Quelle für eingecheckten Code und dokumentierte Entscheidungen.
- Änderungen erfolgen grundsätzlich auf Aufgaben-Branches und werden über Pull Requests integriert.
- Keine parallelen Änderungen an denselben Dateien ohne vorherige Abstimmung.
- Vor jeder Änderung: aktuellen Stand, README, Projektanweisungen, offene Issues und CI lesen.
- Doppelarbeit vermeiden: pro Projekt/Funktion gibt es genau einen verantwortlichen Umsetzungs-PR; neue Chats und Aufgaben müssen zuerst Issue #11 und bestehende PRs abgleichen. Bestehende Arbeit wird fortgesetzt oder geprüft, nicht parallel neu implementiert.
- Nach jeder Änderung: passende Tests ausführen und Ergebnisse samt Commit-SHA dokumentieren.
- Keine Zugangsdaten, Kundendaten, privaten Fotos, Produktionsdatenbanken oder echten `.env`-Dateien committen.
- Externe Dienste gelten erst nach erfolgreicher Integration und echtem Ende-zu-Ende-Test als einsatzbereit.
- Ein grüner CI-Lauf beweist nur die darin ausgeführten automatisierten Prüfungen, nicht die Produktionsreife.
- Keine kostenpflichtigen Provider-Aufrufe, produktiven Buchungen oder externen Freigaben ohne ausdrückliche Autorisierung.

## Projektübersicht

| Projekt | Quellcode / Repository | Verifizierter Stand und offene Grenzen |
|---|---|---|
| **TRAKUNA** | Architektur/Koordination: [mouzzlii/multi-carrier-gateway](https://github.com/mouzzlii/multi-carrier-gateway); Android-App: [mouzzlii/Fuck](https://github.com/mouzzlii/Fuck). | Version 1.53 / versionCode 54. Build-CI 45293451483 erfolgreich; Debug-APK-Archiv und APK-Container sind intakt, SHA-256 stimmt mit der Prüfsummendatei überein. PR #12 gemergt (Commit `a537c81`): aktive Emulatorläufe werden nicht automatisch durch neuere Runs abgebrochen. PR #13 gemergt (Commit `fe3314e`): KVM-Zugriffsregel auf Linux-Runnern plus TCG-Fallback und Diagnose. Android-15-Emulatorlauf 45307309795 auf PR-Head und alle fünf Instrumentierungstests erfolgreich (0 fehlgeschlagen/übersprungen); getestet wurden AES-GCM-Storage, verschlüsselter Übergabe-Cache, Fail-Closed-Verhalten und Backup-Wiederherstellung. Main-Push-Wiederholung 45308245723 läuft nach Merge noch. Kein echter Shopgerätetest; Hermes bleibt Pflichtintegration ohne produktiven Carrier-/Betreiberzugang. |
| **SCAN-PROFIT** | [mouzzlii/SCAN-PROFIT](https://github.com/mouzzlii/SCAN-PROFIT) | Version 2.0.66-Prüfpaket lokal mit 155/155 Tests, statischem Build und Smoke-Test erfolgreich; Static-release-CI 45294526404 auf aktuellem Main grün. Live-Production ist weiterhin READY auf einem älteren Commit (`bf6af8d`), nicht auf dem aktuellen GitHub-Stand. Das Vercel-Free-Tier-Buildlimit verhindert derzeit ein neues Production-Deployment. Separater Quellzweig `source/next-app-2.0.66` enthält das Next.js-Manifest und das generierte Lockfile; Workflow 45305505334 bestand mit `npm ci` und `npm audit --audit-level=high` (400 Paket-Einträge, kein High-/Critical-Blocker). Vollständiger Next.js-Quellbaum ist weiterhin im lokalen Prüfpaket/Download-ZIP, nicht vollständig in GitHub importiert; Next.js-Build/ESLint und Android-Praxisprüfung sind damit offen. |
| **KREISLAUF** | [mouzzlii/Kreislauf](https://github.com/mouzzlii/Kreislauf) | Sicherheits-PR #22 gemergt (Commit `a92e5ab`); das zuvor eingebettete Preview-OAuth-Secret ist aus Main entfernt, der Broker-Schlüssel muss separat durch den Broker-Betreiber widerrufen/rotiert werden. PR #29 gemergt (Commit `7ff64cb`): begrenzte Quelltext-Allowlist und Secret-Redaktion. PR #31 für direkten und kombinierten Tausch gemergt (Commit `bd749a9`): konkrete Gegenleistung, beidseitige Abschlussbestätigung, Karma-Ausgleich erst danach und inseratgebundene Nachrichten. PR #30 ergänzt im getrennten Demo-Zweig einen Datenbank-Guard gegen Stimmen von Transaktionsparteien bei beiden Treuhand-Abstimmungen; gemergt in `demo/local-auth-off` (Commit `c46c5f2`), CI Run 45305494236 grün. PR #32 gemergt (Commit `f1bd274`): GPT → Claude → Llama Basis. PR #33 gemergt (Commit `e559f68`): der dritte Agent ist ausdrücklich wählbar – Meta Muse über Meta Model API oder echtes Llama über einen separat gehosteten HTTPS-Inference-Endpunkt. Relay-CI Run 45308167302 und vollständige PR-Build-CI Run 45308167341 erfolgreich; Main-Push-CI nach letztem Merge 45308317170 läuft noch. Keine Provider-Aufrufe, keine Schlüssel oder Modellvariablen eingerichtet, Live-Relay bleibt bis zu Kostenlimits und Budgetfreigabe gesperrt. Runtime-DB bleibt PGlite oder Neon/Postgres über `DATABASE_URL`, nicht automatisch Supabase. Öffentliche Auth-/Moderations-/Mehrbenutzerabnahme offen. |
| **CHRONOS** | [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS) | Main bleibt lokaler Fotoarchiv-Prototyp Milestone 0.5. Python-/Android-CI einschließlich Robolectric-SQLite-Tests ist dokumentiert erfolgreich. Das separate Face-Hardening-Paket 0.2.0 besteht lokal 11/11 Tests (inkl. Multi-Prozess-Lock und lokaler API-Prüfung), ist aber nicht in den Hauptquellbaum integriert und darf wegen abweichendem Datenbankschema, fehlender Benutzer-Authentifizierung und biometrischer Datenschutzanforderungen nicht öffentlich bereitgestellt werden. Echte Android-Geräte-, Backup/Restore-, Verschlüsselungs- und Großbibliothekstests bleiben offen. |

| **INSERAT-PROFI AI** | [mouzzlii/INSERAT-PROFI-AI](https://github.com/mouzzlii/INSERAT-PROFI-AI) | Eigenständige App mit eigener Oberfläche und Datenhaltung; darf Erkenntnisse/Komponenten aus SCAN-PROFIT wiederverwenden, aber SCAN-PROFIT nicht verändern. PR #2 zur kontrollierten KI-Fotoerkennung/-Gruppierung ist separat zu prüfen. Automatische Willhaben-Veröffentlichung und verifizierter Willhaben-CSV-Import sind nicht belegt. |
| **BOOK YOUR COOK** | [mouzzlii/book-your-cook](https://github.com/mouzzlii/book-your-cook) | Eigenständiges Produkt. Issue #1 dokumentiert offenen Steuer-/Brutto-Netto-Blocker; PR #2 zur monotonen Stripe-Refund-Statusbehandlung ist separat zu prüfen. Steuerliche Preislogik nicht ohne fachliche/gesetzliche Klärung verändern. |
| **LARA QUIZ** | [mouzzlii/Lara_Quiz](https://github.com/mouzzlii/Lara_Quiz) | Eigenständiges Offline-HTML-Quiz mit lokalem Speicher und JSON-Import; keine Server-/Cloud-Synchronisierung unterstellen. Importgrenzen und Validator sind Teil der begrenzten Prüfung. |
| **KI-ARBEITSPLATZ** | [mouzzlii/KI-Arbeitsplatz](https://github.com/mouzzlii/KI-Arbeitsplatz) | Ausgangsbasis ist Meisterwerk 1.0.0; einzige Erweiterungsbasis ist `release/offline-masterwerk-v0.2.1` mit Draft PR #1 (Head `a70affef726ea2dc9f1ec38447e3ddbd2c1bb61f`, nicht gemergt, mergeable). Enthält Offline-Wächter, persistente Aufgabenqueue, begrenzte deterministische Worker, Backup/Restore mit atomarer Veröffentlichung und Crash-Recovery, Credential- und Junction-/Symlink-Schutz, deduplizierte Inventar-/Erstprüfaufträge, NVIDIA-/Ollama-Loopback-Diagnose und Startfehleranzeige. Aktuelles Paket `Artifacts/KI-Arbeitsplatz-Offline-Modus-v0.2.1.zip`: 122.351 Bytes, 15 Dateien, Git-Blob-SHA `80260f9be52383878a4d8ae57ca62f6748a6db75`; Statusdokumentation und ZIP wurden synchronisiert. Letzte Standard-/Windows-CI-Läufe `45459093787`/`45459093639` auf PR-Head `fb8e3832a8e3b32feffbf3503b0745dd34b413f2` endeten beide vor dem ersten Schritt (0 Steps). Daher keine bestätigten Windows-PowerShell-/Worker-/Installer-Lauftests; kein unabhängiger Windows-11-End-to-End-Test. Es gibt noch kein lokales LLM und keinen autonomen Code-Agenten. Kein zweites Arbeitsplatzprogramm aufbauen; ursprüngliches v1.0.0 und main bleiben unverändert. |

## Vorhandene Council-Anwendung

| **KI MASTER TEAM / COUNCIL UI** | Bestehendes Vercel-Projekt `collective-intelligence-council` (kein bestätigtes GitHub-Quellrepository/keine `gitSource`-Metadaten am geprüften Deployment). | Vercel-Deployment `dpl_63UdhcnaJXwrwkCo16Bryd4xCh9v` ist `READY`; 109 Deployment-Dateien. Bestehende EVE-Anwendung 1.1.0 mit Web-Chat, Root-Agent und acht Rollen-Agenten (Planung, Recherche, Architektur, Entwicklung, Tests, Review, Sicherheit, Release). Alle eingesehenen `agent.ts`-Dateien verwenden dasselbe Modell `openai/gpt-6-luna-fast`: Rollen sind getrennt, aber eine unabhängige Claude-/Meta-/Llama-Gegenprüfung ist damit nicht belegt. Für dieses Vercel-Projekt existiert ein aktives AI-Gateway-Monatsbudget von 5 USD; abgerufener Stand: 0 USD Verbrauch. Keine KI-Anfrage wurde durch diese Prüfung ausgelöst. Vor Codeänderungen muss der vorhandene Quellstand aus dem Deployment in ein einziges kanonisches GitHub-Repository überführt/verbunden werden. Der eingebettete Projektregister-Snapshot ist nicht als maßgebliche Aufgabenquelle zu verwenden; Issue #11 bleibt führend. |


## KI-Team-Zusammenarbeit

- Der lokale KI-Arbeitsplatz ist vom Cloud-Council-Relay zu unterscheiden: Er soll später lokale/offline Aufgaben auf Windows ausführen; der Relay dient der kontrollierten externen Modell-Gegenprüfung. Keine dieser Verbindungen gilt ohne echten Ende-zu-Ende-Test als aktiv.
- Die vorhandene EVE-basierte KI-MASTER-TEAM-Anwendung ist eine dritte, bereits bereitgestellte Council-Oberfläche. Sie wird nicht neu gebaut. Ihr aktueller Deployment-Code weist acht Rollen-Agenten aus, nutzt für diese aber dasselbe OpenAI-Gateway-Modell; echte unabhängige Provider-Reviews sind nicht belegt. Die Integration mit dieser GitHub-Projektübersicht erfolgt erst nach Herstellung eines kanonischen, versionierten Quellrepositorys.
- Die sichere GitHub-Relay-Basis ist in KREISLAUF `main` integriert. PR #29 erweiterte sie um begrenzte Quelltextauszüge und Secret-Redaktion. Der Relay reagiert nur auf einen ausdrücklich markierten Kommentar in Issue #11 und ändert selbst keinen Quellcode.
- PR #32 und PR #33 sind in Main integriert (Commits `f1bd274` und `e559f68`). Die Rollenfolge lautet GPT → Claude → dritter Agent → GPT. Claude nutzt die Anthropic Messages API. Der dritte Agent kann über `AI_TEAM_THIRD_PROVIDER=meta` Meta Muse via gehostete Meta Model API ausführen oder über `AI_TEAM_THIRD_PROVIDER=llama` ein echtes Llama-Modell via separat gehostetem HTTPS-Inference-Endpunkt. Relay-CI Run 45308167302 und vollständige PR-Build-CI Run 45308167341 erfolgreich; Main-Push-CI nach PR #33 läuft noch.
- **Meta-/Llama-Grenze:** Die gehostete Meta Model API stellt Muse-Modelle bereit, nicht Llama-Gewichte. Llama bleibt deshalb ein getrennt gehostetes Open-Weight-Modell. Die Auswahl ist explizit und fail-closed; ohne passenden Secret-/Modell-/Endpoint-Satz wird kein Provider aufgerufen.
- Der Relay lädt README, höchstens 80 Dateipfade und bis zu vier ausgewählte Quelltextauszüge pro Repository (maximal 1.800 Zeichen je Datei und 6.500 Zeichen pro Repository) aus einer festen Allowlist. Secret-Dateien, Umgebungsdateien, Credential-, Schlüssel-, Lock- und Builddateien sind nicht Teil der Auswahl.
- Die Redaktion deckt bekannte Provider-Token, PEM-Private-Keys, JWTs, benannte Secret-Zuweisungen und 64–128-stellige Hexwerte ab. Das ist eine zusätzliche Schutzschicht, keine Garantie, dass beliebige Geheimnisse niemals erkannt werden. Daher dürfen ausgewählte Dateien weiterhin keine echten Kundendaten, Sendungsdaten oder Geheimnisse enthalten.
- Bei Aktivierung werden ausgewählte Quelltextauszüge zusammen mit der Anfrage an OpenAI, Anthropic und den ausgewählten Llama-Inference-Anbieter übertragen. Es wurden keine Provider aufgerufen und keine Schlüssel eingerichtet.
- Ein täglicher Deckel von zwei Debatten reserviert vor Provider-Aufrufen ein Kontingent im zentralen Issue #11. Das Gespräch verwendet maximal 1.000 Ausgabetokens je Modellschritt.
- Live-Freigabe bleibt ausstehend: Provider-Secrets, tatsächlich unterstützte Modellkennungen, sichere Llama-HTTPS-Adresse, read-only GitHub-Token, echte Anbieter-Ausgabenlimits und `AI_TEAM_BUDGET_CONFIRMED=true` müssen durch den Kontoinhaber eingerichtet und geprüft werden. Die Variable ist eine manuelle Bestätigung und prüft Anbieterbudgets nicht automatisch.

## Historische und noch nicht klassifizierte Ablagen

- `mouzzlii/Pakete` ist ein historischer Paket-Prototyp; TRAKUNA ist der kanonische Entwicklungsstrang.
- `mouzzlii/multi-carrier-gateway-neu`, `Pakete-neu`, `Paketescanner`, `Pakete-Scanner` und `ShopScannerNeu` bleiben Experimente bzw. unklassifizierte Kandidaten, bis README, Commitstand und Abhängigkeiten fachlich zugeordnet sind.
- `mouzzlii/Gemeinwohl` enthält derzeit vor allem Archiv-/ZIP-Artefakte und bleibt bis zum Versions-/Abhängigkeitsvergleich unklassifiziert.
- „Menschheitsfamilie“ bleibt ein verwandter Konzept-/Projektbereich; ein kanonisches eigenständiges Repository ist hier noch nicht bestätigt.

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
