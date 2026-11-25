# KI-Team-Kommunikation für fünf Projekte

## Ziel und Ablauf

GitHub ist das gemeinsame, dauerhafte Postfach und Entscheidungsprotokoll für KREISLAUF, TRAKUNA, SCAN-PROFIT, CHRONOS und KI-ARBEITSPLATZ.

Zentrale Koordination: https://github.com/mouzzlii/Kreislauf/issues/11

Das KI-Team arbeitet als vierstufiger, unabhängiger Rat:

1. **OpenAI / GPT** erstellt die erste technische Analyse.
2. **Anthropic / Claude** prüft sie unabhängig und widerspricht bei Bedarf.
3. **Dritter Agent – ausdrücklich wählbar:** entweder Meta Muse über Metas gehostete Model API oder ein echtes Llama-Modell über einen eigenen/externen Inference-Host.
4. **OpenAI / GPT** moderiert die Synthese und dokumentiert begründete Übereinstimmungen, Widersprüche und offene Nachweise.

Jeder Agent erhält denselben begrenzten Projektkontext und die vorherigen Antworten. Der Relay ändert keine Quellcodes, führt keine Merges oder Deployments aus und nimmt keine produktiven Aktionen vor.

## Dritten Agenten auswählen

Die Auswahl erfolgt über die GitHub Actions Variable:

- `AI_TEAM_THIRD_PROVIDER=meta` – nutzt die gehostete Meta Model API mit Muse-Modellen.
- `AI_TEAM_THIRD_PROVIDER=llama` – nutzt ein echtes Llama-Modell auf einem OpenAI-kompatiblen Inference-Endpunkt.

Diese beiden Varianten sind bewusst getrennt: Die gehostete Meta Model API führt Meta-eigene Muse-Modelle aus; Llama-Gewichte werden nicht über diese API gehostet. Ein echtes Llama-Modell muss durch einen Inference-Anbieter oder eigene Infrastruktur bereitgestellt werden.

## Technische Schnittstellen

- **OpenAI:** Responses API, `POST https://api.openai.com/v1/responses`.
- **Claude:** Anthropic Messages API, `POST https://api.anthropic.com/v1/messages`, mit `anthropic-version: 2026-10-21` und Bearer-Authentifizierung.
- **Meta Muse:** OpenAI-kompatible Chat Completions API, fest auf `POST https://api.meta.ai/v1/chat/completions` eingestellt, Bearer-Authentifizierung mit `MODEL_API_KEY`-Secret und einem ausdrücklich gewählten `META_MODEL`.
- **Llama:** OpenAI-kompatible Chat Completions API, konfigurierbare HTTPS-Adresse mit Pfad `/v1/chat/completions`, Bearer-Authentifizierung und ausdrücklich gewähltem `LLAMA_MODEL`. `localhost` ist von einem GitHub-hosted Runner nicht erreichbar. Eine eigene Llama-Instanz braucht einen abgesicherten, erreichbaren HTTPS-Endpunkt oder einen korrekt abgesicherten Self-hosted Runner im privaten Netz.

Meta und Llama verwenden dasselbe Nachrichtenformat mit System- und Nutzernachricht, begrenzter Ausgabe und ohne Streaming. Der Relay sendet keine Tools an diese beiden Gegenprüfer. Die Schnittstellen werden mit lokalen Vertragstests ohne echte Provider-Aufrufe geprüft.

Offizielle Dokumentation:
- Anthropic Messages API: https://platform.claude.com/docs/en/api/messages/create
- Anthropic Authentifizierung: https://platform.claude.com/docs/en/manage-claude/authentication
- Meta Model API Übersicht: https://dev.meta.ai/docs/overview
- Meta Chat Completions und Authentifizierung: https://dev.meta.ai/docs/authentication
- Meta API-Referenz: https://dev.meta.ai/docs/api-reference
- Meta erklärt den Unterschied zwischen Meta Model API und Llama: https://dev.meta.ai/help/about-model-api/llama-and-model-api
- Offizielle Llama-Modellfamilie: https://www.llama.com/

## Debatte starten

Nur ein ausdrücklich markierter Kommentar im zentralen Issue #11 startet einen Lauf:

```text
/ai-team debate SCAN-PROFIT: Prüft den aktuellen Scan-Lock-Ansatz.
```

```text
/ai-team debate KI-ARBEITSPLATZ: Prüft den Offline-Worker, die lokale Ollama-Erstprüfung und den aktuellen Windows-Abnahmestand.
```

Zulässige Projektnamen: `KREISLAUF`, `TRAKUNA`, `SCAN-PROFIT`, `CHRONOS`, `KI-ARBEITSPLATZ`.

**Rollout-Hinweis:** Die KI-ARBEITSPLATZ-Erweiterung liegt derzeit in Draft PR #39 und ist auf `main` noch nicht aktiv. Den neuen Befehl erst nach Review/Merge und nach Erweiterung des Read-only-Tokens verwenden.

## Einrichtung durch den Kontoinhaber

API-Schlüssel sind nicht in dieser Sitzung vorhanden und dürfen niemals im Chat oder Repository gepostet werden. In GitHub unter `Settings → Secrets and variables → Actions`:

**Immer erforderliche Secrets**
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `AI_TEAM_REPO_READ_TOKEN`

**Nur wenn `AI_TEAM_THIRD_PROVIDER=meta`**
- `META_MODEL_API_KEY`

**Nur wenn `AI_TEAM_THIRD_PROVIDER=llama`**
- `LLAMA_API_KEY`

**Erforderliche Variablen**
- `AI_TEAM_THIRD_PROVIDER` – exakt `meta` oder `llama`.
- `OPENAI_MODEL` – aktuell unterstützte Modellkennung für das OpenAI-Konto.
- `CLAUDE_MODEL` – aktuell unterstützte Modellkennung für Anthropic.
- `AI_TEAM_ALLOWED_USERS` – erlaubte GitHub-Benutzernamen; standardmäßig nur Repository-Eigentümer.
- `AI_TEAM_BUDGET_CONFIRMED` – bleibt leer/`false`, bis echte Anbieter-Ausgabenlimits eingerichtet und kontrolliert sind.

**Zusätzliche Variablen für Meta**
- `META_MODEL` – ein im Meta Model API-Konto verfügbares Muse-Modell, z. B. eine in der aktuellen Model API ausgewiesene Muse-Spark-Modellkennung.

**Zusätzliche Variablen für Llama**
- `LLAMA_MODEL` – Modellkennung, die der gewählte Llama-Host bereitstellt.
- `LLAMA_API_BASE_URL` – vollständige HTTPS-Adresse, die auf `/v1/chat/completions` endet.

`AI_TEAM_REPO_READ_TOKEN` muss ein Fine-grained GitHub-Token mit ausschließlich `Contents: read-only` und Metadata-Lesezugriff auf alle fünf Projekt-Primärrepositories sowie jedes tatsächlich konfigurierte Zusatzrepository enthalten. Dazu gehört insbesondere `mouzzlii/Fuck` als TRAKUNA-Android-Repository. Für KI-ARBEITSPLATZ muss `mouzzlii/KI-Arbeitsplatz` ausdrücklich in der Repository-Auswahl dieses Tokens enthalten sein; ohne den jeweiligen Zugriff bricht der Relay vor Provider-Aufrufen ab. Es wird ausschließlich zum Laden des begrenzten Quellkontexts verwendet. Das separate Workflow-`GITHUB_TOKEN` kommentiert nur Issue #11; es erhält keine Merge- oder Quellcode-Schreibrechte.

Fehlende Schlüssel, ein fehlender Provider-Wert, eine unbekannte Modellkennung oder eine unsichere Llama-URL führen zum sicheren Abbruch, bevor ein Provider aufgerufen wird. Modellkennungen werden nicht erraten. Meta erhält keine Llama-Anfragen und der Llama-Adapter wird nicht verwendet, wenn `AI_TEAM_THIRD_PROVIDER=meta` gewählt wurde.

## Sicherheits- und Kostenregeln

- Nur markierte Kommentare in Issue #11 und nur erlaubte GitHub-Absender verarbeiten; Bot-Kommentare werden ignoriert.
- Maximal zwei Debatten pro UTC-Kalendertag. Das Kontingent wird vor dem ersten Provider-Aufruf zentral reserviert; auch fehlgeschlagene Aufrufe verbrauchen es.
- Workflow-Concurrency serialisiert die Budgetreservierung. Bei unvollständigem Budget-Ledger erfolgt ein sicherer Abbruch.
- Verarbeitungsmarker und Tagesbudget-Reservierungen werden ausschließlich anerkannt, wenn sie von `github-actions[bot]` stammen. Gleichlautende Kommentare anderer Nutzer oder Bots können keine Läufe unterdrücken und das Tageslimit nicht künstlich verbrauchen.
- Jede Anfrage ist auf 8.000 Zeichen, der gesamte Projektkontext auf 18.000 Zeichen und jede Modellausgabe auf maximal 1.000 Tokens begrenzt.
- Der Relay lädt höchstens 80 Dateipfade und bis zu vier Quelltextauszüge je Repository (maximal 1.800 Zeichen je Datei, 6.500 Zeichen pro Repository) aus einer festen Allowlist.
- Umgebungs-, Secret-, Credential-, Schlüssel-, Lock- und Builddateien werden nicht geladen. Die Secret-Redaktion erkennt gängige Provider-Tokens, PEM-Private-Keys, JWTs, benannte Secret-Zuweisungen und lange Hexwerte. Das ist keine Garantie, dass jedes Geheimnis erkannt wird.
- Bei Aktivierung werden die ausgewählten Quelltextauszüge und die Anfrage an OpenAI, Anthropic und den jeweils gewählten dritten Provider übertragen. Keine echten Kundendaten, Sendungsdaten, personenbezogenen Daten oder Geheimnisse in den ausgewählten Dateien speichern.
- Eingabe- und Ausgabelimits sind keine garantierte Geldobergrenze. Für alle tatsächlich verwendeten Anbieter müssen echte Ausgabenlimits bzw. Kostenkontrollen gesetzt werden.
- `AI_TEAM_BUDGET_CONFIRMED=true` ist nur die manuelle Bestätigung des Kontoinhabers und prüft Anbieterbudgets nicht automatisch.
- Keine Secrets ausgeben oder anfordern; keine Produktivdatenbanken, Carrier-Systeme oder produktiven Buchungen verändern.

## Repository-Zuordnung

- `PROJECT_REPO_KREISLAUF=mouzzlii/Kreislauf`
- `PROJECT_REPO_TRAKUNA=mouzzlii/multi-carrier-gateway` und `PROJECT_REPO_TRAKUNA_ANDROID=mouzzlii/Fuck`
- `PROJECT_REPO_CHRONOS=mouzzlii/CHRONOS`
- `PROJECT_REPO_SCAN_PROFIT=mouzzlii/SCAN-PROFIT`
- `PROJECT_REPO_KI_ARBEITSPLATZ=mouzzlii/KI-Arbeitsplatz`
- Optional `PROJECT_REPO_KI_ARBEITSPLATZ_REF=release/offline-masterwerk-v0.2.1` für die Prüfung des aktuellen Draft-Quellstands vor Merge; ohne diese Variable wird der Default-Branch `main` verwendet. Branch-Referenzen werden validiert.

Für TRAKUNA werden Architektur- und Android-Quellrepository gemeinsam geladen; `multi-carrier-gateway-neu` bleibt ein separates Experiment. Der vollständige SCAN-PROFIT-Next.js-Quellbaum ist noch nicht in GitHub importiert; Relay-Analysen dürfen deshalb nicht als vollständige Quellcodeprüfung dieses Zweigs ausgegeben werden.

## Freigabekriterium

Der Livebetrieb gilt erst als aktiviert, wenn ein synthetischer Ende-zu-Ende-Test nachweist:
1. Ein markierter Kommentar startet den Workflow.
2. GPT, Claude und der ausgewählte Meta- oder Llama-Agent erhalten denselben begrenzten Projektkontext.
3. Die Antworten werden als getrennte Agentenbeiträge zurückgeschrieben.
4. Bot-Schleifen, doppelte Trigger und Tageslimits funktionieren.
5. Fehlende Konfiguration, Provider-Fehler, unsichere Llama-Endpunkte und Kostenlimits werden korrekt behandelt.

Der Relay ist in `main` integriert, aber bis zur Einrichtung der tatsächlichen Konten, Modellkennungen, Provider-Ausgabenlimits, read-only GitHub-Zugriff und einer ausdrücklichen Budgetfreigabe gesperrt. Es wurden in dieser Arbeit keine externen KI-Provider aufgerufen.

## KI-ARBEITSPLATZ – lokale/offline Projektgrenze

Der Relay lädt für `KI-ARBEITSPLATZ` nur eine feste, kleine Allowlist aus Roadmap und Offline-Worker-Quelltext (maximal vier Auszüge je Repository, je höchstens 1.800 Zeichen). Die vier freigegebenen Pfade sind:

- `MASTERWERK-ROADMAP.md`
- `Offline-Modus/Lib/Common.ps1`
- `Offline-Modus/Lib/LocalAI.ps1`
- `Offline-Modus/Worker.ps1`

Der Quellcode des aktuellen Offline-Moduls liegt derzeit auf `release/offline-masterwerk-v0.2.1`, während `main` noch das ursprüngliche v1.0.0-ZIP enthält. Für eine Prüfung vor dem Merge muss deshalb die optionale Repository-Variable `PROJECT_REPO_KI_ARBEITSPLATZ_REF=release/offline-masterwerk-v0.2.1` gesetzt werden; ohne sie verwendet der Relay `main` und bricht bei fehlenden Quelltextauszügen sicher ab. Der Relay arbeitet weiterhin ausschließlich lesend: keine Commits, keine Dateien ändern, keine Merges und keine Deployments. Die lokale Windows-Ollama-Funktion bleibt davon getrennt. Der externe Relay ist nur für unabhängige Gegenprüfungen zuständig.

Wenn das Repository oder die ausgewählten Quelltexte nicht vollständig gelesen werden können, wird die Debatte vor der Tagesbudgetreservierung abgebrochen. Damit werden keine Provider mit einem unvollständigen oder leeren Projektkontext aufgerufen.
