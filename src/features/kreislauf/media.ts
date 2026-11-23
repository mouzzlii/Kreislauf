export function assertOwnedListingImageUrl(value: string, userId: string): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Ungültige Bildadresse");
  }

  if (
    parsed.protocol !== "https:" ||
    !/^[a-z0-9-]+\\.public\\.blob\\.vercel-storage\\.com$/i.test(parsed.hostname) ||
    parsed.port !== "" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    !parsed.pathname.startsWith(`/listings/${encodeURIComponent(userId)}/`)
  ) {
    throw new Error("Das übernommene Foto gehört nicht zu deinem Konto oder stammt nicht aus dem KREISLAUF-Medienspeicher.");
  }
}
