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



## PR #38 – Gateway-Branch, Sicherheitskorrekturen und CI-Nachweis (27.11.2026)

- Draft PR [#38](https://github.com/mouzzlii/Kreislauf/pull/38) enthält den gemeinsamen Vercel-AI-Gateway-Aufrufweg für die vier fest allowlisteten Aliase GPT, Claude, Gemini und Grok. Der aktive `main`-Relay oben bleibt davon unberührt und verwendet weiterhin die zuvor dokumentierten direkten Provider-Clients.
- **Aktueller PR-Head:** `1d7614c44ab445e6dabcb0087128bb1e82af7183`.
- **Erfolgreiche synthetische Relay-CI:** Run [46031375856](https://github.com/mouzzlii/Kreislauf/actions/runs/46031375856) auf exakt diesem Head. Alle Schritte erfolgreich: Syntax, Task-Envelope (17 Tests), Ledger (6), Source-Context (12), Gateway-Provider-Verträge (4), Parser/Integration (2) und Projekt-/Tagesbudgetprüfung. Insgesamt 41 Node-Tests bestanden, 0 fehlgeschlagen. Beide Workflows verwenden verifizierte unveränderliche Commit-SHAs für `actions/checkout` v7 und `actions/setup-node` v6.
- Vercel-Preview-Check auf dem PR-Head ist wegen `build-rate-limit` fehlgeschlagen; keine aktuelle Preview-Bereitstellung daraus ableiten.
- PR #38 bleibt Draft und ungemergt. Aktueller Vergleich mit `main`: 146 Commits voraus / 79 zurück, Merge-Base `71fb0e07740150be13d40b1aef10ba269fe264b8`; GitHub meldet `mergeable=false`. Keine Integration in `main` ohne kontrollierte Konsolidierung und erneute vollständige Prüfung.

## Sicherheitsreview des Gateway-PR #38 – korrigierter Stand (27.11.2026)

1. **Private Repository-Inhalte – auf PR-Branch technisch gesperrt, nicht in main:** Ein vorheriger Review hatte festgestellt, dass private Quelltexte als `internal` an alle vier Modelle gelangen könnten. Das wurde im aktuellen PR-Branch korrigiert:
   - Vor dem Lesen von README, Dateibaum oder Quelltext wird GitHub-Metadatenfeld `visibility` geprüft. Zulässig ist nur `visibility=public` zusammen mit `private=false`; private, interne oder unbekannte Sichtbarkeit wird fail-closed abgewiesen.
   - Auch der kanonische Primärkontext muss öffentlich sein. Ein sekundäres privates Repository kann die Primärprüfung nicht erfüllen und liefert keinen Quelltext.
   - Task-Envelopes akzeptieren nur `public`, `synthetic` oder `anonymized`; `internal`, `confidential`, `personal` und `secret` werden abgewiesen.
   - Diese Prüfung erfolgt vor Tagesbudgetreservierung und Provider-Aufrufen. Das private Repository `mouzzlii/KI-Arbeitsplatz` wird daher nicht gelesen; der strukturierte Task-Eingang ist für dessen aktuellen privaten Quellstand nicht operativ nutzbar.
   - Die Tests prüfen öffentliche/private/interne/unbekannte Metadaten, fehlende Sichtbarkeit, Datenklassifikation und die Reihenfolge der Metadatenprüfung vor README-/Tree-/Dateizugriff. Relay-CI Run 46031375856 ist auf dem exakten PR-Head grün.
2. **Modell-/Endpoint-Identität weiterhin offen:** `askCouncilModel` extrahiert nur Antworttext. Provider, tatsächliches Modell, Endpoint/Route und Request-ID werden nicht anhand von Antwortmetadaten gespeichert und geprüft. Ein späterer Live-Status wäre damit noch nicht belastbar nachweisbar.
3. **Harter monetärer Kostenstopp weiterhin offen:** Das Relay nutzt einen manuellen booleschen Freigabeschalter, maximal zwei Debatten pro UTC-Tag und begrenzte Ausgabetokens. Eine verifizierte Preisobergrenze und atomare monetäre Budgetreservierung fehlen. Das Vercel-Projektbudget von 5 USD ist ein Soft Cap und erfüllt den 0-EUR-Standard des MAINPROMPT 2.0.7 nicht.
4. **Council-Peer-Review weiterhin offen:** GPT, Claude, Gemini und Grok erstellen getrennte Erstanalysen; danach erstellt GPT die Synthese. Eine echte unabhängige Peer-Review-Runde, in der die anderen Modelle die Erstanalysen kritisch gegeneinander prüfen, ist noch nicht implementiert.
5. **Harte Aktivierungssperre:** `.github/workflows/ai-team-communication.yml` enthält ein explizites `false &&`-Gate. Auch vorhandene Secrets oder `AI_TEAM_BUDGET_CONFIRMED=true` können keinen Provider-Aufruf auslösen, solange dieses Gate nicht nach Kostenkontrolle und ausdrücklicher Freigabe bewusst entfernt wird.
6. **Integrationsrisiko:** PR #38 bleibt Draft. Der Branch liegt 146 Commits vor und 79 hinter `main`; GitHub meldet `mergeable=false`. Kein Merge oder automatisches Update dieses Branches.

**Nachweisgrenze:** Run 46031375856 belegt ausschließlich synthetische Tests des Relay-Codes auf dem genannten PR-Head. Es gab keinen Gateway-Request, keine Modell-Inferenz, keine Providerantwort, kein Peer-Review und keine Kosten. Der Vercel-Preview-Check bleibt wegen `build-rate-limit` fehlgeschlagen. Alle vier Virtual Models sind konfiguriert; Konfiguration ist kein Live-Council.

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

