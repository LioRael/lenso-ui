import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, fileHash } from "./cohort-server.ts";
import { loadContextCohort } from "./context-menu-cohort.mjs";
import { checkToggle } from "./toggle.mjs";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ?? "packages/ui-exact/.cache/acceptance/glass-toggle",
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
      page.setDefaultTimeout(12000);
      page.on("pageerror", (e) => errors.push(String(e)));
      const network = await loadContextCohort(page, server);
      await page.waitForFunction(() =>
        document.getElementById("glass-toggle-save")?.hasAttribute("data-lenso-ready"),
      );
      const save = page.getByTestId("glass-toggle-save"),
        icon = page.getByTestId("glass-toggle-icon"),
        bold = page.getByTestId("glass-toggle-bold"),
        italic = page.getByTestId("glass-toggle-italic"),
        group = page.getByTestId("glass-toggle-group");
      assert.equal(await save.evaluate((n) => n.tagName), "BUTTON");
      assert.equal(await save.evaluate((n) => n.type), "button");
      assert.equal(await save.getAttribute("aria-pressed"), "false");
      await save.scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        Boolean(document.getElementById("glass-toggle-save")?.style.getPropertyValue("--lg-rim")),
      );
      await save.evaluate((n) => {
        window.glassToggleDetachments = 0;
        n.removeAttribute = function (name) {
          if (name === "data-material-filter") window.glassToggleDetachments++;
          return Element.prototype.removeAttribute.call(this, name);
        };
      });
      const resting = await save.evaluate((n) => ({
        background: getComputedStyle(n).backgroundColor,
      }));
      await save.focus();
      await page.keyboard.press("Space");
      assert.equal(await save.getAttribute("aria-pressed"), "true");
      assert.equal(await icon.getAttribute("aria-pressed"), "true");
      assert.notEqual(
        await save.evaluate((n) => getComputedStyle(n).backgroundColor),
        resting.background,
      );
      assert.equal(await page.evaluate(() => window.glassToggleDetachments), 0);
      await save.evaluate((n) => {
        delete n.removeAttribute;
      });
      await page.keyboard.press("Enter");
      assert.equal(await save.getAttribute("aria-pressed"), "false");
      await page.getByTestId("glass-toggle-rejected").click();
      await save.click();
      assert.equal(await save.getAttribute("aria-pressed"), "false");
      await page.getByTestId("glass-toggle-rejected").click();
      assert.equal(await page.getByTestId("glass-toggle-locked").isDisabled(), true);
      assert.equal(await group.locator('button[tabindex="0"]').count(), 1);
      await bold.focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await italic.evaluate((n) => n === document.activeElement), true);
      await page.keyboard.press("Space");
      assert.equal(await italic.getAttribute("aria-pressed"), "true");
      assert.equal(await bold.getAttribute("aria-pressed"), "true");
      await page.keyboard.press("ArrowRight");
      assert.equal(await bold.evaluate((n) => n === document.activeElement), true);
      await group.evaluate((n) => n.setAttribute("dir", "rtl"));
      await page.keyboard.press("ArrowLeft");
      assert.equal(await italic.evaluate((n) => n === document.activeElement), true);
      await group.evaluate((n) => n.removeAttribute("dir"));
      await page.getByTestId("glass-toggle-vertical").click();
      await bold.focus();
      await page.keyboard.press("ArrowDown");
      assert.equal(await italic.evaluate((n) => n === document.activeElement), true);
      await page.getByTestId("glass-toggle-vertical").click();
      await page.getByTestId("glass-toggle-tint").click();
      assert.equal(
        await save.evaluate((n) =>
          getComputedStyle(n).getPropertyValue("--lenso-control-tint").trim(),
        ),
        "#8350b5",
      );
      await page.getByTestId("glass-toggle-disabled").click();
      assert.equal(await save.isDisabled(), true);
      await save.evaluate((n) => n.click());
      assert.equal(await save.getAttribute("aria-pressed"), "false");
      assert.equal(await save.getAttribute("data-material-filter"), null);
      assert.equal(await group.locator('button[tabindex="0"]').count(), 0);
      await page.getByTestId("glass-toggle-disabled").click();
      await page.waitForFunction(() =>
        Boolean(document.getElementById("glass-toggle-save")?.style.getPropertyValue("--lg-rim")),
      );
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await save.scrollIntoViewIfNeeded();
      let box = await save.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await settle(page);
      assert.notEqual(await save.evaluate((n) => n.style.getPropertyValue("--lg-press-scale")), "");
      await page.mouse.up();
      await page.emulateMedia({ reducedMotion: "reduce" });
      const retained = await save.elementHandle();
      await page.getByTestId("glass-toggle-mounted").click();
      assert.equal(await retained.evaluate((n) => n.isConnected), false);
      assert.equal(await retained.evaluate((n) => n.hasAttribute("data-material-filter")), false);
      assert.equal(await retained.evaluate((n) => n.style.getPropertyValue("--lg-rim")), "");
      assert.equal(
        await retained.evaluate((n) => n.style.getPropertyValue("--lenso-control-tint")),
        "",
      );
      assert.equal(
        await retained.evaluate((n) => n.style.getPropertyValue("--lg-press-scale")),
        "",
      );
      await page.getByTestId("glass-toggle-mounted").click();
      await save.waitFor();
      const captures = [];
      for (const width of [390, 820])
        for (const theme of ["light", "dark"])
          for (const variant of ["default", "prominent"]) {
            await page.setViewportSize({ width, height: 1000 });
            if ((theme === "dark") !== Boolean(await page.locator('[data-theme="dark"]').count()))
              await page.getByTestId("theme").click();
            if ((await save.getAttribute("data-lenso-variant")) !== variant)
              await page.getByTestId("glass-toggle-variant").click();
            assert.equal(await save.getAttribute("data-variant"), variant);
            for (const [size, height] of [
              ["sm", 28],
              ["md", 34],
              ["lg", 50],
            ]) {
              for (let k = 0; k < 3 && (await save.getAttribute("data-lenso-size")) !== size; k++)
                await page.getByTestId("glass-toggle-size").click();
              await save.scrollIntoViewIfNeeded();
              await settle(page);
              const geometry = await save.evaluate((n) => {
                const r = n.getBoundingClientRect(),
                  s = getComputedStyle(n);
                return {
                  width: r.width,
                  height: r.height,
                  background: s.backgroundColor,
                  color: s.color,
                  filter: s.backdropFilter,
                  pressed: n.getAttribute("aria-pressed"),
                };
              });
              assert.equal(geometry.height, height);
              assert.equal((await icon.boundingBox()).width, height);
              const file = path.join(
                artifacts,
                `${engine}-${width}-${theme}-${variant}-${size}.png`,
              );
              await page.locator("#glass-toggle-examples").screenshot({ path: file });
              captures.push({
                width,
                theme,
                variant,
                size,
                geometry,
                file,
                sha256: await fileHash(file),
              });
            }
          }
      await page.getByTestId("glass-toggle-full").click();
      await settle(page);
      const wide = await save.boundingBox(),
        parent = await save.evaluate((n) => n.parentElement.getBoundingClientRect().width);
      assert.ok(Math.abs(wide.width - parent) < 1);
      await page.getByTestId("glass-toggle-detached").click();
      await settle(page);
      assert.equal(await group.getAttribute("data-lenso-detached"), "true");
      await page.emulateMedia({ forcedColors: "active" });
      assert.equal(await save.evaluate((n) => getComputedStyle(n).backdropFilter), "none");
      await page.emulateMedia({ forcedColors: "none" });
      await page.reload();
      await page.waitForFunction(() =>
        document.getElementById("favorite")?.hasAttribute("data-lenso-ready"),
      );
      await checkToggle(page, engine);
      const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
      try {
        const p = await mobile.newPage();
        await loadContextCohort(p, server);
        await p.waitForFunction(() =>
          document.getElementById("glass-toggle-save")?.hasAttribute("data-lenso-ready"),
        );
        await p.getByTestId("glass-toggle-save").tap();
        assert.equal(await p.getByTestId("glass-toggle-save").getAttribute("aria-pressed"), "true");
        await p.getByTestId("glass-toggle-save").tap();
        assert.equal(
          await p.getByTestId("glass-toggle-save").getAttribute("aria-pressed"),
          "false",
        );
      } finally {
        await mobile.close();
      }
      assert.deepEqual(errors, []);
      results.push({
        engine,
        version: browser.version(),
        network,
        captures,
        ordinaryToggleRegression: "passed",
        nativeMobileTaps: "passed",
        errors,
      });
      console.log(engine, "Glass toggles, cleanup, captures and ordinary Toggle regression passed");
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
