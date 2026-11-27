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

