import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { Shell } from "@/components/shell";
import { getBoard } from "@/features/kreislauf/api";
import { useKreislauf } from "@/features/kreislauf/use-kreislauf";
import { CATEGORY_LABEL, formatKarma, haversineKm } from "@/features/kreislauf/format";
import { DEFAULT_REGION, type Board, type Category } from "@/features/kreislauf/types";
import { authEnabled } from "@/lib/auth/client";

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
  const { profile } = useKreislauf();
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [offerFilter, setOfferFilter] = useState<"all" | "sell" | "search" | "gift">("all");
  const [near, setNear] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const origin =
    profile?.lat != null && profile.lng != null
      ? { lat: profile.lat, lng: profile.lng }
      : { lat: board.region.centerLat, lng: board.region.centerLng };

  const listings = board.listings.filter((listing) => {
    if (filter !== "all" && listing.category !== filter) return false;
    if (offerFilter !== "all" && listing.offerType !== offerFilter) return false;
    if (listing.status === "maintenance" || listing.status === "paused") return false;
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

      <section className="mt-6 flex flex-col items-center rounded-3xl border border-forest/20 bg-forest/5 px-5 py-7 text-center sm:py-8">
        <p className="text-sm text-muted">Mach mit im regionalen Kreislauf</p>
        {authEnabled ? (
          <Link to="/login" className="mt-3 inline-flex min-h-14 w-full max-w-sm items-center justify-center rounded-2xl bg-forest px-6 py-3 text-base font-semibold text-paper shadow-sm transition hover:brightness-110">
            Anmelden / Registrieren
          </Link>
        ) : (
          <a href="#markt" className="mt-3 inline-flex min-h-14 w-full max-w-sm items-center justify-center rounded-2xl bg-forest px-6 py-3 text-base font-semibold text-paper shadow-sm transition hover:brightness-110">
            Gemeinsame Demo öffnen
          </a>
        )}
        {!authEnabled ? <p className="mt-2 text-xs text-subtle">Persönliche Registrierung folgt vor dem öffentlichen Start.</p> : null}
      </section>

      {!authEnabled ? (
        <aside className="mt-5 rounded-2xl border border-copper/30 bg-copper/5 p-4" role="status">
          <p className="text-sm font-semibold text-fg">KREISLAUF läuft derzeit als gemeinsame Testversion</p>
          <p className="mt-1 text-sm text-muted">
            Inserate und Testnachrichten können für andere Testbesucher sichtbar sein.
            Bitte verwende keine echten privaten Daten, Telefonnummern oder vertraulichen Treffpunkte.
            Persönliche Konten und dauerhafte Speicherung werden vor dem öffentlichen Start eingerichtet. Die Vorschau nutzt eine temporäre Datenbank je Serverinstanz: Daten können nach Neustarts verschwinden und sind zwischen parallel laufenden Instanzen nicht zuverlässig synchron.
          </p>
        </aside>
      ) : null}

      <section className="mt-5 rounded-3xl border border-line bg-elev p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-forest">Der regionale Kreislauf</p>
        <h2 className="mt-1 font-display text-2xl text-fg">Ohne Geld. Mit echtem Miteinander.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Mitglieder bieten Dinge und Hilfe an, suchen selbst etwas oder teilen gemeinsam genutzte Geräte.
          Das regionale Karma ist ein nicht auszahlbares Gemeinschafts- und Aktivitätsguthaben – kein Euro-Guthaben und keine Geldbörse.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-elev-2 p-3">
            <p className="text-sm font-semibold text-fg">1 · Anbieten oder suchen</p>
            <p className="mt-1 text-xs text-muted">Inserate mit Fotos, Ort und einer klaren Beschreibung.</p>
          </div>
          <div className="rounded-2xl bg-elev-2 p-3">
            <p className="text-sm font-semibold text-fg">2 · Direkt abstimmen</p>
            <p className="mt-1 text-xs text-muted">Fragen und Absprachen bleiben im Chat des jeweiligen Inserats.</p>
          </div>
          <div className="rounded-2xl bg-elev-2 p-3">
            <p className="text-sm font-semibold text-fg">3 · Regional weitergeben</p>
            <p className="mt-1 text-xs text-muted">Tausch und Sharing halten Dinge und Fähigkeiten in der Region.</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-forest/20 bg-forest/5 p-4 sm:p-5" aria-labelledby="coordinator-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest">Regionaler Koordinationsbereich</p>
          <span className="rounded-full border border-line bg-elev px-3 py-1 text-xs text-muted">Vorschau</span>
        </div>
        <h2 id="coordinator-title" className="mt-2 font-display text-2xl text-fg">3 Punkte · 1 Ort</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Die regionale Anlaufstelle verbindet Gesuche und Angebote im Yspertal:
          Menschen, die etwas brauchen, Menschen, die etwas anbieten, und einen passenden Ort für den Austausch.
        </p>
        <p className="mt-3 text-xs text-subtle">
          Die persönliche Vermittlung durch einen Koordinator ist noch nicht aktiviert. Bis dahin können Mitglieder direkt über die Inserate Kontakt aufnehmen.
        </p>
      </section>

      <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:max-w-xl">
        <Stat label="Karma im Umlauf" value={formatKarma(board.stats.inCirculation)} />
        <Stat label="Karma bewegt · 30 Tage" value={formatKarma(board.stats.moved)} />
        <Stat label="Stillliegendes Karma" value={formatKarma(board.stats.idle)} />
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex h-10 items-center rounded-full border border-line bg-elev px-4 text-sm text-muted">
          Umlaufsicherung · Admin-Funktion
        </span>
        <p className="max-w-sm text-sm text-subtle">
          0,5 % je vollem stillen Monat. In dieser Testdemo ist die Ausführung gesperrt,
          bis eine regionale Administration eingerichtet ist. Das Karma verfällt und
          wird niemandem gutgeschrieben.
        </p>
      </div>

      <div id="markt" className="mt-8 flex flex-wrap gap-2 scroll-mt-28" aria-label="Inseratstyp">
        {[{ id: "all", label: "Alle Inserate" }, { id: "sell", label: "Angebote" }, { id: "search", label: "Gesuche" }, { id: "gift", label: "Verschenke" }].map((item) => (
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
          {profile?.lat != null && profile.lng != null ? "In deiner Nähe · 5 km" : "Umkreis · 5 km"}
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
