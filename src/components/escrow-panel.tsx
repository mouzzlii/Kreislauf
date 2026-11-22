import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { getEscrowSummary, voteEscrow, type EscrowSummary } from "@/features/kreislauf/api";

export function EscrowPanel({ listingId }: { listingId: string }) {
  const [summary, setSummary] = useState<EscrowSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    getEscrowSummary({ data: { id: listingId } }).then((value) => { if (!cancelled) setSummary(value); })
      .catch(() => { if (!cancelled) setError("Treuhandstatus konnte nicht geladen werden."); });
    return () => { cancelled = true; };
  }, [listingId]);
  if (!summary) return error ? <p className="mt-3 text-sm text-copper">{error}</p> : null;
  if (!summary.status) return null;
  async function cast(vote: "approve" | "reject") {
    setBusy(true); setError("");
    try {
      const result = await voteEscrow({ data: { id: listingId, vote } });
      if ("ok" in result) {
        if (!result.ok) setError(result.error);
        else setSummary(await getEscrowSummary({ data: { id: listingId } }));
      } else setSummary(await getEscrowSummary({ data: { id: listingId } }));
    } catch { setError("Stimme konnte nicht gespeichert werden."); }
    finally { setBusy(false); }
  }
  return <div className="mt-4 rounded-2xl border border-line bg-elev-2 p-4">
    <h3 className="font-display text-lg">Community-Treuhand</h3>
    {summary.status === "pending" ? <>
      {summary.votes >= 4 && summary.approvals >= Math.ceil(summary.votes * 2 / 3) ? (
        <p className="mt-1 text-sm text-copper">Die Community-Mehrheit hat zugestimmt. Die hochwertige Treuhand bleibt aber bewusst gesperrt: Erst wenn beide Tauschparteien die Übergabe und den Empfang bestätigen und ein dokumentierter Streitfallprozess verfügbar ist, dürfen Punkte übertragen werden. Es wurden noch keine Punkte freigegeben.</p>
      ) : <p className="mt-1 text-sm text-muted">Abstimmung läuft: {summary.votes} Stimmen, davon {summary.approvals} Freigaben und {summary.rejections} Ablehnungen. Mindestens 4 Stimmen sind erforderlich; anschließend entscheidet die Zweidrittelmehrheit.</p>}
      {summary.canVote && !summary.hasVoted ? <div className="mt-3 flex flex-wrap gap-2">
        <Button disabled={busy} onClick={() => void cast("approve")}>Freigeben</Button>
        <Button variant="ghost" disabled={busy} onClick={() => void cast("reject")}>Ablehnen</Button>
      </div> : summary.hasVoted ? <p className="mt-2 text-xs text-subtle">Deine Stimme ist bereits abgegeben und kann nicht geändert werden.</p> : null}
      <p className="mt-2 text-xs text-subtle">{summary.assigned} Moderationspersonen zugeteilt · Ab 4 abgegebenen Stimmen gilt die Zweidrittelmehrheit der abgegebenen Stimmen.</p>
    </> : summary.status === "released" ?
      <p className="mt-1 text-sm text-forest">Die Treuhand wurde nach Mehrheitsbeschluss freigegeben.</p> :
      summary.status === "disputed" ?
      <p className="mt-1 text-sm text-copper">Die erforderliche Mehrheit hat abgelehnt. Das Inserat bleibt gesperrt, bis der Konflikt durch eine zuständige Stelle geklärt wurde.</p> : null}
    {summary.status === "cancelled" ? <p className="mt-1 text-sm text-muted">Der Vorgang wurde beendet. Die offene Treuhand-Abstimmung ist geschlossen.</p> : null}
    {error ? <p className="mt-2 text-sm text-copper">{error}</p> : null}
  </div>;
}
