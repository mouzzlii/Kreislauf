const PRIORITY_PATHS = [
  "docs/PROJECT-COORDINATION.md",
  ".github/AI-COLLABORATION.md",
  "AI_TEAM_SETUP.md",
  "src/lib/db.ts",
  "src/features/kreislauf/api.ts",
  "src/lib/auth/server.ts",
  "app/src/main/AndroidManifest.xml",
  "app/build.gradle.kts",
  "app/src/main/java/de/trakuna/app/ShipmentStore.kt",
  "app/src/main/java/de/trakuna/app/MainActivity.kt",
  "scripts/verify-static-release.mjs",
  "RELEASE-VERIFICATION-2026-11-23.md",
  "public/core.js",
  "public/app.js",
  "public/sw.js",
  "docs/STATUS.md",
  "SPEC.md",
  "android/README_DE.md",
  "package.json",
];

export const MAX_SOURCE_FILES_PER_REPO = 4;
export const MAX_SOURCE_FILE_CHARS = 1_800;
export const MAX_SOURCE_CONTEXT_CHARS = 6_500;

export function selectSourcePaths(paths, limit = MAX_SOURCE_FILES_PER_REPO) {
  const available = new Set(paths);
  return PRIORITY_PATHS.filter((path) => available.has(path)).slice(0, limit);
}

export function decodeSourceFile(file) {
  if (!file || file.encoding !== "base64" || typeof file.content !== "string") return "";
  try {
    return Buffer.from(file.content, "base64").toString("utf8");
  } catch {
    return "";
  }
}

export function buildSourceContext(repository, files) {
  const sections = [];
  let remaining = MAX_SOURCE_CONTEXT_CHARS;
  for (const file of files) {
    if (!file || typeof file.path !== "string" || typeof file.content !== "string" || remaining <= 0) continue;
    const separator = sections.length ? "\n\n" : "";
    const heading = `#### ${repository}/${file.path}\n`;
    const excerptLength = Math.min(MAX_SOURCE_FILE_CHARS, Math.max(0, remaining - separator.length - heading.length));
    if (excerptLength <= 0) break;
    const excerpt = file.content.slice(0, excerptLength);
    sections.push(separator + heading + excerpt);
    remaining -= separator.length + heading.length + excerpt.length;
  }
  return sections.join("");
}
