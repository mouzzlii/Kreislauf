# Einheitlicher Realbetrieb-Simulations- und Praxisteststandard

**Status:** Verbindliche projektübergreifende Arbeitsgrundlage  
**Erstes Pilotprojekt:** TRAKUNA  
**Ziel:** Realitätsnahe Tests ohne ungewollte produktive, verbindliche, kostenpflichtige oder irreversible Aktionen.

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


## Verbindliche Ergebniskennzeichnung
- **Geplant:** vorgesehen, noch nicht umgesetzt.
- **Implementiert:** im bezeichneten Quellstand vorhanden.
- **Automatisiert getestet:** konkreter Testlauf und Commit erfolgreich.
- **Physisch getestet:** reales Gerät/Material unter dokumentierten Bedingungen verwendet.
- **Abgenommen:** definierte Prüfkriterien erfüllt und dokumentiert.
- **Produktiv freigegeben:** ausdrückliche Freigabe nach allen erforderlichen Prüfungen.

Ein erfolgreicher Build oder Emulatorlauf darf niemals als physische oder produktive Abnahme ausgegeben werden.
