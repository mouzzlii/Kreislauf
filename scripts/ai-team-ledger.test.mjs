import assert from "node:assert/strict";
import { test } from "node:test";
import {
  hasTrustedRelayMarker,
  inspectDailyBudgetPage,
  isTrustedRelayComment,
} from "./ai-team-ledger.mjs";

const botComment = (body, created_at = "2026-11-25T10:00:00Z") => ({
  body,
  created_at,
  user: { login: "github-actions[bot]", type: "Bot" },
});

test("only the GitHub Actions bot is trusted as relay ledger author", () => {
  assert.equal(isTrustedRelayComment(botComment("ledger")), true);
  assert.equal(isTrustedRelayComment({
    body: "ledger",
    user: { login: "attacker", type: "User" },
  }), false);
  assert.equal(isTrustedRelayComment({
    body: "ledger",
    user: { login: "another[bot]", type: "Bot" },
  }), false);
  assert.equal(isTrustedRelayComment({
    body: "ledger",
    user: { login: "github-actions[bot]", type: "User" },
  }), false);
});

test("untrusted comments cannot forge a processed-trigger marker", () => {
  const marker = "<!-- ai-team-relay:123 -->";
  assert.equal(hasTrustedRelayMarker([
    { body: marker, user: { login: "attacker", type: "User" } },
  ], marker), false);
  assert.equal(hasTrustedRelayMarker([botComment(marker)], marker), true);
  assert.equal(hasTrustedRelayMarker([], marker), false);
});

test("only bot-authored reservations count toward the UTC daily budget", () => {
  const prefix = "<!-- ai-team-daily-budget:2026-11-25:";
  const comments = [
    botComment(`${prefix}100 -->`),
    { ...botComment(`${prefix}200 -->`), user: { login: "attacker", type: "User" } },
    botComment(`${prefix}300 -->`),
    botComment("ordinary bot comment"),
  ];
  assert.deepEqual(inspectDailyBudgetPage(comments, {
    reservationPrefix: prefix,
    triggerCommentId: 100,
    dayStart: Date.parse("2026-11-25T00:00:00Z"),
  }), {
    count: 2,
    alreadyReserved: true,
    reachedPreviousDay: false,
  });
});

test("ledger scan stops at the first previous-day comment", () => {
  const prefix = "<!-- ai-team-daily-budget:2026-11-25:";
  const comments = [
    botComment(`${prefix}100 -->`),
    botComment("previous day", "2026-11-24T23:59:59Z"),
    botComment(`${prefix}200 -->`),
  ];
  assert.deepEqual(inspectDailyBudgetPage(comments, {
    reservationPrefix: prefix,
    triggerCommentId: 200,
    dayStart: Date.parse("2026-11-25T00:00:00Z"),
  }), {
    count: 1,
    alreadyReserved: false,
    reachedPreviousDay: true,
  });
});
