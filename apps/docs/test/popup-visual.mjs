import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const output = process.env.VISUAL_OUTPUT ?? "/tmp/lenso-ui-sdk-visual";
await mkdir(output, { recursive: true });
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium, webkit } from "playwright";
const root = fileURLToPath(new URL("../", import.meta.url));
const fixture = root + "test/popup-visual-fixture.tsx";
let server;
try {
  server = await createServer({
    root,
    server: { port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "popup-visual-qa",
        configureServer(s) {
          s.middlewares.use(async (req, res, next) => {
            if (!req.url.startsWith("/__popup-visual-qa")) return next();
            try {
              const html = await s.transformIndexHtml(
                req.url,
                '<!doctype html><html><head><title>Forms QA</title><link rel="icon" href="data:,"><link rel="stylesheet" href="/src/styles/global.css"><link rel="stylesheet" href="/virtual:stylex.css"></head><body><div id="fixture"></div><script type="module" src="/test/' +
                  fixture.split("/").at(-1) +
                  '"></script></body></html>',
              );
              res.setHeader("content-type", "text/html");
              res.end(html);
            } catch (e) {
              next(e);
            }
          });
        },
      },
    ],
  });
  await server.listen();
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    for (const width of [1280, 390])
      for (const theme of ["light", "dark"]) {
        if (
          process.env.VISUAL_CASE &&
          !process.env.VISUAL_CASE.split(",").includes(`${name}-${width}-${theme}`)
        )
          continue;
        const browser = await engine.launch(
          name === "chromium"
            ? { channel: process.env.UI_SDK_CHROMIUM_CHANNEL ?? "chrome" }
            : process.env.UI_SDK_WEBKIT_EXECUTABLE
              ? { executablePath: process.env.UI_SDK_WEBKIT_EXECUTABLE }
              : {},
        );
        try {
          console.log("START", name, width, theme);
          const page = await browser.newPage({
            viewport: { width, height: 900 },
            colorScheme: theme,
            reducedMotion: "no-preference",
            hasTouch: width === 390,
          });
          const errors = [];
          page.on("pageerror", (e) => errors.push(e.message));
          page.on("crash", () => console.error("BROWSER PAGE CRASH", name, width, theme));
          page.setDefaultTimeout(10000);
          await page.goto(server.resolvedUrls.local[0] + `__popup-visual-qa?theme=${theme}`);
          const trigger = page.getByRole("button", { name: "Visual actions", exact: true });
          await trigger.waitFor();
          const popup = page
            .locator('[data-lenso-slot="menu-popup"][aria-label="Visual actions"]')
            .first();
          await trigger.click();
          await popup.waitFor();
          await page.waitForTimeout(750);
          assert.equal(await popup.getAttribute("data-menu-motion"), "icon");
          assert.equal(
            await popup.evaluate((e) => getComputedStyle(e).backgroundColor),
            "rgba(0, 0, 0, 0)",
          );
          assert.equal(
            await popup
              .locator('[data-lenso-slot="menu-surface"]')
              .getAttribute("data-material-resting"),
            "",
          );
          await page.screenshot({ path: `${output}/${name}-${width}-${theme}-menu.png` });
          await page.getByRole("menuitem", { name: "Sort by", exact: true }).click();
          await page.waitForTimeout(800);
          const child = page.locator('[data-lenso-slot="menu-popup"][aria-label="Sort by"]');
          await child.waitFor();
          assert.equal(
            await child.getAttribute("data-menu-motion"),
            width === 390 ? "stacked" : "cascade",
          );
          if (width === 390) {
            assert.equal(
              await child.locator('[data-lenso-slot="menu-submenu-heading"]').count(),
              1,
            );
            assert.equal(await popup.getAttribute("data-menu-child-count"), "1");
          }
          await page.screenshot({ path: `${output}/${name}-${width}-${theme}-submenu.png` });
          await page.getByRole("menuitem", { name: "Advanced", exact: true }).click();
          await page.waitForTimeout(800);

          await page.locator('[data-lenso-slot="menu-popup"][aria-label="Advanced"]').waitFor();
          await page.keyboard.press("Escape");
          await page
            .locator('[data-lenso-slot="menu-popup"][aria-label="Advanced"]')
            .waitFor({ state: "hidden" });
          if (width === 390)
            await child.locator('[data-lenso-slot="menu-submenu-heading"]').click();
          else await page.keyboard.press("Escape");
          await child.waitFor({ state: "hidden" });
          await page.keyboard.press("Escape");
          await popup.waitFor({ state: "hidden" });
          await page.waitForTimeout(50);
          assert.equal(await trigger.evaluate((e) => getComputedStyle(e).opacity), "1");
          if (width === 390 && theme === "light") {
            await trigger.click();
            await page.waitForTimeout(700);
            await page.getByRole("menuitem", { name: "Sort by", exact: true }).click();
            await page.waitForTimeout(700);
            await page.getByRole("menuitem", { name: "Advanced", exact: true }).click();
            await page.waitForTimeout(700);
            await popup.evaluate((root) => {
              window.__treeExitWidths = [];
              const start = performance.now();
              const sample = () => {
                const surface = root.querySelector('[data-lenso-slot="menu-surface"]');
                if (root.isConnected && getComputedStyle(root).visibility !== "hidden")
                  window.__treeExitWidths.push(surface.getBoundingClientRect().width);
                if (root.isConnected && performance.now() - start < 4000)
                  requestAnimationFrame(sample);
              };
              sample();
            });
            await page
              .getByRole("button", { name: "Close externally", exact: true })
              .evaluate((e) => e.click());
            await popup.waitFor({ state: "hidden" });
            const last = await page.evaluate(() => window.__treeExitWidths.at(-1));
            assert.ok(
              last < 70,
              `closing the whole menu tree removed its root before the return animation: ${last}px`,
            );
          }
          // Rapid reversal must return its source and finish native presence.
          await trigger.click();
          await page.waitForTimeout(80);
          await page.keyboard.press("Escape");
          await page.waitForTimeout(60);
          await trigger.click({ force: true });
          await page.waitForTimeout(750);
          await page
            .getByRole("button", { name: "Close externally", exact: true })
            .evaluate((e) => e.click());
          await popup.waitFor({ state: "hidden" });
          assert.equal(await trigger.evaluate((e) => getComputedStyle(e).opacity), "1");
          const select = page.getByRole("combobox", { name: "Visual select", exact: true });
          await select.click();
          const list = page.locator('[data-lenso-slot="select-popover"]');
          await list.waitFor();
          await page.waitForTimeout(700);
          assert.equal(
            await list.evaluate((e) => getComputedStyle(e).backgroundColor),
            "rgba(0, 0, 0, 0)",
          );
          assert.equal(
            await list
              .locator('[data-lenso-slot="select-surface"]')
              .getAttribute("data-material-resting"),
            "",
          );
          await page.screenshot({ path: `${output}/${name}-${width}-${theme}-select.png` });
          await page.keyboard.press("End");
          await page.keyboard.press("Enter");
          await list.waitFor({ state: "hidden" });
          assert.equal(await select.evaluate((e) => getComputedStyle(e).opacity), "1");
          for (const [label, slot, close] of [
            ["Details", "popover-popup", "Close details"],
            ["Open modal", "modal-popup", "Close modal"],
          ]) {
            await page.getByRole("button", { name: label, exact: true }).click();
            const panel = page.locator(`[data-lenso-slot="${slot}"]`);
            await panel.waitFor();
            await page.waitForTimeout(400);
            if (slot === "modal-popup")
              assert.equal(
                await panel.evaluate((e) => {
                  e.hidePopover();
                  const hidden = getComputedStyle(e).visibility;
                  e.showPopover();
                  return hidden;
                }),
                "hidden",
                "closed top-layer content must stay hidden before React unmounts it",
              );
            await page.getByRole("button", { name: close, exact: true }).click();
            await panel.waitFor({ state: "hidden" });
          }
          const retained = page.locator('[data-lenso-slot="modal-popup"][hidden]');
          await retained.waitFor({ state: "attached" });
          assert.equal(
            await retained.isVisible(),
            false,
            "authored display must respect hidden popups",
          );
          for (const [label, slot, kind] of [
            ["Show countries", "combo-box-popover", "button"],
            ["City", "autocomplete-popover", "input"],
          ]) {
            if (kind === "button")
              await page.getByRole("button", { name: label, exact: true }).click();
            else await page.getByRole("combobox", { name: label, exact: true }).fill("P");
            const panel = page.locator(`[data-lenso-slot="${slot}"]`);
            await panel.waitFor();
            await page.waitForTimeout(300);
            assert.match(await panel.evaluate((e) => getComputedStyle(e).backdropFilter), /blur/);
            await page.keyboard.press("Escape");
            await panel.waitFor({ state: "hidden" });
          }
          for (const [label, slot] of [
            ["Open dates", "date-picker-popover"],
            ["Open colors", "color-picker-popover"],
          ]) {
            await page.getByRole("button", { name: label, exact: true }).click();
            const panel = page.locator(`[data-lenso-slot="${slot}"]`);
            await panel.waitFor();
            await page.waitForTimeout(250);
            assert.equal(
              await panel.evaluate((e) => getComputedStyle(e).backgroundColor),
              "rgba(0, 0, 0, 0)",
            );
            assert.equal(
              await panel.evaluate((e) => getComputedStyle(e).transitionDuration),
              "0.15s",
            );
            await page.keyboard.press("Escape");
            await page.waitForTimeout(20);
            assert.equal(await panel.getAttribute("data-ending-style"), "");
            await panel.waitFor({ state: "hidden" });
          }
          await page.getByRole("button", { name: "Help", exact: true }).focus();
          await page.getByRole("tooltip").waitFor();
          await page.keyboard.press("Escape");
          await page.getByRole("tooltip").waitFor({ state: "hidden" });
          for (const [label, slot, close] of [
            ["Open drawer", "drawer-popup", "Close drawer"],
            ["Open actions", "action-sheet-popup", "Cancel actions"],
            ["Open alert", "alert-dialog-popup", "Cancel alert"],
          ]) {
            await page.getByRole("button", { name: label, exact: true }).click();
            const panel = page.locator(`[data-lenso-slot="${slot}"]`);
            await panel.waitFor();
            await page.waitForTimeout(750);
            const box = await panel.boundingBox();
            assert.ok(box.width > 100 && box.height > 0);
            assert.ok(
              box.x >= -1 && box.x + box.width <= width + 1,
              `${slot}: ${JSON.stringify(box)}`,
            );
            await page.getByRole("button", { name: close, exact: true }).click();
            await panel.waitFor({ state: "hidden" });
          }
          await page.getByRole("button", { name: "Open full modal", exact: true }).click();
          const full = page.locator('[data-lenso-slot="modal-popup"][data-size="full"]');
          await full.waitFor();
          await page.waitForTimeout(350);
          const fullBox = await full.boundingBox();
          assert.ok(
            Math.abs(fullBox.x) < 1 &&
              Math.abs(fullBox.y) < 1 &&
              Math.abs(fullBox.width - width) < 1 &&
              Math.abs(fullBox.height - 900) < 1,
          );
          await page.getByRole("button", { name: "Close full modal", exact: true }).click();
          await full.waitFor({ state: "hidden" });
          for (const side of ["left", "top", "bottom"]) {
            await page
              .getByRole("combobox", { name: "Drawer side", exact: true })
              .selectOption(side);
            await page.getByRole("button", { name: "Open drawer", exact: true }).click();
            const panel = page.locator('[data-lenso-slot="drawer-popup"]');
            await panel.waitFor();
            await page.waitForTimeout(800);
            const geometry = await panel.evaluate((e) => {
              const s = getComputedStyle(e);
              return {
                rect: e.getBoundingClientRect().toJSON(),
                start: s.borderTopLeftRadius,
                end: s.borderBottomLeftRadius,
              };
            });
            if (side === "top") {
              assert.equal(geometry.start, "0px");
              assert.equal(geometry.end, "32px");
            }
            if (side === "bottom") {
              assert.equal(geometry.start, "32px");
              assert.equal(geometry.end, "0px");
            }
            if (side === "left") {
              const inset = width >= 640 ? 12 : 8;
              assert.ok(Math.abs(geometry.rect.x - inset) < 1);
              assert.ok(Math.abs(geometry.rect.y - inset) < 1);
              assert.ok(Math.abs(geometry.rect.bottom - (900 - inset)) < 1);
            }
            await page.getByRole("button", { name: "Close drawer", exact: true }).click();
            await panel.waitFor({ state: "hidden" });
          }
          await page.getByRole("button", { name: "Open sheet", exact: true }).click();
          const sheet = page.locator('[data-lenso-slot="sheet-popup"]').first();
          await sheet.waitFor();
          await page.waitForTimeout(600);
          const surface = sheet.locator(':scope > [data-lenso-slot="sheet-surface"]');
          const before = await surface.boundingBox();
          assert.ok(
            before.y + before.height <= 901,
            `sheet surface exceeded the viewport: ${JSON.stringify(before)}`,
          );
          const expandedBefore = await sheet.getAttribute("data-expanded");
          await page.getByRole("button", { name: "Nested sheet", exact: true }).click();
          await page.waitForTimeout(650);
          if (width === 390)
            assert.ok(
              (await surface.boundingBox()).width < before.width * 0.96,
              `native drawer stack must push back the parent sheet: ${JSON.stringify(await sheet.evaluate((e) => ({ stack: getComputedStyle(e).getPropertyValue("--drawer-stack"), bridge: getComputedStyle(e).getPropertyValue("--sheet-stack"), expanded: e.hasAttribute("data-expanded"), width: getComputedStyle(e.querySelector('[data-lenso-slot="sheet-surface"]')).width })))}`,
            );
          await page.getByRole("button", { name: "Close child sheet", exact: true }).click();
          await page.waitForTimeout(650);
          assert.ok(
            expandedBefore !== (await sheet.getAttribute("data-expanded")) ||
              Math.abs((await surface.boundingBox()).width - before.width) < 1,
            "parent sheet must recover its width",
          );
          await page.getByRole("button", { name: "Close sheet", exact: true }).click();
          await sheet.waitFor({ state: "hidden" });
          assert.deepEqual(errors, []);
          console.log(
            `PASS ${name} ${width} ${theme}: material, nested submenu, reversal, controlled exit, retained modal, form popups`,
          );
          await page.close();
        } finally {
          await browser.close();
        }
      }
  }
} finally {
  await server?.close();
}
