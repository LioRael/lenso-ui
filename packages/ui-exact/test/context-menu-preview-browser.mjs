import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, fileHash } from "./cohort-server.ts";
import { loadContextCohort } from "./context-menu-cohort.mjs";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ??
      "packages/ui-exact/.cache/acceptance/context-menu-preview",
  );
await Bun.write(path.join(artifacts, ".keep"), "");
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 820, height: 900 } }),
        errors = [];
      page.setDefaultTimeout(12000);
      page.on("pageerror", (e) => errors.push(String(e)));
      const network = await loadContextCohort(page, server);
      await page.waitForFunction(() =>
        document.getElementById("context-preview")?.hasAttribute("data-lenso-ready"),
      );
      const root = page.getByTestId("context-preview"),
        card = page.getByTestId("context-preview-card"),
        target = page.getByTestId("context-preview-target");
      const open = async () => {
        await target.focus();
        await page.keyboard.press("Shift+F10");
        await page.waitForFunction(
          () => document.getElementById("context-preview")?.dataset.contextPreviewState === "open",
        );
        assert.equal(await root.evaluate((n) => n.matches(":popover-open")), true);
        assert.equal(await target.evaluate((n) => getComputedStyle(n).opacity), "0");
      };
      const closed = async () => {
        await page.waitForFunction(
          () =>
            document.getElementById("context-preview")?.dataset.contextPreviewState === "returned",
        );
        assert.equal(
          await root.evaluate((n) => n.checkVisibility({ visibilityProperty: true })),
          false,
        );
        assert.equal(await target.evaluate((n) => getComputedStyle(n).opacity), "1");
        assert.equal(await root.evaluate((n) => n.getAnimations().length), 0);
        assert.equal(await card.evaluate((n) => n.style.transform), "");
      };
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await open();
      assert.equal(await card.getAttribute("inert"), "");
      assert.equal(await card.getAttribute("aria-hidden"), "true");
      assert.equal(await card.getAttribute("data-level"), "elevated");
      await page.getByTestId("context-preview-inert").evaluate((n) => n.focus());
      assert.notEqual(
        await page.evaluate(() => document.activeElement.id),
        "context-preview-inert",
      );
      await page.keyboard.press("End");
      assert.equal(await page.evaluate(() => document.activeElement.id), "context-preview-expand");
      await page.keyboard.press("Enter");
      await page.getByTestId("context-preview-full-copy").waitFor();
      await page.waitForFunction(
        () =>
          !document.getElementById("context-preview-popup")?.hasAttribute("data-context-expanding"),
      );
      assert.equal(await target.evaluate((n) => getComputedStyle(n).opacity), "0");
      await root.evaluate((n) => {
        window.previewFrames = [];
        let ticks = 0;
        const tick = () => {
          const s = document.getElementById("context-preview-target"),
            c = document.getElementById("context-preview-card");
          window.previewFrames.push({
            open: n.matches(":popover-open"),
            visible: n.checkVisibility({ visibilityProperty: true }),
            state: n.dataset.contextPreviewState,
            sourceOpacity: Number(getComputedStyle(s).opacity),
            transform: c.parentElement.style.transform,
          });
          if (++ticks < 120 && n.dataset.contextPreviewState !== "returned")
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      await page.keyboard.press("Escape");
      await closed();
      const frames = await page.evaluate(() => window.previewFrames),
        returning = frames.filter((f) => !f.open && f.visible && f.state === "returning");
      if (engine === "chromium") {
        assert.ok(returning.length > 2, "closed native menu must retain return drawing");
        assert.ok(returning.some((f) => f.transform.includes("scale(")));
        assert.ok(returning.some((f) => f.sourceOpacity > 0 && f.sourceOpacity < 1));
      }
      // Reopen during return: retain the same source and settle the new presentation.
      await open();
      await page.keyboard.press("Escape");
      await target.focus();
      await page.keyboard.press("Shift+F10");
      await page.waitForFunction(
        () => document.getElementById("context-preview")?.dataset.contextPreviewState === "open",
      );
      await page.keyboard.press("Escape");
      await closed();
      // The real opening contextmenu/mouseup sequence can dismiss a native popover in WebKit.
      await target.click({ button: "right", position: { x: 20, y: 20 } });
      await page.waitForFunction(
        () => document.getElementById("context-preview")?.dataset.contextPreviewState === "open",
      );
      assert.equal(await root.evaluate((n) => n.matches(":popover-open")), true);
      await page.keyboard.press("Escape");
      await closed();
      // Caller inline values, including priorities, survive an interrupted preview.
      await target.evaluate((n) => n.style.setProperty("opacity", ".65", "important"));
      await target.focus();
      await page.keyboard.press("Shift+F10");
      await page.waitForFunction(
        () => document.getElementById("context-preview")?.dataset.contextPreviewState === "open",
      );
      await root.evaluate((n) => n.querySelector('[data-slot="context-menu-preview"]').remove());
      await page.waitForFunction(
        () =>
          !document.getElementById("context-preview")?.hasAttribute("data-context-preview-retain"),
      );
      assert.deepEqual(
        await target.evaluate((n) => [n.style.opacity, n.style.getPropertyPriority("opacity")]),
        ["0.65", "important"],
      );
      await page.keyboard.press("Escape");
      await page.reload();
      await page.waitForFunction(() =>
        document.getElementById("context-preview")?.hasAttribute("data-lenso-ready"),
      );
      // Reduced motion changing during the return must release the source promptly.
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await open();
      await page.keyboard.press("Escape");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await closed();
      const captures = [];
      for (const width of [390, 820])
        for (const theme of ["light", "dark"])
          for (const horizontal of [false, true])
            for (const trailing of [false, true]) {
              await page.setViewportSize({ width, height: 900 });
              if ((theme === "dark") !== Boolean(await page.locator('[data-theme="dark"]').count()))
                await page.getByTestId("theme").click();
              if (
                ((await root
                  .locator('[data-slot="context-menu-layout"]')
                  .getAttribute("data-lenso-layout")) ===
                  "horizontal") !==
                horizontal
              )
                await page.getByTestId("context-preview-layout").click();
              if (
                ((await root
                  .locator('[data-slot="context-menu-layout"]')
                  .getAttribute("data-lenso-alignment")) ===
                  "trailing") !==
                trailing
              )
                await page.getByTestId("context-preview-alignment").click();
              await open();
              const geometry = await card.evaluate((n) => {
                const r = n.getBoundingClientRect(),
                  p = n.parentElement
                    .querySelector('[data-slot="menu-popup"]')
                    .getBoundingClientRect();
                return {
                  preview: r.toJSON(),
                  popup: p.toJSON(),
                  direction: getComputedStyle(n.parentElement).flexDirection,
                  radius: getComputedStyle(n).borderRadius,
                };
              });
              assert.equal(geometry.radius, "30px");
              assert.ok(geometry.preview.width > 0 && geometry.preview.width <= 351);
              assert.ok(geometry.preview.x >= 7 && geometry.preview.right <= width - 7);
              if (width >= 768 && horizontal) {
                assert.equal(geometry.direction, trailing ? "row-reverse" : "row");
                assert.ok(
                  Math.abs(
                    (trailing
                      ? geometry.preview.x - geometry.popup.right
                      : geometry.popup.x - geometry.preview.right) - 8,
                  ) < 1,
                );
              } else {
                assert.equal(geometry.direction, "column");
                assert.ok(Math.abs(geometry.popup.y - geometry.preview.bottom - 8) < 1);
              }
              const file = path.join(
                artifacts,
                `${engine}-${width}-${theme}-${horizontal}-${trailing}.png`,
              );
              await root.locator('[data-slot="context-menu-layout"]').screenshot({ path: file });
              captures.push({
                width,
                theme,
                horizontal,
                trailing,
                geometry,
                file,
                sha256: await fileHash(file),
              });
              await page.keyboard.press("Escape");
              await closed();
            }
      assert.deepEqual(errors, []);
      results.push({
        engine,
        version: browser.version(),
        network,
        frames,
        returnAnimation:
          returning.length > 2 ? "retained native drawing" : "immediate native close fallback",
        captures,
        errors,
      });
      console.log(engine, "preview, layout, expansion, cleanup and motion checks passed");
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
await Bun.write(
  path.join(artifacts, "acceptance.json"),
  JSON.stringify({ dist: process.env.EXACT_TEST_DIST, results }, null, 2) + "\n",
);
