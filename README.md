# KREISLAUF

Regionales Kreislauf- und Tauschsystem für das Yspertal / die B36.

## Testdemo

Die aktuelle Vorschau ist eine gemeinsame Testversion, kein produktiver Mehrbenutzerbetrieb.

**[Aktuelle KREISLAUF-Testvorschau öffnen](https://grok-workspace-j8fu4n0c6-kreislauf.vercel.app/)** – aktueller Preview-Deploy für Commit `2fc83b8ea22d5ec5bb9bf45a3b4021f05c75a907`, Status `READY`. CI (Build, TypeScript, automatisierte Tests, Sicherheitsprüfung und Lint) ist für diesen Commit erfolgreich. Die fünf Basisrouten wurden zuletzt auf dem vorherigen Code-Commit `f7a4a6d9a0fdc3f455c62ec30fa6065af8b55ad5` mit HTTP 200 geprüft; der neuere Commit enthält Dokumentationsänderungen. Es bleibt eine gemeinsame Demo ohne persönliche Registrierung und ohne dauerhafte Mehrbenutzerdaten. Es bleibt eine gemeinsame Demo ohne persönliche Registrierung und ohne dauerhafte Mehrbenutzerdaten. Keine echten persönlichen oder vertraulichen Daten eingeben.

**[Deutsche Anleitung zum Ausprobieren](DEMO-ANLEITUNG.md)**

Für die spätere Produktiv-Anbindung an das vorhandene Supabase-Projekt: **[Supabase vorbereiten](SUPABASE-ANLEITUNG.md)** · [SQL-Schema ohne Demo-Datensätze](SUPABASE-SETUP.sql).

## Technischer Stand

Die Anwendung verwendet TanStack Start, React und Tailwind CSS. Datenbankmigrationen und automatisierte Tests laufen in einer isolierten PostgreSQL-kompatiblen Testdatenbank. Die Vorschau verwendet derzeit eine nicht dauerhafte In-Memory-Datenbank.

Vor einem Echtbetrieb müssen persistente Datenbank, echte Authentifizierung, Zugriffskontrollen, sicherer Medien-Storage, echte ID-Austria-Anbindung und vollständige End-to-End-Tests eingerichtet werden.
