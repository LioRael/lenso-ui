/** WebKit resolves inline dynamic imports from the page URL, ignoring HTML's base.
 * Resolve Exact's deferred entry explicitly so nested static routes can activate. */
export function preparePageHtml(html: string) {
  return html.replace(
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
}
