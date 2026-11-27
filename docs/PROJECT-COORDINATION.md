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
| KREISLAUF | [mouzzlii/Kreislauf](https://github.com/mouzzlii/Kreislauf) | Demo-/Entwicklungsbasis. Marktplatz, Tausch, Punkte, inseratgebundene Nachrichten, Moderation und Treuhand-Zielbild. Preview-Funktionen nicht als Main-/Produktionsabnahme ausgeben; Supabase ist nicht automatisch angebunden. |
| SCAN-PROFIT | [mouzzlii/SCAN-PROFIT](https://github.com/mouzzlii/SCAN-PROFIT) | Version 2.0.66; Release-Dokumentation belegt 155/155 Tests und Vercel READY für den dokumentierten Commit. Direkte aktuelle HTTP-Prüfung und Android-Praxistest bleiben offen. |
| INSERAT-PROFI AI | [mouzzlii/INSERAT-PROFI-AI](https://github.com/mouzzlii/INSERAT-PROFI-AI) | Eigenständige Next.js-PWA; lokale Foto-/Entwurfsverwaltung und optionale serverseitige KI. Keine automatische willhaben-Veröffentlichung oder bestätigte Import-API. |
| CHRONOS | [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS) | Privates lokales Fotoarchiv, Milestone 0.5. Desktop und Android getrennt; keine Sync-/Produktionsfreigabe. Nicht mit KRONOS 01 verwechseln. |
| KI-Arbeitsplatz | [mouzzlii/KI-Arbeitsplatz](https://github.com/mouzzlii/KI-Arbeitsplatz) | Zentrales Agent-/Koordinationsziel. GitHub-main enthält beim Audit nur das v1.0.0-ZIP und .github; kein editierbarer Quellbaum oder funktionierender Android-Agent nachgewiesen. |
| Menschheitsfamilie | [mouzzlii/Gemeinwohl](https://github.com/mouzzlii/Gemeinwohl) | Eigenständige Community-Konzeption; Repo enthält derzeit ZIP-Artefakt, kein verifizierter vollständiger Quellbaum. Daten-/Berechtigungsgrenzen zu KREISLAUF bleiben getrennt. |

Weitere Konzept- und Forschungsstränge (KRONOS 01, KREISLAUF ReFlex/VacMail, VR-SCENT, KREISLAUF AIRLESS und Implosionsmotor) sind in der Projektbaseline aufgeführt. Vertrauliche technische Erfindungsdetails gehören nicht in dieses öffentliche Repository.

## KI-Team und externe Provider

- **Ziel:** ChatGPT koordiniert; Claude, Gemini, OpenAI/GPT und Grok sollen nachweislich unabhängig arbeiten und einander prüfen. Llama bleibt bis zu einer gesonderten EU-Datenschutzprüfung ausgeschlossen.
- **Aktiver KREISLAUF-`main`-Relay:** Issue #11 startet derzeit GPT (direkt), Claude (direkt), wahlweise Meta Muse oder Llama (direkt) und anschließend GPT-Synthese. Gemini und Grok sind im aktiven Relay nicht eingebunden. Dieser Main-Aufrufweg ist von PR #60 getrennt.
- **Aktueller Gateway-Kandidat – Draft PR #60:** Branch `ai/chatgpt-council-clean-integration`, Head `ad9b4ddef95d78ae076a3b9fb4f2f290efe40715`, GitHub `mergeable=true`. Relay-CI [46034038607](https://github.com/mouzzlii/Kreislauf/actions/runs/46034038607): 45/45 Tests bestanden. KREISLAUF Build [46034038442](https://github.com/mouzzlii/Kreislauf/actions/runs/46034038442): 245 JavaScript- und 79 TypeScript-Tests, TypeScript-Prüfung, Qualitätsprüfung und Produktions-Build erfolgreich; 6 ESLint-Warnungen, 0 Fehler. PR bleibt Draft.
- **Sicherheitsumfang PR #60:** Vier fest allowlistete Gateway-Aliase (GPT, Claude, Gemini, Grok); Public-only-Quellschutz vor README-/Tree-/Dateizugriff; freie Debattenaufträge verlangen `[public]`, `[synthetic]` oder `[anonymized]`; strukturierte Task-Envelope-, Pfad-, Commit-Pin- und Idempotenzprüfung; Laufzeit-/UTF-8-Eingabe-/Ausgabelimits; fehlende Task-Quelltexte führen fail-closed zum Abbruch. Live-Workflow hat zwei unabhängige Sperren: `false &&` im Workflow und `RELAY_LIVE_ENABLED = false` im Programm; das Programm beendet sich vor Event-Lesen und Netzwerkaktivität. Keine echten Provideraufrufe, Providerantworten oder Kosten.
- **Historischer Draft PR #38:** Durch PR #60 ersetzt; stark divergierter Branch, GitHub meldet `mergeable=false`. PR #38 nicht mergen; er bleibt vorerst als Audit-Historie offen.
- **Weitere Lücken PR #60:** Tatsächliche Provider-/Modell-/Endpoint-/Request-ID-Metadaten, harter monetärer Kostenstopp und unabhängige Peer-Review-Runde nach den Erstanalysen sind noch nicht nachgewiesen. Vercel-Preview bleibt wegen `build-rate-limit` blockiert; keine Upgrades/Retry.
- **Integrationsstatus:** PR #60 ist nicht in `main` integriert. Unabhängige Code-/Security-Review und Vercel-Preview-/Auth-Abnahme bleiben offen. Zusatzbudget bleibt 0 EUR; keine Live-Inferenz.
- **Gateway-Konfiguration:** Fünf aktive Vercel-Aliase für GPT-5, Claude Sonnet 4.6, Gemini 3 Flash, Grok 4.7 und Llama 4 Maverick sind read-only bestätigt. Alle führen ZDR und No-Prompt-Training. Nur Claude ist explizit auf EU-Bedrock/Vertex-Routen beschränkt; Llama bleibt auf öffentliche, synthetische oder anonymisierte Daten begrenzt.
- **Credentials:** `AI_GATEWAY_API_KEY` liegt im Vercel-Projekt nur für Preview/Development und wird nicht automatisch an GitHub Actions weitergereicht. Keine Secrets ausgelesen oder verändert.
- **Kosten:** Gateway-Projektbudget 5 USD/Monat, zuletzt 0 USD Verbrauch und 0 Requests im Sieben-Tage-Fenster. Dieses Budget ist ein Soft Cap. MAINPROMPT 2.0.7 setzt Zusatzbudget weiterhin auf 0 EUR; keine kostenpflichtigen Inferenzaufrufe ohne ausdrückliche Freigabe und harte anwendungsseitige Kostenkontrolle.
- **KI-Arbeitsplatz PR #12:** Lokale PWA-Mock-Workbench und isolierte serverseitige Orchestrierungs-/HTTP-Bausteine sind im Draft-Branch vorhanden. Aktueller Head `8498028a621126382e74044d5f586b028f4e18e1`, 18 geänderte Dateien; 106 Commits voraus und 38 zurück, `mergeable=false`. Quellstand: 22 Orchestrator- und 16 HTTP-Fälle, für den exakten Head ohne nachgewiesenen Actions-Lauf. `budget_settlement_failed` wird neu mit HTTP 503 behandelt. Vercel meldet `api-deployments-free-per-day` (>100 Deployments/24 h). Es fehlen persistente transaktionale Budget-/Recovery-/Usage-Dienste, eine deploybare Route, echte Auth-/CSRF-/Freigabe-/Audit-Dienste, Provideradapter und ChatGPT-Synthese.
- **Status:** Keine echten Provider-Aufrufe, keine unabhängigen externen Modellantworten und kein nachgewiesener Council-Durchlauf. Keine Inferenzkosten, keine Budgetänderung.
- **Nachweise:** [Council Live Status](COUNCIL_LIVE_STATUS.md), [Council Setup](../AI_TEAM_SETUP.md), [Projektbaseline](CHAT-PROJECT-BASELINE.md) und [MAINPROMPT 2.0.7](https://github.com/mouzzlii/KI-Arbeitsplatz/blob/main/docs/MAINPROMPT.md).

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
