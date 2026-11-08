import assert from "node:assert/strict";
import { keepDevFixture } from "./keep-dev-fixture.mjs";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://localhost:3000";
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  if (process.env.ANCHORED_ENGINE && process.env.ANCHORED_ENGINE !== name) continue;
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    page.setDefaultNavigationTimeout(90000);
    await keepDevFixture(page, base);
    const errors = [];
    page.on("requestfailed", (request) => {
      if (request.url().startsWith(base))
        console.log(
          "Request failed:",
          new URL(request.url()).pathname,
          request.failure()?.errorText,
        );
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/en/docs/react/components/popover`, { waitUntil: "domcontentloaded" });
    await page.evaluate(async () => {
      const { mount } = await import("/test/popover-material-fixture.tsx");
      for (const e of document.body.children) if (e instanceof HTMLElement) e.hidden = true;
      const host = document.createElement("div");
      document.body.append(host);
      window.mountPopover = (theme, side, kind) => mount(host, theme, side, kind);
    });
    for (const kind of process.env.ANCHORED_FAMILY
      ? [process.env.ANCHORED_FAMILY]
      : ["popover", "tooltip"]) {
      for (const theme of ["light", "dark"]) {
        for (const side of ["top", "bottom", "left", "right"]) {
          await page.evaluate(
            ([theme, side, kind]) => {
              window.disposePopover?.();
              window.disposePopover = window.mountPopover(theme, side, kind);
            },
            [theme, side, kind],
          );
          const trigger = page.getByRole("button", { name: `Open ${kind}`, exact: true });
          if (kind === "popover") await trigger.click();
          else await trigger.focus();
          const popup = page.getByRole(kind === "popover" ? "dialog" : "tooltip");
          await popup.waitFor();
          for (const zoom of [1, 1.25, 1.5, 2, 1]) {
            await page.evaluate(
              (zoom) => (document.documentElement.style.zoom = String(zoom)),
              zoom,
            );
            await page.waitForTimeout(180);
            const geometry = await popup.evaluate((e, kind) => {
              const arrow = e.querySelector(`[data-slot="${kind}-arrow-material"]`);
              const a = arrow.getBoundingClientRect(),
                p = e.getBoundingClientRect();
              const surface = e.querySelector(`[data-slot="${kind}-material"]`);
              const surfaceBox = surface.getBoundingClientRect();
              const inset = kind === "popover" ? 13 : 12;
              const scale = p.width / parseFloat(getComputedStyle(e).width);
              return {
                detached:
                  e.hasAttribute("data-material-paints") ||
                  surface.hasAttribute("data-material-paints"),
                mask: getComputedStyle(surface).maskImage,
                errors: [
                  surfaceBox.left - p.left + inset * scale,
                  surfaceBox.top - p.top + inset * scale,
                  surfaceBox.right - p.right - inset * scale,
                  surfaceBox.bottom - p.bottom - inset * scale,
                ],
                distance: Math.min(
                  Math.abs(a.bottom - p.top),
                  Math.abs(a.top - p.bottom),
                  Math.abs(a.right - p.left),
                  Math.abs(a.left - p.right),
                ),
              };
            }, kind);
            assert.equal(
              geometry.detached,
              false,
              "background must remain attached to native popup geometry",
            );
            assert.notEqual(
              geometry.mask,
              "none",
              "panel and arrow must share one material silhouette",
            );
            assert.ok(
              geometry.errors.every((error) => error < 1),
              `background drift at zoom ${zoom}: ${JSON.stringify(geometry)}`,
            );
            assert.ok(
              geometry.distance <= zoom * 1.1,
              `arrow seam displaced: ${JSON.stringify(geometry)}`,
            );
          }
          // Automated WebKit omits native backdrop blur even in an unmasked control case.
          if (kind === "popover" && name === "chromium" && theme === "dark" && side === "bottom") {
            const png = (await page.screenshot()).toString("base64");
            const pixels = await page.evaluate(async (png) => {
              const image = new Image();
              image.src = `data:image/png;base64,${png}`;
              await image.decode();
              const canvas = document.createElement("canvas");
              canvas.width = image.width;
              canvas.height = image.height;
              const context = canvas.getContext("2d");
              context.drawImage(image, 0, 0);
              const popup = document
                .querySelector('[data-slot="popover-popup"]')
                .getBoundingClientRect();
              const arrow = document
                .querySelector('[data-slot="popover-arrow"]')
                .getBoundingClientRect();
              const pixel = (x, y) =>
                [...context.getImageData(Math.round(x), Math.round(y), 1, 1).data].slice(0, 3);
              return {
                body: pixel(arrow.x + arrow.width / 2, popup.top + 8),
                arrow: pixel(arrow.x + arrow.width / 2, popup.top - 5),
                band: Array.from({ length: 24 }, (_, y) =>
                  pixel(popup.right - 12, popup.top + 45 + y),
                ),
              };
            }, png);
            assert.ok(
              pixels.body.every((channel, i) => Math.abs(channel - pixels.arrow[i]) < 5),
              `arrow/body color seam: ${JSON.stringify(pixels)}`,
            );
            for (let i = 0; i < 3; i++)
              assert.ok(
                Math.max(...pixels.band.map((p) => p[i])) -
                  Math.min(...pixels.band.map((p) => p[i])) <
                  5,
                `backdrop stripes must be blurred: ${JSON.stringify(pixels)}`,
              );
          }
          if (theme === "dark" && side === "bottom") {
            await popup.evaluate((e) =>
              e.closest("[data-theme]").setAttribute("data-contrast", "increased"),
            );
            const surface = popup.locator(`[data-slot="${kind}-material"]`);
            await page.waitForFunction(
              (e) => e.hasAttribute("data-material-opaque"),
              await surface.elementHandle(),
            );
            assert.equal(await surface.evaluate((e) => getComputedStyle(e).backdropFilter), "none");
            await page.waitForFunction(
              (e) => {
                const canvas = document.createElement("canvas");
                canvas.width = canvas.height = 1;
                const context = canvas.getContext("2d");
                context.fillStyle = getComputedStyle(e).backgroundColor;
                context.fillRect(0, 0, 1, 1);
                return context.getImageData(0, 0, 1, 1).data[3] === 255;
              },
              await surface.elementHandle(),
              { timeout: 3000 },
            );
          }
          await page.keyboard.press("Escape");
          await popup.waitFor({ state: "hidden" });
          if (kind === "popover")
            assert.equal(await trigger.evaluate((e) => document.activeElement === e), true);
          console.log(
            "PASS",
            kind,
            name,
            theme,
            side,
            "CSS zoom 100–200%, material, arrow attachment, dismissal/focus",
          );
        }
      }
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
}
