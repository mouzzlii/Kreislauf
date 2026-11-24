import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListingVisual } from "@/components/listing-card";
import { Shell } from "@/components/shell";
import { ListingConversation } from "@/components/listing-conversation";
import { Button, fieldClass } from "@/components/ui";
import {
  addReview,
  confirmTradeRequest,
  createTradeRequest,
  getListing,
  getMeetingPoint,
  getTradeRequests,
  releaseEscrow,
  reserveListing,
  tradeListing,
  transitionBooking,
  transitionTradeRequest,
} from "@/features/kreislauf/api";
import { useKreislauf } from "@/features/kreislauf/context";
import {
  BOOKING_LABEL,
  CATEGORY_LABEL,
  OFFER_TYPE_LABEL,
  STATUS_LABEL,
  formatKarma,
  formatTrust,
  formatWhen,
  priceCaption,
} from "@/features/kreislauf/format";
import type { ListingDetail, TradeRequest } from "@/features/kreislauf/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/inserat/$listingId")({
  validateSearch: (search: Record<string, unknown>) => ({
    conversation: typeof search.conversation === "string" ? search.conversation : undefined,
  }),
  loader: ({ params }) => getListing({ data: { id: params.listingId } }),
  component: ListingPage,
});

function ListingPage() {
  const initial = Route.useLoaderData();
  const { listingId } = Route.useParams();
  const { conversation } = Route.useSearch();
  const navigate = useNavigate();
  const { version, bump, refreshProfile, profile } = useKreislauf();
  const { user, isPending } = useCurrentUserState();
  const [detail, setDetail] = useState<ListingDetail | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [meetingPointUrl, setMeetingPointUrl] = useState<string | null>(null);
  const [qrTarget, setQrTarget] = useState(`/inserat/${listingId}`);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [scores, setScores] = useState({ punctuality: 5, itemCondition: 5, reliability: 5, note: "" });
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [offeredDescription, setOfferedDescription] = useState("");
  const [disputeReason, setDisputeReason] = useState("");

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
    if (!user) {
      setTradeRequests([]);
      return;
    }
    let cancel = false;
    getTradeRequests({ data: { id: listingId } })
      .then((next) => { if (!cancel) setTradeRequests(next); })
      .catch(() => { if (!cancel) setTradeRequests([]); });
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

  const { listing, booking, reviews } = detail;
  const mine = user?.id === listing.userId;
  const party = user && booking && (user.id === booking.renterId || user.id === booking.ownerId);
  const exchangeListing = listing.offerType === "barter" || listing.offerType === "combined";
  const priceText =
    listing.offerType === "search" ? "Suchanzeige" :
    listing.offerType === "barter" ? "Direkter Tausch ohne Karma" :
    listing.offerType === "combined"
      ? (listing.karmaAdjustment > 0
          ? formatKarma(listing.karmaAdjustment) + " Karma-Ausgleich + Gegenleistung"
          : "Gegenleistung ohne Karma-Ausgleich")
      : priceCaption(listing.category, listing.priceKarma);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Nicht möglich");
        return false;
      }
      bump();
      await refreshProfile();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nicht möglich");
      return false;
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
        <ListingVisual listing={listing} className="aspect-[4/3] w-full rounded-3xl" />
        <div>
          <p className="text-sm text-copper">
            {OFFER_TYPE_LABEL[listing.offerType]} · {CATEGORY_LABEL[listing.category]} · {STATUS_LABEL[listing.status]}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-fg">{listing.title}</h1>
          <p className="mt-3 text-muted">{listing.description}</p>
          <p className="mt-4 text-sm text-muted">
            {listing.placeLabel} · {listing.ownerName}
            {listing.trust != null ? ` · Vertrauen ${formatTrust(listing.trust)}` : ""}
          </p>
          <p className="mt-4 font-display text-2xl tabular-nums text-copper">
            {priceText}
          </p>
          {listing.exchangeTerms ? (
            <div className="mt-3 rounded-2xl border border-line bg-elev p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Gesuchte Gegenleistung</p>
              <p className="mt-1 text-sm text-fg">{listing.exchangeTerms}</p>
            </div>
          ) : null}
          {listing.handsCount > 0 ? <p className="mt-3 inline-flex rounded-full bg-forest/15 px-3 py-1 text-sm text-forest">Bereits durch {listing.handsCount} {listing.handsCount === 1 ? "Hand" : "Hände"} gegangen</p> : null}

          {(listing.offerType === "sell" || listing.offerType === "gift") && listing.category !== "sharing" && listing.status === "active" && !mine ? (
            <div className="mt-5">
              {isPending ? (
                <div className="h-11 w-40 animate-pulse rounded-lg bg-elev-2" />
              ) : user && profile?.isVerified ? (
                <Button disabled={busy} onClick={() => void run(() => tradeListing({ data: { id: listing.id } }))}>
                  {listing.category === "service" ? "Hilfe begleichen" : "Tauschen"}
                </Button>
              ) : user ? (
                <Link to="/konto" className="inline-flex h-11 items-center rounded-lg bg-forest px-4 text-sm font-medium text-paper">Zuerst ID Austria bestätigen</Link>
              ) : (
                <Link to="/login" className="inline-flex h-11 items-center rounded-lg bg-forest px-4 text-sm font-medium text-paper">
                  Anmelden zum Tauschen
                </Link>
              )}
              <p className="mt-2 text-sm text-subtle">Karma geht sofort an {listing.ownerName}.</p>
            </div>
          ) : null}


          {exchangeListing ? (
            <section className="mt-5 space-y-4 rounded-3xl border border-line bg-elev p-4">
              <div>
                <h2 className="font-display text-xl">Tauschvorschläge</h2>
                <p className="mt-1 text-sm text-subtle">
                  Kein Geldtransfer. {listing.offerType === "combined"
                    ? "Der Karma-Ausgleich geht nur bei beidseitiger Abschlussbestätigung vom anfragenden Mitglied an den Anbieter."
                    : "Beim direkten Tausch wird kein Karma bewegt."}
                </p>
              </div>

              {!mine && listing.status === "active" ? (
                !user ? (
                  <Link to="/login" className="inline-flex h-11 items-center rounded-lg bg-forest px-4 text-sm font-medium text-paper">
                    Anmelden zum Tauschen
                  </Link>
                ) : !profile?.isVerified ? (
                  <Link to="/konto" className="inline-flex h-11 items-center rounded-lg bg-forest px-4 text-sm font-medium text-paper">
                    Zuerst ID Austria bestätigen
                  </Link>
                ) : (
                  <form
                    className="space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void run(() => createTradeRequest({
                        data: { id: listing.id, offeredDescription },
                      })).then((success) => { if (success) setOfferedDescription(""); });
                    }}
                  >
                    <label className="block text-sm text-muted">
                      Was bietest du konkret als Gegenleistung?
                      <textarea
                        className={fieldClass + " mt-2 h-24 py-3"}
                        value={offeredDescription}
                        onChange={(event) => setOfferedDescription(event.target.value)}
                        minLength={8}
                        maxLength={400}
                        required
                        placeholder="Beschreibe deine Ware oder Hilfe."
                      />
                    </label>
                    <Button type="submit" disabled={busy}>Tauschvorschlag senden</Button>
                  </form>
                )
              ) : null}

              {tradeRequests.length ? (
                <div className="space-y-3">
                  {tradeRequests.map((request) => {
                    const isOwner = user?.id === request.ownerId;
                    const isRequester = user?.id === request.requesterId;
                    const involved = isOwner || isRequester;
                    const confirmedByMe = isOwner ? request.ownerConfirmed : request.requesterConfirmed;
                    const otherConfirmed = isOwner ? request.requesterConfirmed : request.ownerConfirmed;
                    if (!involved) return null;
                    return (
                      <article key={request.id} className="rounded-2xl border border-line bg-paper/30 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-fg">
                            {request.requesterName} bietet
                          </p>
                          <span className="rounded-full bg-elev-2 px-2 py-1 text-xs text-muted">
                            {request.status === "requested" ? "Offen" :
                              request.status === "accepted" ? "Angenommen" :
                              request.status === "rejected" ? "Abgelehnt" :
                              request.status === "cancelled" ? "Zurückgezogen" :
                              request.status === "completed" ? "Abgeschlossen" : "Streitfall"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-fg">{request.offeredDescription}</p>
                        {request.karmaAmount > 0 ? (
                          <p className="mt-2 text-sm text-copper">{formatKarma(request.karmaAmount)} Karma zusätzlich vom Anfragenden an den Anbieter</p>
                        ) : null}
                        {request.status === "accepted" ? (
                          <p className="mt-2 text-xs text-subtle">
                            Bestätigungen: Anbieter {request.ownerConfirmed ? "✓" : "offen"} · Anfragender {request.requesterConfirmed ? "✓" : "offen"}
                            {confirmedByMe
                              ? (otherConfirmed ? " · Beide Seiten haben bestätigt." : " · Du hast bereits bestätigt. Warte auf die Gegenseite.")
                              : ""}
                          </p>
                        ) : null}
                        {request.status === "disputed" ? (
                          <div className="mt-3 rounded-xl border border-copper/30 bg-elev p-3">
                            <p className="text-sm font-semibold text-copper">Unabhängige Schlichtung läuft</p>
                            {request.disputeReason ? <p className="mt-1 text-sm text-fg">{request.disputeReason}</p> : null}
                            <p className="mt-2 text-xs text-subtle">Sieben aktive, verifizierte Moderationspersonen aus der Region prüfen den Fall unabhängig. Eine Entscheidung ist frühestens mit vier Stimmen und mindestens zwei Dritteln Mehrheit möglich. Bis dahin bleiben Inserat und Karma gesperrt.</p>
                          </div>
                        ) : null}
                        {request.status === "completed" ? (
                          <p className="mt-2 text-sm text-forest">Beide Seiten haben bestätigt. Der Tausch ist abgeschlossen.</p>
                        ) : null}
                        {request.status === "requested" && isOwner ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button disabled={busy} onClick={() => void run(() => transitionTradeRequest({ data: { id: request.id, action: "accept" } }))}>Annehmen</Button>
                            <Button variant="ghost" disabled={busy} onClick={() => void run(() => transitionTradeRequest({ data: { id: request.id, action: "reject" } }))}>Ablehnen</Button>
                          </div>
                        ) : null}
                        {request.status === "requested" && isRequester ? (
                          <Button className="mt-3" variant="ghost" disabled={busy} onClick={() => void run(() => transitionTradeRequest({ data: { id: request.id, action: "cancel" } }))}>Vorschlag zurückziehen</Button>
                        ) : null}
                        {request.status === "accepted" && involved ? (
                          <div className="mt-3 space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {!confirmedByMe ? (
                                <Button disabled={busy} onClick={() => void run(() => confirmTradeRequest({ data: { id: request.id } }))}>Abschluss bestätigen</Button>
                              ) : null}
                            </div>
                            <form
                              className="space-y-2 rounded-xl border border-line p-3"
                              onSubmit={(event) => {
                                event.preventDefault();
                                void run(() => transitionTradeRequest({
                                  data: { id: request.id, action: "dispute", reason: disputeReason },
                                })).then((success) => { if (success) setDisputeReason(""); });
                              }}
                            >
                              <label className="block text-sm text-muted">
                                Problem melden – bitte konkret beschreiben
                                <textarea
                                  className={fieldClass + " mt-2 h-24 py-3"}
                                  value={disputeReason}
                                  onChange={(event) => setDisputeReason(event.target.value)}
                                  minLength={10}
                                  maxLength={1000}
                                  required
                                  placeholder="Was ist bei der Übergabe oder Vereinbarung schiefgelaufen?"
                                />
                              </label>
                              <p className="text-xs text-subtle">Die Begründung wird dem Schlichtungsfall und dem Inserat-Chat beigefügt. Eine Entscheidung braucht mindestens vier Stimmen und eine Zweidrittelmehrheit.</p>
                              <Button variant="ghost" type="submit" disabled={busy || disputeReason.trim().length < 10}>Streitfall eröffnen</Button>
                            </form>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ) : mine ? (
                <p className="text-sm text-muted">Noch keine Tauschvorschläge eingegangen.</p>
              ) : listing.status !== "active" ? (
                <p className="text-sm text-muted">Dieses Angebot ist derzeit nicht verfügbar.</p>
              ) : null}
            </section>
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

          {mine && listing.status === "active" ? (
            <p className="mt-5 text-sm text-muted">Das ist dein Inserat.</p>
          ) : null}
          {listing.status === "completed" && user ? <Button className="mt-4" variant="ghost" onClick={() => navigate({ to: "/inserat/neu", search: { reuse: listing.itemUuid } })}>Erneut im Kreislauf einstellen</Button> : null}

          {meetingPointUrl ? <a href={meetingPointUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm text-forest underline">Privaten Treffpunkt in what3words öffnen</a> : null}
          {detail.escrowPending ? <p className="mt-3 rounded-xl border border-line bg-elev-2 p-3 text-sm text-muted">Community-Treuhand ist aktiv. Eine verifizierte, aktive Moderationsperson begleitet die Freigabe.</p> : null}
          {profile && profile.moderatorRank > 0 && detail.escrowPending ? <Button className="mt-3" variant="ghost" disabled={busy} onClick={() => void run(() => releaseEscrow({ data: { id: listing.id } }))}>Treuhand freigeben</Button> : null}

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

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-line bg-elev p-4">
          <h2 className="font-display text-xl">Produkt-QR-Code</h2>
          <p className="mt-1 text-xs text-subtle">Artikelkennung: {listing.itemUuid}</p>
          <img className="mt-3 h-40 w-40 rounded-xl bg-white p-2" alt="QR-Code zum Produkt" src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrTarget)}`} />
          <Button className="mt-3" variant="ghost" onClick={() => window.print()}>QR-Code / Seite drucken</Button>
          <p className="mt-2 text-xs text-subtle">Der Code führt zur Produktseite. Eine automatische Wiederveröffentlichung per Scan ist in dieser Version noch nicht aktiviert.</p>
        </div>
        <div className="rounded-3xl border border-line bg-elev p-4">
          <h2 className="font-display text-xl">Kurz-Historie</h2>
          {detail.history.length ? <ol className="mt-3 space-y-3">{detail.history.map((entry, index) => <li key={`${entry.createdAt}-${index}`} className="border-l-2 border-forest/40 pl-3"><p className="text-sm text-fg">{entry.placeLabel}</p><p className="text-xs text-subtle">{formatWhen(entry.createdAt)} · {entry.eventKind === "listed" ? "Eingestellt" : entry.eventKind === "gifted" ? "Verschenkt" : entry.eventKind === "loaned" ? "Verliehen" : "Weitergegeben"}</p></li>)}</ol> : <p className="mt-2 text-sm text-muted">Noch keine Stationen dokumentiert.</p>}
        </div>
      </section>

      <ListingConversation
        listingId={listing.id}
        ownerId={listing.userId}
        currentUserId={user?.id ?? null}
        initialRequesterId={conversation}
      />

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
