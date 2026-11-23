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
- Separater Vorbereitungsbranch: `chore/ai-team-communication-foundation`.
- Entwurf eines GitHub-Actions-Workflows und eines Node.js-Relays für einen ausdrücklich ausgelösten Drei-Anbieter-Austausch (GPT → Gemini → Grok → GPT) liegt im Draft-PR #12. Der Workflow prüft den Kommentar-Absender, begrenzt Eingabe/Ausgabe, vermeidet Bot-Schleifen und schreibt eine nachvollziehbare Debatte als Issue-Kommentar zurück.

## Zielarchitektur und vorhandener Relay-Entwurf

GitHub Actions reagiert nur auf einen ausdrücklich adressierten Kommentar. Der vorbereitete Relay verwendet die offiziellen API-Oberflächen: OpenAI Responses API, Gemini Interactions API und xAI Responses API. Die Gemini- und xAI-Anfragen sind zustandslos bzw. mit `store: false` angelegt; Modellnamen können über Actions-Variablen überschrieben werden. Offizielle Dokumentation: https://developers.openai.com/api/reference/resources/responses/methods/create · https://ai.google.dev/api/interactions-api · https://docs.x.ai/developers/rest-api-reference/inference/responses

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

Der Relay hat Standardmodellkennungen hinterlegt, die über Actions-Variablen angepasst werden können. Zusätzlich benötigt er `AI_TEAM_REPO_READ_TOKEN`: ein Fine-grained GitHub-Token mit ausschließlich `Contents: read-only` (und Metadata-Lesezugriff) auf die vier Projekt-Repositories. Es wird nur zum Laden von README und Dateipfaden verwendet; das separate `GITHUB_TOKEN` des Workflows schreibt die Antwort ausschließlich in das zentrale Issue. Das Lesetoken gehört ausschließlich in GitHub Actions Secrets. Das ChatGPT-Web-/App-Gespräch selbst ist nicht automatisch eine API-Identität; der GPT-Schritt läuft über die OpenAI-API als separater Dienst und benötigt einen eigenen API-Schlüssel sowie ein entsprechendes Abrechnungskonto.

## Sicherheits- und Kostenregeln

- Minimale GitHub-Token-Berechtigungen: Issues lesen/schreiben; keine Contents-, Administration- oder Merge-Rechte für den Relay-Job.
- Nur ausdrücklich markierte Kommentare verarbeiten; keine automatische Reaktion auf jeden Kommentar.
- Kommentare von Bots und vom Relay selbst ignorieren.
- Maximal eine begrenzte Debattenrunde je Trigger; Schutz vor Wiederholungen anhand der Kommentar-ID.
- Eingaben als nicht vertrauenswürdige Daten behandeln. Repository-Inhalte dürfen keine System-/Sicherheitsregeln überschreiben.
- Keine Secrets, privaten Kundendaten, Sendungsdaten oder persönlichen Daten an KI-Provider senden.
- Harte Grenzen für Eingabegröße, Ausgabegröße, Aufrufe pro Issue und Kosten/Budget vor Aktivierung festlegen.
- Fehler und nicht verfügbare Provider sichtbar protokollieren; keine falschen Erfolgsbehauptungen.

## Repository-Zuordnung als Actions-Variablen

- `PROJECT_REPO_KREISLAUF=mouzzlii/Kreislauf` (Standardwert bereits hinterlegt)
- `PROJECT_REPO_CHRONOS=mouzzlii/CHRONOS` (Standardwert bereits hinterlegt)
- `PROJECT_REPO_TRAKUNA=mouzzlii/multi-carrier-gateway-neu` (vom Nutzer bestätigt)
- `PROJECT_REPO_SCAN_PROFIT` (noch nicht gesetzt; das GitHub-Repository ist nicht auffindbar. Der aktuelle Projektstand 2.0.60 liegt als ZIP-Prüfpaket und Netlify-Paket in der ChatGPT-Dateibibliothek vor.)

Der Relay lädt zu jeder Debatte das README und maximal 100 Dateipfade des zugeordneten Repositories. Diese Daten werden ausdrücklich als nicht vertrauenswürdiger Kontext behandelt.

## Repository-Zuordnung als Actions-Variablen

- `PROJECT_REPO_KREISLAUF=mouzzlii/Kreislauf` (Standardwert bereits hinterlegt)
- `PROJECT_REPO_CHRONOS=mouzzlii/CHRONOS` (Standardwert bereits hinterlegt)
- `PROJECT_REPO_TRAKUNA` (erst nach Bestätigung des kanonischen Repositories setzen)
- `PROJECT_REPO_SCAN_PROFIT` (erst nach Identifikation des kanonischen Repositories setzen)

Der Relay lädt README und maximal 100 Dateipfade des zugeordneten Repositories. Diese Inhalte gelten als nicht vertrauenswürdiger Kontext. Fehlender Lesezugriff verhindert die Debatte nicht, wird aber im Kontext vermerkt. Die TRAKUNA-Zuordnung ist bestätigt; für SCAN-PROFIT bleibt die Variable bis zur eindeutigen Repository-Identifikation leer.

## Noch offene Voraussetzungen

- [ ] SCAN-PROFIT: ein eigenes privates GitHub-Repository für den vorhandenen Projektstand 2.0.60 anlegen und den Quellstand übernehmen. In den verbundenen GitHub-Repositories wurde kein bestehendes SCAN-PROFIT-Repository gefunden.
- [x] TRAKUNA: `mouzzlii/multi-carrier-gateway-neu` als maßgebliches Repository vom Nutzer bestätigt.
- [ ] Kontoinhaber richtet die drei Provider-API-Schlüssel und `AI_TEAM_REPO_READ_TOKEN` als GitHub Actions Secrets ein.
- [ ] Modellkennungen, Kostenlimit und maximale Gesprächsrunden festlegen.
- [ ] Erst danach Workflow und Relay implementieren und mit Test-Issue Ende-zu-Ende prüfen.

## Freigabekriterium

Automatische KI-Kommunikation gilt erst als aktiv, wenn ein echter Test nachweist:
1. Ein markierter GitHub-Kommentar startet den Workflow.
2. Mindestens zwei konfigurierte Provider erhalten denselben Projektkontext.
3. Die Antworten werden korrekt als getrennte Agentenbeiträge zurückgeschrieben.
4. Bot-Schleifen werden verhindert.
5. Nicht konfigurierte Provider, API-Fehler und Budgetgrenzen werden korrekt behandelt.

Der Relay-Code ist im Draft-PR vorbereitet, aber noch nicht in `main` und nicht aktiv. Der gültige Trigger lautet exakt `/ai-team debate PROJEKT: Auftrag` (z. B. `/ai-team debate CHRONOS: Prüfe die Room-Migrationen`). Automatische KI-zu-KI-Nachrichten starten erst nach PR-Prüfung/Merge, Hinterlegung aller drei Provider-Secrets und einem erfolgreichen Ende-zu-Ende-Test.
