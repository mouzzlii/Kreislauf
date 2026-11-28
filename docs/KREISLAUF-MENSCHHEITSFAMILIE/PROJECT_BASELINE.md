## Einordnung in das X-PHONE-Gesamtkonzept

KREISLAUF – Menschheitsfamilie ist innerhalb der X-PHONE-Produktvision das vorgesehene Systemmodul **LOCAL VALUE GRID**. X-PHONE ist dabei die übergeordnete Präsentations- und Veröffentlichungsarchitektur; KREISLAUF bleibt das eigenständige Produkt mit eigener Codebasis, Datenhoheit, Rollen-/Berechtigungslogik, Releaseplanung und Sicherheitsabnahme.

Diese Zuordnung behauptet keine bereits vorhandene gemeinsame Anmeldung, gemeinsame Datenbank, gemeinsame App-Shell oder technische Kopplung. Eine spätere Integration benötigt eigene API-Verträge, Datenschutz-/Bedrohungsmodell, Rollenabgrenzung und nachgewiesene Tests.

Die übergeordnete X-PHONE-Konzeptbaseline wird in [KI-Arbeitsplatz PR #23](https://github.com/mouzzlii/KI-Arbeitsplatz/pull/23) dokumentiert. Sie ist dort als Draft-PR offen und noch nicht gemergt.

# KREISLAUF – Menschheitsfamilie
## Gemeinsame Produktbaseline

**Stand:** 28.11.2026  
**Status:** Zusammenführung konzeptionell beschlossen; Dokumentation auf Integrationsbranch erstellt. Keine Produktionsfreigabe.  
**Leitspruch:** Der Tausch verbindet uns.  
**Leitlinie:** Keine Werbung. Kein Geld. Nur echte Verbindungen.

## 1. Produktidentität und Ziel

KREISLAUF – Menschheitsfamilie ist **ein gemeinsames Produkt und eine gemeinsame Plattform** für geldlosen Austausch, gegenseitige Hilfe, gemeinschaftliche Ressourcen und regionale Kreislaufwirtschaft.

Die bisher getrennten Vorhaben „KREISLAUF“ und „Menschheitsfamilie – Der Tausch verbindet uns“ werden nicht als zwei konkurrierende Apps oder getrennte Entwicklungsprojekte fortgeführt. Ihre Anforderungen, Ideen und bisherigen Arbeitsergebnisse werden in dieser Produktbaseline konsolidiert.

- **KREISLAUF** bleibt der bestehende technische Produkt- und Repository-Anker.
- **Menschheitsfamilie** beschreibt die übergeordnete gesellschaftliche Vision und Gemeinschaftsidentität.
- **Yspertal / B36** ist die erste vorgesehene Pilotregion, nicht die technische oder geografische Grenze des Produkts.
- Weitere Gemeinden und Regionen sollen später über dieselbe Plattform hinzukommen.
- Die endgültige öffentliche Markenarchitektur (z. B. „KREISLAUF – Menschheitsfamilie“) bleibt als Branding-Entscheidung offen. Daraus entsteht kein zweites Produkt.

## 2. Ziele und Nicht-Ziele

### Ziele
- Güter, Fähigkeiten, Dienstleistungen und Hilfe einfacher zugänglich machen.
- Ungenutzte Ressourcen regional und später überregional in Umlauf bringen.
- Nachbarschaftshilfe, Ehrenamt, Vereine, Schulen, Unternehmen und Gemeinden verbinden.
- Ein nachvollziehbares, nicht auszahlbares Gemeinschaftsguthaben ermöglichen.
- Vertrauen, Transparenz, Datenschutz und faire Beteiligung als Kernfunktionen verankern.
- Eine hochwertige, barrierearme und mobile Bedienung bieten.

### Nicht-Ziele und feste Grenzen
- Keine Nutzer-zu-Nutzer-Geldtransfers und keine Zahlungsfunktion.
- Punkte sind kein Geld, nicht auszahlbar und begründen keinen Anspruch auf Euro-Auszahlung.
- Keine Werbung und grundsätzlich keine Nutzergebühren als Produktleitlinie.
- Keine Behauptung, dass Sponsoring, Spenden oder Partnerbeiträge bereits gesichert sind.
- Keine öffentliche Nutzung einer Demo ohne echte Authentifizierung und angemessene Sicherheitsgrenzen.
- Keine produktiven Punkte-, Treuhand- oder Identitätsprozesse ohne gesonderte fachliche, rechtliche und technische Abnahme.

## 3. Zielgruppen und Einsatzfelder

- Privatpersonen und Nachbarschaften
- Vereine und gemeinnützige Organisationen
- Schulen, Bildungseinrichtungen und Jugendprojekte
- Lokale Unternehmen und Handwerksbetriebe
- Gemeinden und regionale Initiativen
- Freiwillige, Helfer und organisierte Gemeinschaftsprojekte

Austauscharten:
- Ware gegen Ware
- Dienstleistung gegen Dienstleistung
- Ware gegen Dienstleistung
- Ware oder Dienstleistung gegen Gemeinschaftspunkte
- Punkte gegen Ware oder Dienstleistung
- Kombinierte Angebote aus Punkten und konkreter Gegenleistung
- B2B-Tausch und organisierte Sach-/Dienstleistungsbeiträge
- Freiwilligen-, Bürger- und Aufgabenprojekte
- Offline-Tauschmärkte und QR-gestützte Übergaben

## 4. Produktmodule

### 4.1 Marktplatz
- Drei klar erkennbare Ansichten: **In der Nähe**, **Gesuche** („Ich suche“) und **Angebote** („Ich biete“).
- Kategorien für Waren, Dienstleistungen, Hilfe, Ehrenamt, gemeinsames Nutzen und Projekte.
- Such- und Filterfunktionen sowie regionale Zuordnung.
- Inserat öffnet eine eigene Detailseite.
- Auf der Detailseite ist ein gut sichtbarer Weg zu weiteren Inseraten desselben Anbieters vorhanden.
- Produkt-/Profilfoto wird in der Inseratsvorschau sichtbar dargestellt.
- Beim Erstellen eines Inserats können Fotos und Kurzvideos bearbeitet/ausgewählt werden.
- Vorgesehene Videolimits: wahlweise 1 × 60 Sekunden, 2 × 30 Sekunden oder 4 × bis zu 20 Sekunden. Upload-, Speicher-, Moderations- und Größenlimits sind vor Implementierung technisch und kostenbezogen festzulegen.

### 4.2 Tausch und Vorgangsverwaltung
- Direkter Tausch, Punkte-Tausch und kombinierte Angebote.
- Jeder Vorgang besitzt einen nachvollziehbaren Status und eine Historie.
- Angebot, Gegenangebot, Annahme, Ablehnung, Rückzug, Übergabe, Streitfall und Abschluss sind getrennte Zustände.
- Beide Parteien bestätigen die relevanten Vereinbarungen und den Abschluss.
- Doppelbuchungen und wiederholte Requests müssen serverseitig idempotent abgefangen werden.

### 4.3 Nachrichten und Benachrichtigungen
- Nachrichten sind keine isolierte Chatfunktion, sondern an Inserat, Tauschanfrage, Angebot und Tauschvorgang gebunden.
- Eingehende Angebote und relevante Statusänderungen erzeugen passende Systemnachrichten/Benachrichtigungen.
- Ein zentraler Posteingang bietet Überblick; jeder Chat bleibt dem zugehörigen Kontext zugeordnet.
- Zugriff auf Gespräche wird serverseitig anhand der Beteiligung und Berechtigungen geprüft.

### 4.4 Gemeinschaftspunkte und Fonds
- Internes, nicht auszahlbares Gemeinschaftsguthaben.
- Unveränderliches, nachvollziehbares Buchungsjournal (Ledger).
- Gemeinschaftsfonds für nachvollziehbar definierte gemeinschaftliche Zwecke.
- Punkte können über freigegebene Aufgaben, freiwillige Hilfe, Projekte oder bestätigte Beiträge entstehen.
- Schutz gegen Inflation, Deflation, Manipulation, Mehrfachkonten und unfaire Konzentration.
- Jede Ausgabe, Vergabe, Korrektur, Reservierung und Rückbuchung benötigt einen klaren Grund und Auditspur.
- Bereits im Code vorhandene Sätze/Fees sind nicht automatisch die endgültige Nutzerentscheidung.
- Vor einer Live-Punkteökonomie müssen Regeln, Grenzen, Finanzierung, Umlaufmenge, Verfall/Stillstand, Korrekturen und Streitfälle fachlich und rechtlich geprüft werden.

### 4.5 „3 Punkte 1 Ort“
- Als gemeinschaftliches Koordinations- und Aktivierungselement erhalten.
- Detaillierte Mechanik, Berechtigungen und Auswirkungen auf Punkte werden in einer eigenen Spezifikation festgelegt.
- Keine automatische Gutschrift oder Geld-/Punktebewegung ohne bestätigte Regeln und nachvollziehbare Buchung.

### 4.6 Profile, Vertrauen und Bewertungen
- Profile mit regionalem Bezug, Angeboten, Gesuchen und abgeschlossenen Tauschvorgängen.
- Bewertungen erst nach einem nachvollziehbar abgeschlossenen Vorgang.
- Text- und Medienbewertungen nur mit Moderations- und Datenschutzregeln.
- Identitätsprüfung (z. B. ID Austria oder geeigneter Anbieter) bleibt eine optionale, gesondert zu prüfende Integration; keine bestehende Anbindung behaupten.

### 4.7 Treuhand, Moderation und Konflikte
- Treuhand ist ein kontrollierter Vorgangsstatus, kein bloßer UI-Schalter.
- Reservierung und Freigabe von Punkten müssen atomar, idempotent und serverseitig erfolgen.
- Streitfall-, Einspruchs-, Rückabwicklungs- und Kulanzregeln sind vor Realbetrieb festzulegen.
- Zielbild Moderation: sieben zugeteilte Personen, mindestens vier Stimmen und Zweidrittelmehrheit; Befangenheit, Enthaltung, Fristen, Begründung und Einspruch sind zusätzlich zu spezifizieren.
- Admin- und Moderationsrechte sind strikt getrennt, minimal und auditierbar.

### 4.8 Organisationen, Gemeinschaft und Offline
- Bereiche für Schulen, Vereine, Unternehmen und Gemeinden.
- Aufgaben, Freiwilligenarbeit, Nachbarschaftshilfe und Gemeinschaftsprojekte.
- Offline-Tauschmärkte mit QR-gestützter Zuordnung/Übergabe.
- QR-Codes sind kein alleiniger Identitäts- oder Zahlungsnachweis; kritische Aktionen brauchen serverseitige Prüfung.

## 5. Regionen und Skalierung

1. **Pilot:** Yspertal und B36 – regionale Angebote, Gesuche, Hilfe, Partner und reale Nutzungsabläufe zunächst in einer kontrollierten Testumgebung.
2. **Organisationsausbau:** Schulen, Vereine, Unternehmen und Gemeinden mit eigenen Rollen und nachvollziehbaren Beiträgen.
3. **Weitere Regionen:** dieselbe Plattform, gemeinsame technische Basis, regionale Sichtbarkeit und Fondsregeln.
4. **Überregionaler Austausch:** erst nach Klärung der regionalen Punktekompatibilität, Zuständigkeiten, Moderation und Missbrauchsgrenzen.

Regionen sind Mandanten-/Gebietskonfigurationen innerhalb eines Produkts, keine getrennten Apps. Datenzugriff, Moderationszuständigkeit und Fondsführung müssen dennoch sauber nach Region und Rolle geregelt sein.

## 6. Architekturprinzipien

- Bestehendes Repository: [mouzzlii/Kreislauf](https://github.com/mouzzlii/Kreislauf).
- Bestehenden Quellcode, PRs, Demo und Dokumentation zuerst prüfen und weiterentwickeln; kein neues Ersatzrepository aufbauen.
- Bestehender Stack laut Repository: TypeScript, React/Vite/TanStack, Tailwind, PGlite/Neon-Pfad. Keine ungeprüfte Behauptung, dass das Repository bereits Next.js oder Supabase produktiv nutzt.
- Supabase-Projekte existieren, sind aber nicht automatisch mit dem aktuellen App-Code verbunden. Datenbankanbieter und Migrationspfad müssen bewusst entschieden werden.
- Modularer Aufbau für Marktplatz, Tausch-Lifecycle, Ledger, Fonds, Nachrichten, Moderation, Medien, Organisationen und Regionen.
- Server ist die Vertrauensgrenze: keine sicherheitskritische Buchung oder Rollenentscheidung allein im Browser.
- Standardmäßig minimale Rechte, serverseitige Validierung, RLS/Policy-Prüfung bei Supabase, Audit-Events, Rate-Limits, Idempotenz und Backups.
- Mobile-first, barrierearm, Waldgrün/Naturfarben; bestehende W-Signatur/Branding-Regeln respektieren.

## 7. Bestehende Quellen und Zusammenführung

- **Kanonischer Produkt-/Code-Anker:** `mouzzlii/Kreislauf`.
- **Historische Konzeptquelle:** `mouzzlii/Gemeinwohl` (bisherige Menschheitsfamilie). Das Repository wird nicht gelöscht oder umbenannt; sein Inhalt ist als Quellmaterial zu prüfen und in die gemeinsame Baseline zu übernehmen.
- Vorhandene HTML-Demos, SQL-Dateien, Spezifikationen, PRs und Issues bleiben historische bzw. technische Quellen, bis ihre Inhalte gegen den aktuellen Quellstand geprüft wurden.
- Keine parallele Implementierung in `Gemeinwohl` beginnen.
- Keine Repository-Archivierung, Löschung, Migration oder Umbenennung ohne gesonderte Prüfung und Freigabe.

## 8. Entwicklungsphasen

### Phase 0 – Konsolidierung und sichere Demo
- Alle bisherigen Anforderungen und Entscheidungen zusammenführen.
- Demo-/Preview-/main-Funktionsstand einzeln inventarisieren.
- Überschneidende PRs und Abhängigkeiten prüfen.
- Einheitliche Produktnavigation, Marktplatzansichten und Tausch-Lifecycle festlegen.
- Keine produktive Datenbank oder echten Nutzerkonten voraussetzen.

### Phase 1 – Regionaler MVP
- Authentifizierte Profile und Rollen in einer kontrollierten Umgebung.
- Marktplatz: In der Nähe, Gesuche, Angebote, Detailseiten und Anbieterprofil.
- Inseratfotos und sichere Medienverarbeitung; Videos erst nach Kosten-/Moderationsprüfung.
- Inseratgebundene Anfragen, Nachrichten und Benachrichtigungen.
- Direkter Tausch und vollständiger Vorgangsstatus.
- Grundlegende Moderation, Missbrauchsmeldung und Audit-Protokoll.

### Phase 2 – Punkte und sichere Abwicklung
- Gemeinschaftspunkte und Ledger nach verabschiedeten Regeln.
- Fonds, Reservierung, Freigabe und Rückbuchung.
- Treuhand und Streitfallprozess.
- „3 Punkte 1 Ort“ nach eigener Spezifikation.
- Mehrbenutzer-, Rollen-, Idempotenz- und Wiederherstellungstests.

### Phase 3 – Gemeinschaft und Organisationen
- Schulen, Vereine, Unternehmen und Gemeinden.
- Freiwilligen-/Bürgeraufgaben und Gemeinschaftsprojekte.
- QR-Offline-Märkte und regionale Partner.

### Phase 4 – Überregionale Skalierung
- Weitere Regionen und regionale Moderationsstrukturen.
- Kompatible Punkte-/Fondsregeln und überregionale Tauschprozesse.
- Skalierungs-, Datenschutz-, Sicherheits- und Betriebsabnahme.

## 9. Verbindliche Abnahme-Gates

- Produktanforderungen und Nicht-Ziele dokumentiert.
- Code und Datenmodell entsprechen der freigegebenen Baseline.
- Automatisierte Tests und Build auf exakt dem zu prüfenden Commit erfolgreich.
- Unabhängiger Code-/Sicherheitsreview für kritische Bereiche.
- Mehrbenutzer-End-to-End-Tests mit getrennten Konten.
- Rollen-/Berechtigungs- und Datenschutzprüfung.
- Punkte-/Treuhand-Transaktionen auf Atomarität, Idempotenz und Rückabwicklung geprüft.
- Medien-Uploads, Dateitypen, Größen, Zugriff und Löschfristen geprüft.
- Backup und Restore praktisch getestet.
- Android-/Mobilgeräte-Abnahme durchgeführt.
- Externe Anbieter und Identitätsdienste nur nach belegter Freigabe integriert.
- Demo-, Preview- und Produktionsstatus transparent getrennt.

## 10. Offene Entscheidungen (nicht vorwegnehmen)

1. Endgültige öffentliche Markenbezeichnung und Logo-/Untermarken-Hierarchie.
2. Finale Punkteökonomie: Ausgabe, Umlaufmenge, Verfall, Stillstandsmechanik, Fondsanteile und Korrekturen.
3. Ob Punkte regional getrennt, vollständig gemeinsam oder mit begrenzter Umrechnung geführt werden.
4. Konkrete Regeln und Haftung für Treuhand, Streitfälle, Rückabwicklung und Moderationsentscheidungen.
5. Rechtliche Einordnung des Punktesystems, B2B-Austauschs, Spenden/Sponsoring und Datenschutz.
6. Medienanbieter, Video-Limits, Speicherbudget und Moderationsprozess.
7. Supabase vs. bestehender PGlite/Neon-Pfad und Migrationsstrategie.

## 11. Statussprache

- **Entschieden:** ausdrücklich vom Nutzer festgelegt.
- **Geplant:** Anforderung oder nächste Arbeit, noch nicht implementiert.
- **Implementiert:** im genau benannten Branch/Commit vorhanden.
- **Automatisiert geprüft:** Tests/CI für den exakten Commit erfolgreich.
- **Extern geprüft:** realer Geräte-/Mehrbenutzer-/Anbieterablauf tatsächlich getestet.
- **Produktionsbereit:** alle relevanten Abnahme-Gates erfüllt.

Diese Zusammenführung ändert keine produktiven Systeme, keine Datenbank und keinen bestehenden Hauptzweig.
