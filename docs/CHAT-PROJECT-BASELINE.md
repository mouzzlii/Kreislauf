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
- **Sichtbare Arbeitsplanung und kontinuierliche Ausführung:** In einem aktiven Arbeitsdurchgang die nächsten sinnvollen Aufgaben und deren Zweck transparent zeigen, abgeschlossene Arbeit in kompakten Zwischenständen melden und danach selbstständig mit abhängigen oder unabhängigen sicheren Schritten fortfahren. Keine Bestätigung für gewöhnliche, reversible Arbeiten einholen. Nicht künstlich Aktivität oder Hintergrundausführung vortäuschen: ChatGPT kann keine Sitzung dauerhaft offenhalten, außerhalb aktiver Ausführungsfenster endlos weiterarbeiten oder selbstständig Nachrichten senden. Fortschritt, Blocker und Status stets wahrheitsgemäß kennzeichnen.

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
- Gateway PR #4 und #5: beide geschlossen und gemergt; das kanonische Gateway-Repository enthält Architektur, Adaptervertrag, Carrier-Registry und Ein-Drucker-Zielarchitektur.
- Gateway PR #7: offener Dokumentations-PR; aktualisiert Registry und README auf App-Version 1.55 und dokumentiert die QR-Domain-Allowlist sowie die Grenzen der Browser-Portalweiterleitung. Head `a588bcebe3957df84fff438455de60bd9767d4ca`; zwei Dateien geändert, keine Code-/Backend-Änderung.
- App PR #25: Draft/offen, nicht gemergt; zuletzt getesteter Code-Commit `2e4ae2435c29bed959662e4a1734f6826d508244`; Android-Build/Unit-Tests/Lint/Sicherheitsprüfungen erfolgreich ([45902341310](https://github.com/mouzzlii/Fuck/actions/runs/45902341310)); API-35-Emulator **15/15 Instrumentierungstests bestanden** ([45902341262](https://github.com/mouzzlii/Fuck/actions/runs/45902341262)). QR-Pfad-IDs werden nur bei offiziellen Carrier-Domains übernommen. Debug-Artefakt vorhanden, keine Produktionssignatur.
- App-Version 1.55 erkennt offizielle Anbieter-QR-Domains und öffnet ein vom Betreiber konfiguriertes HTTPS-Portal. Dabei werden keine Sendungsnummer/Kundendaten übertragen und keine Buchungen ausgelöst; native Partner-App-Übergabe bleibt im Shadow Mode.
- App PR #33 ist geschlossen; keine aktive Integrationsgrundlage.
- Echte Kamera-/Autofokus-, Shopportal-, Drucker-, Backup-Restore- und Carrier-Live-Tests bleiben offen. Kein vollständiger produktiver Carrier-Backend-Dienst und keine bestätigte Live-Carrier-Buchung behaupten.
- Vorhandener DataWedge-Empfangscode bleibt Legacy; die neue Zielarchitektur sieht keine neue Zebra-/DataWedge-Hardwareintegration vor.

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
- Repository-README führt Version 2.0.66; die statische Android-freundliche PWA ist die derzeit am weitesten nutzbare Produktversion.
- Release-Verifikation vom 25.11.2026 dokumentiert 155/155 Tests, statischen Build und Smoke-Test als bestanden.
- **Produktiv:** Alias `https://scan-profit-app.vercel.app` zeigt auf Vercel-Deployment `dpl_BJpW7oHNZoT3Q5fqAJ3t1LUsgzpW`, `READY`, Ziel `production`, Git-Commit `d5e9d15a1492217167136c9cd996a8417e82ade8` auf `main`.
- Offener Draft-PR #16 ergänzt einen Next.js-Quellbaum 2.0.66 unter `next-app/`. GitHub-Actions-Läufe und Wiederholungen endeten ohne Job-Steps/Logs (`BlobNotFound`); damit ist kein konkreter Codefehler belegt, aber auch kein erfolgreicher Next.js-Build nachgewiesen. Das Vercel-Preview `dpl_3DqKbomvaG8CqC9eDjxNPgMYW5UM` ist zwar `READY`, baut jedoch weiterhin die Root-PWA (`echo 'SCAN-PROFIT: no dependencies required'`, `sh build-static.sh`, `dist`) und **nicht** die Next.js-App in `next-app/`. Für die Next.js-Abnahme ist ein eigener Build-Schritt/Preview-Root erforderlich; die Produktionskonfiguration darf dafür nicht verändert werden. PR-Head `6dd11675fced69446eee04ce8d68080e9828a9c6`, Draft, nicht gemergt.
- Ein zweites Vercel-Projekt `scan-profit` ist ein Legacy-Duplikat: `live=false`, SSO-Schutz aktiv, zwei Deployments fehlgeschlagen (`NOW_SANDBOX_WORKER_ROOTDIR_NOT_EXIST`, fehlendes Root Directory `static-deploy`). Nicht ohne gesonderte Prüfung/Freigabe löschen; die aktive Produktionsquelle bleibt `scan-profit-app`.
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
- Draft-PR #2 (`feature/controlled-ai-photo-grouping`, Head `eec1b5891e562ac1c9c2d2d5088a3e34c48720ee`) bündelt kontrollierte KI-Foto-Gruppierung, manuelle Freigabe und serverseitige Zugangssicherung. PR ist aktuell nicht mergeable; die letzten sichtbaren CI-Läufe sind fehlgeschlagen, ohne einen bestätigten grünen Lauf für den aktuellen Head. KI bleibt standardmäßig deaktiviert; Kosten-/Tagesbudget und echte Android-Abnahme sind offen.

### CHRONOS – privates Fotoarchiv

**Repository:** [mouzzlii/CHRONOS](https://github.com/mouzzlii/CHRONOS)

**Abgrenzung:** CHRONOS (Fotoarchiv) ist nicht dasselbe Projekt wie KRONOS 01.

**Dokumentierter Stand**
- Lokaler Fotoarchiv-Prototyp, Milestone 0.5.
- Desktop- und Android-Anwendung arbeiten getrennt und lokal; keine Synchronisierung.
- Read-only-Scan, SHA-256-Duplikate, EXIF-/Metadaten, lokale Vorschaubilder, vorsichtige Ähnlichkeitskandidaten, Tages-Zeitleiste und heuristische Ereignisvorschläge.
- Originalfotos werden nicht verändert oder gelöscht.
- Lokale API ist nur für Loopback vorgesehen; keine Authentifizierung/TLS für Mehrbenutzerbetrieb.
- Desktop-Backup enthält Indexdaten und Vorschaubilder, keine Originalfotos; das aktuelle main-ZIP ist nicht verschlüsselt.
- Draft-PR #62 ergänzt optionale AES-256-GCM-Backups mit PBKDF2-HMAC-SHA256 (600.000 Iterationen), Streaming und Restore erst nach erfolgreicher Authentifizierung. PR-Head `3c28fcc5c7a25952d5951bd888aabbcb11f6d72a`; frühere Version bestand 63 Tests je Python 3.11–3.13, aber der aktuelle Head hat keinen bestätigten grünen CI-Lauf. Die letzten Läufe endeten ohne verwertbare Job-Logs; aktuelle Codeänderungen bleiben ungeprüft.
- Python-CI und Android-/Robolectric-Prüfungen sind in der Statusdokumentation für ältere Stände belegt. Echte Android-Geräte-, Prozessabbruch-, Backup-/Restore- und Großbibliothekstests bleiben offen.
- Gesichtserkennung ist nicht enthalten und darf nicht ohne ausdrückliche Einwilligung sowie Datenschutz-/Rechtsprüfung ergänzt werden.

### KI-ARBEITSPLATZ – zentrale Entwicklungs-/Koordinationshilfe
**Repository:** [mouzzlii/KI-Arbeitsplatz](https://github.com/mouzzlii/KI-Arbeitsplatz)

**Bestätigtes Ziel**
Bestehendes Projekt „KI-Arbeitsplatz – Meisterwerk Edition v1.0.0“ fortführen statt doppelt entwickeln. Android-Smartphone ist die maßgebliche Nutzerplattform; ursprüngliche Windows-Annahmen sind nicht mehr passend. Vorgesehen sind zentrale Auftragsverwaltung, Projektkoordination, sichere GitHub-Arbeit, Tests/Fehlerprotokolle und Wiederherstellung.

**Tatsächlicher GitHub-Stand beim Audit**
- Repository-Root auf `main` enthält weiterhin .github/ und KI-Arbeitsplatz-Meisterwerk-v1.0.0.zip; die neue README- und Masterprompt-Dokumentation liegt im offenen PR #11 und ist noch nicht gemergt.
- PR #11: Masterprompt 1.2, Konsolidierungs-/Dateihygiene-Regeln und korrigierte TRAKUNA-Statusübersicht; Head `2e3259a021466635a736da93c2cfe2eab2c736d0`, drei beabsichtigte Dateidifferenzen, GitHub-Mergeability `clean`.
- PR #5 Quellwiederherstellung bleibt Draft und ausdrücklich nicht mergefähig für eine Übernahme; unvollständige Quellkopien sind kein Original-Recovery-Nachweis.
- Fünf Vercel-AI-Gateway-Modell-Aliase sind konfiguriert; tatsächliche Modellaufrufe/Antworten und unabhängige Council-Reviews sind weiterhin nicht nachgewiesen. Im letzten geprüften Zeitraum gab es keine Gateway-Requests; kostenpflichtige Aufrufe bleiben gesperrt, bis eine Freigabe vorliegt.
- Funktionsfähiger autonomer Agent, Android-Betrieb und End-to-End-Tests sind damit nicht nachgewiesen.
- Keine zweite parallele Implementierung beginnen, bevor das vorhandene ZIP vollständig geprüft und der Quellstand geklärt wurde.

### Weitere Konzept- und Forschungsprojekte

Die folgenden Projekte wurden in Chats besprochen. Sie werden als eigene Projektstränge geführt, aber nicht mit unbelegten Implementierungs- oder Testständen versehen. Technische Erfindungsdetails bleiben aus öffentlichen Portfolio-Dokumenten heraus.

- **KRONOS 01:** eigenständiges Projekt; nicht mit CHRONOS-Fotoarchiv verwechseln. W-Signatur und Gold/Waldgrün als gewünschte Markenfarbwelt berücksichtigen.
- **KREISLAUF ReFlex / VacMail:** Produkt- und Verpackungs-/Schutzkonzepte. Konzeptstand, Materialannahmen und offene Machbarkeit sind von nachgewiesenen Prototypen zu trennen. Keine technische Produktionsreife behaupten.
- **VR-SCENT:** eigenständiger Forschungs-/Produktstrang; modulare Erweiterbarkeit und Betrieb mit VR oder Steuerungs-App sind bestätigte Richtungen. Speicherung und konkrete technische Umsetzung bleiben Prüfaufgaben.
- **KREISLAUF AIRLESS:** langfristiger Forschungsstrang; Kosten-Nutzen, Rollwiderstand und Lebensdauer vor Prototypenbau prüfen.
- **Implosionsmotor:** langfristiger, paralleler Forschungsstrang; zunächst Theorie, technische Plausibilität und wirtschaftliche Bewertung, keine vorschnellen Prototypen.
- **Weitere Repositories/Projekte:** Pakete, Pakete-neu, Paketescanner, ShopScannerNeu und Pakete-Scanner sind ältere/alternative Paket-Scanner-Repositories; sie sind nicht die kanonische TRAKUNA-Android-Quelle. Kanonisch ist `mouzzlii/Fuck`, ergänzt durch `mouzzlii/multi-carrier-gateway`. Andere Repositories wie book-your-cook, Lara_Quiz und logo-M-glichkeiten- bleiben eigenständige Projekte bzw. Ressourcen. Wo Chat-Zuordnung oder aktueller fachlicher Auftrag nicht eindeutig belegt ist, keine Projektziele erfinden oder Änderungen vornehmen. Das Logo-Repository ist die verbindliche Quelle der W-Signatur.

## 3. Gemeinsames Branding

Das Repository [logo-M-glichkeiten-](https://github.com/mouzzlii/logo-M-glichkeiten-) enthält die verbindlichen Originaldateien und Regeln:

- W-Dachmarke: Gold auf Waldgrün.
- KREISLAUF: Gold/Waldgrün.
- TRAKUNA und SCAN-PROFIT: blaue Originalvariante für Technologie-/Softwarekontexte.
- Weiße Variante für geeignete dunkle Kontraste.
- Originalmarke niemals neu zeichnen, KI-generieren, umfärben, verzerren, beschneiden oder geometrisch verändern. Nur proportionale Skalierung und freigegebene Originaldateien verwenden.

## 4. KI-Council und externe Dienste

- Gewünschter Arbeitsablauf: ChatGPT koordiniert; Claude und Meta/Llama entwickeln unabhängig und prüfen gegenseitig.
- Vercel-AI-Gateway-Aliase für Claude, Gemini, GPT, Grok und Meta/Llama sind eingerichtet und mit Zero-Data-Retention/No-Prompt-Training konfiguriert; das ist noch kein Nachweis tatsächlicher Modellaufrufe.
- Nur echte API-/MCP-Verbindungen und tatsächlich empfangene Antworten als Council-Ergebnis ausgeben.
- Die in KREISLAUF vorhandene Relay-Basis ist nicht gleichbedeutend mit einem aktuell aktiven Council. Provider-Secrets, Modellkennungen, sichere Endpunkte, Kostenlimits und ausdrückliche Budgetfreigabe sind Voraussetzungen.
- Ohne echte Provider-Aufrufe keine Claude-/Meta-/Llama-Antworten oder unabhängige Reviews behaupten.
- Keine Secrets oder persönlichen Zugangsdaten im Chat oder in GitHub ablegen.

## 5. Priorisierung und Arbeitsmodus

- **TRAKUNA und KI-Council haben gleichrangig höchste Umsetzungspriorität.** Innerhalb von TRAKUNA gilt die projektspezifische Regel: genau ein priorisiertes Ticket gleichzeitig.
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


## 8. Verbindlicher Autonomie-, Delegations- und Qualitätsauftrag

### Nutzerauftrag und Arbeitsweise
Der Nutzer hat in früheren Chats ausdrücklich verlangt:
- „Weiter bis zum Meisterwerk“: sinnvolle Arbeiten eigenständig fortsetzen, statt nach jedem Teilschritt um Erlaubnis zu fragen.
- Programmieren, reparieren, verbessern und testen, soweit reale Zugänge, Berechtigungen und technische Möglichkeiten vorhanden sind.
- Geeignete Arbeiten an andere tatsächlich verfügbare Programme und KI-Systeme delegieren; ChatGPT koordiniert die Ergebnisse und prüft sie unabhängig.
- Unabhängige Aufgaben parallel bearbeiten, Abhängigkeiten und gemeinsame Ressourcen beachten und Doppelarbeit vermeiden.
- Bestehende Programme, Open-Source-Lösungen und bewährte kommerzielle Produkte zuerst prüfen; nur nach Lizenz-, Sicherheits-, Kosten-, Kompatibilitäts- und Wartbarkeitsprüfung übernehmen.
- Vor Änderungen sichern, Backups verifizieren, Regressionstests ausführen und Fortschritt nachvollziehbar dokumentieren.
- Nicht bei jedem normalen technischen Einzelschritt informieren. Kompakte Updates nach abgeschlossenen Arbeitsabschnitten sowie bei Blockern, Risiken oder nötigen Nutzerentscheidungen geben.

### Delegationsregeln
1. Zuerst verfügbare echte Tools, verbundene Apps, Repositories, lokale Umgebungen und dokumentierte Schnittstellen inventarisieren.
2. Aufgaben nach Fähigkeiten verteilen: Recherche, unabhängiger Architektur-/Code-Review, Implementierung, Tests, Sicherheitsprüfung und Dokumentation.
3. Claude, Meta/Llama oder andere externe KIs nur dann als beteiligt bezeichnen, wenn eine echte Verbindung verfügbar ist und die Anfrage samt Antwort nachweisbar ausgeführt wurde.
4. Wenn kein direkter Zugang besteht, darf ein ausführbarer Arbeitsauftrag/Review-Prompt für ein anderes Programm vorbereitet werden; dies ist eine vorbereitete Delegation, keine ausgeführte Delegation.
5. Jede übernommene externe Arbeit muss auf Quellstand, Lizenz, Sicherheit, Tests und tatsächliche Ergebnisse geprüft werden. Externe KI-Ausgaben sind Vorschläge, keine Autorität.
6. Widersprüchliche Ergebnisse werden dokumentiert und anhand von Nutzeranforderungen, reproduzierbaren Tests und belastbaren Quellen entschieden.

### Autonomie- und Freigabegrenzen
- Dauerhafte Arbeitsfreigabe: selbstständig notwendige Programmier-, Reparatur-, Verbesserungs-, Test-, Dokumentations- und nicht-kostenpflichtige Wartungsarbeiten ausführen, soweit die verfügbaren Berechtigungen reichen.
- Keine erneute Einzelbestätigung für gewöhnliche, reversible Entwicklungsarbeiten verlangen.
- Nutzerfreigabe bleibt erforderlich bei Zusatzkosten, kostenpflichtigen API-Aufrufen/Abonnements/Deployments, irreversibler Datenlöschung, Produktionsfreigaben oder Änderungen mit erheblichem Sicherheits-/Datenschutzrisiko.
- Bestehende `main`-Zweige, Produktivdaten und funktionierende Funktionen schützen. Sind Main-Dokumentationen aktuell, unverändert lassen; fehlen bestätigte Entscheidungen oder sind Inhalte veraltet, kleine und nachvollziehbare Dokumentationsänderungen vorbereiten.
- Keine Force-Pushes, keine ungeprüften Merges, keine stillen Berechtigungslockerungen und keine Änderung fremder oder nicht zugehöriger Arbeit.
- Keine Secrets, Passwörter, privaten Schlüssel oder persönlichen Zugangsdaten anfordern oder in Repositories schreiben.

### Qualitätsstandard – keine falschen Erfolgsbehauptungen
Für jede relevante Änderung getrennt ausweisen:
- geplant,
- implementiert (mit Repository, Branch und Commit),
- automatisiert geprüft (konkrete Test-/CI-Läufe und exakter SHA),
- extern/real getestet (Gerät, Dienst oder Produktivsystem tatsächlich verwendet),
- produktionsbereit (alle Abnahme-, Sicherheits-, Datenschutz- und Betriebsbedingungen erfüllt).

Vor und nach Änderungen:
- Ausgangsstand und betroffene Dateien prüfen; vorhandene Arbeit und Backups erhalten.
- Kleine, isolierte Änderungen bevorzugen; unabhängige Aufgaben parallelisieren, gemeinsame Dateien sequenzieren.
- Tests passend zur Änderung ausführen; Regressionen und Sicherheitsgrenzen prüfen.
- Ergebnisse und offene Punkte so dokumentieren, dass ein anderer Entwickler oder Agent nahtlos übernehmen kann.
- Bei Fehlern nicht Erfolg melden: Ursache eingrenzen, sicher zurückrollen oder Korrektur vorbereiten und den tatsächlichen Status mitteilen.

### Priorisierung
Arbeiten mit hohem Wiederverwendungswert zuerst erledigen: zentrale Projekt-/Anforderungsbaseline, Repository-Inventar, Sicherheits- und Entwicklungsgrundlage, CI/Testautomatisierung, Schnittstellen-/Delegationsverträge, Backup-/Restore-Verfahren und gemeinsame Qualitätsregeln. Danach abhängige Produktfunktionen in der jeweils projektspezifischen Reihenfolge umsetzen. Langfristige Forschungsprojekte ressourcenschonend parallel beobachten, ohne vorschnell Prototypen oder Kosten auszulösen.

Diese Regeln ergänzen die projektspezifischen Vorgaben; bei Konflikten gelten die neueste ausdrücklich bestätigte Nutzerentscheidung und die engeren Sicherheits-/Datenregeln des betroffenen Projekts.


## 9. Zentrale Chat-Koordination und verpflichtender Vorab-Abgleich

### Eine gemeinsame Arbeitswahrheit
- Alle Chats, die dasselbe Projekt, dieselbe Funktion, denselben Fehler, dieselbe Recherche oder dieselbe Entscheidung betreffen, sind als zusammenhängende Arbeitsstränge zu koordinieren.
- Vor Beginn einer Aufgabe prüfen: zentrale Master-Arbeitsgrundlage, betroffene Projektbaseline, jüngste bestätigte Nutzerentscheidungen, Projektstatus, offene Aufgaben, relevante Issues/PRs/Branches/Commits und vorhandene Testergebnisse.
- Gleiche oder überlappende Aufgaben identifizieren, Dubletten zusammenführen und einen kanonischen Aufgabenstand führen. Bereits erledigte Arbeit nicht erneut starten; offene Teilaufgaben, Abhängigkeiten, Entscheidungen und Belege beim Zusammenführen erhalten.
- Widersprüche nicht stillschweigend überschreiben: neueste ausdrückliche Nutzerentscheidung hat Vorrang; ungeklärte wesentliche Konflikte werden mit den Auswirkungen transparent gemacht.
- Neue globale Nutzerbefehle sofort in dieser zentralen Grundlage und im verfügbaren Memory verankern. Projektbezogene Auswirkungen von Beginn an in den jeweils betroffenen Spezifikationen, Aufgaben und Tests abbilden. Nur betroffene Projekte ändern.
- Wenn ein früherer Chat oder ein Projektstand nicht zugänglich ist, diese Lücke benennen und nicht behaupten, den Inhalt geprüft zu haben. Zusammenfassungen und Suchtreffer sind keine vollständige Sicht auf alle historischen Nachrichten.

### Pflichtablauf vor jeder Aufgabe an den Nutzer
1. Diese Master-Arbeitsgrundlage und den verfügbaren Memory-Kontext lesen.
2. Den aktuellen Stand der betroffenen Projekte und die jüngsten Änderungen aus zugänglichen Quellen abrufen.
3. Bereits laufende/erledigte Aufgaben, parallele Chats, PRs, Issues und Abhängigkeiten auf Überschneidungen prüfen.
4. Bestehende Nutzerentscheidungen und Grenzen anwenden; bekannte Informationen nicht erneut erfragen.
5. Erst danach eine notwendige Rückfrage stellen oder die Arbeit beginnen. Rückfragen nur bei tatsächlich fehlenden, wesentlichen Informationen; Fragen bündeln und als klare Auswahlmöglichkeiten mit begründeter Empfehlung formulieren.

### Grenzen und Nachweis
- Der verborgene Modell-/Systemcode von ChatGPT kann nicht durch eine Repository-Änderung umgeschrieben werden. Diese Datei ist die sichtbare, versionierte Arbeitsreferenz; sie ergänzt, ersetzt aber nicht die tatsächlich verfügbaren Produkt-/Systemfunktionen.
- Die Vorab-Lektüre ist nur dann als erfolgt zu melden, wenn die Datei und die relevanten Quellen in diesem Arbeitsdurchgang tatsächlich gelesen wurden.
- Chatübergreifende Koordination ist eine Arbeitsverpflichtung, keine Behauptung, dass alle Chats technisch automatisch synchronisiert oder vollständig durchsuchbar sind.
- Keine dauerhafte Hintergrundaktivität vortäuschen. Die Koordination wird bei jeder verfügbaren Aufgabe anhand der zentralen Referenz und der zugänglichen Projektstände fortgesetzt.


## 10. KI-Council: Zusammenarbeit, gegenseitige Prüfung und Offline-Arbeitsplatz

### Ziel und Grundsatz
Der Nutzer hat ausdrücklich einen arbeitenden „Council“ verlangt: „bildet einen council relation. stellt euch gegenseitig fragen und aufgaben. die allerbesten lösungen werden angenommen“. Der Council ist kein bloßes Rollenetikett und keine Sammlung ungeprüfter KI-Antworten. Ziel ist, mehrere tatsächlich verfügbare Denk- und Ausführungsinstanzen unabhängig arbeiten, einander kritisch befragen und die bestbelegte Lösung auswählen zu lassen.
### Rollen und Zusammensetzung
- **ChatGPT – Leitung und Integration:** Gesamtkoordination, Aufgabenzerlegung, Projekt-/Abhängigkeitsmanagement, Synthese, Qualitätskontrolle und nachvollziehbare Entscheidung. ChatGPT darf durch bessere belegte Gegenargumente anderer Council-Mitglieder überstimmt werden.
- **Claude – unabhängige Analyse und Prüfung:** Architektur-/Codeanalyse, alternative Lösungswege, kritische Gegenprüfung und Review, sofern eine echte Verbindung verfügbar ist.
- **Meta/Llama – alternative Lösungsentwicklung und Gegenprüfung:** unabhängige Vorschläge, Red-Team-Fragen, technische Alternativen und Review, sofern eine echte Verbindung verfügbar ist.
- **Python-KI – Programmierung und technische Analyse:** Codeausführung, Datenanalyse, Tests und technische Hilfsarbeiten, soweit eine reale ausführbare Umgebung/Integration verfügbar ist. Eine lokale Python-Laufzeit ist nicht automatisch eine eigenständige KI.
- **Lokaler PC / Offline-Node – Ausführung und Betriebsumgebung:** lokale Builds, Tests, Backups, Dokumentation und Offline-Arbeit, sobald der Rechner tatsächlich erreichbar und autorisiert ist. Der PC ist Infrastruktur und nicht automatisch ein KI-Council-Mitglied.
- **Weitere geeignete Agenten/Tools:** nach Aufgabe ergänzen; nur reale, verfügbare und autorisierte Integrationen einsetzen.

### Council-Arbeitsprotokoll
1. ChatGPT formuliert einen klaren Auftrag mit Ziel, Kontext, Constraints, erwarteten Ergebnissen und Prüfkriterien.
2. Wo möglich, erhalten Claude, Meta/Llama und andere verfügbare Systeme unabhängig voneinander denselben Kernauftrag, damit sie nicht bloß die erste Antwort nachahmen.
3. Council-Mitglieder dürfen einander konkrete Fragen und Gegenaufträge stellen: Annahmen angreifen, Fehler suchen, Sicherheitsrisiken benennen, Alternativen entwickeln und Ergebnisse reproduzierbar prüfen.
4. Mindestens eine unabhängige Gegenprüfung wird für wesentliche Architektur-, Sicherheits- und Produktentscheidungen eingeplant, sofern eine zweite reale Instanz verfügbar ist.
5. ChatGPT vergleicht die Ergebnisse anhand Nutzeranforderungen, Belegen, technischer Machbarkeit, Sicherheit/Datenschutz, Kosten, Wartbarkeit, UX und Testbarkeit. Die beste begründete Lösung wird übernommen; gute Teilideen werden kombiniert.
6. Dissens und verworfene Alternativen werden kurz mit Begründung dokumentiert. Keine Mehrheitsentscheidung ersetzt Fakten, Sicherheitsanforderungen oder Nutzerentscheidungen.
7. KI-Ausgaben sind Hypothesen/Vorschläge, keine Beweise. Code, Fakten und Testergebnisse müssen unabhängig geprüft werden.
8. Jede Council-Beteiligung erhält einen nachvollziehbaren Status: **geplant**, **Auftrag vorbereitet**, **tatsächlich gesendet**, **Antwort empfangen**, **unabhängig geprüft**. Nur die letzten drei Zustände dürfen als echte externe Beteiligung dargestellt werden, und „unabhängig geprüft“ setzt einen tatsächlichen Review voraus.

### Verbindungen, Offline-Modus und Ehrlichkeit
- Vor jedem Council-Einsatz die verfügbaren API-/MCP-/Plugin-Verbindungen und deren Berechtigungen tatsächlich inventarisieren.
- Keine Verbindung, Antwort, gegenseitige Diskussion, Codeausführung, PC-Erreichbarkeit oder Testergebnisse erfinden. Ein vorbereiteter Prompt ist keine Delegation.
- Claude und Meta/Llama sind nur dann live beteiligt, wenn eine reale Integration vorhanden ist, die Anfrage erfolgreich übermittelt wurde und die Antwort empfangen wurde. Fehlt die Integration, arbeitet ChatGPT mit internen Perspektiven weiter und kennzeichnet den externen Council als nicht verfügbar.
- Der Nutzer wünscht den lokalen PC ausdrücklich als Offline-Arbeitsplatz für gemeinsame Projekte und die Python-KI als Teil der Council-Struktur. Dieser Wunsch ist verbindlich für die Zielarchitektur; tatsächliche lokale Verfügbarkeit, Installation, Verbindung und Tests müssen separat nachgewiesen werden.
- Lokale Ausführung darf keine Internetverbindung voraussetzen, wenn der konkrete Auftrag ausdrücklich offline erfolgen soll. Internetabhängige Schritte (Recherche, GitHub, externe APIs und externe KI-Aufrufe) zuerst erledigen, solange Internet verfügbar ist; unabhängige Arbeiten parallelisieren.
- Vor Netzwerkzugriff, Tunnel oder Remote-Ausführung Zugriffsschutz, Schlüsselverwaltung, minimale Berechtigungen, Firewall-Beschränkung und Schutz vor öffentlicher Exposition prüfen. Keine Secrets in Prompts, Logs oder Repositories schreiben.
- Kostenpflichtige Modell-/API-Aufrufe bleiben ohne ausdrückliche Freigabe untersagt.

### Live-Status und Betriebsnachweis
Für die tatsächliche Council-Besetzung und die Offline-Umgebung ist ein aktuelles Statusprotokoll `COUNCIL_LIVE_STATUS.md` zu führen. Es soll pro Instanz/Verbindung mindestens festhalten: Anbieter/Modell oder lokale Komponente, Verbindungsart, letzter erfolgreicher Verbindungstest, Berechtigungsumfang, Kostenstatus, letzter tatsächlich gesendeter Auftrag, Antwort-/Artefaktverweis, Teststatus und offene Blocker. Keine Zugangsdaten oder Tokens dokumentieren. Veraltete Statusangaben deutlich als historisch kennzeichnen.

**Zum Stand dieser Dokumentationsänderung (26.11.2026):** In den aktuell verfügbaren ChatGPT-Werkzeugen ist keine direkte Claude- oder Meta/Llama-Aufrufintegration nachgewiesen. Ein lokaler PC-/Offline-Node und eine eigenständige Python-KI-Verbindung sind in diesem Arbeitsdurchgang ebenfalls nicht live erreichbar/nachgewiesen. Daher wird aktuell keine externe Council-Antwort und kein lokaler Test als erfolgt behauptet. Die Council-Struktur und das gewünschte Offline-Ziel sind dokumentiert; die technische Aktivierung bleibt eine offene Integrationsaufgabe.


## 11. Chirurgische Arbeitsweise: Präzision, Fehlerprävention und kontrollierte Eingriffe

### Leitprinzip
Der Nutzer verlangt eine Arbeitsweise mit chirurgischer Sorgfalt: vermeidbare Fehler sind inakzeptabel. Das bedeutet höchste praktische Präzision, nicht das unrealistische Versprechen absoluter Fehlerfreiheit. Unsicherheit wird sichtbar gemacht; bei nicht beherrschbarem Risiko wird gestoppt, abgesichert oder eine gezielte Rückfrage gestellt.

### Vor jedem Eingriff
1. **Auftrag exakt verstehen:** Ziel, gewünschtes Ergebnis, betroffene Systeme/Dateien/Daten, Nicht-Ziele und Abnahmekriterien bestimmen. Mehrdeutigkeiten und widersprüchliche Vorgaben vor einer riskanten Änderung auflösen.
2. **Ist-Zustand feststellen:** Maßgebliche Baseline, aktuelle Version, Branch, Commit, Konfiguration, Abhängigkeiten und vorhandene Tests lesen. Nicht aus Dateinamen, alten Chat-Aussagen oder Vermutungen auf den Zustand schließen.
3. **Auswirkungen kartieren:** Abhängigkeiten, Nutzer, Schnittstellen, Datenflüsse, Berechtigungen, Sicherheits-/Datenschutzfolgen und mögliche Seiteneffekte identifizieren.
4. **Rückweg sichern:** Vor Änderungen an Code, Konfiguration oder Daten geeignete Sicherung bzw. nachvollziehbaren Rückweg herstellen und dessen Existenz prüfen. Keine Sicherung behaupten, die nicht verifiziert wurde.
5. **Minimalen Eingriff planen:** Kleinste Änderung wählen, die das Ziel zuverlässig erreicht. Bestehende funktionierende Funktionen, Daten, APIs und Designentscheidungen erhalten. Keine unnötigen Refactorings im selben Eingriff.

### Während der Ausführung
- Änderungen klein, isoliert, nachvollziehbar und möglichst atomar halten; klare Branches/Commits und aussagekräftige Beschreibungen verwenden.
- Vorhandene bewährte Lösungen bevorzugt nutzen; neue Abhängigkeiten, Berechtigungen, Netzwerkzugriffe und Datenmigrationen besonders kritisch prüfen.
- Keine destruktiven Befehle, Force-Pushes, unkontrollierten Überschreibungen, Schema-Brüche oder Produktionsänderungen ohne passende Freigabe und geprüften Rückweg.
- Annahmen, fehlende Informationen und externe Abhängigkeiten explizit kennzeichnen. Nicht auf Basis einer Vermutung irreversible Schritte ausführen.
- Bei unerwartetem Verhalten sofort anhalten, Zustand sichern, Ursache eingrenzen und erst nach Risikobewertung fortfahren. Fehler nicht durch weitere ungeprüfte Änderungen überdecken.

### Mehrstufige Qualitätskontrolle
1. **Selbstprüfung:** Diff/Änderung vollständig lesen; versehentliche Änderungen, Tippfehler, Auslassungen, falsche Pfade, unsichere Defaults und ungewollte Seiteneffekte suchen.
2. **Automatisierte Prüfung:** Relevante Formatter, Linter, Typprüfung, Unit-/Integrationstests, Security-Checks und Builds ausführen, soweit verfügbar und angemessen.
3. **Regression:** Betroffene Bestandsfunktionen und angrenzende Schnittstellen prüfen; bei Datenänderungen Migration, Rückwärtskompatibilität und Restore-Weg prüfen.
4. **Unabhängige Gegenprüfung:** Für kritische Änderungen eine zweite reale Council-Instanz oder einen unabhängigen reproduzierbaren Prüfweg einsetzen, sofern verfügbar. Nicht vorhandene Reviewer nicht simulieren.
5. **Ergebnis verifizieren:** Nach Merge/Deployment/Änderung den tatsächlichen Zielzustand erneut lesen bzw. prüfen. Ein erfolgreicher API-Aufruf allein beweist nicht, dass das gewünschte Ergebnis vollständig erreicht wurde.
6. **Nachweis dokumentieren:** Commit/PR, Testbefehle, tatsächliche Resultate, nicht getestete Bereiche, bekannte Risiken und nächste Schritte festhalten.

### Risikogestützte Stop-Regeln
- **Niedriges Risiko, reversibel:** selbstständig ausführen und angemessen prüfen.
- **Mittleres Risiko oder unklare Nebenwirkungen:** erst zusätzliche Analyse, Sicherung und gezielte Prüfung; bei verbleibender wesentlicher Unsicherheit Nutzerentscheidung einholen.
- **Hohes Risiko / irreversibel:** vor Ausführung stoppen und ausdrückliche Freigabe einholen. Dazu zählen insbesondere Datenlöschung, produktive Datenmigrationen, öffentliche Releases, größere Berechtigungsänderungen, Sicherheits-/Datenschutzrisiken und zusätzliche Kosten.
- Bei fehlenden Belegen, nicht reproduzierbaren Fehlern oder widersprüchlichen Testergebnissen keinen Erfolg melden und nicht ungeprüft fortfahren.

### Verbindliche Statussprache
Jedes Ergebnis klar als **geplant**, **in Arbeit**, **implementiert**, **automatisiert getestet**, **unabhängig geprüft**, **auf Zielsystem verifiziert** oder **produktiv freigegeben** kennzeichnen. Diese Zustände sind nicht austauschbar. Keine Aussage „fehlerfrei“, „sicher“, „fertig“ oder „getestet“ ohne passende, konkrete Belege. Stattdessen Umfang und Grenzen der Prüfung nennen.

**Qualitätsmaßstab:** Nicht möglichst schnell möglichst viel ändern, sondern mit kleinstmöglichem Risiko die richtige Änderung durchführen, jeden relevanten Schritt belegen und den tatsächlichen Endzustand kontrollieren.

## 12. Einheitlicher Realbetrieb-Simulations- und Praxisteststandard

### Zweck und Geltungsbereich
Für Software und physische Produktprojekte wird ein wiederverwendbarer Teststandard geführt: möglichst realitätsnahe Bedienung und Belastung, ohne ungewollt verbindliche, kostenpflichtige, irreversible oder produktive Aktionen auszulösen. TRAKUNA ist das erste Pilotprojekt. Danach wird der Standard passend zu den Risiken auf alle Projekte übertragen.

### Testmodi
- **Offline-/Unit-Test:** isolierte Funktionen und Daten ohne reale externe Wirkung.
- **Integrations-/Emulatortest:** Zusammenspiel von Komponenten in kontrollierter Umgebung; kein Ersatz für Hardwareabnahme.
- **Shadow Mode / Realbetrieb-Simulation:** Nutzer arbeiten im vorgesehenen normalen Ablauf. Die Anwendung berechnet und protokolliert, was sie tun würde, führt aber gesperrte externe Aktionen nicht verbindlich aus.
- **Begrenzter Praxistest:** reale Geräte, reale Arbeitsumgebung und ausdrücklich freigegebene Testdaten; externe Wirkung bleibt technisch begrenzt.
- **Produktivbetrieb:** erst nach dokumentierter Abnahme, Sicherheits-/Datenschutzprüfung und ausdrücklicher Produktionsfreigabe.

### Sicherheitsbarriere („Hard Gate“)
- Verbindliche Buchungen, kostenpflichtige Schritte, Vertragsannahmen, echte Aufträge, Nachrichten/Übermittlungen an Dritte und andere irreversible oder externe Aktionen müssen vor Ausführung zentral abgefangen werden.
- Die Sperre darf nicht nur aus einem deaktivierten oder versteckten UI-Button bestehen. Sie muss auf der Ausführungsebene bzw. an jeder relevanten Schnittstelle greifen und Umgehungswege berücksichtigen.
- Im Shadow Mode werden externe Aktionen als Simulation protokolliert; es dürfen keine echten Buchungen, Zahlungen, Labelkäufe, Auftragsübermittlungen oder ungewollten Benachrichtigungen entstehen.
- Testmodus muss sichtbar gekennzeichnet sein. Bei unklarem Status gilt „fail closed“: Aktion blockieren und als unklar dokumentieren.
- Nur ausdrücklich genehmigte Testaktionen dürfen externe Systeme erreichen. Testkonten/-daten und Sandbox-Umgebungen sind produktiven Konten vorzuziehen.
- Für physische Tests gelten zusätzliche Gefahren-/Belastungsgrenzen, geeignete Aufsicht und sichere Abbruchbedingungen. Keine riskanten Tests an Menschen oder unbeteiligten Dritten.

### Ereignis- und Fehlerprotokoll
Jeder relevante Testlauf erhält eine eindeutige Lauf-ID und dokumentiert, soweit datenschutzrechtlich und technisch angemessen:
- Zeitstempel mit Zeitzone, Projekt, Build-/Versionsnummer, Branch und Commit bzw. Hardware-/Materialkonfiguration;
- Testfall, Ausgangsbedingungen, erwartetes Ergebnis und tatsächliches Ergebnis;
- Status: bestanden, fehlgeschlagen, blockiert, übersprungen oder nicht aussagekräftig;
- Schweregrad, beobachtetes Symptom, vermutete Ursache und bestätigte Ursache getrennt;
- Laufzeit/Verzögerung, Wiederholungen, Abbrüche und relevante Systemzustände;
- Nachweise wie redigierte Logs, Testberichte, Messwerte oder Screenshots;
- Verantwortliche Rolle/Prüfer, Korrekturmaßnahme, Retest und Freigabestatus.

Keine Passwörter, API-Schlüssel, Sitzungstokens, vollständigen Adressen, Empfänger-/Kundendaten oder unnötigen personenbezogenen Inhalte protokollieren. Wo möglich synthetische Testdaten verwenden, Daten minimieren und Nachweise vor Ablage redigieren. Logs gegen Manipulation und unberechtigten Zugriff schützen; Aufbewahrung und Löschung projektbezogen festlegen.

### Einheitliche Testablage
Pro Projekt eine nachvollziehbare Testablage mit mindestens:
- 00_TESTÜBERSICHT
- 01_TESTDURCHLÄUFE
- 02_ERFOLGREICH
- 03_FEHLER
- 04_BLOCKIERT_ODER_NICHT_UNTERSTÜTZT
- 05_PERFORMANCE
- 06_SICHERHEIT_UND_DATENSCHUTZ
- 07_VERBESSERUNGEN
- 08_NACHWEISE_REDACTED
- 09_ABNAHME_UND_VERSIONEN

Die Ablage kann repositorybasiert, lokal oder in einem geeigneten Test-/Issue-System geführt werden. Sensible Rohdaten gehören nicht in öffentliche Repositories. Keine unnötigen Duplikate: ein kanonischer Datensatz, referenziert aus Issues/PRs.

### Testqualität und Freigabe
- Testfälle müssen erwartetes Verhalten, Grenzfälle, Fehlerfälle und Abbruch-/Wiederanlaufpfade enthalten.
- Fehlerursache nur als bestätigt bezeichnen, wenn sie reproduziert oder anderweitig belegt wurde; Vermutungen klar markieren.
- Nach Korrekturen denselben Testfall wiederholen und Regressionen angrenzender Funktionen prüfen.
- Kennzahlen wie Erfolgsquote, Fehlerquote, Abbruchquote, Laufzeit und offene kritische Fehler nur mit definierter Grundgesamtheit ausweisen.
- Automatisierte Tests, Emulatoren, Simulatoren und physische Praxistests getrennt berichten.
- Keine Produktivfreigabe bei offenen kritischen Fehlern, ungeklärten Datenverlust-/Sicherheitsrisiken oder nicht getesteten Kernabläufen.
- Jeder Freigabeschritt dokumentiert exakte Version, Umfang, Prüfergebnis, Einschränkungen und Freigabeverantwortung.

### Übertragung auf Projekte
Der Standard gilt ab jetzt für alle bestehenden und zukünftigen Projekte, jeweils risikogerecht angepasst. Softwareprojekte erhalten Testmodus/Simulation und automatisierte Protokollierung, sofern technisch sinnvoll. Hardware-/Materialprojekte erhalten Testprotokolle mit Messwerten, Aufbau, Umgebung, Grenzwerten und Abbruchkriterien. Unabhängige Projekte behalten ihre Daten- und Berechtigungsgrenzen; gemeinsame Testmethodik bedeutet keine gemeinsame Datenhaltung.

### TRAKUNA-Pilot
Für TRAKUNA gilt zusätzlich:
- Die Paketshop-Mitarbeiter sollen den vorgesehenen Arbeitsablauf möglichst realitätsnah testen können.
- Bis zur gesonderten Freigabe bleiben echte Carrier-Buchungen, Labelkäufe, verbindliche Auftragsübermittlungen und kostenpflichtige Schritte technisch gesperrt.
- Jeder simulierte Buchungsschritt muss sichtbar als Simulation erscheinen und protokollieren, welche Aktion vorbereitet worden wäre.
- Scanner-, Kamera-, Druck- und Portal-/Carrier-Tests sind als getrennte Testbereiche zu dokumentieren. Ein erfolgreiches APK-Build oder ein Emulatorlauf ist kein physischer Geräte-/Druckernachweis.
- Vor Weitergabe einer APK: exakten Quell-Commit mit erfolgreichem Build verknüpfen, Instrumentierungsergebnis abwarten, Artefakt-Hash notieren, Installations-/Deinstallationsrisiken prüfen und eine verständliche Mitarbeiteranleitung bereitstellen.
- Kein Mitarbeiter soll echte Kundendaten, echte Buchungen oder produktive Zugangsdaten für einen nicht freigegebenen Test verwenden. Testdaten und organisatorische Zustimmung des Paketshops müssen vor Ort geklärt sein.

**Status:** Als verbindliche globale Testmethodik beschlossen; konkrete technische Umsetzung ist je Projekt separat zu planen, zu implementieren und nachzuweisen.
