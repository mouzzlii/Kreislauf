import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Listing, Region } from "@/features/kreislauf/types";

export function RegionMap({ region, listings }: { region: Region; listings: Listing[] }) {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    let removed = false;
    let map: { remove: () => void } | null = null;

    void (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default;
      if (removed || !nodeRef.current) return;
      const next = L.map(nodeRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(
        [region.centerLat, region.centerLng],
        13,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(next);
      const bounds: [number, number][] = [[region.centerLat, region.centerLng]];
      for (const listing of listings) {
        const kind = listing.category === "sharing" ? "F" : listing.category === "service" ? "H" : "G";
        const icon = L.divIcon({
          className: "",
          html: `<div class="pin ${listing.category === "sharing" ? "pin-sharing" : listing.category === "service" ? "pin-service" : ""}"><span>${kind}</span></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        L.marker([listing.lat, listing.lng], { icon })
          .addTo(next)
          .bindPopup(`<strong>${escapeHtml(listing.title)}</strong><br>${escapeHtml(listing.placeLabel)}`);
        bounds.push([listing.lat, listing.lng]);
      }
      if (bounds.length > 1) next.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
      map = next;
      window.setTimeout(() => next.invalidateSize(), 60);
    })();

    return () => {
      removed = true;
      map?.remove();
    };
  }, [listings, region.centerLat, region.centerLng]);

  return <div ref={nodeRef} className="h-96 overflow-hidden rounded-3xl border border-line" />;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "\u0026amp;")
    .replaceAll("<", "\u0026lt;")
    .replaceAll(">", "\u0026gt;")
    .replaceAll('"', "\u0026quot;");
}
