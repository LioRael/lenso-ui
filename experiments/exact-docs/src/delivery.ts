import { escapeHtml } from "./renderers/html.ts";

export interface DeliveryAssets {
  modules: string[];
  styles: string[];
  search?: Record<string, string>;
}

/** WebKit resolves inline dynamic imports from the page URL, ignoring HTML's base.
 * Resolve Exact's deferred entry explicitly so nested static routes can activate. */
export function preparePageHtml(html: string, assets?: DeliveryAssets) {
  const prepared = html.replace(
    /(<script(?:\s[^>]*)?>)([\s\S]*?)<\/script>/g,
    (script: string, opening: string, body: string) => {
      if (!body.includes("application/vnd.exact.checkpoint")) return script;
      return (
        opening +
        body.replace('import("./app.js")', 'import(new URL("./app.js",document.baseURI).href)') +
        "</script>"
      );
    },
  );
  return assets
    ? prepared.replace(
        /(<script\b[^>]*type="application\/vnd\.exact\.checkpoint")/,
        `$1 data-docs-preload="${escapeHtml(JSON.stringify(assets))}"`,
      )
    : prepared;
}
