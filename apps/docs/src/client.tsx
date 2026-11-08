import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

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

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <StartClient />
      </StrictMode>,
    );
  });
}

// Keep the server-rendered article while its browser module loads. A rejected
// module is still handled by the route's error boundary during hydration.
void prepareDocument(window.location.pathname).then(hydrate, hydrate);
