import test from "node:test";
import assert from "node:assert/strict";
import { assertOwnedListingImageUrl } from "./media.ts";

test("accepts a public Blob image under the current user's listing folder", () => {
  assert.doesNotThrow(() =>
    assertOwnedListingImageUrl(
      "https://store.public.blob.vercel-storage.com/listings/user-123/photo.jpg",
      "user-123",
    ),
  );
});

test("rejects another user's image", () => {
  assert.throws(
    () => assertOwnedListingImageUrl(
      "https://store.public.blob.vercel-storage.com/listings/other-user/photo.jpg",
      "user-123",
    ),
    /gehört nicht zu deinem Konto/,
  );
});

test("rejects non-Blob hosts and non-HTTPS URLs", () => {
  assert.throws(
    () => assertOwnedListingImageUrl("https://example.com/listings/user-123/photo.jpg", "user-123"),
    /Medienspeicher/,
  );
  assert.throws(
    () => assertOwnedListingImageUrl("http://store.public.blob.vercel-storage.com/listings/user-123/photo.jpg", "user-123"),
    /Medienspeicher/,
  );
});

test("encodes user IDs before checking the ownership folder", () => {
  assert.doesNotThrow(() =>
    assertOwnedListingImageUrl(
      "https://store.public.blob.vercel-storage.com/listings/user%2F123/photo.jpg",
      "user/123",
    ),
  );
});


test("rejects nested or lookalike Blob hosts, credentials, and custom ports", () => {
  for (const url of [
    "https://nested.store.public.blob.vercel-storage.com/listings/user-123/photo.jpg",
    "https://store.public.blob.vercel-storage.com.evil.example/listings/user-123/photo.jpg",
    "https://attacker@store.public.blob.vercel-storage.com/listings/user-123/photo.jpg",
    "https://store.public.blob.vercel-storage.com:8443/listings/user-123/photo.jpg",
  ]) {
    assert.throws(() => assertOwnedListingImageUrl(url, "user-123"), /Medienspeicher/);
  }
});

test("rejects normalized path traversal outside the owner's listing folder", () => {
  assert.throws(
    () => assertOwnedListingImageUrl(
      "https://store.public.blob.vercel-storage.com/listings/user-123/../other/photo.jpg",
      "user-123",
    ),
    /gehört nicht zu deinem Konto/,
  );
});
