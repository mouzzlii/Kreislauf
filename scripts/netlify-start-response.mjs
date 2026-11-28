import { createHeadInjector } from "./grok-pwa-shared.mjs";

/**
 * Preserve SSR streaming while injecting the shared PWA/OG head metadata.
 *
 * @param {Response} response
 * @param {{ host: string, site: Record<string, unknown> }} context
 */
export function injectHeadStreaming(response, { host, site }) {
  if (!response.body) return response;
  const injector = createHeadInjector({ host, site });
  const body = response.body.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        for (const output of injector.push(chunk)) controller.enqueue(output);
      },
      flush(controller) {
        for (const output of injector.flush()) controller.enqueue(output);
      },
    }),
  );
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
