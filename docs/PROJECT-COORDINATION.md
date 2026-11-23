# Gemeinsame Projektsteuerung

Stand: 2026-11-23

Dieses Dokument koordiniert die vier derzeit bekannten Entwicklungs-Repositories. Es ersetzt keine projektspezifischen Anforderungen, Tests oder Freigaben.

## Gemeinsame Regeln
- GitHub ist die verbindliche Quelle für eingecheckten Code und dokumentierte Entscheidungen.
- Änderungen erfolgen auf kurzlebigen Aufgaben-Branches; Integration über Pull Requests.
- Keine parallelen Änderungen an denselben Dateien ohne vorherige Abstimmung.
- Vor jeder Änderung: aktuellen Stand, README, Projektanweisungen, offene Issues und CI lesen.
- Nach jeder Änderung: passende Tests ausführen und Ergebnisse samt Commit-SHA dokumentieren.
- Keine Zugangsdaten, Kundendaten, privaten Fotos, Produktionsdatenbanken oder echten .env-Dateien committen.
- Externe Dienste gelten erst nach erfolgreicher Integration und echtem Ende-zu-Ende-Test als einsatzbereit.
- Ein grüner CI-Lauf beweist nur die darin ausgeführten automatisierten Prüfungen, nicht die Produktionsreife.

## Projektübersicht

| Projekt | Repository | Verifizierter Stand / nächster Engpass |
|---|---|---|
| TRAKUNA | https://github.com/mouzzlii/multi-carrier-gateway | Repository enthält derzeit nur ein kurzes README. Vollständiger App-Quellcode fehlt hier. Hermes ist als Pflichtintegration für den vorgesehenen Paketshop noch offen; technische Betreiberfreigabe und Zugangsdaten müssen außerhalb dieses Repos geklärt werden. |
| SCAN-PROFIT | https://github.com/mouzzlii/SCAN-PROFIT | README und Release-Verifikation dokumentieren lokale Tests, weisen aber auf fehlende vollständige Release-Quellen im Repository sowie nicht bestätigte Live-/Android-/Hosting-Prüfungen hin. Vor Produktivfreigabe Quellcode und Release-Artefakte konsistent versionieren und externe Tests durchführen. |
| KREISLAUF | https://github.com/mouzzlii/Kreislauf | Umfangreicher Next/Vite-Projektstand und V2-Archiv vorhanden. Vor Änderungen AGENTS.md, docs, Migrations, package.json und bestehende CI vollständig prüfen; anschließend Build, Tests, mobile UI und Supabase-Konfiguration verifizieren. |
| CHRONOS | https://github.com/mouzzlii/CHRONOS | README beschreibt lokalen Desktop-/Android-Prototyp mit Tests. Noch offen laut README: echte Gerätevalidierung, große Fotobibliotheken, Wiederherstellung nach Stromausfall, Sync, Authentifizierung, Verschlüsselung und Backup/Restore. |

## Abnahme-Gates je Projekt
1. Anforderungen und Nicht-Ziele dokumentiert.
2. Quellcode vollständig und reproduzierbar im Repository.
3. Automatisierte Tests und Produktionsbuild erfolgreich.
4. Sicherheits- und Datenschutzprüfung abgeschlossen.
5. End-to-End-Prüfung auf realistischen Geräten/Umgebungen abgeschlossen.
6. Externe Anbieter-/API-Freigaben und produktive Zugangsdaten rechtmäßig eingerichtet.
7. Wiederherstellung, Backup, Fehlerbehandlung und Monitoring dokumentiert.
8. Release-Artefakt, Installationsanleitung und Rollback-Verfahren erstellt.
9. Offene Einschränkungen transparent dokumentiert; keine kritischen Blocker.

## Zusammenarbeit mit externen KI-Werkzeugen
Andere KI-Werkzeuge können nicht automatisch auf ChatGPT-Konversationen oder diese Verbindung zugreifen. Jedes Werkzeug muss separat mit dem passenden GitHub-Konto und Repository autorisiert werden. Es soll ausschließlich über Branches/PRs beitragen und die Regeln in `.github/AI-COLLABORATION.md` befolgen.

## Statussprache
- **Implementiert:** Code ist vorhanden.
- **Automatisiert geprüft:** konkrete CI-/Testläufe sind erfolgreich.
- **Extern geprüft:** realer Anbieter-/Geräte-/Produktionsablauf wurde tatsächlich getestet.
- **Produktionsbereit:** alle Abnahme-Gates sind erfüllt und die nötigen Betreiberfreigaben liegen vor.

Nie einen dieser Status aus einem anderen ableiten.
