#!/usr/bin/env node
/**
 * Prevent an accidental production release of the shared in-memory demo.
 * Preview deployments intentionally remain available without production secrets.
 */
const isProduction = process.env.VERCEL_ENV === "production";

if (!isProduction) {
  console.log("[release-guard] Preview/local build — production checks skipped.");
  process.exit(0);
}

const missing = [];
if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL (persistente PostgreSQL-Verbindung)");
if (process.env.VITE_AUTH_ENABLED !== "true") missing.push("VITE_AUTH_ENABLED=true (echte Benutzerkonten)");
if ((process.env.BETTER_AUTH_SECRET ?? "").length < 32) missing.push("BETTER_AUTH_SECRET (mindestens 32 Zeichen)");
try {
  const url = new URL(process.env.BETTER_AUTH_URL ?? "");
  if (url.protocol !== "https:") missing.push("BETTER_AUTH_URL (muss HTTPS verwenden)");
} catch {
  missing.push("BETTER_AUTH_URL (gültige HTTPS-Adresse)");
}
if (process.env.ID_AUSTRIA_MOCK_MODE === "true") {
  missing.push("ID_AUSTRIA_MOCK_MODE darf in Produktion nicht aktiviert sein");
}

if (missing.length) {
  console.error("[release-guard] Produktionsbereitstellung blockiert. Es fehlen sichere Voraussetzungen:");
  for (const item of missing) console.error(" - " + item);
  console.error("[release-guard] Die Demo bleibt als Preview verfügbar. Keine Zugangsdaten in den Quellcode schreiben.");
  process.exit(1);
}

console.log("[release-guard] Mindestkonfiguration für persistente Datenbank und echte Anmeldung vorhanden.");
