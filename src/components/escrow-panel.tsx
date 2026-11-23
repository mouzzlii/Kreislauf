import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { getEscrowSummary, voteEscrow, confirmHighValueEscrow, openHighValueDispute, voteEscrowResolution, type EscrowSummary } from "@/features/kreislauf/api";

export function EscrowPanel({ listingId }: { listingId: string }) {
  const [summary, setSummary] = useState<EscrowSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  useEffect(() => {
    let cancelled = false;
    let loading = false;
    let hasLoaded = false;
    const refresh = () => {
      if (cancelled || loading || document.visibilityState !== "visible") return;
      loading = true;
      getEscrowSummary({ data: { id: listingId } })
        .then((value) => {
          if (!cancelled) {
            setSummary(value);
            setError("");
            hasLoaded = true;
          }
        })
        .catch(() => {
          if (!cancelled && !hasLoaded) setError("Treuhandstatus konnte nicht geladen werden.");
        })
        .finally(() => { loading = false; });
    };
    refresh();
    const interval = window.setInterval(refresh, 15_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [listingId]);
  if (!summary) return error ? <p className="mt-3 text-sm text-copper">{error}</p> : null;
  if (!summary.status) return null;
  async function runAction(action: () => Promise<{ ok: boolean; error?: string }>, fallback: string) {
    setBusy(true); setError("");
    try {
      const result = await action();
      if (!result.ok) setError(result.error ?? fallback);
      else setSummary(await getEscrowSummary({ data: { id: listingId } }));
    } catch { setError(fallback); }
    finally { setBusy(false); }
  }
  async function cast(vote: "approve" | "reject") {
    setBusy(true); setError("");
    try {
      const result = await voteEscrow({ data: { id: listingId, vote } });
      if ("ok" in result && !result.ok) setError(result.error);
      else setSummary(await getEscrowSummary({ data: { id: listingId } }));
    } catch { setError("Stimme konnte nicht gespeichert werden."); }
    finally { setBusy(false); }
  }
  return <div className="mt-4 rounded-2xl border border-line bg-elev-2 p-4">
    <h3 className="font-display text-lg">Community-Treuhand</h3>
    {summary.reason === "Hochwertiges Tauschgeschäft" && summary.fundsStatus === "held" ? (
      <div className="mt-2 rounded-xl bg-copper/10 p-3 text-sm">
        <p><strong>{summary.amountKarma.toLocaleString("de-AT")} Karma</strong> sind bis zur Entscheidung tatsächlich reserviert.</p>
        <p className="mt-1 text-muted">Die Punkte werden erst nach Community-Freigabe und Bestätigung beider Tauschparteien übertragen.</p>
      </div>
    ) : null}
    {summary.reason === "Hochwertiges Tauschgeschäft" && summary.fundsStatus === "not_applicable" && summary.status === "pending" ? (
      <p className="mt-2 text-sm text-copper">Dieser ältere Treuhandfall besitzt noch keine nachweisbare Karma-Reservierung. Er bleibt gesperrt und kann nicht automatisch abgeschlossen werden.</p>
    ) : null}
    {summary.status === "pending" ? <>
      {summary.votes >= 4 && summary.approvals >= Math.ceil(summary.votes * 2 / 3) ? (
        <p className="mt-2 text-sm text-copper">Die Community hat zugestimmt. Die Punkte werden noch nicht freigegeben: Beide Parteien müssen Übergabe und Empfang bestätigen.</p>
      ) : summary.votes >= 4 ? (
        <p className="mt-1 text-sm text-muted">Bisher keine Zweidrittelmehrheit: {summary.votes} Stimmen, davon {summary.approvals} Freigaben und {summary.rejections} Ablehnungen.</p>
      ) : <p className="mt-1 text-sm text-muted">Abstimmung läuft: {summary.votes} Stimmen, davon {summary.approvals} Freigaben und {summary.rejections} Ablehnungen. Mindestens 4 Stimmen sind erforderlich.</p>}
      {summary.canVote && !summary.hasVoted ? <div className="mt-3 flex flex-wrap gap-2">
        <Button disabled={busy} onClick={() => void cast("approve")}>Freigeben</Button>
        <Button variant="ghost" disabled={busy} onClick={() => void cast("reject")}>Ablehnen</Button>
      </div> : summary.hasVoted ? <p className="mt-2 text-xs text-subtle">Deine Moderationsstimme ist bereits abgegeben.</p> : null}
      {summary.reason === "Hochwertiges Tauschgeschäft" && summary.fundsStatus === "held" ? <>
        <p className="mt-3 text-sm text-muted">Übergabe: {summary.sellerConfirmed ? "Anbietende Person bestätigt" : "Anbietende Person offen"} · Empfang: {summary.buyerConfirmed ? "Kaufende Person bestätigt" : "Kaufende Person offen"}.</p>
        {summary.canConfirm ? <Button className="mt-2" disabled={busy} onClick={() => void runAction(
          () => confirmHighValueEscrow({ data: { id: listingId } }),
          "Übergabe konnte nicht bestätigt werden."
        )}>{summary.isBuyer ? "Empfang bestätigen" : "Übergabe bestätigen"}</Button> :
          (summary.isBuyer && summary.buyerConfirmed) || (summary.isSeller && summary.sellerConfirmed)
            ? <p className="mt-2 text-xs text-subtle">Deine Bestätigung ist gespeichert.</p> : null}
        {summary.canOpenDispute ? <div className="mt-3 space-y-2">
          <label className="block text-sm text-muted" htmlFor="escrow-dispute-reason">Streitfall melden</label>
          <textarea id="escrow-dispute-reason" className="min-h-20 w-full rounded-xl border border-line bg-paper p-3 text-sm" value={disputeReason} onChange={(event) => setDisputeReason(event.target.value)} placeholder="Beschreibe das Problem (mindestens 10 Zeichen)." />
          <Button variant="ghost" disabled={busy || disputeReason.trim().length < 10} onClick={() => void runAction(
            () => openHighValueDispute({ data: { id: listingId, reason: disputeReason } }),
            "Streitfall konnte nicht eröffnet werden."
          )}>Streitfall eröffnen</Button>
        </div> : null}
      </> : null}
      <p className="mt-2 text-xs text-subtle">{summary.assigned} Moderationspersonen zugeteilt · Zweidrittelmehrheit ab mindestens 4 Stimmen.</p>
    </> : null}
    {summary.status === "disputed" ? <>
      <p className="mt-2 text-sm text-copper">Streitfall offen: {summary.disputeReason || "Die Community-Abstimmung hat keine Freigabe ergeben."} Das Inserat bleibt gesperrt, bis die unabhängige Entscheidung abgeschlossen ist.</p>
      <p className="mt-1 text-sm text-muted">Unabhängige Moderationsentscheidung: {summary.resolutionVotes} Stimmen, {summary.resolutionReleases} für Freigabe und {summary.resolutionRefunds} für Erstattung.</p>
      {summary.canResolve ? <div className="mt-3 space-y-2">
        <label className="block text-sm text-muted" htmlFor="escrow-resolution-note">Begründung deiner Moderationsentscheidung</label>
        <textarea id="escrow-resolution-note" className="min-h-20 w-full rounded-xl border border-line bg-paper p-3 text-sm" value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} placeholder="Begründe Freigabe oder Erstattung (mindestens 10 Zeichen)." />
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy || resolutionNote.trim().length < 10} onClick={() => void runAction(
            () => voteEscrowResolution({ data: { id: listingId, decision: "release", note: resolutionNote } }),
            "Entscheidung konnte nicht gespeichert werden."
          )}>Freigabe empfehlen</Button>
          <Button variant="ghost" disabled={busy || resolutionNote.trim().length < 10} onClick={() => void runAction(
            () => voteEscrowResolution({ data: { id: listingId, decision: "refund", note: resolutionNote } }),
            "Entscheidung konnte nicht gespeichert werden."
          )}>Erstattung empfehlen</Button>
        </div>
      </div> : summary.hasResolutionVote ? <p className="mt-2 text-xs text-subtle">Deine Streitfallstimme ist bereits gespeichert.</p> : null}
      {summary.assigned > 0 && summary.resolutionVotes >= summary.assigned
        && Math.max(summary.resolutionReleases, summary.resolutionRefunds) < Math.ceil(summary.resolutionVotes * 2 / 3)
        ? <p className="mt-2 text-sm text-copper">Alle zugeteilten Stimmen sind abgegeben, aber es gibt keine Zweidrittelmehrheit. Die Punkte bleiben reserviert und das Inserat gesperrt; eine manuelle Klärung außerhalb der Plattform ist erforderlich.</p>
        : null}
      <p className="mt-2 text-xs text-subtle">{summary.assigned} zugeteilte Moderationspersonen · mindestens 4 Stimmen und Zweidrittelmehrheit.</p>
    </> : null}
    {summary.status === "released" ? <p className="mt-2 text-sm text-forest">Treuhand abgeschlossen. Die reservierten Punkte wurden an die anbietende Person übertragen.</p> : null}
    {summary.status === "refunded" ? <p className="mt-2 text-sm text-muted">Streitfall abgeschlossen. Die reservierten Punkte wurden an die kaufende Person zurückerstattet und das Inserat wieder freigegeben.</p> : null}
    {summary.status === "cancelled" ? <p className="mt-2 text-sm text-muted">Der Vorgang wurde beendet. Die offene Treuhand-Abstimmung ist geschlossen.</p> : null}
    {error ? <p className="mt-2 text-sm text-copper">{error}</p> : null}
  </div>;
}
