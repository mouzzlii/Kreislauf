# KI-Council – Live- und Integrationsstatus

**Letzte Prüfung:** 26.11.2026  
**Zweck:** Nachweisbare Übersicht der tatsächlich verfügbaren Council-Instanzen und Verbindungen. Keine Zugangsdaten, Tokens oder Secrets eintragen.

| Instanz | Vorgesehene Aufgabe | Verbindungsstatus bei letzter Prüfung | Tatsächlicher Nachweis / Blocker |
|---|---|---|---|
| ChatGPT | Leitung, Koordination, Synthese, Qualitätskontrolle | Verfügbar in dieser Sitzung | GitHub MCP wurde für Dokumentationsänderungen tatsächlich verwendet |
| Claude | Unabhängige Analyse, alternative Lösungen, Gegenprüfung | Nicht live verbunden/nicht nachgewiesen | Keine Claude-Aufrufaktion in den aktuell verfügbaren Integrationen gefunden |
| Meta/Llama | Alternative Lösungsentwicklung, Red-Team und Gegenprüfung | Nicht live verbunden/nicht nachgewiesen | Keine Meta-/Llama-Aufrufaktion in den aktuell verfügbaren Integrationen gefunden |
| Python-KI | Programmierung, Codeanalyse, Datenanalyse, Tests | Eigenständige KI-Integration nicht nachgewiesen | Eine lokale Python-Laufzeit ist nicht automatisch eine unabhängige KI-Instanz |
| Lokaler PC / Offline-Node | Offline-Ausführung, Builds, Tests, Backups, Dokumentation | Nicht erreichbar/nicht live geprüft | Frühere Notiz: Windows OpenSSH-Dienst war gestoppt; aktueller Zustand muss bei realem Zugriff neu geprüft werden |
| Weitere Tools/Agenten | Aufgabenbezogene Spezialarbeit | Jeweils einzeln zu prüfen | Nur tatsächlich verfügbare und autorisierte Integrationen verwenden |

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
