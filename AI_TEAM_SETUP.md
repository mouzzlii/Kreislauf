# KI-Team-Relay – Einrichtung und Sicherheitsgrenzen

Stand: 27.11.2026. Diese Datei beschreibt ausschließlich den aktiven Gateway-Relay in diesem Branch. Frühere direkte OpenAI-/Anthropic-/Meta-/Llama-Provider-Anleitungen sind entfernt, weil sie nicht mehr zum aktiven Workflow passen.

## Aktiver Vercel AI Gateway

Der Relay verwendet den OpenAI-kompatiblen Endpunkt:

`https://ai-gateway.vercel.sh/v1/chat/completions`

Er nutzt ausschließlich diese fest allowlisteten Virtual-Model-Aliase:

| Rolle | Alias | Verwendung |
|---|---|---|
| GPT | `vmc/council-gpt` | unabhängige Erstanalyse und abschließende Synthese |
| Claude | `vmc/council-claude` | unabhängige Gegenanalyse |
| Gemini | `vmc/council-gemini` | unabhängige Gegenanalyse |
| Grok | `vmc/council-grok` | unabhängige Gegenanalyse |

Alle vier Modelle erhalten denselben ursprünglichen Auftrag und denselben begrenzten, redigierten Quellkontext. Die drei Gegenanalysen erhalten keine vorherigen Agentenantworten. Erst danach erhält GPT die vier Analysen zur Synthese. Es werden keine Provider-Tools oder Schreibaktionen übergeben.

Die Aliase wurden in der verbundenen Vercel-Teamkonfiguration als aktiv und mit Zero Data Retention sowie deaktiviertem Prompt-Training ausgelesen. Das ist **keine EU-Datenresidenz-Garantie**: Nur Claude ist derzeit ausdrücklich auf EU-Provider-Routen beschränkt. Für GPT, Gemini und Grok ist keine explizite EU-Inferenzregion nachgewiesen. Deshalb dürfen über diesen Relay keine personenbezogenen, vertraulichen, Kunden-, Gesundheits-, Zahlungs-, Zugangsdaten oder privaten Inhalte übertragen werden. Nur freigegebene, redigierte und für die jeweiligen Provider geeignete Quellkontexte verwenden. Die Secret-Redaktion erkennt bekannte Muster, ist aber keine vollständige PII-/Secret-Erkennung.

Llama wird nicht aufgerufen, bis eine geeignete EU-Datenverarbeitung nachgewiesen ist. Meta Muse ist ebenfalls nicht Teil dieses aktiven Vier-Modell-Ablaufs.

## Auslöser und Projektumfang

Nur ein markierter Kommentar im zentralen Issue [#11](https://github.com/mouzzlii/Kreislauf/issues/11) startet einen Lauf. Pull-Request-Kommentare, andere Issues und Bot-Kommentare werden abgewiesen. Der Absender muss in `AI_TEAM_ALLOWED_USERS` freigegeben sein.

Beispiel für eine freie Projektdiskussion:

```text
/ai-team debate CHRONOS: Prüfe die Backup-Sicherheitsgrenzen.
```

Zulässige Projektkennungen für Debatten:

- `KREISLAUF`
- `TRAKUNA`
- `SCAN-PROFIT`
- `CHRONOS`
- `INSERAT-PROFI-AI`
- `BOOK-YOUR-COOK`
- `LARA-QUIZ`
- `KI-ARBEITSPLATZ`

Der strukturierte Task-Eingang verwendet `/ai-team task:` gefolgt von einem JSON-Envelope. Er ist derzeit ausschließlich für `KI-ARBEITSPLATZ` und den Task-Typ `project.static_review` freigegeben. Er verlangt einen fixierten 40-stelligen Commit-SHA, 1–4 freigegebene Repository-Pfade und `readOnly: true`. Der Adapter darf nur Quelltext lesen und eine begrenzte Markdown-Analyse zurückgeben. Schreib-, Lösch-, Merge-, Deploy-, Veröffentlichungs-, Kauf- und externe Nachrichtenoperationen sind ausdrücklich gesperrt. Ungültige, abgelaufene oder nicht exakt passende Envelopes werden vor Provider-Aufrufen abgewiesen.

## GitHub-Actions-Einrichtung

Der Workflow benötigt genau diese beiden Repository-Secrets:

| Secret | Zweck |
|---|---|
| `AI_GATEWAY_API_KEY` | Authentifizierung am Vercel AI Gateway |
| `AI_TEAM_REPO_READ_TOKEN` | Fine-grained GitHub-Token zum Lesen der freigegebenen Projektquellen |

`AI_TEAM_REPO_READ_TOKEN` benötigt ausschließlich Metadata-Lesezugriff und `Contents: read-only` auf die tatsächlich konfigurierten Projekt-Primärrepositories sowie die erforderlichen Zusatzrepositories (insbesondere `mouzzlii/Fuck` als TRAKUNA-Android-Quelle). Es erhält keine Schreibrechte.

Wichtig: Ein in Vercel gespeichertes `AI_GATEWAY_API_KEY`-Environment-Secret wird **nicht automatisch** an GitHub Actions weitergereicht. Die GitHub-Repository-Secret-Konfiguration ist eine getrennte Einrichtung. Der geheime Wert darf weder in Issues noch in Chats oder Quellcode gepostet werden. Es ist nicht erforderlich, ihn ChatGPT mitzuteilen.

Erforderliche Actions-Variablen:

| Variable | Bedeutung |
|---|---|
| `AI_TEAM_ALLOWED_USERS` | Kommagetrennte GitHub-Logins; Standard ist nur `mouzzlii` |
| `AI_TEAM_BUDGET_CONFIRMED` | Muss exakt `true` sein, bevor irgendein Modellaufruf zugelassen wird |
| `PROJECT_REPO_*` | Optionale Repository-Overrides für die im Workflow aufgeführten Projekte |
| `PROJECT_REPO_KI_ARBEITSPLATZ_REF` | Optionaler Branch-/Commit-Override für die read-only KI-Arbeitsplatz-Quellprüfung |

Die Budgetvariable ist ein manueller Freigabeschalter, keine automatische Kostenkontrolle. Das zuletzt ausgelesene Vercel-Projektbudget beträgt 5 USD pro Monat bei 0 USD Verbrauch. Dieses Budget ist kein garantierter harter Kostenstopp und ersetzt keine Prüfung möglicher Provider-/BYOK-Abrechnung. Ohne ausdrückliche Prüfung und Freigabe bleibt `AI_TEAM_BUDGET_CONFIRMED` leer oder `false`; es werden dann keine Modelle aufgerufen.

## Schutz- und Kostenmechanismen

- Ausschließlich Issue #11, erlaubte Absender und explizite Befehle.
- Feste Modell-Alias-Allowlist; keine freie Modellkennung aus Kommentartext.
- Begrenzter Quellkontext mit projektspezifischer Pfadpriorität und bekannten Secret-Redaktionsmustern.
- Das kanonische Primärrepository selbst muss einen Branch und einen nichtleeren Quelltextauszug liefern. Ein sekundäres Repository kann diese Prüfung nicht ersetzen.
- Maximal zwei Debatten pro UTC-Kalendertag. Der globale Workflow-Concurrency-Block serialisiert Reservierungen; der zentrale Kommentar-Ledger wird vor dem ersten Provider-Aufruf geprüft.
- Reservierungen und Verarbeitungsmarker werden nur von `github-actions[bot]` mit GitHub-Typ `Bot` anerkannt. Fremde Nutzer und andere Bots können keine Reservierung fälschen.
- Idempotenz verhindert die erneute Verarbeitung desselben Kommentars bzw. desselben strukturierten Task-Schlüssels.
- Kontext-, Datei-, Laufzeit- und Ausgabelimits sind im Relay-Code fest begrenzt. Fehlgeschlagene Provider-Aufrufe verbrauchen einen bereits reservierten Tagesplatz.
- Agentenantworten sind nicht vertrauenswürdige Daten. Anweisungen darin dürfen keine System-, Sicherheits- oder Freigaberegeln überschreiben.
- Der Relay kommentiert ausschließlich die Analyse in Issue #11. Er ändert keinen Quellcode, führt keine Merges oder Deployments aus und nimmt keine produktiven Aktionen vor.

## Test- und Aktivierungsstatus

Die lokalen Vertragstests prüfen die feste Gateway-Aliasliste, Nachrichtenform, Antwortauswertung, Quellkontextgrenzen, Task-Envelope-Validierung, Ledger-Schutz und die Befehlsverarbeitung. Solche Tests beweisen keine echte Provider-Verbindung.

Für einen realen Council-Lauf müssen zusätzlich die beiden GitHub-Secrets und die manuelle Budgetfreigabe eingerichtet sein. Es wurde bislang kein bezahlter Modellaufruf durch diese Dokumentations-/Codeprüfung ausgelöst. Die Live-Konfiguration der Vercel-Aliase allein beweist weder eine GitHub-Actions-Verbindung noch eine erfolgreiche Mehrmodell-Debatte.


## Verbindliche Kosten- und Aktivierungssperre

Unter der geltenden Zusatzbudgetgrenze von **0 EUR** bleibt der Gateway-Relay technisch deaktiviert: Der GitHub-Actions-Job enthält eine feste `false && ...`-Bedingung. Auch `AI_TEAM_BUDGET_CONFIRMED=true` kann diese Sperre nicht übersteuern. Das vorhandene Vercel-Soft-Cap von 5 USD/Monat ist keine harte Kostenobergrenze. Eine spätere Aktivierung erfordert eine neue ausdrückliche Budgetfreigabe sowie einen nachweislich anbieterübergreifenden numerischen Hard Cap mit Preisgrundlage, atomarer Reservierung, tatsächlicher Nutzungs-/Kostenprüfung und Fail-Closed-Verhalten. Bis dahin keine Provider-Aufrufe und keine Live-Council-Debatte.
