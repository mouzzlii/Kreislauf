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
| **TRAKUNA** | Architektur/Koordination: [mouzzlii/multi-carrier-gateway](https://github.com/mouzzlii/multi-carrier-gateway); Android-App: [mouzzlii/Fuck](https://github.com/mouzzlii/Fuck). | Main bleibt Version 1.53 / versionCode 54. Draft PR #14 ergänzt Version 1.54 mit portabler AES-256-GCM-/PBKDF2-Backupverschlüsselung, UI-Thread-freier KDF/Datei-I/O und Legacy-JSON-Warnung. Code-Head `d5bef8b397cb993495bbd10ced4b15a4d972b973` wurde im Android-15-Emulator-Workflow 45463760415 erfolgreich mit JVM-Tests, Lint, Debug-Build und `connectedDebugAndroidTest` geprüft; Debug-APK-Artefakt 14953069069 ist bis 08.12.2026 verfügbar. Nachfolgende Änderungen aktualisieren nur Dokumentation; neuester PR-Head `ef3ce0da189965e8818b745f0067b220522cf119`, zugehöriger CI-Lauf 45497303326 war beim letzten Abruf noch pending. PR bleibt Draft, kein Merge/Release. Manuelle Tests B1–B9 auf echtem Android-Gerät und Wiederherstellung auf Zweitgerät offen. Separater PWA-Teststand „Scan-Zentrale“ Build 0.4: 23/23 Node-Smoke-Tests; noch nicht in GitHub/HTTPS, Android-Kamera-/HTTPS-Test offen. Hermes bleibt Pflichtintegration. Öffentliche Recherche identifiziert HSI als Geschäftskunden-REST-API von Hermes Germany, nicht nachweislich als das neue österreichische PaketShop-Arbeitsplatzsystem; Shop-Systemname, Hersteller, offizielle Österreich-Schnittstelle und Betreiberfreigabe sind noch nicht bestätigt (siehe TRAKUNA-Draft-PR #2, `docs/HERMES-SYSTEMRECHERCHE.md`). Gateway-Adaptervertrag in Draft PR #2, kein ausführbarer Gateway-Dienst. |
| **SCAN-PROFIT** | [mouzzlii/SCAN-PROFIT](https://github.com/mouzzlii/SCAN-PROFIT) | Main bleibt die statische PWA 2.0.66. Vollständiger Next.js-Quellbaum 2.0.66 mit Lockfile, Tests und CI liegt in Draft PR #16 (aktueller Head `694ec6fae89d4444496c476e77238720a0545d74`). Neue Service-Worker-Härtung verhindert, dass eine andere erfolgreiche Navigation den Offline-App-Shell `/app.html` überschreibt; Regressionstest ergänzt. Statische Quellprüfung bestanden. GitHub-Workflows 45497427295 und 45497427386 endeten vor dem ersten Schritt (`steps: null`, kein Runner/keine Logs); keine Aussage über Testpass oder Codefehler. Älterer Branch-Commit bestand Clean Install, Audit, Core-Tests, ESLint und Build; neue Änderung ist noch nicht ausgeführt validiert. Vercel-Free-Tier-Buildlimit blockiert Preview/Deployment; keine Tarifänderung. Android-/Kamera-/Offline-Neustart-/Restore-/UPCitemdb-Praxistests offen. |
| **KREISLAUF** | [mouzzlii/Kreislauf](https://github.com/mouzzlii/Kreislauf) | Main unverändert. PR #38 Council-Portfolio-Routing (Head `45980fd7c4847e934581d1b053a0c6215b3a4102`, Build/Relay-CI 45466737404 und 45466737651 grün; Vercel-Preview wegen Build-Rate-Limit nicht erstellt; nicht gemergt). PR #37 „3 Punkte 1 Ort“ (Draft; strukturelle Tests/Build grün, regionale Kontakt-/Zuständigkeitsfreigabe fehlt). PR #36 bis zu vier Inseratsfotos, PR #35 Lint-Korrekturen und PR #34 Nachrichten-Suche/Filter bleiben Draft; frühere CI-Läufe grün, mobile Browser-/Android-/Mehrbenutzer-Abnahmen offen. Sicherheits- und Tauschgrundlagen auf Main; Live-Supabase-Migration, OAuth-Secret-Rotation beim Broker, echte ID-Austria-Anbindung, Blob-OIDC, Moderations-/Mehrbenutzer-/Android-Abnahme bleiben externe Freigabegates. |
| **CHRONOS** | [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS) | Main bleibt lokaler Fotoarchiv-Prototyp Milestone 0.5 mit unverschlüsseltem Standard-ZIP. Draft PR #62 ergänzt optional AES-256-GCM-verschlüsselte Backups, PBKDF2-HMAC-SHA256 (600.000 Iterationen), authentifizierten Header und Windows-Reparse-Point-/Junction-Schutz beim Thumbnail-Scan. Aktueller PR-Head `3c28fcc5c7a25952d5951bd888aabbcb11f6d72a`; CI-Lauf 45496629853 scheiterte vor dem ersten Schritt (alle Python-Matrixjobs `steps: null`), daher ist der aktuelle Stand nicht erneut getestet. Ein früherer Code-Commit bestand 63 Tests je Python 3.11/3.12/3.13; dieser Nachweis deckt die späteren Windows-Härtungsänderungen nicht ab. Windows-Geräte-, ACL-, große Fotoarchiv- und Restore-Praxistests offen. Separates Face-Hardening-Paket bleibt wegen Schema-/Auth-/Biometrie-Risiken nicht integriert und nicht öffentlich freizugeben. |

| **INSERAT-PROFI AI** | [mouzzlii/INSERAT-PROFI-AI](https://github.com/mouzzlii/INSERAT-PROFI-AI) | Eigenständige App mit eigener Oberfläche und Datenhaltung; keine Änderungen/Kopplung an SCAN-PROFIT. Draft PR #2 (Head `31aa8285a4ac4fcebab3180bfef369031f241791`) ergänzt Foto-Gruppierung mit manueller Prüfung und serverseitigen KI-Zugang: Passwortprüfung, signierte HttpOnly-/SameSite-Sitzung, exakte Same-Origin-Prüfung und Login-Drosselung; Textanalyse und Gruppierung verlangen eine gültige Sitzung. GitHub-CI 45496335181 endete ohne Runner-Schritte (`steps: null`), daher kein Testnachweis. Keine echten KI-Aufrufe/Schlüssel. Persistentes globales Ausgabenlimit fehlt weiterhin; KI darf öffentlich nicht aktiviert werden, bis Kostenwächter und Tests vorliegen. Kein Deployment. |
| **BOOK YOUR COOK** | [mouzzlii/book-your-cook](https://github.com/mouzzlii/book-your-cook) | Eigenständiges Produkt. Draft PR #2 (Head `837cfa701fec274c9e1fe2e458c4ff8864dda74c`) macht Refund-Status monoton, verarbeitet frühe Stripe-Refund-Events über PaymentIntent-Metadaten und validiert PaymentIntent-IDs vor Lookup/DB-Filter. Der aktuelle Web-Crypto-Signatur- und Race-Read-back-Patch ist noch ohne zugeordneten Workflow-Lauf; vorherige CI-Läufe 45496464856 und 45496464976 endeten vor dem ersten Schritt (`steps: null`), also ohne Runner/Testnachweis. Kein Stripe-/Supabase-E2E-Test, keine Migration/Live-Payment/Deployment. Steuer-/Brutto-Netto-Entscheidung bleibt Betreiber-/Steuerberatungsfreigabe; keine Steuersätze oder Rechtsannahmen ergänzen. |
| **LARA QUIZ** | [mouzzlii/Lara_Quiz](https://github.com/mouzzlii/Lara_Quiz) | Eigenständiges Offline-HTML-Quiz mit lokalem Speicher und JSON-Import; keine Server-/Cloud-Synchronisierung unterstellen. Der Integritätsprüfer `scripts/check-quiz.mjs` liegt in Main, aber der geplante Workflow-PR #2 wurde am 24.11. geschlossen, nicht gemergt; `.github/workflows/quiz-checks.yml` ist deshalb in Main nicht vorhanden. PR-Head `5177b5b0ccb5f3362f7dafdca797e208aa7b3651` ist kein Main-Nachweis. Browser-/Touch-/Audio-/Dateidialog-Ende-zu-Ende-Tests bleiben offen. |
| **KI-ARBEITSPLATZ** | [mouzzlii/KI-Arbeitsplatz](https://github.com/mouzzlii/KI-Arbeitsplatz) | Ausgangsbasis Meisterwerk 1.0.0; einzige Erweiterungsbasis `release/offline-masterwerk-v0.2.1`, Draft PR #1, Head `fce5c299a4690d77166c335d5160728c0c32bd06`. `Common.ps1` von 836 auf 374 Zeilen dedupliziert; 19 Funktionen mit eindeutigen Definitionen, strenge Queue-Validierung beibehalten; Regressionstest verhindert erneute Duplikate. GitHub-Windows-CI 45495180037 und allgemeine CI 45495180081 endeten vor dem ersten Schritt (`steps: null`); lokal ist kein PowerShell-Runtime verfügbar. Kein Windows-Parser-/Integrationstest, kein aktuelles Installations-ZIP. Main und Original v1.0.0 unverändert. |

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
