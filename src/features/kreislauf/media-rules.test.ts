import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_IMAGE_DATA_URL_CHARS, MAX_LISTING_IMAGES, MAX_TOTAL_IMAGE_DATA_URL_CHARS, normalizeListingImages } from "./media-rules.ts";
const photo = (payload = "AAAA") => "data:image/jpeg;base64," + payload;
test("accepts up to four valid JPEG data URLs", () => { const images = [photo(), photo("BBBB"), photo("CCCC"), photo("DDDD")]; assert.deepEqual(normalizeListingImages(images), images); assert.equal(MAX_LISTING_IMAGES, 4); });
test("keeps legacy single-photo payloads readable", () => { assert.deepEqual(normalizeListingImages(undefined, photo()), [photo()]); assert.deepEqual(normalizeListingImages(undefined, null), []); });
test("rejects more than four photos and non-JPEG content", () => { assert.throws(() => normalizeListingImages(Array.from({ length: 5 }, () => photo())), /höchstens 4/); assert.throws(() => normalizeListingImages(["data:image/png;base64,AAAA"]), /JPEG/); assert.throws(() => normalizeListingImages([photo("AA=A")]), /beschädigt/); });
test("enforces per-photo and combined request limits", () => { assert.throws(() => normalizeListingImages([photo("A".repeat(MAX_IMAGE_DATA_URL_CHARS))]), /zu groß/); const payloadLength = Math.floor((MAX_TOTAL_IMAGE_DATA_URL_CHARS - 4 * 24) / 4) * 4; const largePhoto = photo("A".repeat(payloadLength)); assert.throws(() => normalizeListingImages([largePhoto, largePhoto]), /zusammen zu groß/); });
