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
- [ ] Treuhand live freigeben: Der Code reserviert bei hochwertigen Tauschen die Punkte des Käufers, verlangt nach Community-Freigabe die Bestätigung beider Parteien und unterstützt bei Streitfällen eine protokollierte Moderatorentscheidung mit Freigabe oder Rückerstattung. Vor echtem Betrieb müssen Migrationen auf einer isolierten Supabase-Testdatenbank ausgeführt, echte berechtigte Moderatorenkonten eingerichtet und die Abläufe mit mehreren realen Konten geprüft werden. Wenn nach allen zugeteilten Stimmen keine Zweidrittelmehrheit erreicht wird, bleiben Punkte und Inserat bewusst gesperrt; eine manuelle Klärung außerhalb der Plattform ist dann erforderlich.
- [ ] Direkten Tausch ohne Punkte und kombinierte Angebote (Ware/Dienstleistung plus Karma) als vollständigen Anfrage-, Annahme-, Ablehnungs- und Abschlussprozess implementieren; derzeit unterstützt der Abschluss nur Karma-/Geschenk- und Sharing-Flows.
- [ ] Hochwert-Treuhand produktiv freigeben: beidseitige Bestätigung, Karma-Reservierung und Moderatorentscheidung für Auszahlung/Rückerstattung sind im Entwicklungszweig implementiert und durch PGlite-Integrationstests abgedeckt. Noch offen sind Live-Supabase-Migration, echte Moderatorberechtigungen, mehrbenutzerfähige Ende-zu-Ende-Tests, Datenschutz-/Rechtsprüfung und ein dokumentierter Supportweg für Abstimmungs-Deadlocks.
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

- Sharing-Reservierungen akzeptieren keine Startzeit in der Vergangenheit; der Zeitbereich bleibt auf 1 Stunde bis 14 Tage begrenzt.

- Auch die Rückgabe einer Sharing-Buchung braucht jetzt beide Bestätigungen. Das Inserat wird erst danach wieder öffentlich buchbar; Migration `0019_booking_bilateral_return.sql` ergänzt die Bestätigungsfelder und sichert historische Rückgaben ab.

- Inserat-Unterhaltung und erste/weitere Nachricht werden atomar in einem SQL-Statement gespeichert; Regressionstest vorhanden.


## Ergänzung – 23.11.2026: Treuhand-Mindestquorum

- Migration `0020_escrow_moderator_quorum.sql` ergänzt einen Datenbank-Trigger: Neue Treuhandfälle werden nur gespeichert, wenn der Zuweisungstrigger mindestens vier aktive, verifizierte Moderationspersonen zugeordnet hat.
- Wenn zwischen Vorabprüfung und tatsächlicher Eröffnung nicht mehr genügend Moderatoren verfügbar sind, löst die Datenbank einen Fehler aus. Das gesamte SQL-Statement der Reservierung bzw. Treuhanderöffnung wird dadurch zurückgerollt.
- Das saubere Supabase-Installationsskript enthält dieselbe Funktion, den Trigger und den Migrationseintrag.
- Ein Clean-Install-Test prüft sowohl den Abbruch mit nur drei Moderatoren als auch die erfolgreiche Eröffnung mit vier zugewiesenen Moderatoren.
- GitHub Actions Lauf `45094441832` auf Commit `2d064231d7458bf45b8093d7834d7e55e5124381`: erfolgreich – Dependency-Audit, Produktions-Build, TypeScript, 257 automatisierte Tests und Lint.
- Die Migration ist im Repository vorbereitet, wurde aber nicht auf dem verbundenen Supabase-Projekt ausgeführt. Der echte Supabase-Test, Android-Praxistest und vollständige hochwertige Übergabe-/Streitfallprozess bleiben offen.


## Ergänzung – 23.11.2026: Hochwertige Treuhand mit reserviertem Karma

- Migration `0021_high_value_escrow_funds.sql`: Käufer, Verkäufer, Region und Betrag werden am Treuhandfall gespeichert. Beim Eröffnen wird das Karma des Käufers in derselben SQL-Anweisung vom verfügbaren Guthaben abgezogen und als `escrow_hold` im Ledger protokolliert. Inserat, Treuhandfall, Punktreservierung und Ledger-Eintrag sind atomar verknüpft.
- Migration `0022_high_value_escrow_confirmation_and_disputes.sql`: Nach mindestens vier Moderationsstimmen und Zweidrittelmehrheit müssen Käufer und Verkäufer jeweils Empfang bzw. Übergabe bestätigen. Erst die zweite Bestätigung überträgt die reservierten Punkte an den Verkäufer und schließt das Inserat ab.
- Beide Parteien können einen Streitfall mit Begründung eröffnen. Unabhängig zugeteilte, aktive Moderatoren stimmen über Auszahlung oder Rückerstattung ab. Erforderlich sind mindestens vier Stimmen, eine Zweidrittelmehrheit und eine dokumentierte Begründung pro Moderationsstimme (mindestens 10 Zeichen).
- Bei Auszahlung wird das Verkäuferkonto gutgeschrieben und das Inserat abgeschlossen. Bei Rückerstattung wird das Käuferkonto gutgeschrieben und das Inserat wieder aktiviert. Beide Ergebnisse werden im unveränderlichen Ledger protokolliert und erzeugen eine Systemnachricht im Inseratsgespräch.
- Wenn alle zugeteilten Moderatoren abgestimmt haben, aber keine Zweidrittelmehrheit erreicht wird, bleiben Guthaben und Inserat gesperrt. Die Oberfläche weist auf die notwendige manuelle Klärung außerhalb der Plattform hin; es gibt keinen automatischen Mehrheitsersatz.
- Neue PGlite-Integrationstests decken Reservierung, unzulässige Moderatoren-/Parteibestätigungen, einseitige Bestätigung ohne Auszahlung, beidseitige Auszahlung, Streitfall, Rückerstattung, Wiederfreigabe des Inserats und Systemnachrichten ab.
- `SUPABASE-SETUP.sql` enthält die Migrationen 0021 und 0022. Die Migrationen wurden nicht auf dem verbundenen Supabase-Projekt ausgeführt.
- GitHub Actions Lauf `45096806816` auf Commit `e11a2fb86077eb52348045350ec91f92d01621b8`: erfolgreich – Produktions-Build, TypeScript, 260 Skript-Tests, 81 zusätzliche Tests, Lint und Dependency-Audit mit 0 gemeldeten Schwachstellen. Enthalten sind auch der Treuhand-Integrationstest und der UI-Hinweis für den Fall, dass nach allen Stimmen keine Zweidrittelmehrheit zustande kommt.


## Ergänzung – 23.11.2026: Medien-URL-Prüfung gehärtet

- Wiederverwendete Inseratbilder werden nur akzeptiert, wenn HTTPS, ein exakter Vercel-Blob-Store-Hostname, Standardport, keine URL-Zugangsdaten und der persönliche Pfad `/listings/{Nutzerkennung}/` übereinstimmen.
- Regressionstests weisen verschachtelte/lookalike Hosts, Zugangsdaten in URLs, Sonderports und normalisierte Pfad-Traversal-Versuche zurück.
- GitHub Actions Lauf `45097198523` auf Commit `fc8144441afd2cbb60182194b9f650ea241de515`: erfolgreich – Produktions-Build, TypeScript, 260 Skript-Tests, 83 zusätzliche Tests, Lint und Dependency-Audit mit 0 gemeldeten Schwachstellen.
- Die Prüfung betrifft URL-Validierung und Quellcode. Ein realer Blob-Upload/-Löschtest ist weiterhin offen; Video-Uploads bleiben bewusst gesperrt, bis eine serverseitige Medienprüfung verfügbar ist.

## Ergänzung – 23.11.2026: Unabhängige Treuhand-Abstimmungen

- [x] Datenbankseitige Unabhängigkeitsprüfung für beide Abstimmungen: Käufer und Verkäufer dürfen weder bei der initialen Community-Freigabe (`escrow_votes`) noch bei der späteren Streitfallentscheidung (`escrow_resolution_votes`) über den eigenen Fall abstimmen. Die Trigger prüfen die gespeicherten Käufer-/Verkäuferkennungen direkt aus dem Treuhandfall; zusätzliche Moderatorenrechte oder eine fehlerhafte Zuordnung umgehen die Sperre nicht.
- [x] Regressionstest: Ein Käufer mit Moderatorenrang und zusätzlicher Zuordnung wird bei beiden Abstimmungen abgewiesen.
- [x] Supabase-Clean-Install-Skript und PostgreSQL-Setup-Test enthalten beide Trigger.
- [x] GitHub Actions Lauf `45150174522` auf Commit `6e63a5d4df5c7f9cc3e60d9de2f77c8742545a13`: erfolgreich – Dependency-Audit, Produktions-Build, TypeScript, automatisierte Tests und Lint.
- [x] Sicherheitsprüfungsstand anschließend in `SECURITY-AUDIT.md` dokumentiert (Commit `e73fe7cc30dc16b5c116ff36ada2d96dfed4a6a6`). Dieser letzte Commit ändert ausschließlich die Sicherheitsdokumentation; der oben genannte CI-Lauf prüfte den unmittelbar vorherigen Code-Stand.
- [ ] Noch offen: Migrationen 0020–0024 auf einer isolierten Supabase-Testdatenbank ausführen und den vollständigen Ablauf dort mit echten getrennten Konten prüfen. Die vorhandenen PGlite-Tests sind keine Live-Supabase- oder Android-Ende-zu-Ende-Prüfung.

## Aktueller Stand – 23.11.2026

**Demo-Entwicklungszweig:** Build und automatisierte Code-Prüfungen erfolgreich auf Commit `6e63a5d4df5c7f9cc3e60d9de2f77c8742545a13`. Die Dokumentationsnachträge liegen auf `e73fe7cc30dc16b5c116ff36ada2d96dfed4a6a6`. PR #1 bleibt ein offener Entwurf und wurde nicht zusammengeführt.

**Keine Produktionsfreigabe:** Die Live-Supabase-Migration wurde nicht ausgeführt. Echte Benutzerkonten, persistente Datenbankverbindung, echte ID-Austria-Anbindung, Medien- und Video-Upload, Mehrbenutzer-/Android-Tests sowie unabhängige Betriebs- und Datenschutzprüfung bleiben offen. Keine Produktionsdaten wurden verändert.

## Ergänzung – 23.11.2026: Rückwirkende Bereinigung unzulässiger Treuhandstimmen

- [x] Migration 0025 archiviert Stimmen von Käufer/Verkäufer aus beiden Treuhand-Abstimmungen und entfernt sie aus den aktiven Abstimmungstabellen, damit alte Stimmen nicht mehr zum Quorum zählen.
- [x] Das Archiv behält die ursprüngliche Entscheidung, Begründung, Abstimmungszeit, Parteirolle und den damaligen Fallstatus; der Zugriff ist per RLS und Tabellenrechten gesperrt.
- [x] PGlite-Regressionstest simuliert Altstimmen vor der Migration, prüft die Archivierung beider Abstimmungsarten und die Entfernung aus den aktiven Quoren.
- [x] Treuhandübersicht zeigt Parteien keine Abstimmungsaktionen mehr, selbst wenn diese zusätzlich Moderatorenrechte besitzen.
- [x] Supabase-Setup-SQL und Clean-Install-Test sind auf 24 Anwendungsmigrationen aktualisiert.
- [ ] Migration 0025 auf einer isolierten Supabase-Testdatenbank und anschließend ein realer Mehrbenutzer-Test bleiben offen. Das verbundene Supabase-Projekt wurde nicht verändert.

## Prüfstatus – 23.11.2026: Migration 0025

- [x] GitHub Actions `45151061298` auf Commit `7d98b7597f5b3b339176dca16ad2bd8a0b63072e`: Dependency-Audit, Produktions-Build, TypeScript, automatisierte Tests und Lint erfolgreich.
- [x] Separater Clean-Install-Datenbanktest `45150894502` auf Commit `2c48d6b6bdb41469c96bea304584ca0b24950d25`: Supabase-Setup-SQL, RLS, Rechte und 24 Anwendungsmigrationen erfolgreich in temporärer PostgreSQL-kompatibler Testdatenbank.
- [ ] Noch offen: Migrationen auf einem isolierten echten Supabase-Testprojekt ausführen und Mehrbenutzerabläufe mit getrennten Konten prüfen. Das vorhandene Supabase-Projekt wurde nicht verändert.
- Der nachfolgende Commit `eeba0aa0dab5e47f6199b5177fd50da411094b69` aktualisiert ausschließlich die Supabase-Anleitung; der erfolgreiche Code-Prüflauf gilt für den vorherigen Code-Stand.
