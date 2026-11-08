import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile, utimes, stat } from "node:fs/promises";
import { createServer } from "vite";
import { chromium, webkit } from "playwright";

const root = new URL("../", import.meta.url).pathname;
const server = await createServer({
  root,
  server: { port: 0, strictPort: false },
  plugins: [
    {
      name: "reject-development-dist-imports",
      enforce: "pre",
      load(id) {
        assert.doesNotMatch(
          id,
          /\/packages\/(?:ui|tokens|glass|docs)\/dist\//,
          `Development loaded a build artifact: ${id}`,
        );
      },
    },
  ],
});
try {
  await server.listen();
  const base = server.resolvedUrls.local[0];
  const index = new URL("../src/generated/lenso-docs-index.json", import.meta.url);
  const originalTime = await stat(index);
  let restarts = 0;
  const restart = server.restart.bind(server);
  server.restart = (...args) => {
    restarts++;
    return restart(...args);
  };
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("requestfailed", (request) => console.error(name, request.url(), request.failure()));
      for (const locale of ["en", "cn"]) {
        const response = await page.goto(
          `${base}${locale}/docs/react/getting-started/installation`,
        );
        assert.equal(response.status(), 200);
        await page.locator("pre span[style*='--shiki-light']").first().waitFor();
        await page.waitForFunction(() => {
          const button = document.querySelector('button[aria-label="Copy preserved source"]');
          return (
            button &&
            Object.keys(button).some(
              (key) => key.startsWith("__reactProps$") && typeof button[key].onClick === "function",
            )
          );
        });
        await page
          .getByRole("button", { name: "Copy preserved source", exact: true })
          .first()
          .click();
        await page
          .locator("output")
          .filter({ hasText: /Source copied|Clipboard unavailable/ })
          .first()
          .waitFor({ state: "attached" });
        for (const theme of ["light", "dark"]) {
          await page.evaluate((theme) => {
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(theme);
          }, theme);
          const tokens = await page.locator("pre span[style*='--shiki-light']").evaluateAll(
            (nodes, theme) =>
              nodes.map((node) => ({
                color: getComputedStyle(node).color,
                expected: node.style.getPropertyValue(`--shiki-${theme}`),
              })),
            theme,
          );
          assert.ok(new Set(tokens.map((token) => token.color)).size > 2);
          for (const token of tokens) {
            const expected = token.expected.replace("#", "");
            assert.equal(
              token.color,
              `rgb(${[0, 2, 4].map((i) => parseInt(expected.slice(i, i + 2), 16)).join(", ")})`,
            );
          }
        }
      }
      const response = await page.goto(`${base}en/docs/react/components/button`);
      assert.equal(response.status(), 200);
      await page.locator('[data-component-story="Button"]').waitFor();
      assert.deepEqual(errors, []);
      console.log(
        `${name}: bilingual code colors in both themes and source-based Button SSR passed.`,
      );
    } finally {
      await browser.close();
    }
  }
  const artifact = new URL(`../out/dev-isolation-${process.pid}.html`, import.meta.url);
  let reloads = 0;
  const send = server.ws.send.bind(server.ws);
  server.ws.send = (...args) => {
    if (args[0]?.type === "full-reload") reloads++;
    return send(...args);
  };
  try {
    await mkdir(new URL("../out/", import.meta.url), { recursive: true });
    await writeFile(artifact, "<!doctype html><title>Static build fixture</title>");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    assert.equal(reloads, 0, "A static build artifact must not reload development pages");
  } finally {
    await rm(artifact, { force: true });
  }
  console.log("Static output did not reload development pages.");
  try {
    // Simulate another session publishing an index, without changing its contents.
    assert.ok((await readFile(index, "utf8")).includes('"pages"'));
    await utimes(index, new Date(), new Date());
    await new Promise((resolve) => setTimeout(resolve, 1500));
    assert.equal(restarts, 0, "Publishing the docs index must not restart Vite");
    assert.equal((await fetch(`${base}en/docs/react/components/sheet`)).status, 200);
  } finally {
    await utimes(index, originalTime.atime, originalTime.mtime);
  }
  console.log("Generated index update retained the running dev server.");
} finally {
  await server.close();
}
