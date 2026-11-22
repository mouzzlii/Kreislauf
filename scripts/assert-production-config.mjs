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
const databaseUrl = (process.env.DATABASE_URL ?? "").trim();
try {
  const url = new URL(databaseUrl);
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname) {
    missing.push("DATABASE_URL (gültige PostgreSQL-Verbindung)");
  }
} catch {
  missing.push("DATABASE_URL (gültige PostgreSQL-Verbindung)");
}
if (process.env.VITE_AUTH_ENABLED !== "true") missing.push("VITE_AUTH_ENABLED=true (echte Benutzerkonten)");
if ((process.env.BETTER_AUTH_SECRET ?? "").trim().length < 32) missing.push("BETTER_AUTH_SECRET (mindestens 32 Zeichen)");
try {
  const url = new URL(process.env.BETTER_AUTH_URL ?? "");
  if (url.protocol !== "https:" || !url.hostname) missing.push("BETTER_AUTH_URL (muss eine gültige HTTPS-Adresse sein)");
} catch {
  missing.push("BETTER_AUTH_URL (gültige HTTPS-Adresse)");
}

// The baked-in OAuth client is restricted to sandbox preview callback hosts.
// Production must use its own broker client, otherwise login callbacks will fail
// (or accidentally couple the production app to preview credentials).
const brokerIssuer = (process.env.GROK_AUTH_ISSUER ?? "").trim();
try {
  const url = new URL(brokerIssuer);
  if (url.protocol !== "https:" || !url.hostname) {
    missing.push("GROK_AUTH_ISSUER (eigener HTTPS-Auth-Broker)");
  }
} catch {
  missing.push("GROK_AUTH_ISSUER (eigener HTTPS-Auth-Broker)");
}
if (!(process.env.GROK_AUTH_CLIENT_ID ?? "").trim()) {
  missing.push("GROK_AUTH_CLIENT_ID (eigene OAuth-Client-ID)");
}
if ((process.env.GROK_AUTH_CLIENT_SECRET ?? "").trim().length < 32) {
  missing.push("GROK_AUTH_CLIENT_SECRET (eigener OAuth-Client-Schlüssel)");
}

if (!(process.env.BLOB_READ_WRITE_TOKEN ?? "").trim()) {
  missing.push("BLOB_READ_WRITE_TOKEN (sicherer Medien-Storage)");
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

console.log("[release-guard] Mindestkonfiguration für PostgreSQL, eigene OAuth-Anmeldung und Medien-Storage vorhanden.");
