import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Field, fieldClass } from "@/components/ui";
import { createListing, getItemTemplate } from "@/features/kreislauf/api";
import { useKreislauf } from "@/features/kreislauf/use-kreislauf";
import type { Category } from "@/features/kreislauf/types";
import { checkVideoDurations, VIDEO_PRESETS, type VideoPreset } from "@/features/kreislauf/video-rules";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled } from "@/lib/auth/client";

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
  const [images, setImages] = useState<string[]>([]);
  const [videoPreset, setVideoPreset] = useState<VideoPreset>("single");
  const [videos, setVideos] = useState<Array<{ file: File; url: string; duration: number }>>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const videoUrls = useRef(new Set<string>());
  useEffect(() => () => {
    for (const url of videoUrls.current) URL.revokeObjectURL(url);
    videoUrls.current.clear();
  }, []);
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
      setPrice(String(template.priceKarma)); setPlace(template.placeLabel); setImages(template.imageUrl ? [template.imageUrl] : []);
    }).catch((error: unknown) => { if (!cancel) setError(error instanceof Error ? error.message : "Artikel konnte nicht übernommen werden"); })
      .finally(() => { if (!cancel) setReuseLoading(false); });
    return () => { cancel = true; };
  }, [reuse, user]);

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
            setVideoUploadProgress(0);
            void (async () => {
              try {
                if (videos.length > 0) {
                  throw new Error("Video-Uploads sind noch nicht freigegeben. Bitte vorerst Fotos verwenden.");
                }
                const imageDataUrls = images.filter((image) => image.startsWith("data:image/jpeg;base64,"));
                const existingImageUrls = images.filter((image) => !image.startsWith("data:image/jpeg;base64,"));
                const created = await createListing({
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
                imageDataUrls,
                existingImageUrls,
                videoUrls: [],
                videoPreset,
                videoDurations: videos.map((video) => video.duration),
                lat: profile?.lat ?? null,
                lng: profile?.lng ?? null,
              },
                });
                bump();
                await navigate({ to: "/inserat/$listingId", params: { listingId: created.id } });
              } catch (err) {
                setError(err instanceof Error ? err.message : "Inserat nicht gespeichert");
                setBusy(false);
              }
            })();
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
            <span className="mt-1 block text-xs text-subtle">Der Kartenpunkt wird aus Datenschutzgründen nur ungefähr angezeigt. Dein genauer Treffpunkt bleibt privat und wird erst für bestätigte Tauschparteien freigegeben.</span>
          </Field>
          <Field label="what3words-Treffpunkt (privat)">
            <input className={fieldClass} value={what3words} onChange={(event) => setWhat3words(event.target.value)} placeholder="///apfel.baum.strasse" />
            <span className="mt-1 block text-xs text-subtle">Wird öffentlich nicht angezeigt. Freigabe nur für bestätigte Buchungsparteien.</span>
          </Field>
          <Field label="Fotos (bis zu 4)">
            <input
              className="block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-lg file:border-0 file:bg-elev-2 file:px-4 file:text-fg"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const input = event.currentTarget;
                const files = Array.from(input.files ?? []);
                input.value = "";
                if (files.length === 0) return;
                const remaining = 4 - images.length;
                if (remaining <= 0 || files.length > remaining) {
                  setError(remaining <= 0
                    ? "Du hast bereits 4 Fotos hinzugefügt. Entferne zuerst ein Foto, um ein anderes auszuwählen."
                    : `Du kannst noch ${remaining} Foto${remaining === 1 ? "" : "s"} hinzufügen.`);
                  return;
                }
                setError(null);
                void Promise.all(files.map(compressImage))
                  .then((compressed) => setImages((current) => [...current, ...compressed].slice(0, 4)))
                  .catch(() => setError("Mindestens ein Foto ließ sich nicht lesen. Bitte versuche es erneut."));
              }}
            />
            <span className="mt-1 block text-xs text-subtle">{images.length} von 4 Fotos ausgewählt. Du kannst weitere Fotos hinzufügen oder einzelne entfernen. Die Fotos werden für die Vorschau verkleinert. Video-Uploads sind im gemeinsamen Demo-Modus deaktiviert; sie setzen persönliche Konten und einen eingerichteten Medienspeicher voraus.</span>
          </Field>
          <Field label="Videos (maximal 60 Sekunden Gesamtzeit)">
            <select
              className={fieldClass}
              disabled
              value={videoPreset}
              onChange={(event) => {
                const preset = event.target.value as VideoPreset;
                setVideoPreset(preset);
                setVideos((current) => {
                  current.forEach((video) => {
                    URL.revokeObjectURL(video.url);
                    videoUrls.current.delete(video.url);
                  });
                  return [];
                });
                setError(null);
              }}
            >
              {Object.entries(VIDEO_PRESETS).map(([value, preset]) => (
                <option key={value} value={value}>{preset.label}</option>
              ))}
            </select>
            <input
              className="mt-2 block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-lg file:border-0 file:bg-elev-2 file:px-4 file:text-fg"
              type="file"
              disabled
              accept="video/mp4,video/webm,video/quicktime"
              multiple={VIDEO_PRESETS[videoPreset].maxFiles > 1}
              onChange={(event) => {
                const input = event.currentTarget;
                const files = Array.from(input.files ?? []);
                input.value = "";
                if (files.length === 0) return;
                const limit = VIDEO_PRESETS[videoPreset];
                if (videos.length + files.length > limit.maxFiles) {
                  setError(`Dieses Format erlaubt maximal ${limit.maxFiles} Video(s).`);
                  return;
                }
                if (files.some((file) => !["video/mp4", "video/webm", "video/quicktime"].includes(file.type))) {
                  setError("Bitte MP4-, WebM- oder QuickTime-Videos auswählen.");
                  return;
                }
                if (files.some((file) => file.size > 50 * 1024 * 1024)) {
                  setError("Jedes Video darf höchstens 50 MB groß sein.");
                  return;
                }
                setVideoLoading(true);
                setError(null);
                void Promise.allSettled(files.map(probeVideo))
                  .then((results) => {
                    const drafts = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
                    drafts.forEach((video) => videoUrls.current.add(video.url));
                    if (results.some((result) => result.status === "rejected")) {
                      drafts.forEach((video) => {
                        URL.revokeObjectURL(video.url);
                        videoUrls.current.delete(video.url);
                      });
                      setError("Mindestens ein Video konnte nicht gelesen werden. Bitte MP4, WebM oder QuickTime verwenden.");
                      return;
                    }
                    const candidate = [...videos, ...drafts];
                    const result = checkVideoDurations(videoPreset, candidate.map((video) => video.duration));
                    if (!result.ok) {
                      drafts.forEach((video) => {
                        URL.revokeObjectURL(video.url);
                        videoUrls.current.delete(video.url);
                      });
                      const message = result.reason === "clip-too-long"
                        ? `Ein Video ist länger als ${limit.maxEachSeconds} Sekunden.`
                        : result.reason === "total-too-long"
                          ? "Alle Videos zusammen dürfen höchstens 60 Sekunden dauern."
                          : "Die ausgewählten Videos passen nicht zu diesem Format.";
                      setError(message);
                      return;
                    }
                    setVideos(candidate);
                  })
                  .catch(() => setError("Mindestens ein Video konnte nicht gelesen werden. Bitte MP4, WebM oder QuickTime verwenden."))
                  .finally(() => setVideoLoading(false));
              }}
            />
            <span className="mt-1 block text-xs text-subtle">
              Videoauswahl derzeit deaktiviert. Die tatsächliche Dauer muss vor der Freigabe zusätzlich am Server geprüft werden.
            </span>
            {videoLoading ? <span className="mt-2 block text-xs text-muted">Videodauer wird geprüft…</span> : null}
            {!authEnabled ? (
              <p className="mt-2 rounded-xl border border-copper/30 bg-copper/5 p-3 text-xs text-muted">
                Video-Uploads bleiben vorerst in allen Umgebungen gesperrt. Die Prüfung im Browser allein reicht nicht aus, weil sie manipuliert werden kann. Erst nach unabhängiger Serverprüfung werden die Formate 1 × 60 s, 2 × 30 s oder 4 × 20 s freigeschaltet.
              </p>
            ) : null}
            {busy && videos.length > 0 ? <p className="mt-2 text-xs text-muted">Video-Upload: {videoUploadProgress} %</p> : null}
          </Field>
          {videos.length ? (
            <div className="space-y-3">
              {videos.map((video, index) => (
                <div key={video.url} className="overflow-hidden rounded-xl border border-line bg-elev">
                  <video src={video.url} controls playsInline preload="metadata" className="max-h-64 w-full bg-black" />
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <span className="min-w-0 truncate text-xs text-muted">{video.file.name} · {Math.ceil(video.duration)} Sek.</span>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(video.url);
                        videoUrls.current.delete(video.url);
                        setVideos((current) => current.filter((_, videoIndex) => videoIndex !== index));
                      }}
                      className="shrink-0 text-xs font-medium text-copper underline-offset-4 hover:underline"
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-subtle">Gesamtdauer: {videos.reduce((sum, video) => sum + video.duration, 0).toFixed(1)} von 60 Sekunden</p>
            </div>
          ) : null}
          {images.length ? (
            <div className="grid grid-cols-2 gap-3">
              {images.map((src, index) => (
                <div key={index} className="relative overflow-hidden rounded-xl border border-line bg-elev">
                  <img src={src} alt={`Foto ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <span className="text-xs text-muted">Foto {index + 1} von {images.length}</span>
                    <button
                      type="button"
                      onClick={() => setImages((current) => current.filter((_, photoIndex) => photoIndex !== index))}
                      className="text-xs font-medium text-copper underline-offset-4 hover:underline"
                      aria-label={`Foto ${index + 1} entfernen`}
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {error ? <p className="text-sm text-copper">{error}</p> : null}
          <Button type="submit" disabled={busy || videoLoading}>
            {busy ? (videos.length ? "Videos hochladen und speichern…" : "Speichert…") : "Inserat stellen"}
          </Button>
        </form>
      )}
    </Shell>
  );
}

function probeVideo(file: File): Promise<{ file: File; url: string; duration: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      video.src = "";
      if (!Number.isFinite(duration) || duration <= 0) {
        URL.revokeObjectURL(url);
        reject(new Error("duration"));
        return;
      }
      resolve({ file, url, duration });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("video"));
    };
    video.src = url;
  });
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          return;
        }

        let scale = Math.min(1, 960 / Math.max(img.width, img.height));
        let dataUrl = "";
        for (let attempt = 0; attempt < 7; attempt += 1) {
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const quality = Math.max(0.42, 0.72 - attempt * 0.06);
          dataUrl = canvas.toDataURL("image/jpeg", quality);
          if (dataUrl.length <= 240_000) {
            resolve(dataUrl);
            return;
          }
          scale *= 0.82;
        }

        if (dataUrl.length <= 280_000) resolve(dataUrl);
        else reject(new Error("size"));
      };
      img.onerror = () => reject(new Error("image"));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
