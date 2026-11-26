# KI-Council – Live- und Integrationsstatus

**Letzte Prüfung:** 27.11.2026  
**Zweck:** Nachweisbare Übersicht der tatsächlich verfügbaren Council-Instanzen und Verbindungen. Keine Zugangsdaten, Tokens oder Secrets eintragen.

## Aktueller Kurzstatus

Die Vercel-AI-Gateway-Konfiguration enthält aktive virtuelle Modell-Aliase für Claude, Gemini, GPT, Grok und Llama. Das bestätigt die gespeicherte Routing-Konfiguration, **nicht** einen erfolgreichen Modellaufruf. In dieser Prüfung wurde kein Modell aufgerufen; es liegen daher keine externen Council-Antworten oder unabhängigen Modell-Reviews vor.

| Instanz | Vorgesehene Aufgabe | Technischer Status am 27.11.2026 | Tatsächlicher Nachweis / Grenze |
|---|---|---|---|
| ChatGPT | Leitung, Koordination, Synthese, Qualitätskontrolle | In dieser Sitzung verfügbar | GitHub- und Vercel-MCP-Lese-/Verwaltungswerkzeuge wurden tatsächlich verwendet; keine externen Modellantworten simuliert |
| Claude Sonnet 4.6 | Unabhängige Analyse, Architektur und Gegenprüfung | Gateway-Alias `vmc/council-claude` aktiv; **kein Inferenzaufruf** | Alias zeigt auf `anthropic/claude-sonnet-4.6`; Provider auf AWS Bedrock und Vertex Anthropic beschränkt, EU-Zone gesetzt; ZDR und Prompt-Training-Sperre aktiviert |
| Gemini 3 Flash | Alternative Analyse und Review | Gateway-Alias `vmc/council-gemini` aktiv; **kein Inferenzaufruf** | Alias zeigt auf `google/gemini-3-flash`; ZDR und Prompt-Training-Sperre aktiviert. Keine explizite EU-Region in der gelesenen Konfiguration ausgewiesen |
| GPT-5 | Koordination/zusätzliche unabhängige Perspektive | Gateway-Alias `vmc/council-gpt` aktiv; **kein Inferenzaufruf** | Alias zeigt auf `openai/gpt-5`; ZDR und Prompt-Training-Sperre aktiviert. Keine explizite EU-Region in der gelesenen Konfiguration ausgewiesen |
| Grok 4.7 | Alternative Analyse und Red-Team | Gateway-Alias `vmc/council-grok` aktiv; **kein Inferenzaufruf** | Alias zeigt auf `spacexai/grok-4.7`; ZDR und Prompt-Training-Sperre aktiviert. Keine explizite EU-Region in der gelesenen Konfiguration ausgewiesen |
| Meta/Llama 4 Maverick | Alternative Lösungsentwicklung und Red-Team | Gateway-Alias vorhanden, aber **für vertrauliche Projektarbeit gesperrt** | Keine bestätigte EU-Inferenzregion. Ausschließlich öffentliche, synthetische oder anonymisierte Daten wären vertretbar; in dieser Prüfung nicht aufgerufen |
| Python-KI | Programmierung, Codeanalyse, Datenanalyse, Tests | Eigenständige KI-Integration nicht nachgewiesen | Eine lokale Python-Laufzeit ist nicht automatisch eine unabhängige KI-Instanz |
| Lokaler PC / Offline-Node | Offline-Ausführung, Builds, Tests, Backups, Dokumentation | Nicht erreichbar/nicht live geprüft | Frühere Notiz: Windows OpenSSH-Dienst war gestoppt; aktueller Zustand muss bei realem Zugriff neu geprüft werden |

## Gateway- und Projektprüfung

- Vercel-Team: `Kreislauf`; Council-Projekt: `collective-intelligence-council`.
- Alle fünf virtuellen Aliase werden von Gateway als **active** geführt. Das ist ein Konfigurationsstatus, kein Funktionstest der Provider.
- Für Claude ist die Inferenzregion ausdrücklich auf EU-Zone und auf Bedrock/Vertex Anthropic begrenzt. Bei Gemini, GPT und Grok war in den gelesenen Alias-Konfigurationen keine explizite EU-Region ausgewiesen.
- Die Vercel-Projekt-Einstellung meldet `live: false`; SSO-Schutz ist für alle Deployments aktiviert. Ein aktuelles Deployment mit Zustand `READY` ist vorhanden, aber kein Nachweis eines produktiven, frei erreichbaren oder funktionierenden Council-Endpunkts.
- Die verfügbaren ChatGPT-Werkzeuge bieten Lese-/Verwaltungszugriff auf Gateway-Konfiguration und Nutzungsdaten, aber in dieser Sitzung keine direkte Modell-Inferenzaktion. Im Projekt wurden keine Agent-Runs gefunden.
- Gateway-Nutzungsabfrage für die letzten 30 Tage: keine Usage-Zeilen. Das belegt keine Modellaufrufe in diesem Zeitraum über dieses Projekt.
- Im Projekt ist ein monatliches Gateway-Budget von **5 USD** konfiguriert; der gemeldete aktuelle Verbrauch beträgt **0 USD**. Dieses technische Budget ist keine Ausgabefreigabe. Die geltende Nutzergrenze beträgt **0 EUR**; daher wurden keine kostenpflichtigen Modellaufrufe, API-Keys oder Budgetänderungen vorgenommen.

## Verbindliche Statusbegriffe

- **Geplant:** Rolle oder Verbindung ist vorgesehen, aber nicht eingerichtet/nachgewiesen.
- **Konfiguriert:** Modell-Alias, Routing oder Schnittstelle ist gespeichert; noch kein erfolgreicher Inferenzaufruf belegt.
- **Auftrag vorbereitet:** Arbeitsauftrag wurde formuliert, aber nicht versendet.
- **Gesendet:** Auftrag wurde über eine reale Integration erfolgreich übermittelt.
- **Antwort empfangen:** Antwort/Artefakt liegt tatsächlich vor.
- **Unabhängig geprüft:** Ergebnis wurde durch eine andere reale Instanz oder reproduzierbare Tests kritisch geprüft.

Eine Rolle gilt nicht allein durch ihre Erwähnung oder einen aktiven Modell-Alias als live verbunden. Ein vorbereiteter Prompt ist keine Delegation. Keine erfundenen Antworten, Reviews, Verbindungen, Builds oder Testergebnisse.

## Sicherheits- und Kostenregeln

- Keine kostenpflichtigen Modell-/API-Aufrufe, API-Keys, Budgetänderungen oder kostenpflichtigen Deployments ohne ausdrückliche Kostenfreigabe. Aktuelle Obergrenze: 0 EUR.
- Keine Secrets, privaten Schlüssel, Tokens oder persönlichen Daten in dieses Protokoll, Prompts, Logs oder Repositories aufnehmen.
- Llama nicht mit privaten Projektquellen, Zugangsdaten, persönlichen oder vertraulichen Daten verwenden, solange EU-Verarbeitung nicht nachgewiesen und freigegeben ist.
- Für jeden Provider Datenregion, ZDR, Prompt-Training, Routing und tatsächliche Abrechnung vor Nutzung erneut prüfen; Alias-Konfiguration allein reicht nicht.
- Remote-Zugriff nur mit Schlüsselauthentifizierung, minimalen Rechten, eingeschränkter Firewall-Freigabe und ohne öffentliche SSH-Exposition.
- Offline-Aufträge müssen tatsächlich ohne Internet ausführbar sein; externe Recherche und Provider-Aufrufe sind davon getrennte Arbeitsschritte.
- Nach jeder realen Verbindungsänderung Status, Datum, Berechtigungsumfang, Test und offene Risiken aktualisieren.

## Nächste Integrationsaufgaben

1. Kostenfreie oder bereits gedeckte echte Claude-/Gemini-/GPT-/Grok-Aufrufmöglichkeit finden; vor jeder Ausführung tatsächliche Kostenfreiheit verifizieren. Keine Modellaufrufe bei unklarer Abrechnung.
2. Für Claude die vorhandene EU-beschränkte Provider-Konfiguration und eine serverseitige, geheimnisgeschützte Aufrufstrecke technisch prüfen, ohne Secrets offenzulegen oder einen kostenpflichtigen Aufruf auszulösen.
3. Für Gemini, GPT und Grok eine belastbare Datenregion-/Provider-Einschränkung prüfen, bevor vertrauliche Projektinhalte übertragen werden.
4. Llama erst nach belegter EU-Datenverarbeitung und separater Freigabe für private Projektarbeit aktivieren.
5. Lokalen PC-Zustand und vorhandene Offline-Projektdateien bei erreichbarer, autorisierter Verbindung prüfen.
6. Ende-zu-Ende-Council-Test erst nach verifizierter Kostenfreiheit: unabhängig formulierte Lösungen, gegenseitige Fragen, Gegenprüfung und dokumentierte Synthese.
