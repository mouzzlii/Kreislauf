# KREISLAUF – Produktionsfreigabe-Checkliste

Stand: 22.11.2026  
Arbeitszweig: `demo/local-auth-off`

Diese Liste trennt eine vorzeigbare Testdemo von einem sicheren Mehrbenutzer-Produktivbetrieb. Ein erfolgreicher Build allein ist keine Produktionsfreigabe.

## Bereits automatisiert geprüft

- [x] Produktions-Build läuft in CI erfolgreich.
- [x] TypeScript-Prüfung läuft erfolgreich.
- [x] Automatisierte Tests laufen erfolgreich (zuletzt vollständig bestätigt auf Commit `bdc7ee87ba5799b02fa4534030089d956038ec0f`; CI-Lauf 45056284379: Build, TypeScript, Tests, Lint und Dependency-Audit erfolgreich).
- [x] Lint läuft erfolgreich.
- [x] Abhängigkeiten werden auf bekannte Sicherheitslücken geprüft.
- [x] Produktions-Build wird blockiert, wenn PostgreSQL-, Better-Auth-, eigener OAuth-Broker- oder Medien-Storage-Konfiguration fehlt.
- [x] Produktions-Build wird blockiert, wenn der ID-Austria-Demomodus aktiv ist.
- [x] Video-Referenzen werden serverseitig abgewiesen, solange kein Upload mit echter serverseitiger Medienprüfung existiert.
- [x] Wiederverwendung bestehender Inseratfotos ist auf HTTPS-Vercel-Blob-Adressen im persönlichen Nutzerpfad beschränkt; automatisierte Tests decken fremde Nutzer, falsche Hosts und manipulierte URLs ab.
- [x] Inserate lassen sich durch den Eigentümer serverseitig pausieren und wieder freigeben; fremde Inserate und nicht passende Statuswechsel werden abgewiesen. Pausierte Inserate werden aus dem öffentlichen Markt ausgeblendet.
- [x] Pausiert ist ein eigener Datenbankstatus und wird nicht mehr mit `maintenance` (Wartung) vermischt. Neue Migration `0015_listing_paused_status.sql`; das Clean-Install-SQL enthält denselben Status. Die Migration wird erst auf der jeweils verbundenen Datenbank angewendet, wenn die App dort regulär migriert.
- [x] Marktfilter, eigener Pausenstatus und Benachrichtigungs-Routing wurden im aktuellen Branch-HEAD durch CI geprüft (Commit `7df02510992eaa40b22691baeb91c240be2740b9`, Lauf 45052969457: Build, TypeScript, Tests, Lint und Dependency-Audit erfolgreich).
- [x] Benachrichtigungen enthalten die konkrete Gesprächskennung und öffnen bei mehreren Anfragen zum selben Inserat die passende Unterhaltung; automatisierter Test im CI-Lauf 45055800005 erfolgreich.
- [x] Nachrichten-Zugriffe prüfen Teilnehmer, Inserat und ausgewählte Unterhaltung; zusätzliche Regressionstests für manipulierte Gesprächskennungen und Lesebestätigungen wurden auf Commit `675ce01` erfolgreich ausgeführt.
- [x] Zusätzliche Regressionstests für die Hochwert-Treuhand prüfen, dass die Anfrage zunächst nur reserviert wird und vor der vorgesehenen Freigabe keine Punkteübertragung stattfindet (CI-Lauf 45056240418 erfolgreich).
- [x] Sharing-Treuhand: Übergabe ist serverseitig erst nach Freigabe möglich; strittige Treuhandfälle können nicht durch Stornieren der Buchung umgangen werden. Regressionstests im CI-Lauf 45055074165 auf Commit `fcc915a0c5e0d50031bd98ee2b4fa80157fbadf8` erfolgreich.
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
- [ ] Treuhand fachlich neu absichern: Bei hochwertigen Angeboten löst die Freigabemehrheit derzeit unmittelbar Punktebuchung und Inseratabschluss aus. Vor Produktivbetrieb ist eine getrennte Übergabe-/Empfangsbestätigung oder ein gleichwertiger Nachweis erforderlich. Reale, berechtigte Moderatorenkonten und manipulationssichere Abstimmungs-/Auditspur testen; keine Demo-Stimmen für reale Tauschvorgänge verwenden. Für abgelehnte Fälle fehlt noch ein berechtigter, protokollierter Klärungs-/Abschlussprozess; bis dahin bleibt das Inserat bewusst gesperrt.
- [ ] Direkten Tausch ohne Punkte und kombinierte Angebote (Ware/Dienstleistung plus Karma) als vollständigen Anfrage-, Annahme-, Ablehnungs- und Abschlussprozess implementieren; derzeit unterstützt der Abschluss nur Karma-/Geschenk- und Sharing-Flows.
- [ ] Hochwert-Treuhand um ausdrückliche Übergabe-/Empfangsbestätigung beider Parteien und einen autorisierten, protokollierten Streitfallentscheid ergänzen; derzeit löst die Moderationsmehrheit die Abwicklung aus, ohne dass eine unabhängige gegenseitige Empfangsbestätigung vorliegt. Bis dahin keine echte Produktivfreigabe für diese Vorgänge.
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
