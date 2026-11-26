# KI-Team-Kommunikation und Projektportfolio

## Ziel und Ablauf

GitHub ist das gemeinsame, dauerhafte Postfach und Entscheidungsprotokoll für KREISLAUF, TRAKUNA, SCAN-PROFIT und CHRONOS.

Zentrale Koordination: https://github.com/mouzzlii/Kreislauf/issues/11

Das KI-Team arbeitet als vierstufiger, unabhängiger Rat:

1. **OpenAI / GPT** erstellt die erste technische Analyse.
2. **Anthropic / Claude** prüft sie unabhängig und widerspricht bei Bedarf.
3. **Dritter Agent – ausdrücklich wählbar:** entweder Meta Muse über Metas gehostete Model API oder ein echtes Llama-Modell über einen eigenen/externen Inference-Host.
4. **OpenAI / GPT** moderiert die Synthese und dokumentiert begründete Übereinstimmungen, Widersprüche und offene Nachweise.

Jeder Agent erhält denselben begrenzten Projektkontext und die vorherigen Antworten. Vorherige Agentenantworten sind ebenfalls nicht vertrauenswürdige Daten; darin enthaltene Anweisungen dürfen keine Sicherheits- oder Systemregeln überschreiben. Der Relay ändert keine Quellcodes, führt keine Merges oder Deployments aus und nimmt keine produktiven Aktionen vor.

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

Zulässige Projektnamen: `KREISLAUF`, `TRAKUNA`, `SCAN-PROFIT`, `CHRONOS`, `INSERAT-PROFI-AI`, `BOOK-YOUR-COOK`, `LARA-QUIZ`.

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

`AI_TEAM_REPO_READ_TOKEN` muss ein Fine-grained GitHub-Token mit ausschließlich `Contents: read-only` und Metadata-Lesezugriff auf alle sieben Projekt-Primärrepositories aus der Zuordnung unten sowie jedes tatsächlich konfigurierte Zusatzrepository enthalten. Dazu gehören insbesondere `mouzzlii/Fuck` als TRAKUNA-Android-Repository und die privaten Repositories `mouzzlii/INSERAT-PROFI-AI`, `mouzzlii/book-your-cook` und `mouzzlii/Lara_Quiz`; diese müssen ausdrücklich in der Repository-Auswahl des Tokens enthalten sein. Ohne den jeweiligen Zugriff bricht der Relay vor Provider-Aufrufen ab. Das Token wird ausschließlich zum Laden des begrenzten Quellkontexts verwendet. Das separate Workflow-`GITHUB_TOKEN` kommentiert nur Issue #11; es erhält keine Merge- oder Quellcode-Schreibrechte.

Fehlende Schlüssel, ein fehlender Provider-Wert, eine fehlende Modellkennung oder eine unsichere Llama-URL führen zum sicheren Abbruch, bevor ein Provider aufgerufen wird. Die konfigurierte Modellkennung wird auf Vorhandensein geprüft, aber nicht vorab gegen die Live-Modellliste des Anbieters validiert. Eine nicht verfügbare oder nicht freigegebene Modellkennung kann daher erst der jeweilige Anbieter beim Aufruf zurückweisen; da das Tageskontingent vorher reserviert wird, zählt auch dieser fehlgeschlagene Versuch als Debatte. Modellkennungen werden nicht erraten. Meta erhält keine Llama-Anfragen und der Llama-Adapter wird nicht verwendet, wenn `AI_TEAM_THIRD_PROVIDER=meta` gewählt wurde.

## Sicherheits- und Kostenregeln

- Nur markierte Kommentare in Issue #11 und nur erlaubte GitHub-Absender verarbeiten; Bot-Kommentare werden ignoriert.
- Der Relay selbst akzeptiert ausschließlich Issue #11; dieser Guard besteht unabhängig von der Workflow-Auslösung.
- Vor der Tagesbudget-Reservierung muss das kanonische Hauptrepository einen Branch und mindestens einen echten Quelltextauszug liefern. Zusatzrepositorys (z. B. TRAKUNA Android) können diese Voraussetzung nicht erfüllen.
- Maximal zwei Debatten pro UTC-Kalendertag. Das Kontingent wird vor dem ersten Provider-Aufruf zentral reserviert; auch fehlgeschlagene Aufrufe verbrauchen es.
- Workflow-Concurrency serialisiert die Budgetreservierung. Bei unvollständigem Budget-Ledger erfolgt ein sicherer Abbruch.
- Verarbeitungsmarker und Tagesbudget-Reservierungen werden ausschließlich anerkannt, wenn sie von `github-actions[bot]` mit GitHub-Typ `Bot` stammen. Fremde Nutzer und andere Bots können weder Trigger unterdrücken noch das Tageskontingent künstlich verbrauchen.
- Jede Anfrage ist auf 8.000 Zeichen, der gesamte Projektkontext auf 18.000 Zeichen und jede Modellausgabe auf maximal 1.000 Tokens begrenzt.
- Der Relay lädt höchstens 80 Dateipfade und bis zu vier Quelltextauszüge je Repository (maximal 1.800 Zeichen je Datei, 6.500 Zeichen pro Repository) aus einer festen Allowlist.
- Umgebungs-, Secret-, Credential-, Schlüssel-, Lock- und Builddateien werden nicht geladen. Die Secret-Redaktion erkennt gängige Provider-Tokens, Fine-grained GitHub-PATs (`github_pat_`), GitLab-, Hugging-Face-, Meta-, npm-, Supabase- und AWS-Tokenformate, PEM-Private-Keys, JWTs, benannte Secret-Zuweisungen und lange Hexwerte. Das ist keine Garantie, dass jedes Geheimnis erkannt wird.
- Bei Aktivierung werden die ausgewählten Quelltextauszüge und die Anfrage an OpenAI, Anthropic und den jeweils gewählten dritten Provider übertragen. Keine echten Kundendaten, Sendungsdaten, personenbezogenen Daten oder Geheimnisse in den ausgewählten Dateien speichern.
- Eingabe- und Ausgabelimits sind keine garantierte Geldobergrenze. Für alle tatsächlich verwendeten Anbieter müssen echte Ausgabenlimits bzw. Kostenkontrollen gesetzt werden.
- `AI_TEAM_BUDGET_CONFIRMED=true` ist nur die manuelle Bestätigung des Kontoinhabers und prüft Anbieterbudgets nicht automatisch.
- Keine Secrets ausgeben oder anfordern; keine Produktivdatenbanken, Carrier-Systeme oder produktiven Buchungen verändern.

## Erweitertes Projektportfolio

Zusätzlich zu den vier ursprünglichen Projekten sind vier eigenständige Repositories für die begrenzte Council-Analyse vorgesehen:

- `INSERAT-PROFI-AI` → `mouzzlii/INSERAT-PROFI-AI` (eigenständige App; keine Kopplung oder Änderung an SCAN-PROFIT).
- `BOOK-YOUR-COOK` → `mouzzlii/book-your-cook` (Finanz-/Steuerlogik bleibt fachlich freigabepflichtig; keine automatischen Änderungen oder verbindlichen Steuerannahmen).
- `LARA-QUIZ` → `mouzzlii/Lara_Quiz` (lokales Offline-Quiz; keine Cloud-Synchronisierung unterstellen).
- `KI-ARBEITSPLATZ` → `mouzzlii/KI-Arbeitsplatz` (lokale Offline-/Masterwerk-Entwicklung; Branch wird fest konfiguriert).

Die drei zusätzlichen Repositories werden nur über feste, kleine Quelltext-Allowlists eingebunden. Für BOOK-YOUR-COOK sind insbesondere Steuer-/Preisregeln und Zahlungs-Webhook-Dateien als Prüfkontext markiert, nicht als Erlaubnis, sie ohne fachliche Freigabe zu ändern.

Die KI-ARBEITSPLATZ-Auswahl priorisiert `MASTERWERK-ROADMAP.md`, `Offline-Modus/Lib/Common.ps1`, `Offline-Modus/Lib/LocalAI.ps1` und `Offline-Modus/Worker.ps1`; die KI-Quellprüfung erfolgt gegen genau den konfigurierten Branch.

## Repository-Zuordnung

- `PROJECT_REPO_KREISLAUF=mouzzlii/Kreislauf`
- `PROJECT_REPO_TRAKUNA=mouzzlii/multi-carrier-gateway` und `PROJECT_REPO_TRAKUNA_ANDROID=mouzzlii/Fuck`
- `PROJECT_REPO_CHRONOS=mouzzlii/CHRONOS`
- `PROJECT_REPO_SCAN_PROFIT=mouzzlii/SCAN-PROFIT`
- `PROJECT_REPO_INSERAT_PROFI_AI=mouzzlii/INSERAT-PROFI-AI`
- `PROJECT_REPO_BOOK_YOUR_COOK=mouzzlii/book-your-cook`
- `PROJECT_REPO_LARA_QUIZ=mouzzlii/Lara_Quiz`
- `PROJECT_REPO_KI_ARBEITSPLATZ=mouzzlii/KI-Arbeitsplatz`
- `PROJECT_REPO_KI_ARBEITSPLATZ_REF=release/offline-masterwerk-v0.2.1` (Actions Variable; vor Nutzung auf den aktuellen freigegebenen Entwicklungsbranch setzen)

Für TRAKUNA werden Architektur- und Android-Quellrepository gemeinsam geladen; `multi-carrier-gateway-neu` bleibt ein separates Experiment. Der vollständige SCAN-PROFIT-Next.js-Quellbaum ist noch nicht in GitHub importiert; Relay-Analysen dürfen deshalb nicht als vollständige Quellcodeprüfung dieses Zweigs ausgegeben werden.

## Freigabekriterium

Der Livebetrieb gilt erst als aktiviert, wenn ein synthetischer Ende-zu-Ende-Test nachweist:
1. Ein markierter Kommentar startet den Workflow.
2. GPT, Claude und der ausgewählte Meta- oder Llama-Agent erhalten denselben begrenzten Projektkontext.
3. Die Antworten werden als getrennte Agentenbeiträge zurückgeschrieben.
4. Bot-Schleifen, doppelte Trigger und Tageslimits funktionieren.
5. Fehlende Konfiguration, Provider-Fehler, unsichere Llama-Endpunkte und Kostenlimits werden korrekt behandelt.

Der Relay ist in `main` integriert, aber bis zur Einrichtung der tatsächlichen Konten, Modellkennungen, Provider-Ausgabenlimits, read-only GitHub-Zugriff und einer ausdrücklichen Budgetfreigabe gesperrt. Es wurden in dieser Arbeit keine externen KI-Provider aufgerufen.


## Strukturierte, lokale Council-Aufgabe (Draft-Adapter)

Zusätzlich zum normalen Debattenbefehl ist auf diesem Draft-Branch ein strikt begrenzter Task-Eingang vorbereitet. Er akzeptiert ausschließlich einen v1-Envelope für eine schreibgeschützte statische Erstprüfung:

```text
/ai-team task: { ... vollständiger JSON-Envelope aus der lokalen Council-Outbox ... }
```

Der JSON-Inhalt muss vollständig und unverändert aus einer lokalen Outbox-Datei stammen. Der Relay prüft Protokollversion, Pflichtfelder, Absender-/Empfängeridentität, UUID- und Task-ID-Korrelation, Ablaufzeit, Idempotenzformat, kanonische Projekt-/Repository-Zuordnung, vollständige Commit-SHA, Read-only-Zwang, alle zehn verweigerten Nebenwirkungen und höchstens vier sichere repository-relative Quellpfade. Die Pfade müssen zusätzlich innerhalb der festen, projektspezifischen Relay-Allowlist liegen; Symlinks werden nicht geladen. Der Quellkontext wird am angegebenen Commit-SHA geladen, nicht an einem beweglichen Branch.

Der Export ist absichtlich auf `project.static_review` begrenzt. Inventar und Hash-Manifeste bleiben deterministische lokale Aufgaben; Backup/Restore und lokale Ollama-Aufgaben werden nicht an Provider übertragen. Derselbe Idempotenzschlüssel wird im vertrauenswürdigen GitHub-Budget-Ledger wiedererkannt, auch über UTC-Tagesgrenzen hinweg. Bei unvollständiger Ledger-Prüfung bricht der Relay fail-closed ab.

**Status:** Validator, Parser, Kommentar-Trigger, Commit-Pinning und Ledger-Deduplizierung sind im Draft-PR vorbereitet und erhalten Regressionstests. Noch keine Freigabe zum Merge, keine echte Provider-Anfrage, kein Live-Task und keine produktive Übertragung. Die KREISLAUF-PR-CI muss vor einer Freigabe vollständig erfolgreich sein; außerdem muss die KI-Arbeitsplatz-Outbox unter Windows real getestet werden.


## Vorhandene Vercel-EVE-Anwendung – Abgleich 26.11.2026

Das Team besitzt bereits das Vercel-Projekt `collective-intelligence-council` mit einer EVE-Webanwendung und acht Subagent-Rollen. Das Projekt ist jedoch nicht mit GitHub verbunden. Im Deployment verwenden aktuell Root-Agent und alle acht Subagents dasselbe Modell `openai/gpt-6-luna-fast`; die vorhandenen fünf Gateway-Virtual-Models werden im EVE-Quellcode noch nicht rollenbezogen verwendet. Die empfohlene Zuordnung, die Kosten-/Sicherheitsgrenzen und der vollständige Quellcode-Recovery-Blocker sind in [docs/VERCEL-EVE-INTEGRATION.md](docs/VERCEL-EVE-INTEGRATION.md) dokumentiert.

Wichtig: Die Deployment-Datei-Lese-Schnittstelle liefert große Quelltextdateien nur gekürzt. Daher wurde kein unvollständiger Import in GitHub erstellt. Die vorhandenen Sandbox-Sitzungen sind gestoppt; eine Wiederaufnahme wurde wegen möglicher Kosten nicht durchgeführt. Keine Provider-Anfragen, keine neue Vercel-App und keine Änderung der SSO-/Deployment-Einstellungen.
