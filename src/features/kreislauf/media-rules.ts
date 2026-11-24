const JPEG_PREFIX = "data:image/jpeg;base64,";
export const MAX_LISTING_IMAGES = 4;
export const MAX_IMAGE_DATA_URL_CHARS = 280_000;
export const MAX_TOTAL_IMAGE_DATA_URL_CHARS = 1_000_000;

/** Validate and normalize legacy single-photo or current multi-photo input. */
export function normalizeListingImages(value: unknown, legacyValue?: unknown): string[] {
  const candidate = value === undefined ? (legacyValue == null ? [] : [legacyValue]) : value;
  if (!Array.isArray(candidate)) throw new Error("Fotos müssen als Liste übermittelt werden.");
  if (candidate.length > MAX_LISTING_IMAGES) throw new Error("Ein Inserat darf höchstens 4 Fotos enthalten.");
  let totalChars = 0;
  const images = candidate.map((item) => {
    if (typeof item !== "string" || !item.startsWith(JPEG_PREFIX)) throw new Error("Nur komprimierte JPEG-Fotos sind erlaubt.");
    if (item.length > MAX_IMAGE_DATA_URL_CHARS) throw new Error("Ein Foto ist zu groß. Bitte wähle ein kleineres Bild.");
    const encoded = item.slice(JPEG_PREFIX.length);
    if (!encoded || encoded.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) throw new Error("Ein Foto ist beschädigt oder ungültig kodiert.");
    totalChars += item.length;
    return item;
  });
  if (totalChars > MAX_TOTAL_IMAGE_DATA_URL_CHARS) throw new Error("Die ausgewählten Fotos sind zusammen zu groß. Bitte weniger oder kleinere Fotos verwenden.");
  return images;
}
