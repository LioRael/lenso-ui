import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium, webkit } from "playwright";
import { mkdir } from "node:fs/promises";
const captures = new URL("../../../output/playwright/segmented-section/", import.meta.url);
await mkdir(captures, { recursive: true });
const server = await createServer({
  root: new URL("../", import.meta.url).pathname,
  server: { port: 0, strictPort: false, watch: null, hmr: false },
  plugins: [
    {
      name: "segmented-section-fixture",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (!request.url.startsWith("/__segmented-section")) return next();
          try {
            const html = await server.transformIndexHtml(
              request.url,
              '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/src/styles/global.css"><link rel="stylesheet" href="/virtual:stylex.css"></head><body><div id="fixture"></div><script type="module" src="/test/segmented-section-fixture.tsx"></script></body></html>',
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
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch();
    try {
      for (const theme of ["light", "dark"]) {
        const page = await browser.newPage({
          viewport: { width: 390, height: 844 },
          hasTouch: true,
          reducedMotion: "reduce",
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(
          `${server.resolvedUrls.local[0]}__segmented-section?${theme === "dark" ? "dark" : "light"}`,
          { timeout: 120000 },
        );
        const group = page.getByRole("radiogroup", { name: "Filter", exact: true });
        const all = group.getByRole("radio", { name: "All", exact: true });
        const unread = group.getByRole("radio", { name: "Unread", exact: true });
        await all.focus();
        await all.press("ArrowRight");
        assert.equal(await unread.getAttribute("aria-checked"), "true");
        assert.ok(
          await group.evaluate((node) => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const context = canvas.getContext("2d");
            const fill = (color) => {
              context.fillStyle = color;
              context.fillRect(0, 0, 1, 1);
              return [...context.getImageData(0, 0, 1, 1).data];
            };
            fill(getComputedStyle(node.closest("main")).backgroundColor);
            const track = fill(
              getComputedStyle(node.querySelector('[data-slot="segmented-control-glass"]'))
                .backgroundColor,
            );
            const selected = fill(
              getComputedStyle(node.querySelector('[data-slot="segmented-control-tint"]'))
                .backgroundColor,
            );
            return (
              selected
                .slice(0, 3)
                .reduce((sum, channel, i) => sum + Math.abs(channel - track[i]), 0) > 30
            );
          }),
          "the selected segment must remain visible against its track in both themes",
        );
        assert.deepEqual(
          await page.locator("form").evaluate((form) => new FormData(form).getAll("filter")),
          ["unread"],
        );
        await page.getByRole("button", { name: "Toggle reset cancellation" }).click();
        await page.getByRole("button", { name: "Reset filter", exact: true }).click();
        await page.getByRole("button", { name: "Toggle options", exact: true }).click();
        assert.equal(await group.getByRole("radio").count(), 0);
        await page.waitForFunction(
          () =>
            document.querySelector('[data-slot="segmented-control-row"]').childElementCount === 0,
        );
        await page.getByRole("button", { name: "Toggle options", exact: true }).click();
        assert.equal(await unread.getAttribute("aria-checked"), "true");
        await page.getByRole("button", { name: "Toggle reset cancellation" }).click();
        await page.getByRole("button", { name: "Reset filter", exact: true }).click();
        await page.waitForFunction(
          () =>
            document.querySelector('[data-slot="segmented-control"] [aria-checked="true"]')
              ?.textContent === "All",
        );
        assert.equal(
          await page
            .getByRole("radiogroup", { name: "Empty", exact: true })
            .getByRole("radio")
            .count(),
          0,
        );
        for (const label of ["Rejected", "Read only"]) {
          const rejected = page.getByRole("radiogroup", { name: label, exact: true });
          await rejected.getByRole("radio", { name: "Unread", exact: true }).click();
          assert.equal(
            await rejected
              .getByRole("radio", { name: "All", exact: true })
              .getAttribute("aria-checked"),
            "true",
          );
        }
        const tablist = page.getByRole("tablist", { name: "Filter panels", exact: true });
        const metrics = (node) => {
          const item = node.querySelector('[role="radio"], [role="tab"]');
          const track = node.querySelector('[data-slot$="-glass"]');
          const style = getComputedStyle(item);
          return {
            width: item.getBoundingClientRect().width,
            height: item.getBoundingClientRect().height,
            radius: getComputedStyle(node).borderRadius,
            font: style.fontSize,
            weight: style.fontWeight,
            fill: getComputedStyle(track).backgroundColor,
          };
        };
        assert.deepEqual(
          await group.evaluate(metrics),
          await tablist.evaluate(metrics),
          "both semantics must share segmented geometry and typography",
        );
        assert.equal(await group.getByRole("tab").count(), 0);
        assert.equal(await tablist.getByRole("radio").count(), 0);
        await page.emulateMedia({ reducedMotion: "no-preference" });
        for (const [bar, role, selected] of [
          [group, "radio", "aria-checked"],
          [tablist, "tab", "aria-selected"],
        ]) {
          const first = bar.getByRole(role, { name: "All", exact: true });
          const last = bar.getByRole(role, { name: "Unread", exact: true });
          await first.scrollIntoViewIfNeeded();
          const start = await first.boundingBox();
          const end = await last.boundingBox();
          await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
          await page.mouse.down();
          await page.waitForFunction(
            ({ slot, height }) => {
              const root = document.querySelector(`[data-slot="${slot}"]`);
              return (
                root.hasAttribute("data-lifted") &&
                root.querySelector('[data-slot$="-tint"]').getBoundingClientRect().height >
                  height + 8
              );
            },
            { slot: role === "radio" ? "segmented-control" : "tabs-list", height: start.height },
          );
          await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 8 });
          await page.mouse.up();
          await page.waitForFunction(
            ({ slot, selected }) =>
              document.querySelector(`[data-slot="${slot}"] [${selected}="true"]`)?.textContent ===
              "Unread",
            { slot: role === "radio" ? "segmented-control" : "tabs-list", selected },
          );
          await page.waitForFunction(
            (slot) => {
              const root = document.querySelector(`[data-slot="${slot}"]`);
              const paint = root.querySelector('[data-slot$="-tint"]').getBoundingClientRect();
              const item = root.querySelector("[data-active]").getBoundingClientRect();
              return Math.abs(paint.x - item.x) < 1 && Math.abs(paint.height - item.height) < 1;
            },
            role === "radio" ? "segmented-control" : "tabs-list",
          );
        }
        assert.equal(await page.getByRole("tabpanel").textContent(), "Unread panel");
        assert.equal(
          await page.locator("form").evaluate((form) => new FormData(form).get("filter")),
          "unread",
        );
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.getByRole("button", { name: "Reset filter", exact: true }).click();
        const nav = page.getByRole("navigation", { name: "Letters", exact: true });
        const a = nav.getByRole("link", { name: "A", exact: true });
        const c = nav.getByRole("link", { name: "C", exact: true });
        const d = nav.getByRole("link", { name: "D", exact: true });
        assert.ok(
          await a.evaluate((node) => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const context = canvas.getContext("2d");
            const fill = (color) => {
              context.fillStyle = color;
              context.fillRect(0, 0, 1, 1);
              return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
            };
            fill(getComputedStyle(node.closest("main")).backgroundColor);
            const background = fill(getComputedStyle(node).backgroundColor);
            const foreground = fill(getComputedStyle(node).color);
            const luminance = (rgb) =>
              rgb
                .map((channel) => {
                  const v = channel / 255;
                  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
                })
                .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
            const x = luminance(background),
              y = luminance(foreground);
            return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) >= 4.5;
          }),
          "small index text must meet AA on the selected default surface",
        );
        await a.focus();
        await a.press("ArrowDown");
        assert.ok(await c.evaluate((node) => node === document.activeElement));
        assert.equal(await page.getByLabel("Index activations").textContent(), "0");
        await c.press("Enter");
        assert.equal(await c.getAttribute("aria-current"), "location");
        assert.ok(
          await page.locator('[data-case="sections"]').evaluate((node) => node.scrollTop > 200),
        );
        await c.focus();
        await c.press("End");
        assert.ok(await d.evaluate((node) => node === document.activeElement));
        await d.press("Tab");
        assert.ok(
          await nav.evaluate((node) => !node.contains(document.activeElement)),
          "Tab must leave the index using the browser's native tab order",
        );
        const before = Number(await page.getByLabel("Index activations").textContent());
        await nav.scrollIntoViewIfNeeded();
        const start = await a.boundingBox();
        await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
        await page.mouse.down();
        // This fixture retains native fragments, so immediate activation can move the page.
        const end = await d.boundingBox();
        await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 6 });
        await page.mouse.up();
        assert.equal(await d.getAttribute("aria-current"), "location");
        assert.ok(Number(await page.getByLabel("Index activations").textContent()) > before);
        if (name === "chromium" && theme === "light") {
          const cdp = await page.context().newCDPSession(page);
          const touch = (type, x, y) =>
            cdp.send("Input.dispatchTouchEvent", {
              type,
              touchPoints: type === "touchEnd" ? [] : [{ id: 1, x, y }],
            });
          const last = await d.boundingBox();
          const touchBefore = Number(await page.getByLabel("Index activations").textContent());
          await touch("touchStart", last.x + last.width / 2, last.y + last.height / 2);
          const first = await a.boundingBox();
          await touch("touchMove", first.x + first.width / 2, first.y + first.height / 2);
          await touch("touchEnd", 0, 0);
          assert.equal(await a.getAttribute("aria-current"), "location");
          assert.equal(
            Number(await page.getByLabel("Index activations").textContent()),
            touchBefore + 2,
          );
          await cdp.detach();
        }
        await page.screenshot({
          path: new URL(`${name}-${theme}.png`, captures).pathname,
          fullPage: true,
        });
        await page.getByRole("button", { name: "Toggle glass", exact: true }).click();
        assert.deepEqual(await group.evaluate(metrics), await tablist.evaluate(metrics));
        assert.equal(
          await group
            .locator('[data-slot="segmented-control-glass"][data-material="glass-small"]')
            .count(),
          1,
        );
        assert.equal(
          await tablist.locator('[data-slot="tabs-glass"][data-material="glass-small"]').count(),
          1,
        );
        await page.getByRole("button", { name: "Toggle direction" }).click();
        await all.focus();
        await all.press("ArrowLeft");
        assert.equal(await unread.getAttribute("aria-checked"), "true");
        await page.getByRole("button", { name: "Toggle disabled" }).click();
        assert.equal(await group.locator('[role="radio"]:not([aria-disabled="true"])').count(), 0);
        assert.equal(await nav.locator('[tabindex="0"]').count(), 0);
        await page.setViewportSize({ width: 320, height: 760 });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "24px";
        });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.getByRole("button", { name: "Toggle size", exact: true }).click();
        assert.equal(await unread.evaluate((node) => node.getBoundingClientRect().height), 46);
        assert.deepEqual(await group.evaluate(metrics), await tablist.evaluate(metrics));
        assert.deepEqual(errors, []);
        console.log(
          `${name} ${theme}: shared segment/tab geometry, press/drag/settle, glass and sizes; separate radio/form and tab/panel semantics; reset/rejection/readonly/RTL/index/320px passed`,
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
