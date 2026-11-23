# KREISLAUF

Regionales Kreislauf- und Tauschsystem für das Yspertal / die B36.

## Testdemo

Die aktuelle Vorschau ist eine gemeinsame Testversion, kein produktiver Mehrbenutzerbetrieb.

**[Bisherige KREISLAUF-Vorschau öffnen](https://grok-workspace-git-demo-local-auth-off-kreislauf.vercel.app/)** – nur zum unverbindlichen Anschauen. Hinweis: Diese veröffentlichte Vorschau ist älter als der aktuelle Sicherheitsstand im Branch und wurde nach der OAuth-Härtung noch nicht neu bereitgestellt. Sie ist daher nicht als aktuelle Testversion zu behandeln. Keine persönlichen oder vertraulichen Daten eingeben.

**[Deutsche Anleitung zum Ausprobieren](DEMO-ANLEITUNG.md)**

Für die spätere Produktiv-Anbindung an das vorhandene Supabase-Projekt: **[Supabase vorbereiten](SUPABASE-ANLEITUNG.md)** · [SQL-Schema ohne Demo-Datensätze](SUPABASE-SETUP.sql).

## Technischer Stand

Die Anwendung verwendet TanStack Start, React und Tailwind CSS. Datenbankmigrationen und automatisierte Tests laufen in einer isolierten PostgreSQL-kompatiblen Testdatenbank. Die Vorschau verwendet derzeit eine nicht dauerhafte In-Memory-Datenbank.

Vor einem Echtbetrieb müssen persistente Datenbank, echte Authentifizierung, Zugriffskontrollen, sicherer Medien-Storage, echte ID-Austria-Anbindung und vollständige End-to-End-Tests eingerichtet werden.
