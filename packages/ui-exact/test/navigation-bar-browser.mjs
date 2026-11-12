import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, fileHash } from "./cohort-server.ts";
import { loadContextCohort } from "./context-menu-cohort.mjs";
import { checkToolbar } from "./toolbar.mjs";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ?? "packages/ui-exact/.cache/acceptance/navigation-bar",
  );
process.env.LENSO_EXACT_TEST_ARTIFACTS = artifacts;
await Bun.write(path.join(artifacts, ".keep"), "");
const settle = (p) =>
  p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
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
        document.getElementById("navigation-demo")?.hasAttribute("data-navigation-ready"),
      );
      const root = page.getByTestId("navigation-demo"),
        scroll = page.getByTestId("navigation-demo-scroll"),
        title = page.getByTestId("navigation-demo-title"),
        back = page.getByTestId("navigation-demo-back"),
        add = page.getByTestId("navigation-add");
      const setScroll = async (value) => {
        await scroll.evaluate((n, v) => (n.scrollTop = v), value);
        await settle(page);
      };
      const collapsed = () => root.evaluate((n) => n.hasAttribute("data-collapsed"));
      await scroll.scrollIntoViewIfNeeded();
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await root.getAttribute("role"), "toolbar");
      assert.equal(
        await page.getByRole("heading", { name: "Reading list", exact: true }).count(),
        1,
      );
      assert.equal(await title.getAttribute("aria-hidden"), "true");
      assert.equal(await collapsed(), false);
      const threshold = await root.evaluate(
          (n) =>
            document.getElementById("navigation-demo-large-title").getBoundingClientRect().bottom -
            12 -
            n.getBoundingClientRect().bottom,
        ),
        top = (await root.boundingBox()).y;
      await setScroll(threshold - 1);
      assert.equal(await collapsed(), false);
      await setScroll(threshold + 1);
      assert.equal(await collapsed(), true);
      assert.ok(Math.abs((await root.boundingBox()).y - top) < 1);
      assert.equal(await title.evaluate((n) => getComputedStyle(n).opacity), "1");
      await setScroll(12);
      assert.equal(
        await root
          .locator('[data-slot="scroll-edge"]')
          .evaluate((n) => n.style.getPropertyValue("--material-edge-visibility")),
        "0.500",
      );
      await setScroll(0);
      assert.equal(await collapsed(), false);
      await back.focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await add.evaluate((n) => document.activeElement === n), true);
      await page.keyboard.press("Home");
      assert.equal(await back.evaluate((n) => document.activeElement === n), true);
      await page.keyboard.press("Enter");
      assert.equal(await page.getByTestId("navigation-bar-count").textContent(), "1");
      await page.getByTestId("navigation-bar-direction").click();
      await back.focus();
      await page.keyboard.press("ArrowLeft");
      assert.equal(await add.evaluate((n) => document.activeElement === n), true);
      assert.match(
        await root
          .locator('[data-slot="navigation-bar-back-icon"]')
          .evaluate((n) => getComputedStyle(n).transform),
        /matrix\(-1/,
      );
      await page.getByTestId("navigation-bar-direction").click();
      await page.getByTestId("navigation-bar-disabled").click();
      assert.equal(await back.isDisabled(), true);
      await back.evaluate((n) => n.click());
      assert.equal(await page.getByTestId("navigation-bar-count").textContent(), "1");
      await page.getByTestId("navigation-bar-disabled").click();
      await page.getByTestId("navigation-bar-large").click();
      assert.equal(await page.getByTestId("navigation-demo-large-title").count(), 0);
      assert.equal(await title.getAttribute("aria-hidden"), "false");
      assert.equal(await title.getAttribute("role"), "heading");
      assert.equal(await root.getAttribute("data-large"), null);
      await page.getByTestId("navigation-bar-large").click();
      await setScroll(80);
      assert.equal(await collapsed(), true);
      await page.getByTestId("navigation-bar-infer").click();
      await setScroll(0);
      assert.equal(await collapsed(), false);
      await setScroll(100);
      assert.equal(await collapsed(), true);
      await page.getByTestId("navigation-bar-infer").click();
      await setScroll(0);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await settle(page);
      const frames = page.evaluate(
        () =>
          new Promise((resolve) => {
            const rows = [],
              title = document.getElementById("navigation-demo-title"),
              start = performance.now();
            const tick = () => {
              rows.push({
                ms: performance.now() - start,
                opacity: Number(getComputedStyle(title).opacity),
              });
              if (performance.now() - start < 350) requestAnimationFrame(tick);
              else resolve(rows);
            };
            document.getElementById("navigation-demo-scroll").scrollTop = 100;
            requestAnimationFrame(tick);
          }),
      );
      const motion = await frames;
      assert.ok(motion.some((r) => r.opacity > 0 && r.opacity < 1));
      assert.equal(motion.at(-1).opacity, 1);
      await page.emulateMedia({ reducedMotion: "reduce" });
      // Rebind to a distinct native scroll target, then restore the declared target.
      await root.evaluate((n) => {
        const other = document.createElement("div");
        other.id = "navigation-external-scroll";
        other.style.cssText = "height:50px;overflow:auto";
        other.innerHTML = '<div style="height:300px"></div>';
        document.body.append(other);
        n.querySelector('[data-slot="navigation-bar-owner"]').dataset.lensoScrollport = other.id;
      });
      await settle(page);
      await page.evaluate(
        () => (document.getElementById("navigation-external-scroll").scrollTop = 12),
      );
      await settle(page);
      assert.equal(
        await root
          .locator('[data-slot="scroll-edge"]')
          .evaluate((n) => n.style.getPropertyValue("--material-edge-visibility")),
        "0.500",
      );
      await root.evaluate((n) => {
        n.querySelector('[data-slot="navigation-bar-owner"]').dataset.lensoScrollport =
          "navigation-demo-scroll";
      });
      await settle(page);
      await page.evaluate(() => document.getElementById("navigation-external-scroll").remove());
      const captures = [];
      for (const width of [390, 820])
        for (const theme of ["light", "dark"])
          for (const variant of ["uniform", "soft", "none"]) {
            await page.setViewportSize({ width, height: 1000 });
            if ((theme === "dark") !== Boolean(await page.locator('[data-theme="dark"]').count()))
              await page.getByTestId("theme").click();
            const edgeLocator = root.locator('[data-slot="scroll-edge"]');
            const previousEdge = (await edgeLocator.count())
              ? await edgeLocator.elementHandle()
              : null;
            for (
              let k = 0;
              k < 3 &&
              (await root
                .locator('[data-slot="navigation-bar-owner"]')
                .getAttribute("data-lenso-edge")) !== variant;
              k++
            )
              await page.getByTestId("navigation-bar-edge").click();
            await settle(page);
            if (previousEdge && !(await previousEdge.evaluate((n) => n.isConnected))) {
              assert.equal(
                await previousEdge.evaluate((n) =>
                  n.style.getPropertyValue("--material-edge-visibility"),
                ),
                "",
              );
            }
            await scroll.scrollIntoViewIfNeeded();
            await setScroll(120);
            const geometry = await root.evaluate((n) => {
              const r = n.getBoundingClientRect(),
                s = n.parentElement.getBoundingClientRect(),
                edge = n.querySelector('[data-slot="scroll-edge"]');
              return {
                bar: r.toJSON(),
                scroll: s.toJSON(),
                collapsed: n.hasAttribute("data-collapsed"),
                edge: edge
                  ? {
                      visibility: getComputedStyle(edge).visibility,
                      bands: edge.querySelectorAll('[data-slot="navigation-bar-soft-band"]').length,
                      progress: edge.style.getPropertyValue("--material-edge-visibility"),
                    }
                  : null,
              };
            });
            assert.equal(geometry.bar.height, 60);
            assert.ok(Math.abs(geometry.bar.top - geometry.scroll.top) < 1);
            assert.ok(geometry.collapsed);
            if (variant === "none") assert.equal(geometry.edge, null);
            else {
              assert.equal(geometry.edge.visibility, "visible");
              assert.equal(geometry.edge.progress, "1.000");
              assert.equal(geometry.edge.bands, variant === "soft" ? 7 : 0);
            }
            const file = path.join(artifacts, `${engine}-${width}-${theme}-${variant}.png`);
            await scroll.screenshot({ path: file });
            captures.push({ width, theme, variant, geometry, file, sha256: await fileHash(file) });
          }
      await page.getByTestId("navigation-bar-title-change").click();
      await setScroll(0);
      assert.equal(await title.textContent(), "Articles saved for a quiet weekend by the coast");
      assert.equal(await collapsed(), false);
      await page.getByTestId("navigation-bar-attached").click();
      await settle(page);
      assert.equal(await root.getAttribute("data-lenso-attached"), "true");
      await page.getByTestId("navigation-bar-edge").click();
      await page.getByTestId("navigation-bar-edge").click(); // none -> uniform -> soft
      await setScroll(80);
      const oldRoot = await root.elementHandle(),
        oldEdge = await root.locator('[data-slot="scroll-edge"]').elementHandle();
      await page.getByTestId("navigation-bar-mounted").click();
      assert.equal(await oldRoot.evaluate((n) => n.isConnected), false);
      assert.equal(await oldRoot.evaluate((n) => n.hasAttribute("data-collapsed")), false);
      assert.equal(
        await oldEdge.evaluate((n) => n.style.getPropertyValue("--material-edge-visibility")),
        "",
      );
      await page.getByTestId("navigation-bar-mounted").click();
      await page.waitForFunction(() =>
        document.getElementById("navigation-demo")?.hasAttribute("data-navigation-ready"),
      );
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.reload();
      await page.waitForFunction(() =>
        document.getElementById("toolbar-copy")?.hasAttribute("data-lenso-ready"),
      );
      await checkToolbar(page, engine);
      const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      try {
        const p = await mobile.newPage();
        await loadContextCohort(p, server);
        await p.waitForFunction(() =>
          document.getElementById("navigation-demo")?.hasAttribute("data-navigation-ready"),
        );
        await p.getByTestId("navigation-demo-back").tap();
        assert.equal(await p.getByTestId("navigation-bar-count").textContent(), "1");
        await p.getByTestId("navigation-demo-scroll").evaluate((n) => (n.scrollTop = 100));
        await settle(p);
        assert.equal(
          await p.getByTestId("navigation-demo").evaluate((n) => n.hasAttribute("data-collapsed")),
          true,
        );
      } finally {
        await mobile.close();
      }
      assert.deepEqual(errors, []);
      results.push({
        engine,
        version: browser.version(),
        network,
        threshold,
        motion,
        captures,
        ordinaryToolbarRegression: "passed",
        nativeMobileTap: "passed",
        errors,
      });
      console.log(
        engine,
        "navigation scroll/title, lifecycle, native tap and Toolbar regression passed",
      );
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
