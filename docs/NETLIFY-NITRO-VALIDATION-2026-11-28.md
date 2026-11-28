# Netlify Nitro – isolierte Hosting-Validierung

**Stand:** 28. November 2026  
**Ausgangscommit:** `8d90ae2b540c03a316d6b9ae39051c22605f736a` (`main`)  
**Arbeitsbranch:** `infra/netlify-nitro-validation-2026-11-28`  
**Status:** Branchgebundener Nitro-Netlify-Build und CI-Prüfungen erfolgreich (GitHub Actions Run #2). Kein Netlify-Deployment.

## Entscheidung

Für den ersten Netlify-Test wird der vorhandene Nitro-Netlify-Preset verwendet, nicht der zusätzliche Netlify-TanStack-Adapter. Das ist zunächst der kleinere Umbau, weil KREISLAUF bereits eine eigene Nitro-Server-Middleware unter `server/middleware/grok-pwa.ts` besitzt. Sie stellt das Manifest und die iOS-Installationsseite bereit und injiziert PWA-/Open-Graph-Tags in HTML-Antworten. `serverDir: "./server"` bleibt im Vite-Setup unverändert erhalten.

Der alternative offizielle Adapter `@netlify/vite-plugin-tanstack-start` ist für TanStack Start geeignet, ersetzt aber den Nitro-Buildpfad. Seine parallele Aktivierung neben Nitro wird nicht versucht. Sollte der Nitro-Preset für die aktuelle Netlify-Plattform nicht mehr akzeptiert werden, ist ein separater Adapter-Port mit expliziter Übernahme der PWA-Funktionen der nächste Weg.

## Was in diesem Zweig umgesetzt ist

- `npm run build:netlify` führt einen eigenen Netlify-Build aus.
- Der Build setzt `KREISLAUF_DEPLOY_TARGET=netlify` nur im Kindprozess. Ohne diese Variable bleibt der bestehende Vercel-Preset der Standard.
- Nach einem erfolgreichen Build wird derselbe `scripts/migrate.mjs`-Migrationsschritt ausgeführt wie beim normalen Produktions-Build. Ohne `DATABASE_URL` überspringt dieses Skript die Migration wie vorgesehen.
- `netlify.toml` setzt den Build-Befehl, das statische Verzeichnis `dist` und Node.js 24.
- `vercel.json` deaktiviert automatische Vercel-Deployments ausschließlich für diesen Netlify-Testbranch. Auf `main` und anderen Branches bleibt das Standardverhalten unverändert.
- Der bestehende `build`-Befehl für Vercel wird nicht geändert. Es werden keine Datenbankvariablen oder Zugangsdaten in Konfigurationsdateien gespeichert.

## Wichtige Versionsabweichung: Nitro-Ausgabeformat

Das Projekt verwendet derzeit exakt `nitro@3.0.260610-beta`. Im Quellcode dieser festgelegten Version schreibt der Netlify-Preset die Functions-Ausgabe nach:

- `.netlify/functions-internal/server/server.mjs`
- statische Dateien nach `dist`
- optionale Deployment-Konfiguration in das ältere Verzeichnis `.netlify/deploy/v1/`

Die aktuelle Nitro-Migrationsdokumentation beschreibt inzwischen das neue Frameworks-API-Ausgabeformat:

- `.netlify/v1/functions`
- `.netlify/v1/config.json`

Diese Differenz darf nicht übergangen werden. Die branchgebundene CI prüft daher die konkrete Ausgabe der im Projekt gepinnten Nitro-Version. Ein erfolgreicher lokaler/CI-Build beweist aber noch nicht, dass die aktuelle Netlify-Plattform das ältere Ausgabeformat bei einem echten Deploy akzeptiert. Dafür wäre anschließend ein Preview-Deployment in einem Netlify-Konto erforderlich; ein solches wurde nicht gestartet.

Ein vorsorgliches Nitro-Upgrade wird vermieden, bis der unveränderte Preset-Build gemessen wurde. Ein Upgrade kann selbst weitere Runtime- und Lockfile-Änderungen enthalten.

## Laufzeit und bestehende App-Funktionen

Netlify Functions verwenden eine Node.js-Laufzeit. Das passt besser zur vorhandenen Node-basierten PostgreSQL- und Better-Auth-Architektur als Cloudflare Workers, die eine andere Datenbank- und Isolate-Lifecycle-Strategie erfordern würden.

Folgendes bleibt dennoch vor einer produktiven Nutzung zu testen:

- PWA-Manifest, iOS-Installationsseite und Head-/OG-Injection
- SSR, Server Routes und Server Functions
- Better Auth, OAuth-Callback, Cookies und Gate-Identität
- PostgreSQL-Verbindung unter Last und bei kalten Starts
- Runtime-Secrets und Umgebungsvariablen in Netlify
- Upload-/Requestgrößen, Antwortstreaming und Function-Timeouts

Die bestehende PostgreSQL-Datenbank wird nicht migriert oder kopiert. Für einen späteren Test müssten die schon vorhandenen Runtime-Secrets sicher im Netlify-UI hinterlegt werden. Sie gehören nicht in Git.

## Kostenrahmen und Einsatzgrenzen

Der Netlify-Free-Plan wird derzeit mit 300 monatlichen Credits und einer harten Verbrauchsgrenze ohne automatische Nachbelastung ausgewiesen. Produktions-Deployments verbrauchen 15 Credits; Function-Compute, Requests und ausgehender Traffic werden zusätzlich nach Nutzung berechnet. Deploy-Previews und fehlgeschlagene Deploys sind laut aktuellem Modell nicht metered. Es gibt eine parallele Build-Ausführung im Free-Plan.

Das ist für Preview-Tests interessant, aber keine unbegrenzte Produktions-Deployment-Flatrate. Maximal 20 reine Produktions-Deployments wären rechnerisch möglich, wenn keinerlei andere Credits verbraucht würden. Der tatsächliche Verbrauch hängt zusätzlich von Function-Laufzeit, Aufrufen und Bandbreite ab. Es wird kein kostenpflichtiger Tarif aktiviert und kein Netlify-Konto oder Site automatisch angelegt.

## Schutzmaßnahmen und tatsächliches Vercel-Verhalten

- `main` bleibt unverändert.
- Keine Vercel-Projekteinstellungen, Domains oder Secrets wurden verändert. Die branchbezogene Ausnahme liegt ausschließlich in der versionierten `vercel.json` dieses Testbranches.
- Bei den ersten Branch-Commits vor Aktivierung dieser Ausnahme erzeugte die Git-Integration zwei Vercel-Preview-Deployments mit Status `READY` und einen abgebrochenen Preview-Deploy. Das ist zusätzlicher Deployment-Verbrauch und wird hier ausdrücklich festgehalten.
- Seit dem Commit mit `git.deploymentEnabled=false` für genau diesen Branch wurden keine weiteren Vercel-Deployment-Datensätze angelegt; auch für den aktuellen Branch-Head wurde kein Vercel-Deployment gefunden.
- Keine Cloudflare- oder Netlify-Ressource wird erstellt.
- Die Datenbankmigration wurde im CI-Build übersprungen, weil absichtlich keine `DATABASE_URL` verfügbar war. Es wurde keine externe Datenbank verändert.

## Verifizierungsstatus

| Prüfung | Status |
|---|---|
| Ausgangscommit festgehalten | Erledigt |
| Separater Netlify-Testbranch | Erledigt |
| Vercel-Standardpreset unverändert als Default | Umgesetzt |
| Eigener Buildbefehl ohne Vermischung mit Vercel | Umgesetzt |
| Bestehender Migrationsschritt nach Build erhalten | Umgesetzt |
| Netlify-Konfiguration | Umgesetzt |
| Build mit Nitro-Netlify-Preset | GitHub-Actions-Prüfung |
| Erwartetes Functions-Ausgabeverzeichnis | GitHub-Actions-Prüfung |
| PWA-Code im gebündelten Serverartefakt | GitHub-Actions-Prüfung |
| Echter Netlify-Preview-Deploy | Nicht ausgeführt |
| Runtime-Auth/Postgres auf Netlify | Nicht getestet |
| Produktivwechsel / DNS / Secrets | Nicht ausgeführt |

## Quellen

- [Netlify: TanStack Start deployment](https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/)
- [Nitro: Netlify provider](https://nitro.build/deploy/providers/netlify)
- [Nitro: migration guide and Netlify output directories](https://nitro.build/docs/migration)
- [Netlify: credit-based pricing](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)
- [Netlify: Functions configuration](https://docs.netlify.com/build/functions/configuration/)
- [Vercel: Git deployment configuration](https://vercel.com/docs/project-configuration/git-configuration)

---
Der Nitro-Netlify-Build ist in GitHub Actions erfolgreich. Die Ausgabe enthält jedoch noch das ältere Nitro-Verzeichnis `.netlify/functions-internal`; die aktuelle Nitro-Dokumentation beschreibt `.netlify/v1/functions`. Der CI-Erfolg beweist daher die Build-Erzeugung und das Vorhandensein der PWA-Middleware, aber nicht die Annahme durch den aktuellen Netlify Deploy-Workflow. Es handelt sich ausdrücklich weder um eine abgeschlossene Migration noch um einen getesteten produktiven Netlify-Deploy.
