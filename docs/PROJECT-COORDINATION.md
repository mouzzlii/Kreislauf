# Gemeinsame Projektsteuerung

**Stand:** 27.11.2026

Diese Datei ist die kurze operative Koordinationsseite für die Projektfamilie. Die globale Arbeitsverfassung ist ausschließlich [MAINPROMPT 2.0.7](https://github.com/mouzzlii/KI-Arbeitsplatz/blob/main/docs/MAINPROMPT.md). Die chatbasierte Projekt- und Entscheidungsreferenz liegt in [CHAT-PROJECT-BASELINE.md](CHAT-PROJECT-BASELINE.md); sie bündelt bestätigte Ziele, Repository-Zuordnungen, Statusgrenzen und offene Punkte. Die folgenden Regeln sind zusätzliche Projektfamilien-Vorgaben, keine zweite globale Arbeitsverfassung.

## Zusätzliche Projektfamilien-Regeln

Die globale Arbeitsweise, GitHub-Schutzregeln, Kosten-/Freigabegrenzen, Sicherheits- und Teststatussprache stehen im MAINPROMPT 2.0.7. Für diese Projektfamilie gelten ergänzend:
- Keine parallelen Änderungen an denselben Dateien ohne Abstimmung; TRAKUNA bearbeitet genau ein priorisiertes Ticket gleichzeitig.
- KREISLAUF, Menschheitsfamilie, TRAKUNA, SCAN-PROFIT, INSERAT-PROFI AI und CHRONOS behalten getrennte Daten-, Berechtigungs- und Produktgrenzen.
- Projektübergreifende Module erst nach eigenständigen Tests, Sicherheitsprüfung und belegtem Wiederverwendungsnutzen übernehmen.
- Für TRAKUNA bleiben echte Carrier-Buchungen, Labelkäufe und verbindliche Auftragsübermittlungen bis zur jeweiligen Betreiber-/Carrier-Freigabe gesperrt.
- Für KREISLAUF bleiben echte Nutzerkonten, produktive Punkte-/Treuhandvorgänge und externe Transaktionen bis zur gesonderten Abnahme und Freigabe gesperrt.

## Operative Projektübersicht

| Projekt | Kanonische Quelle | Aktueller bestätigter Fokus / Grenze |
|---|---|---|
| TRAKUNA | [Android-App](https://github.com/mouzzlii/Fuck) · [Gateway](https://github.com/mouzzlii/multi-carrier-gateway) | Smartphone, ein Drucker, WLAN + Bluetooth, alle acht Carrier-Profile. Gateway PR #4 und App PR #25/#33 sind offen; keine reale Drucker-/Carrier-Abnahme. Gateway PR #5 aktualisierte am 26.11.2026 die Gateway-main-Dokumentation. |
| KREISLAUF | [mouzzlii/Kreislauf](https://github.com/mouzzlii/Kreislauf) | Demo-/Entwicklungsbasis: Marktplatz, Tausch, Punkte, inseratgebundene Nachrichten, Moderation und Treuhand-Zielbild. Supabase ist nicht automatisch angebunden. Separater Council-Relay: Main enthält noch den alten direkten Provider-Workflow; die Gateway-Umstellung mit harter 0-EUR-Sperre wird in einem sauberen Draft-Branch vorbereitet und ist nicht integriert. |
| SCAN-PROFIT | [mouzzlii/SCAN-PROFIT](https://github.com/mouzzlii/SCAN-PROFIT) | Version 2.0.66; Release-Dokumentation belegt 155/155 Tests und Vercel READY für den dokumentierten Commit. Direkte aktuelle HTTP-Prüfung und Android-Praxistest bleiben offen. |
| INSERAT-PROFI AI | [mouzzlii/INSERAT-PROFI-AI](https://github.com/mouzzlii/INSERAT-PROFI-AI) | Eigenständige Next.js-PWA; lokale Foto-/Entwurfsverwaltung und optionale serverseitige KI. Keine automatische willhaben-Veröffentlichung oder bestätigte Import-API. |
| CHRONOS | [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS) | Privates lokales Fotoarchiv, Milestone 0.5. Desktop und Android getrennt; keine Sync-/Produktionsfreigabe. Nicht mit KRONOS 01 verwechseln. |
| KI-Arbeitsplatz | [mouzzlii/KI-Arbeitsplatz](https://github.com/mouzzlii/KI-Arbeitsplatz) | Zentrales Agent-/Koordinationsziel. GitHub-main enthält beim Audit nur das v1.0.0-ZIP und .github; kein editierbarer Quellbaum oder funktionierender Android-Agent nachgewiesen. |
| Menschheitsfamilie | [mouzzlii/Gemeinwohl](https://github.com/mouzzlii/Gemeinwohl) | Eigenständige Community-Konzeption; Repo enthält derzeit ZIP-Artefakt, kein verifizierter vollständiger Quellbaum. Daten-/Berechtigungsgrenzen zu KREISLAUF bleiben getrennt. |

Weitere Konzept- und Forschungsstränge (KRONOS 01, KREISLAUF ReFlex/VacMail, VR-SCENT, KREISLAUF AIRLESS und Implosionsmotor) sind in der Projektbaseline aufgeführt. Vertrauliche technische Erfindungsdetails gehören nicht in dieses öffentliche Repository.

## KI-Team und externe Provider

- **Ziel:** ChatGPT koordiniert; vier unabhängige Modellanalysen über GPT, Claude, Gemini und Grok, danach eine nachvollziehbare GPT-Synthese. Jede Erstinstanz erhält denselben begrenzten Ausgangskontext, nicht die Analysen der anderen Modelle. Erst echte Providerantworten mit Modell-/Endpoint-/Request-Metadaten belegen einen Live-Council.
- **Aktueller `main`-Stand:** Der noch integrierte Alt-Relay verwendet direkte OpenAI- und Anthropic-Endpunkte sowie optional Meta/Llama. Der Main-Workflow besitzt nur den manuellen booleschen `AI_TEAM_BUDGET_CONFIRMED`-Schalter, aber keine feste `false &&`-Sperre und keine numerische Kostenobergrenze. Die tatsächlichen Actions-Secrets/-Variablen wurden nicht gelesen; ihr Vorhandensein oder Wert ist unbekannt. Es wurde kein Provideraufruf ausgelöst.
- **Sicherheitsziel im sauberen Integrationsbranch** `integration/council-gateway-clean-main-2026-11-27`: vier feste Vercel-AI-Gateway-Aliase (`vmc/council-gpt`, `vmc/council-claude`, `vmc/council-gemini`, `vmc/council-grok`), feste Alias-Allowlist, Public-only-Quellkontext, explizite Datenklassifikation und eine harte `false &&`-Workflow-Sperre. Der Branch wurde direkt von aktuellem `main` erstellt, um die starke Divergenz von Draft PR #38 nicht zu übernehmen. Er ist noch nicht integriert; die neue Branch-CI-/PR-Abnahme steht aus.
- **Älterer Draft PR #38:** Der umfangreiche Branch `feature/portfolio-council-routing` enthält dieselbe Gateway-Umstellung und Schutzlogik, ist aber 158 Commits voraus / 89 zurück und GitHub meldet `mergeable=false`. Auf Code-Head `290a6ef9073573fcdde2083a00e3d98effe72881` bestand Relay-CI Run [46032397289](https://github.com/mouzzlii/Kreislauf/actions/runs/46032397289) mit 42/42 Node-Tests; nach der Dokumentationsaktualisierung bestand auch Run [46032510358](https://github.com/mouzzlii/Kreislauf/actions/runs/46032510358) auf Head `264478a441ea8eee5f65051650383e285c0bf71c`. Das sind synthetische Parser-/Adapter-/Guard-Tests, keine Live-Inferenz.
- **Datenschutz:** Der Council-Relay darf ausschließlich öffentlich sichtbare Repositorys laden und verlangt `visibility=public` sowie `private=false` vor README-/Tree-/Dateizugriff. Unbekannte, private und interne Repositorys werden fail-closed abgewiesen. Freie Aufträge benötigen `[public]`, `[synthetic]` oder `[anonymized]`; interne, vertrauliche, personenbezogene oder geheime Inhalte sind ausgeschlossen. Die Klassifikation ist eine Erklärung des Auftraggebers, keine automatische PII-Erkennung. Das private Repository `mouzzlii/KI-Arbeitsplatz` wird nicht gelesen oder öffentlich gemacht.
- **Gateway-Konfiguration:** Fünf aktive Vercel-Aliase für GPT-5, Claude Sonnet 4.6, Gemini 3 Flash, Grok 4.7 und Llama 4 Maverick wurden read-only bestätigt. Alle führen `zeroDataRetention=true` und `disallowPromptTraining=true`. Nur Claude ist explizit auf EU-Bedrock-/Vertex-Routen eingeschränkt. Für GPT, Gemini und Grok ist keine explizite EU-Inferenzregion festgelegt; Llama bleibt für private/vertrauliche Inhalte gesperrt. Meta Muse ist nicht Teil des neuen Vier-Modell-Flows.
- **Credentials:** `AI_GATEWAY_API_KEY` ist ein separates GitHub-Actions-Secret und wird nicht automatisch aus Vercel übernommen. Ein read-only `AI_TEAM_REPO_READ_TOKEN` ist für die öffentlichen Quellrepositorys vorgesehen. Secrets und Variablen wurden nicht gelesen, angelegt oder geändert.
- **Kosten:** Das Vercel-Projektbudget wurde mit 5 USD/Monat und 0 USD Verbrauch ausgelesen; es ist ein Soft Cap, keine harte Kostenobergrenze. Der verbindliche Zusatzbudgetrahmen beträgt 0 EUR. Keine Live-Inferenz, kein kostenpflichtiger Smoke-Test und keine Budget-/Tarifänderung ohne neue ausdrückliche Freigabe und numerisches, anbieterübergreifendes Hard-Gate mit atomarer Reservierung.
- **Vercel-Status:** Der Preview-Check des älteren PR #38 scheitert aktuell am `build-rate-limit`; kein Upgrade und kein kostenpflichtiger Retry. Eine erfolgreiche GitHub-CI ist nicht mit einer bereitgestellten oder manuell abgenommenen Preview gleichzusetzen.
- **Bestehende EVE-Anwendung:** Das Vercel-Projekt `collective-intelligence-council` bleibt eine separate vorhandene Anwendung. Die neue Gateway-Relay-Arbeit verändert oder ersetzt sie nicht. Die Bestandsaufnahme und der Quellcode-Recovery-Blocker stehen in `docs/VERCEL-EVE-INTEGRATION.md`.
- **KI-Arbeitsplatz PR #12:** Lokale PWA-Mock-Workbench und isolierte serverseitige Orchestrierungs-/HTTP-Bausteine sind im Draft-Branch vorhanden. Aktueller Head `8498028a621126382e74044d5f586b028f4e18e1`, 18 geänderte Dateien, 106 Commits voraus / 38 zurück, `mergeable=false`. Der Quellstand enthält 22 Orchestrator- und 16 HTTP-Fälle; für den exakten Head liegt kein Actions-Lauf vor. `budget_settlement_failed` wird neu mit HTTP 503 behandelt. Vercel meldet `api-deployments-free-per-day` (>100 Deployments/24 h). Es fehlen persistente transaktionale Budget-/Recovery-/Usage-Dienste, eine deploybare Route, echte Auth-/CSRF-/Freigabe-/Audit-Dienste, Provideradapter und ChatGPT-Synthese.
- **Status:** Keine echten Provider-Aufrufe, keine unabhängigen externen Modellantworten und kein nachgewiesener Council-Durchlauf. Keine Inferenzkosten, keine Budgetänderung.
- **Nachweise:** [Council Live Status](COUNCIL_LIVE_STATUS.md), [Council Setup](../AI_TEAM_SETUP.md), [Vercel-/EVE-Integration](VERCEL-EVE-INTEGRATION.md), [Projektbaseline](CHAT-PROJECT-BASELINE.md) und [MAINPROMPT 2.0.7](https://github.com/mouzzlii/KI-Arbeitsplatz/blob/main/docs/MAINPROMPT.md).

## Abnahme-Gates

1. Anforderungen und Nicht-Ziele dokumentiert.
2. Reproduzierbarer Quellcode und Abhängigkeiten versioniert.
3. Automatisierte Tests und Produktionsbuild erfolgreich.
4. Sicherheits- und Datenschutzprüfung abgeschlossen.
5. Ende-zu-Ende-Prüfung auf realistischen Geräten/Umgebungen abgeschlossen.
6. Externe Anbieter-/API-Freigaben rechtmäßig eingerichtet.
7. Backup, Wiederherstellung und Fehlerbehandlung geprüft.
8. Release-Artefakt, Installationsanleitung und Rollback-Verfahren vorhanden.
9. Offene Einschränkungen transparent dokumentiert.

## Statussprache

- **Entschieden:** ausdrücklich vom Nutzer festgelegt.
- **Geplant:** noch nicht implementiert.
- **Implementiert:** Code oder Dokumentation ist im genannten Branch vorhanden.
- **Automatisiert geprüft:** konkrete Tests/CI-Läufe für den exakten Commit erfolgreich.
- **Extern geprüft:** realer Geräte-/Anbieter-/Produktionsablauf tatsächlich getestet.
- **Produktionsbereit:** alle erforderlichen Abnahme-Gates erfüllt.

Nie einen Status aus einem anderen ableiten.
