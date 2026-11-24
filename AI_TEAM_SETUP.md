# KI-Team-Kommunikation für vier Projekte

## Ziel

GitHub ist das gemeinsame, dauerhafte Postfach und Entscheidungsprotokoll für:
- KREISLAUF
- TRAKUNA
- SCAN-PROFIT
- CHRONOS

Zentrale Koordination: https://github.com/mouzzlii/Kreislauf/issues/11

CHRONOS-Projektverknüpfung: https://github.com/mouzzlii/CHRONOS/issues/13

## Gewünschter Agentenablauf

Das KI-Team besteht aus drei unabhängigen Modellen mit klaren Rollen:
1. **OpenAI / GPT** erstellt die erste Analyse und moderiert danach die Synthese.
2. **Anthropic / Claude** prüft den Auftrag und die GPT-Analyse unabhängig, widerspricht bei Bedarf und sucht fehlende Belege.
3. **Meta Llama** prüft die beiden bisherigen Positionen unabhängig. Dafür wird ein echtes Llama-Modell über einen OpenAI-kompatiblen Inference-Endpunkt eingebunden.

Der Ablauf ist GPT-Erstanalyse → Claude-Gegenprüfung → Llama-Gegenprüfung → GPT-Synthese. Jede Rolle erhält denselben begrenzten Projektkontext und die vorherigen Antworten. Der Relay führt keine Codeänderungen, Merges, Deployments oder produktiven Aktionen aus.

## Technische Schnittstellen

- **OpenAI:** Responses API, `POST https://api.openai.com/v1/responses`.
- **Claude:** Anthropic Messages API, `POST https://api.anthropic.com/v1/messages`, mit `anthropic-version: 2026-10-21`.
- **Llama:** OpenAI-kompatible Chat Completions API, konfigurierbare HTTPS-Adresse mit dem vollständigen Pfad `/v1/chat/completions`. Die Llama-API muss von GitHub Actions aus erreichbar sein und ein Bearer-Token akzeptieren.

Die Anthropic Messages API verwendet eine Systemanweisung und eine Nutzernachricht; der Antworttext wird nur aus Textblöcken übernommen. Der Llama-Adapter sendet eine System- und eine Nutzernachricht, begrenzt die Ausgabe und verwendet kein Streaming. Die Schnittstellen werden durch lokale Vertragstests ohne Provider-Aufrufe geprüft.

### Wichtige Unterscheidung bei Meta und Llama

Meta bietet inzwischen eine gehostete **Meta Model API** an, die Muse-Modelle wie Muse Spark bereitstellt. Diese gehostete API führt laut Meta selbst keine Llama-Modelle aus. Die Llama-Modellgewichte sind Open-Weight-Modelle und müssen über einen Inference-Anbieter oder eine eigene Infrastruktur bereitgestellt werden. Dieser Relay verwendet daher absichtlich einen explizit konfigurierten Llama-Endpunkt und behauptet nicht, die Meta Model API sei eine Llama-API.

Offizielle Dokumentation:
- Anthropic Messages API: https://platform.claude.com/docs/en/api/messages/create
- Anthropic API-Authentifizierung: https://platform.claude.com/docs/en/manage-claude/authentication
- Meta Model API: https://dev.meta.ai/docs/overview
- Meta-Erklärung zu Llama und Model API: https://dev.meta.ai/help/about-model-api/llama-and-model-api
- Offizielle Meta-Llama-Modelle: https://www.llama.com/

## Beispiel zum Starten einer Debatte

Nur ein ausdrücklich markierter Kommentar im zentralen Issue #11 startet einen Lauf:

```text
/ai-team debate SCAN-PROFIT: Prüft den aktuellen Scan-Lock-Ansatz.
```

Zulässige Projektnamen: `KREISLAUF`, `TRAKUNA`, `SCAN-PROFIT`, `CHRONOS`.

## Erforderliche Einrichtung durch den Kontoinhaber

Die API-Schlüssel sind nicht in dieser Sitzung vorhanden und dürfen niemals im Chat oder Repository hinterlegt werden. In GitHub unter:

`Settings → Secrets and variables → Actions`

müssen folgende **Secrets** eingerichtet werden:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `LLAMA_API_KEY`
- `AI_TEAM_REPO_READ_TOKEN`

Zusätzlich müssen folgende **Variablen** eingerichtet werden:
- `OPENAI_MODEL` – ein für das Konto freigegebenes OpenAI-Modell.
- `CLAUDE_MODEL` – eine für das Anthropic-Konto freigegebene Claude-Modellkennung.
- `LLAMA_MODEL` – die Modellkennung, die der gewählte Llama-Inference-Endpunkt bereitstellt.
- `LLAMA_API_BASE_URL` – vollständige HTTPS-Adresse, z. B. `https://<dein-inference-host>/v1/chat/completions`.
- `AI_TEAM_ALLOWED_USERS` – erlaubte GitHub-Benutzernamen, standardmäßig nur der Repository-Eigentümer.
- `AI_TEAM_BUDGET_CONFIRMED` – bleibt zunächst leer oder `false`; erst nach bestätigten Anbieter-Ausgabenlimits ausdrücklich auf `true` setzen.

Die Platzhalter in der Beispiel-URL müssen durch die echte Adresse des ausgewählten Llama-Hosting-Anbieters oder der eigenen gesicherten Inference-Infrastruktur ersetzt werden. Ein lokaler PC-Endpunkt wie `localhost` ist von GitHub-hosted Runnern nicht erreichbar. Eine private Llama-Instanz benötigt daher entweder einen gesicherten, von außen erreichbaren HTTPS-Endpunkt oder einen korrekt abgesicherten Self-hosted GitHub Runner im selben privaten Netz. Ein Llama-Server darf nicht ungeschützt ins Internet gestellt werden.

`AI_TEAM_REPO_READ_TOKEN` muss ein Fine-grained GitHub-Token mit ausschließlich `Contents: read-only` und Metadata-Lesezugriff auf die vier Projekt-Repositories sein. Es wird ausschließlich zum Laden des begrenzten Quellkontexts verwendet. Das separate Workflow-`GITHUB_TOKEN` schreibt die Debatte als Kommentar in Issue #11 und erhält keine Merge- oder Schreibrechte auf Quellcode.

Modellkennungen werden bewusst nicht automatisch geraten. Fehlende Schlüssel, ungültige Llama-URL oder fehlende Modellkennungen führen zum sicheren Abbruch, bevor ein Provider aufgerufen wird.

## Sicherheits- und Kostenregeln

- Nur ausdrücklich markierte Kommentare in Issue #11 verarbeiten; Kommentare von Bots ignorieren.
- Nur erlaubte GitHub-Absender dürfen den Relay starten.
- Höchstens zwei Debatten pro UTC-Kalendertag. Das Kontingent wird vor dem ersten Provider-Aufruf im zentralen Issue reserviert; auch fehlgeschlagene Provider-Aufrufe verbrauchen den reservierten Platz.
- Workflow-Concurrency serialisiert die Budgetreservierung. Ist das Budget-Ledger nicht vollständig lesbar, bricht der Relay sicher ab.
- Jede Anfrage ist auf 8.000 Zeichen begrenzt, der gesamte Projektkontext auf 18.000 Zeichen und jede Modellausgabe auf maximal 1.000 Tokens.
- Der Quelltext-Kontext umfasst höchstens 80 Dateipfade und bis zu vier ausgewählte Dateien je Repository (maximal 1.800 Zeichen je Datei und 6.500 Zeichen je Repository). Nur eine feste Allowlist wird gelesen; Umgebungs-, Secret-, Credential-, Schlüssel-, Lock- und Builddateien sind ausgeschlossen.
- Secret-Redaktion erkennt gängige Provider-Tokens, PEM-Private-Keys, JWTs, benannte Secret-Zuweisungen und lange Hex-Werte. Das ist eine zusätzliche Schutzschicht, keine Garantie, dass jedes Geheimnis erkannt wird.
- Die ausgewählten Quelltextauszüge und die Nutzeranfrage werden an OpenAI, Anthropic und den gewählten Llama-Inference-Anbieter übertragen. In den ausgewählten Dateien dürfen daher keine echten Kundendaten, Sendungsdaten, personenbezogenen Daten oder Geheimnisse stehen.
- Eingabe-/Ausgabelimits sind keine garantierte Geldobergrenze. Vor Aktivierung müssen bei allen drei Anbietern echte Ausgabenlimits bzw. Kostenkontrollen gesetzt werden.
- `AI_TEAM_BUDGET_CONFIRMED=true` ist ausschließlich die manuelle Bestätigung des Kontoinhabers. Die Variable prüft oder erzwingt keine Anbieterbudgets automatisch.
- Keine Secrets ausgeben oder anfordern; niemals Produktivdatenbanken, Carrier-Systeme oder produktive Buchungen ändern.

## Verbindliche Repository-Zuordnung

- `PROJECT_REPO_KREISLAUF=mouzzlii/Kreislauf`
- `PROJECT_REPO_TRAKUNA=mouzzlii/multi-carrier-gateway` (Architektur/Koordination) sowie `PROJECT_REPO_TRAKUNA_ANDROID=mouzzlii/Fuck` (aktuelle Android-Implementierung).
- `PROJECT_REPO_CHRONOS=mouzzlii/CHRONOS`
- `PROJECT_REPO_SCAN_PROFIT=mouzzlii/SCAN-PROFIT`

Für TRAKUNA werden Architektur- und Android-Quellrepository gemeinsam gelesen; `multi-carrier-gateway-neu` bleibt ein separates Experiment. Für SCAN-PROFIT ist der vollständige Next.js-/Test-Quellbaum noch nicht vollständig in GitHub importiert; die Relay-Kontextanalyse darf deshalb nicht als vollständige Quellcodeprüfung ausgegeben werden.

## Freigabekriterium

Automatische KI-Kommunikation gilt erst als aktiv, wenn ein echter synthetischer Test nachweist:
1. Ein markierter GitHub-Kommentar startet den Workflow.
2. GPT, Claude und Llama erhalten denselben abgegrenzten Projektkontext.
3. Antworten werden korrekt als getrennte Agentenbeiträge zurückgeschrieben.
4. Bot-Schleifen und doppelte Trigger werden verhindert.
5. Nicht konfigurierte Provider, API-Fehler, unsichere Endpunkte und Tages-/Kostenlimits werden korrekt behandelt.

Der Relay-Code ist in `main` integriert, aber noch nicht für Live-Aufrufe freigegeben. Provider-Keys, Modellkennungen, Llama-Hosting-Adresse, read-only GitHub-Token, reale Anbieter-Ausgabenlimits und ein erfolgreicher synthetischer Ende-zu-Ende-Test fehlen noch. Es wurden durch diese Entwicklung keine externen KI-Provider aufgerufen.
