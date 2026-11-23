# Gemeinsame Projektsteuerung

Stand: 2026-11-24

Dieses Dokument koordiniert die vier Entwicklungsprojekte. Es ersetzt keine projektspezifischen Anforderungen, Tests oder Betreiberfreigaben. Statusangaben unterscheiden strikt zwischen vorhandenem Code, automatisierten Prüfungen, externen Tests und Produktionsfreigabe.

## Gemeinsame Regeln

- GitHub ist die verbindliche Quelle für eingecheckten Code und dokumentierte Entscheidungen.
- Änderungen erfolgen grundsätzlich auf Aufgaben-Branches und werden über Pull Requests integriert.
- Keine parallelen Änderungen an denselben Dateien ohne vorherige Abstimmung.
- Vor jeder Änderung: aktuellen Stand, README, Projektanweisungen, offene Issues und CI lesen.
- Nach jeder Änderung: passende Tests ausführen und Ergebnisse samt Commit-SHA dokumentieren.
- Keine Zugangsdaten, Kundendaten, privaten Fotos, Produktionsdatenbanken oder echten `.env`-Dateien committen.
- Externe Dienste gelten erst nach erfolgreicher Integration und echtem Ende-zu-Ende-Test als einsatzbereit.
- Ein grüner CI-Lauf beweist nur die darin ausgeführten automatisierten Prüfungen, nicht die Produktionsreife.
- Keine kostenpflichtigen Provider-Aufrufe, produktiven Buchungen oder externen Freigaben ohne ausdrückliche Autorisierung.

## Projektübersicht

| Projekt | Quellcode / Repository | Verifizierter Stand und offene Grenzen |
|---|---|---|
| **TRAKUNA** | Architektur/Koordination: [mouzzlii/multi-carrier-gateway](https://github.com/mouzzlii/multi-carrier-gateway). Aktuelle Android-App: [mouzzlii/Fuck](https://github.com/mouzzlii/Fuck). | Android-Version 1.53 (versionCode 54). CI-Lauf 45290269045 erfolgreich: Unit-Tests, Lint, Manifestprüfung und Debug-APK-Build; Debug-Artefakt erzeugt. Emulator-Instrumentierung ist derzeit nicht Teil des erfolgreichen Standard-CI-Laufs. Echte Geräteprüfung offen. Hermes ist für den vorgesehenen Paketshop Pflicht, aber noch nicht produktiv integriert; offizielle Betreiberfreigabe, API-Zugang und Testkonto fehlen. Keine echten Carrier-Buchungen/Labels/Retouren behaupten. |
| **SCAN-PROFIT** | [mouzzlii/SCAN-PROFIT](https://github.com/mouzzlii/SCAN-PROFIT) | Statische PWA-Basis im Repository; aktueller Release-Stand 2.0.66. CI auf main erfolgreich. Das separate Prüfpaket 2.0.65 wurde lokal mit 155 Tests, statischem Build, Smoke-Test und JavaScript-Syntaxprüfung verifiziert. Das vollständige Prüf-/Quellpaket liegt als ZIP-Artefakt vor, ist aber noch nicht vollständig als editierbarer Quellbaum in GitHub versioniert. Vercel meldet die Produktionsalias-Deployment-Version auf Commit bf6af8 als READY; sie liegt hinter dem neueren main-Stand. Neueste Version muss noch über Vercel neu bereitgestellt werden. |
| **KREISLAUF** | [mouzzlii/Kreislauf](https://github.com/mouzzlii/Kreislauf) | Main enthält die Vite/Nitro-Entwicklungsbasis und eine lokale Demo-Konfiguration mit deaktivierter Authentifizierung; Build-/Test-CI erfolgreich. Ein separater Browser-Preview-Branch `demo/local-auth-off` ist bei Vercel READY und SSO-geschützt. Er enthält erweiterte inseratgebundene Nachrichten- und Community-Treuhand-Demoabläufe, nutzt aber einen gemeinsamen Demo-Nutzer und flüchtige Entwicklungsdaten. Direkter Tausch/kombinierte Angebote sind noch nicht vollständig umgesetzt. Keine produktive ID-Austria-Verbindung, Moderation oder öffentliche Datenhaltung abgenommen. Der KI-Team-Relay ist in main integriert, bleibt bis zur Konfiguration der Provider-Secrets, Modellkennungen, Anbieter-Ausgabenlimits und ausdrücklichen Budgetfreigabe gesperrt. |
| **CHRONOS** | [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS) | Lokaler Desktop-/Android-Prototyp; Haupt-CI erfolgreich. Paginierte Ansicht exakter Duplikatgruppen und weitere UX-/Fehlerbehandlungsverbesserungen sind integriert. PR #41 ergänzt Android-Room-Instrumentierungstests und läuft noch. Echte Gerätevalidierung, sehr große Fotobibliotheken, Wiederherstellung nach Stromausfall, verschlüsselte Backups/Restore und belastbare Sync-/Mehrgeräteprüfung bleiben offen. API ist lokal begrenzt; kein öffentlicher Mehrbenutzerbetrieb freigegeben. |

## KI-Team-Zusammenarbeit

- Die GitHub-Relay-Implementierung ist in KREISLAUF `main` integriert.
- Der Relay lädt begrenzten, read-only Projektkontext. Für TRAKUNA werden Architektur- und Android-Quellrepository gemeinsam berücksichtigt.
- Der Relay führt keine Codeänderungen, Merges oder Deployments aus.
- Es wurden in dieser Arbeit keine Gemini-/Grok-Provider-Aufrufe durchgeführt. Die externe KI-zu-KI-Kommunikation ist technisch vorbereitet, aber nicht Ende-zu-Ende freigegeben.
- Aktivierung erst nach Einrichtung der drei Provider-Secrets, gültiger Modellkennungen, eines read-only GitHub-Tokens, tatsächlicher Provider-Ausgabenlimits und ausdrücklicher Budgetbestätigung.

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
