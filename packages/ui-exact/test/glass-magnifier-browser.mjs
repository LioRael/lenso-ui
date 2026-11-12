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
    process.env.LENSO_EXACT_TEST_ARTIFACTS ?? "packages/ui-exact/.cache/acceptance/glass-magnifier",
  );
await Bun.write(path.join(artifacts, ".keep"), "");
const frames = async (page, n = 3) =>
  page.evaluate(
    (n) =>
      new Promise((resolve) => {
        let i = 0;
        const tick = () => {
          if (++i >= n) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    n,
  );
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 820, height: 1000 } }),
        errors = [];
      page.setDefaultTimeout(15000);
      page.on("pageerror", (e) => errors.push(String(e)));
      const network = await loadContextCohort(page, server);
      await page.waitForFunction(() =>
        document.getElementById("magnifier-lens")?.hasAttribute("data-lenso-ready"),
      );
      const lens = page.getByTestId("magnifier-lens"),
        stage = page.getByTestId("magnifier-stage"),
        control = (name) => page.getByTestId(`magnifier-${name}`);
      const flag = async (name, value) => {
        if (((await lens.getAttribute(`data-lenso-${name}`)) === "true") !== value)
          await control(name).click();
      };
      const grab = async () => {
        await stage.scrollIntoViewIfNeeded();
        const box = await lens.boundingBox();
        await page.mouse.move(box.x + 24, box.y + 24);
        await page.mouse.down();
        return { x: box.x + 24, y: box.y + 24, box };
      };
      const shifted = () =>
        lens.evaluate((n) => {
          const [x = "0", y = "0"] = n.style.translate.split(/\s+/);
          return [parseFloat(x) || 0, parseFloat(y) || 0];
        });
      await stage.scrollIntoViewIfNeeded();
      await page.emulateMedia({ reducedMotion: "no-preference" });
      assert.deepEqual(
        await lens.evaluate((n) => [
          n.offsetWidth,
          n.offsetHeight,
          getComputedStyle(n).borderRadius,
        ]),
        [210, 150, "75px"],
      );
      assert.equal(
        await lens.evaluate((n) => getComputedStyle(n).getPropertyValue("--lg-zoom").trim()),
        "1.13",
      );
      const start = await grab();
      assert.equal(await lens.getAttribute("data-glass-dragging"), "");
      const samples = [];
      for (let i = 1; i <= 6; i++) {
        await page.mouse.move(start.x + i * 10, start.y + i * 5);
        await frames(page, 2);
        samples.push(
          await lens.evaluate((n) => ({
            translate: n.style.translate,
            scale: n.style.scale,
            shadow: n.style.boxShadow,
          })),
        );
      }
      assert.ok((await shifted())[0] > 30);
      assert.ok(samples.some((s) => s.scale !== "1 0.8"));
      const parent = await stage.boundingBox();
      await page.mouse.move(parent.x + parent.width + 50, parent.y + parent.height + 30);
      await frames(page);
      const clamped = await lens.boundingBox();
      assert.ok(clamped.x + clamped.width / 2 <= parent.x + parent.width + 1);
      assert.ok(clamped.y + clamped.height / 2 <= parent.y + parent.height + 1);
      await page.mouse.up();
      assert.equal(await lens.getAttribute("data-glass-dragging"), null);
      // Motion flags keep the existing optical owner and reconfigure only the source helper.
      await lens.evaluate((n) => {
        window.magnifierOpticalStops = 0;
        n.removeAttribute = function (name) {
          if (name === "data-material-filter") window.magnifierOpticalStops++;
          return Element.prototype.removeAttribute.call(this, name);
        };
      });
      await flag("animated", false);
      assert.equal(await page.evaluate(() => window.magnifierOpticalStops), 0);
      await lens.evaluate((n) => {
        delete n.removeAttribute;
      });
      await grab();
      const point = await lens.boundingBox();
      await page.mouse.move(point.x + 74, point.y + 54);
      await frames(page);
      assert.ok((await shifted())[0] > 20);
      assert.equal(await lens.evaluate((n) => n.style.scale), "");
      await page.mouse.up();
      await flag("draggable", false);
      await grab();
      assert.equal(await lens.getAttribute("data-glass-dragging"), null);
      await page.mouse.up();
      await flag("animated", true);
      await lens.evaluate((n) =>
        n.addEventListener("pointerdown", (e) => (window.magnifierPointer = e.pointerId), {
          once: true,
        }),
      );
      await grab();
      await frames(page, 5);
      assert.equal(await lens.getAttribute("data-glass-dragging"), "");
      assert.deepEqual(await shifted(), [0, 0]);
      await lens.evaluate((n) =>
        n.dispatchEvent(new PointerEvent("pointercancel", { pointerId: window.magnifierPointer })),
      );
      assert.equal(await lens.getAttribute("data-glass-dragging"), null);
      await page.mouse.up();
      await flag("draggable", true);
      await grab();
      await page.evaluate(() => window.dispatchEvent(new Event("blur")));
      assert.equal(await lens.getAttribute("data-glass-dragging"), null);
      await page.mouse.up();
      await page.getByTestId("magnifier-details").click();
      assert.equal(await page.getByTestId("magnifier-count").textContent(), "1");
      assert.equal(await lens.getAttribute("data-glass-dragging"), null);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await grab();
      const reducedBox = await lens.boundingBox();
      await page.mouse.move(reducedBox.x + 64, reducedBox.y + 64);
      assert.ok((await shifted())[0] > 10);
      assert.equal(await lens.evaluate((n) => n.style.scale), "");
      await page.mouse.up();
      // A configuration restart journals caller inline priorities before new motion owns them.
      await flag("animated", false);
      await flag("draggable", false);
      await lens.evaluate((n) => {
        n.style.setProperty("scale", "1.05", "important");
        n.style.setProperty("translate", "2px 3px", "important");
      });
      await flag("draggable", true);
      const old = await lens.elementHandle();
      await grab();
      await control("mounted").evaluate((n) => n.click());
      await page.mouse.up();
      assert.equal(await old.evaluate((n) => n.isConnected), false);
      assert.equal(await old.evaluate((n) => n.hasAttribute("data-glass-dragging")), false);
      assert.deepEqual(
        await old.evaluate((n) => [
          n.style.scale,
          n.style.getPropertyPriority("scale"),
          n.style.translate,
          n.style.getPropertyPriority("translate"),
        ]),
        ["1.05", "important", "2px 3px", "important"],
      );
      await control("mounted").click();
      await lens.waitFor();
      await flag("animated", true);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await frames(page);
      const captures = [];
      for (const width of [390, 820])
        for (const theme of ["light", "dark"]) {
          await page.setViewportSize({ width, height: 1000 });
          if ((theme === "dark") !== Boolean(await page.locator('[data-theme="dark"]').count()))
            await page.getByTestId("theme").click();
          await stage.scrollIntoViewIfNeeded();
          const file = path.join(artifacts, `${engine}-${width}-${theme}.png`);
          await stage.screenshot({ path: file });
          captures.push({
            width,
            theme,
            file,
            sha256: await fileHash(file),
            geometry: await lens.evaluate((n) => ({
              width: n.offsetWidth,
              height: n.offsetHeight,
              radius: getComputedStyle(n).borderRadius,
              zoom: getComputedStyle(n).getPropertyValue("--lg-zoom").trim(),
            })),
          });
        }
      await page.emulateMedia({ forcedColors: "active" });
      await frames(page);
      assert.equal(await lens.evaluate((n) => getComputedStyle(n).backdropFilter), "none");
      await page.emulateMedia({ forcedColors: "none" });
      const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      try {
        const p = await mobile.newPage();
        await loadContextCohort(p, server);
        await p.waitForFunction(() =>
          document.getElementById("magnifier-lens")?.hasAttribute("data-lenso-ready"),
        );
        await p.getByTestId("magnifier-details").tap();
        assert.equal(await p.getByTestId("magnifier-count").textContent(), "1");
      } finally {
        await mobile.close();
      }
      assert.deepEqual(errors, []);
      results.push({
        engine,
        version: browser.version(),
        network,
        samples,
        captures,
        nativeMobileChildTap: "passed",
        syntheticCancelAndBlur: "passed",
        errors,
      });
      console.log(engine, "magnifier drag, bounds, flags, child action, motion and cleanup passed");
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
await Bun.write(
  path.join(artifacts, "acceptance.json"),
  JSON.stringify({ dist: server.dist, results }, null, 2) + "\n",
);
