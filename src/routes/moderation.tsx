import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button, fieldClass } from "@/components/ui";
import {
  getMyTradeDisputes,
  voteTradeDispute,
  type TradeDisputeCase,
} from "@/features/kreislauf/api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled } from "@/lib/auth/client";

export const Route = createFileRoute("/moderation")({
  component: ModerationPage,
});

function ModerationPage() {
  const { user, isPending } = useCurrentUserState();
  const userId = user?.id;
  const [cases, setCases] = useState<TradeDisputeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    if (!userId) {
      setCases([]);
      setLoading(false);
      return;
    }
    setRefreshing(true);
    try {
      const result = await getMyTradeDisputes();
      setCases(result);
      setError(null);
    } catch {
      setError("Zugeordnete Schlichtungsfälle konnten nicht geladen werden.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!userId) {
      setCases([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const result = await getMyTradeDisputes();
        if (!cancelled) {
          setCases(result);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Zugeordnete Schlichtungsfälle konnten nicht geladen werden.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    document.addEventListener("visibilitychange", load);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, [userId]);

  async function castVote(item: TradeDisputeCase, decision: "complete" | "cancel") {
    const note = notes[item.id]?.trim() ?? "";
    if (note.length < 10 || note.length > 500) {
      setError("Die Begründung muss 10 bis 500 Zeichen enthalten.");
      return;
    }
    setBusyId(item.id);
    setError(null);
    try {
      const result = await voteTradeDispute({ data: { id: item.id, decision, note } });
      if ("ok" in result && result.ok === false) {
        setError(result.error ?? "Abstimmung konnte nicht gespeichert werden.");
      } else {
        setNotes((current) => ({ ...current, [item.id]: "" }));
        await refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Abstimmung konnte nicht gespeichert werden.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Shell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-copper">Unabhängige regionale Schlichtung</p>
          <h1 className="mt-1 font-display text-4xl text-fg">Moderation</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Jeder Streitfall wird sieben aktiven, verifizierten Moderationspersonen aus derselben Region zugeteilt. Käufer und Anbieter stimmen nicht mit.
          </p>
        </div>
        {user ? (
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            aria-label="Schlichtungsfälle aktualisieren"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-elev text-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        ) : null}
      </div>

      <section className="mt-5 rounded-2xl border border-line bg-elev p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-fg">
          <ShieldCheck className="h-4 w-4 text-forest" />
          Abstimmungsregeln
        </div>
        <p className="mt-2 text-sm text-muted">
          Mindestens vier Stimmen und mindestens zwei Drittel für dieselbe Entscheidung sind nötig. Bei sieben Stimmen ohne Zweidrittelmehrheit bleibt der Fall gesperrt und muss weiter geprüft werden. Jede Person kann genau einmal abstimmen; Stimmen sind nicht änderbar.
        </p>
      </section>

      {isPending || loading ? (
        <p className="mt-6 text-sm text-muted" role="status">Zuteilungen werden geladen …</p>
      ) : !user && authEnabled ? (
        <section className="mt-6 rounded-2xl border border-line bg-elev p-5">
          <p className="font-medium text-fg">Bitte anmelden</p>
          <p className="mt-1 text-sm text-muted">Moderationsfälle sind nur für zugeteilte Moderationspersonen sichtbar.</p>
          <Link to="/login" className="mt-4 inline-flex h-11 items-center rounded-xl bg-forest px-4 text-sm font-semibold text-paper">Anmelden</Link>
        </section>
      ) : error ? (
        <p className="mt-6 rounded-xl border border-copper/30 bg-copper/5 p-4 text-sm text-muted" role="alert">{error}</p>
      ) : cases.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-line bg-elev p-8 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-subtle" aria-hidden="true" />
          <p className="mt-3 font-medium text-fg">Keine offenen Zuteilungen</p>
          <p className="mt-1 text-sm text-muted">Dir sind derzeit keine offenen Streitfälle zur unabhängigen Prüfung zugeteilt.</p>
        </section>
      ) : (
        <div className="mt-5 space-y-4">
          <p className="text-xs text-muted">{cases.length} offene Schlichtungsfälle</p>
          {cases.map((item) => (
            <article key={item.id} className="rounded-2xl border border-line bg-elev p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl text-fg">{item.listingTitle}</h2>
                <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                  {item.votes} / 7 Stimmen
                </span>
              </div>
              <p className="mt-1 text-xs text-subtle">Anbieter: {item.ownerName} · Anfragende Person: {item.requesterName}</p>
              <div className="mt-3 rounded-xl border border-line bg-paper/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Streitfallbegründung</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-fg">{item.reason}</p>
              </div>
              <div className="mt-3 rounded-xl border border-line bg-paper/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Angebot der anfragenden Person</p>
                <p className="mt-1 text-sm text-fg">{item.offeredDescription}</p>
                {item.karmaAmount > 0 ? (
                  <p className="mt-2 text-sm text-copper">{item.karmaAmount} Karma wären zusätzlich von der anfragenden Person an den Anbieter zu übertragen.</p>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs text-muted">
                <div className="rounded-lg bg-paper/30 p-2">Abschluss: {item.completeVotes}</div>
                <div className="rounded-lg bg-paper/30 p-2">Abbruch: {item.cancelVotes}</div>
              </div>
              {item.myVote ? (
                <p className="mt-3 rounded-lg bg-forest/10 p-3 text-sm text-forest">
                  Deine Stimme: {item.myVote === "complete" ? "Tausch abschließen" : "Tausch abbrechen"}. Sie ist gespeichert und kann nicht geändert werden.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  <label className="block text-sm text-muted">
                    Deine unabhängige Begründung (10–500 Zeichen)
                    <textarea
                      className={fieldClass + " mt-2 h-24 py-3"}
                      value={notes[item.id] ?? ""}
                      onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                      minLength={10}
                      maxLength={500}
                      placeholder="Begründe anhand der Vereinbarung und der dokumentierten Informationen."
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={busyId === item.id || (notes[item.id]?.trim().length ?? 0) < 10} onClick={() => void castVote(item, "complete")}>
                      Tausch abschließen
                    </Button>
                    <Button variant="ghost" disabled={busyId === item.id || (notes[item.id]?.trim().length ?? 0) < 10} onClick={() => void castVote(item, "cancel")}>
                      Tausch abbrechen
                    </Button>
                  </div>
                  <p className="text-xs text-subtle">Die Entscheidung wirkt erst, wenn mindestens vier Stimmen und zwei Drittel Mehrheit erreicht sind. Bis dahin wird weder Karma bewegt noch das Inserat freigegeben.</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}
