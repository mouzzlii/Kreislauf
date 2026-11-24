# KREISLAUF – Regionales Tauschsystem Yspertal

**Ziel:** Menschen, Vereine, Schulen und Betriebe im Yspertal und entlang der B36 verbinden – durch Tauschen, Teilen, Helfen und ein transparentes Gemeinschaftsguthaben.

## Aktueller Stand

**Status: Demo / Entwicklungsstand**

KREISLAUF ist eine funktionsfähige Entwicklungsbasis, aber noch keine öffentlich freigegebene Produktionsplattform. Die GitHub-Build- und Testprüfungen laufen erfolgreich. Reale Nutzerkonten, Identitätsprüfung, produktive Datenhaltung, Moderationsabläufe und ein vollständiger Ende-zu-Ende-Test sind noch nicht als öffentlicher Betrieb abgenommen.

## Was bereits im Projekt enthalten ist

- Regionaler Marktplatz mit **Biete**, **Suche** und **Verschenke**
- Kategorien für Güter, Dienstleistungen und gemeinsames Nutzen
- Inserate erstellen, ansehen und Detailseiten öffnen
- Regionale Kartenansicht mit Angeboten in der Nähe
- Karma-Guthaben mit unveränderlichem Ledger
- Gemeinschaftsmechanik gegen dauerhaftes Stillliegen: derzeit 0,5 % pro stillen Monat; Karma wird dabei nicht an andere Personen übertragen
- Profile, Bewertungen und Vertrauensanzeige
- Direkter und kombinierter Tausch mit konkreter Gegenleistung, optionalem Karma-Ausgleich und beidseitiger Abschlussbestätigung
- Inseratgebundene Nachrichten mit zentralem Posteingang unter `/nachrichten`; Tauschschritte erzeugen Systemnachrichten im passenden Gespräch
- Moderations-Posteingang unter `/moderation` und unabhängige regionale Schlichtung mit sieben zugeteilten Personen, mindestens vier Stimmen und Zweidrittelmehrheit
- Zusätzliche hochwertige Treuhand-/Sharing-Demo mit Community-Abstimmungen ist weiterhin getrennt im Preview-Branch; sie ist noch nicht in Main integriert oder produktiv abgenommen
- Responsive Oberfläche mit Waldgrün-/Naturfarbwelt
- Lokale PGlite-Datenbank als Entwicklungsstandard; Neon kann über `DATABASE_URL` angebunden werden
- **Datenbankhinweis:** Der aktuelle App-Code nutzt PGlite oder Neon/Postgres über `DATABASE_URL`. Die vorhandenen Supabase-Projekte sind aktuell nicht automatisch mit der Anwendung verbunden. Vor einer Supabase-Nutzung müssen Verbindung, Migration-Drift und Auth-Schema ausdrücklich eingerichtet und geprüft werden.

## Demo starten

Voraussetzungen: Node.js 22 oder neuer und npm.

```bash
npm install
npm run dev
```

Danach im Browser `http://localhost:8080` öffnen.

### Browser-Preview zum Testen

[**KREISLAUF-Demo im Browser öffnen**](https://grok-workspace-git-demo-local-auth-off-kreislauf.vercel.app/)

Diese Vorschau basiert auf dem nicht gemergten Branch `demo/local-auth-off`. Sie enthält den zentralen Nachrichten-Posteingang (`/nachrichten`), inseratgebundene Chats, den Moderations-Posteingang (`/moderation`) und Community-Treuhand. Vercel meldet die Vorschau als **READY**; wegen aktivierter Vercel-SSO-Schutzfunktion kann eine Anmeldung beim Vercel-Konto erforderlich sein. Sie verwendet einen gemeinsamen Demo-Nutzer und eine flüchtige Entwicklungsdatenbank; Daten können zurückgesetzt werden. Keine echten persönlichen Daten, echten Nutzerkonten oder verbindlichen Tauschvorgänge verwenden. Direkter Tausch und kombinierte Angebote sind in dieser Vorschau noch nicht vollständig umgesetzt.


Die Workspace-Konfiguration `.grok/app-env.json` setzt `VITE_AUTH_ENABLED=false`. Damit läuft die lokale Demo mit einem gemeinsamen Entwicklungsnutzer statt mit echten Konten. Das ist ausschließlich für Entwicklung und Tests gedacht. Für einen Test am Android-Handy können Handy und Entwicklungscomputer im selben WLAN sein; die Adresse des Computers muss dann statt `localhost` verwendet werden. Den Entwicklungsserver nicht öffentlich ins Internet stellen.

## Prüfungen

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

`npm run build` erstellt den Produktions-Build und führt anschließend die Datenbankmigrationen aus. Die CI prüft Build, Authentifizierungsgrenzen und Tests.

## Wichtige Grenzen vor einem öffentlichen Start

- Die lokale Demo-Authentifizierung ist kein Ersatz für echte Nutzerkonten.
- Eine produktive ID-Austria-Identitätsprüfung ist noch nicht nachgewiesen.
- Treuhand-, Buchungs- und Karma-Abläufe benötigen reale Ende-zu-Ende-Tests mit mehreren getrennten Konten.
- Datenbank, Backups, Wiederherstellung, Moderation und Datenschutz müssen für den echten Betrieb eingerichtet und geprüft werden.
- Karma ist ein internes Gemeinschafts-/Aktivitätsguthaben, kein Geld, nicht auszahlbar und keine Zahlungsfunktion.
- Keine echten Zahlungen oder Geldtransfers zwischen Nutzern.

**Sicherheitsregel:** Die lokale Demo mit deaktivierter Authentifizierung darf nicht öffentlich betrieben werden. Vor einem öffentlichen Start müssen Authentifizierung aktiviert, eine geeignete produktive Datenbank und Backups eingerichtet und die Sicherheits-/Datenschutzprüfung abgeschlossen sein.

## Gemeinsame Projektkoordination

Die KI-Team-Koordination für KREISLAUF, TRAKUNA, SCAN-PROFIT und CHRONOS läuft über das zentrale [Koordinations-Issue](https://github.com/mouzzlii/Kreislauf/issues/11). Der sichere Relay ist in `main` integriert: GPT → Claude → dritter Agent (Meta Muse über Meta Model API oder echtes Llama über einen eigenen HTTPS-Inference-Host) → GPT. Er bleibt bis zur Einrichtung der passenden Provider-Secrets, Modellkennungen, Llama-Endpoint bei Bedarf, Anbieter-Ausgabenlimits und ausdrücklichen Budgetfreigabe gesperrt.
