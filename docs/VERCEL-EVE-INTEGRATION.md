# Vercel EVE und KI-Council – Integrationsstand

Stand: 26.11.2026. Diese Bestandsaufnahme trennt den vorhandenen EVE-Arbeitsplatz, den zentralen KREISLAUF-Relay und die noch offenen Verbindungen.

## 1. Vorhandene Vercel-Anwendung

- Projekt: `collective-intelligence-council` (`prj_cNDChcd0UaknDqECxOemW6lu2A3u`) im Team `Kreislauf`.
- Framework: Next.js; Node-Version: 24.x.
- Das letzte Production-Deployment ist `READY`. Die Projektmetadaten melden zugleich `live=false`; Vercel Authentication / SSO schützt alle Deployments. Das ist keine öffentliche Freigabe.
- Das Projekt ist nicht mit einem GitHub-Repository verbunden. Die Deployment-Metadaten enthalten keine Git-Quelle. Die drei anderen mit GitHub verknüpften Projekte des Teams sind davon getrennt.
- Ein früherer Deployment-Versuch scheiterte mit `Cannot find module '/node_modules/eve/bin/eve.js'`; ein späteres Production-Deployment wurde erfolgreich erstellt. Es wurde kein neuer Build ausgelöst.

## 2. Tatsächliche Modellkonfiguration

Die Root-Agent-Datei und alle acht Subagent-Dateien im Deployment verwenden aktuell denselben Modellbezeichner:

`openai/gpt-6-luna-fast`

Damit sind die Rollen im Code zwar getrennt, aber derzeit **nicht provider-unabhängig**. Die fünf vorhandenen Vercel-AI-Gateway-Virtual-Models sind dagegen aktiv:

| Virtual Model ID | Tatsächliches Modell |
|---|---|
| `vmc/council-gpt` | OpenAI GPT-5 |
| `vmc/council-claude` | Anthropic Claude Sonnet 4.6 |
| `vmc/council-gemini` | Google Gemini 3 Flash |
| `vmc/council-grok` | xAI Grok 4.7 |
| `vmc/council-llama` | Meta Llama 4 Maverick |

Es sind keine Gateway-Routing-Regeln eingerichtet. Die Virtual Models sind trotzdem direkt über ihre IDs verwendbar. Die Beschreibungen der Modelle verlangen Anbieter mit Zero Data Retention und ohne Prompt-Training.

## 3. Empfohlene Rollenverteilung

Die folgende Zuordnung ist ein Vorschlag für die Quellcode-Konfiguration, **noch nicht umgesetzt oder aktiviert**:

| Rolle | Modell-ID |
|---|---|
| Projektzentrale | `vmc/council-gpt` |
| Planung | `vmc/council-gpt` |
| Recherche | `vmc/council-gemini` |
| Architektur | `vmc/council-claude` |
| Entwicklung | `vmc/council-gpt` |
| Tests | `vmc/council-gemini` |
| Unabhängiges Review | `vmc/council-claude` |
| Security-Zweitprüfung | `vmc/council-llama` |
| Release-Prüfung | `vmc/council-grok` |

Vercel Eve akzeptiert Gateway-Modell-IDs als String in `defineAgent({ model: ... })`. Für Virtual Models ist die Form `vmc/<slug>`. Die hart codierte Kontextfenstergröße von 1.050.000 Tokens sollte bei statischen Gateway-Modellen entfallen, damit Eve die tatsächliche Größe aus dem Gateway-Modellkatalog ermittelt.

Referenzen:
- Eve Agent-Konfiguration: https://github.com/vercel/eve/blob/main/docs/agent-config.md
- Vercel Virtual Models: https://vercel.com/docs/ai-gateway/virtual-models

## 4. Nutzungs- und Kostenstatus

- Production-Agent-Runs der letzten 30 Tage: 0.
- Gemeldete Agent-Run-Kosten im Zeitraum: 0 USD.
- `AI_GATEWAY_API_KEY` ist als sensibles Environment für Preview und Development vorhanden. Der geheime Wert wurde nicht ausgelesen.
- Für Vercel-Deployments kann Eve den AI Gateway über Vercel OIDC authentifizieren; dafür muss kein Provider-Schlüssel in den Quellcode geschrieben werden.
- Das Projektbudget von 5 USD pro Monat ist kein garantierter harter Kostenstopp. Keine Provider-Anfrage wurde durch diese Bestandsaufnahme ausgelöst.

## 5. Quellcode- und GitHub-Blocker

- Das Deployment enthält einen Quellbaum mit 66 Dateien unter `src/`.
- Das verfügbare Deployment-Datei-Leseinterface kürzt größere Datei-Inhalte bereits in der Antwort ab. Ein vollständiger, bytegetreuer Export der Anwendung ist damit nicht möglich; unvollständige Dateien werden ausdrücklich nicht in GitHub übernommen.
- Vorhandene Vercel-Sandbox-Sitzungen und Snapshots sind gestoppt. Der Versuch, eine Datei aus einer gestoppten Sitzung zu lesen, wurde mit `410 sandbox_stopped` abgewiesen. Eine neue bzw. wiederaufgenommene Sandbox wäre kostenpflichtig und wurde nicht gestartet.
- Es wurde daher **kein unvollständiger Online-Modus importiert**, kein zweites Vercel-Projekt angelegt und keine bestehende Vercel-Konfiguration verändert.

## 6. Nächste sichere Schritte

1. Den vollständigen EVE-Projektordner aus einer vorhandenen lokalen Arbeitskopie oder einem autorisierten vollständigen Export sichern.
2. Den Quellcode im bestehenden Repository `mouzzlii/KI-Arbeitsplatz` in einem eigenen Ordner `Online-Modus/` versionieren; den bestehenden Offline-Modus nicht duplizieren.
3. Das bereits vorhandene Vercel-Projekt mit diesem Repository und dem Root-Verzeichnis `Online-Modus` verbinden. Kein zweites Vercel-Projekt mit gleichem Zweck erstellen.
4. Die Rollen auf die bestehenden `vmc/council-*` IDs umstellen und statische Konfigurationsprüfungen ergänzen.
5. Erst nach ausdrücklicher Kostenfreigabe einen kontrollierten Ende-zu-Ende-Test ausführen und dabei Gateway-Nutzung sowie Provider-Ausgaben überwachen.

Bis dahin bleiben EVE-Anwendung und Relay getrennte Komponenten. Der Relay-PR #38 ist weiterhin Draft; es gibt keinen Live-Council-Lauf und keine produktive Freigabe.
