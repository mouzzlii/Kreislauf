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
- [x] Pausiert ist ein eigener Datenbankstatus und wird nicht mehr mit `maintenance` (Wartung) vermischt.
- [x] Ein unkontrollierter Regionswechsel ist gesperrt: Karma-Bestände und Ledger-Einträge bleiben ihrer Region zugeordnet, bis ein geprüfter regionaler Übertragungsprozess existiert. Regressionstest im CI-Lauf `45068568745` auf Commit `a83a02da915d4499106e0153652a6b574fb3963c` erfolgreich. Neue Migration `0015_listing_paused_status.sql`; das Clean-Install-SQL enthält denselben Status. Die Migration wird erst auf der jeweils verbundenen Datenbank angewendet, wenn die App dort regulär migriert.
- [x] Marktfilter, eigener Pausenstatus und Benachrichtigungs-Routing wurden im aktuellen Branch-HEAD durch CI geprüft (Commit `7df02510992eaa40b22691baeb91c240be2740b9`, Lauf 45052969457: Build, TypeScript, Tests, Lint und Dependency-Audit erfolgreich).
- [x] Benachrichtigungen enthalten die konkrete Gesprächskennung und öffnen bei mehreren Anfragen zum selben Inserat die passende Unterhaltung; automatisierter Test im CI-Lauf 45055800005 erfolgreich.
- [x] Nachrichten-Zugriffe prüfen Teilnehmer, Inserat und ausgewählte Unterhaltung; zusätzliche Regressionstests für manipulierte Gesprächskennungen und Lesebestätigungen wurden auf Commit `675ce01` erfolgreich ausgeführt.
- [x] Hochwert-Treuhand fail-closed gehärtet: Auch nach einer Moderationsmehrheit bleiben Inserat und Punkte gesperrt; die Mehrheitsentscheidung allein löst keine Übergabe und keine Punkteübertragung aus. Die Oberfläche weist ausdrücklich auf die noch fehlende beidseitige Übergabebestätigung hin. Regressionstests einschließlich 2:2-Gleichstand sind im CI-Lauf 45061415223 und 45061409949 für Commit `4962e729aa542285c6927c3982e9a8cd429a9ffa` erfolgreich.
- [x] Sharing-Treuhand: Übergabe ist serverseitig erst nach Freigabe möglich; strittige Treuhandfälle können nicht durch Stornieren der Buchung umgangen werden. Regressionstests im CI-Lauf 45055074165 auf Commit `fcc915a0c5e0d50031bd98ee2b4fa80157fbadf8` erfolgreich.
- [x] Sharing-Treuhand zusätzlich gegen Umgehung über die Rückgabe abgesichert: Bei `disputed` bleibt die Buchung und das Inserat unverändert; der Rückgabeversuch wird mit einer klaren Fehlermeldung abgewiesen. Regressionstest prüft Storno und Rückgabe gemeinsam; CI-Lauf `45066586697` auf Commit `956cf525270d828ebf4514aba3cdca30ed585b5b` erfolgreich.
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
- [ ] Treuhand fachlich fertigstellen: Bei hochwertigen Angeboten bleibt der Vorgang nach Moderationsmehrheit bewusst offen; beidseitige Übergabe-/Empfangsbestätigung und ein autorisierter, protokollierter Streitfallentscheid fehlen noch. Reale, berechtigte Moderatorenkonten und manipulationssichere Abstimmungs-/Auditspur testen; keine Demo-Stimmen für reale Tauschvorgänge verwenden. Für abgelehnte Fälle fehlt noch ein berechtigter, protokollierter Klärungs-/Abschlussprozess; bis dahin bleibt das Inserat bewusst gesperrt.
- [ ] Direkten Tausch ohne Punkte und kombinierte Angebote (Ware/Dienstleistung plus Karma) als vollständigen Anfrage-, Annahme-, Ablehnungs- und Abschlussprozess implementieren; derzeit unterstützt der Abschluss nur Karma-/Geschenk- und Sharing-Flows.
- [ ] Hochwert-Treuhand: ausdrückliche Übergabe-/Empfangsbestätigung beider Parteien und einen autorisierten, protokollierten Streitfallentscheid implementieren. Bis diese Funktion vollständig implementiert und Ende-zu-Ende geprüft ist, bleibt die Abwicklung nach der Moderationsmehrheit absichtlich blockiert; keine echte Produktivfreigabe für diese Vorgänge.
- [ ] Mehrbenutzer-Ende-zu-Ende-Tests für Inserate, Nachrichten, Benachrichtigungen, Tauschanfragen, Buchungen, Punktebuchungen, Treuhand und Konfliktfälle durchführen.
- [ ] Rate-Limits, CSRF-/Origin-Schutz, Session-Cookies, Eingabevalidierung, Protokollierung ohne Geheimnisse und Missbrauchsschutz prüfen.
- [ ] Backup-/Restore-Verfahren, Monitoring, Fehleralarme, Datenschutz-/Impressums-/AGB-Texte und Supportprozess festlegen.
- [ ] Android-Geräte- und Browserprüfung mit realen Testkonten durchführen.
- [ ] Abschließende unabhängige Sicherheitsprüfung und Freigabe dokumentieren.

## Letzter bestätigter Prüfstand

- Commit: `956cf525270d828ebf4514aba3cdca30ed585b5b`.
- GitHub Actions Lauf `45066586697`: erfolgreich; Produktions-Build, TypeScript, automatisierte Tests, Lint und Dependency-Audit abgeschlossen.
- Der Prüflauf bestätigt den Quellcode auf dem Entwicklungszweig, nicht die externe Live-Datenbank, echte Authentifizierung oder einen aktuellen Vercel-Deploy.

## Letzter bestätigter Prüfstand

- Commit `a83a02da915d4499106e0153652a6b574fb3963c`, GitHub Actions `45068568745`: Produktions-Build, TypeScript, automatisierte Tests, Lint und Dependency-Audit erfolgreich.
- Die Prüfung bestätigt den Quellcode des Entwicklungszweigs, nicht die externe Live-Datenbank, echte Authentifizierung oder einen aktuellen Vercel-Deploy.

## Aktueller Freigabestatus

**Nicht produktionsbereit.** Die Testdemo kann separat geprüft werden. Der aktuelle Preview-Stand ist älter als der neueste Commit mit der Produktionssperre. Eine neue Vercel-Preview-Bereitstellung war wegen des erreichten Deployment-Tageslimits vorübergehend nicht möglich. Die Demo darf nicht als produktionsreife Plattform oder als echte Mehrbenutzerlösung beworben werden.

## Schutzregeln

- Keine Secrets, Passwörter oder Datenbankkennwörter in Git oder Chat eintragen.
- Demo- und Produktionsumgebung getrennt halten.
- Authentifizierung nicht aktivieren, bevor Datenbankverbindung und Autorisierung getestet sind.
- Keine Migration oder RLS-Policy pauschal auf Produktionsdaten anwenden, ohne Auswirkungen und Rollback zu prüfen.
- Keine Freigabe allein aufgrund eines grünen CI-Builds.


- Profilanlage und regionales Startguthaben werden gemeinsam in einer einzelnen SQL-Anweisung angelegt. Scheitert die Ledger-Buchung, wird auch die Profilanlage zurückgerollt; Wiederholungsaufrufe erzeugen keine zweite Startgutschrift. Regressionstest und CI: Commit `03096699ae94548bc6df00f919de0f6926b5c26a`, Lauf `45069498567` erfolgreich. Dies belegt die Code-Prüfung, nicht die Ausführung gegen die Live-Datenbank.

## Letzter Code-Prüfstand – 22.11.2026

- Entwicklungszweig: `demo/local-auth-off`; Commit `79a44f6439b70364bc1b83e69b489a6d3a453d50`.
- GitHub Actions `45073176756`: erfolgreich – Abhängigkeitsprüfung, Produktions-Build, TypeScript, automatisierte Tests und Lint.
- Migration `0016_reconcile_demo_karma_ledger.sql`: temporärer PostgreSQL-/PGlite-Test erfolgreich; alle vorbereiteten Demo-Guthaben stimmen mit dem Ledger überein, erneutes Ausführen erzeugt keine doppelten Korrekturbuchungen.
- `SUPABASE-SETUP.sql` enthält die neue Migration. Sie wurde in diesem Arbeitsschritt nicht auf dem verbundenen Supabase-Projekt ausgeführt.
- Vercel-Preview für den aktuellen Commit weiterhin blockiert: Deployment-Tageslimit erreicht (HTTP 402 / 24-Stunden-Sperre). Kein Upgrade und keine Änderung der Abrechnung vorgenommen.
- PR #1 bleibt offen und nicht zusammengeführt. Keine Veröffentlichung oder Produktivfreigabe.
- Weiterhin offen: echte Mehrbenutzer-Authentifizierung, produktiv angebundene dauerhafte Datenbank, beidseitige hochwertige Treuhand-Abwicklung, echte ID-Austria-Prüfung, Video-Upload und Android-Ende-zu-Ende-Praxistests.

- Karma-Aktivitätsbuchungen verwenden den Ledger-Typ `activity`. Migration `0017_allow_activity_ledger_entries.sql` erlaubt diesen Typ ausdrücklich; das Supabase-Setup-Skript ist synchronisiert. Die PGlite-Migrationstests prüfen die Annahme eines Aktivitätsbonus. Das belegt die Schema-Kompatibilität im Test, nicht die Ausführung gegen eine echte Supabase-Produktionsdatenbank.

- Sharing-Übergaben benötigen jetzt getrennte Bestätigungen von abholender und anbietender Partei. Erst wenn beide bestätigt haben und das Guthaben reicht, werden Buchungsstatus, Karma-Ledger und Artikelhistorie gemeinsam abgeschlossen. Einzelbestätigung lässt die Reservierung offen; danach ist Stornieren gesperrt. Migration `0018_booking_bilateral_handover.sql` ergänzt die Felder und sichert historische abgeschlossene Buchungen ab.
