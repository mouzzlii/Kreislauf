import { createFileRoute } from "@tanstack/react-router";
import { handleUpload } from "@vercel/blob/client";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { authConfigured, requireUserId } = await import("@/lib/auth/verify.server");
          const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
          assertSameSiteRequest();
          if (!authConfigured) {
            return Response.json(
              { error: "Video-Uploads benötigen persönliche, aktivierte Konten." },
              { status: 503 },
            );
          }
          const userId = await requireUserId();
          const body = await request.json();
          const response = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
              const prefix = `listings/${encodeURIComponent(userId)}/`;
              const filename = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "";
              if (!/^[0-9a-f-]{36}\.(mp4|webm|mov)$/i.test(filename)) throw new Error("Ungültiger Upload-Pfad");
              let payload: { duration?: unknown };
              try { payload = JSON.parse(clientPayload ?? "{}"); } catch { throw new Error("Ungültige Videodaten"); }
              if (typeof payload.duration !== "number" || !Number.isFinite(payload.duration) || payload.duration <= 0 || payload.duration > 60) {
                throw new Error("Videos dürfen maximal 60 Sekunden lang sein.");
              }
              return {
                allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime"],
                maximumSizeInBytes: 50 * 1024 * 1024,
                addRandomSuffix: false,
                allowOverwrite: false,
                tokenPayload: JSON.stringify({ userId }),
              };
            },
          });
          return Response.json(response);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload nicht möglich";
          const status = message === "Unauthorized" ? 401 : 400;
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
