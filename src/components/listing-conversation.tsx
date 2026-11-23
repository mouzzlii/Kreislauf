import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getListingMessages, getListingThreads, sendListingMessage, type ListingMessage, type ListingThread } from "@/features/kreislauf/api";
import { Button, fieldClass } from "@/components/ui";

export function ListingConversation({
  listingId,
  ownerId,
  currentUserId,
  initialRequesterId,
}: {
  listingId: string;
  ownerId: string;
  currentUserId: string | null;
  initialRequesterId?: string;
}) {
  const isOwner = currentUserId === ownerId;
  const [threads, setThreads] = useState<ListingThread[]>([]);
  const [activeRequester, setActiveRequester] = useState(initialRequesterId ?? "");
  const [messages, setMessages] = useState<ListingMessage[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUserId || !isOwner) return;
    let cancelled = false;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      getListingThreads({ data: { id: listingId } }).then((items) => {
        if (cancelled) return;
        setThreads(items);
        setActiveRequester((current) => initialRequesterId || current || items[0]?.requesterId || "");
      }).catch(() => { if (!cancelled) setError("Unterhaltungen konnten nicht geladen werden."); });
    };
    refresh();
    const interval = window.setInterval(refresh, 15_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [currentUserId, initialRequesterId, isOwner, listingId]);

  const requesterId = isOwner ? activeRequester : currentUserId ?? "";

  useEffect(() => {
    if (!currentUserId || !requesterId) { setMessages([]); return; }
    let cancelled = false;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      getListingMessages({ data: { id: listingId, requesterId } })
        .then((items) => {
          if (cancelled) return;
          setMessages((current) => {
            const currentLast = current[current.length - 1]?.id;
            const nextLast = items[items.length - 1]?.id;
            return current.length === items.length && currentLast === nextLast ? current : items;
          });
        })
        .catch(() => { if (!cancelled) setError("Nachrichten konnten nicht geladen werden."); });
    };
    refresh();
    const interval = window.setInterval(refresh, 8_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [currentUserId, listingId, requesterId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requesterId || !body.trim()) return;
    setBusy(true);
    setError("");
    try {
      const result = await sendListingMessage({ data: { id: listingId, requesterId: isOwner ? requesterId : undefined, body } });
      if (!result.ok) {
        setError(result.error);
      } else {
        setBody("");
        const items = await getListingMessages({ data: { id: listingId, requesterId } });
        setMessages(items);
        if (isOwner) setThreads(await getListingThreads({ data: { id: listingId } }));
      }
    } catch {
      setError("Nachricht konnte nicht gesendet werden.");
    } finally {
      setBusy(false);
    }
  }

  if (!currentUserId) {
    return <section className="mt-8 rounded-3xl border border-line bg-elev p-5">
      <h2 className="font-display text-2xl">Nachricht zum Inserat</h2>
      <p className="mt-2 text-sm text-muted">Melde dich an, um direkt mit dem Anbieter über dieses Inserat zu schreiben.</p>
      <Link to="/login" className="mt-3 inline-flex h-10 items-center rounded-lg bg-forest px-4 text-sm font-medium text-paper">Anmelden</Link>
    </section>;
  }

  return <section className="mt-8 rounded-3xl border border-line bg-elev p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="font-display text-2xl">Nachrichten zum Inserat</h2>
        <p className="mt-1 text-xs text-subtle">Der Chat bleibt mit diesem Inserat und dem Tauschvorgang verbunden.</p>
      </div>
      <span className="rounded-full bg-forest/10 px-3 py-1 text-xs text-forest">Inserat-Chat</span>
    </div>
    {isOwner && threads.length > 0 ? <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      {threads.map((thread) => <button key={thread.requesterId} type="button" onClick={() => setActiveRequester(thread.requesterId)}
        className={`shrink-0 rounded-full px-3 py-2 text-sm ${activeRequester === thread.requesterId ? "bg-forest text-paper" : "border border-line text-fg"}`}>
        {thread.requesterName}
      </button>)}
    </div> : null}
    {isOwner && threads.length === 0 ? <p className="mt-4 text-sm text-muted">Noch keine Anfragen zu diesem Inserat.</p> : null}
    {!isOwner || activeRequester ? <>
      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-2xl bg-elev-2 p-3">
        {messages.length === 0 ? <p className="py-5 text-center text-sm text-muted">Noch keine Nachrichten. Du kannst hier die erste Nachricht senden.</p> : messages.map((message) =>
          <div key={message.id} className={message.kind === "system" ? "mx-auto max-w-[95%] rounded-xl bg-forest/10 px-3 py-2 text-center text-xs text-muted" : `max-w-[88%] rounded-2xl px-3 py-2 text-sm ${message.isMine ? "ml-auto bg-forest text-paper" : "bg-elev text-fg"}`}>
            {message.kind === "user" ? <p className="mb-1 text-[11px] opacity-70">{message.isMine ? "Du" : message.senderName}</p> : null}
            <p className="whitespace-pre-wrap break-words">{message.body}</p>
          </div>)}
      </div>
      <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
        <textarea className={`${fieldClass} min-h-12 flex-1 py-3`} rows={2} maxLength={2000} value={body}
          onChange={(event) => setBody(event.target.value)} placeholder="Nachricht zum Inserat schreiben…" />
        <Button type="submit" disabled={busy || !body.trim() || !requesterId}>{busy ? "Sendet…" : "Senden"}</Button>
      </form>
    </> : null}
    {error ? <p className="mt-2 text-sm text-copper">{error}</p> : null}
  </section>;
}
