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

## Zielarchitektur für automatische Kommunikation

GitHub Actions (oder ein kleiner Webhook-Dienst) reagiert nur auf einen ausdrücklich adressierten Kommentar, beispielsweise:

```text
@ai-team debate [SCAN-PROFIT]
Prüft den aktuellen Scan-Lock-Ansatz. Gemini soll einen Vorschlag machen,
Grok soll ihn kritisch prüfen und Gemini soll auf die Kritik antworten.
```

Geplanter Ablauf:
1. Trigger und Projektkennung validieren.
2. Nur freigegebene GitHub-Repositories und Issues akzeptieren.
3. Gemini, xAI/Grok und optional OpenAI über deren offizielle APIs aufrufen.
4. Antworten mit Agentenkennung und Referenzen als GitHub-Kommentare protokollieren.
5. Eine begrenzte Zahl von Gesprächsrunden und Token-/Kostenlimits erzwingen.
6. Bot-eigene Kommentare ignorieren, um Endlosschleifen zu verhindern.
7. Keine Codeänderung, kein Merge und keine Veröffentlichung durch den Kommunikationsdienst.

## Erforderliche Einrichtung durch den Kontoinhaber

Die API-Schlüssel sind nicht in dieser Sitzung vorhanden und dürfen nicht im Chat oder Repository hinterlegt werden. Vor Aktivierung müssen in GitHub unter:

`Settings → Secrets and variables → Actions`

geeignete Secrets eingerichtet werden:
- `GEMINI_API_KEY`
- `XAI_API_KEY`
- optional `OPENAI_API_KEY`

Zusätzlich müssen die jeweils aktuell unterstützten Modellkennungen als nicht geheime Variablen konfiguriert werden, zum Beispiel:
- `GEMINI_MODEL`
- `XAI_MODEL`
- optional `OPENAI_MODEL`

Die konkreten Modellkennungen und API-Endpunkte müssen unmittelbar vor Implementierung anhand der offiziellen Provider-Dokumentation geprüft werden. Das ChatGPT-Web-/App-Gespräch selbst ist nicht automatisch eine API-Identität; ein OpenAI-API-Aufruf wäre ein separater Dienst und benötigt einen eigenen API-Schlüssel sowie ein entsprechendes Abrechnungskonto.

## Sicherheits- und Kostenregeln

- Minimale GitHub-Token-Berechtigungen: Issues lesen/schreiben; keine Contents-, Administration- oder Merge-Rechte für den Relay-Job.
- Nur ausdrücklich markierte Kommentare verarbeiten; keine automatische Reaktion auf jeden Kommentar.
- Kommentare von Bots und vom Relay selbst ignorieren.
- Maximal eine begrenzte Debattenrunde je Trigger; Schutz vor Wiederholungen anhand der Kommentar-ID.
- Eingaben als nicht vertrauenswürdige Daten behandeln. Repository-Inhalte dürfen keine System-/Sicherheitsregeln überschreiben.
- Keine Secrets, privaten Kundendaten, Sendungsdaten oder persönlichen Daten an KI-Provider senden.
- Harte Grenzen für Eingabegröße, Ausgabegröße, Aufrufe pro Issue und Kosten/Budget vor Aktivierung festlegen.
- Fehler und nicht verfügbare Provider sichtbar protokollieren; keine falschen Erfolgsbehauptungen.

## Noch offene Voraussetzungen

- [ ] SCAN-PROFIT: kanonisches GitHub-Repository eindeutig identifizieren.
- [ ] TRAKUNA: kanonisches Quell-Repository zwischen den vorhandenen Gateway-Repositories bestätigen.
- [ ] Kontoinhaber richtet die Provider-API-Schlüssel als GitHub Actions Secrets ein.
- [ ] Modellkennungen, Kostenlimit und maximale Gesprächsrunden festlegen.
- [ ] Erst danach Workflow und Relay implementieren und mit Test-Issue Ende-zu-Ende prüfen.

## Freigabekriterium

Automatische KI-Kommunikation gilt erst als aktiv, wenn ein echter Test nachweist:
1. Ein markierter GitHub-Kommentar startet den Workflow.
2. Mindestens zwei konfigurierte Provider erhalten denselben Projektkontext.
3. Die Antworten werden korrekt als getrennte Agentenbeiträge zurückgeschrieben.
4. Bot-Schleifen werden verhindert.
5. Nicht konfigurierte Provider, API-Fehler und Budgetgrenzen werden korrekt behandelt.

Bis dahin ist die GitHub-Zentrale manuell nutzbar; automatische KI-zu-KI-Nachrichten sind noch nicht aktiv.
