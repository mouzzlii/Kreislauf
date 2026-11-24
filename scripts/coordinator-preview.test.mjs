import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const route = await readFile(new URL("../src/routes/koordinator.tsx", import.meta.url), "utf8");
const shell = await readFile(new URL("../src/components/shell.tsx", import.meta.url), "utf8");

test("3 Punkte 1 Ort is a dedicated regional coordinator area", () => {
  assert.match(route, /createFileRoute\("\/koordinator"\)/);
  assert.match(route, /3 Punkte 1 Ort/);
  assert.match(route, /Gesuche/);
  assert.match(route, /Angebote/);
  assert.match(route, /Koordinator hilft dabei, Gesuche und Angebote zusammenzuführen/);
  assert.match(route, /Aktuelle regionale Einträge/);
  assert.match(route, /Zuständigkeiten, reale Kontaktwege/);
});

test("coordinator preview counts active requests and offers and does not fake contact", () => {
  assert.match(route, /listing\.status !== "completed"/);
  assert.match(route, /listing\.offerType === "search"/);
  assert.match(route, /listing\.offerType !== "search"/);
  assert.match(route, /Koordinator kontaktieren/);
  assert.match(route, /disabled title=/);
  assert.match(route, /versendet keine Koordinator-Nachrichten/);
});

test("coordinator is reachable in desktop and mobile navigation", () => {
  assert.match(shell, /to: "\/koordinator", label: "Koordinator"/);
  assert.match(shell, /grid-cols-7/);
  assert.match(shell, /grid-cols-6/);
});
