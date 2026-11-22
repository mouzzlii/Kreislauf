import { createFileRoute } from "@tanstack/react-router";

/**
 * Video uploads stay fail-closed until the server independently inspects the
 * uploaded media container and verifies its real duration. Browser metadata
 * and clientPayload are user-controlled and are not a security boundary.
 */
export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async () =>
        Response.json(
          { error: "Video-Uploads sind vorübergehend gesperrt. Die serverseitige Prüfung der tatsächlichen Videodauer wird noch fertiggestellt." },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        ),
    },
  },
});
