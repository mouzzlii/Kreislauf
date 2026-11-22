import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Field, fieldClass } from "@/components/ui";
import { getBoard, getMine, getMyListings, setListingAvailability, updateProfile, verifyWithIdAustria } from "@/features/kreislauf/api";
import { useKreislauf } from "@/features/kreislauf/use-kreislauf";
import { formatKarma, formatTrust, formatWhen } from "@/features/kreislauf/format";
import { DEFAULT_REGION, type Board, type LedgerEntry, type Listing, type Profile } from "@/features/kreislauf/types";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/konto")({
  loader: () => getBoard({ data: { regionId: DEFAULT_REGION } }),
  component: AccountPage,
});

function AccountPage() {
  const initial = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const { profile, refreshProfile, regionId, hydrated, version, bump } = useKreislauf();
  const [board, setBoard] = useState<Board>(initial);
  const [mine, setMine] = useState<LedgerEntry[] | null>(null);
  const [myListings, setMyListings] = useState<Listing[] | null>(null);
  const [listingBusy, setListingBusy] = useState<string | null>(null);
  const [listingMessage, setListingMessage] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (profile) setName(profile.username);
  }, [profile]);

  useEffect(() => {
    if (!hydrated) return;
    if (regionId === initial.region.id && version === 0) return;
    let cancel = false;
    getBoard({ data: { regionId } }).then((next) => {
      if (!cancel) setBoard(next);
    });
    return () => {
      cancel = true;
    };
  }, [hydrated, initial.region.id, regionId, version]);

  useEffect(() => {
    if (!user) {
      setMine(null);
      return;
    }
    let cancel = false;
    getMine()
      .then((next) => {
        if (!cancel) setMine(next.ledger);
      })
      .catch(() => {
        if (!cancel) setMine([]);
      });
    return () => {
      cancel = true;
    };
  }, [user, profile?.karmaBalance]);

  useEffect(() => {
    if (!user) { setMyListings(null); return; }
    let cancel = false;
    getMyListings().then((items) => { if (!cancel) setMyListings(items); }).catch(() => { if (!cancel) setMyListings([]); });
    return () => { cancel = true; };
  }, [user, version]);

  async function changeListingStatus(id: string) {
    setListingBusy(id);
    setListingMessage(null);
    try {
      const result = await setListingAvailability({ data: { id, action: "resume" } });
      if (!result.ok) { setListingMessage(result.error ?? "Inserat konnte nicht freigegeben werden."); return; }
      setMyListings(await getMyListings());
      bump();
      setListingMessage("Inserat ist wieder im Markt sichtbar.");
    } catch (error) {
      setListingMessage(error instanceof Error ? error.message : "Inserat konnte nicht freigegeben werden.");
    } finally { setListingBusy(null); }
  }

  const ledger = user && mine ? mine : board.ledger;

  return (
    <Shell regions={board.regions}>
      <h1 className="font-display text-4xl text-fg">Konto</h1>
      {isPending ? (
        <div className="mt-5 h-36 animate-pulse rounded-3xl bg-elev" />
      ) : user && profile ? (
        <AccountBody profile={profile} name={name} setName={setName} refreshProfile={refreshProfile} />
      ) : (
        <div className="mt-5 max-w-lg rounded-3xl border border-line bg-elev p-5">
          <p className="text-muted">
            Ohne Konto siehst du den Umlauf, kannst aber weder tauschen noch buchen. Neue Mitglieder starten mit 120 Karma.
          </p>
          <Link to="/login" className="mt-4 inline-flex h-11 items-center rounded-lg bg-forest px-4 text-sm font-medium text-paper">
            Konto anlegen
          </Link>
        </div>
      )}

      {user ? (
        <section className="mt-8">
          <h2 className="font-display text-2xl text-fg">Meine Inserate</h2>
          <p className="mt-1 text-sm text-subtle">Pausierte Inserate sind für andere nicht mehr aufrufbar. Du kannst sie hier wieder freigeben.</p>
          <ul className="mt-4 space-y-3">
            {(myListings ?? []).length === 0 ? <li className="rounded-2xl border border-line bg-elev p-4 text-sm text-muted">Du hast noch keine Inserate.</li> : null}
            {myListings?.map((listing) => (
              <li key={listing.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-elev p-4">
                <div className="min-w-0">
                  <p className="font-medium text-fg">{listing.title}</p>
                  <p className="mt-1 text-xs text-subtle">{listing.status === "paused" ? "Pausiert" : listing.status === "active" ? "Aktiv" : listing.status === "booked" ? "Angefragt / gebucht" : "Abgeschlossen"}</p>
                </div>
                {listing.status === "paused" ? <Button disabled={listingBusy === listing.id} onClick={() => void changeListingStatus(listing.id)}>{listingBusy === listing.id ? "Wird freigegeben…" : "Wieder freigeben"}</Button> : <Link to="/inserat/$listingId" params={{ listingId: listing.id }} className="text-sm text-forest underline-offset-4 hover:underline">Inserat öffnen</Link>}
              </li>
            ))}
          </ul>
          {listingMessage ? <p className="mt-3 text-sm text-muted" role="status">{listingMessage}</p> : null}
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="font-display text-2xl text-fg">{user ? "Deine Bewegungen" : "Letzter Umlauf"}</h2>
        <p className="mt-1 text-sm text-subtle">Einträge im Ledger bleiben stehen. Ändern und Löschen ist gesperrt.</p>
        <ul className="mt-4 divide-y divide-line rounded-3xl border border-line bg-elev">
          {ledger.length === 0 ? (
            <li className="px-4 py-5 text-sm text-muted">Noch keine Bewegung.</li>
          ) : (
            ledger.map((entry) => <LedgerRow key={entry.id} entry={entry} />)
          )}
        </ul>
      </section>
    </Shell>
  );
}

function AccountBody({
  profile,
  name,
  setName,
  refreshProfile,
}: {
  profile: Profile;
  name: string;
  setName: (value: string) => void;
  refreshProfile: () => Promise<void>;
}) {
  const [note, setNote] = useState<string | null>(null);
  const idleDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(profile.lastActivityAt).getTime()) / 86400000),
  );

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-line bg-elev p-5">
        <p className="text-sm text-muted">{profile.regionName}</p>
        <p className="mt-2 font-display text-5xl tabular-nums text-copper">{formatKarma(profile.karmaBalance)}</p>
        <p className="text-sm text-subtle">Karma · reines Gemeinschafts- und Aktivitätsguthaben, kein Geld und nicht auszahlbar</p>
        <p className="mt-4 text-sm text-muted">
          Vertrauen {profile.trust == null ? "noch ohne Bewertung" : formatTrust(profile.trust)} · {profile.reviewCount}{" "}
          Bewertungen · letzte Bewegung vor {idleDays} Tagen
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <UserButton />
          <span className={`rounded-full px-3 py-1 text-xs ${profile.isVerified ? "bg-forest/15 text-forest" : "bg-copper/15 text-copper"}`}>
            {profile.isVerified ? "Identität verifiziert" : "Noch nicht verifiziert"}
          </span>
        </div>
        {!profile.isVerified ? <IdAustriaVerification refreshProfile={refreshProfile} /> : null}
      </section>
      <form
        className="space-y-4 rounded-3xl border border-line bg-elev p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void updateProfile({ data: { username: name } })
            .then(() => refreshProfile())
            .then(() => setNote("Name gespeichert"))
            .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Nicht gespeichert"));
        }}
      >
        <Field label="Name">
          <input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} minLength={2} required />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="ghost">
            Name speichern
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (!navigator.geolocation) {
                setNote("Standort ist hier nicht verfügbar");
                return;
              }
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  void updateProfile({
                    data: { lat: position.coords.latitude, lng: position.coords.longitude },
                  })
                    .then(() => refreshProfile())
                    .then(() => setNote("Standort gesetzt"))
                    .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Standort abgelehnt"));
                },
                () => setNote("Standort nicht freigegeben"),
                { enableHighAccuracy: false, maximumAge: 60_000, timeout: 8_000 },
              );
            }}
          >
            Standort für Umkreissuche setzen
          </Button>
        </div>
        <p className="text-xs text-subtle">Dein genauer Standort bleibt in deinem privaten Profil. Öffentliche Kartenpunkte werden absichtlich verschoben und gerundet.</p>
        {note ? <p className="text-sm text-muted">{note}</p> : null}
      </form>
    </div>
  );
}

function IdAustriaVerification({ refreshProfile }: { refreshProfile: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="mt-5 rounded-2xl border border-line bg-elev-2 p-4">
      <h3 className="font-medium text-fg">Identität bestätigen</h3>
      <p className="mt-1 text-sm text-muted">Vor Inseraten und Buchungen ist eine Identitätsprüfung erforderlich. Der Testmodus simuliert den ID-Austria-Abschluss und kennzeichnet ihn ausdrücklich als Mock-Verifikation.</p>
      <Button className="mt-3" disabled={busy} onClick={() => {
        setBusy(true); setMessage(null);
        void verifyWithIdAustria().then(async (result) => {
          await refreshProfile();
          setMessage(result.mode === "mock" ? "Test-Verifikation erfolgreich. Dies ist keine echte staatliche Identitätsprüfung." : "Verifikation abgeschlossen.");
        }).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Verifikation nicht möglich.")).finally(() => setBusy(false));
      }}>{busy ? "Prüfe…" : "Mit ID Austria verifizieren"}</Button>
      {message ? <p className="mt-2 text-xs text-muted">{message}</p> : null}
    </div>
  );
}

function LedgerRow({ entry }: { entry: LedgerEntry }) {
  const who =
    entry.entryKind === "mint"
      ? `Startguthaben an ${entry.receiverName ?? "Mitglied"}`
      : entry.entryKind === "demurrage"
        ? `${entry.senderName ?? "Mitglied"} an die Umlaufsicherung`
        : `${entry.senderName ?? "Jemand"} an ${entry.receiverName ?? "jemanden"}`;
  return (
    <li className="flex items-start justify-between gap-4 px-4 py-4">
      <div>
        <p className="text-sm text-fg">{entry.message}</p>
        <p className="mt-1 text-xs text-subtle">
          {who} · {formatWhen(entry.createdAt)}
        </p>
      </div>
      <p className={`shrink-0 tabular-nums ${entry.entryKind === "demurrage" ? "text-copper" : "text-fg"}`}>
        {entry.entryKind === "demurrage" ? "−" : ""}
        {formatKarma(entry.amountKarma)}
      </p>
    </li>
  );
}
