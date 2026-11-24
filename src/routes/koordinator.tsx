import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Handshake, MapPin, MessageCircle, Search, Store } from "lucide-react";
import { Shell } from "@/components/shell";
import { getBoard } from "@/features/kreislauf/api";
import { useKreislauf } from "@/features/kreislauf/context";
import { DEFAULT_REGION, type Board } from "@/features/kreislauf/types";

export const Route = createFileRoute("/koordinator")({
  loader: () => getBoard({ data: { regionId: DEFAULT_REGION } }),
  component: CoordinatorPage,
});

function CoordinatorPage() {
  const initial = Route.useLoaderData();
  const { regionId, hydrated, version } = useKreislauf();
  const [board, setBoard] = useState<Board>(initial);

  useEffect(() => {
    if (!hydrated || (regionId === initial.region.id && version === 0)) return;
    let cancelled = false;
    getBoard({ data: { regionId } }).then((next) => {
      if (!cancelled) setBoard(next);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [hydrated, initial.region.id, regionId, version]);

  const active = board.listings.filter((listing) => listing.status !== "completed");
  const requests = active.filter((listing) => listing.offerType === "search");
  const offers = active.filter((listing) => listing.offerType !== "search");
  const recent = active.slice(0, 5);

  return (
    <Shell regions={board.regions}>
      <section className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">Regionale Verbindung</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-fg">3 Punkte 1 Ort</h1>
        <p className="mt-3 text-muted">Der Koordinator als Anlaufstelle für den regionalen Austausch in {board.region.name}.</p>
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-elev p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest/10 text-forest">
            <MapPin className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl text-fg">Ein Ort. Drei Verbindungspunkte.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">Der Koordinator hilft dabei, Gesuche und Angebote zusammenzuführen, lokale Treffpunkte abzustimmen und Fragen zum Tauschablauf zu sammeln.</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-line bg-bg p-3">
            <dt className="flex items-center gap-1 text-xs text-subtle"><Search className="h-3.5 w-3.5" /> Gesuche</dt>
            <dd className="mt-2 font-display text-2xl tabular-nums text-fg">{requests.length}</dd>
          </div>
          <div className="rounded-2xl border border-line bg-bg p-3">
            <dt className="flex items-center gap-1 text-xs text-subtle"><Store className="h-3.5 w-3.5" /> Angebote</dt>
            <dd className="mt-2 font-display text-2xl tabular-nums text-fg">{offers.length}</dd>
          </div>
          <div className="rounded-2xl border border-line bg-bg p-3">
            <dt className="flex items-center gap-1 text-xs text-subtle"><MapPin className="h-3.5 w-3.5" /> Region</dt>
            <dd className="mt-2 truncate text-base font-semibold text-fg">{board.region.name}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" disabled title="Der reale Kontaktweg wird mit den regionalen Zuständigkeiten abgestimmt." className="inline-flex h-11 items-center gap-2 rounded-xl bg-forest px-4 text-sm font-semibold text-paper opacity-55">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Koordinator kontaktieren
          </button>
          <Link to="/" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-bg px-4 text-sm font-semibold text-fg">
            Marktplatz öffnen <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <p className="mt-3 text-xs text-subtle">Der direkte Kontakt wird erst aktiviert, wenn Ansprechperson, Vertretung und Zuständigkeit in der Region verbindlich festgelegt sind.</p>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div><h2 className="font-display text-2xl text-fg">Aktuelle regionale Einträge</h2><p className="mt-1 text-sm text-muted">Die neuesten aktiven Gesuche und Angebote aus der gewählten Region.</p></div>
          <span className="shrink-0 rounded-full border border-line bg-elev px-3 py-1 text-xs text-muted">{active.length} aktiv</span>
        </div>
        {recent.length ? (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-elev">
            {recent.map((listing) => (
              <li key={listing.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-copper">{listing.offerType === "search" ? "Gesuch" : "Angebot"}</p>
                  <p className="mt-1 truncate font-medium text-fg">{listing.title}</p>
                  <p className="mt-1 truncate text-xs text-muted">{listing.ownerName} · {listing.placeLabel}</p>
                </div>
                <Link to="/inserat/$listingId" params={{ listingId: listing.id }} search={{ conversation: undefined }} aria-label={`Details zu ${listing.title}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-bg text-muted hover:text-fg">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">In dieser Region gibt es derzeit keine aktiven Einträge.</p>
        )}
      </section>

      <p className="mt-6 rounded-2xl border border-line bg-elev p-4 text-xs leading-relaxed text-subtle">Funktionsvorschau: Zuständigkeiten, reale Kontaktwege, Treffpunktregeln und Terminorganisation müssen mit der Region abgestimmt werden. Diese Seite löst noch keine Treffen aus und versendet keine Koordinator-Nachrichten.</p>
    </Shell>
  );
}
