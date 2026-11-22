import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListingVisual } from "@/components/listing-card";
import { ListingConversation } from "@/components/listing-conversation";
import { EscrowPanel } from "@/components/escrow-panel";
import { QrScanner } from "@/components/qr-scanner";
import { Shell } from "@/components/shell";
import { Button, fieldClass } from "@/components/ui";
import {
  addReview,
  getListing,
  getListingBooking,
  getProviderListings,
  getMeetingPoint,
  reserveListing,
  setListingAvailability,
  tradeListing,
  transitionBooking,
} from "@/features/kreislauf/api";
import { useKreislauf } from "@/features/kreislauf/use-kreislauf";
import {
  BOOKING_LABEL,
  CATEGORY_LABEL,
  STATUS_LABEL,
  formatKarma,
  formatTrust,
  formatWhen,
  priceCaption,
} from "@/features/kreislauf/format";
import type { Booking, Listing, ListingDetail } from "@/features/kreislauf/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/inserat/$listingId")({
  loader: ({ params }) => getListing({ data: { id: params.listingId } }),
  component: ListingPage,
});

function ListingPage() {
  const initial = Route.useLoaderData();
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const { version, bump, refreshProfile, profile } = useKreislauf();
  const { user, isPending } = useCurrentUserState();
  const [detail, setDetail] = useState<ListingDetail | null>(initial);
  const providerUserId = detail?.listing?.userId;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [providerListings, setProviderListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tradeConfirmOpen, setTradeConfirmOpen] = useState(false);
  const [meetingPointUrl, setMeetingPointUrl] = useState<string | null>(null);
  const [qrTarget, setQrTarget] = useState(`/inserat/${listingId}`);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [scores, setScores] = useState({ punctuality: 5, itemCondition: 5, reliability: 5, note: "" });

  useEffect(() => {
    if (version === 0) return;
    let cancel = false;
    getListing({ data: { id: listingId } }).then((next) => {
      if (!cancel) setDetail(next);
    });
    return () => {
      cancel = true;
    };
  }, [listingId, version]);

  useEffect(() => {
    if (!providerUserId) { setProviderListings([]); return; }
    let cancel = false;
    getProviderListings({ data: { id: listingId, excludeId: listingId } })
      .then((items) => { if (!cancel) setProviderListings(items); })
      .catch(() => { if (!cancel) setProviderListings([]); });
    return () => { cancel = true; };
  }, [providerUserId, listingId]);

  useEffect(() => {
    if (!user) {
      setBooking(null);
      return;
    }
    let cancel = false;
    getListingBooking({ data: { id: listingId } })
      .then((result) => { if (!cancel) setBooking(result); })
      .catch(() => { if (!cancel) setBooking(null); });
    return () => { cancel = true; };
  }, [listingId, user, version]);

  useEffect(() => {
    setQrTarget(`${window.location.origin}/inserat/${listingId}`);
  }, [listingId]);

  useEffect(() => {
    if (!user) { setMeetingPointUrl(null); return; }
    let cancel = false;
    getMeetingPoint({ data: { id: listingId } }).then((result) => {
      if (!cancel) setMeetingPointUrl(result.url);
    }).catch(() => { if (!cancel) setMeetingPointUrl(null); });
    return () => { cancel = true; };
  }, [listingId, user, version]);

  if (!detail) {
    return (
      <Shell>
        <h1 className="font-display text-4xl">Inserat nicht gefunden</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-muted underline-offset-4 hover:underline">
          Zum Markt
        </Link>
      </Shell>
    );
  }

  const { listing, reviews } = detail;
  const mine = user?.id === listing.userId;
  const party = user && booking && (user.id === booking.renterId || user.id === booking.ownerId);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Nicht möglich");
      else {
        bump();
        await refreshProfile();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nicht möglich");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <Link to="/" className="text-sm text-subtle underline-offset-4 hover:underline">
        Markt
      </Link>
      <div className="mt-3 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <ListingGallery listing={listing} />
          {listing.videoUrls.map((url) => (
            <video key={url} src={url} controls playsInline preload="metadata" className="max-h-[480px] w-full rounded-3xl bg-black" aria-label="Inseratvideo" />
          ))}
        </div>
        <div>
          <p className="text-sm text-copper">
            {listing.offerType === "sell" ? "Biete / Verkaufe" : listing.offerType === "search" ? "Suche nach" : "Verschenke"} · {CATEGORY_LABEL[listing.category]} · {STATUS_LABEL[listing.status]}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-fg">{listing.title}</h1>
          <p className="mt-3 text-muted">{listing.description}</p>
          <p className="mt-4 text-sm text-muted">
            {listing.placeLabel} · {listing.ownerName}
            {listing.trust != null ? ` · Vertrauen ${formatTrust(listing.trust)}` : ""}
          </p>
          <p className="mt-4 font-display text-3xl tabular-nums text-copper">
            {listing.offerType === "search" ? "Suchanzeige" : priceCaption(listing.category, listing.priceKarma)}
          </p>
          {listing.handsCount > 0 ? <p className="mt-3 inline-flex rounded-full bg-forest/15 px-3 py-1 text-sm text-forest">Bereits durch {listing.handsCount} {listing.handsCount === 1 ? "Hand" : "Hände"} gegangen</p> : null}

          {listing.offerType !== "search" && listing.category !== "sharing" && listing.status === "active" && !mine ? (
            <div className="mt-5">
              {isPending ? (
                <div className="h-11 w-40 animate-pulse rounded-lg bg-elev-2" />
              ) : user && profile?.isVerified ? (
                tradeConfirmOpen ? (
                  <div className="rounded-2xl border border-copper/30 bg-copper/5 p-4" role="group" aria-label="Tausch bestätigen">
                    <p className="text-sm text-fg">
                      {listing.priceKarma >= 100
                        ? "Es wird eine Community-Treuhand eröffnet. Karma wird erst nach mindestens vier Stimmen und einer Zweidrittelmehrheit übertragen."
                        : listing.offerType === "gift"
                          ? "Die Weitergabe ist kostenlos. Nach Bestätigung wird die Übergabe im Kreislauf vermerkt."
                          : `Mit deiner Bestätigung werden ${formatKarma(listing.priceKarma)} sofort von deinem Karma-Guthaben abgezogen und dem Anbieter gutgeschrieben.`}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button disabled={busy} onClick={() => {
                        setTradeConfirmOpen(false);
                        void run(() => tradeListing({ data: { id: listing.id } }));
                      }}>
                        {listing.priceKarma >= 100 ? "Treuhand anfragen" : "Verbindlich bestätigen"}
                      </Button>
                      <Button variant="ghost" disabled={busy} onClick={() => setTradeConfirmOpen(false)}>Abbrechen</Button>
                    </div>
                  </div>
                ) : (
                  <Button disabled={busy} onClick={() => setTradeConfirmOpen(true)}>
                    {listing.priceKarma >= 100 ? "Treuhand anfragen" : listing.category === "service" ? "Hilfe begleichen" : "Tauschen"}
                  </Button>
                )
              ) : user ? (
                <Link to="/konto" className="inline-flex h-11 items-center rounded-lg bg-forest px-4 text-sm font-medium text-paper">Zuerst ID Austria bestätigen</Link>
              ) : (
                <Link to="/login" className="inline-flex h-11 items-center rounded-lg bg-forest px-4 text-sm font-medium text-paper">
                  Anmelden zum Tauschen
                </Link>
              )}
              <p className="mt-2 text-sm text-subtle">
                {listing.priceKarma >= 100
                  ? "Hochwertiger Tausch mit Community-Treuhand; die Punkte werden erst nach dem Mehrheitsbeschluss übertragen."
                  : listing.offerType === "gift"
                    ? "Kostenlose Weitergabe mit Aktivitätsvermerk."
                    : "Karma wird nach deiner Bestätigung sofort übertragen."}
              </p>
            </div>
          ) : null}

          {listing.offerType !== "search" && listing.category === "sharing" && listing.status === "active" && !mine ? (
            <form
              className="mt-5 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void run(() => reserveListing({ data: { id: listing.id, startsAt, endsAt } }));
              }}
            >
              <label className="block text-sm text-muted">
                Von
                <input className={`${fieldClass} mt-2`} type="datetime-local" required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
              </label>
              <label className="block text-sm text-muted">
                Bis
                <input className={`${fieldClass} mt-2`} type="datetime-local" required value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
              </label>
              {isPending ? null : user ? (
                <Button type="submit" disabled={busy}>
                  Reservieren
                </Button>
              ) : (
                <Link to="/login" className="inline-flex h-11 items-center rounded-lg bg-forest px-4 text-sm font-medium text-paper">
                  Anmelden zum Buchen
                </Link>
              )}
              <p className="text-sm text-subtle">Karma wird erst bei der Übergabe abgebucht. Angefangene Tage zählen voll.</p>
            </form>
          ) : null}

          {mine ? (
            <div className="mt-5 rounded-2xl border border-line bg-elev p-4">
              <p className="text-sm text-muted">Das ist dein Inserat. Du kannst es vorübergehend aus dem Markt nehmen und später wieder freischalten.</p>
              {listing.status === "active" || listing.status === "paused" ? (
                <Button
                  className="mt-3"
                  variant={listing.status === "active" ? "ghost" : "primary"}
                  disabled={busy}
                  onClick={() => void run(() => setListingAvailability({ data: { id: listing.id, action: listing.status === "active" ? "pause" : "resume" } }))}
                >
                  {listing.status === "active" ? "Inserat pausieren" : "Inserat wieder freigeben"}
                </Button>
              ) : (
                <p className="mt-2 text-xs text-subtle">Dieses Inserat kann wegen seines aktuellen Status nicht pausiert werden.</p>
              )}
            </div>
          ) : null}
          {listing.status === "completed" && user ? <Button className="mt-4" variant="ghost" onClick={() => navigate({ to: "/inserat/neu", search: { reuse: listing.itemUuid } })}>Erneut im Kreislauf einstellen</Button> : null}

          {meetingPointUrl ? <a href={meetingPointUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm text-forest underline">Privaten Treffpunkt in what3words öffnen</a> : null}
          {user && detail.escrowPending ? <EscrowPanel listingId={listing.id} /> : null}

          {booking ? (
            <div className="mt-5 rounded-3xl border border-line bg-elev p-4">
              <p className="text-sm text-fg">
                {BOOKING_LABEL[booking.status]} · {booking.renterName} · {formatKarma(booking.amountKarma)} Karma
              </p>
              <p className="mt-1 text-sm text-subtle">
                {formatWhen(booking.startsAt)} – {formatWhen(booking.endsAt)}
              </p>
              {party ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {booking.status === "reserved" ? (
                    <>
                      <Button disabled={busy} onClick={() => void run(() => transitionBooking({ data: { id: booking.id, action: "handover" } }))}>
                        Übergeben
                      </Button>
                      <Button variant="ghost" disabled={busy} onClick={() => void run(() => transitionBooking({ data: { id: booking.id, action: "cancel" } }))}>
                        Stornieren
                      </Button>
                    </>
                  ) : null}
                  {booking.status === "handed_over" ? (
                    <Button disabled={busy} onClick={() => void run(() => transitionBooking({ data: { id: booking.id, action: "return" } }))}>
                      Zurückgeben
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="mt-3 text-sm text-copper">{error}</p> : null}
          {user &&
          (listing.status === "completed" || (booking?.status === "returned" && (mine || party))) ? (
            <ReviewBox
              scores={scores}
              setScores={setScores}
              busy={busy}
              onSubmit={() =>
                void run(() =>
                  addReview({
                    data: {
                      id: listing.id,
                      punctuality: scores.punctuality,
                      itemCondition: scores.itemCondition,
                      reliability: scores.reliability,
                      note: scores.note,
                    },
                  }),
                )
              }
            />
          ) : null}
        </div>
      </div>

      <ListingConversation listingId={listing.id} ownerId={listing.userId} currentUserId={user?.id ?? null} />

      {providerListings.length > 0 ? (
        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-forest">Vom selben Anbieter</p>
              <h2 className="mt-1 font-display text-2xl text-fg">Weitere Inserate</h2>
            </div>
            <span className="text-xs text-subtle">{providerListings.length} aktiv</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {providerListings.map((item) => (
              <Link key={item.id} to="/inserat/$listingId" params={{ listingId: item.id }} className="group overflow-hidden rounded-2xl border border-line bg-elev">
                <ListingVisual listing={item} className="aspect-[4/3] w-full" />
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium text-fg group-hover:underline">{item.title}</p>
                  <p className="mt-1 text-xs text-muted">{priceCaption(item.category, item.priceKarma)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <QrScanner onOpenListing={(id) => void navigate({ to: "/inserat/$listingId", params: { listingId: id } })} />

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-line bg-elev p-4">
          <h2 className="font-display text-xl">Produkt-QR-Code</h2>
          <p className="mt-1 text-xs text-subtle">Artikelkennung: {listing.itemUuid}</p>
          <img className="mt-3 h-40 w-40 rounded-xl bg-white p-2" alt="QR-Code zum Produkt" src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrTarget)}`} />
          <Button className="mt-3" variant="ghost" onClick={() => window.print()}>QR-Code / Seite drucken</Button>
          <p className="mt-2 text-xs text-subtle">Der Code führt zur Produktseite. Der Scanner oben öffnet erkannte KREISLAUF-Inserate direkt.</p>
        </div>
        <div className="rounded-3xl border border-line bg-elev p-4">
          <h2 className="font-display text-xl">Kurz-Historie</h2>
          {detail.history.length ? <ol className="mt-3 space-y-3">{detail.history.map((entry, index) => <li key={`${entry.createdAt}-${index}`} className="border-l-2 border-forest/40 pl-3"><p className="text-sm text-fg">{entry.placeLabel}</p><p className="text-xs text-subtle">{formatWhen(entry.createdAt)} · {entry.eventKind === "listed" ? "Eingestellt" : entry.eventKind === "gifted" ? "Verschenkt" : entry.eventKind === "loaned" ? "Verliehen" : "Weitergegeben"}</p></li>)}</ol> : <p className="mt-2 text-sm text-muted">Noch keine Stationen dokumentiert.</p>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Bewertungen</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Noch keine.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-3xl border border-line bg-elev p-4">
                <p className="text-sm text-fg">{review.reviewerName}</p>
                <p className="mt-1 text-sm text-muted">
                  Pünktlich {review.punctuality} · Zustand {review.itemCondition} · Verlässlich {review.reliability}
                </p>
                {review.note ? <p className="mt-2 text-sm text-fg">{review.note}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}


function ListingGallery({ listing }: { listing: Listing }) {
  const images = listing.images.slice(0, 4);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setFailed(false);
  }, [listing.id]);

  if (images.length <= 1 || failed) {
    return <ListingVisual listing={listing} className="aspect-[4/3] w-full rounded-3xl" />;
  }

  return (
    <div className="min-w-0">
      <img
        src={images[activeIndex]}
        alt={`${listing.title} – Bild ${activeIndex + 1}`}
        className="aspect-[4/3] w-full rounded-3xl object-cover"
        onError={() => setFailed(true)}
      />
      <div className="mt-3 grid grid-cols-4 gap-2" aria-label="Weitere Produktfotos">
        {images.map((image, index) => (
          <button
            key={`${listing.id}-image-${index}`}
            type="button"
            aria-label={`Bild ${index + 1} anzeigen`}
            aria-pressed={activeIndex === index}
            onClick={() => setActiveIndex(index)}
            className={`overflow-hidden rounded-xl border-2 ${activeIndex === index ? "border-forest" : "border-transparent"}`}
          >
            <img src={image} alt="" className="aspect-[4/3] w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="mt-2 text-right text-xs text-subtle">{activeIndex + 1} von {images.length} Fotos</p>
    </div>
  );
}

function ReviewBox({
  scores,
  setScores,
  busy,
  onSubmit,
}: {
  scores: { punctuality: number; itemCondition: number; reliability: number; note: string };
  setScores: (value: { punctuality: number; itemCondition: number; reliability: number; note: string }) => void;
  busy: boolean;
  onSubmit: () => void;
}) {
  return (
    <form
      className="mt-5 space-y-3 rounded-3xl border border-line p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="text-sm text-fg">Bewerten</p>
      {(["punctuality", "itemCondition", "reliability"] as const).map((key) => (
        <label key={key} className="flex items-center justify-between gap-3 text-sm text-muted">
          <span>{key === "punctuality" ? "Pünktlich" : key === "itemCondition" ? "Zustand" : "Verlässlich"}</span>
          <select
            className="h-11 rounded-lg border border-line bg-elev px-3 text-fg"
            value={scores[key]}
            onChange={(event) => setScores({ ...scores, [key]: Number(event.target.value) })}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      ))}
      <textarea
        className={`${fieldClass} h-24 py-3`}
        value={scores.note}
        placeholder="Kurz, was gestimmt hat"
        onChange={(event) => setScores({ ...scores, note: event.target.value })}
      />
      <Button type="submit" variant="ghost" disabled={busy}>
        Bewertung speichern
      </Button>
    </form>
  );
}
