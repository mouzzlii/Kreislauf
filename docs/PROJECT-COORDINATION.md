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
| **TRAKUNA** | Architektur/Koordination: [mouzzlii/multi-carrier-gateway](https://github.com/mouzzlii/multi-carrier-gateway); Android-App: [mouzzlii/Fuck](https://github.com/mouzzlii/Fuck). | Main bleibt Version 1.53 / versionCode 54. Separater lokaler PWA-Teststand „TRAKUNA – Scan-Zentrale“ Build 0.4 ergänzt Filialprofil, lokale Mitarbeiterliste, Bearbeiterzuordnung, ehrliche Sync-/Carrier-Statusfelder, fehlertolerante lokale Speicherung, Backup-Validierung und CSV-Formelschutz; 23/23 Node-Smoke-Tests bestanden. Das ZIP ist erstellt, aber noch nicht in GitHub übernommen oder über HTTPS bereitgestellt; Android-/Kameratest offen. Draft PR #14 ergänzt Version 1.54 mit portabler AES-256-GCM-/PBKDF2-Backupverschlüsselung, UI-Thread-freier KDF/Datei-I/O und Legacy-JSON-Warnung. Exakter vorheriger Head `1799c683bab4cc2534686da61e29e8a0fa4c46ac`: CI-Lauf 45409645480 erfolgreich (JVM-Tests, Lint, Debug-Build, 7 Android-15-Emulator-Instrumentierungstests). Bei Review wurde ein Concurrency-Fehler entdeckt und auf dem PR-Branch korrigiert: `cancel-in-progress: false`; neuer Head `d5bef8b397cb993495bbd10ced4b15a4d972b973`, CI-Lauf `45463760415` erfolgreich (Emulator-Instrumentierung und Debug-APK-Artefakt); echter Android-Gerätetest bleibt offen. PR bleibt Draft, kein Merge/Release. Reale Geräteprüfung inkl. Wiederherstellung auf zweitem Gerät offen. Hermes bleibt Pflichtintegration, aber neues Shop-System, offizielle Österreich-Schnittstelle und Betreiberfreigabe sind noch nicht bestätigt. Gateway-Adaptervertrag liegt in Draft PR #2; kein ausführbarer Gateway-Dienst. |
| **SCAN-PROFIT** | [mouzzlii/SCAN-PROFIT](https://github.com/mouzzlii/SCAN-PROFIT) | Main enthält weiterhin die statische PWA 2.0.66. Vollständiger Next.js-Quellbaum mit Lockfile, Tests und CI ist in Draft PR #16 vorbereitet (Head `cc3e0d914df7ad8dbfc431abc178a9ac7b8d8753`); ein älterer Branch-Commit `5e7ee944cf1a1d41fa5f31f9b0cb61001d9776fb` bestand Clean Install, Audit (0 High-/Critical-Schwachstellen), 8/8 Core-Regressionstests, ESLint und Produktionsbuild. Die Läufe 45406224935 und 45406225086 für den aktuellen Head endeten vor dem ersten Schritt (Runner nicht zugewiesen, `steps: null`, keine Logs); aktueller Head damit nicht grün validiert. Vercel-Build-Kontingent blockiert Preview/Deployment; keine Tarifänderung. Echte Android-/Kamera-/Offline-Neustart-/Restore-/UPCitemdb-Tests bleiben offen. |
| **KREISLAUF** | [mouzzlii/Kreislauf](https://github.com/mouzzlii/Kreislauf) | Main bleibt unverändert. Offene PRs: #38 Council-Portfolio-Routing (Head `f82549d`, CI 45459548213 und 45459548110 erfolgreich; nicht gemergt), #37 „3 Punkte 1 Ort“ (298 Tests, Build/Lint erfolgreich; Draft bis regionale Zuständigkeiten/Kontaktweg geklärt), #36 bis zu vier Inseratsfotos (299 Tests, Build/Lint erfolgreich; Videos und produktiver Blob-Storage weiter gesperrt), #35 Lint-Korrekturen (CI 45406026220 erfolgreich) und #34 Nachrichten-Suche/Filter (CI 45403351832 erfolgreich); mobile Browser-/Android- und Mehrbenutzer-Abnahmen bleiben offen. Der separate Demo-PR #1 ist stark divergiert und bleibt ungemergt. Sicherheits- und Tauschgrundlagen sind auf Main; Live-Supabase-Migration, OAuth-Secret-Rotation beim Broker, echte ID-Austria-Anbindung, Blob-OIDC, Moderations-/Mehrbenutzer-/Android-Abnahme bleiben externe Freigabegates. |
| **CHRONOS** | [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS) | Main bleibt lokaler Fotoarchiv-Prototyp Milestone 0.5. Draft PR #62 ergänzt optional AES-256-GCM-verschlüsselte Backups und Restore erst nach erfolgreicher Authentifizierung. Aktueller Head `1c01f0ccee69c07a7478a06ea3cf0256145fdbe3`; Lauf 45419898868 endete vor dem ersten Schritt (alle drei Python-Matrixjobs ohne Runner/Steps/Logs). Letzter vollständiger grüner CI-Nachweis 45404245901 gilt für den älteren Head `6d14662e68ba34a75bb54c42b25d650f49bbd4c1` mit 63 Tests je Python 3.11/3.12/3.13; der aktuelle Restore-Patch ist damit nicht vollständig CI-bestätigt. Windows-ACL-, echte Geräte-, große Fotoarchiv- und Restore-Praxistests offen. Separates Face-Hardening-Paket bleibt wegen Schema-/Auth-/Biometrie-Risiken nicht integriert und nicht öffentlich freizugeben. |

| **INSERAT-PROFI AI** | [mouzzlii/INSERAT-PROFI-AI](https://github.com/mouzzlii/INSERAT-PROFI-AI) | Eigenständige App mit eigener Oberfläche und Datenhaltung; darf Komponenten/Erkenntnisse aus SCAN-PROFIT wiederverwenden, aber SCAN-PROFIT nicht verändern. PR #2 zur kontrollierten Foto-Gruppierung (Head `bcf64084f438ff6870879d736b6d0719b03b06c9`) ergänzt menschliche Prüfung und explizite Freigabe. CI-Lauf 45441646873 endete vor dem ersten Schritt ohne Runner/Steps/Logs; aktueller Head daher nicht durch CI validiert. Kein echter KI-Aufruf, da Schlüssel/Freischaltung fehlen. Review-Hinweis dokumentiert: vor öffentlicher Aktivierung benötigt auch `/api/ai/analyze` Authentifizierung und ein persistentes globales Kostenlimit; In-Memory-Rate-Limits sind kein Monatsbudget. Willhaben-Publishing/CSV-Import nicht belegt. |
| **BOOK YOUR COOK** | [mouzzlii/book-your-cook](https://github.com/mouzzlii/book-your-cook) | Eigenständiges Produkt. Draft PR #2 (Head `9d487a38232aea522a61baa500bd28f301521a2e`) macht Stripe-Refund-Status monoton; beide aktuellen CI-Workflows 45402976111 und 45402975864 sind erfolgreich. Paketprüfung: 588 Preisvarianten, 87 HTML-IDs und 7 Menüs. Stripe-Testmodus-/Webhook-E2E-Test sowie echte Betriebsangaben bleiben offen. Issue #1 Steuer-/Brutto-Netto-Blocker bleibt fachlich ungeklärt; keine Steuersätze oder Rechtsannahmen ergänzen, bis Betreiber/Steuerberatung die Vorgabe bestätigt. |
| **LARA QUIZ** | [mouzzlii/Lara_Quiz](https://github.com/mouzzlii/Lara_Quiz) | Eigenständiges Offline-HTML-Quiz mit lokalem Speicher und JSON-Import; keine Server-/Cloud-Synchronisierung unterstellen. Der Integritätsprüfer `scripts/check-quiz.mjs` liegt in Main, aber der geplante Workflow-PR #2 wurde am 24.11. geschlossen, nicht gemergt; `.github/workflows/quiz-checks.yml` ist deshalb in Main nicht vorhanden. PR-Head `5177b5b0ccb5f3362f7dafdca797e208aa7b3651` ist kein Main-Nachweis. Browser-/Touch-/Audio-/Dateidialog-Ende-zu-Ende-Tests bleiben offen. |
| **KI-ARBEITSPLATZ** | [mouzzlii/KI-Arbeitsplatz](https://github.com/mouzzlii/KI-Arbeitsplatz) | Ausgangsbasis Meisterwerk 1.0.0; einzige Erweiterungsbasis `release/offline-masterwerk-v0.2.1`, Draft PR #1, aktueller Head `88b2edac3faf9d2ce3f2847967f961d3e9728280`, nicht gemergt. Installer startet den Offline-Wächter unmittelbar und registriert ihn für künftige interaktive Anmeldungen; Dashboard muss dafür nicht geöffnet sein. Da Installation/Taskregistrierung und tatsächliche Ausführung auf dem Nutzer-PC nicht ausgelesen werden konnten, bleibt der lokale Lauf unbestätigt. Windows-CI-Läufe scheiterten vor dem ersten Schritt (0 Steps); kein bestätigter Windows-Praxistest. Ursprüngliches v1.0.0 und `main` bleiben unverändert. |

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
