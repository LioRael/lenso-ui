import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium, webkit } from "playwright";

// Existing DOM coverage cannot verify sticky bounds, title visibility or focus
// after replacing the nine-dot window, so exercise the compiled docs pipeline.
const server = await createServer({
  root: new URL("../", import.meta.url).pathname,
  server: { port: 0, strictPort: false, watch: null, hmr: false },
  plugins: [
    {
      name: "navigation-controls-fixture",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (!request.url.startsWith("/__navigation-controls")) return next();
          try {
            const theme = request.url.includes("dark") ? "dark" : "light";
            const { render } = await server.ssrLoadModule(
              "/test/navigation-controls-fixture.server.tsx",
            );
            const html = await server.transformIndexHtml(
              request.url,
              `<!doctype html><html data-theme="${theme}"><head><link rel="stylesheet" href="/src/styles/global.css"><link rel="stylesheet" href="/virtual:stylex.css"></head><body><div id="fixture">${render(theme)}</div><script type="module" src="/test/navigation-controls-fixture.client.tsx"></script></body></html>`,
            );
            response.setHeader("content-type", "text/html");
            response.end(html);
          } catch (error) {
            next(error);
          }
        });
      },
    },
  ],
});
try {
  await server.listen();
  const base = server.resolvedUrls.local[0];
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch();
    try {
      for (const theme of ["light", "dark"]) {
        const page = await browser.newPage({
          viewport: { width: 390, height: 844 },
          reducedMotion: "reduce",
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`${base}__navigation-controls?theme=${theme}`, { timeout: 120_000 });
        const comparison = page.locator('[data-case="page-variants"]');
        const prominent = comparison.getByRole("navigation", { name: "Prominent comparison" });
        const plain = comparison.getByRole("navigation", { name: "Plain comparison" });
        const capsulePixels = await page.evaluate(
          async (images) => {
            const counts = [];
            for (const data of images) {
              const image = new Image();
              image.src = `data:image/png;base64,${data}`;
              await image.decode();
              const canvas = document.createElement("canvas");
              canvas.width = image.width;
              canvas.height = image.height;
              const context = canvas.getContext("2d");
              context.drawImage(image, 0, 0);
              const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
              let count = 0;
              // The dots start below this band. Compare actual capsule/shadow pixels
              // with the local flat background, rather than just checking DOM parts.
              for (let y = 3; y < 16; y++)
                for (let x = 0; x < canvas.width; x++) {
                  const index = (y * canvas.width + x) * 4;
                  if (
                    Math.max(
                      ...[0, 1, 2].map((channel) =>
                        Math.abs(pixels[index + channel] - pixels[channel]),
                      ),
                    ) > 8
                  )
                    count++;
                }
              counts.push(count);
            }
            return counts;
          },
          [
            (await prominent.screenshot()).toString("base64"),
            (await plain.screenshot()).toString("base64"),
          ],
        );
        assert.ok(
          capsulePixels[0] > capsulePixels[1] + 20,
          `${name} ${theme}: prominent needs a visible capsule, got ${capsulePixels}`,
        );
        const explicit = page.locator('[data-case="explicit"]');
        const bar = explicit.getByRole("toolbar");
        await page.getByRole("button", { name: "Back", exact: true }).click();
        assert.equal(await page.getByLabel("Back count").textContent(), "1");
        assert.equal(await explicit.getByRole("heading").count(), 1);
        assert.equal(
          await explicit
            .locator('[data-slot="navigation-bar-title"]')
            .evaluate((node) => getComputedStyle(node).opacity),
          "0",
        );
        const top = (await bar.boundingBox()).y;
        await explicit.evaluate((node) => {
          node.scrollTop = 220;
        });
        await page.waitForFunction(() =>
          document.querySelector('[data-case="explicit"] [data-collapsed]'),
        );
        assert.ok(Math.abs((await bar.boundingBox()).y - top) < 1);
        assert.equal(
          await explicit
            .locator('[data-slot="navigation-bar-title"]')
            .evaluate((node) => getComputedStyle(node).opacity),
          "1",
        );
        assert.ok(await explicit.evaluate((node) => node.scrollWidth <= node.clientWidth + 1));
        await page.getByRole("button", { name: "Toggle large title" }).click();
        assert.equal(await explicit.locator('[data-slot="navigation-bar-large-title"]').count(), 0);
        assert.equal(await explicit.getByRole("heading").count(), 1);
        const inferred = page.locator('[data-case="inferred"]');
        await inferred.evaluate((node) => {
          node.scrollTop = 170;
        });
        await page.waitForFunction(() =>
          document.querySelector('[data-case="inferred"] [data-collapsed]'),
        );
        for (const direction of ["ltr", "rtl", "controlled"]) {
          const control = page.locator(`[data-case="${direction}"]`);
          const current = () => control.locator('[aria-current="page"]');
          await current().focus();
          await current().press("End");
          await page.waitForFunction((direction) => {
            const node = document.querySelector(`[data-case="${direction}"] [aria-current="page"]`);
            return (
              node?.getAttribute("aria-label") === "Page 20 of 20" &&
              document.activeElement === node
            );
          }, direction);
          await current().press("Home");
          await current().press(direction === "rtl" ? "ArrowLeft" : "ArrowRight");
          assert.equal(await current().getAttribute("aria-label"), "Page 2 of 20");
          assert.equal(await control.locator('button[tabindex="0"]').count(), 1);
          await current().press("ArrowUp");
          await current().press("ArrowUp");
          assert.equal(await current().getAttribute("aria-label"), "Page 1 of 20");
        }
        for (const kind of ["rejected", "prevented"]) {
          const current = page.locator(`[data-case="${kind}"] [aria-current="page"]`);
          await current.focus();
          await current.press("End");
          assert.ok(await current.evaluate((node) => document.activeElement === node));
          assert.match(await current.getAttribute("aria-label"), /^Page 1 /);
        }
        assert.equal(await page.locator('[data-case="rtl"] [data-material]').count(), 0);
        assert.equal(
          await page.locator('[data-case="ltr"] [data-material="glass-small"]').count(),
          1,
        );
        await page.getByRole("button", { name: "Toggle disabled" }).click();
        assert.equal(
          await page
            .locator('[data-case="ltr"] button:not(:disabled):not([aria-disabled="true"])')
            .count(),
          0,
        );
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForFunction(() =>
          [...document.querySelectorAll('[data-slot="navigation-bar"]')]
            .at(-1)
            ?.hasAttribute("data-collapsed"),
        );
        assert.deepEqual(errors, []);
        const story = page.locator('[data-case="story"]');
        await story.getByRole("button", { name: "Favorites", exact: true }).click();
        assert.equal(
          await story.getByRole("heading", { name: "Favorites", exact: true }).count(),
          1,
        );
        await story.getByRole("button", { name: "Back to albums" }).click();
        await story.getByRole("button", { name: "Reverse order" }).click();
        assert.equal(
          await story.locator('[data-slot="list-action"]').first().textContent(),
          "Screenshots",
        );
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.getByRole("button", { name: "Toggle direction" }).click();
        assert.ok(await explicit.evaluate((node) => node.scrollWidth <= node.clientWidth + 1));
        assert.equal(
          await explicit
            .locator('button[aria-label="Back"] svg')
            .evaluate((node) => getComputedStyle(node).transform),
          "matrix(-1, 0, 0, 1, 0, 0)",
        );
        console.log(
          `${name} ${theme}: title collapse, sticky bounds, heading, back, variants, keyboard, RTL and controlled focus passed`,
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}
