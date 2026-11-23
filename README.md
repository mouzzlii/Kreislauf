# KREISLAUF

Regionales Kreislauf- und Tauschsystem für das Yspertal / die B36.

## Testdemo

Die aktuelle Vorschau ist eine gemeinsame Testversion, kein produktiver Mehrbenutzerbetrieb.

**[Aktuelle KREISLAUF-Testvorschau öffnen](https://grok-workspace-git-demo-local-auth-off-kreislauf.vercel.app/)** – Preview-Deploy für Commit `eb56b06eee7164e5ffb1a6e4ee9134f852e6974c`, Status `READY`; Startseite, Karte, Inserat-Erstellung, Konto und Beispiel-Inserat wurden auf dem aktuellen Alias mit HTTP 200 geprüft. Es bleibt eine gemeinsame Demo ohne persönliche Registrierung und ohne dauerhafte Mehrbenutzerdaten. Keine echten persönlichen oder vertraulichen Daten eingeben.

**[Deutsche Anleitung zum Ausprobieren](DEMO-ANLEITUNG.md)**

Für die spätere Produktiv-Anbindung an das vorhandene Supabase-Projekt: **[Supabase vorbereiten](SUPABASE-ANLEITUNG.md)** · [SQL-Schema ohne Demo-Datensätze](SUPABASE-SETUP.sql).

## Technischer Stand

Die Anwendung verwendet TanStack Start, React und Tailwind CSS. Datenbankmigrationen und automatisierte Tests laufen in einer isolierten PostgreSQL-kompatiblen Testdatenbank. Die Vorschau verwendet derzeit eine nicht dauerhafte In-Memory-Datenbank.

Vor einem Echtbetrieb müssen persistente Datenbank, echte Authentifizierung, Zugriffskontrollen, sicherer Medien-Storage, echte ID-Austria-Anbindung und vollständige End-to-End-Tests eingerichtet werden.
