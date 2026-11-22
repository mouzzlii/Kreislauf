# KREISLAUF – Produktionsfreigabe-Checkliste

Stand: 22.11.2026  
Arbeitszweig: `demo/local-auth-off`

Diese Liste trennt eine vorzeigbare Testdemo von einem sicheren Mehrbenutzer-Produktivbetrieb. Ein erfolgreicher Build allein ist keine Produktionsfreigabe.

## Bereits automatisiert geprüft

- [x] Produktions-Build läuft in CI erfolgreich.
- [x] TypeScript-Prüfung läuft erfolgreich.
- [x] Automatisierte Tests laufen erfolgreich (zuletzt bestätigt auf Commit `fb2bbd2b2208456374d76badb2cab0ccf830c727`; CI-Lauf 45051029698).
- [x] Lint läuft erfolgreich.
- [x] Abhängigkeiten werden auf bekannte Sicherheitslücken geprüft.
- [x] Produktions-Build wird blockiert, wenn PostgreSQL-, Better-Auth-, eigener OAuth-Broker- oder Medien-Storage-Konfiguration fehlt.
- [x] Produktions-Build wird blockiert, wenn der ID-Austria-Demomodus aktiv ist.
- [x] Video-Referenzen werden serverseitig abgewiesen, solange kein Upload mit echter serverseitiger Medienprüfung existiert.
- [x] Wiederverwendung bestehender Inseratfotos ist auf HTTPS-Vercel-Blob-Adressen im persönlichen Nutzerpfad beschränkt; automatisierte Tests decken fremde Nutzer, falsche Hosts und manipulierte URLs ab.
- [x] Datenbankmigrationen sind im Supabase-Projekt registriert.
- [x] RLS ist auf den geprüften öffentlichen Tabellen aktiviert.
- [x] Direkte Tabellenrechte für die Rollen `anon` und `authenticated` wurden in `public` geprüft; die Abfrage ergab keine direkten Tabellenprivilegien.

## Vor echtem Mehrbenutzerbetrieb zwingend offen

- [ ] Supabase-Verbindung über `DATABASE_URL` (Session Pooler) ausschließlich für Production in Vercel konfigurieren und Verbindung aus der deployten Anwendung testen. Preview/Development müssen getrennte Datenbanken verwenden oder bei PGLite bleiben.
- [ ] Persistente Datenbank statt In-Memory-Demo aktivieren und Neustart-/Datenpersistenztests durchführen.
- [ ] Eigenen Produktions-Auth-Broker mit `GROK_AUTH_ISSUER`, `GROK_AUTH_CLIENT_ID` und `GROK_AUTH_CLIENT_SECRET` bereitstellen; die eingebauten Preview-Zugangsdaten sind nicht für Production zugelassen.
- [ ] Better Auth mit echter Datenbank aktivieren; Registrierung, Anmeldung, Abmeldung, Passwort-Reset, Session-Ablauf und parallele Sitzungen Ende-zu-Ende testen.
- [ ] Autorisierung auf jeder serverseitigen Lese- und Schreibroute prüfen: Nutzer dürfen ausschließlich eigene bzw. freigegebene Datensätze sehen und ändern.
- [ ] Sicherheitsreview der RLS-/DB-Rechte und aller serverseitigen Datenzugriffe durchführen. Die Supabase-Meldungen `rls_enabled_no_policy` sind derzeit INFO-Hinweise; die fehlenden Policies dürfen nicht pauschal ergänzt werden, solange die Anwendung ausschließlich über den privaten Server-DB-Zugang arbeitet. Architektur und tatsächliche Zugriffspfade müssen vor Freigabe erneut geprüft werden.
- [x] Inseratbilder werden bei gesetztem `BLOB_READ_WRITE_TOKEN` serverseitig in Vercel Blob gespeichert; JPEG-Signatur und Größenlimit werden vor dem Upload geprüft, Uploads werden an die angemeldete Nutzerkennung gebunden und bei fehlgeschlagener Inseraterstellung bestmöglich bereinigt.
- [ ] Vercel-Blob-Speicher mit dem Projekt verbinden, Token in Vercel konfigurieren und echten Upload/Wiedergabe-/Löschtest durchführen. Ohne Token bleibt die lokale Demo beim bisherigen In-Memory-Datenmodus; Produktionsfreigabe bleibt gesperrt.
- [ ] Upload-Limits, Dateitypen, Größenlimits, Zugriffsschutz, Malware-Prüfung und Lösch-/Aufbewahrungsregeln testen.
- [ ] Video-Upload und Wiedergabe vollständig implementieren und Ende-zu-Ende testen. Vorgesehene Regeln: entweder 1 Video bis 60 Sekunden, 2 Videos bis je 30 Sekunden oder 4 Videos bis je 20 Sekunden; insgesamt höchstens 60 Sekunden.
- [ ] Echte ID-Austria-Anbindung samt Anbieterfreigabe, Rückruf-/Signaturprüfung und Datenschutzprüfung integrieren. Ein Mock ist keine Identitätsprüfung.
- [ ] Treuhand mit realen, berechtigten Moderatorenkonten und manipulationssicherer Abstimmungs-/Auditspur testen; keine Demo-Stimmen für reale Tauschvorgänge verwenden.
- [ ] Mehrbenutzer-Ende-zu-Ende-Tests für Inserate, Nachrichten, Benachrichtigungen, Tauschanfragen, Buchungen, Punktebuchungen, Treuhand und Konfliktfälle durchführen.
- [ ] Rate-Limits, CSRF-/Origin-Schutz, Session-Cookies, Eingabevalidierung, Protokollierung ohne Geheimnisse und Missbrauchsschutz prüfen.
- [ ] Backup-/Restore-Verfahren, Monitoring, Fehleralarme, Datenschutz-/Impressums-/AGB-Texte und Supportprozess festlegen.
- [ ] Android-Geräte- und Browserprüfung mit realen Testkonten durchführen.
- [ ] Abschließende unabhängige Sicherheitsprüfung und Freigabe dokumentieren.

## Aktueller Freigabestatus

**Nicht produktionsbereit.** Die Testdemo kann separat geprüft werden. Der aktuelle Preview-Stand ist älter als der neueste Commit mit der Produktionssperre. Eine neue Vercel-Preview-Bereitstellung war wegen des erreichten Deployment-Tageslimits vorübergehend nicht möglich. Die Demo darf nicht als produktionsreife Plattform oder als echte Mehrbenutzerlösung beworben werden.

## Schutzregeln

- Keine Secrets, Passwörter oder Datenbankkennwörter in Git oder Chat eintragen.
- Demo- und Produktionsumgebung getrennt halten.
- Authentifizierung nicht aktivieren, bevor Datenbankverbindung und Autorisierung getestet sind.
- Keine Migration oder RLS-Policy pauschal auf Produktionsdaten anwenden, ohne Auswirkungen und Rollback zu prüfen.
- Keine Freigabe allein aufgrund eines grünen CI-Builds.
