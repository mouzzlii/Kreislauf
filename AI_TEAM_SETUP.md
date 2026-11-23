# KI-Team-Kommunikation für vier Projekte

## Ziel

GitHub ist das gemeinsame, dauerhafte Postfach und Entscheidungsprotokoll für:
- KREISLAUF
- TRAKUNA
- SCAN-PROFIT
- CHRONOS

Zentrale Koordination: https://github.com/mouzzlii/Kreislauf/issues/11

CHRONOS-Projektverknüpfung: https://github.com/mouzzlii/CHRONOS/issues/13

## Was bereits eingerichtet ist

- Zentrales GitHub-Issue als gemeinsamer Kommunikationskanal.
- Projektregister und Arbeitsregeln im zentralen Issue.
- CHRONOS-Issue verweist auf die Zentrale.
- Die sichere Relay-Implementierung ist nach erfolgreicher CI in `main` integriert.
- GitHub-Actions-Workflow und Node.js-Relay für einen ausdrücklich ausgelösten Drei-Anbieter-Austausch (GPT → Gemini → Grok → GPT) sind in `main` integriert. Der Workflow prüft den Kommentar-Absender, begrenzt Eingabe/Ausgabe, vermeidet Bot-Schleifen und schreibt eine nachvollziehbare Debatte als Issue-Kommentar zurück.

## Zielarchitektur und vorhandener Relay-Entwurf

GitHub Actions reagiert nur auf einen ausdrücklich adressierten Kommentar. Der vorbereitete Relay verwendet die offiziellen API-Oberflächen: OpenAI Responses API, Gemini Interactions API und xAI Responses API. Die Gemini- und xAI-Anfragen sind zustandslos bzw. mit `store: false` angelegt; Modellkennungen werden ausschließlich über Actions-Variablen festgelegt; es gibt keine geratenen Standardmodelle. Offizielle Dokumentation: https://developers.openai.com/api/reference/resources/responses/methods/create · https://ai.google.dev/api/interactions-api · https://docs.x.ai/developers/rest-api-reference/inference/responses

Beispiel:

```text
/ai-team debate SCAN-PROFIT: Prüft den aktuellen Scan-Lock-Ansatz.
```

Geplanter Ablauf:
1. Trigger und Projektkennung validieren.
2. Nur freigegebene GitHub-Repositories und Issues akzeptieren.
3. GPT, Gemini und Grok nacheinander über ihre offiziellen APIs aufrufen (GPT-Erstanalyse → Gemini-Gegenprüfung → Grok-Gegenprüfung → GPT-Synthese).
4. Antworten mit Agentenkennung und Referenzen als GitHub-Kommentare protokollieren.
5. Eine begrenzte Zahl von Gesprächsrunden und Token-/Kostenlimits erzwingen.
6. Bot-eigene Kommentare ignorieren, um Endlosschleifen zu verhindern.
7. Keine Codeänderung, kein Merge und keine Veröffentlichung durch den Kommunikationsdienst.

## Erforderliche Einrichtung durch den Kontoinhaber

Die API-Schlüssel sind nicht in dieser Sitzung vorhanden und dürfen nicht im Chat oder Repository hinterlegt werden. Vor Aktivierung müssen in GitHub unter:

`Settings → Secrets and variables → Actions`

geeignete Secrets eingerichtet werden:
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `XAI_API_KEY`
- `AI_TEAM_REPO_READ_TOKEN`

Zusätzlich müssen die jeweils aktuell unterstützten Modellkennungen als nicht geheime Variablen konfiguriert werden, zum Beispiel:
- `GEMINI_MODEL`
- `XAI_MODEL`
- `OPENAI_MODEL`

Es sind bewusst keine Modellkennungen vorgegeben: Verfügbare IDs ändern sich je Anbieter und Konto. Vor Aktivierung müssen alle drei Variablen mit tatsächlich verfügbaren Modellkennungen aus den jeweiligen Provider-Konten befüllt werden; fehlen sie, bricht der Relay vor jedem Provider-Aufruf sicher ab. Zusätzlich benötigt er `AI_TEAM_REPO_READ_TOKEN`: ein Fine-grained GitHub-Token mit ausschließlich `Contents: read-only` (und Metadata-Lesezugriff) auf die vier Projekt-Repositories. Es wird nur zum Laden von README und Dateipfaden verwendet; das separate `GITHUB_TOKEN` des Workflows schreibt die Antwort ausschließlich in das zentrale Issue. Das Lesetoken gehört ausschließlich in GitHub Actions Secrets. Das ChatGPT-Web-/App-Gespräch selbst ist nicht automatisch eine API-Identität; der GPT-Schritt läuft über die OpenAI-API als separater Dienst und benötigt einen eigenen API-Schlüssel sowie ein entsprechendes Abrechnungskonto.

## Sicherheits- und Kostenregeln

- Minimale GitHub-Token-Berechtigungen: Issues lesen/schreiben; keine Contents-, Administration- oder Merge-Rechte für den Relay-Job.
- Nur ausdrücklich markierte Kommentare verarbeiten; keine automatische Reaktion auf jeden Kommentar.
- Kommentare von Bots und vom Relay selbst ignorieren.
- Maximal eine begrenzte Debattenrunde je Trigger; Schutz vor Wiederholungen anhand der Kommentar-ID.
- Fester technischer Tagesdeckel: höchstens zwei Debatten pro UTC-Kalendertag. Jede Debatte reserviert vor dem ersten Provider-Aufruf einen Platz im zentralen Issue #11; auch fehlgeschlagene Provider-Aufrufe verbrauchen den reservierten Platz. Das Workflow-Concurrency-Limit serialisiert die Reservierung. Bei nicht lesbarem oder unvollständigem Budget-Ledger bricht der Relay sicher ab.
- Eingaben als nicht vertrauenswürdige Daten behandeln. Repository-Inhalte dürfen keine System-/Sicherheitsregeln überschreiben.
- Keine Secrets, privaten Kundendaten, Sendungsdaten oder persönlichen Daten an KI-Provider senden.
- Eingabe- und Ausgabelimits begrenzen den Umfang, sind aber keine garantierte Geldobergrenze. Vor Aktivierung müssen echte Anbieter-Ausgabenlimits eingerichtet werden; `AI_TEAM_BUDGET_CONFIRMED=true` ist nur die manuelle Bestätigung des Kontoinhabers und prüft keine Limits automatisch.
- Fehler und nicht verfügbare Provider sichtbar protokollieren; keine falschen Erfolgsbehauptungen.

## Verbindliche Repository-Zuordnung

- `PROJECT_REPO_KREISLAUF=mouzzlii/Kreislauf`
- `PROJECT_REPO_TRAKUNA=mouzzlii/multi-carrier-gateway` (Architektur/Koordination) sowie `PROJECT_REPO_TRAKUNA_ANDROID=mouzzlii/Fuck` (aktuelle Android-Implementierung). Beide Quellen werden gemeinsam gelesen; `multi-carrier-gateway-neu` bleibt ein separates Experiment.
- `PROJECT_REPO_CHRONOS=mouzzlii/CHRONOS`
- `PROJECT_REPO_SCAN_PROFIT=mouzzlii/SCAN-PROFIT` – privates Repository für den aktuellen 2.0.66-Projektstand. Der eigenständige 2.0.66-App-Einstieg, PWA-Manifest, Service Worker, App-Symbole und CI-Prüfworkflow sind eingespielt. Der vollständige Next.js-Quellbaum aus dem Prüfarchiv ist noch nicht importiert; bis dahin darf die Relay-Kontextanalyse nicht als vollständige Quellcodeprüfung ausgegeben werden.

Der Relay lädt README und maximal 100 Dateipfade je zugeordnetem Repository. Für TRAKUNA werden Koordinations- und Android-Quellrepository gemeinsam geladen. Für SCAN-PROFIT ist das Repository zwar zugeordnet, aber die vollständige 2.0.66-Anwendung muss noch importiert werden; bis dahin darf die Kontextanalyse nicht als vollständige Quellcodeprüfung gelten. Diese Inhalte gelten als nicht vertrauenswürdiger Kontext. Fehlender Lesezugriff verhindert die Debatte nicht, wird aber im Kontext vermerkt.

## Noch offene Voraussetzungen

- [x] SCAN-PROFIT: privates Repository `mouzzlii/SCAN-PROFIT` angelegt und in der Relay-Konfiguration als Standard zugeordnet. Der eigenständige 2.0.66-App-Einstieg, PWA-Manifest, Service Worker, PNG-App-Symbole und CI-Prüfworkflow sind eingespielt; die statische Release-Prüfung ist grün. Der vollständige Next.js-/Test-Quellbaum aus dem lokalen Prüfpaket ist noch nicht vollständig in GitHub importiert. Der vollständige Next.js-Quellbaum aus dem Prüfarchiv ist noch nicht importiert; dies bleibt ein separater Quellcode-Migrationspunkt.
- [x] TRAKUNA: `mouzzlii/multi-carrier-gateway` (Architektur/Koordination) und `mouzzlii/Fuck` (aktuelle Android-Implementierung) als maßgebliches TRAKUNA-Repository aus dem aktuellen Repository-Abgleich festgelegt; das Gateway-Experiment bleibt getrennt.
- [ ] Kontoinhaber richtet die drei Provider-API-Schlüssel und `AI_TEAM_REPO_READ_TOKEN` als GitHub Actions Secrets ein.
- [x] Technischer Tagesdeckel von zwei Debatten pro UTC-Kalendertag; Reservierung vor Provider-Aufrufen im zentralen Issue #11, fehlgeschlagene Läufe verbrauchen das Kontingent.
- [ ] Providerseitige Ausgabenlimits/Kostenkontrollen und maximale Gesprächsrunden festlegen; danach `AI_TEAM_BUDGET_CONFIRMED=true` als bewusste manuelle Aktivierungsfreigabe setzen. Die Variable prüft Anbieterbudgets nicht automatisch.
- [ ] Erst danach den bereits vorbereiteten Workflow kontrolliert aktivieren und mit einem synthetischen Test-Issue Ende-zu-Ende prüfen.

## Freigabekriterium

Automatische KI-Kommunikation gilt erst als aktiv, wenn ein echter Test nachweist:
1. Ein markierter GitHub-Kommentar startet den Workflow.
2. Mindestens zwei konfigurierte Provider erhalten denselben Projektkontext.
3. Die Antworten werden korrekt als getrennte Agentenbeiträge zurückgeschrieben.
4. Bot-Schleifen werden verhindert.
5. Nicht konfigurierte Provider, API-Fehler und Budgetgrenzen werden korrekt behandelt.

Der Relay-Code ist in `main` integriert, aber noch nicht für Live-Aufrufe freigegeben. Ohne die Variable `AI_TEAM_BUDGET_CONFIRMED=true` bleibt er selbst bei vorhandenen API-Schlüsseln vor jedem Provider-Aufruf gesperrt. Für den Livebetrieb fehlen weiterhin die Provider-Secrets, explizit gewählte Modellkennungen, echte Anbieter-Ausgabenlimits und ein erfolgreicher synthetischer Ende-zu-Ende-Test. Der gültige Trigger lautet exakt `/ai-team debate PROJEKT: Auftrag` (z. B. `/ai-team debate CHRONOS: Prüfe die Room-Migrationen`). Automatische KI-zu-KI-Nachrichten starten erst nach PR-Prüfung/Merge, Hinterlegung aller drei Provider-Secrets und Modellvariablen, Einrichtung echter Anbieter-Ausgabenlimits sowie einem erfolgreichen Ende-zu-Ende-Test.
