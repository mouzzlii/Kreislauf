import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Field, fieldClass } from "@/components/ui";
import { createListing, getItemTemplate } from "@/features/kreislauf/api";
import { useKreislauf } from "@/features/kreislauf/context";
import type { Category } from "@/features/kreislauf/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/inserat/neu")({
  validateSearch: (search: Record<string, unknown>) => ({ reuse: typeof search.reuse === "string" ? search.reuse : undefined }),
  component: NewListing,
});

function NewListing() {
  const { user, isPending } = useCurrentUserState();
  const { profile, regionId, bump } = useKreislauf();
  const navigate = useNavigate();
  const { reuse } = Route.useSearch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("goods");
  const [offerType, setOfferType] = useState<"sell" | "search" | "gift">("sell");
  const [what3words, setWhat3words] = useState("");
  const [price, setPrice] = useState("10");
  const [place, setPlace] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reuseLoading, setReuseLoading] = useState(false);

  useEffect(() => {
    if (!reuse || !user) return;
    let cancel = false;
    setReuseLoading(true);
    getItemTemplate({ data: { itemUuid: reuse } }).then((template) => {
      if (cancel) return;
      setTitle(template.title); setDescription(template.description); setCategory(template.category);
      setPrice(String(template.priceKarma)); setPlace(template.placeLabel); setImage(template.imageDataUrl);
    }).catch((error: unknown) => { if (!cancel) setError(error instanceof Error ? error.message : "Artikel konnte nicht übernommen werden"); })
      .finally(() => { if (!cancel) setReuseLoading(false); });
    return () => { cancel = true; };
  }, [reuse, user?.id]);

  return (
    <Shell>
      <h1 className="font-display text-4xl text-fg">Inserieren</h1>
      {reuse ? <p className="mt-2 text-sm text-forest">Artikel aus der bisherigen Kreislauf-Historie übernommen. Angaben können vor dem Einstellen angepasst werden.</p> : null}
      {reuseLoading ? <p className="mt-2 text-sm text-muted">Artikeldaten werden geladen…</p> : null}
      <p className="mt-2 max-w-lg text-muted">
        Biete, Suche oder Verschenke. Karma ist ausschließlich ein Gemeinschafts- und Aktivitätsguthaben, kein Geld und nicht auszahlbar.
      </p>
      {isPending ? (
        <div className="mt-6 h-40 animate-pulse rounded-3xl bg-elev" />
      ) : !user ? (
        <p className="mt-6 text-muted">
          Dafür brauchst du ein Konto.{" "}
          <Link to="/login" className="text-fg underline-offset-4 hover:underline">
            Anmelden
          </Link>
        </p>
      ) : !profile?.isVerified ? (
        <div className="mt-6 max-w-lg rounded-3xl border border-line bg-elev p-5">
          <p className="text-muted">Bevor du Inserate erstellen kannst, musst du deine Identität bestätigen.</p>
          <Link to="/konto" className="mt-3 inline-flex h-11 items-center rounded-lg bg-forest px-4 text-sm font-medium text-paper">Zur Verifikation</Link>
        </div>
      ) : (
        <form
          className="mt-6 max-w-lg space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setBusy(true);
            setError(null);
            void createListing({
              data: {
                regionId: profile?.regionId ?? regionId,
                title,
                description,
                category,
                offerType,
                what3wordsAddress: what3words,
                itemUuid: reuse ?? null,
                priceKarma: Number(price),
                placeLabel: place,
                imageDataUrl: image,
                lat: profile?.lat ?? null,
                lng: profile?.lng ?? null,
              },
            })
              .then((created) => {
                bump();
                void navigate({ to: "/inserat/$listingId", params: { listingId: created.id } });
              })
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Inserat nicht gespeichert");
                setBusy(false);
              });
          }}
        >
          <Field label="Titel">
            <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} />
          </Field>
          <Field label="Beschreibung">
            <textarea
              className={`${fieldClass} h-32 py-3`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              minLength={8}
            />
          </Field>
          <Field label="Inseratstyp">
            <select className={fieldClass} value={offerType} onChange={(event) => setOfferType(event.target.value as typeof offerType)}>
              <option value="sell">Biete / Verkaufe</option>
              <option value="search">Suche nach</option>
              <option value="gift">Verschenke</option>
            </select>
          </Field>
          <Field label="Art">
            <select
              className={fieldClass}
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
            >
              <option value="goods">Gut</option>
              <option value="service">Hilfe</option>
              <option value="sharing">Flotte</option>
            </select>
          </Field>
          <Field label={category === "sharing" ? "Aktivitäts-Karma pro Tag" : "Aktivitäts-Karma"}>
            <input
              className={fieldClass}
              inputMode="numeric"
              value={offerType === "gift" ? "0" : price}
              disabled={offerType === "gift"}
              onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, ""))}
              required
            />
            {offerType === "gift" ? <span className="mt-1 block text-xs text-subtle">Verschenken ist kostenlos. Die empfangende Person kann beim erfolgreichen Abschluss Aktivitäts-Karma erhalten.</span> : null}
          </Field>
          <Field label="Ungefährer Ort (öffentlich)">
            <input className={fieldClass} value={place} onChange={(event) => setPlace(event.target.value)} placeholder="z. B. Yspertal, Altenmarkt, Pöggstall" />
          </Field>
          <Field label="what3words-Treffpunkt (privat)">
            <input className={fieldClass} value={what3words} onChange={(event) => setWhat3words(event.target.value)} placeholder="///apfel.baum.strasse" />
            <span className="mt-1 block text-xs text-subtle">Wird öffentlich nicht angezeigt. Freigabe nur für bestätigte Buchungsparteien.</span>
          </Field>
          <Field label="Foto, optional">
            <input
              className="block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-lg file:border-0 file:bg-elev-2 file:px-4 file:text-fg"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  setImage(null);
                  return;
                }
                void compressImage(file).then(setImage).catch(() => setError("Foto ließ sich nicht lesen"));
              }}
            />
          </Field>
          {image ? <img src={image} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" /> : null}
          {error ? <p className="text-sm text-copper">{error}</p> : null}
          <Button type="submit" disabled={busy}>
            {busy ? "Speichert…" : "Inserat stellen"}
          </Button>
        </form>
      )}
    </Shell>
  );
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 960 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = () => reject(new Error("image"));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
