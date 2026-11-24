# Direkter und kombinierter Tausch

Diese Erweiterung ergänzt zwei Inseratstypen:

- **Direkter Tausch:** Der Anbieter beschreibt die gewünschte Gegenleistung. Die anfragende Person schreibt konkret, was sie im Gegenzug anbietet. Es wird kein Karma übertragen.
- **Kombinierter Tausch:** Der Anbieter beschreibt die gewünschte Gegenleistung und kann zusätzlich einen Karma-Ausgleich von 0 bis 500 festlegen. Ein positiver Betrag wird immer vom anfragenden Mitglied an den Anbieter übertragen.

## Ablauf

1. Ein verifiziertes Mitglied erstellt ein Inserat für ein Gut oder eine Hilfe und beschreibt die gewünschte Gegenleistung.
2. Ein anderes verifiziertes Mitglied derselben Region sendet einen konkreten Vorschlag.
3. Der Anbieter nimmt den Vorschlag an oder lehnt ihn ab. Solange ein Vorschlag offen, angenommen oder strittig ist, wird das Inserat für parallele Anfragen gesperrt.
4. Nach der tatsächlichen Übergabe bestätigen beide Mitglieder den Abschluss auf der Inseratseite.
5. Erst nach beiden Bestätigungen wird ein positiver Karma-Ausgleich in einer Datenbankoperation belastbar gegen das aktuelle Guthaben geprüft und gebucht. Beim direkten Tausch wird kein Karma-Ledger-Eintrag angelegt.
6. Jede beteiligte Person kann bei einem angenommenen Vorgang einen Streitfall melden. Dieser bleibt gesperrt; es wird kein Karma bewegt.

## Daten und Rückwärtskompatibilität

Migration `0004_direct_combined_trade.sql` ergänzt `listings.exchange_terms`, `listings.karma_adjustment` und die Tabelle `trade_requests`. Bereits bestehende Angebote behalten ihre Art und ihren Preis; bestehende Profile, Guthaben, Buchungen und Ledger-Einträge werden nicht umgeschrieben. Die Migration ist additiv und wird über den bestehenden Migrationsmechanismus angewendet.

## Grenzen dieses Entwicklungsstands

- Die direkte und kombinierte Tauschlogik ist im aktuellen `main`-Quellstand enthalten. Die Migrationen wurden in isolierten PGlite-Testdatenbanken ausgeführt; es wurde keine Produktivdatenbank migriert.
- Die Moderationsseite `/moderation` zeigt ausschließlich zugeteilte offene Fälle und erlaubt eine einmalige, begründete Stimme pro zugeteilter Person. Sie zeigt Stimmenstand, Abschluss-/Abbruchstimmen und die Vier-Stimmen-/Zweidrittelregel. Die erste Vergabe oder Entziehung von Moderationsrängen ist weiterhin eine Administrationsaufgabe per kontrollierter Datenbankfreigabe; dafür existiert noch keine Admin-Oberfläche. Es gibt keine automatische Freigabe bei ungelöstem Streit.
- Gespräche sind inseratgebunden. Der zentrale Eingang unter `/nachrichten` zeigt alle zugriffsberechtigten Unterhaltungen, Gegenüber, Inseratstitel, letzte Nachricht und ungelesene Anzahl. Tauschvorschlag, Annahme, Ablehnung, Rückzug, Streitfall und Abschluss erzeugen Systemnachrichten im selben Gespräch. Die Kopfzeile zeigt zusätzlich eine kontoabhängige Glocke mit ungelesener Anzahl. Benutzer-Nachrichten sind pro Konto auf 12 pro Minute und 80 pro Stunde begrenzt; Systemereignisse sind davon ausgenommen.
- Leih-/Sharing-Inserate sind für direkten und kombinierten Tausch bewusst ausgeschlossen.
- ID Austria bleibt abhängig von der separat einzurichtenden und live zu prüfenden Verifikation.
- Es gibt noch keinen echten Push-/E-Mail-Dienst. Die Nachrichtenoberfläche aktualisiert Gespräche periodisch; Benachrichtigungen sind daher nicht garantiert sofort zugestellt.

## Tests

`src/features/kreislauf/trade-rules.test.ts` prüft die fachliche Validierung. `scripts/kreislauf-trade-migration.test.mjs` führt die Migration auf einer isolierten PGlite-Testdatenbank aus und prüft Constraints, Einmaligkeit offener Vorschläge sowie unveränderte Altguthaben. `src/features/kreislauf/trade-lifecycle.test.ts` führt die echten SQL-Abfragen aus `trade-queries.ts` auf PGlite aus und prüft doppelte/regionfremde Anfragen, Annahme/Ablehnung, beidseitige Bestätigung, richtungsgebuchten Karma-Ausgleich, direkten Tausch ohne Ledger-Transfer, Streitfallsperre und unzureichendes Guthaben.


## Hauptbranch-Nachprüfung – 24.11.2026

- Inseratstypen `sell`, `search`, `gift`, `barter` und `combined` sind in `src/features/kreislauf/types.ts` definiert.
- Die Inserat-Erstellungsroute `/inserat/neu` bietet direkten und kombinierten Tausch und sendet Gegenleistungs- und Karma-Ausgleichsfelder an die serverseitige Validierung.
- Die Marktplatzroute bietet Filter für „Direkter Tausch“ und „Kombiniert“.
- Der Detailpfad zeigt Gegenleistung, Tauschvorschlag, Statuswechsel und Bestätigungsaktionen.
- Die SQL-Lifecycle-Tests prüfen direkten Tausch ohne Ledgerbewegung, kombinierten Transfer erst nach beiden Bestätigungen, Dubletten, Region, Sperrung und Streitfallpfad.
- CI-Hauptlauf nach den Dokumentationsänderungen: `45385020259` erfolgreich. Dieser Lauf belegt den damaligen Code-Stand und muss für die neue Kopfzeilenänderung erneut grün sein.
- Realer Mehrbenutzer-/ID-Austria-/Produktionsdatenbanktest bleibt offen.
