export type Coordinates = { lat: number; lng: number };

/**
 * Public map points are generated only from the region center.
 *
 * Do not offset a member's precise coordinates: because listing IDs are public,
 * a deterministic offset from a private point could be reversed by anyone who
 * reads this source. The candidate is deliberately ignored. This trades exact
 * proximity for a meaningful privacy boundary until a non-reversible
 * server-secret geohash strategy is introduced.
 */
export function approximatePublicCoordinates(
  regionCenter: Coordinates,
  _candidate: Coordinates | null,
  seed: string,
): Coordinates {
  const safeCenter = {
    lat: Number.isFinite(regionCenter.lat) && regionCenter.lat >= -90 && regionCenter.lat <= 90 ? regionCenter.lat : 48.2,
    lng: Number.isFinite(regionCenter.lng) && regionCenter.lng >= -180 && regionCenter.lng <= 180 ? regionCenter.lng : 15.1,
  };
  return {
    lat: safeCenter.lat + offset(seed, "north-south"),
    lng: safeCenter.lng + offset(seed, "east-west"),
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
