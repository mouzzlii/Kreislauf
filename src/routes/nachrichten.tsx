import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, RefreshCw, Search } from "lucide-react";
import { Shell } from "@/components/shell";
import {
  getMyListingConversations,
  type ListingConversationSummary,
} from "@/features/kreislauf/api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled } from "@/lib/auth/client";
import { filterListingConversations, type ConversationFilter } from "@/features/kreislauf/conversation-filter";

export const Route = createFileRoute("/nachrichten")({
  component: MessagesPage,
});

function MessagesPage() {
  const { user, isPending } = useCurrentUserState();
  const userId = user?.id;
  const [threads, setThreads] = useState<ListingConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");

  useEffect(() => {
    if (!userId) {
      setThreads([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      setRefreshing(true);
      try {
        const result = await getMyListingConversations();
        if (!cancelled) {
          setThreads(result);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Nachrichten konnten gerade nicht geladen werden.");
      } finally {
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
  }, [userId]);

  const unread = threads.reduce((total, item) => total + item.unreadCount, 0);
  const visibleThreads = filterListingConversations(threads, query, filter);

  return (
    <Shell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-copper">Deine Unterhaltungen</p>
          <h1 className="mt-1 font-display text-4xl text-fg">Nachrichten</h1>
          <p className="mt-2 text-sm text-muted">
            Alle Gespräche bleiben direkt mit dem jeweiligen Inserat und Tauschvorgang verbunden.
          </p>
        </div>
        {user ? (
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setRefreshing(true);
              void getMyListingConversations()
                .then(setThreads)
                .then(() => setError(null))
                .catch(() => setError("Nachrichten konnten gerade nicht geladen werden."))
                .finally(() => {
                  setLoading(false);
                  setRefreshing(false);
                });
            }}
            disabled={refreshing}
            aria-label="Nachrichten aktualisieren"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-elev text-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        ) : null}
      </div>

      {isPending || loading ? (
        <p className="mt-6 text-sm text-muted" role="status">Nachrichten werden geladen …</p>
      ) : !user && authEnabled ? (
        <section className="mt-6 rounded-2xl border border-line bg-elev p-5">
          <p className="font-medium text-fg">Bitte anmelden</p>
          <p className="mt-1 text-sm text-muted">Deine Unterhaltungen sind nur nach der Anmeldung sichtbar.</p>
          <Link to="/login" className="mt-4 inline-flex h-11 items-center rounded-xl bg-forest px-4 text-sm font-semibold text-paper">Anmelden</Link>
        </section>
      ) : error ? (
        <p className="mt-6 rounded-xl border border-copper/30 bg-copper/5 p-4 text-sm text-muted" role="alert">{error}</p>
      ) : threads.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-line bg-elev p-8 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-subtle" aria-hidden="true" />
          <p className="mt-3 font-medium text-fg">Noch keine Unterhaltungen</p>
          <p className="mt-1 text-sm text-muted">Wenn du zu einem Inserat eine Nachricht erhältst oder selbst eine Frage stellst, erscheint das Gespräch hier.</p>
          <Link to="/" className="mt-4 inline-flex h-11 items-center rounded-xl bg-forest px-4 text-sm font-semibold text-paper">Zum Marktplatz</Link>
        </section>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-full border border-line bg-elev px-3 py-1.5">{threads.length} Gespräche</span>
            <span className="rounded-full border border-line bg-elev px-3 py-1.5">{unread} ungelesen</span>
          </div>
          <div className="mt-4 space-y-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
              <span className="sr-only">Unterhaltungen durchsuchen</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Person, Inserat oder Nachricht suchen …"
                className="h-12 w-full rounded-xl border border-line bg-elev pl-10 pr-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-forest focus:ring-2 focus:ring-forest/20"
              />
            </label>
            <div className="flex flex-wrap gap-2" aria-label="Unterhaltungen filtern">
              <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")} className={filter === "all" ? "rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper" : "rounded-full border border-line bg-elev px-4 py-2 text-xs text-muted"}>Alle ({threads.length})</button>
              <button type="button" aria-pressed={filter === "unread"} onClick={() => setFilter("unread")} className={filter === "unread" ? "rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper" : "rounded-full border border-line bg-elev px-4 py-2 text-xs text-muted"}>Ungelesen ({unread})</button>
            </div>
          </div>
          {visibleThreads.length === 0 ? (
            <p className="mt-4 rounded-xl border border-line bg-elev p-5 text-sm text-muted" role="status">
              {filter === "unread" && unread === 0 ? "Du hast keine ungelesenen Nachrichten." : "Keine Unterhaltung passt zu deiner Suche."}
            </p>
          ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-elev">
            {visibleThreads.map((thread) => (
              <li key={`${thread.listingId}:${thread.requesterId}`}>
                <Link
                  to="/inserat/$listingId"
                  params={{ listingId: thread.listingId }}
                  search={{ conversation: thread.requesterId }}
                  className="block px-4 py-4 transition hover:bg-elev-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-fg">{thread.otherName}</p>
                      <p className="mt-0.5 truncate text-xs text-copper">{thread.listingTitle}</p>
                    </div>
                    {thread.unreadCount > 0 ? (
                      <span className="shrink-0 rounded-full bg-forest px-2.5 py-1 text-xs font-semibold text-paper">{thread.unreadCount} neu</span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{thread.lastMessage || "Unterhaltung geöffnet"}</p>
                  <p className="mt-2 text-xs text-subtle">{new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(thread.updatedAt))}</p>
                </Link>
              </li>
            ))}
          </ul>
          )}
        </>
      )}
    </Shell>
  );
}
