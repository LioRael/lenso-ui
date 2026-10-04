/**
 * Build the actual slider story renders as a production consumer under native
 * Base UI DirectionProvider. Writes only a temporary verification directory.
 * LENSO_CHOICE_WORKSPACE can select a scratch mirror with installed dependencies
 * and freshly built @lenso/ui/@lenso/tokens, without touching parent sources.
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createServer } from "node:http";

const workspace =
  process.env["LENSO_CHOICE_WORKSPACE"] ?? fileURLToPath(new URL("../../../", import.meta.url));
const sb = createRequire(join(workspace, "packages/storybook/package.json"));
const ui = createRequire(join(workspace, "packages/react/package.json"));
const testing = createRequire(join(workspace, "packages/testing/package.json"));
const { build } = await import(sb.resolve("vite"));
const { default: stylex } = await import(sb.resolve("@lenso/stylex-build"));
const { chromium } = await import(
  process.env["PLAYWRIGHT_MODULE"] ?? testing.resolve("playwright")
);
const scratch = await mkdtemp(join(process.env["DELTA_SCRATCH_DIR"] ?? tmpdir(), "choice-rtl-"));
await writeFile(
  join(scratch, "index.html"),
  '<html dir="rtl"><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
await writeFile(
  join(scratch, "main.tsx"),
  `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { DirectionProvider } from ${JSON.stringify(ui.resolve("@base-ui/react/direction-provider"))};
import { Default, Range } from ${JSON.stringify(join(workspace, "packages/storybook/stories/slider.stories.tsx"))};
import "@lenso/tokens/styles.css";
document.documentElement.dataset.theme = new URL(location.href).searchParams.get("theme") || "light";
const story = new URL(location.href).searchParams.has("range") ? Range : Default;
createRoot(document.getElementById("root")).render(
  <DirectionProvider direction="rtl"><div dir="rtl" style={{width:384,padding:32}}>
    {story.render({})}
  </div></DirectionProvider>
);
`,
);
await build({
  root: scratch,
  configFile: false,
  logLevel: "error",
  plugins: [
    stylex.vite({
      metadata: [pathToFileURL(sb.resolve("@lenso/tokens/stylex-rules.json"))],
      lightningcssOptions: { exclude: 4 },
      unstable_moduleResolution: { type: "commonJS", rootDir: workspace },
    }),
  ],
  resolve: {
    alias: [
      { find: "react/jsx-runtime", replacement: sb.resolve("react/jsx-runtime") },
      { find: "react-dom/client", replacement: sb.resolve("react-dom/client") },
      { find: "react", replacement: sb.resolve("react") },
      { find: "@stylexjs/stylex", replacement: sb.resolve("@stylexjs/stylex") },
      { find: "@lenso/ui", replacement: join(workspace, "packages/react/dist/index.js") },
      { find: "@lenso/tokens/styles.css", replacement: sb.resolve("@lenso/tokens/styles.css") },
    ],
  },
  oxc: { jsx: { runtime: "automatic", importSource: "react" } },
  build: { outDir: join(scratch, "dist"), emptyOutDir: true },
});
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, "http://localhost").pathname;
    const file = join(scratch, "dist", path === "/" ? "index.html" : path);
    response.setHeader(
      "content-type",
      { ".js": "text/javascript", ".css": "text/css", ".html": "text/html" }[extname(file)] ??
        "application/octet-stream",
    );
    response.end(await readFile(file));
  } catch {
    response.statusCode = 404;
    response.end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  for (const theme of ["light", "dark"]) {
    await page.goto(`http://127.0.0.1:${address.port}/?theme=${theme}`);
    let thumb = page.getByRole("slider", { name: "Volume", exact: true });
    await thumb.focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await thumb.getAttribute("aria-valuenow"), "29");
    await page.keyboard.press("ArrowLeft");
    assert.equal(await thumb.getAttribute("aria-valuenow"), "30");
    await page.goto(`http://127.0.0.1:${address.port}/?theme=${theme}&range`);
    thumb = page.getByRole("slider", { name: "Minimum price", exact: true });
    const before = await thumb.boundingBox();
    await thumb.focus();
    await page.keyboard.press("ArrowLeft");
    assert.equal(await thumb.getAttribute("aria-valuenow"), "150");
    const after = await thumb.boundingBox();
    assert.ok(after.x < before.x, "native RTL increase moves left");
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      productionConsumer: "passed",
      nativeDirectionProvider: "rtl",
      storyRenders: ["Default", "Range"],
      themes: ["light", "dark"],
      keyboard: "passed",
      geometry: "passed",
    }),
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
