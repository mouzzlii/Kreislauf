import { randomInt } from "node:crypto";

export type Coordinates = { lat: number; lng: number };

/**
 * Public listing coordinates are shifted with cryptographically random offsets.
 * The exact coordinates are never stored in the listing row, and the random
 * offset is not derivable from the public listing ID or this source code.
 *
 * This function is server-only: it is called while creating the listing.
 */
export function approximatePublicCoordinates(
  regionCenter: Coordinates,
  candidate: Coordinates | null,
  _seed: string,
): Coordinates {
  const safeCenter = {
    lat: Number.isFinite(regionCenter.lat) && regionCenter.lat >= -90 && regionCenter.lat <= 90 ? regionCenter.lat : 48.2,
    lng: Number.isFinite(regionCenter.lng) && regionCenter.lng >= -180 && regionCenter.lng <= 180 ? regionCenter.lng : 15.1,
  };
  const validCandidate =
    candidate !== null &&
    Number.isFinite(candidate.lat) &&
    Number.isFinite(candidate.lng) &&
    candidate.lat >= -90 &&
    candidate.lat <= 90 &&
    candidate.lng >= -180 &&
    candidate.lng <= 180 &&
    Math.abs(candidate.lat - safeCenter.lat) < 0.4 &&
    Math.abs(candidate.lng - safeCenter.lng) < 0.6;

  const base = validCandidate ? candidate : safeCenter;
  return {
    lat: clamp(base.lat + randomOffset(), -90, 90),
    lng: clamp(base.lng + randomOffset(), -180, 180),
  };
}

function randomOffset(): number {
  const magnitude = randomInt(80, 201) / 10_000;
  return randomInt(0, 2) === 0 ? magnitude : -magnitude;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
