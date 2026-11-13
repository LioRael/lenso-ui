import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium, webkit } from "playwright";

// Real scroll snapping, pointer capture, inert actions and touch arbitration
// require a rendered browser; DOM-only tests cannot establish these contracts.
const server = await createServer({
  root: new URL("../", import.meta.url).pathname,
  server: { port: 0, strictPort: false, watch: null, hmr: false },
  plugins: [
    {
      name: "swipe-wheel-fixture",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (!request.url.startsWith("/__swipe-wheel")) return next();
          try {
            const theme = request.url.includes("dark") ? "dark" : "light";
            const { render } = await server.ssrLoadModule("/test/swipe-wheel-fixture.server.tsx");
            const html = await server.transformIndexHtml(
              request.url,
              `<!doctype html><html data-theme="${theme}"><head><link rel="stylesheet" href="/src/styles/global.css"><link rel="stylesheet" href="/virtual:stylex.css"></head><body><div id="fixture">${render(theme)}</div><script type="module" src="/test/swipe-wheel-fixture.client.tsx"></script></body></html>`,
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
          hasTouch: true,
          reducedMotion: "reduce",
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`${base}__swipe-wheel?theme=${theme}`, { timeout: 120_000 });
        const row = page.locator('[data-case="row"]');
        await row.getByRole("button", { name: "Show trailing actions" }).click();
        const remove = row.getByRole("button", { name: "Delete", exact: true });
        assert.ok(
          await remove.evaluate((node) => parseFloat(getComputedStyle(node).borderRadius) >= 16),
        );
        assert.equal(
          await remove.evaluate((node) => getComputedStyle(node).color),
          "rgb(255, 255, 255)",
        );
        await row
          .getByRole("button", { name: "Show trailing actions" })
          .press(name === "webkit" ? "Alt+Tab" : "Tab");
        assert.ok(await remove.evaluate((node) => node === document.activeElement));
        await remove.press("Escape");
        assert.equal(await row.getAttribute("data-open-side"), null);
        assert.ok(
          await row
            .getByRole("button", { name: "Show trailing actions" })
            .evaluate((node) => node === document.activeElement),
        );
        const box = await row.boundingBox();
        await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 8 });
        await page.mouse.up();
        assert.equal(await row.getAttribute("data-open-side"), "end");
        assert.equal(await page.getByLabel("Actions executed").textContent(), "0");
        assert.equal(await page.getByLabel("Rows opened").textContent(), "0");
        await remove.click();
        assert.equal(await page.getByLabel("Actions executed").textContent(), "1");
        await row.getByRole("button", { name: "Show trailing actions" }).click();
        await remove.press("Escape");
        const bodyBox = await row.locator("[data-swipe-body]").boundingBox();
        await page.mouse.move(bodyBox.x + 2, bodyBox.y + bodyBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width - 2, bodyBox.y + bodyBox.height / 2, { steps: 8 });
        await page.mouse.up();
        assert.equal(await page.getByLabel("Actions executed").textContent(), "2");
        assert.equal(
          await row.getAttribute("data-open-side"),
          null,
          "full swipe retained an open row",
        );
        if (name === "chromium" && theme === "light") {
          const cdp = await page.context().newCDPSession(page);
          const touch = async (type, x, y) =>
            cdp.send("Input.dispatchTouchEvent", {
              type,
              touchPoints: type === "touchEnd" || type === "touchCancel" ? [] : [{ id: 1, x, y }],
            });
          const middle = box.y + box.height / 2;
          await touch("touchStart", box.x + box.width * 0.7, middle);
          await touch("touchMove", box.x + box.width * 0.5, middle);
          await touch("touchMove", box.x + box.width * 0.3, middle);
          await touch("touchCancel", 0, 0);
          assert.equal(await row.getAttribute("data-open-side"), null);
          assert.equal(
            await row
              .locator('[data-lenso-slot="swipe-actions-content"]')
              .evaluate((node) => getComputedStyle(node).transform),
            "matrix(1, 0, 0, 1, 0, 0)",
          );
          await touch("touchStart", box.x + box.width * 0.7, middle);
          await touch("touchMove", box.x + box.width * 0.5, middle);
          await touch("touchMove", box.x + box.width * 0.3, middle);
          await touch("touchEnd", 0, 0);
          await page.waitForFunction(
            () =>
              document.querySelector('[data-case="row"]')?.getAttribute("data-open-side") === "end",
          );
          assert.equal(await page.getByLabel("Rows opened").textContent(), "0");
          await row.getByRole("button", { name: "Show trailing actions" }).click();
          assert.equal(
            await row.getAttribute("data-open-side"),
            null,
            "trigger must close after a touch swipe",
          );
          const startY = box.y + box.height - 8;
          await touch("touchStart", box.x + box.width / 2, startY);
          for (const delta of [20, 40, 60, 80])
            await touch("touchMove", box.x + box.width / 2, startY - delta);
          await touch("touchEnd", 0, 0);
          await page.waitForFunction(
            () => document.querySelector('[data-case="scroll"]').scrollTop > 0,
          );
          assert.equal(await row.getAttribute("data-open-side"), null);
          assert.equal(await page.getByLabel("Actions executed").textContent(), "2");
          await page.locator('[data-case="scroll"]').evaluate((node) => {
            node.scrollTop = 0;
          });
          await cdp.detach();
        }
        const wheel = page
          .locator('[data-case="wheel-form"]')
          .getByRole("listbox", { name: "Minutes", exact: true });
        assert.equal(await wheel.evaluate((node) => getComputedStyle(node).userSelect), "none");
        assert.equal(await wheel.evaluate((node) => node.clientHeight), 216);
        assert.equal(
          await wheel
            .getByRole("option", { name: "0 minutes", exact: true })
            .getAttribute("aria-label"),
          "0 minutes",
        );
        await wheel.locator('[aria-selected="true"]').focus();
        await wheel.locator('[aria-selected="true"]').press("ArrowDown");
        assert.equal(await wheel.locator('[aria-selected="true"]').textContent(), "4 minutes");
        await wheel.locator('[aria-selected="true"]').press("End");
        assert.equal(await wheel.locator('[aria-selected="true"]').textContent(), "11 minutes");
        assert.ok(
          await wheel.evaluate((view) => {
            const selected = view.querySelector('[aria-selected="true"]');
            return (
              Math.abs(
                selected.getBoundingClientRect().y +
                  selected.clientHeight / 2 -
                  view.getBoundingClientRect().y -
                  view.clientHeight / 2,
              ) < 2
            );
          }),
        );
        await page.getByRole("button", { name: "Reset", exact: true }).click();
        assert.equal(await wheel.locator('[aria-selected="true"]').textContent(), "2 minutes");
        assert.equal(
          await wheel.locator('[role="option"][tabindex="0"]').textContent(),
          "2 minutes",
        );
        await page.waitForFunction(() => {
          const view = document.querySelector('[data-case="wheel-form"] [role="listbox"]');
          return (
            Math.abs(view.scrollTop - 2 * view.querySelector('[role="option"]').clientHeight) < 2
          );
        });
        await page.waitForTimeout(150);
        await wheel.evaluate((node) => {
          // Once native snapping finishes, committing selection must not restart
          // scrolling. DOM tests cannot observe this browser feedback loop.
          window.wheelSettledScrolls = 0;
          let settled = false;
          node.addEventListener("scrollend", () => {
            settled = true;
          });
          node.addEventListener("scroll", () => {
            if (settled) window.wheelSettledScrolls++;
          });
          node.scrollTop = 6 * node.querySelector('[role="option"]').clientHeight;
        });
        await page.waitForFunction(
          () => document.querySelector('input[name="minutes"]')?.value === "6",
        );
        await page.waitForTimeout(250);
        assert.equal(
          await page.evaluate(() => window.wheelSettledScrolls),
          0,
          "selection commit must not restart a settled wheel",
        );
        const rejected = page.getByRole("listbox", { name: "Rejected minutes" });
        await rejected.evaluate((node) => {
          node.scrollTop = 8 * node.querySelector('[role="option"]').clientHeight;
        });
        await page.waitForFunction(() => {
          const view = document.querySelector('[data-case="rejected"] [role="listbox"]');
          return (
            Math.abs(view.scrollTop - 2 * view.querySelector('[role="option"]').clientHeight) < 2
          );
        });
        await page.getByRole("button", { name: "Toggle direction" }).click();
        await row.getByRole("button", { name: "Show trailing actions" }).click();
        assert.ok(
          await row
            .locator('[data-swipe-actions-side="end"]')
            .evaluate(
              (node) =>
                node.getBoundingClientRect().x < node.parentElement.getBoundingClientRect().x + 2,
            ),
        );
        await row.getByRole("button", { name: "Show trailing actions" }).click();
        await page.getByRole("button", { name: "Toggle disabled" }).click();
        assert.equal(
          await row
            .locator(
              ':is([data-swipe-action], [data-swipe-trigger]):not(:disabled):not([aria-disabled="true"])',
            )
            .count(),
          0,
        );
        assert.equal(await wheel.locator('[tabindex="0"]').count(), 0);
        assert.equal(await wheel.getAttribute("tabindex"), "-1");
        const story = page.locator('[data-case="swipe-story"]');
        await story.getByRole("button", { name: "Archive actions for Design review" }).click();
        await story.getByRole("button", { name: "Archive", exact: true }).click();
        assert.equal(
          await story.getByRole("button", { name: "Archive actions for Design review" }).count(),
          0,
        );
        await story.getByRole("button", { name: "Reset inbox" }).click();
        assert.equal(
          await story.getByRole("button", { name: "Archive actions for Design review" }).count(),
          1,
        );
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "24px";
        });
        await page.waitForFunction(() => {
          const view = document.querySelector('[data-case="rejected"] [role="listbox"]');
          const item = view.querySelector('[aria-selected="true"]');
          return (
            item.offsetHeight >= 48 &&
            Math.abs(
              item.getBoundingClientRect().y +
                item.clientHeight / 2 -
                view.getBoundingClientRect().y -
                view.clientHeight / 2,
            ) < 2
          );
        });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.deepEqual(errors, []);
        console.log(
          `${name} ${theme}: swipe reveal/full swipe/Escape, wheel snap/keyboard/form/reset/rejection, RTL and disabled passed`,
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
