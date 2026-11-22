# KREISLAUF – Integrations-Bestandsaufnahme

Stand: 22. November 2026  
Ausgangsbasis: Branch `main`, geprüft für den Entwicklungszweig `chatgpt/integration-baseline`.

## Ziel

Das bestehende KREISLAUF-Projekt bleibt die technische Ausgangsbasis. Die neueren Anforderungen aus dem Gemeinwohl-Projekt werden schrittweise integriert. Bestehende Funktionen und Plattform-Infrastruktur werden nicht pauschal ersetzt.

## Was bereits vorhanden ist

- React-/TypeScript-Anwendung auf Basis von TanStack Start/Router und Vite.
- Authentifizierte Serverfunktionen; die KREISLAUF-API verwendet `authMiddleware`.
- Datenzugriff über die vorhandene serverseitige SQL-Schicht (`getSql`).
- PostgreSQL-Migrationen für Regionen, Profile, Inserate, Buchungen, Bewertungen und ein unveränderliches Karma-Ledger.
- Demurrage-/Umlaufsicherungsfunktion in der Datenbank.
- Inseratstypen `sell`, `search` und `gift`.
- Artikelhistorie, Treuhandfälle, Moderatorenzuweisung und ein ID-Austria-Mockmodus.
- Dokumentation zu Moderation und zur noch nicht produktiven ID-Austria-Anbindung.

## Wichtige technische Feststellung

Die aktuelle Codebasis ist nicht als Supabase-Anwendung eingerichtet. Die Projektabhängigkeiten und Migrationen weisen auf eine vorhandene PostgreSQL-/Neon-/PGlite-Architektur mit serverseitigem Datenzugriff hin. Die Migration kommentiert eine mögliche Supabase-Portierung lediglich als Skizze. Es wurde keine aktive Supabase-Verbindung nachgewiesen.

Daher wird Supabase nicht einfach zusätzlich eingebaut. Zuerst ist eine bewusste Architekturentscheidung nötig: vorhandene Datenbankarchitektur beibehalten oder gezielt auf das bereits vorhandene Supabase-Projekt migrieren. Zugangsdaten oder Secrets werden dafür nicht im Chat angefordert.

## Noch nicht als fertig bestätigt

- Eine echte ID-Austria-OIDC-Integration; der vorhandene Mock ist keine Identitätsprüfung.
- Eine vollständige Admin-Oberfläche zur Vergabe und Entziehung von Moderationsrängen.
- Ein In-App-Kamera-QR-Scanner.
- Ein vollständiges Streitfall- und Schlichtungsverfahren für Treuhand.
- Die erweiterten, miteinander verknüpften Nachrichten-, Tauschanfrage- und Tauschvorgangsabläufe.
- Der gewünschte Marktplatz mit Anbieterprofil-Ansicht, Detailseiten und vollständigem Foto-/Kurzvideo-Editor.
- Das finale GWP-Regelwerk mit Gemeinschaftsfonds, „3 Punkte 1 Ort“, Gebührenfreiheit, Rangobergrenzen und verbindlichen Demurrage-Werten.

## Sicherheits- und Produktregeln für die Weiterentwicklung

1. Kontostände dürfen nicht direkt vom Browser geändert werden.
2. Jede GWP-Buchung muss serverseitig und atomar erfolgen und im Ledger nachvollziehbar sein.
3. Rollen und Moderationsrechte müssen serverseitig geprüft werden.
4. Private Standort- und Identitätsdaten dürfen nicht in öffentlichen Inseratsantworten erscheinen.
5. Neue Funktionen werden in kleinen, überprüfbaren Änderungen ergänzt.
6. Unbestätigte Demo-Werte werden nicht als verbindliche Regeln übernommen.
7. Bestehende Migrationen werden nicht nachträglich umgeschrieben; Schemaänderungen kommen als neue Migrationen.

## Vorgeschlagene nächste Arbeitsschritte

1. Datenbankentscheidung dokumentieren (bestehende PostgreSQL-/Neon-Architektur oder Supabase-Migration).
2. Vorhandene Auth-, Profil- und Rollenabläufe vollständig prüfen.
3. GWP-Ledger, Buchungsfunktionen und Demurrage fachlich und sicherheitstechnisch prüfen.
4. Marktplatz und Tauschvorgänge um Gesuche/Angebote, Anbieteransicht und verknüpfte Nachrichten erweitern.
5. Treuhand, QR-Abläufe, Moderation und Admin-Oberfläche vervollständigen.
6. Tests und Build ausführen; nicht bestandene Prüfungen ausdrücklich dokumentieren.

## Prüfgrenze

Diese Bestandsaufnahme basiert auf den im Repository gelesenen Quelltexten und Migrationen. Es wurde in dieser Änderung weder eine Datenbank verbunden noch ein Build oder Browser-Test ausgeführt. Es wird kein erfolgreicher Produktionsbetrieb behauptet.
