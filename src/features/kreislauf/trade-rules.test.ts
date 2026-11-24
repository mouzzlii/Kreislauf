import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canRequestTrade,
  normalizeExchangeListing,
  normalizeTradeOffer,
} from "./trade-rules.ts";

test("direct barter requires explicit counter-performance and has no Karma transfer", () => {
  assert.deepEqual(
    normalizeExchangeListing("barter", "  Ich biete   Brennholz  ", 0),
    { exchangeTerms: "Ich biete Brennholz", karmaAdjustment: 0 },
  );
  assert.throws(() => normalizeExchangeListing("barter", "Brennholz", 1), /direkter Tausch/i);
});

test("combined offer allows an optional, bounded Karma adjustment", () => {
  assert.deepEqual(
    normalizeExchangeListing("combined", "Reparatur eines Fahrrads", 25),
    { exchangeTerms: "Reparatur eines Fahrrads", karmaAdjustment: 25 },
  );
  assert.deepEqual(
    normalizeExchangeListing("combined", "Reparatur eines Fahrrads", 0),
    { exchangeTerms: "Reparatur eines Fahrrads", karmaAdjustment: 0 },
  );
  assert.throws(() => normalizeExchangeListing("combined", "Reparatur eines Fahrrads", 501), /0 und 500/);
});

test("ordinary points, search and gift listings do not inherit barter terms", () => {
  assert.deepEqual(normalizeExchangeListing("sell", "ignored", 200), {
    exchangeTerms: null,
    karmaAdjustment: 0,
  });
  assert.deepEqual(normalizeExchangeListing("gift", null, null), {
    exchangeTerms: null,
    karmaAdjustment: 0,
  });
});

test("trade proposals are normalized and bounded", () => {
  assert.equal(normalizeTradeOffer("  Ich biete   zwei Stunden Gartenhilfe. "), "Ich biete zwei Stunden Gartenhilfe.");
  assert.throws(() => normalizeTradeOffer("kurz"), /8 bis 400 Zeichen/);
});

test("trade request requires availability, a different member, same region and sufficient Karma", () => {
  const base = {
    offerType: "combined",
    status: "active",
    ownerId: "owner",
    requesterId: "requester",
    requesterRegionId: "yspertal-b36",
    listingRegionId: "yspertal-b36",
    karmaBalance: 25,
    karmaAdjustment: 25,
  };
  assert.equal(canRequestTrade(base), true);
  assert.equal(canRequestTrade({ ...base, requesterId: "owner" }), false);
  assert.equal(canRequestTrade({ ...base, requesterRegionId: "donautal-sued" }), false);
  assert.equal(canRequestTrade({ ...base, karmaBalance: 24 }), false);
  assert.equal(canRequestTrade({ ...base, status: "booked" }), false);
  assert.equal(canRequestTrade({ ...base, offerType: "sell" }), false);
});
