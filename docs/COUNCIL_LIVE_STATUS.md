# KI-Council – Live- und Integrationsstatus

**Letzte Prüfung:** 27.11.2026  
**Zweck:** Nachweisbare Übersicht der tatsächlich verfügbaren Council-Instanzen und Verbindungen. Keine Zugangsdaten, Tokens oder Secrets eintragen.

| Instanz | Vorgesehene Aufgabe | Verbindungsstatus bei letzter Prüfung | Tatsächlicher Nachweis / Blocker |
|---|---|---|---|
| ChatGPT | Leitung, Koordination, Synthese, Qualitätskontrolle | Verfügbar in dieser Sitzung | GitHub-Verbindung wurde am 27.11.2026 für tatsächliche Repository-Lese- und Schreibvorgänge verwendet; dies ist keine externe Modell-Inferenz |
| Gemini | Optionale unabhängige Analyse | Vercel-AI-Gateway-Alias aktiv; EU-Routing und Live-Inferenz nicht nachgewiesen | `vmc/council-gemini` → `google/gemini-3-flash`; Zero Data Retention und kein Prompt-Training in der Alias-Konfiguration gesetzt, aber keine explizite EU-Inferenzregion dokumentiert; kein Inferenzaufruf |
| OpenAI / GPT-Alias | Separater Gateway-Modellalias; nicht mit dem ChatGPT-Sitzungsmodell gleichsetzen | Vercel-AI-Gateway-Alias aktiv; Live-Inferenz nicht nachgewiesen | `vmc/council-gpt` → `openai/gpt-5`; Zero Data Retention und kein Prompt-Training in der Alias-Konfiguration gesetzt, aber keine explizite EU-Inferenzregion dokumentiert; kein Inferenzaufruf |
| Grok | Optionale unabhängige Analyse | Vercel-AI-Gateway-Alias aktiv; EU-Routing und Live-Inferenz nicht nachgewiesen | `vmc/council-grok` → `spacexai/grok-4.7`; Zero Data Retention und kein Prompt-Training in der Alias-Konfiguration gesetzt, aber keine explizite EU-Inferenzregion dokumentiert; kein Inferenzaufruf |
| Claude | Unabhängige Analyse, alternative Lösungen, Gegenprüfung | Vercel-AI-Gateway-Alias aktiv; Live-Inferenz nicht nachgewiesen | `vmc/council-claude` → `anthropic/claude-sonnet-4.6`; Alias-Konfiguration erlaubt ausschließlich Bedrock/Vertex Anthropic in EU-Zone und deklariert Zero Data Retention sowie kein Prompt-Training. Kein Inferenzaufruf in dieser Sitzung; keine Antwort empfangen |
| Meta/Llama | Alternative Lösungsentwicklung, Red-Team und Gegenprüfung | Vercel-AI-Gateway-Alias aktiv; EU-Verarbeitung und Live-Inferenz nicht nachgewiesen | `vmc/council-llama` → `meta/llama-4-maverick`; Provider auf Bedrock beschränkt, aber keine EU-Inferenzregion konfiguriert. Nur öffentliche, synthetische oder anonymisierte Daten; kein Inferenzaufruf |
| Python-KI | Programmierung, Codeanalyse, Datenanalyse, Tests | Eigenständige KI-Integration nicht nachgewiesen | Die verfügbare Python-Laufzeit ist ein Werkzeug zur Codeausführung, keine nachgewiesene eigenständige KI-Instanz |
| Lokaler PC / Offline-Node | Offline-Ausführung, Builds, Tests, Backups, Dokumentation | Nicht erreichbar/nicht live geprüft | Frühere Notiz: Windows OpenSSH-Dienst war gestoppt; aktueller Zustand muss bei realem Zugriff neu geprüft werden |
| Weitere Tools/Agenten | Aufgabenbezogene Spezialarbeit | Jeweils einzeln zu prüfen | Nur tatsächlich verfügbare und autorisierte Integrationen verwenden |


**Prüfgrenze 27.11.2026:** Die aktuelle Tool-Inventur ergab keine direkte Claude-, Meta-Muse- oder Llama-Inferenzaktion. Vercel-Modellkataloge, Aliase oder Konfigurationsdaten sind kein Live-Aufrufnachweis. Es wurden keine Provider-API-Aufrufe, keine Secrets und keine kostenpflichtigen Inferenzaufrufe ausgelöst.

**Zusätzlicher Read-only-Audit des Vercel AI Gateway (27.11.2026):** Fünf aktive Virtual-Model-Aliase wurden tatsächlich ausgelesen: `council-claude` (Claude Sonnet 4.6), `council-gemini` (Gemini 3 Flash), `council-gpt` (GPT-5), `council-grok` (Grok 4.7) und `council-llama` (Llama 4 Maverick). Für alle fünf Aliase sind Zero Data Retention und `disallowPromptTraining` gesetzt. Nur beim Claude-Alias ist eine EU-Zone ausdrücklich konfiguriert (Bedrock und Vertex Anthropic); beim Llama-Alias ist ausschließlich Bedrock zugelassen, jedoch ohne bestätigte EU-Region. Bei Gemini, GPT und Grok ist in der ausgelesenen Alias-Konfiguration keine explizite EU-Inferenzregion dokumentiert. Diese Einstellungen sind Konfigurationsnachweise, keine Anbieterzertifizierung und kein Beweis, dass eine konkrete Anfrage über den gewünschten Provider gelaufen wäre.

Die Vercel-Usage-Abfrage für die letzten sieben Tage (20.–27.11.2026 UTC) lieferte keine Nutzungszeilen. Ein bestehendes projektbezogenes AI-Gateway-Budget zeigt 5 USD monatlich und 0 USD aktuelle Nutzung; es ist keine Freigabe für Kosten und ersetzt nicht das Nutzerlimit von 0 EUR Zusatzbudget. Es sind keine Team- oder Default-Budgets gesetzt. Es wurden keine API-Keys erstellt, keine Regeln/Aliase/Budgets geändert und keine Modellanfragen gesendet. Die aktuelle ChatGPT-Werkzeugliste enthält Verwaltungs-/Katalogaktionen, aber keine direkte AI-Gateway-Inferenzaktion. Daher bleibt Live-Council nicht verfügbar/nicht nachgewiesen.

## Technischer Relay – Main-Stand und offene Gateway-Umstellung (27.11.2026)

- Auf `main` existieren ein GitHub-Actions-Workflow und ein Relay-Skript. Der Workflow reagiert ausschließlich auf einen neuen Kommentar im Issue #11 mit dem Präfix `/ai-team debate `; er ist kein ChatGPT-seitiger direkter Modellaufruf.
- Der Main-Relay ruft laut Quelltext OpenAI Responses API, Anthropic Messages API und genau einen konfigurierten dritten Provider (Meta Muse oder echtes Llama über HTTPS) auf. Unabhängige GPT-Erstanalyse, Claude-Gegenprüfung, dritte Gegenprüfung und GPT-Synthese sind im Ablauf vorgesehen. Das ist implementierter Code, kein Nachweis eines erfolgreichen Live-Durchlaufs.
- Vor Provider-Aufrufen verlangt der Code alle nötigen Secrets und expliziten Modellkennungen sowie `AI_TEAM_BUDGET_CONFIRMED=true`. Diese Variable ist laut Code/Setup nur eine manuelle Bestätigung und prüft Anbieterbudgets nicht automatisch. Das Skript reserviert maximal zwei Debatten pro UTC-Tag vor dem ersten Provider-Aufruf und bricht bei unvollständiger Ledger-Prüfung ab. Keine tatsächliche Geldobergrenze oder aktive Provider-Ausgabenlimits wurden in dieser Prüfung nachgewiesen.
- Die benötigten GitHub-Actions-Secrets/Variablen wurden nicht ausgelesen. Deshalb ist unbekannt, ob sie vollständig eingerichtet sind oder der Workflow einen Live-Aufruf aktuell passieren lassen würde. Keine Testkommentare ausgelöst und keine Provider-Aufrufe vorgenommen.
- PR [#38](https://github.com/mouzzlii/Kreislauf/pull/38) bleibt Draft/offen und `mergeable=false`; sein aktueller Head `d29f2605c35e61a690e06623f019dbcda3aa5daa` enthält eine Gateway-Umstellung auf die Vercel-Aliase. Diese Branch-Implementierung ist nicht in `main` integriert und darf nicht als aktiver Main-Relay ausgegeben werden.
- Ein Read-only-Audit der fünf Gateway-Aliase belegt aktive Konfigurationen, aber keine Provider-Anfragen. Der aktuelle ChatGPT-Werkzeugbestand bietet Verwaltungs-/Katalogaktionen, jedoch keinen direkten AI-Gateway-Inferenzaufruf. Der Nutzer-Kostenrahmen bleibt 0 EUR; es wurde nichts kostenpflichtig ausgelöst.

## Verbindliche Statusbegriffe

- **Geplant:** Rolle oder Verbindung ist vorgesehen, aber nicht eingerichtet/nachgewiesen.
- **Auftrag vorbereitet:** Arbeitsauftrag wurde formuliert, aber nicht versendet.
- **Gesendet:** Auftrag wurde über eine reale Integration erfolgreich übermittelt.
- **Antwort empfangen:** Antwort/Artefakt liegt tatsächlich vor.
- **Unabhängig geprüft:** Ergebnis wurde durch eine andere reale Instanz oder reproduzierbare Tests kritisch geprüft.

Eine Rolle gilt nicht allein durch ihre Erwähnung als verbunden. Ein vorbereiteter Prompt ist keine Delegation. Keine erfundenen Antworten, Reviews, Verbindungen, Builds oder Testergebnisse.

## Sicherheits- und Kostenregeln

- Keine kostenpflichtigen Modell-/API-Aufrufe ohne ausdrückliche Freigabe.
- Keine Secrets, privaten Schlüssel, Tokens oder persönlichen Daten in dieses Protokoll, Prompts, Logs oder Repositories aufnehmen.
- Remote-Zugriff nur mit Schlüsselauthentifizierung, minimalen Rechten, eingeschränkter Firewall-Freigabe und ohne öffentliche SSH-Exposition.
- Offline-Aufträge müssen tatsächlich ohne Internet ausführbar sein; externe Recherche und Provider-Aufrufe sind davon getrennte Arbeitsschritte.
- Nach jeder realen Verbindungsänderung Status, Datum, Berechtigungsumfang, Test und offene Risiken aktualisieren.

## Nächste Integrationsaufgaben

1. Sichere, budgetkonforme echte Claude- und Meta/Llama-Schnittstellen evaluieren; vor jeder Nutzung Kosten und Datenverarbeitung prüfen.
2. Lokalen PC-Zustand und vorhandene Offline-Projektdateien bei erreichbarer, autorisierter Verbindung prüfen.
3. Python-Ausführungsumgebung und eine mögliche eigenständige Python-KI sauber unterscheiden.
4. Ende-zu-Ende-Council-Test mit unabhängig formulierten Lösungen, gegenseitigen Fragen, Gegenprüfung und dokumentierter Synthese durchführen.
