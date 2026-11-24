import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui";
import { getBoard, runDemurrage, type DemurrageCut } from "@/features/kreislauf/api";
import { useKreislauf } from "@/features/kreislauf/context";
import { CATEGORY_LABEL, formatKarma, haversineKm } from "@/features/kreislauf/format";
import { DEFAULT_REGION, type Board, type Category, type OfferType } from "@/features/kreislauf/types";

export const Route = createFileRoute("/")({
  loader: () => getBoard({ data: { regionId: DEFAULT_REGION } }),
  component: Home,
});

const FILTERS: Array<{ id: "all" | Category; label: string }> = [
  { id: "all", label: "Alles" },
  { id: "goods", label: CATEGORY_LABEL.goods },
  { id: "service", label: CATEGORY_LABEL.service },
  { id: "sharing", label: CATEGORY_LABEL.sharing },
];

function Home() {
  const initial = Route.useLoaderData();
  const { board } = useLiveBoard(initial);
  const { profile, bump, refreshProfile } = useKreislauf();
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [offerFilter, setOfferFilter] = useState<"all" | OfferType>("all");
  const [near, setNear] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [cuts, setCuts] = useState<DemurrageCut[] | null>(null);
  const [working, setWorking] = useState(false);

  const origin =
    profile?.lat != null && profile.lng != null
      ? { lat: profile.lat, lng: profile.lng }
      : { lat: board.region.centerLat, lng: board.region.centerLng };

  const listings = board.listings.filter((listing) => {
    if (filter !== "all" && listing.category !== filter) return false;
    if (offerFilter !== "all" && listing.offerType !== offerFilter) return false;
    if (!showDone && listing.status === "completed") return false;
    if (near && haversineKm(origin.lat, origin.lng, listing.lat, listing.lng) > 5) return false;
    return true;
  });

  return (
    <Shell regions={board.regions}>
      <section className="max-w-xl">
        <p className="text-sm text-copper">{board.region.name}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-fg">Tauschen, helfen, teilen.</h1>
        <p className="mt-3 text-muted">{board.region.description}</p>
      </section>

      <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:max-w-xl">
        <Stat label="Karma im Umlauf" value={formatKarma(board.stats.inCirculation)} />
        <Stat label="Karma bewegt · 30 Tage" value={formatKarma(board.stats.moved)} />
        <Stat label="Stillliegendes Karma" value={formatKarma(board.stats.idle)} />
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          disabled={working || board.stats.idle < 1}
          onClick={() => {
            setWorking(true);
            void runDemurrage()
              .then(async (next) => {
                setCuts(next);
                bump();
                await refreshProfile();
              })
              .finally(() => setWorking(false));
          }}
        >
          {working ? "Rechnet…" : "Umlauf sichern"}
        </Button>
        <p className="max-w-sm text-sm text-subtle">
          0,5 % je stillen Monat. Das Karma verfällt, es wandert an niemanden.
        </p>
      </div>
      {cuts ? (
        <p className="mt-3 text-sm text-muted">
          {cuts.length
            ? cuts.map((cut) => `${cut.username} −${formatKarma(cut.cut)}`).join(" · ")
            : "Gerade liegt nichts lange genug still."}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2" aria-label="Inseratstyp">
        {[
          { id: "all", label: "Alle Inserate" },
          { id: "sell", label: "Biete" },
          { id: "search", label: "Suche" },
          { id: "gift", label: "Verschenke" },
          { id: "barter", label: "Direkter Tausch" },
          { id: "combined", label: "Kombiniert" },
        ].map((item) => (
          <button key={item.id} type="button" aria-pressed={offerFilter === item.id}
            onClick={() => setOfferFilter(item.id as typeof offerFilter)}
            className={`h-10 rounded-full px-4 text-sm ${offerFilter === item.id ? "bg-forest text-paper" : "border border-line bg-elev text-fg"}`}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`h-11 shrink-0 rounded-full px-4 text-sm ${filter === item.id ? "bg-forest text-paper" : "border border-line bg-elev text-fg"}`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={near}
          onClick={() => setNear((value) => !value)}
          className={`h-11 shrink-0 rounded-full px-4 text-sm ${near ? "bg-forest text-paper" : "border border-line bg-elev text-fg"}`}
        >
          Bis 5 km
        </button>
        <button
          type="button"
          aria-pressed={showDone}
          onClick={() => setShowDone((value) => !value)}
          className={`h-11 shrink-0 rounded-full px-4 text-sm ${showDone ? "bg-forest text-paper" : "border border-line bg-elev text-fg"}`}
        >
          Abgeschlossen
        </button>
      </div>

      {listings.length === 0 ? (
        <p className="mt-8 text-muted">In diesem Filter liegt gerade nichts.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const km = haversineKm(origin.lat, origin.lng, listing.lat, listing.lng);
            return (
              <li key={listing.id}>
                <ListingCard
                  listing={listing}
                  distance={km < 40 ? `${new Intl.NumberFormat("de-AT", { maximumFractionDigits: 1 }).format(km)} km` : null}
                />
              </li>
            );
          })}
        </ul>
      )}
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-elev px-3 py-4">
      <dt className="text-xs text-subtle">{label}</dt>
      <dd className="mt-1 font-display text-2xl tabular-nums text-fg">{value}</dd>
    </div>
  );
}

function useLiveBoard(initial: Board) {
  const { regionId, hydrated, version } = useKreislauf();
  const [board, setBoard] = useState(initial);
  useEffect(() => {
    if (!hydrated) return;
    if (regionId === initial.region.id && version === 0) return;
    let cancel = false;
    getBoard({ data: { regionId } })
      .then((next) => {
        if (!cancel) setBoard(next);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [hydrated, initial.region.id, regionId, version]);
  return { board };
}
