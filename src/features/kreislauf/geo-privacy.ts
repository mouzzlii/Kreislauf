export type Coordinates = { lat: number; lng: number };

export function approximatePublicCoordinates(
  regionCenter: Coordinates,
  candidate: Coordinates | null,
  seed: string,
): Coordinates {
  const validCandidate =
    candidate !== null &&
    Number.isFinite(candidate.lat) &&
    Number.isFinite(candidate.lng) &&
    candidate.lat >= -90 &&
    candidate.lat <= 90 &&
    candidate.lng >= -180 &&
    candidate.lng <= 180 &&
    Math.abs(candidate.lat - regionCenter.lat) < 0.4 &&
    Math.abs(candidate.lng - regionCenter.lng) < 0.6;

  const base = validCandidate ? candidate : regionCenter;
  return {
    lat: base.lat + offset(seed, "north-south"),
    lng: base.lng + offset(seed, "east-west"),
  };
}

function offset(seed: string, axis: string): number {
  let hash = 2166136261;
  for (const char of `${seed}:${axis}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const magnitude = 0.003 + ((hash >>> 1) % 700) / 100_000;
  return (hash & 1) === 0 ? magnitude : -magnitude;
}
