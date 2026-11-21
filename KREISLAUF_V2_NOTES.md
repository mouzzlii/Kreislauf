# KREISLAUF v2 – Änderungsübersicht

## Enthalten

- Neue Inseratstypen `sell`, `search`, `gift` inkl. Formular, Marktplatzfilter und Kartenkennzeichnung.
- `gift` setzt serverseitig den Karma-Preis auf 0. Bei erfolgreicher Übergabe erhält die empfangende Person 1 Aktivitäts-Karma.
- Karma wird im UI ausdrücklich als nicht monetäres Gemeinschafts- und Aktivitätsguthaben bezeichnet; es gibt keine Euro-Umrechnung oder Auszahlung.
- Öffentliche Inseratsdaten enthalten nur Ortslabel und auf zwei Dezimalstellen gerundete Kartenkoordinaten. `what3words_address` wird nur über eine autorisierte Serverfunktion an bestätigte Transaktionsparteien ausgegeben.
- Artikelkennung `item_uuid`, `hands_count`, anonyme `item_history`, QR-Code-Ansicht mit Druckfunktion und vorausgefülltes Wieder-Einstellen über die Artikelhistorie.
- Zufällige Moderatorenzuweisung aus der verifizierten, regionalen und innerhalb der letzten 30 Tage aktiven Moderation. Hochwertige Angebote ab 100 Karma werden bis zur Treuhandfreigabe gehalten; Sharing-Buchungen erhalten ebenfalls einen Treuhandfall.
- Profilfelder für Verifikation, Moderationsrang und letzte Aktivität.
- ID-Austria-Mock-Verifikation serverseitig über `ID_AUSTRIA_MOCK_MODE=true` (im Workspace-Startskript für den Testbetrieb gesetzt).

## Neue Migration

`migrations/0003_kreislauf_v2.sql`

Sie wird durch den bestehenden Migrationsmechanismus zusammen mit den vorhandenen Migrationen ausgeführt. Die vorhandene Auth-Struktur wurde nicht geändert.

## Wichtige Grenzen / noch nicht produktionsfertig

- Der Mock-Modus simuliert den Identitätscheck und ist **keine echte ID-Austria-Prüfung**. Die Live-OIDC-/A-Trust-Anbindung ist noch nicht aktiviert. Die benötigten serverseitigen Konfigurationswerte und Sicherheitsanforderungen sind in `docs/ID-AUSTRIA-OIDC.md` dokumentiert. Offizielle Issuer-/Callback-Daten müssen aus dem A-Trust-Onboarding kommen; es wurden keine Endpunkte erfunden.
- Moderator-Ränge werden derzeit nur durch eine vertrauenswürdige Administration in der Datenbank vergeben. Es gibt noch keine Admin-Oberfläche dafür; siehe `docs/MODERATION.md`.
- Der QR-Code führt zur Artikelseite. Das Scannen erfolgt über die Kamera-/QR-Funktion des Telefons; eine In-App-Kamera-Scanner-Oberfläche ist in dieser Version nicht enthalten.
- Die Community-Treuhand unterstützt die Zuweisung und Freigabe. Ein eigenes Streitfall-/Schlichtungsformular ist noch nicht enthalten.

## Prüfung

Die geänderten TypeScript-/TSX-Dateien wurden auf Syntaxfehler geprüft. Ein vollständiger TypeScript-, Build- und Browser-Test konnte in dieser Umgebung nicht abgeschlossen werden, weil die Paketinstallation (`npm ci`) wiederholt in einen Timeout lief und dadurch lokale Build-Abhängigkeiten unvollständig blieben. Es wird daher ausdrücklich kein erfolgreicher Produktionsbuild behauptet.
