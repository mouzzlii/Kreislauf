/**
 * Netlify-only PWA request middleware for the official TanStack Start adapter.
 *
 * The Vercel/Nitro path continues to use server/middleware/grok-pwa.ts.
 * Keep this implementation behaviorally aligned with that middleware and
 * scripts/grok-pwa-shared.mjs. Start's global request middleware runs for SSR,
 * Server Routes and Server Functions; CSRF remains explicitly enabled.
 */
import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";
import installPageTemplate from "../scripts/install-page.html?raw";
import { grokOgIdentity } from "virtual:grok-og-identity";
import {
  acceptsHtml,
  isDocumentPath,
  isInstallQuery,
  renderInstallPageHtml,
  renderWebManifest,
} from "../scripts/grok-pwa-shared.mjs";
import { injectHeadStreaming } from "../scripts/netlify-start-response.mjs";

function isNetlifyRuntime(): boolean {
  return process.env.NETLIFY === "true" || Boolean(process.env.SITE_ID);
}

function requestHost(request: Request, url: URL): string {
  return request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
}

const csrfMiddleware = createCsrfMiddleware({
  filter: (context) => context.handlerType === "serverFn",
});

const netlifyPwaMiddleware = createMiddleware().server(async ({ request, next }) => {
  if (!isNetlifyRuntime() || request.method.toUpperCase() !== "GET") {
    return next();
  }

  const url = new URL(request.url);
  const host = requestHost(request, url);
  const requestPath = url.pathname + url.search;

  if (url.pathname === "/__grok/manifest.webmanifest" || url.pathname === "/__grok/manifest.json") {
    return new Response(renderWebManifest(host), {
      headers: {
        "content-type": "application/manifest+json; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  }

  const installQuery = isInstallQuery(requestPath);
  const documentPath = isDocumentPath(url.pathname);
  const htmlRequest = acceptsHtml(request.headers.get("accept"));
  if (installQuery && documentPath && htmlRequest) {
    return new Response(renderInstallPageHtml(installPageTemplate, { host, url: requestPath }), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  }

  if (!isDocumentPath(url.pathname)) return next();

  const result = await next();
  if (result instanceof Response) {
    if (
      result.body &&
      String(result.headers.get("content-type") ?? "").includes("text/html") &&
      !result.headers.get("content-encoding")
    ) {
      return injectHeadStreaming(result, { host, site: grokOgIdentity.site });
    }
    return result;
  }

  if (
    result &&
    typeof result === "object" &&
    "response" in result &&
    result.response instanceof Response
  ) {
    const response = result.response;
    if (
      response.body &&
      String(response.headers.get("content-type") ?? "").includes("text/html") &&
      !response.headers.get("content-encoding")
    ) {
      return { ...result, response: injectHeadStreaming(response, { host, site: grokOgIdentity.site }) };
    }
  }

  return result;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, netlifyPwaMiddleware],
}));
