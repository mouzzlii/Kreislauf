# Gemeinsame Projektsteuerung

**Stand:** 26.11.2026

Diese Datei ist die kurze operative Koordinationsseite. Die chatbasierte Projekt- und Entscheidungsreferenz liegt in [CHAT-PROJECT-BASELINE.md](CHAT-PROJECT-BASELINE.md). Dort sind die bestätigten Ziele, Repository-Zuordnungen, Statusgrenzen und offenen Punkte der Projektfamilie zusammengeführt.

## Gemeinsame Regeln

- Neueste ausdrücklich bestätigte Nutzerentscheidung hat Vorrang vor älteren Annahmen.
- GitHub-main bleibt unverändert, wenn die Dokumentation aktuell ist. Veraltete oder fehlende bestätigte Entscheidungen werden kontrolliert über Branch und PR aktualisiert.
- Vor jeder Änderung aktuellen Stand, Projektanweisungen, offene PRs/Issues und CI lesen.
- Keine parallelen Änderungen an denselben Dateien ohne Abstimmung; TRAKUNA bearbeitet genau ein priorisiertes Ticket gleichzeitig.
- Nach jeder Änderung passende Tests ausführen und Ergebnisse mit exakter Commit-SHA dokumentieren.
- Keine Secrets, Zugangsdaten, Kundendaten, privaten Fotos oder Produktionsdaten committen.
- Keine kostenpflichtigen Provider-Aufrufe, API-Nutzung, produktiven Buchungen oder Deployments ohne ausdrückliche Kosten-/Aktionsfreigabe.
- Bestehende Open-Source-/Kommerziellösungen vor Eigenentwicklung prüfen; Lizenz, Sicherheit, Wartbarkeit und Android-Kompatibilität bewerten.
- Projektübergreifende Module erst nach eigenständigen Tests und Sicherheitsprüfung wiederverwenden.
- Code vorhanden, CI erfolgreich, reales Gerät getestet, externer Anbieter integriert und produktionsbereit sind getrennte Status.

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

- Gewünschte Rollenfolge: ChatGPT koordiniert; Claude und Meta/Llama sollen unabhängig entwickeln und prüfen.
- Nur tatsächlich ausgeführte API-/MCP-Aufrufe und empfangene Antworten als Council-Arbeit ausgeben.
- Eine vorhandene Relay-Basis ist nicht gleichbedeutend mit einem aktivierten Council. Provider-Secrets, Modellkennungen, sichere Endpunkte, echte Ausgabenlimits und ausdrückliche Budgetfreigabe sind Voraussetzungen.
- Ohne echte Provider-Aufrufe keine unabhängigen Claude-/Meta-/Llama-Reviews behaupten.
- Keine Zugangsdaten im Chat oder Repository ablegen.

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
