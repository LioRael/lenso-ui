import { captureNavigation } from "./web/navigation.ts";
import { escapeHtml } from "./renderers/html.ts";

export interface DeliveryAssets {
  preload?: "render" | "intent";
  modules: string[];
  styles: string[];
  search?: Record<string, string>;
  routes?: string[];
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
  const hinted =
    assets?.preload === "render"
      ? prepared.replace(
          /(<base\b[^>]*>)/,
          `$1${[
            ...assets.modules.map(
              (file) => `<link rel="modulepreload" href="${escapeHtml(file)}" fetchpriority="low">`,
            ),
            ...assets.styles.map(
              (file) =>
                `<link rel="preload" as="style" href="${escapeHtml(file)}" fetchpriority="low">`,
            ),
          ].join("")}`,
        )
      : prepared;
  const routed = assets?.routes?.length
    ? hinted.replace(
        /(<base\b[^>]*>)/,
        `$1<script>(${captureNavigation.toString()})(${JSON.stringify(assets.routes).replaceAll("<", "\\u003c")})</script>`,
      )
    : hinted;
  return assets
    ? routed.replace(
        /(<script\b[^>]*type="application\/vnd\.exact\.checkpoint")/,
        `$1 data-docs-preload="${escapeHtml(JSON.stringify(assets))}"`,
      )
    : routed;
}
