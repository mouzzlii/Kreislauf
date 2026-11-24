import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const shell = await readFile(new URL("../src/components/shell.tsx", import.meta.url), "utf8");

test("global message bell uses the signed-in user's protected conversation inbox", () => {
  assert.match(shell, /getMyListingConversations/);
  assert.match(shell, /if \(!user\?\.id\)/);
  assert.match(shell, /conversation\.unreadCount/);
  assert.match(shell, /to="\/nachrichten"/);
  assert.match(shell, /aria-label=\{unreadMessages > 0/);
  assert.match(shell, /unreadMessages > 99 \? "99\+" : unreadMessages/);
  assert.match(shell, /window\.setInterval\(\(\) => void refreshUnread\(\), 30_000\)/);
  assert.match(shell, /document\.visibilityState !== "visible"/);
  assert.match(shell, /document\.addEventListener\("visibilitychange", refreshUnread\)/);
});
