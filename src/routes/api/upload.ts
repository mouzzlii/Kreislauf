import { createFileRoute } from "@tanstack/react-router";
import { handleUpload } from "@vercel/blob/client";
import { validateVideoUpload } from "@/features/kreislauf/video-upload";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { authConfigured, requireUserId } = await import("@/lib/auth/verify.server");
          const { assertSameSiteRequest, CrossSiteRequestError } = await import("@/lib/auth/isolation.server");

          if (!authConfigured || !process.env.DATABASE_URL?.trim()) {
            return Response.json(
              { error: "Video-Uploads benötigen persönliche Konten und eine dauerhafte Datenbank." },
              { status: 503, headers: { "Cache-Control": "no-store" } },
            );
          }
          if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
            return Response.json(
              { error: "Der sichere Medienspeicher ist noch nicht konfiguriert." },
              { status: 503, headers: { "Cache-Control": "no-store" } },
            );
          }

          assertSameSiteRequest();
          const userId = await requireUserId();
          const body = await request.json();
          const response = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
              const metadata = validateVideoUpload(pathname, userId, clientPayload);
              return {
                allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime"],
                maximumSizeInBytes: 50 * 1024 * 1024,
                addRandomSuffix: false,
                allowOverwrite: false,
                tokenPayload: JSON.stringify({ userId, duration: metadata.duration }),
              };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
              let payload: unknown;
              try { payload = JSON.parse(tokenPayload ?? ""); } catch { throw new Error("Ungültige Upload-Freigabe"); }
              if (!payload || typeof payload !== "object" ||
                  !("userId" in payload) ||
                  (payload as { userId: unknown }).userId !== userId ||
                  !blob.pathname.startsWith(`listings/${encodeURIComponent(userId)}/`)) {
                throw new Error("Video gehört nicht zum angemeldeten Konto");
              }
            },
          });
          return Response.json(response, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload nicht möglich";
          const status = message === "Unauthorized" ? 401
            : error instanceof Error && error.name === "CrossSiteRequestError" ? 403 : 400;
          return Response.json(
            { error: status === 401 ? "Bitte melde dich erneut an."
              : status === 403 ? "Upload-Anfrage wurde aus Sicherheitsgründen blockiert."
                : message },
            { status, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
