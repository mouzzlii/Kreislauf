import assert from "node:assert/strict";
import { test } from "node:test";
import { filterListingConversations } from "./conversation-filter.ts";

const conversations = [
  { id: "1", otherName: "Änne", listingTitle: "Bohrmaschine", lastMessage: "Kann ich sie morgen holen?", unreadCount: 2 },
  { id: "2", otherName: "Boris", listingTitle: "Gartenhilfe", lastMessage: "Danke für deine Nachricht", unreadCount: 0 },
  { id: "3", otherName: "Clara", listingTitle: "Fahrrad", lastMessage: "Preis ist verhandelbar", unreadCount: 1 },
];

test("conversation inbox search matches participants, listings and message previews", () => {
  assert.deepEqual(filterListingConversations(conversations, "bohrmaschine", "all").map((item) => item.id), ["1"]);
  assert.deepEqual(filterListingConversations(conversations, "BORIS", "all").map((item) => item.id), ["2"]);
  assert.deepEqual(filterListingConversations(conversations, "verhandelbar", "all").map((item) => item.id), ["3"]);
});

test("unread filter excludes read conversations and combines with search", () => {
  assert.deepEqual(filterListingConversations(conversations, "", "unread").map((item) => item.id), ["1", "3"]);
  assert.deepEqual(filterListingConversations(conversations, "gartenhilfe", "unread"), []);
  assert.deepEqual(filterListingConversations(conversations, "fahrrad", "unread").map((item) => item.id), ["3"]);
});

test("empty and whitespace-only search preserve original inbox order", () => {
  assert.deepEqual(filterListingConversations(conversations, "   ", "all"), conversations);
});
