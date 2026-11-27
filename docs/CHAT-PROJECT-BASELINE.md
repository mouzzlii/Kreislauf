# Projektportfolio und chatbasierter Projektkontext

**Stand:** 27.11.2026  
**Zweck:** Diese Übersicht bündelt bestätigte Projektentscheidungen, kanonische Repositories, Abhängigkeiten, Statusnachweise und offene Aufgaben. Sie ist ein Navigations- und Koordinationsdokument, keine globale Arbeitsverfassung und kein Ersatz für projektspezifische Spezifikationen, Quellcode, Tests oder Freigaben.

## 1. Rolle dieser Projektbaseline und Abgrenzung zum MAINPROMPT

Die globale Arbeits- und Projektverfassung ist ausschließlich **MAINPROMPT 2.0.7** im privaten Repository [mouzzlii/KI-Arbeitsplatz](https://github.com/mouzzlii/KI-Arbeitsplatz), Datei `docs/MAINPROMPT.md`. Sie regelt chatübergreifend Arbeitsweise, Autonomie, Recherche, KI-Council, Kosten, Sicherheit, GitHub-Schutz, Qualität und Ergebnislieferung.

Diese Datei ist dagegen die **KREISLAUF-Projekt- und Portfolio-Baseline**. Sie dokumentiert bestätigte Projektentscheidungen, Repository-Zuordnungen, Abhängigkeiten, Statusnachweise und offene Punkte. Sie ist keine zweite globale Arbeitsverfassung und überschreibt den MAINPROMPT nicht.

Für Arbeiten an KREISLAUF gilt:
- Diese Baseline und anschließend die jeweils betroffenen KREISLAUF-Spezifikationen, Aufgaben, Issues/PRs und tatsächlichen Quellstände prüfen.
- Neueste ausdrücklich bestätigte Nutzerentscheidung für KREISLAUF verwenden; ältere Entscheidungen nur als gekennzeichnete Historie behalten.
- KREISLAUF, Menschheitsfamilie und andere Projekte trotz möglicher fachlicher Verbindung mit getrennten Daten-/Berechtigungsgrenzen behandeln.
- Produktanforderungen, Vorschläge, vorhandene Implementierung, automatisierte Tests, externe Prüfungen und Produktionsfreigaben strikt auseinanderhalten.
- Keine Projektfunktion, Anbieterintegration, KI-Antwort, Datenbankverbindung oder Geräteprüfung ohne tatsächlichen Nachweis als vorhanden bezeichnen.

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
- App PR #25: Draft/offen, nicht gemergt; aktueller Head-SHA `64e108a552ddbcaa997f49c346b54a9e10c62c4f` (Readback 27.11.2026). Build-Run [46009974496](https://github.com/mouzzlii/Fuck/actions/runs/46009974496) und Emulator-Instrumentierungs-Run [46009974511](https://github.com/mouzzlii/Fuck/actions/runs/46009974511) sind für diesen Head erfolgreich; Build, Unit-Tests, Android-Lint, APK-Build und Emulator-Instrumentierung liefen durch. Release-Signierung und Release-Veröffentlichung wurden übersprungen; daraus folgt kein signiertes Release. Kein physischer Zebra-, Smartphone- oder Druckertest daraus ableiten.
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
- Desktop-Backup enthält Indexdaten und Vorschaubilder, keine Originalfotos. main verwendet weiterhin das unverschlüsselte Legacy-ZIP-Format. Draft-PR [#62](https://github.com/mouzzlii/CHRONOS/pull/62) ergänzt optionale AES-256-GCM-Backups, Restore-Härtung (Windows-Gerätenamen, nachgestellte Punkte/Leerzeichen und normalisierte Pfadkollisionen) sowie eine Fail-closed-Sperre an fünf Windows-Backup-/Restore-Einstiegspunkten. Aktueller PR-Head `dbbd9cddf548be29385187cca1c846948439d849` (zusätzlich unveränderliche GitHub-Action-Pins; keine Änderung der Laufzeitlogik). CI-Run [46032122163](https://github.com/mouzzlii/CHRONOS/actions/runs/46032122163) endete für alle vier Jobs (Python 3.11/3.12/3.13 und Windows-Gate) vor dem ersten Schritt (`steps=[]`); keine Tests wurden ausgeführt und kein Codefehler ist damit belegt. Explizite Windows-DACL-Erstellung und Read-back-Verifikation fehlen weiterhin; Windows-Backup/Restore bleibt gesperrt. Kein erfolgreicher Testnachweis für den aktuellen Head.
- Python-CI und Android-/Robolectric-Prüfungen sind in der Statusdokumentation belegt. Echte Android-Geräte-, Prozessabbruch-, Backup-/Restore- und Großbibliothekstests bleiben offen.
- Gesichtserkennung ist nicht enthalten und darf nicht ohne ausdrückliche Einwilligung sowie Datenschutz-/Rechtsprüfung ergänzt werden.

### BOOK YOUR COOK – Buchungsplattform

**Repository:** [mouzzlii/book-your-cook](https://github.com/mouzzlii/book-your-cook)

**Abgrenzung:** Eigenständiges Buchungsprodukt; keine Laufzeitabhängigkeit zu KREISLAUF oder Menschheitsfamilie.

**Aktueller PR-Stand**
- Draft PR [#2](https://github.com/mouzzlii/book-your-cook/pull/2), Branch `security/stripe-refund-monotonic-state`, aktueller Head `2f132ce960130cfa879d0e86c3be43557f209c61`.
- Enthält monotone kumulative Stripe-Refund-Verarbeitung, robuste PaymentIntent-/Payment-Zuordnung, WebCrypto-Signaturprüfung, additive Datenbankmigration und Compare-and-Set-Schutz gegen veraltete Admin-Updates.
- Stornierungsablauf speichert den Admin-Status zuerst per CAS und versucht erst danach, eine offene Stripe-Checkout-Session zu deaktivieren. Bezahlte und noch ungeklärte Sessions werden getrennt behandelt. Bei noch offenem Checkout-Cleanup bleiben Stornierung und Gast-/Admin-Hinweis sichtbar; die Oberfläche lädt den aktuellen Cloud-Stand erneut.
- GitHub Actions Runs [46032097922](https://github.com/mouzzlii/book-your-cook/actions/runs/46032097922) und [46032105885](https://github.com/mouzzlii/book-your-cook/actions/runs/46032105885) endeten beide vor dem ersten Schritt (`steps=[]`); keine Tests wurden ausgeführt und kein Codefehler ist damit belegt. Workflow-Action-Pins sind auf unveränderliche Commit-SHAs umgestellt, aber wegen des Runner-Ausfalls noch nicht durch CI ausgeführt.
- Keine Live-Supabase-, Stripe- oder Resend-Aktion, keine Migration und keine Zahlung geändert. PR bleibt Draft und ungemergt.
- Offene Abnahme: echte Edge-Function-/Stripe-Webhook-Tests mit synthetischen Testfixtures, Checkout-Expiry-/Webhook-Race-E2E und fachliche/steuerliche Freigabe der Brutto-/Netto-Preislogik. Keine produktive Zahlungsreife behaupten.

### KI-ARBEITSPLATZ – zentrale Entwicklungs-/Koordinationshilfe
**Repository:** [mouzzlii/KI-Arbeitsplatz](https://github.com/mouzzlii/KI-Arbeitsplatz)

**Bestätigtes Ziel**
Bestehendes Projekt „KI-Arbeitsplatz – Meisterwerk Edition v1.0.0“ fortführen statt doppelt entwickeln. Android-Smartphone ist die maßgebliche Nutzerplattform; ursprüngliche Windows-Annahmen sind nicht mehr passend. Vorgesehen sind zentrale Auftragsverwaltung, Projektkoordination, sichere GitHub-Arbeit, Tests/Fehlerprotokolle und Wiederherstellung.

**Tatsächlicher GitHub-Stand (erneut geprüft am 27.11.2026)**
- Repository-Root enthält das unveränderte Originalarchiv `KI-Arbeitsplatz-Meisterwerk-v1.0.0.zip`, `README.md`, `app/`, `docs/`, `src/windows/` und GitHub-Workflowdateien.
- Das ZIP wurde laut Repository-Audit vollständig inventarisiert; zehn Textdateien wurden extrahiert und gelesen. Die separat versionierte Windows-Quellfassung enthält ausgewählte Sicherheitskorrekturen 1.0.1; das Originalarchiv v1.0.0 blieb unverändert. Windows-Laufzeittests und ein neues Installationspaket sind nicht nachgewiesen.
- Unter `app/` liegt ein statischer Android-PWA-Prototyp mit Projektkatalog, Service Worker und dokumentiertem Testplan. Browser-/Android-Installation, Offlineverhalten und End-to-End-Betrieb sind noch nicht als erfolgreich abgenommen.
- Die Windows-Quellfassung ist eine lokale PowerShell-/CMD-Anwendung, keine autonome Agentenplattform und kein Council.
- `docs/COUNCIL-INTEGRATION-BOUNDARY.md` beschreibt die getrennte Zielarchitektur. PR #12 im Repository `mouzzlii/KI-Arbeitsplatz` ergänzt auf `feat/offline-council-workbench` einen lokalen PWA-Council-Testplatz mit synthetischen Mock-Rollen, strikter Schema-Prüfung, JSON-Export/Import und festem Kostenlimit 0 EUR. Der PR ist Draft/offen und nicht in `main`; keine produktive Council-Engine, echten Provider-Aufrufe oder unabhängigen Modellreviews behaupten.
- Der GitHub-Actions-Runner ist weiterhin ein nachgewiesener Blocker: Der PR-Workflow `pwa-council-tests.yml` und ein erneuter Job-Retry scheiterten am 27.11.2026 jeweils vor dem ersten Schritt; der Retry lieferte `steps=[]` und keine Job-Logs. Ein neuer Workflow-Lauf für den zuletzt aktualisierten PR-Head wurde bei der Commit-Abfrage nicht zurückgegeben. Eine isolierte lokale Node-Prüfung der Engine-Logik/Modulsyntax anhand der implementierten Quellfassung war zuvor erfolgreich; das ersetzt keinen Lauf des vollständigen Repository-Testpakets. Browser-/Android-Tests bleiben offen.
- PR #12 wurde nach Quellprüfung zusätzlich gehärtet: JSON-Download-URLs werden verzögert widerrufen, importierte Mock-Ergebnisse weisen doppelte Rollen zurück; Änderungen sind im PR-Branch dokumentiert und per GitHub-Readback bestätigt; aktueller PR-Head nach Dokumentations-Readback: `6a6d193387bc43706c87e6a757f5775bb75ce7ed` (41 Commits, 10 geänderte Dateien). Die zusätzlichen Härtungen sind noch nicht durch CI ausgeführt.
- Vercel-Readback bestätigt eine READY-Preview `https://ki-arbeitsplatz-test-ef8cdwbc3-kreislauf.vercel.app` für den aktuellen ausgelieferten Runtime-Code-Commit `8e6303e6b6248adcb133698e8f76b4559faaab61` (Deployment `dpl_92NQ16RkMQnZpGAMTjBvZ4uEMJyz`). Vier spätere PR-Commits betreffen nur Test-/Dokumentationsdateien; ausgelieferte Runtime-Dateien sind unverändert. Die Preview bleibt SSO-geschützt. Browser-/Android-Abnahme ist weiterhin nicht erfolgt. Der Vercel-Statuscheck auf dem neuesten PR-Head meldet wegen des kostenlosen Build-/Deployment-Limits `failure`; keine weiteren Deployments auslösen.
- Bei adversarialer Quellprüfung wurde ein UI-Zustandsfehler behoben: alte Mock-Ergebnisse und Exportaktionen werden vor neuen Aufträgen/Imports zurückgesetzt, damit fehlgeschlagene Vorgänge keine veralteten Resultate als aktuell anzeigen. Regressionstest und Testplan ergänzt; per GitHub-Readback bestätigt, CI aber nicht ausgeführt.
- GitHub-Actions-Lauf #9 (`45941851994`) scheiterte erneut vor dem ersten Schritt; Job `140317713053` meldet `steps=[]`, keine Logs und keinen Runner. Vercel-Statuscheck meldet `failure` wegen `build-rate-limit`; aktuelle Preview-Bereitstellung ist nicht nachgewiesen.
- Die exakt aus GitHub abgerufene Council-Engine wurde separat in einer isolierten V8-Laufzeit geprüft: zunächst 14/14, nach zusätzlicher Fixture-Integritätsprüfung 18/18 gezielte Engine-/Quellprüfungen bestanden. Dies ersetzt weder den vollständigen Repository-Node-Testlauf noch Browser-/Android-Tests.
- PR #12 bleibt Draft/offen. Keine PR-Reviews eingegangen. Keine parallele Agentenbasis aufbauen: vorhandene Windows-Quelle, PWA und Council-Architektur getrennt weiterprüfen und gezielt integrieren.

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

- Gewünschter Arbeitsablauf: ChatGPT koordiniert; Claude, Gemini, Grok und geeignete weitere Anbieter können nach tatsächlicher Verfügbarkeit, Datenregion, Datenschutz, Sicherheit und Kosten eingesetzt werden. Llama bleibt auf öffentliche, synthetische oder anonymisierte Daten beschränkt, solange eine geeignete EU-Datenverarbeitung nicht nachgewiesen ist.
- **Aktiver `main`-Stand:** Der auf `main` integrierte GitHub-Actions-Relay verwendet weiterhin direkte OpenAI Responses API, Anthropic Messages API und wahlweise Meta Muse oder einen separaten Llama-HTTPS-Host. Er verwendet noch nicht die Vercel-Gateway-Aliase; Gemini und Grok sind im aktiven `main`-Relay nicht eingebunden.
- **Gateway-Entwicklung in Draft PR #38:** Der Branch `feature/portfolio-council-routing` enthält den gemeinsamen Vercel-AI-Gateway-Adapter für die fest allowlisteten Aliase `vmc/council-gpt`, `vmc/council-claude`, `vmc/council-gemini` und `vmc/council-grok`, drei unabhängige Erstanalysen und eine GPT-Synthese sowie einen streng read-only Task-Envelope-Adapter.
- **Aktueller CI-Nachweis:** PR-Head `39d7caf42ec543a42ea31b4f0f2247c245c77227` (Dokumentations-Commit nach dem geprüften Code-Head `1d7614c44ab445e6dabcb0087128bb1e82af7183`); Relay-CI Run [46031691434](https://github.com/mouzzlii/Kreislauf/actions/runs/46031691434) vollständig erfolgreich: Syntax, Task-Envelope (17 Tests), Ledger (6), Source-Context (12), Gateway-Provider-Verträge (4), Parser/Integration (2) und Projekt-/Tagesbudgetchecks. Insgesamt 41 Node-Tests bestanden, 0 fehlgeschlagen. Beide Workflows pinnen `actions/checkout` v7 und `actions/setup-node` v6 auf verifizierte Commit-SHAs. Dies ist ein synthetischer Vertragstest, kein Live-Provider-Aufruf.
- **Public-only-Datenschutzkorrektur auf PR-Branch:** Vor dem Lesen von README, Dateibaum oder Quelltext wird `visibility=public` und `private=false` verlangt. Private, interne und unbekannte Repositorys werden fail-closed abgewiesen; der Primärkontext muss selbst öffentlich sein. Task-Envelopes akzeptieren nur `public`, `synthetic` oder `anonymized`; interne/vertrauliche/personenbezogene/Geheimdaten werden abgewiesen. Die Prüfungen laufen vor Budgetreservierung und Provider-Aufruf. Das private Repository `mouzzlii/KI-Arbeitsplatz` wird nicht gelesen; der strukturierte Task-Eingang ist für dessen aktuellen Quellstand nicht operativ nutzbar. Diese Korrektur ist nicht in `main` integriert.
- **Harte Aktivierungssperre:** Der PR-Workflow `.github/workflows/ai-team-communication.yml` enthält weiterhin ein explizites `false &&`-Gate. Auch vorhandene Secrets oder `AI_TEAM_BUDGET_CONFIRMED=true` können keinen Modellaufruf auslösen, solange dieses Gate nicht nach Kostenkontrolle und ausdrücklicher Freigabe bewusst entfernt wird.
- **Noch offene Council-Gates:** Antwortmetadaten für tatsächlichen Provider/Modell/Endpoint/Request-ID, ein serverseitig hartes monetäres Kostenlimit und eine echte Peer-Review-Runde nach den unabhängigen Erstanalysen fehlen. Die derzeitige GPT-Synthese allein ist kein vollständiger Peer-Review-Durchlauf.
- **Integrationsstatus:** PR #38 bleibt Draft/offen/ungemergt. Branch ist gegenüber `main` deutlich divergiert; GitHub meldet `mergeable=false`. Ahead-/Behind-Zahlen sind volatil und vor einer kontrollierten Konsolidierung neu zu ermitteln. Vercel-Preview-Check scheiterte wegen `build-rate-limit`. Keine Integration in `main` ohne kontrollierte Konsolidierung und erneute vollständige Prüfung.
- Die fünf Vercel-Aliase `council-claude`, `council-gemini`, `council-gpt`, `council-grok` und `council-llama` sind aktive Konfigurationen; alle fünf wurden mit Zero Data Retention und deaktiviertem Prompt-Training ausgelesen. Nur Claude ist ausdrücklich auf EU-Provider-Routen beschränkt. Für GPT, Gemini und Grok ist keine explizite EU-Inferenzregion festgelegt; Llama hat keine bestätigte EU-Inferenzregion. ZDR/No-Training ist keine EU-Datenresidenz-Garantie.
- Im Vercel-Projekt `collective-intelligence-council` ist `AI_GATEWAY_API_KEY` als Sensitive-Variable für Preview und Development vorhanden, nicht Production. Dieser Schlüssel wird nicht automatisch in GitHub verfügbar. Kein Secret-Wert wurde ausgelesen oder geändert.
- Das Vercel-Projektbudget beträgt 5 USD monatlich und der zuletzt gemeldete Verbrauch 0 USD. Dieses Budget ist ein Soft Cap, keine harte Kostenobergrenze. MAINPROMPT 2.0.7 setzt Zusatzbudget auf 0 EUR und Live-Council AUS. Keine kostenpflichtigen Modellaufrufe ohne ausdrückliche Freigabe und belastbare Kostenkontrolle.
- Ohne echte Provider-Aufrufe keine Claude-/Gemini-/Grok-/Llama-Antworten oder unabhängigen Reviews behaupten. PWA-Mock-/Vertragstests sind keine Council-Inferenz. Keine Secrets oder persönlichen Zugangsdaten im Chat oder in GitHub ablegen.

## 5. Priorisierung und Arbeitsmodus

- TRAKUNA ist derzeit eine hohe Umsetzungspriorität; innerhalb von TRAKUNA gilt die projektspezifische Regel: genau ein priorisiertes Ticket gleichzeitig.
- KREISLAUF und Menschheitsfamilie fachlich verbunden, aber mit getrennten Daten- und Berechtigungsgrenzen.
- SCAN-PROFIT und INSERAT-PROFI AI bleiben eigenständige Produkte ohne gegenseitige Laufzeitabhängigkeit.
- KI-Arbeitsplatz soll langfristig zentrale Entwicklungs- und Koordinationshilfe werden; vorhandenes Windows-Cockpit, PWA-Prototyp und getrennte Council-Engine-Architektur gezielt weiterprüfen und integrieren, ohne eine parallele Agentenbasis aufzubauen.
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


## 8. Historische Herkunft globaler Arbeitsregeln – nicht mehr operative Quelle

Die früheren Abschnitte zu Autonomie, Delegation, chatübergreifender Koordination, chirurgischer Arbeitsweise, Qualitätskontrolle, Realbetrieb-Simulation und Council-Nachweisen wurden in die alleinige globale Arbeitsverfassung **MAINPROMPT 2.0.7** im Repository `mouzzlii/KI-Arbeitsplatz` übertragen.

Die verbindlichen operativen Regeln stehen nun dort:
- Autonomie, „GO“/„Weiter“, Chat- und Projektabgleich: MAINPROMPT §§ 2–3 und 5.
- Council-Unabhängigkeit, Live-Inferenz und technische Nachweise: MAINPROMPT §§ 4.2–4.3.
- Chirurgische Eingriffe und Risikostufen: MAINPROMPT § 6.1.
- Mehrstufige Qualitätskontrolle und Realbetrieb-/Praxisteststandard: MAINPROMPT §§ 7.1–7.2.

Dieser Abschnitt hält nur die Herkunft der Nutzerentscheidungen fest. Er ist keine zweite operative Regelquelle. Projektbezogene Anforderungen, historische Nachweise und konkrete Statusdaten bleiben in dieser Portfolio-Baseline erhalten.

## 9. Projektfamilien-Council und Offline-Arbeitsplatz – projektspezifische Zielarchitektur

**Geltungsbereich:** Dieser Abschnitt dokumentiert die Council-Zielarchitektur für die Projektfamilie TRAKUNA, SCAN-PROFIT, CHRONOS und KREISLAUF. Globale Council-Arbeitsweise, Sicherheits-, Kosten- und Nachweisregeln stehen ausschließlich im MAINPROMPT 2.0.7.

### Gewünschte Rollen und Zusammenarbeit
- **ChatGPT:** Koordination, Aufgabenzerlegung, Projekt-/Abhängigkeitsmanagement, Synthese und Qualitätskontrolle.
- **Claude:** unabhängige Analyse, alternative Lösungswege und kritische Gegenprüfung, sobald eine echte autorisierte Verbindung besteht.
- **Meta/Muse oder echtes Meta-Llama:** zusätzliche unabhängige Lösungsentwicklung und Red-Team-Prüfung. Meta Muse und Llama sind unterschiedliche Providerwege und dürfen nicht gleichgesetzt werden.
- **Python-KI:** Programmierung, Codeanalyse, Datenanalyse und Tests, sofern eine eigenständige KI-Integration tatsächlich vorhanden ist. Eine lokale Python-Laufzeit allein ist keine eigenständige KI.
- **Lokaler PC / Offline-Node:** lokale Builds, Tests, Backups, Dokumentation und Offline-Arbeit, sobald der Rechner tatsächlich erreichbar und autorisiert ist. Der PC ist Infrastruktur, kein KI-Mitglied.

Der Nutzer wünscht, dass Council-Mitglieder einander Fragen und Aufgaben stellen, Annahmen kritisch prüfen und die bestbelegte Lösung gemeinsam herausarbeiten. Die allgemeine Methode und der Nachweis tatsächlicher Beteiligung sind im MAINPROMPT geregelt.

### Technische Projektunterlagen
- [Technischer Relay und Provider-Konfiguration](../AI_TEAM_SETUP.md)
- [Council-Governance und Projektgrenzen](https://github.com/mouzzlii/Fuck/blob/main/KI-COUNCIL-GOVERNANCE.md)
- [Live- und Integrationsstatus](COUNCIL_LIVE_STATUS.md)

`COUNCIL_LIVE_STATUS.md` dokumentiert pro Instanz/Verbindung Anbieter bzw. lokale Komponente, Verbindungsart, letzten erfolgreichen Verbindungstest, Berechtigungsumfang, Kostenstatus, letzten real gesendeten Auftrag, Antwortnachweis, Teststatus und offene Blocker. Keine Secrets oder Tokens eintragen. Veraltete Angaben als historisch kennzeichnen.

### Statusgrenze
Eine gewünschte Architektur, ein vorbereiteter Relay, ein Modell-Alias oder eine vorhandene API-Konfiguration beweist keine aktive Modell-Inferenz. Für Live-Status gelten ausschließlich die Nachweiskriterien des MAINPROMPT 2.0.7 § 4.3.

## 10. TRAKUNA-Pilot – projektbezogene Realbetrieb-Simulation

Für den TRAKUNA-Paketshop-Pilot gelten zusätzlich zu MAINPROMPT 2.0.7 und den TRAKUNA-Projektspezifikationen:
- Paketshop-Mitarbeiter sollen den vorgesehenen Arbeitsablauf möglichst realitätsnah testen können.
- Bis zur gesonderten Freigabe bleiben echte Carrier-Buchungen, Labelkäufe, verbindliche Auftragsübermittlungen und kostenpflichtige Schritte technisch gesperrt.
- Jeder simulierte Buchungsschritt muss sichtbar als Simulation erscheinen und protokollieren, welche Aktion vorbereitet worden wäre.
- Scanner-, Kamera-, Druck- und Portal-/Carrier-Tests sind getrennte Testbereiche. Ein erfolgreiches APK-Build oder ein Emulatorlauf ist kein physischer Geräte-/Druckernachweis.
- Vor Weitergabe einer APK: exakten Quell-Commit mit erfolgreichem Build verknüpfen, Instrumentierungsergebnis abwarten, Artefakt-Hash notieren, Installations-/Deinstallationsrisiken prüfen und eine verständliche Mitarbeiteranleitung bereitstellen.
- Kein Mitarbeiter soll echte Kundendaten, echte Buchungen oder produktive Zugangsdaten für einen nicht freigegebenen Test verwenden. Testdaten und organisatorische Zustimmung des Paketshops müssen vor Ort geklärt sein.

Diese Punkte sind TRAKUNA-spezifische Pilotanforderungen, keine zweite globale Testmethodik. Die allgemeine Testmethodik und die Hard-Gate-Regeln stehen im MAINPROMPT 2.0.7 § 7.2.

## KI-ARBEITSPLATZ – Arbeitsnachtrag 27.11.2026 (Fortsetzung PR #12)

- PR [#12](https://github.com/mouzzlii/KI-Arbeitsplatz/pull/12) bleibt Draft/offen und ungemergt. Aktueller Head: `de658fdf0b59c18855de850051515c6f77ad65e2`; 46 Commits, 10 geänderte Dateien.
- Neue Datenminimierungsverbesserung auf `feat/offline-council-workbench`: Mock-Ergebnisse enthalten keine Prompt-Auszüge mehr. Die Rollenbefunde sind feste generische Fixtures und ausdrücklich keine inhaltliche Analyse des eingegebenen Auftrags. Der Ergebnisvalidator lehnt ein zusätzlich eingefügtes Feld `reviewedExcerpt` ab. Regressionstest, README, Testplan und Council-Integrationsgrenze wurden angepasst.
- Die exakt von GitHub abgerufene aktuelle Engine-Quelle wurde in einer isolierten V8-Laufzeit geprüft: **22/22 gezielte Engine-/Quellprüfungen bestanden**, einschließlich Datenminimierung, Ablehnung eingefügter Prompt-Auszüge, Manipulationsfällen, Nullkosten, fehlender externer Modellaufrufe, UI-Netzwerkfreiheit, CSP und Service-Worker-Modulaufnahme. Dies ist kein vollständiger `node --test`-Repositorylauf und kein Browser-/Android-Test.
- Neuester Actions-Lauf #17 für exakt den aktuellen PR-Head (`45942217910`) endete weiterhin vor dem ersten Schritt: `runner_id=0`, kein Runnername, `steps=[]`, keine Testlogs. Der CI-Status ist daher **nicht ausgeführt / Infrastrukturblocker**, nicht Code-Testfehler oder bestandener CI-Lauf.
- Keine weiteren Workflow-Retries oder Vercel-Deployments auslösen, solange der Runner-/Buildlimit-Blocker unverändert besteht. PR bleibt Draft; kein Merge, keine öffentliche Freigabe. Browser-/Android-Abnahme und echter Council-Live-Aufruf bleiben offen.


### KI-ARBEITSPLATZ – Statuskorrektur nach Dokumentations-Readback (27.11.2026)
- Nach den abschließenden Testplan-/Integrationsdokumentations-Commits ist der aktuelle PR-#12-Head **`1e777f4a17cec698955ce6be431a564b7ae820ca`** (48 Commits, 10 geänderte Dateien). Dieser Wert ersetzt den vorherigen Head `de658fdf0b59c18855de850051515c6f77ad65e2` aus dem unmittelbar vorangegangenen Nachtrag.
- Die aktuelle Engine-Quellfassung `b8cbe31140841d473933fa998a5ba394f801409c` besteht 22/22 gezielte isolierte Prüfungen; `app.js` und `sw.js` sind zusätzlich syntaktisch geparst. Die abschließende Dokumentation wurde im PR aktualisiert und per Readback bestätigt.
- Neuester bislang zurückgegebener Actions-Lauf #20 (`45964517995`) betrifft einen älteren Zwischen-Head und scheiterte wieder vor dem ersten Schritt (`runner_id=0`, `steps=[]`). Für den endgültigen PR-Head wurde noch kein ausgeführter Testlauf nachgewiesen. Daher bleibt der vollständige CI-Lauf offen.


### KI-ARBEITSPLATZ – Nachprüfung Actions #21 und PR-Status (27.11.2026)
- PR #12 wurde per GitHub-Readback bestätigt: offen, Draft, ungemergt; Head `1e777f4a17cec698955ce6be431a564b7ae820ca`, 48 Commits, 10 geänderte Dateien.
- Neuer Actions-Lauf #21 (`45964746728`) für diesen dokumentierten Head endete mit `failure`. Der Job `140390646224` lieferte `steps=[]`, keine Logs und damit keinen ausgeführten Testschritt. Das ist weiterhin ein Jobstart-/Runner-Infrastrukturblocker; kein Code-Testfehler und kein bestandener CI-Lauf.
- Der kombinierte Commit-Status meldet den Vercel-Check aktuell als `success`. Das belegt nur den Statuscheck, nicht die Browser-/Android-Abnahme. Die bekannte Preview bleibt SSO-geschützt; kein neuer Gerätetest ist nachgewiesen.
- PR-Beschreibung wurde bereinigt und auf diese Prüfgrenzen aktualisiert. Keine neuen Deployments, keine Workflow-Retries, kein Merge und keine Live-Modellaufrufe ausgelöst.


### KI-ARBEITSPLATZ – PWA-Quellreview und Laufzeit-Testzugang (27.11.2026)
- Die aktuelle PWA-Implementierung auf PR-Branch `feat/offline-council-workbench` wurde read-only erneut geprüft: `app.js`, `sw.js`, `council-engine.mjs`, `council-ui.mjs`, Testplan und Regressionstests. Kein zusätzlicher Codeeingriff wurde vorgenommen, da in diesem Review kein ausreichend belegter Fehler für einen chirurgischen Fix festgestellt wurde.
- Service Worker: Cache ist per Registrierungsscope isoliert, löscht nur ältere Versionen desselben App-Pfads, cached ausschließlich explizit gelistete Shell-Dateien und fällt bei Offline-Navigation auf `index.html` zurück. IndexedDB-Daten und Council-Aufträge/-Ergebnisse werden nicht in den App-Shell-Cache aufgenommen.
- Datenimport: Schema-/Größen-/Anzahl-/ID-/Projektverweis-Prüfungen und eine gemeinsame IndexedDB-Transaktion sind im Quelltext vorhanden. Dies bleibt ein Quellcodebefund; ohne echten Browser wurde kein Transaktions-Rollback provoziert.
- Der bekannte Vercel-Preview-Deployment-Datensatz wurde erneut read-only geprüft: Status `READY`, Deployment `dpl_92NQ16RkMQnZpGAMTjBvZ4uEMJyz`, Quellcommit `8e6303e6b6248adcb133698e8f76b4559faaab61`. Es ist ein älterer Runtime-Commit, dessen Code zuvor als identisch zu den nachfolgenden Runtime-Dateien eingeordnet wurde; Dokumentations-/Teständerungen sind nicht Teil dieses Deployments. Das Deployment ist nicht als Android-abgenommen zu kennzeichnen.
- Ein tatsächlicher Browser-Smoke-Test war in dieser Sitzung nicht möglich: Der Browser-Connector meldete, dass kein ursprünglicher Browser-Kontext vorliegt. Der SSO-Schutz wurde nicht umgangen und kein öffentlich teilbarer Zugriff erzeugt. Nächster Testweg bleibt ein autorisierter Browser-Kontext oder ein separat freigegebener Gerätezugang.
- PR #12 bleibt Draft/offen/ungemergt; Actions #21 bleibt ein Runnerstart-Blocker (`steps=[]`). Kein Code-, Deployment-, Kosten- oder Berechtigungswechsel wurde vorgenommen.


### KI-ARBEITSPLATZ – Multi-Provider-Council ausdrücklich beschlossen (27.11.2026)
- Nutzer hat der langfristigen Unterstützung mehrerer echter KI-Anbieter parallel zugestimmt: Claude, Gemini, ChatGPT/OpenAI, Grok, Llama (erst nach gesonderter EU-Datenschutzprüfung) und geeignete weitere Anbieter.
- Zielablauf: getrennte unabhängige Erstanalysen, danach kontrolliertes Peer Review, anschließend transparente Synthese durch ChatGPT mit Konsens, Widersprüchen, Unsicherheiten und Minderheitspositionen.
- Architekturentscheidung in `mouzzlii/KI-Arbeitsplatz/docs/COUNCIL-INTEGRATION-BOUNDARY.md` auf `main` ergänzt. Bevorzugt werden provider-neutrale Adapter hinter serverseitiger Orchestrierung; Vercel AI Gateway ist eine mögliche gemeinsame Transport-/Abrechnungsschicht, nicht automatisch ein Beleg für unabhängige Anbieterantworten.
- Unabhängige Council-Sitze benötigen explizite Provider-Allowlist und verifizierte Provider-/Modellmetadaten; Cross-Provider-Fallback ist in der unabhängigen Erstphase ausgeschaltet, damit ein Ersatzmodell nicht falsch etikettiert wird.
- **Keine Live-Aufrufe oder Kosten freigegeben:** Standard bleibt 0 EUR, Live-Modus aus. Zustimmung betrifft die Zielarchitektur. Keine API-Schlüssel, BYOK, Guthaben oder kostenpflichtigen Aufrufe angelegt/verwendet. Kostenprüfung muss vorab hart in der Anwendung greifen; Gateway-Budgets allein reichen nicht, da sie Soft Caps sein können.
- Llama bleibt deaktiviert, bis EU-Datenverarbeitung, Retention/Training und konkrete Endpoint-Route nachgewiesen und freigegeben sind. Geheimnisse bleiben serverseitig.
- Status: Architekturentscheidung dokumentiert, noch nicht implementiert. Bestehender PWA-Council bleibt lokaler Mock; keine echten unabhängigen Modellaufrufe nachgewiesen.


### KI-ARBEITSPLATZ – read-only Audit vorhandener AI-Gateway-Council-Aliase (27.11.2026)
- Das Vercel-Team `Kreislauf` hat fünf aktive AI-Gateway-Virtual-Model-Aliase: `vmc/council-claude` → `anthropic/claude-sonnet-4.6`; `vmc/council-gemini` → `google/gemini-3-flash`; `vmc/council-gpt` → `openai/gpt-5`; `vmc/council-grok` → `spacexai/grok-4.7`; `vmc/council-llama` → `meta/llama-4-maverick`.
- Diese Aliase sind vorhandene Konfigurationen, **kein Nachweis eines Modellaufrufs**. AI-Gateway-Nutzungsabfrage für die letzten 30 Tage auf Team-Ebene lieferte keine Usage-Zeilen. Damit ist für diesen Zeitraum kein Team-Traffic über diese Abfrage sichtbar; das beweist keine generelle Nichtexistenz anderer Direkt-API-Nutzung.
- Alle fünf Aliase enthalten `zeroDataRetention=true` und `disallowPromptTraining=true`. Claude ist zusätzlich explizit auf Bedrock und Vertex Anthropic beschränkt und auf EU-Inferenzzone eingestellt. Die übrigen Aliase haben in ihrer gelesenen Konfiguration keine explizite EU-Inferenzregion und keine explizite Provider-Allowlist; aktuelle Endpoint-Metadaten müssen daher vor Nutzung je Route erneut geprüft werden.
- GPT-5 hat im aktuellen Gateway-Katalog Azure- und OpenAI-Endpunkte mit ZDR/no-training-Metadaten. Gemini 3 Flash weist einen Vertex-Endpunkt mit ZDR/no-training aus; der direkte Google-Endpunkt weist in den abgefragten Metadaten kein ZDR aus. Die gesetzte Virtual-Model-ZDR-Policy muss vor Nutzung mit tatsächlichen Routing-Logs verifiziert werden.
- Grok 4.7 weist in den abgefragten Endpoints Bedrock-, Vertex- und xAI-Routen mit ZDR/no-training-Metadaten auf; die abgefragten Daten belegen jedoch keine EU-Inferenzroute. Llama 4 Maverick zeigt nur einen Bedrock-Endpunkt ohne bestätigte EU-Inferenzregion. Llama bleibt daher für nichtöffentliche Daten gesperrt.
- Eine gelesene aktive Projektbudget-Konfiguration über 5 USD/Monat betrifft Projekt-ID `prj_cNDChcd0UaknDqECxOemW6lu2A3u`; sie wurde nicht als Budget des Projekts `ki-arbeitsplatz-test` identifiziert. Für das Team wurden keine Team-Defaults angezeigt. Keine Budgetänderung vorgenommen. Vercel Gateway-Budgets bleiben Soft Caps und ersetzen kein hartes App-seitiges Kostenlimit.
- Kein API-Key erstellt, keine Secrets gelesen oder ausgegeben, keine Virtual-Model-Konfiguration geändert, keine Credits gekauft und keine Inferenz ausgelöst.

### KI-ARBEITSPLATZ – serverseitige Council-Orchestrierungsgrundlage (27.11.2026)

- Auf dem bestehenden Draft-PR [#12](https://github.com/mouzzlii/KI-Arbeitsplatz/pull/12), Branch `feat/offline-council-workbench`, wurde zusätzlich zur lokalen PWA-Mock-Workbench ein separates serverseitiges Orchestrierungsmodul ergänzt. Aktueller PR-Head nach Readback: `1da45ad6229e08dbffa60ffd372a5dfdf65d837d`; PR bleibt offen, Draft und ungemergt.
- Neue Dateien: `server/council/policy.mjs`, `server/council/orchestrator.mjs`, `server/council/README.md`, `server/tests/council-orchestrator.test.mjs`. Die Workflowdatei `.github/workflows/pwa-council-tests.yml` wurde um `server/**`, Syntaxchecks und die neue Testdatei erweitert.
- Orchestratorablauf: parallele unabhängige Erstanalysen mit demselben freigegebenen Kernauftrag; Peer Reviews starten erst nach Ende der Erstphase und erhalten nur Antworten anderer Sitze. Provider-/Modell-/Endpoint-/Request-Identität wird validiert; Cross-Provider-Fallback ist nicht enthalten.
- Kosten- und Sicherheitsgrenzen: Standardpolicy bleibt Live AUS, 0 EUR und leere Provider-Allowlist. Vor Dispatch sind auftragsgebundene ausdrückliche Nutzerfreigabe, verifizierte Preisdaten, Provider-/Datenklassen-Allowlist und eine injizierte atomare Budgetreservierung zwingend. Ohne Reservierer/bei Ablehnung kein Provideraufruf. Eine persistente Budgetdatenbank/Reservierungsimplementierung ist noch nicht angeschlossen; der Server muss sie vor Live-Nutzung bereitstellen.
- 17/17 neue serverseitige Regressionstests wurden lokal mit Node.js und ausschließlich synthetischen Fake-Adaptern bestanden. Diese Tests belegen keine echten Provideraufrufe, keine EU-Routen, keine Kostenabrechnung und keine Produktivfähigkeit.
- Für den aktuellen PR-Head wurde bei der GitHub-Abfrage kein zugehöriger Actions-Lauf zurückgegeben. Der zuvor dokumentierte Runnerstart-Blocker bleibt offen; daher kein aktueller CI-Nachweis. Browser-/Android-Abnahme bleibt ebenfalls offen; die Preview ist SSO-geschützt.
- Noch nicht umgesetzt: HTTP/API-Route, Authentifizierung/CSRF-/Origin-Schutz, persistente atomare Budgetreservierung, Provideradapter, Live-Preiskatalog, verifizierte Endpoint-/EU-Routen, Audit-Persistenz, ChatGPT-Synthese, Deployment und echte Modellaufrufe. Keine API-Schlüssel, Kosten, Gateway-Konfigurationsänderungen oder Live-Aufrufe ausgelöst.



### KI-ARBEITSPLATZ – Fortschreibung HTTP-Sicherheitsgrenze (27.11.2026)
- Draft-PR #12, Branch `feat/offline-council-workbench`, Head nach Readback: `71ac75286df721ee6577e93834c4a671798cbf95`; weiterhin offen, Draft und ungemergt.
- Ergänzt wurden `server/council/http-handler.mjs` und `server/tests/council-http-handler.test.mjs`. Der framework-neutrale Handler prüft POST, exakte Origin-Allowlist, JSON-Content-Type, Authentifizierung, CSRF, begrenzte UTF-8-/JSON-Eingabe, striktes Request-Schema, Rate-Limit, serverseitige einmalige Freigabeauflösung und Audit-Fail-Closed. Sicherheitsdienste sind nur injizierte Verträge; es gibt noch keine konkrete Serverroute oder echte Dienstanbindung.
- Neue HTTP-Grenztests: 8/8 lokal mit Node.js bestanden; Syntaxprüfung der beiden neuen Dateien ebenfalls bestanden. Die Tests verwenden Fake-Sicherheitsdienste und Fake-Orchestrator; sie beweisen keine reale Authentifizierung, CSRF-Absicherung, persistente Freigabe/Audit, Live-Budgetreservierung oder Providerverbindung.
- Workflow `.github/workflows/pwa-council-tests.yml` enthält jetzt Syntaxchecks sowie PWA-, Orchestrator- und HTTP-Regressionstests. Für den aktuellen Head wurde bei der GitHub-Abfrage noch kein Actions-Lauf zurückgegeben; daher kein aktueller CI-Nachweis.
- Server-README, Root-README und PR-Beschreibung wurden um den tatsächlichen Implementierungsstand und die offenen Grenzen ergänzt. PR bleibt Draft. Kein Merge, kein Deployment, keine echten Modellaufrufe, keine API-Schlüssel und keine Kosten.


### KI-ARBEITSPLATZ – Einmalfreigabe-Replay-Test ergänzt (27.11.2026)
- Draft-PR #12 Head nach Readback: `4d196cc8488c03f94075f77d8c0431401efa44ea`; offen, Draft, ungemergt.
- HTTP-Grenztests erweitert: Wiederverwendung derselben Einmal-Freigabe muss beim zweiten Versuch abgewiesen werden, ohne einen zweiten Orchestratorlauf auszulösen. Ergebnis: 9/9 lokale HTTP-Tests bestanden.
- README, PR-Beschreibung und Serverdokumentation aktualisiert. Weiterhin keine echte Auth-/CSRF-/Freigabe-/Audit-/Budgetdienst-Anbindung, keine Provideradapter, kein CI-Nachweis für den aktuellen Head, kein Deployment und keine Live-Aufrufe.


### KI-ARBEITSPLATZ – abschließender Readback dieses Arbeitszyklus (27.11.2026)
- Aktueller PR-#12-Head nach Readback: `5bea4e603805113d3267248e31b412d0d778e9f4`; PR offen, Draft, ungemergt.
- Server-README bestätigt 9/9 lokal bestandene HTTP-Grenztests inklusive Einmalfreigabe-Replay-Sperre. Lokaler Node-Lauf erneut: 9/9 bestanden; Syntaxprüfung der neuen Handler- und Testdateien bestanden.
- GitHub-Check-Runs für diesen Head: 0. Vorherige Actions-Läufe scheiterten vor Job-Schritten; daher keine CI-Bestätigung. Der Vercel-Status für den aktuellen Stand meldet Free-Tier-Deployment-Limit (mehr als 100 Deployments/Tag); kein Deployment erfolgt.
- Keine echte Provideranfrage, kein Schlüssel, keine Kosten, keine produktive Auth-/CSRF-/Freigabe-/Audit-/Budgetdienst-Anbindung. Keine Browser- oder Android-Abnahme.


### KI-Council – Kosten-Gate des bestehenden Relay-PR #38 (27.11.2026)

- Der aktuelle Relay-Branch `feature/portfolio-council-routing` ruft OpenAI, Anthropic und optional Meta/Llama direkt auf. Die fünf vorhandenen Vercel-AI-Gateway-Virtual-Model-Aliase werden von diesem Relay nicht verwendet; Gemini und Grok sind darin keine auswählbaren Council-Sitze.
- `AI_TEAM_BUDGET_CONFIRMED` ist nur ein boolescher manueller Schalter. Der Relay besitzt keine numerische, programmatische Kostenobergrenze pro Debatte und keine verifizierte Preis-Vorprüfung. Tageslimit und Tokenlimit begrenzen die Nutzung, sind aber kein Geldlimit.
- Das vorhandene Vercel-Projektbudget von 5 USD/Monat gilt nicht für direkte OpenAI-/Anthropic-/Meta-/Llama-Aufrufe des GitHub-Relays. Vercel Gateway-Budgets sind außerdem kein Ersatz für ein hartes anwendungsseitiges Limit, da ein bereits gestarteter Request die Grenze überschreiten kann.
- **Verbindliche Sperre:** `AI_TEAM_BUDGET_CONFIRMED` nicht auf `true` setzen und keine Live-Aufrufe aktivieren, solange verifizierte Providerpreise, numerische Worst-Case-Kostenschätzung, auftragsgebundene Freigabe und atomare Budgetreservierung mit Fail-Closed-Verhalten fehlen.
- Die vorhandene Council-Grundlage in `mouzzlii/KI-Arbeitsplatz/server/council/policy.mjs` ist der bevorzugte Ausgangspunkt: Live standardmäßig aus, 0 EUR, verifizierte Preisdaten, explizite Freigabe und verpflichtender atomarer Budgetreservierer. Sie besitzt noch keine produktiv angeschlossene Budgetdatenbank oder Provideradapter.
- Das separate Vercel-Testprojekt `ki-arbeitsplatz-test` hat bei einer Metadatenabfrage keine Environment-Variablen zurückgegeben; dort ist derzeit kein `AI_GATEWAY_API_KEY` konfiguriert. Die vorhandene Gateway-Key-Variable liegt nur im anderen Projekt `collective-intelligence-council` für Preview/Development und wird nicht automatisch an GitHub Actions oder das PWA-Testprojekt übertragen.
- Stand dieser Prüfung: keine Provider-Aufrufe, keine Secret-Werte gelesen, keine Kosten, keine Änderungen an Produktionssystemen.


### BOOK YOUR COOK – Geschäftsmodell und aktueller Arbeitsstand (27.11.2026)

**Repository:** [mouzzlii/book-your-cook](https://github.com/mouzzlii/book-your-cook)

**Bestätigte Angebotsstruktur**
- Drei kombinierbare, separat kalkulierte Varianten: **Komplett**, **nur Koch** und **nur Foodtruck**.
- Komplett ist die bevorzugte Hauptvariante für den Start.
- Nur Koch bleibt bis zur rechtlichen Klärung der konkreten gewerbe-, lebensmittel-, arbeits- und haftungsrechtlichen Voraussetzungen gesperrt.
- Nur Foodtruck wird anfangs über Miete oder Kooperation mit einem bestehenden Betreiber abgebildet; ein eigener Foodtruck wird erst nach nachgewiesener Auslastung und Wirtschaftlichkeit erwogen.
- Operative Personalbaseline: Kernteam plus flexible Aushilfen. Die frühere Personalmodell-Frage 4 ist erledigt.
- Zielgruppen/Einsatzfelder: Privatkunden, Firmenkunden, Events, Foodtruck-Einsätze und Institutionen. Mobiler, auftragsbezogener Start mit stufenweisem Wachstum.

**Kalkulationsstandard**
- Jede Variante und Zielgruppe erhält eine getrennte Vollkosten- und Deckungsbeitragsrechnung.
- Wareneinsatz, Personal inklusive Vor-/Nachbereitung und Lohnnebenkosten, Miete/Kooperation, Fahrt/Logistik, Stand-/Energiekosten, Verbrauchsmaterial, Versicherungen, Zahlungsgebühren, Fixkosten, Ausfallrisiko, Steuern/SVS und Unternehmerlohn berücksichtigen.
- Unbelegte Beträge bleiben klar markierte Planungsannahmen. Keine Steuer- oder Rechtswerte raten.

**Rechtliche Sperrpunkte**
- Österreichische Gewerbe-/Gastgewerbe-/Catering-Abgrenzung, Lebensmittelhygiene/HACCP, Allergeninformation, Rückverfolgbarkeit, Betriebs-/Standort- und Veranstaltungsanforderungen, Arbeitsrecht, Haftung/Versicherung, Steuern/SVS und Vertrags-/Stornobedingungen sind vor dem jeweiligen Betriebsstart zu prüfen.
- Dies ist eine Prüfliste, keine Rechtsberatung und kein Nachweis vorhandener Genehmigungen.

**Technikstatus**
- PR [#2](https://github.com/mouzzlii/book-your-cook/pull/2) bleibt Draft/offen/ungemergt; Head zum Prüfzeitpunkt: 837cfa701fec274c9e1fe2e458c4ff8864dda74c.
- Stripe-Refund-Härtung umfasst kumulative monotone Refund-Beträge, WebCrypto-Signaturprüfung, PaymentIntent-Zuordnungs-Fallback und additive Migration.
- Actions-Läufe scheiterten vor Runnerstart (runner_id=0, steps=[]); kein CI-Testlauf für diesen Head belegt. Keine reale Datenbankmigration und kein Stripe-E2E-Test ausgeführt.
- Neue verbindliche Detailbaseline wurde unter mouzzlii/book-your-cook/docs/PROJECT-BASELINE.md auf main angelegt (Commit 63085568dc6224b7cd9cd5ae103656ca546f5448).


### BOOK YOUR COOK – rechtliche Vorprüfung Österreich (27.11.2026)
- Die erste Recherche offizieller WKO-/Bundesquellen zeigt: „Selbständiger Koch/Mietkoch“ ist in Wien als freies Gewerbe beschrieben, aber nur eng begrenzt – Speisenzubereitung für nicht gastgewerbliche Auftraggeber mit deren Einrichtung und Zutaten; keine gastgewerberechtliche Verabreichung/Verkauf warmer oder angerichteter kalter Speisen; Mehrzahl von Auftraggebern; keine Tätigkeit als Subunternehmer eines Gastgewerbetreibenden; bei regelmäßiger Tätigkeit in denselben Haushalten kann ein Dienstverhältnis vorliegen. Die tatsächliche Durchführung zählt, nicht nur der Vertragstext. Daher bleibt „nur Koch“ bis zur schriftlichen Einzelfallklärung nicht buchbar, ist aber nicht pauschal ausgeschlossen.
- Für Foodtrucks ist die passende Gewerbeberechtigung erforderlich, meist Gastgewerbe. Je nach Angebot kann ein einfaches Imbissmodell mit maximal acht Verabreichungsplätzen unter das freie Gastgewerbe fallen; andere Betriebsformen können reglementiert sein. Fahrzeugmiete überträgt keine Gewerbeberechtigung. Startmodell deshalb Kooperation mit einem befugten Betreiber; Rollen für Verkauf, Lebensmittelunternehmer, Kasse, Personal, Hygiene, Standplatz, Haftung und Versicherung vertraglich klarstellen.
- Standort-/Betriebsstätten-, Betriebsanlagen-, StVO-, Markt-/Veranstaltungs- und Fahrzeuganforderungen sind je Standort/Nutzung zu prüfen. Lebensmittelhygiene gilt auch im Truck.
- Detailquellen und Abgrenzungen stehen in mouzzlii/book-your-cook/docs/PROJECT-BASELINE.md (Readback-Commit cb7c12fbb7ab71e6318eb5e17f0f85fb2017e1dc). Keine behördliche Einzelfallfreigabe oder Betriebsaufnahme belegt.


### JOBPLATTFORM AT – eigenständiges Jobplattform-Projekt (27.11.2026)

**Repository:** [mouzzlii/jobplattform-at](https://github.com/mouzzlii/jobplattform-at)

- Das Repository ist vorhanden und privat; der tatsächliche Quellumfang wurde bislang nur teilweise inventarisiert.
- Aktueller Readback: Das README bezeichnet das Projekt als „Android-Debug-APK build pipeline“ und verweist auf `INSTALLATION-ANDROID.md`; genau diese Datei ist auf `main` nicht abrufbar (404). `package.json` ist ebenfalls nicht abrufbar (404). Damit sind weder eine vollständige App-Struktur noch ein reproduzierbarer APK-Build oder ein APK-Artefakt nachgewiesen; das README allein ist kein Implementierungsnachweis.
- Keine funktionsfähige Plattform, Android-App, Datenbankanbindung oder produktive Bereitstellung behaupten, solange diese Artefakte nicht im aktuellen Repository-Stand verifiziert sind.
- Nächster sinnvoller Schritt: vollständiges Repository-Inventar, Architektur-/Sicherheitsprüfung und klare Abgrenzung zwischen vorhandenem Code, Konzept und noch fehlender Implementierung. Keine Neuentwicklung parallel zu einem eventuell vorhandenen, noch nicht geprüften Quellstand beginnen.


### KI-ARBEITSPLATZ – zusätzliche HTTP-/Audit-Härtung (27.11.2026)
- Draft-PR #12 auf mouzzlii/KI-Arbeitsplatz, Branch feat/offline-council-workbench, Head nach Readback: f3e3eb5becdf7d0d5f4c482bcc4270c6fad7e8c3; offen, Draft, ungemergt.
- Council-Request-Validierung beschränkt Task-/Projektkennungen auf audit-log-sicheres ASCII-Format und lehnt Steuerzeichen ab.
- HTTP-Handler akzeptiert in seiner Konfiguration ausschließlich kanonische HTTPS-Origins; authentifizierte Subject-IDs werden gegen Log-Injection begrenzt.
- Vor Audit/Antwort werden Orchestrator-Ergebnisse auf erlaubte Statuswerte, sichere Run-ID und begrenzte Array-Strukturen validiert. Ungültige Rückgaben werden nicht an Clients serialisiert.
- Testquellstand: 18 Orchestrator- und 12 HTTP-Fälle. Historisch vor den neuesten Ergänzungen 17/17 bzw. 9/9 lokal bestanden; die neuen Härtungsfälle sind noch nicht ausgeführt. GitHub Actions hat für den aktuellen Head keinen Lauf geliefert.
- Server-Council-README, Root-README, PR-Beschreibung und Council-Integrationsgrenze aktualisiert. Keine echte Auth-/CSRF-/Audit-/Budgetanbindung, keine Provideradapter, keine echten Modellaufrufe, kein Deployment, keine Kosten. PR bleibt Draft.


### KI-ARBEITSPLATZ – strikte verschachtelte API-Antwortprüfung (27.11.2026)
- Draft-PR #12 Head: 941198b4474c32bfe6ed40c0b3525889770d3a1f; offen, Draft, ungemergt.
- HTTP-Handler validiert nun das vollständige Antwortschema, Provider-/Review-Einträge, Identitätsmetadaten, Fehlercodes, Preflight und Synthesestatus. Unbekannte verschachtelte Felder werden vor der Clientantwort abgewiesen; zusätzlicher Test deckt versehentliche Schlüssel-/Metadatenweitergabe ab.
- Testquellstand: 18 Orchestrator- und 13 HTTP-Fälle. Historisch 17/17 bzw. 9/9 vor den jüngsten Ergänzungen lokal bestanden; neue Härtungsfälle nicht ausgeführt. Kein GitHub-Actions-Lauf für den aktuellen Head.
- Kein Live-Aufruf, Deployment, API-Schlüssel oder Kosten. Echte Auth-/CSRF-/Freigabe-/Audit-/Budgetdienste und API-Route fehlen weiterhin.

### KI-Council – Sicherheitsreview des Gateway-PR #38 (27.11.2026)

- Read-only-Codeprüfung des Draft-Branches `feature/portfolio-council-routing` nach dem synthetischen Relay-CI-Lauf [46030025648](https://github.com/mouzzlii/Kreislauf/actions/runs/46030025648), PR-Head `1e7abcc03021d6276a8ed947a1877646a367e808`. Ein Job mit zehn Schritten erfolgreich; keine echte Modell-Inferenz oder Kosten.
- **Kritischer Datenklassenfehler:** Der Task-Envelope-Validator akzeptiert ausschließlich `dataClassification: "internal"`. Der Task-Router erlaubt `KI-ARBEITSPLATZ`; der Relay liest bis zu vier freigegebene Dateien aus dem privaten Repository `mouzzlii/KI-Arbeitsplatz` und übergibt den resultierenden Quellkontext an GPT, Claude, Gemini und Grok. Nur Claude hat eine explizite EU-Route; GPT, Gemini und Grok sind nicht für private Quelltexte freigegeben. Dokumentationshinweise allein verhindern diesen Datenfluss nicht. Strukturierte Tasks müssen bis zu einer technischen Datenklassen-/Provider-/Regionsperre fail-closed deaktiviert bleiben.
- Der Gateway-Adapter speichert derzeit nur den Antworttext; tatsächliche Provider-/Modell-/Endpoint-/Request-Identität wird nicht verifiziert oder im Ergebnis protokolliert.
- Das Relay hat nur einen booleschen manuellen Budgetschalter, ein Tageslimit von zwei Debatten und Tokenlimits; keine verifizierte Preisobergrenze und keine atomare monetäre Budgetreservierung. Das Vercel-Budget von 5 USD ist ein Soft Cap und erfüllt den 0-EUR-Standard nicht.
- Council-Ablauf: vier unabhängige Erstanalysen laufen nacheinander; danach GPT-Synthese. Eine Peer-Review-Runde durch die anderen Modelle fehlt. Erstanalysen sollen parallelisiert und anschließend gegeneinander geprüft werden.
- PR #38 bleibt Draft/ungemergt und divergiert gegenüber `main` (Merge-Base `71fb0e07740150be13d40b1aef10ba269fe264b8`). Ahead-/Behind-Zahlen sind dynamisch und unmittelbar vor einer Konsolidierung neu zu prüfen; GitHub meldete zuletzt `mergeable=false`. Vercel-Preview scheiterte wegen `build-rate-limit`. Keine Integration ohne kontrollierte Konsolidierung und erneute Prüfung.
- Keine Secrets gelesen/geändert, keine API-/Gateway-Requests, keine Kosten, kein Merge und kein Deployment.

### KI-ARBEITSPLATZ PR #12 – strikte verschachtelte Antwortvalidierung (27.11.2026)

- Draft-PR #12, Branch `feat/offline-council-workbench`, Head `941198b4474c32bfe6ed40c0b3525889770d3a1f`; weiterhin offen, Draft und ungemergt.
- Der HTTP-Handler validiert nun das vollständige Antwortschema einschließlich verschachtelter Provider-/Review-Einträge, Identitätsmetadaten, Fehlercodes, Preflight und Synthesestatus. Unbekannte verschachtelte Felder werden vor der Clientantwort abgewiesen; zusätzliche Regression deckt unerwartete Schlüssel-/Metadatenweitergabe ab.
- Testquellstand: 18 Orchestrator- und 13 HTTP-Fälle. Die jüngsten Härtungsfälle sind noch nicht ausgeführt; für den exakten Head liefert die GitHub-Abfrage keinen Actions-Lauf. Frühere 17/17 bzw. 9/9 lokale Ergebnisse gelten nicht für die neuen Fälle.
- Branch ist gegenüber `main` divergiert (Merge-Base `259644f87b0de1fbb96233fcd46488a6c6ebdc1d`); Ahead-/Behind-Zahlen sind dynamisch und vor einer Konsolidierung neu zu prüfen.
- Keine Provideradapter, echte API-Route, produktive Auth-/CSRF-/Freigabe-/Audit-/Budgetdienste, ChatGPT-Synthese, Live-Aufrufe, Deployment oder Kosten.


### KI-ARBEITSPLATZ – Provider-Sitz-/Review-Vollständigkeit abgesichert (27.11.2026)
- Draft-PR #12 Head: d922ea382eaae3a51b03e95b2288a05fe27229e3; offen, Draft, ungemergt.
- HTTP-Antwortvalidator bindet Analysen an exakt genehmigte Provider, weist doppelte/fremde Sitze, Selbstreviews, fehlende/doppelte Review-Paare, inkonsistente Statuswerte sowie Null-/Malformed-Einträge ab. Review-Anzahl und Call-/Kosten-Preflight werden gegen die genehmigte Auswahl geprüft.
- Testquellstand: 18 Orchestrator- und 15 HTTP-Fälle. Historisch 17/17 bzw. 9/9 vor den jüngsten Ergänzungen lokal bestanden; alle neuen Härtungsfälle bleiben ungeprüft. Node.js 22.16 ist in der Arbeitsumgebung vorhanden, aber das private Repository konnte wegen fehlender Netzwerkauflösung nicht in den lokalen Testcontainer geladen werden; für den aktuellen Head liegt auch kein Actions-Lauf vor.
- Keine echte Auth-/CSRF-/Freigabe-/Audit-/Budgetdienst-Anbindung, keine Provideradapter, kein Live-Aufruf, kein Deployment und keine Kosten.


### KI-ARBEITSPLATZ – finaler Stand dieses GO-Zyklus (27.11.2026)
- Draft-PR #12 aktueller Head nach Readback: 00c8e5e160b91d97667da56124bc22fb39867b8c; offen, Draft, ungemergt. Geänderte Dateien: 17.
- Serverseitige Council-Grenze wurde zusätzlich gehärtet: log-sichere Auftragskennungen, kanonische HTTPS-Origin-Allowlist, Kontrolle von Auth-Subject-IDs ohne unnötige Einschränkung opaker IDs, striktes vollständiges Ergebnis-/Identitätsschema, exakte Bindung aller Analyse-Sitze an genehmigte Provider und vollständige gerichtete Peer-Review-Paare.
- Testquellstand: 18 Orchestrator- und 15 HTTP-Fälle. Historisch waren 17/17 bzw. 9/9 vor den jüngsten Ergänzungen lokal bestanden; neue Härtungsfälle nicht ausgeführt. Node.js 22.16 ist verfügbar, aber das private Repository konnte wegen fehlender DNS-/Netzwerkauflösung nicht in den lokalen Testcontainer geladen werden.
- GitHub Actions hat für den aktuellen Head keinen Lauf geliefert. Vercel-Statuscheck bleibt wegen Free-Tier-Deployment-Limit auf failure; kein erneuter Deploymentversuch.
- Keine echte Server-Komposition, persistente Auth-/CSRF-/Freigabe-/Audit-/Budgetdienste, Provideradapter, Synthese, Live-Inferenz, Deployment, Browser-/Android-Abnahme oder Kosten. PR bleibt Draft.


### KI-ARBEITSPLATZ – Budget-/Run-Lifecycle-Spezifikation und PR-Abgleich (27.11.2026)
- Draft-PR #12 ist weiterhin offen und nicht gemergt. Aktueller Head nach Readback: `ea20e6eb8e9f9b17688972b04b534232f054d696`; 18 geänderte Dateien. [PR #12](https://github.com/mouzzlii/KI-Arbeitsplatz/pull/12).
- Neu ergänzt: `docs/COUNCIL-BUDGET-LIFECYCLE.md` definiert einen transaktionalen Startvertrag für Freigabe, Idempotenz, Budgetreservierung, Run-/Audit-Anlage, Provider-Dispatch-Zustände, Crash-Recovery, Usage-Reconciliation und idempotente Kostenfinalisierung. Der Vertrag ist Spezifikation, keine implementierte Datenbank-/Auth-/Budgetlösung.
- Die bestehende serverseitige Grenze hat eine offene Designlücke: Der aktuelle Handler verbraucht eine Einmalfreigabe und schreibt danach Audit; ohne gemeinsame Transaktion könnte ein Audit-Ausfall eine Freigabe verbrauchen, obwohl kein Dispatch stattfindet. Vor Live-Betrieb muss dies durch `prepareRunAtomically` oder eine gleichwertige Transaktion ersetzt werden.
- PR-Abgleich meldet Branch-Divergenz: 106 Commits ahead und 37 behind gegenüber `main`; PR ist nicht mergeable. Keine Rebase-/Merge-Aktion vorgenommen. Erst Baseline-/Konfliktanalyse und erneute Prüfung aller Änderungen, bevor eine Integration erwogen wird.
- GitHub Actions für den aktuellen Head lieferte 0 PR-Workflow-Runs; Reviews und Review-Threads: 0. Das ist kein Testnachweis. Historische 17/17 bzw. 9/9 Testläufe beziehen sich auf einen älteren Quellstand; 18 Orchestrator- und 15 HTTP-Testfälle sind vorhanden, die jüngsten Härtungsfälle sind nicht ausgeführt.
- Vercel-Deployment bleibt blockiert durch das zuvor dokumentierte Free-Tier-Limit; kein neuer Deploymentversuch. Keine Browser-/Android-Abnahme, keine Provideradapter, keine Live-Aufrufe, keine Kosten.
- Keine vorhandene KREISLAUF-Supabase-Datenbank ungeprüft wiederverwendet; kein konkreter Speicher-/Auth-Anbieter festgelegt.
