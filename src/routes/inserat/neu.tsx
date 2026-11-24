import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Field, fieldClass } from "@/components/ui";
import { createListing, getItemTemplate } from "@/features/kreislauf/api";
import { MAX_IMAGE_DATA_URL_CHARS, MAX_LISTING_IMAGES, MAX_RAW_IMAGE_BYTES, MAX_TOTAL_IMAGE_DATA_URL_CHARS } from "@/features/kreislauf/media-limits";
import { useKreislauf } from "@/features/kreislauf/context";
import type { Category, OfferType } from "@/features/kreislauf/types";
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
  const [offerType, setOfferType] = useState<OfferType>("sell");
  const [exchangeTerms, setExchangeTerms] = useState("");
  const [what3words, setWhat3words] = useState("");
  const [price, setPrice] = useState("10");
  const [place, setPlace] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const imageSelection = useRef(0);
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
      setPrice(String(template.priceKarma)); setPlace(template.placeLabel); setImages(template.imageDataUrls);
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
                exchangeTerms,
                karmaAdjustment: offerType === "combined" ? Number(price) : 0,
                placeLabel: place,
                imageDataUrls: images,
                lat: profile?.lat ?? null,
                lng: profile?.lng ?? null,
              },
            })
              .then((created) => {
                bump();
                void navigate({ to: "/inserat/$listingId", params: { listingId: created.id }, search: { conversation: undefined } });
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
              <option value="barter">Direkter Tausch</option>
              <option value="combined">Kombinierter Tausch</option>
            </select>
          </Field>
          {offerType === "barter" || offerType === "combined" ? (
            <Field label="Was möchtest du im Gegenzug?">
              <textarea
                className={fieldClass + " h-24 py-3"}
                value={exchangeTerms}
                onChange={(event) => setExchangeTerms(event.target.value)}
                required
                minLength={8}
                maxLength={400}
                placeholder="Beschreibe die Ware oder Hilfe, die du dafür suchst."
              />
              <span className="mt-1 block text-xs text-subtle">Diese Gegenleistung wird auf deinem Inserat sichtbar angezeigt.</span>
            </Field>
          ) : null}
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
          <Field label={
            offerType === "barter" ? "Karma-Ausgleich" :
            offerType === "combined" ? "Zusätzlicher Karma-Ausgleich (wird von der anfragenden Person bezahlt)" :
            category === "sharing" ? "Aktivitäts-Karma pro Tag" : "Aktivitäts-Karma"
          }>
            <input
              className={fieldClass}
              inputMode="numeric"
              value={offerType === "gift" || offerType === "barter" ? "0" : price}
              disabled={offerType === "gift" || offerType === "barter"}
              onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, ""))}
              required
            />
            {offerType === "gift" ? <span className="mt-1 block text-xs text-subtle">Verschenken ist kostenlos. Die empfangende Person kann beim erfolgreichen Abschluss Aktivitäts-Karma erhalten.</span> : null}
            {offerType === "barter" ? <span className="mt-1 block text-xs text-subtle">Direkter Tausch: keine Karma-Bewegung.</span> : null}
            {offerType === "combined" ? <span className="mt-1 block text-xs text-subtle">Der Karma-Ausgleich wird erst nach beidseitiger Abschlussbestätigung übertragen. 0 bedeutet reiner Tausch ohne Karma.</span> : null}
          </Field>
          <Field label="Ungefährer Ort (öffentlich)">
            <input className={fieldClass} value={place} onChange={(event) => setPlace(event.target.value)} placeholder="z. B. Yspertal, Altenmarkt, Pöggstall" />
          </Field>
          <Field label="what3words-Treffpunkt (privat)">
            <input className={fieldClass} value={what3words} onChange={(event) => setWhat3words(event.target.value)} placeholder="///apfel.baum.strasse" />
            <span className="mt-1 block text-xs text-subtle">Wird öffentlich nicht angezeigt. Freigabe nur für bestätigte Buchungsparteien.</span>
          </Field>
          <Field label="Fotos (optional, maximal 4)">
            <input
              className="block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-lg file:border-0 file:bg-elev-2 file:px-4 file:text-fg"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => {
                const files = Array.from(event.currentTarget.files ?? []);
                const selection = ++imageSelection.current;
                if (files.length > MAX_LISTING_IMAGES) {
                  setImages([]);
                  setError("Bitte höchstens 4 Fotos auswählen.");
                  event.currentTarget.value = "";
                  return;
                }
                if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_RAW_IMAGE_BYTES)) {
                  setImages([]);
                  setError("Bitte nur JPG-, PNG- oder WebP-Fotos bis maximal 10 MB pro Bild auswählen.");
                  event.currentTarget.value = "";
                  return;
                }
                if (!files.length) {
                  setImages([]);
                  return;
                }
                setImages([]);
                setError(null);
                void Promise.all(files.map(compressImage)).then((next) => {
                  if (selection !== imageSelection.current) return;
                  const totalChars = next.reduce((total, image) => total + image.length, 0);
                  if (next.some((image) => image.length > MAX_IMAGE_DATA_URL_CHARS) || totalChars > MAX_TOTAL_IMAGE_DATA_URL_CHARS) {
                    setError("Die Fotos sind zusammen zu groß. Bitte weniger oder kleinere Fotos auswählen.");
                    return;
                  }
                  setImages(next);
                }).catch(() => {
                  if (selection === imageSelection.current) setError("Mindestens ein Foto ließ sich nicht lesen.");
                });
              }}
            />
            <span className="mt-1 block text-xs text-subtle">
              Bis zu 4 Fotos. Sie werden vor dem Speichern auf eine einheitliche JPEG-Vorschau verkleinert.
              Videos sind erst verfügbar, wenn die sichere serverseitige Speicherung und Laufzeitprüfung eingerichtet ist.
            </span>
          </Field>
          {images.length ? (
            <div className="grid grid-cols-2 gap-3">
              {images.map((src, index) => (
                <div key={index} className="relative">
                  <img src={src} alt={`Inseratfoto ${index + 1}`} className="aspect-[4/3] w-full rounded-xl object-cover" />
                  {index === 0 ? <span className="absolute left-2 top-2 rounded-full bg-forest px-2 py-1 text-xs text-paper">Titelbild</span> : null}
                  <button
                    type="button"
                    className="mt-1 text-xs text-muted underline"
                    onClick={() => setImages((current) => current.filter((_, photoIndex) => photoIndex !== index))}
                    aria-label={`Foto ${index + 1} entfernen`}
                  >Foto entfernen</button>
                </div>
              ))}
            </div>
          ) : null}
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
        const qualitySteps = [0.72, 0.62, 0.52, 0.42];
        const compressed = qualitySteps.map((quality) => canvas.toDataURL("image/jpeg", quality))
          .find((dataUrl) => dataUrl.length <= MAX_IMAGE_DATA_URL_CHARS);
        if (!compressed) {
          reject(new Error("compressed image too large"));
          return;
        }
        resolve(compressed);
      };
      img.onerror = () => reject(new Error("image"));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
