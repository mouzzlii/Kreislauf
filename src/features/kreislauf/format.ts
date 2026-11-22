import type { BookingStatus, Category, ListingStatus, OfferType } from "./types";

export const CATEGORY_LABEL: Record<Category, string> = {
  goods: "Gut",
  service: "Hilfe",
  sharing: "Flotte",
};

export const OFFER_TYPE_LABEL: Record<OfferType, string> = {
  sell: "Biete",
  search: "Suche",
  gift: "Verschenke",
};

export const STATUS_LABEL: Record<ListingStatus, string> = {
  active: "Verfügbar",
  booked: "Belegt",
  completed: "Abgeschlossen",
  maintenance: "Pausiert",
};

export const BOOKING_LABEL: Record<BookingStatus, string> = {
  reserved: "Reserviert",
  handed_over: "Übergeben",
  returned: "Zurückgegeben",
  cancelled: "Storniert",
};

const karmaFormat = new Intl.NumberFormat("de-AT");
const trustFormat = new Intl.NumberFormat("de-AT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const whenFormat = new Intl.DateTimeFormat("de-AT", {
  timeZone: "Europe/Vienna",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatKarma(value: number): string {
  return karmaFormat.format(value);
}

export function formatTrust(value: number): string {
  return trustFormat.format(value);
}

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return whenFormat.format(date);
}

export function priceCaption(category: Category, price: number): string {
  if (price === 0) return "Kostenlos";
  const amount = `${formatKarma(price)} Karma`;
  if (category === "sharing") return `${amount} / Tag`;
  return amount;
}

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const r = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(s)));
}
