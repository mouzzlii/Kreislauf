import { Link } from "@tanstack/react-router";
import { Bike, Package, Wrench } from "lucide-react";
import { useState } from "react";
import { CATEGORY_LABEL, OFFER_TYPE_LABEL, STATUS_LABEL, formatKarma, priceCaption } from "@/features/kreislauf/format";
import type { Category, Listing } from "@/features/kreislauf/types";

const ICONS: Record<Category, typeof Package> = {
  goods: Package,
  service: Wrench,
  sharing: Bike,
};

export function ListingVisual({
  listing,
  className = "",
}: {
  listing: Pick<Listing, "images" | "category" | "title">;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = listing.images[0];
  const Icon = ICONS[listing.category];
  if (!src || failed) {
    return (
      <div className={`grid place-items-center bg-elev-2 text-copper ${className}`}>
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

export function ListingCard({ listing, distance }: { listing: Listing; distance?: string | null }) {
  return (
    <Link
      to="/inserat/$listingId"
      params={{ listingId: listing.id }}
      search={{ conversation: undefined }}
      className="flex flex-col overflow-hidden rounded-3xl border border-line bg-elev p-3 transition-[transform,background-color] duration-150 hover:bg-elev-2"
    >
      <ListingVisual listing={listing} className="aspect-[4/3] w-full rounded-xl" />
      <div className="flex items-start justify-between gap-3 px-1 pt-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">
            {OFFER_TYPE_LABEL[listing.offerType]} · {CATEGORY_LABEL[listing.category]} · {STATUS_LABEL[listing.status]}
            {listing.handsCount > 0 ? ` · ${listing.handsCount} Hände` : ""}
          </p>
          <h2 className="mt-1 font-display text-xl leading-tight text-fg">{listing.title}</h2>
        </div>
        <p className="shrink-0 text-right text-sm tabular-nums text-copper">
          {listing.offerType === "search"
            ? "Gesuch"
            : listing.offerType === "barter"
              ? "Gegenleistung"
              : listing.offerType === "combined"
                ? (listing.karmaAdjustment > 0 ? formatKarma(listing.karmaAdjustment) + " Karma + Gegenleistung" : "Gegenleistung")
                : priceCaption(listing.category, listing.priceKarma)}
        </p>
      </div>
      <p className="mt-2 px-1 text-sm text-muted">
        {listing.placeLabel}
        {distance ? ` · ${distance}` : ""} · {listing.ownerName}
      </p>
    </Link>
  );
}
