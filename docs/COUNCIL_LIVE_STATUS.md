# KI-Council – Live- und Integrationsstatus

**Letzte Prüfung:** 27.11.2026, 17:00 Europe/Vienna  
**Zweck:** Nachweisbare Übersicht der tatsächlich verfügbaren Council-Instanzen, Modellkonfigurationen, Aufrufwege, Datenschutzgrenzen und Kostenkontrollen. Keine Zugangsdaten, Tokens oder Secrets eintragen.

## Tatsächlicher Status

| Instanz | Konfiguration | Aktiver Aufrufweg in `main` | Live-Inferenz |
|---|---|---|---|
| ChatGPT / GPT | ChatGPT-Sitzung verfügbar; Vercel-Alias `vmc/council-gpt` → `openai/gpt-5` aktiv | Der GitHub-Relay verwendet derzeit direkt OpenAI Responses API, nicht den Vercel-Alias | Keine neue externe Inferenz in dieser Prüfung |
| Claude | Vercel-Alias `vmc/council-claude` → `anthropic/claude-sonnet-4.6` aktiv | Der GitHub-Relay verwendet derzeit direkt Anthropic Messages API | Nicht nachgewiesen |
| Gemini | Vercel-Alias `vmc/council-gemini` → `google/gemini-3-flash` aktiv | Im aktiven `main`-Relay nicht eingebunden | Nicht nachgewiesen |
| Grok | Vercel-Alias `vmc/council-grok` → `spacexai/grok-4.7` aktiv | Im aktiven `main`-Relay nicht eingebunden | Nicht nachgewiesen |
| Llama | Vercel-Alias `vmc/council-llama` → `meta/llama-4-maverick` aktiv | Der aktive `main`-Relay unterstützt alternativ einen separaten Llama-HTTPS-Host, nicht diesen Vercel-Alias | Nicht nachgewiesen |
| Meta Muse | Kein Vercel-Alias für Muse in der aktuellen Fünferliste | Der aktive `main`-Relay unterstützt alternativ die Meta Model API | Nicht nachgewiesen |
| Lokaler PC / Offline-Node | Windows-SSH-Einrichtung wurde vorbereitet; aktueller Host-Fingerprint-/Android-Verbindungstest steht aus | Kein bestätigter Fernzugriff | Nicht erreichbar/verifiziert |

**Wichtig:** Ein aktiver Modell-Alias, ein vorhandener Schlüssel, ein Deployment, eine Konfigurationsabfrage oder ein erfolgreicher Build beweist keine Modell-Inferenz. Für keines der externen Modelle wird hier ein Live-Aufruf behauptet.

## Verifizierte Vercel-AI-Gateway-Konfiguration

Am 27.11.2026 wurden die fünf Virtual Models einzeln read-only abgerufen:

- Alle fünf Aliase sind aktiv.
- Bei allen fünf ist `zeroDataRetention=true` und `disallowPromptTraining=true` gespeichert.
- **Claude:** Provider ausschließlich Bedrock und Vertex Anthropic; beide explizit auf EU-Zone konfiguriert.
- **GPT, Gemini und Grok:** in den gespeicherten Alias-Konfigurationen ist keine explizite EU-Inferenzregion festgelegt.
- **Llama:** Bedrock ist als Provider eingeschränkt, aber eine EU-Inferenzregion ist nicht bestätigt. Daher ausschließlich öffentliche, synthetische oder anonymisierte Daten; keine privaten Projektquellen, personenbezogenen Daten, Zugangsdaten oder vertraulichen Inhalte.
- Die ZDR-/No-Training-Angaben beschreiben die gespeicherte Gateway-Konfiguration. Sie ersetzen keine Prüfung des tatsächlichen Provider-Routings bei einem Live-Aufruf.

## Tatsächliche Relay-Lücke auf `main`

Der aktive Workflow `.github/workflows/ai-team-communication.yml` und `scripts/ai-team-relay.mjs` verwenden aktuell:

1. OpenAI direkt über die Responses API,
2. Claude direkt über die Anthropic Messages API,
3. wahlweise Meta Muse oder Llama als dritten Provider,
4. OpenAI direkt für die abschließende Synthese.

Der Workflow übergibt **kein** `AI_GATEWAY_API_KEY`; die fünf Vercel-Virtual-Model-Aliase werden vom aktiven `main`-Relay nicht aufgerufen. Gemini und Grok sind dort keine auswählbaren Council-Mitglieder. Der Gateway-Umbau in KREISLAUF PR #38 ist ein separater Draft-Branch und nicht Bestandteil von `main`; er bleibt wegen divergierender Historie und fehlender aktueller Freigaben ungemergt.

## Credential- und Kostenstatus

- Im Vercel-Projekt `collective-intelligence-council` existiert `AI_GATEWAY_API_KEY` als Sensitive-Variable ausschließlich für **Preview** und **Development**. Sie ist nicht für Production hinterlegt und wird nicht automatisch an GitHub Actions übertragen.
- Der Schlüsselwert wurde nicht abgerufen. Keine Secrets wurden gelesen, kopiert oder verändert.
- Das Vercel-Projektbudget beträgt **5 USD monatlich**, zuletzt gemeldeter Verbrauch **0 USD**. Das Sieben-Tage-Usage-Fenster vom 20.11. bis 27.11.2026 enthielt **0 Requests** und keine Kosten.
- **Das 5-USD-Budget ist keine harte Kostenobergrenze:** Laut aktueller Vercel-Dokumentation wird die Budgetprüfung vor jedem Request durchgeführt, aber ein Request, der die Grenze überschreitet, kann noch abgeschlossen werden. Die Gesamtausgaben können daher leicht über dem Budget liegen. Quelle: https://vercel.com/docs/ai-gateway/observability-and-spend/budgets
- Die Eingabe-/Ausgabelimits und das Tageskontingent des GitHub-Relays sind ebenfalls keine garantierte monetäre Obergrenze.
- MAINPROMPT 2.0.7 setzt Zusatzbudget standardmäßig auf **0 EUR** und Live-Council auf AUS. Deshalb wurden keine Provider-Aufrufe ausgelöst. Die bestehende 5-USD-Konfiguration ist keine zusätzliche Nutzerfreigabe.

## Sicherheits- und Datenschutzgrenzen

- Keine kostenpflichtigen Modell-/API-Aufrufe ohne ausdrückliche Budgetfreigabe.
- Kein Versand vertraulicher, personenbezogener, Zahlungs- oder Zugangsdaten an Modelle ohne nachgewiesene zulässige Datenverarbeitung und Region.
- Llama bleibt auf öffentliche, synthetische oder anonymisierte Daten beschränkt, solange keine geeignete EU-Verarbeitung nachgewiesen ist.
- Ein Gateway-Schlüssel für GitHub Actions müsste separat und minimal berechtigt als GitHub Actions Secret eingerichtet werden. Niemals Schlüssel in Chats, Issues, Quellcode, Logs oder Dokumentation schreiben.
- Keine Modellantworten, Peer-Reviews oder Council-Durchläufe als erfolgt ausgeben, bevor die tatsächlichen Requests und Antworten mit Provider-/Modellmetadaten belegt sind.



## Nachtrag – PR #38 Gateway-Branch geprüft (27.11.2026)

- Draft PR [#38](https://github.com/mouzzlii/Kreislauf/pull/38) enthält inzwischen den gemeinsamen Vercel-AI-Gateway-Aufrufweg für die vier fest allowlisteten Aliase GPT, Claude, Gemini und Grok. Der aktive `main`-Relay oben bleibt davon unberührt und verwendet weiterhin die zuvor dokumentierten direkten Provider-Clients.
- Exakter PR-Head: `1e7abcc03021d6276a8ed947a1877646a367e808`. GitHub Actions Relay-CI Run [46030025648](https://github.com/mouzzlii/Kreislauf/actions/runs/46030025648) wurde auf diesem Commit vollständig ausgeführt und bestand alle Schritte: Syntax, Task-Envelope, Ledger, Quellkontext, Gateway-Verträge, Befehlsparser und Projekt-/Tagesbudgetprüfungen.
- Ein vorangegangener Lauf auf einem Zwischen-Head scheiterte an zwei Dokumentations-/Test-Textabweichungen. Beide wurden korrigiert; der oben genannte Lauf ist der erfolgreiche Nachweis für den endgültigen Head.
- Vercel-Preview-Check auf dem PR-Head ist wegen `build-rate-limit` fehlgeschlagen; keine aktuelle Preview-Bereitstellung daraus ableiten.
- PR #38 bleibt Draft und ungemergt. Der Branch ist gegenüber `main` divergiert (Der Branch ist gegenüber `main` divergiert (Merge-Base `71fb0e07740150be13d40b1aef10ba269fe264b8`); Ahead-/Behind-Zahlen ändern sich mit jedem Main-Commit und sind unmittelbar vor einer Konsolidierung neu zu prüfen. GitHub meldete zuletzt `mergeable=false`.) und GitHub meldet `mergeable=false`. Keine Integration in `main` ohne kontrollierte Konsolidierung und erneute vollständige Prüfung.
- Keine Modell-Inferenz, keine Kosten, kein Gateway-Request, keine Secrets gelesen oder geändert. MAINPROMPT 2.0.7 setzt Live-Council AUS und Zusatzbudget 0 EUR; der vorhandene 5-USD-Soft-Cap ist keine Freigabe und keine harte Kostenobergrenze.

## Sicherheitsreview des Gateway-PR #38 – 27.11.2026

Der aktuelle Draft-Branch wurde nach dem erfolgreichen synthetischen Relay-CI-Lauf zusätzlich read-only geprüft. Die folgenden Punkte sind vor jeder Live-Aktivierung oder Integration zu beheben:

1. **Private Quelltexte werden als „internal“ an alle vier Modelle gesendet:** Das Task-Envelope verlangt in `scripts/ai-team-interop.mjs` ausdrücklich `dataClassification: "internal"`. Der Task-Router erlaubt `KI-ARBEITSPLATZ`, und die Quellkontextfunktion lädt bis zu vier freigegebene Dateien aus `mouzzlii/KI-Arbeitsplatz`. Die Repository-Metadaten bestätigen `visibility: private`. Der resultierende `safeContext` wird an GPT, Claude, Gemini und Grok übergeben. Nur Claude ist derzeit explizit auf EU-Routen beschränkt; für GPT, Gemini und Grok ist keine EU-Inferenzregion festgelegt. Die allgemeine Dokumentationswarnung gegen private Inhalte ist daher keine technische Sperre. **Structured Task Intake bleibt gesperrt**, bis Datenklassen, private Repositorys und Provider-/Region-Allowlists serverseitig fail-closed geprüft werden.
2. **Keine verifizierte Modell-/Endpoint-Identität:** `askCouncilModel` extrahiert nur Antworttext. Die Relay-Ausgabe speichert und prüft keine tatsächliche Provider-, Modell-, Endpoint- und Request-ID. Damit ist die tatsächliche Route eines Virtual-Model-Aufrufs nicht belastbar nachgewiesen.
3. **Kein hartes monetäres Kostenlimit:** Das Relay nutzt einen manuellen booleschen Freigabeschalter, maximal zwei Debatten pro UTC-Tag und begrenzte Ausgabetokens. Es gibt keine verifizierte Preisobergrenze und keine atomare monetäre Budgetreservierung pro Lauf. Das Vercel-Projektbudget von 5 USD ist ein Soft Cap. Diese Kontrollen erfüllen den 0-EUR-Standard des MAINPROMPT 2.0.7 nicht.
4. **Council-Ablauf noch unvollständig:** GPT, Claude, Gemini und Grok werden nacheinander aufgerufen; danach erstellt GPT die Synthese. Die Erstanalysen sehen keine fremden Antworten, aber es findet keine eigenständige Peer-Review-Runde durch die anderen Modelle statt. Die unabhängigen Erstanalysen sollten parallelisiert und anschließend kritisch gegeneinander geprüft werden.
5. **Integrationsrisiko:** PR #38 bleibt Draft. Der Branch ist gegenüber `main` 128 Commits voraus und 61 zurück; Merge-Base `71fb0e07740150be13d40b1aef10ba269fe264b8`. GitHub meldete zuletzt `mergeable=false`. Kein Merge oder automatisches Update dieses Branches.

**Nachweisgrenze:** Relay-CI Run [46030025648](https://github.com/mouzzlii/Kreislauf/actions/runs/46030025648) auf PR-Head `1e7abcc03021d6276a8ed947a1877646a367e808` hat einen Job mit zehn erfolgreichen Schritten (Syntax, Task-Envelope, Ledger, Source-Context, Gateway-Verträge, Parser und Projekt-/Tagesbudgetchecks). Das sind synthetische Vertragstests. Es gab keinen Gateway-Request, keine Modell-Inferenz und keine Kosten. Der Vercel-Preview-Check blieb wegen `build-rate-limit` fehlgeschlagen.

## Nächste sichere Schritte

1. Gateway-Adapter und unabhängige Erstanalysen für GPT, Claude, Gemini und Grok auf einem frischen Branch von aktuellem `main` synthetisch implementieren und testen; Llama aus privaten Projektkontexten ausschließen.
2. Vor jeder Live-Nutzung eine echte, nicht überschreitbare Kostenkontrolle festlegen. Das bestehende Vercel-Soft-Cap reicht dafür allein nicht.
3. Datenklassen und zulässige Provider-Regionen pro Modell festlegen; bis dahin keine privaten Projektquellen an nicht nachweislich geeignete Routen senden.
4. Gateway-Credential für GitHub Actions nur durch den Kontoinhaber in GitHub Secrets hinterlegen; niemals aus Vercel auslesen oder im Chat übertragen.
5. Erst nach ausdrücklicher Budgetfreigabe einen minimalen synthetischen Live-Test durchführen und jede Modellantwort getrennt dokumentieren.

## Verbindliche Statusbegriffe

- **Geplant:** vorgesehen, aber noch nicht umgesetzt.
- **Konfiguriert:** Einstellungen/Alias vorhanden; Inferenz nicht nachgewiesen.
- **Aufrufweg implementiert:** Route/Adapter vorhanden; Live-Aufruf nicht nachgewiesen.
- **Live-Aufruf getestet:** tatsächlicher Aufruf und Antwort mit Zeit, Modellkennung und redigiertem Nachweis dokumentiert.
- **Unabhängig geprüft:** tatsächlicher Review durch eine andere Instanz oder einen reproduzierbaren unabhängigen Prüfweg.
- **Council-Durchlauf nachgewiesen:** mindestens zwei unabhängige Modellantworten sowie tatsächliche Gegenprüfung und Synthese dokumentiert.
- **Blockiert / nicht verfügbar:** konkrete fehlende Berechtigung, Schnittstelle, Kostenfreigabe, Regionseignung oder anderer Blocker benannt.

