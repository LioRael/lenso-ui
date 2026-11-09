import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { hydrateStart, StartClient } from "@tanstack/react-start/client";
import { RouterProvider, type AnyRouter } from "@tanstack/react-router";

async function prepareDocument(pathname: string) {
  const match = /^\/([^/]+)\/docs\/(.*)$/.exec(pathname);
  if (!match || (match[1] !== "en" && match[1] !== "cn")) return;
  const [{ documents }, { canonicalSlug, getPage }] = await Promise.all([
    import("./lib/content"),
    import("./lib/source"),
  ]);
  const page = getPage(match[1], canonicalSlug(match[2]!));
  if (page) await documents.getPage(page.markdownFile.slice("content/lenso/".length))?.preload();
}

function hydrate(router?: AnyRouter) {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>{router ? <RouterProvider router={router} /> : <StartClient />}</StrictMode>,
    );
  });
}

// Prepare routes and the article in parallel before React touches the server HTML.
// The regular client still owns error handling if either preparation fails.
void Promise.all([hydrateStart(), prepareDocument(window.location.pathname)]).then(
  ([router]) => hydrate(router),
  () => hydrate(),
);
