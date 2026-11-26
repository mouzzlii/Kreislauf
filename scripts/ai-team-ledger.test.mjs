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


test("trusted reservation ledger deduplicates a stable task idempotency marker", () => {
  const prefix = "<!-- ai-team-daily-budget:2026-11-25:";
  const idempotencyMarker = "<!-- ai-team-idempotency:kia-stable-key -->";
  const comments = [
    botComment(prefix + "100 -->\n\n" + idempotencyMarker),
    botComment(prefix + "200 -->"),
    { ...botComment(idempotencyMarker), user: { login: "attacker", type: "User" } },
  ];
  const result = inspectDailyBudgetPage(comments, {
    reservationPrefix: prefix,
    triggerCommentId: 999,
    dayStart: Date.parse("2026-11-25T00:00:00Z"),
    idempotencyMarker,
  });
  assert.equal(result.count, 2);
  assert.equal(result.alreadyReserved, true);
});


test("task idempotency markers remain effective across previous UTC days", () => {
  const prefix = "<!-- ai-team-daily-budget:2026-11-26:";
  const idempotencyMarker = "<!-- ai-team-idempotency:kia-long-lived-key -->";
  const comments = [
    botComment(prefix + "300 -->", "2026-11-26T09:00:00Z"),
    botComment(idempotencyMarker, "2026-11-20T09:00:00Z"),
  ];
  const result = inspectDailyBudgetPage(comments, {
    reservationPrefix: prefix,
    triggerCommentId: 999,
    dayStart: Date.parse("2026-11-26T00:00:00Z"),
    idempotencyMarker,
  });
  assert.equal(result.count, 1);
  assert.equal(result.alreadyReserved, true);
  assert.equal(result.reachedPreviousDay, true);
});
