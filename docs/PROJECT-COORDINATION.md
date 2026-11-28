# Gemeinsame Projektsteuerung

**Stand:** 27.11.2026

Diese Datei ist die kurze operative Koordinationsseite für die Projektfamilie. Die globale Arbeitsverfassung ist ausschließlich [MAINPROMPT 2.2.0](https://github.com/mouzzlii/KI-Arbeitsplatz/blob/main/docs/MAINPROMPT.md). Die chatbasierte Projekt- und Entscheidungsreferenz liegt in [CHAT-PROJECT-BASELINE.md](CHAT-PROJECT-BASELINE.md); sie bündelt bestätigte Ziele, Repository-Zuordnungen, Statusgrenzen und offene Punkte. Die folgenden Regeln sind zusätzliche Projektfamilien-Vorgaben, keine zweite globale Arbeitsverfassung.

## Zusätzliche Projektfamilien-Regeln

Die globale Arbeitsweise, GitHub-Schutzregeln, Kosten-/Freigabegrenzen, Sicherheits- und Teststatussprache stehen im MAINPROMPT 2.2.0. Für diese Projektfamilie gelten ergänzend:
- Keine parallelen Änderungen an denselben Dateien ohne Abstimmung; TRAKUNA bearbeitet genau ein priorisiertes Ticket gleichzeitig.
- KREISLAUF–Menschheitsfamilie ist ein gemeinsames Produkt mit einem kanonischen Repository. Innerhalb der Plattform bleiben regionale Daten-, Rollen-, Fonds- und Moderationsgrenzen erhalten. TRAKUNA, SCAN-PROFIT, INSERAT-PROFI AI und CHRONOS bleiben eigenständige Projekte.
- Projektübergreifende Module erst nach eigenständigen Tests, Sicherheitsprüfung und belegtem Wiederverwendungsnutzen übernehmen.
- Für TRAKUNA bleiben echte Carrier-Buchungen, Labelkäufe und verbindliche Auftragsübermittlungen bis zur jeweiligen Betreiber-/Carrier-Freigabe gesperrt.
- Für KREISLAUF–Menschheitsfamilie bleiben echte Nutzerkonten, produktive Punkte-/Treuhandvorgänge und externe Transaktionen bis zur gesonderten Abnahme und Freigabe gesperrt. Das historische Repository Gemeinwohl wird nicht parallel weiterentwickelt, gelöscht oder archiviert, bevor sein Inhalt geprüft und gesichert ist.

## Operative Projektübersicht

| Projekt | Kanonische Quelle | Aktueller bestätigter Fokus / Grenze |
|---|---|---|
| TRAKUNA | [Android-App](https://github.com/mouzzlii/Fuck) · [Gateway](https://github.com/mouzzlii/multi-carrier-gateway) | Smartphone, ein Drucker, WLAN + Bluetooth, alle acht Carrier-Profile. Gateway PR #4 und App PR #25/#33 sind offen; keine reale Drucker-/Carrier-Abnahme. Gateway PR #5 aktualisierte am 26.11.2026 die Gateway-main-Dokumentation. |
| KREISLAUF – Menschheitsfamilie | [Kanonisches Produkt-/Code-Repository](https://github.com/mouzzlii/Kreislauf) · [historische Konzeptquelle](https://github.com/mouzzlii/Gemeinwohl) | Ein gemeinsames Produkt: KREISLAUF als technischer Anker, Menschheitsfamilie als Gemeinschaftsvision; Yspertal/B36 als Pilotregion. Konsolidierte Baseline: [PROJECT_BASELINE.md](KREISLAUF-MENSCHHEITSFAMILIE/PROJECT_BASELINE.md). Demo-/Preview-Funktionen nicht als Main-/Produktionsabnahme ausgeben; Supabase ist nicht automatisch angebunden. |
| SCAN-PROFIT | [mouzzlii/SCAN-PROFIT](https://github.com/mouzzlii/SCAN-PROFIT) | Version 2.0.66; Release-Dokumentation belegt 155/155 Tests und Vercel READY für den dokumentierten Commit. Direkte aktuelle HTTP-Prüfung und Android-Praxistest bleiben offen. |
| INSERAT-PROFI AI | [mouzzlii/INSERAT-PROFI-AI](https://github.com/mouzzlii/INSERAT-PROFI-AI) | Eigenständige Next.js-PWA; lokale Foto-/Entwurfsverwaltung und optionale serverseitige KI. Keine automatische willhaben-Veröffentlichung oder bestätigte Import-API. |
| CHRONOS | [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS) | Privates lokales Fotoarchiv, Milestone 0.5. Desktop und Android getrennt; keine Sync-/Produktionsfreigabe. Nicht mit KRONOS 01 verwechseln. |
| KI-Arbeitsplatz | [mouzzlii/KI-Arbeitsplatz](https://github.com/mouzzlii/KI-Arbeitsplatz) | Zentrales Agent-/Koordinationsziel. GitHub-main enthält beim Audit nur das v1.0.0-ZIP und .github; kein editierbarer Quellbaum oder funktionierender Android-Agent nachgewiesen. |


Weitere Konzept- und Forschungsstränge (KRONOS 01, KREISLAUF ReFlex/VacMail, VR-SCENT, KREISLAUF AIRLESS und Implosionsmotor) sind in der Projektbaseline aufgeführt. Vertrauliche technische Erfindungsdetails gehören nicht in dieses öffentliche Repository.

## KI-Team und externe Provider

- **Ziel:** ChatGPT koordiniert; Claude, Gemini, OpenAI/GPT und Grok sollen nachweislich unabhängig arbeiten und einander prüfen. Llama bleibt bis zu einer gesonderten EU-Datenschutzprüfung ausgeschlossen.
- **Aktiver KREISLAUF-`main`-Relay:** Issue #11 startet derzeit GPT (direkt), Claude (direkt), wahlweise Meta Muse oder Llama (direkt) und anschließend GPT-Synthese. Gemini und Grok sind im aktiven Relay nicht eingebunden.
- **Gateway-Entwicklung in Draft PR #38:** Exakter CI-Head `1e7abcc03021d6276a8ed947a1877646a367e808`; Relay-CI Run [46030025648](https://github.com/mouzzlii/Kreislauf/actions/runs/46030025648) erfolgreich, zehn Job-Schritte grün. Nur synthetische Vertragstests, keine Live-Inferenz.
- **Sicherheitsblocker PR #38:** Der frühere Entwurf erlaubte private `internal`-Quelltexte an GPT, Claude, Gemini und Grok. Im aktuellen Draft-Branch wurde dies technisch korrigiert: nur öffentliches Repository und `public`/`synthetic`/`anonymized` sind zulässig; private, interne und unbekannte Sichtbarkeit wird vor Quelltextzugriff fail-closed abgewiesen. Diese Korrektur ist nicht in `main` gemergt. Der strukturierte Eingang bleibt bis zur kontrollierten Integration und erneuten Prüfung deaktiviert; keine privaten Projektquellen an unbestätigte Provider-/Region-Routen senden.
- **Weitere Lücken:** Das Relay speichert nur Antworttexte, nicht die tatsächliche Provider-/Modell-/Endpoint-/Request-Identität; es gibt keine harte monetäre Kostenobergrenze oder atomare Budgetreservierung. Erstanalysen laufen nacheinander; eine eigenständige Peer-Review-Runde fehlt.
- **Integrationsstatus:** PR #38 bleibt Draft/ungemergt; gegenüber `main` divergiert (Merge-Base `71fb0e07740150be13d40b1aef10ba269fe264b8`); Ahead-/Behind-Zahlen ändern sich mit jedem Main-Commit und sind unmittelbar vor einer Konsolidierung neu zu prüfen. GitHub meldete zuletzt `mergeable=false`. Vercel-Preview wegen `build-rate-limit` fehlgeschlagen. Keine Integration ohne kontrollierte Konsolidierung und erneute Prüfung.
- **Gateway-Konfiguration:** Fünf aktive Vercel-Aliase für GPT-5, Claude Sonnet 4.6, Gemini 3 Flash, Grok 4.7 und Llama 4 Maverick sind read-only bestätigt. Alle führen ZDR und No-Prompt-Training. Nur Claude ist explizit auf EU-Bedrock/Vertex-Routen beschränkt; Llama bleibt auf öffentliche, synthetische oder anonymisierte Daten begrenzt.
- **Credentials:** `AI_GATEWAY_API_KEY` liegt im Vercel-Projekt nur für Preview/Development und wird nicht automatisch an GitHub Actions weitergereicht. Keine Secrets ausgelesen oder verändert.
- **Kosten:** Gateway-Projektbudget 5 USD/Monat, zuletzt 0 USD Verbrauch und 0 Requests im Sieben-Tage-Fenster. Dieses Budget ist ein Soft Cap. MAINPROMPT 2.2.0 setzt Zusatzbudget weiterhin auf 0 EUR; keine kostenpflichtigen Inferenzaufrufe ohne ausdrückliche Freigabe und harte anwendungsseitige Kostenkontrolle.
- **KI-Arbeitsplatz PR #12:** Lokale PWA-Mock-Workbench und isolierte serverseitige Orchestrierungs-/HTTP-Bausteine sind im Draft-Branch vorhanden. Aktueller Head `8498028a621126382e74044d5f586b028f4e18e1`, 18 geänderte Dateien; 106 Commits voraus und 38 zurück, `mergeable=false`. Quellstand: 22 Orchestrator- und 16 HTTP-Fälle, für den exakten Head ohne nachgewiesenen Actions-Lauf. `budget_settlement_failed` wird neu mit HTTP 503 behandelt. Vercel meldet `api-deployments-free-per-day` (>100 Deployments/24 h). Es fehlen persistente transaktionale Budget-/Recovery-/Usage-Dienste, eine deploybare Route, echte Auth-/CSRF-/Freigabe-/Audit-Dienste, Provideradapter und ChatGPT-Synthese.
- **Status:** Keine echten Provider-Aufrufe, keine unabhängigen externen Modellantworten und kein nachgewiesener Council-Durchlauf. Keine Inferenzkosten, keine Budgetänderung.
- **Nachweise:** [Council Live Status](COUNCIL_LIVE_STATUS.md), [Council Setup](../AI_TEAM_SETUP.md), [Projektbaseline](CHAT-PROJECT-BASELINE.md) und [MAINPROMPT 2.2.0](https://github.com/mouzzlii/KI-Arbeitsplatz/blob/main/docs/MAINPROMPT.md).

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
