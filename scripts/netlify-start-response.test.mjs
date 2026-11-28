import assert from "node:assert/strict";
import { test } from "node:test";
import { injectHeadStreaming } from "./netlify-start-response.mjs";

test("Start response wrapper injects metadata across split streamed head chunks", async () => {
  const encoder = new TextEncoder();
  const chunks = [
    "<!doctype html><html><head><title>KREISLAUF</title></he",
    "ad><body><main>streamed body</main></body></html>",
  ];
  const source = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  const response = new Response(source, {
    status: 201,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-length": "123",
      "x-smoke": "preserved",
    },
  });

  const transformed = injectHeadStreaming(response, {
    host: "kreislauf.grok.me",
    site: { title: "KREISLAUF", description: "Regionaler Tausch" },
  });
  const html = await transformed.text();

  assert.equal(transformed.status, 201);
  assert.equal(transformed.headers.get("x-smoke"), "preserved");
  assert.equal(transformed.headers.get("content-length"), null);
  assert.match(html, /property="og:title" content="KREISLAUF"/);
  assert.match(html, /rel="manifest"/);
  assert.match(html, /streamed body/);
  assert.equal((html.match(/rel="manifest"/g) ?? []).length, 1);
});

test("Start response wrapper leaves bodyless responses unchanged", () => {
  const response = new Response(null, { status: 204 });
  assert.equal(
    injectHeadStreaming(response, {
      host: "kreislauf.grok.me",
      site: {},
    }),
    response,
  );
});
