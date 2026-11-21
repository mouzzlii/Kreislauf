import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { RegionMap } from "@/components/region-map";
import { Shell } from "@/components/shell";
import { getBoard } from "@/features/kreislauf/api";
import { useKreislauf } from "@/features/kreislauf/context";
import { DEFAULT_REGION, type Board } from "@/features/kreislauf/types";

export const Route = createFileRoute("/karte")({
  loader: () => getBoard({ data: { regionId: DEFAULT_REGION } }),
  component: MapPage,
});

function MapPage() {
  const initial = Route.useLoaderData();
  const { regionId, hydrated, version } = useKreislauf();
  const [board, setBoard] = useState<Board>(initial);

  useEffect(() => {
    if (!hydrated) return;
    if (regionId === initial.region.id && version === 0) return;
    let cancel = false;
    getBoard({ data: { regionId } }).then((next) => {
      if (!cancel) setBoard(next);
    });
    return () => {
      cancel = true;
    };
  }, [hydrated, initial.region.id, regionId, version]);

  const pins = board.listings.filter((listing) => listing.status !== "completed");

  return (
    <Shell regions={board.regions}>
      <h1 className="font-display text-4xl text-fg">In der Nähe</h1>
      <p className="mt-2 max-w-xl text-muted">
        Flotte, Güter und Hilfe in {board.region.name}. G steht für Gut, H für Hilfe, F für Flotte.
      </p>
      <div className="mt-5">
        <RegionMap region={board.region} listings={pins} />
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {pins.map((listing) => (
          <li key={listing.id}>
            <ListingCard listing={listing} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-subtle">
        Kartenkacheln: OpenStreetMap.{" "}
        <Link to="/" className="text-fg underline-offset-4 hover:underline">
          Zurück zum Markt
        </Link>
      </p>
    </Shell>
  );
}
