import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://localhost:3000";
const output = process.env.VISUAL_OUTPUT;
if (output) await mkdir(output, { recursive: true });
const failures = [];

for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    for (const width of [1280, 390]) {
      for (const theme of ["light", "dark"]) {
        for (const component of ["action-sheet", "date-picker", "date-range-picker"]) {
          const label = `${name}-${width}-${theme}-${component}`;
          const page = await browser.newPage({
            viewport: { width, height: 900 },
            colorScheme: theme,
            reducedMotion: "reduce",
          });
          const errors = [];
          page.on("pageerror", (error) => errors.push(error.message));
          page.setDefaultTimeout(10000);
          try {
            await page.routeWebSocket(
              () => true,
              () => {},
            );
            await page.route(`${base}/__glass-popup-overflow**`, (route) =>
              route.fulfill({
                contentType: "text/html",
                body: `<!doctype html><html><head><link rel="stylesheet" href="/virtual:stylex.css"></head><body><div id="fixture"></div><script type="module">
                import RefreshRuntime from '/@react-refresh';
                RefreshRuntime.injectIntoGlobalHook(window);
                window.$RefreshReg$ = () => {};
                window.$RefreshSig$ = () => (type) => type;
                window.__vite_plugin_react_preamble_installed__ = true;
                await import('/test/glass-popup-overflow-fixture.tsx');
              </script></body></html>`,
              }),
            );
            await page.goto(`${base}/__glass-popup-overflow?component=${component}&theme=${theme}`);
            const trigger = page.getByRole("button", {
              name: component === "action-sheet" ? "Photo actions" : "Choose date",
              exact: true,
            });
            await trigger.waitFor();
            await trigger.click();
            const popup = page.locator(
              `[data-lenso-slot="${component === "action-sheet" ? "action-sheet-popup" : `${component}-popover`}"]:visible`,
            );
            await popup.waitFor();
            // The Glass rim mounts after the content, so initial layout alone misses the bug.
            await popup
              .locator(
                "[data-lenso-live-rim], [data-material-lens][data-lenso-glass-foreground-rim]",
              )
              .first()
              .waitFor({ state: "attached" });
            await page.waitForTimeout(350);
            const overflow = await popup.evaluate((root) =>
              [root, ...root.querySelectorAll("*")]
                .filter((node) => /auto|scroll/.test(getComputedStyle(node).overflow))
                .map((node) => [
                  node.scrollWidth - node.clientWidth,
                  node.scrollHeight - node.clientHeight,
                ]),
            );
            assert.ok(overflow.length > 0, "content retains a scroll container");
            assert.ok(
              overflow.every(([x, y]) => x === 0 && y === 0),
              `short content scrolls: ${JSON.stringify(overflow)}`,
            );
            if (output) await popup.screenshot({ path: `${output}/${label}.png` });

            await page.setViewportSize({ width, height: 240 });
            await page.waitForTimeout(150);
            const scrolling = await popup.evaluate((root) => {
              const scroller = [root, ...root.querySelectorAll("*")].find(
                (node) =>
                  /auto|scroll/.test(getComputedStyle(node).overflowY) &&
                  node.scrollHeight > node.clientHeight,
              );
              if (!scroller) return null;
              scroller.scrollTop = scroller.scrollHeight;
              const box = root.getBoundingClientRect();
              return {
                top: scroller.scrollTop,
                horizontal: scroller.scrollWidth - scroller.clientWidth,
                withinViewport: box.top >= 0 && box.bottom <= innerHeight + 1,
              };
            });
            assert.ok(scrolling?.top > 0, "constrained content remains vertically scrollable");
            assert.equal(scrolling.horizontal, 0);
            assert.equal(scrolling.withinViewport, true);
            if (output) await popup.screenshot({ path: `${output}/${label}-constrained.png` });
            if (component === "action-sheet") {
              await popup.getByRole("button", { name: "Cancel", exact: true }).click();
            } else {
              await popup.press("Escape");
            }
            await popup.waitFor({ state: "hidden" });
            assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
            assert.deepEqual(errors, []);
            console.log(`PASS ${label}`);
          } catch (error) {
            failures.push(`${label}: ${error.message}`);
            console.error(`FAIL ${label}: ${error.message}`);
          } finally {
            await page.close();
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
}
assert.deepEqual(failures, []);
