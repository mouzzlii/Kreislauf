# Chatbasierte Projekt- und Main-Referenz

**Stand:** 26.11.2026  
**Zweck:** Diese Übersicht überführt bestätigte Nutzerentscheidungen aus den bisherigen Projekt-Chats in eine nachvollziehbare, chatübergreifende Referenz. Sie ist ein Navigations- und Koordinationsdokument, kein Ersatz für projektspezifische Spezifikationen, Quellcode, Tests oder Freigaben.

## 1. Verbindliche Arbeitsregeln für alle Projekte

- Die bisherigen Chats sind die Anforderungs- und Entscheidungshistorie. Bei widersprüchlichen Angaben gilt die zeitlich neueste ausdrücklich bestätigte Nutzerentscheidung; ältere Entscheidungen bleiben als Historie erkennbar, wenn sie noch relevant sind.
- Nutzerentscheidungen, technische Vorschläge, implementierter Code, automatisierte Tests, reale Gerätetests und Produktionsfreigaben sind getrennt auszuweisen.
- Nie eine frühere Assistentenbehauptung als Beweis behandeln. Externe APIs, KI-Council-Antworten, Builds, Deployments und Hardwaretests nur mit tatsächlichem Nachweis melden.
- Bestehende Programme, Open-Source-Projekte und bewährte kommerzielle Lösungen vor Eigenentwicklung prüfen. Nur nach Lizenz-, Sicherheits-, Wartbarkeits- und Kompatibilitätsprüfung übernehmen.
- GitHub-Änderungen auf Aufgaben-Branches vorbereiten und über nachvollziehbare PRs integrieren. main bleibt unangetastet, wenn die dortigen Informationen aktuell sind. Veraltete oder fehlende bestätigte Projektinformationen dürfen kontrolliert aktualisiert werden.
- Keine Datenverluste, kein Überschreiben fremder Arbeit, keine Force-Pushes, keine ungeprüften Merges oder Produktionsänderungen.
- Keine Passwörter, API-Schlüssel, privaten Signierschlüssel, Kunden-/Empfängerdaten oder privaten Fotos anfordern oder in Git committen.
- Keine kostenpflichtigen Dienste, API-Aufrufe, Abonnements oder Deployments ohne ausdrückliche Kostenfreigabe.
- Android-Smartphone ist der primäre und derzeit einzige vom Nutzer vorausgesetzte Bedien-/Testzugang. Keine Schritte voraussetzen, die einen PC, eine Kommandozeile oder Programmierkenntnisse des Nutzers benötigen.
- Gemeinsame Module erst nach eigenständigen Tests und Sicherheitsprüfung projektübergreifend wiederverwenden. Projekte mit ausdrücklich unabhängiger Datenhaltung bleiben getrennt.
- Keine Bilder ungefragt generieren. Für Projekte mit Bildbedarf klare Design-/Illustrationsbriefings erstellen, sofern keine ausdrückliche Bildgenerierung beauftragt ist.

- **Interdisziplinäre Teamarbeit:** Größere/komplexe Aufträge werden in mehrere Arbeitsstränge/Teams mit bewusst gemischten Denkweisen aufgeteilt: Strategie/Produkt, Architektur/Systemdenken, Forschung/Recherche, Kreativität/Innovation, Praxis/Umsetzung, Sicherheit/Datenschutz, Wirtschaftlichkeit, UX/Barrierefreiheit und Qualität/adversariale Prüfung. Teams arbeiten parallel, wo unabhängig, und prüfen sich gegenseitig. ChatGPT koordiniert und synthetisiert. Externe KIs oder Personen zählen nur bei tatsächlicher Verbindung, übermitteltem Auftrag und empfangener Antwort als beteiligt; keine simulierten Reviews.
- **Dauerhafte Verankerung neuer Befehle:** Jede neue ausdrücklich bestätigte globale Regel wird ab Eingang in der zentralen Grundstruktur und im Entscheidungsregister festgehalten und bis zu Widerruf/Ersatz angewendet. Betroffene Projektbaselines, Spezifikationen, Architektur, Aufgaben und Tests werden bereits ab Planung angepasst. Nur tatsächlich betroffene Projekte erhalten die Regel; keine vertraulichen Informationen in öffentliche Repositories übernehmen.
- **Auftragsklärung vor größeren Arbeiten:** Zuerst Ziel, bestehende Entscheidungen, Risiken und offene Punkte selbstständig analysieren. Danach alle wirklich notwendigen Nutzerfragen gebündelt und ausschließlich als verständliche Auswahlmöglichkeiten mit Empfehlung stellen. Bekannte Informationen nicht erneut erfragen und technische Entscheidungen selbst recherchieren. Wenn nichts Wesentliches offen ist, ohne künstliche Rückfragen beginnen. Kosten, irreversible Änderungen, Produktionsfreigaben und wesentliche Sicherheits-/Datenschutzrisiken benötigen weiterhin ausdrückliche Freigabe.

## 2. Projektübersicht – bestätigte Chats und aktueller Repository-Abgleich

### TRAKUNA – Paketshop- und Multi-Carrier-System

**Repositories**
- Android-App: [mouzzlii/Fuck](https://github.com/mouzzlii/Fuck)
- Architektur und Carrier-Integration: [mouzzlii/multi-carrier-gateway](https://github.com/mouzzlii/multi-carrier-gateway)
- multi-carrier-gateway-neu ist ein separates Experiment und nicht automatisch die kanonische Implementierung.

**Bestätigtes Zielbild (26.11.2026)**
- Ein Smartphone als zentrale Bedienoberfläche.
- Ein einziger Etikettendrucker für alle vorgesehenen Versanddienstleister.
- WLAN und Bluetooth als auswählbare Druckverbindungen, sofern das konkrete Druckermodell beide Wege unterstützt.
- Zebra-Handgeräte sind in diesem Portalablauf nur Internet-/Portalgeräte; keine neue Zebra-Scanner-/DataWedge-Hardwareintegration dafür planen.
- Anbieterportale bleiben nutzbar. Labelübergabe nur über offizielle API-, Download-, Teilen- oder andere dokumentierte Portalwege.
- Drucksteuerung direkt am Android-Smartphone; kein zusätzlicher PC, Cloud-Druckdienst oder separater Printserver als Voraussetzung.
- Zentrale Druckwarteschlange, Labelintegritätsprüfung, Duplikatschutz und ehrliche Druckstatus sind Pflicht.

**Vorgesehene Anbieterprofile**
DPD, GLS, Hermes, UPS, Österreichische Post, DHL Express, FedEx und LogoiX. Diese Profile sind keine bestätigten produktiven Carrier-Integrationen. API-/Partnerzugang, Verträge und Labelbereitstellung müssen je Anbieter nachgewiesen werden.

**Aktueller GitHub-Stand**
- Gateway PR #4: offene Architekturänderungen; Smartphone-/Ein-Drucker-Konzept und Spezifikation sind dort dokumentiert, nicht in main gemergt.
- Gateway PR #5: Dokumentationskorrektur am 26.11.2026 in main gemergt (Commit c1e0f244ff38c699bc3b01e9c818273da1d529cd); README und Projektkoordination enthalten das bestätigte Ein-Drucker-Ziel und den damaligen CI-Status.
- App PR #25: Draft/offen, nicht gemergt; Head-SHA c631fc4f8f977a312f1810101a4805dd386a1124. Build-Run [45868812214](https://github.com/mouzzlii/Fuck/actions/runs/45868812214) und Emulator-Instrumentierungs-Run [45868812255](https://github.com/mouzzlii/Fuck/actions/runs/45868812255) waren für exakt diesen Commit erfolgreich. Kein physischer Zebra-, Smartphone- oder Druckertest daraus ableiten.
- App PR #33: Draft/offen; Abhängigkeiten zum Gateway beachten.
- Kein vollständiger produktiver Carrier-Backend-Dienst und keine bestätigte Live-Carrier-Buchung behaupten.
- Vorhandene Scanner-/DataWedge-Arbeit in offenen PRs nicht unkontrolliert löschen; nach der neuen Produktentscheidung separat auf Relevanz prüfen.

**Offen**
- Konkretes Smartphone-/Android-Modell und Druckermodell/Firmware/Protokolle prüfen.
- Android-Systemdruck, Hersteller-SDK und direkte lokale WLAN-/Bluetooth-Verfahren vergleichen.
- Je Anbieter offiziell unterstützte Labelübergabe nachweisen.
- Echte Drucktests, Barcode-/QR-Lesbarkeit, Wiederverbindung und Duplikatschutz abnehmen.

### KREISLAUF – regionales Tauschsystem Yspertal / B36

**Repository:** [mouzzlii/Kreislauf](https://github.com/mouzzlii/Kreislauf)

**Bestätigtes Ziel**
Ein regionales Kreislauf-, Tausch- und Hilfesystem für Menschen, Vereine, Schulen und Betriebe im Yspertal und entlang der B36. Waldgrün/Naturfarben, hochwertige mobile Bedienung und die W-Signatur in Gold/Waldgrün.

**Bestätigte Funktions- und Produktanforderungen**
- Marktplatz mit getrennten Bereichen für Gesuche („Ich suche“) und Angebote („Ich biete“) sowie einer Ansicht für Angebote in der Nähe.
- Inserat öffnet eine Produktdetailseite; dort soll ein gut sichtbarer Weg zu weiteren Inseraten desselben Anbieters vorhanden sein.
- Produktfoto in der Inseratvorschau.
- Beim Erstellen eines Inserats Foto- und Kurzvideoauswahl mit den vorgesehenen Begrenzungen: entweder 1 × 60 Sekunden, 2 × 30 Sekunden oder 4 × bis zu 20 Sekunden.
- Nachrichten sind mit Inseraten, Tauschanfragen, Angeboten und dem zugehörigen Tauschvorgang verbunden; eingehende Angebote lösen passende Nachrichten aus.
- Direkter Tausch, Tausch gegen Punkte und kombinierte Angebote.
- Gemeinschaftsfonds und Inflationsschutz sind Teil der gewünschten Punktearchitektur. Die konkrete endgültige Berechnungsregel muss getrennt von vorhandenen Codewerten dokumentiert werden.
- Das Element „3 Punkte 1 Ort“ soll als Koordinations-/Gemeinschaftselement wieder enthalten sein.
- Treuhand, Moderation, Profile, mobile Bedienung und Admin gehören zum Funktionsumfang.
- Keine Nutzer-zu-Nutzer-Geldtransfers. Punkte sind internes Gemeinschaftsguthaben, kein Geld und nicht auszahlbar.
- Die frühere Produktentscheidung bevorzugt zunächst eine Demo/Testversion; bestehende Supabase-Projekte werden nicht als bereits angebunden ausgegeben.

**Aktueller Repository-Abgleich**
- main-README beschreibt eine Demo-/Entwicklungsbasis, Waldgrün-Oberfläche, Marktplatz, Karma-Ledger, Profile, Tauschabläufe und Nachrichten.
- Treuhand-/Sharing-Demo mit Community-Abstimmungen ist laut README weiterhin in einem getrennten Preview-Branch und nicht als Main-/Produktionsfunktion abzunehmen.
- App-Code verwendet aktuell PGlite oder Neon/Postgres über DATABASE_URL; Supabase ist nicht automatisch verbunden.
- Authentifizierungslose Demo darf nicht öffentlich betrieben werden.
- Die oben aufgeführten neueren Medien-, Detailseiten- und Punkteanforderungen sind bestätigte Produktanforderungen; ihre vollständige Umsetzung ist nicht aus dem README allein nachgewiesen.

### MENSCHHEITSFAMILIE – „Der Tausch verbindet uns“

**Projektstatus:** eigenständige Community-/Gesellschaftsebene mit konzeptioneller Verbindung zu KREISLAUF; Daten- und Berechtigungsgrenzen bleiben getrennt.

**Bestätigte Leitlinien**
- Slogan: „Der Tausch verbindet uns“.
- „Keine Werbung. Kein Geld. Nur echte Verbindungen.“
- Geldloser Austausch von Gütern, Dienstleistungen, Punkten, B2B-Leistungen, Bürger-/Hilfsaufgaben und Offline-QR-Märkten.
- Gemeinschaftspunkte, Community-Fonds, Anti-Inflations-/Anti-Deflationsmechanismen und gemeinnützige Aufgaben als mögliche Verteilungswege.
- Keine Werbung und keine Nutzergebühren als Leitlinie; Finanzierungsideen über freiwillige Sponsoren-/Partnerbeiträge sind Konzept, nicht als gesicherte Finanzierung ausgeben.
- Moderation und Treuhand müssen transparent, nachvollziehbar und gegen Interessenkonflikte geschützt sein.

**Repository-Hinweis:** mouzzlii/Gemeinwohl enthält laut aktuellem Root-Inventar derzeit ein ZIP-Artefakt und einen Rechtehinweis, aber keinen aus dem Root-README verifizierbaren vollständigen Quellbaum. Deshalb keine aktive Plattformimplementierung behaupten.

### SCAN-PROFIT – Reseller-Cockpit

**Repository:** [mouzzlii/SCAN-PROFIT](https://github.com/mouzzlii/SCAN-PROFIT)

**Bestätigtes Ziel**
Eigenständiges, deutschsprachiges und Österreich-fokussiertes mobiles Reseller-Cockpit. SCAN-PROFIT bleibt unabhängig von INSERAT-PROFI AI; keine Laufzeitabhängigkeit und keine gemeinsame Datenbank.

**Dokumentierter Umfang**
Barcode-/Produkteingabe, Einkaufskalkulation, Bestand, Käufe/Verkäufe, Gewinn-/Lageranalyse, Suchradar, JSON-Backup und CSV-Export. Local-first ohne Benutzerkonto und ohne Cloud-Synchronisierung.

**Nachweisbarer Stand**
- Repository-README führt Version 2.0.66.
- Release-Verifikation vom 25.11.2026 dokumentiert 155/155 Tests, statischen Build und Smoke-Test als bestanden.
- Production-Deployment wurde für Commit a40045f168289c3a43e13c90935a5150fc41010b als Vercel READY dokumentiert.
- Direkter unabhängiger Abruf der aktuellen Production-Ressourcen/HTTP-Header sowie Android-Praxis- und Live-Schnittstellentests waren laut Release-Dokument noch offen.
- Ein erwähntes 2.0.67-Quellpaket darf ohne tatsächlich vorliegendes und geprüftes Archiv nicht als vorhandener Release ausgegeben werden.

### INSERAT-PROFI AI – Inseratsproduktion

**Repository:** [mouzzlii/INSERAT-PROFI-AI](https://github.com/mouzzlii/INSERAT-PROFI-AI)

**Bestätigtes Ziel**
Eigenständige App zur Erstellung und Verwaltung vieler Produktinserate; eigene Oberfläche, Datenhaltung und Versionierung. SCAN-PROFIT bleibt eigenständig.

**Dokumentierter Umfang und Grenzen**
- Next.js-PWA, Mehrfachimport von Fotos, IndexedDB, manuelle Produktgruppen, bis zu 100 Inseratsgruppen und 2.000 Fotos im lokalen Arbeitsbereich.
- Produktentwurf mit Titel, Kategorie, Marke, Modell, Zustand und Beschreibung.
- Preisrecherche über Vergleichssuchen und manuelle Preiseingabe; keine automatischen Verkaufspreise behaupten.
- Optionale serverseitige KI-Bildanalyse ist nur bei gesetztem serverseitigem API-Schlüssel aktiv; Fotoübertragung nur nach ausdrücklicher Bestätigung.
- Gruppierungsvorschläge anhand Dateinamen sind nicht gleichbedeutend mit vollautomatischer KI-Bilderkennung.
- CSV ist kein bestätigtes willhaben-Importformat. Automatisches willhaben-Veröffentlichen ist nicht implementiert.
- Lokale Browserdaten sind kein Cloud-Backup. Android-Praxistest und produktive KI-Kostenprüfung bleiben offen.

### CHRONOS – privates Fotoarchiv

**Repository:** [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS)

**Abgrenzung:** CHRONOS (Fotoarchiv) ist nicht dasselbe Projekt wie KRONOS 01.

**Dokumentierter Stand**
- Lokaler Fotoarchiv-Prototyp, Milestone 0.5.
- Desktop- und Android-Anwendung arbeiten getrennt und lokal; keine Synchronisierung.
- Read-only-Scan, SHA-256-Duplikate, EXIF-/Metadaten, lokale Vorschaubilder, vorsichtige Ähnlichkeitskandidaten, Tages-Zeitleiste und heuristische Ereignisvorschläge.
- Originalfotos werden nicht verändert oder gelöscht.
- Lokale API ist nur für Loopback vorgesehen; keine Authentifizierung/TLS für Mehrbenutzerbetrieb.
- Desktop-Backup enthält Indexdaten und Vorschaubilder, keine Originalfotos; ZIP ist nicht verschlüsselt.
- Python-CI und Android-/Robolectric-Prüfungen sind in der Statusdokumentation belegt. Echte Android-Geräte-, Prozessabbruch-, Backup-/Restore- und Großbibliothekstests bleiben offen.
- Gesichtserkennung ist nicht enthalten und darf nicht ohne ausdrückliche Einwilligung sowie Datenschutz-/Rechtsprüfung ergänzt werden.

### KI-ARBEITSPLATZ – zentrale Entwicklungs-/Koordinationshilfe

**Repository:** [mouzzlii/KI-Arbeitsplatz](https://github.com/mouzzlii/KI-Arbeitsplatz)

**Bestätigtes Ziel**
Bestehendes Projekt „KI-Arbeitsplatz – Meisterwerk Edition v1.0.0“ fortführen statt doppelt entwickeln. Android-Smartphone ist die maßgebliche Nutzerplattform; ursprüngliche Windows-Annahmen sind nicht mehr passend. Vorgesehen sind zentrale Auftragsverwaltung, Projektkoordination, sichere GitHub-Arbeit, Tests/Fehlerprotokolle und Wiederherstellung.

**Tatsächlicher GitHub-Stand beim Audit**
- Repository-Root enthält aktuell .github/ und KI-Arbeitsplatz-Meisterwerk-v1.0.0.zip.
- Kein README und kein aus dem Root-Inventar erkennbarer editierbarer Quellbaum.
- Funktionsfähiger autonomer Agent, Android-Betrieb und End-to-End-Tests sind damit nicht nachgewiesen.
- Keine zweite parallele Implementierung beginnen, bevor das vorhandene ZIP vollständig geprüft und der Quellstand geklärt wurde.

### Weitere Konzept- und Forschungsprojekte

Die folgenden Projekte wurden in Chats besprochen. Sie werden als eigene Projektstränge geführt, aber nicht mit unbelegten Implementierungs- oder Testständen versehen. Technische Erfindungsdetails bleiben aus öffentlichen Portfolio-Dokumenten heraus.

- **KRONOS 01:** eigenständiges Projekt; nicht mit CHRONOS-Fotoarchiv verwechseln. W-Signatur und Gold/Waldgrün als gewünschte Markenfarbwelt berücksichtigen.
- **KREISLAUF ReFlex / VacMail:** Produkt- und Verpackungs-/Schutzkonzepte. Konzeptstand, Materialannahmen und offene Machbarkeit sind von nachgewiesenen Prototypen zu trennen. Keine technische Produktionsreife behaupten.
- **VR-SCENT:** eigenständiger Forschungs-/Produktstrang; modulare Erweiterbarkeit und Betrieb mit VR oder Steuerungs-App sind bestätigte Richtungen. Speicherung und konkrete technische Umsetzung bleiben Prüfaufgaben.
- **KREISLAUF AIRLESS:** langfristiger Forschungsstrang; Kosten-Nutzen, Rollwiderstand und Lebensdauer vor Prototypenbau prüfen.
- **Implosionsmotor:** langfristiger, paralleler Forschungsstrang; zunächst Theorie, technische Plausibilität und wirtschaftliche Bewertung, keine vorschnellen Prototypen.
- **Weitere Repositories/Projekte:** Pakete, Pakete-neu, Paketescanner, ShopScannerNeu, Pakete-Scanner, book-your-cook, Lara_Quiz und logo-M-glichkeiten- sind im GitHub-Konto vorhanden. Wo die Chat-Zuordnung oder der aktuelle fachliche Auftrag nicht eindeutig belegt ist, keine Projektziele erfinden oder Änderungen vornehmen. Das Logo-Repository ist die verbindliche Quelle der W-Signatur.

## 3. Gemeinsames Branding

Das Repository [logo-M-glichkeiten-](https://github.com/mouzzlii/logo-M-glichkeiten-) enthält die verbindlichen Originaldateien und Regeln:

- W-Dachmarke: Gold auf Waldgrün.
- KREISLAUF: Gold/Waldgrün.
- TRAKUNA und SCAN-PROFIT: blaue Originalvariante für Technologie-/Softwarekontexte.
- Weiße Variante für geeignete dunkle Kontraste.
- Originalmarke niemals neu zeichnen, KI-generieren, umfärben, verzerren, beschneiden oder geometrisch verändern. Nur proportionale Skalierung und freigegebene Originaldateien verwenden.

## 4. KI-Council und externe Dienste

- Gewünschter Arbeitsablauf: ChatGPT koordiniert; Claude und Meta/Llama entwickeln unabhängig und prüfen gegenseitig.
- Nur echte API-/MCP-Verbindungen und tatsächlich empfangene Antworten als Council-Ergebnis ausgeben.
- Die in KREISLAUF vorhandene Relay-Basis ist nicht gleichbedeutend mit einem aktuell aktiven Council. Provider-Secrets, Modellkennungen, sichere Endpunkte, Kostenlimits und ausdrückliche Budgetfreigabe sind Voraussetzungen.
- Ohne echte Provider-Aufrufe keine Claude-/Meta-/Llama-Antworten oder unabhängige Reviews behaupten.
- Keine Secrets oder persönlichen Zugangsdaten im Chat oder in GitHub ablegen.

## 5. Priorisierung und Arbeitsmodus

- TRAKUNA ist derzeit eine hohe Umsetzungspriorität; innerhalb von TRAKUNA gilt die projektspezifische Regel: genau ein priorisiertes Ticket gleichzeitig.
- KREISLAUF und Menschheitsfamilie fachlich verbunden, aber mit getrennten Daten- und Berechtigungsgrenzen.
- SCAN-PROFIT und INSERAT-PROFI AI bleiben eigenständige Produkte ohne gegenseitige Laufzeitabhängigkeit.
- KI-Arbeitsplatz soll langfristig zentrale Entwicklungs- und Koordinationshilfe werden; zunächst vorhandenen ZIP-Stand prüfen.
- AIRLESS und Implosionsmotor als langfristige Hintergrundstränge mit geringem Ressourcenverbrauch verfolgen.
- Vor Umsetzung zuerst Bestand, bewährte Open-Source-/Kommerziellösungen, Lizenz, Sicherheit, Kosten und Android-Tauglichkeit prüfen.

## 6. Einheitliche Statussprache

- **Entschieden:** vom Nutzer ausdrücklich festgelegte Produktanforderung.
- **Geplant:** vorgesehener, aber noch nicht implementierter Arbeitsschritt.
- **Implementiert:** Code oder Dokumentation ist nachweislich im angegebenen Branch vorhanden.
- **Automatisiert geprüft:** konkrete Tests/CI-Läufe sind für den exakten Commit erfolgreich.
- **Extern geprüft:** realer Anbieter-, Geräte- oder Produktionsablauf wurde tatsächlich ausgeführt.
- **Produktionsbereit:** alle notwendigen Sicherheits-, Datenschutz-, Anbieter-, Betriebs- und Abnahme-Gates sind erfüllt.

Ein README-Eintrag, ein offener PR, ein erfolgreicher Build oder ein Preview-Link beweist allein keine externe Abnahme oder Produktionsreife.

## 7. Pflegeprozess

1. Chat-/Entscheidungshistorie und jüngste ausdrückliche Nutzerkorrekturen prüfen.
2. GitHub-Repository, main, Projektanweisungen, offene PRs/Issues und exakte CI-SHAs lesen.
3. Widersprüche markieren; Nutzerentscheidungen haben Vorrang vor alten Assistentenannahmen.
4. Nur bestätigte, passende Informationen in das jeweilige Projekt-README oder die kanonische Spezifikation übernehmen.
5. Vertrauliche Details ausschließlich in passende private Repositories; keine Erfindungsdetails in öffentliche Übersichten.
6. Änderungen klein, nachvollziehbar und branchbasiert vorbereiten.
7. Nach PR-Merge main erneut lesen und den exakten Commit verifizieren.
8. Wenn main aktuell ist, nichts ändern.
