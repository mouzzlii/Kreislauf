import { useEffect, useRef, useState } from "react";
import { Button, fieldClass } from "@/components/ui";

type DetectedBarcode = { rawValue: string };
type NativeBarcodeDetector = {
  detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>;
};
type NativeBarcodeDetectorConstructor = new (options?: {
  formats: string[];
}) => NativeBarcodeDetector;

function listingIdFromValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed, window.location.origin);
    if (url.origin !== window.location.origin || url.username || url.password) return null;
    const match = url.pathname.match(/^\/inserat\/([a-z0-9-]{2,80})\/?$/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function QrScanner({ onOpenListing }: { onOpenListing: (id: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [manualValue, setManualValue] = useState("");
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  function stopCamera() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.visibilityState !== "hidden" || !streamRef.current) return;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setScanning(false);
      setMessage("Kamera aus Datenschutzgründen pausiert. Starte den Scan erneut, wenn die App sichtbar ist.");
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  async function startCamera() {
    setMessage("");
    const Detector = (window as Window & {
      BarcodeDetector?: NativeBarcodeDetectorConstructor;
    }).BarcodeDetector;
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Die Kamera ist hier nicht verfügbar. Gib den QR-Link unten manuell ein.");
      return;
    }
    if (!Detector) {
      setMessage("Dieser Browser unterstützt das QR-Erkennen über die Kamera nicht. Verwende bitte die manuelle Eingabe.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      // Permission prompts may resolve after the user backgrounds the app.
      // Do not attach a camera stream to a hidden page in that race window.
      if (document.visibilityState === "hidden") {
        stream.getTracks().forEach((track) => track.stop());
        setMessage("Kamera wurde nicht gestartet, weil KREISLAUF nicht sichtbar ist. Öffne die App und starte den Scan erneut.");
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stopCamera();
        return;
      }
      video.srcObject = stream;
      await video.play();
      const detector = new Detector({ formats: ["qr_code"] });
      setScanning(true);
      const scanFrame = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          const raw = codes[0]?.rawValue;
          if (raw) {
            const id = listingIdFromValue(raw);
            stopCamera();
            if (id) {
              setMessage("QR-Code erkannt. Inserat wird geöffnet …");
              onOpenListing(id);
            } else {
              setMessage("Der QR-Code gehört nicht zu einem KREISLAUF-Inserat.");
            }
            return;
          }
        } catch {
          stopCamera();
          setMessage("Der QR-Code konnte nicht gelesen werden. Bitte versuche es erneut oder nutze die manuelle Eingabe.");
          return;
        }
        frameRef.current = requestAnimationFrame(() => void scanFrame());
      };
      frameRef.current = requestAnimationFrame(() => void scanFrame());
    } catch (error) {
      stopCamera();
      const name = error instanceof Error ? error.name : "";
      setMessage(name === "NotAllowedError"
        ? "Kamerazugriff wurde verweigert. Erlaube die Kamera oder gib den QR-Link manuell ein."
        : "Kamera konnte nicht gestartet werden. Prüfe die Kameraberechtigung oder nutze die manuelle Eingabe.");
    }
  }

  function openManual(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = listingIdFromValue(manualValue);
    if (!id) {
      setMessage("Bitte einen gültigen KREISLAUF-Link wie /inserat/ebike-123 eingeben.");
      return;
    }
    setMessage("Inserat wird geöffnet …");
    onOpenListing(id);
  }

  return (
    <div className="mt-5 rounded-3xl border border-line bg-elev p-4">
      <h2 className="font-display text-xl">QR-Code scannen</h2>
      <p className="mt-1 text-sm text-muted">Scanne einen KREISLAUF-Produktcode mit der Rückkamera oder gib den Link manuell ein.</p>
      <video
        ref={videoRef}
        muted
        playsInline
        className={scanning ? "mt-3 aspect-video w-full rounded-2xl bg-black object-cover" : "hidden"}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {!scanning ? (
          <Button onClick={() => void startCamera()}>Kamera starten</Button>
        ) : (
          <Button variant="ghost" onClick={stopCamera}>Scan beenden</Button>
        )}
      </div>
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={openManual}>
        <input
          className={fieldClass}
          value={manualValue}
          onChange={(event) => setManualValue(event.target.value)}
          placeholder="/inserat/… oder vollständiger QR-Link"
          aria-label="KREISLAUF QR-Link manuell eingeben"
        />
        <Button type="submit" variant="ghost">Öffnen</Button>
      </form>
      {message ? <p className="mt-2 text-sm text-muted" role="status">{message}</p> : null}
    </div>
  );
}
