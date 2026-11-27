# KI-Council – Live- und Integrationsstatus

**Letzte Prüfung:** 27.11.2026  
**Zweck:** Nachweisbare Übersicht der tatsächlich verfügbaren Council-Instanzen und Verbindungen. Keine Zugangsdaten, Tokens oder Secrets eintragen.

| Instanz | Vorgesehene Aufgabe | Verbindungsstatus bei letzter Prüfung | Tatsächlicher Nachweis / Blocker |
|---|---|---|---|
| ChatGPT | Leitung, Koordination, Synthese, Qualitätskontrolle | Verfügbar in dieser Sitzung | GitHub-Verbindung wurde am 27.11.2026 für tatsächliche Repository-Lese- und Schreibvorgänge verwendet; dies ist keine externe Modell-Inferenz |
| Claude | Unabhängige Analyse, alternative Lösungen, Gegenprüfung | Vercel-AI-Gateway-Alias aktiv; Live-Inferenz nicht nachgewiesen | `vmc/council-claude` → `anthropic/claude-sonnet-4.6`; Alias-Konfiguration erlaubt ausschließlich Bedrock/Vertex Anthropic in EU-Zone und deklariert Zero Data Retention sowie kein Prompt-Training. Kein Inferenzaufruf in dieser Sitzung; keine Antwort empfangen |
| Meta/Llama | Alternative Lösungsentwicklung, Red-Team und Gegenprüfung | Vercel-AI-Gateway-Alias aktiv; EU-Verarbeitung und Live-Inferenz nicht nachgewiesen | `vmc/council-llama` → `meta/llama-4-maverick`; Provider auf Bedrock beschränkt, aber keine EU-Inferenzregion konfiguriert. Nur öffentliche, synthetische oder anonymisierte Daten; kein Inferenzaufruf |
| Python-KI | Programmierung, Codeanalyse, Datenanalyse, Tests | Eigenständige KI-Integration nicht nachgewiesen | Die verfügbare Python-Laufzeit ist ein Werkzeug zur Codeausführung, keine nachgewiesene eigenständige KI-Instanz |
| Lokaler PC / Offline-Node | Offline-Ausführung, Builds, Tests, Backups, Dokumentation | Nicht erreichbar/nicht live geprüft | Frühere Notiz: Windows OpenSSH-Dienst war gestoppt; aktueller Zustand muss bei realem Zugriff neu geprüft werden |
| Weitere Tools/Agenten | Aufgabenbezogene Spezialarbeit | Jeweils einzeln zu prüfen | Nur tatsächlich verfügbare und autorisierte Integrationen verwenden |


**Prüfgrenze 27.11.2026:** Die aktuelle Tool-Inventur ergab keine direkte Claude-, Meta-Muse- oder Llama-Inferenzaktion. Vercel-Modellkataloge, Aliase oder Konfigurationsdaten sind kein Live-Aufrufnachweis. Es wurden keine Provider-API-Aufrufe, keine Secrets und keine kostenpflichtigen Inferenzaufrufe ausgelöst.

**Zusätzlicher Read-only-Audit des Vercel AI Gateway (27.11.2026):** Fünf aktive Virtual-Model-Aliase wurden tatsächlich ausgelesen: `council-claude` (Claude Sonnet 4.6), `council-gemini` (Gemini 3 Flash), `council-gpt` (GPT-5), `council-grok` (Grok 4.7) und `council-llama` (Llama 4 Maverick). Für alle fünf Aliase sind Zero Data Retention und `disallowPromptTraining` gesetzt. Nur beim Claude-Alias ist eine EU-Zone ausdrücklich konfiguriert (Bedrock und Vertex Anthropic); beim Llama-Alias ist ausschließlich Bedrock zugelassen, jedoch ohne bestätigte EU-Region. Bei Gemini, GPT und Grok ist in der ausgelesenen Alias-Konfiguration keine explizite EU-Inferenzregion dokumentiert. Diese Einstellungen sind Konfigurationsnachweise, keine Anbieterzertifizierung und kein Beweis, dass eine konkrete Anfrage über den gewünschten Provider gelaufen wäre.

Die Vercel-Usage-Abfrage für die letzten sieben Tage (20.–27.11.2026 UTC) lieferte keine Nutzungszeilen. Ein bestehendes projektbezogenes AI-Gateway-Budget zeigt 5 USD monatlich und 0 USD aktuelle Nutzung; es ist keine Freigabe für Kosten und ersetzt nicht das Nutzerlimit von 0 EUR Zusatzbudget. Es wurden keine API-Keys erstellt, keine Regeln/Aliase/Budgets geändert und keine Modellanfragen gesendet. Die aktuelle ChatGPT-Werkzeugliste enthält Verwaltungs-/Katalogaktionen, aber keine direkte AI-Gateway-Inferenzaktion. Daher bleibt Live-Council nicht verfügbar/nicht nachgewiesen.

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
