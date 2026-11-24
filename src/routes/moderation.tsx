import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui";
import { getMyModerationCases, type ModerationInbox } from "@/features/kreislauf/api";
import { formatKarma } from "@/features/kreislauf/format";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/moderation")({
  component: ModerationInboxPage,
});

function ModerationInboxPage() {
  const { user, isPending } = useCurrentUserState();
  const [inbox, setInbox] = useState<ModerationInbox | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isPending) {
      setInbox(null);
      setLoading(true);
      setError("");
      return;
    }
    if (!user) {
      setInbox(null);
      setLoading(false);
      setError("");
      return;
    }
    setInbox(null);
    setLoading(true);
    setError("");
    let cancelled = false;
    let requestActive = false;
    let hasLoaded = false;
    const refresh = async () => {
      if (cancelled || requestActive || document.visibilityState !== "visible") return;
      requestActive = true;
      setRefreshing(true);
      try {
        const result = await getMyModerationCases({ data: {} });
        if (!cancelled) {
          setInbox(result);
          setError("");
          hasLoaded = true;
        }
      } catch {
        if (!cancelled && !hasLoaded) setError("Treuhand-Fälle konnten nicht geladen werden.");
      } finally {
        requestActive = false;
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 30_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [user?.id, isPending, refreshKey]);

  return (
    <Shell>
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">Gemeinschaftliche Treuhand</p>
            <h1 className="mt-2 font-display text-4xl text-fg">Moderations-Posteingang</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Hier erscheinen ausschließlich offene Fälle, die dir serverseitig zugeteilt wurden.
              Abstimmungen und Streitfallentscheidungen bleiben an das jeweilige Inserat gebunden.
            </p>
          </div>
          <Button variant="ghost" disabled={refreshing || loading} onClick={() => setRefreshKey((value) => value + 1)}>
            Aktualisieren
          </Button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-line bg-elev p-6 text-sm text-muted">Zugewiesene Fälle werden geladen …</div>
        ) : error ? (
          <div className="rounded-3xl border border-copper/25 bg-copper/5 p-6 text-sm text-copper">{error}</div>
        ) : !inbox?.isModerator ? (
          <div className="rounded-3xl border border-line bg-elev p-6">
            <h2 className="font-semibold text-fg">Kein Moderationszugang</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Dieser Bereich ist nur für verifizierte, aktive Moderationspersonen mit einer serverseitigen Fallzuweisung vorgesehen.
            </p>
          </div>
        ) : inbox.cases.length === 0 ? (
          <div className="rounded-3xl border border-line bg-elev p-6">
            <h2 className="font-semibold text-fg">Keine offenen Fälle</h2>
            <p className="mt-2 text-sm text-muted">Dir sind derzeit keine offenen Treuhand- oder Streitfälle zugeteilt.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {inbox.cases.map((item) => (
              <article key={item.id} className="rounded-3xl border border-line bg-elev p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                      {item.status === "disputed" ? "Streitfall" : "Abstimmung offen"}
                    </p>
                    <h2 className="mt-1 font-display text-2xl text-fg">{item.listingTitle}</h2>
                    <p className="mt-1 text-sm text-muted">{item.reason || "Treuhandvorgang"}</p>
                    {item.status === "disputed" && item.disputeReason ? (
                      <p className="mt-2 rounded-xl bg-copper/10 p-3 text-sm text-copper">{item.disputeReason}</p>
                    ) : null}
                  </div>
                  <div className="rounded-xl bg-paper px-3 py-2 text-right">
                    <p className="text-xs text-subtle">Betrag</p>
                    <p className="font-semibold tabular-nums text-fg">{formatKarma(item.amountKarma)}</p>
                  </div>
                </div>
                {item.status === "pending" ? (
                  <p className="mt-3 text-sm text-muted">
                    {item.votes} von {item.assigned} Stimmen · {item.approvals} Freigaben · {item.rejections} Ablehnungen
                    {item.hasVoted ? " · Deine Stimme ist gespeichert" : " · Deine Stimme steht aus"}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted">
                    Streitfallentscheidung: {item.resolutionVotes} Stimmen · {item.resolutionReleases} Freigaben · {item.resolutionRefunds} Erstattungen
                    {item.hasResolutionVote ? " · Deine Entscheidung ist gespeichert" : " · Deine Entscheidung steht aus"}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-subtle">
                    Erstellt {new Date(item.createdAt).toLocaleString("de-AT")}
                  </p>
                  <Link
                    to="/inserat/$listingId"
                    params={{ listingId: item.listingId }}
                    className="inline-flex min-h-11 items-center rounded-xl bg-forest px-4 text-sm font-semibold text-white hover:bg-forest/90"
                  >
                    Fall im Inserat öffnen
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
