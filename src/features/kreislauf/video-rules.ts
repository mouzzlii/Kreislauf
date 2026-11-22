export type VideoPreset = "single" | "pair" | "quad";

export const VIDEO_PRESETS: Record<VideoPreset, { label: string; maxFiles: number; maxEachSeconds: number }> = {
  single: { label: "1 Video bis 60 Sekunden", maxFiles: 1, maxEachSeconds: 60 },
  pair: { label: "2 Videos bis je 30 Sekunden", maxFiles: 2, maxEachSeconds: 30 },
  quad: { label: "4 Videos bis je 20 Sekunden", maxFiles: 4, maxEachSeconds: 20 },
};

export type VideoDurationCheck =
  | { ok: true; totalSeconds: number }
  | { ok: false; reason: "empty" | "too-many" | "invalid-duration" | "clip-too-long" | "total-too-long"; totalSeconds: number };

export function checkVideoDurations(preset: VideoPreset, durations: number[]): VideoDurationCheck {
  const limits = VIDEO_PRESETS[preset];
  if (durations.length === 0) return { ok: false, reason: "empty", totalSeconds: 0 };
  if (durations.length > limits.maxFiles) return { ok: false, reason: "too-many", totalSeconds: sumValid(durations) };
  if (durations.some((duration) => !Number.isFinite(duration) || duration <= 0)) {
    return { ok: false, reason: "invalid-duration", totalSeconds: sumValid(durations) };
  }
  const totalSeconds = durations.reduce((sum, duration) => sum + duration, 0);
  if (durations.some((duration) => duration > limits.maxEachSeconds)) {
    return { ok: false, reason: "clip-too-long", totalSeconds };
  }
  if (totalSeconds > 60) return { ok: false, reason: "total-too-long", totalSeconds };
  return { ok: true, totalSeconds };
}

function sumValid(durations: number[]): number {
  return durations.reduce((sum, duration) => sum + (Number.isFinite(duration) && duration > 0 ? duration : 0), 0);
}
