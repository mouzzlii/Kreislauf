export type Category = "goods" | "service" | "sharing";
export type OfferType = "sell" | "search" | "gift";
export type ListingStatus = "active" | "booked" | "completed" | "maintenance" | "paused";
export type BookingStatus = "reserved" | "handed_over" | "returned" | "cancelled";

export type Region = {
  id: string;
  name: string;
  slug: string;
  description: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  demurrageEnabled: boolean;
  demurrageBps: number;
};

export type Listing = {
  id: string;
  userId: string;
  regionId: string;
  title: string;
  description: string;
  category: Category;
  offerType: OfferType;
  itemUuid: string;
  handsCount: number;
  what3wordsAddress?: string | null;
  priceKarma: number;
  status: ListingStatus;
  images: string[];
  videoUrls: string[];
  lat: number;
  lng: number;
  placeLabel: string;
  assetKind: string | null;
  createdAt: string;
  ownerName: string;
  trust: number | null;
  reviewCount: number;
};

export type Review = {
  id: string;
  reviewerName: string;
  punctuality: number;
  itemCondition: number;
  reliability: number;
  note: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  listingId: string;
  renterId: string;
  ownerId: string;
  renterName: string;
  ownerName: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  amountKarma: number;
};

export type LedgerEntry = {
  id: number;
  amountKarma: number;
  entryKind: "mint" | "transfer" | "demurrage" | "activity";
  message: string;
  createdAt: string;
  senderName: string | null;
  receiverName: string | null;
  listingTitle: string | null;
};

export type Stats = {
  inCirculation: number;
  idle: number;
  moved: number;
};

export type Board = {
  region: Region;
  regions: Region[];
  listings: Listing[];
  stats: Stats;
  ledger: LedgerEntry[];
};

export type Profile = {
  userId: string;
  username: string;
  regionId: string;
  regionName: string;
  karmaBalance: number;
  lat: number | null;
  lng: number | null;
  trust: number | null;
  reviewCount: number;
  lastActivityAt: string;
  isVerified: boolean;
  moderatorRank: number;
};

export type ItemHistoryEntry = { placeLabel: string; createdAt: string; eventKind: string };

export type ListingDetail = {
  listing: Listing;
  history: ItemHistoryEntry[];
  escrowVisible: boolean;
  booking: Booking | null;
  reviews: Review[];
};

export const DEFAULT_REGION = "yspertal-b36";
export const WELCOME_KARMA = 120;
