import type { VideoPreset } from "./video-rules";
import { VIDEO_PRESETS, checkVideoDurations } from "./video-rules";

export function validateVideoUpload(
  pathname: string,
  userId: string,
  clientPayload: string | null | undefined,
): { duration: number } {
  const prefix = `listings/${encodeURIComponent(userId)}/`;
  const filename = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "";
  if (!filename || filename.includes("/") || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(mp4|webm|mov)$/i.test(filename)) {
    throw new Error("Ungültiger Video-Speicherpfad");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(clientPayload ?? "");
  } catch {
    throw new Error("Videodaten fehlen");
  }
  if (!payload || typeof payload !== "object" || !("duration" in payload)) {
    throw new Error("Videodauer fehlt");
  }
  const duration = Number((payload as { duration: unknown }).duration);
  if (!Number.isFinite(duration) || duration <= 0 || duration > 60) {
    throw new Error("Video darf höchstens 60 Sekunden dauern");
  }
  return { duration };
}

export function validateListingVideoSet(
  preset: VideoPreset,
  urls: unknown[],
  durations: unknown[],
): number[] {
  if (urls.length !== durations.length) {
    throw new Error("Videodateien und Dauerangaben stimmen nicht überein");
  }
  if (urls.length === 0) return [];
  const parsed = durations.map((duration) => Number(duration));
  const result = checkVideoDurations(preset, parsed);
  if (!result.ok) {
    const limit = VIDEO_PRESETS[preset];
    throw new Error(`Videoauswahl überschreitet das gewählte Format (max. ${limit.maxEachSeconds} Sekunden je Clip und 60 Sekunden gesamt)`);
  }
  return parsed;
}
