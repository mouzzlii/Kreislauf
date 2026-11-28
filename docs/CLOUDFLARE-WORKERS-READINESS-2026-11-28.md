# Cloudflare Workers – technische Bereitschaftsprüfung

**Stand:** 28. November 2026  
**Prüf-Commit:** `8d90ae2b540c03a316d6b9ae39051c22605f736a` (`main`)  
**Status:** Architekturprüfung abgeschlossen; Implementierung und Deployment ausdrücklich noch nicht freigegeben.

## Ziel und Schutzrahmen

Cloudflare Workers wird als mögliche kostengünstige zusätzliche Hosting-Option für KREISLAUF geprüft. Die bestehende Vercel-Konfiguration bleibt während dieser Prüfung vollständig erhalten. Dieser Audit ändert weder Datenbank noch DNS, Secrets, Hosting-Einstellungen oder Produktionscode. Es werden keine Cloudflare-Ressourcen erstellt und kein Deployment ausgelöst.

Die Cloudflare-Dokumentation unterstützt TanStack Start über `@cloudflare/vite-plugin`. Die offizielle Migration von Vercel ersetzt den Nitro-Adapter durch den Cloudflare-Vite-Adapter. Für KREISLAUF ist eine sofortige vollständige Migration jedoch nicht vertretbar, weil projektspezifische Middleware, Datenbankverbindungen und Authentifizierung separat angepasst und getestet werden müssen.

## Festgestellter Ausgangszustand

- Repository: `mouzzlii/Kreislauf`; Standardbranch: `main`.
- Frontend/Framework: Vite + TanStack Start + React.
- `@tanstack/react-start` ist in `package.json` mit `^1.168.60` angegeben und liegt damit über dem Cloudflare-Mindeststand 1.132.0.
- Vercel wird aktuell über `nitro({ preset: "vercel" })` in `vite.config.ts` bedient.
- `vercel.json` ist vorhanden und setzt `npm install --omit=dev --no-audit --no-fund`.
- `package.json` heißt derzeit `app-builder-workspace`, das GitHub-Repository aber `Kreislauf`. Eine Wrangler-Konfiguration müsste daher den Worker-Namen `kreislauf` verwenden, nicht den Paketnamen.
- Das aktuelle Skript `build` führt nach `vite build` zusätzlich `npm run db:migrate` aus. Ein Cloudflare-Build darf diese Migration nicht unkontrolliert ausführen.
- Das Projekt enthält eine Nitro-registrierte PWA-Middleware unter `server/middleware/grok-pwa.ts`.

## Konkrete Kompatibilitätsrisiken

### 1. PWA- und Plattform-Middleware

`server/middleware/grok-pwa.ts` wird aktuell durch Nitro/h3 automatisch registriert. Sie liefert unter anderem das Manifest und die iOS-Installationsseite aus und injiziert PWA-/Open-Graph-Tags in gestreamte HTML-Antworten.

Bei Verwendung des Cloudflare-Vite-Adapters wird Nitro entfernt. Damit wird diese Middleware nicht automatisch weiter ausgeführt. Zusätzlich importiert sie `scripts/grok-pwa-shared.mjs`; dieses Modul enthält top-level Imports von `node:fs` und `node:path` sowie Dateisystemzugriffe. Der Worker-Port benötigt daher einen bewusst Worker-kompatiblen Adapter bzw. eine Trennung von Build-Time-Dateisystemlogik und Runtime-Logik. Die PWA-Routen und Streaming-Head-Injection dürfen nicht stillschweigend entfallen.

### 2. PostgreSQL und Datenbanklebenszyklus

`src/lib/db.ts` verwendet:
- `pg.Pool` als global gespeicherten Neon-Client, sobald `DATABASE_URL` vorhanden ist;
- andernfalls PGLite als eingebetteten In-Memory-PostgreSQL-Fallback.

Cloudflare Hyperdrive unterstützt PostgreSQL sowie Neon und empfiehlt `node-postgres` ab Version 8.16.3. Die aktuelle Projektanforderung `pg: ^8.16.3` erfüllt die Versionsuntergrenze. Die Cloudflare-Beispiele verwenden allerdings einen pro Anfrage erzeugten `pg.Client`; Hyperdrive verwaltet den eigentlichen Verbindungspool. Der bisherige globale Pool darf deshalb nicht ungeprüft übernommen werden.

PGLite kann als lokaler Entwicklungs-/Test-Fallback separat bestehen bleiben. Für produktive Worker ist der flüchtige In-Memory-Fallback keine belastbare dauerhafte Datenbank. Der produktive Cloudflare-Pfad muss explizit über ein Hyperdrive-Binding zur bestehenden PostgreSQL-Datenbank laufen. Dafür müssen keine Tabellen in D1 migriert werden.

### 3. Better Auth und serverseitige Umgebungsvariablen

`src/lib/auth/server.ts` erstellt ebenfalls einen eigenen globalen `pg.Pool`, nutzt beim Fallback PGLite und importiert `randomBytes` aus `node:crypto`. Die Datenbankanbindung von Better Auth muss mit derselben Hyperdrive-Verbindungsstrategie wie `src/lib/db.ts` funktionieren. Ein partieller Wechsel nur der App-SQL-Schicht wäre inkonsistent.

Mehrere Servermodule lesen Konfiguration direkt aus `process.env`. Cloudflare empfiehlt für Worker-Bindings und Secrets `import { env } from "cloudflare:workers"`. Die Umstellung muss zentrale Umgebungsvariablen, Auth-Secrets, Datenbank und bestehende Preview-/Gate-Unterscheidungen gemeinsam berücksichtigen. Keine Secret-Werte dürfen in Quellcode, Logs oder diesem Dokument landen.

### 4. Isolate und flüchtiger Zustand

`src/lib/app-data/client.server.ts` verwendet unter anderem Node-Crypto, eine modulglobale Map und zeitbasierte Fehler-Memos. Unterstützte Node-Kompatibilität löst nicht automatisch alle Unterschiede zwischen einem langlebigen Node-Prozess und kurzlebigen Worker-Isolates. Diese Caches dürfen nicht als dauerhafte oder globale Konsistenzschicht behandelt werden. Sicherheitsrelevante Tokenprüfung und Same-Site-Prüfungen müssen im Worker-Preview explizit getestet werden.

### 5. Build- und Lockfile-Verhalten

Die offizielle Cloudflare-Migrationsanleitung warnt davor, Lockfiles unnötig neu aufzulösen: dabei können unter anderem `seroval`-Versionen und das Format der TanStack-Serverfunktionen wechseln. Die bestehende Lockfile-Auflösung muss daher soweit möglich erhalten bleiben. Der Cloudflare-Build braucht ein eigenes Skript, das nicht nebenbei Datenbankmigrationen ausführt.

## Kosten- und Laufzeitbewertung

Laut den aktuellen Cloudflare-Workers-Limits (Stand 25. November 2026) umfasst der Free-Plan unter anderem:
- 100.000 Requests pro Tag,
- 10 ms CPU-Zeit pro HTTP-Request,
- 128 MB Speicher pro Isolate,
- bis zu 50 Subrequests pro Request.

Hyperdrive ist laut Cloudflare auf Free und Paid verfügbar. Diese Limits machen einen kostenfreien Test grundsätzlich möglich, garantieren aber nicht, dass SSR, Authentifizierung und komplexe Serverfunktionen innerhalb von 10 ms CPU pro Request bleiben. Vor einer produktiven Nutzung sind reale Preview-Messungen nötig. Es wird kein Paid-Plan aktiviert; keine kostenpflichtige Nutzung wird veranlasst.

## Empfohlener, risikoarmer Umsetzungsweg

1. **Vercel unangetastet lassen.** Kein Entfernen von `nitro`, `vercel.json` oder vorhandenen Vercel-Skripten in diesem Prüfzweig.
2. **Separaten Cloudflare-Buildpfad vorsehen.** Cloudflare-Konfiguration und Build-Skripte isolieren, so dass der vorhandene Standard-Build weiterhin Vercel erzeugt und keine Migration versehentlich ausgeführt wird.
3. **PWA- und Plattform-Runtime portieren.** Manifest, iOS-Installationsseite, OG-/PWA-Head-Tags und Streaming-Verhalten durch Worker-kompatible Tests absichern.
4. **Datenbank und Better Auth gemeinsam portieren.** Hyperdrive an die vorhandene PostgreSQL-Instanz anbinden; pro Request geeigneten Client-Lebenszyklus verwenden; PGLite nur für explizit lokale Tests erhalten.
5. **Bindings und Secrets typisieren.** Wrangler-Konfiguration ohne echte IDs/Secrets versionieren; lokale Werte nur in gitignorierten lokalen Dateien halten.
6. **CI ergänzen.** Separate Cloudflare-Prüfung für Typecheck, Tests, Worker-Build und lokalen Worker-Preview; vorhandene Vercel-CI bleibt bestehen.
7. **Funktional und wirtschaftlich bewerten.** PWA, Startseite, Auth, API/Server Functions, Datenbank, mobile Darstellung, CPU-/Speicherwerte und Fehlerszenarien prüfen. Erst nach bestandenen Prüfungen eine Entscheidung über einen produktiven Wechsel treffen.

## Verifizierungsstatus

| Prüfung | Ergebnis |
|---|---|
| Hauptbranch identifiziert | Erledigt: `8d90ae2...` |
| Vite + TanStack Start erkannt | Erledigt |
| Mindestversion TanStack Start | Erfüllt |
| Cloudflare-Hyperdrive-Kompatibilität von `pg` | Versionsanforderung erfüllt |
| PWA-/Middleware-Port | Offen |
| PostgreSQL-/Hyperdrive-Integration | Offen |
| Better-Auth-Integration | Offen |
| Cloudflare-Worker-Build | Nicht ausgeführt |
| Worker-Preview / Smoke-Tests | Nicht ausgeführt |
| Deployment / DNS / Secrets | Nicht ausgeführt |

## Quellen

- [Cloudflare: Migrate TanStack Start from Vercel to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/vercel-to-workers/tanstack-start/) (zuletzt aktualisiert 11. November 2026)
- [Cloudflare: TanStack Start Workers guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
- [Cloudflare: Connect to PostgreSQL / Hyperdrive](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/) (zuletzt aktualisiert 23. Oktober 2026)
- [Cloudflare: Workers limits](https://developers.cloudflare.com/workers/platform/limits/) (zuletzt aktualisiert 25. November 2026)

---
**Wichtig:** Dieses Dokument ist eine technische Bereitschaftsprüfung, keine Behauptung einer abgeschlossenen Migration. Es dokumentiert bewusst die offenen Laufzeit- und Testarbeiten.
