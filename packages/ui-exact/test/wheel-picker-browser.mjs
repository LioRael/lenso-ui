import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, fileHash } from "./cohort-server.ts";
import { loadContextCohort } from "./context-menu-cohort.mjs";
import { checkListBox } from "./list-box.mjs";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ?? "packages/ui-exact/.cache/acceptance/wheel-picker",
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
        document.getElementById("wheel-demo-viewport")?.hasAttribute("data-lenso-ready"),
      );
      const root = page.getByTestId("wheel-demo"),
        viewport = page.getByTestId("wheel-demo-viewport"),
        output = page.getByTestId("wheel-value");
      const center = async () => {
        try {
          await page.waitForFunction(() => {
            const view = document.getElementById("wheel-demo-viewport"),
              item = view?.querySelector('[aria-selected="true"]');
            return (
              item &&
              Math.abs(
                item.offsetTop + item.offsetHeight / 2 - view.scrollTop - view.clientHeight / 2,
              ) < 0.6
            );
          });
        } catch (error) {
          console.log(
            engine,
            "center failure",
            await viewport.evaluate((n) => ({
              scroll: n.scrollTop,
              height: n.clientHeight,
              rows: [...n.querySelectorAll('[role="option"]')].map((r) => ({
                value: r.dataset.lensoValue,
                selected: r.getAttribute("aria-selected"),
                top: r.offsetTop,
                height: r.offsetHeight,
              })),
              selected: [...n.querySelectorAll('[data-slot="list-box-selected"]')].map(
                (n) => n.value,
              ),
            })),
          );
          await root.screenshot({ path: path.join(artifacts, `${engine}-failure.png`) });
          throw error;
        }
      };
      const chosen = async (value) => {
        await page.waitForFunction(
          (v) => document.querySelector('[data-testid="wheel-value"]')?.textContent === v,
          value,
        );
        await center();
      };
      const count = async () => Number(await page.getByTestId("wheel-count").textContent());
      const key = async (k, value) => {
        await page.keyboard.press(k);
        console.log(
          engine,
          k,
          value,
          await output.textContent(),
          await page.evaluate(() => document.activeElement?.id),
        );
        await chosen(value);
      };
      await root.scrollIntoViewIfNeeded();
      await center();
      assert.equal(await viewport.getAttribute("role"), "listbox");
      assert.equal(await viewport.locator('[aria-selected="true"]').count(), 1);
      assert.equal(
        await page.getByTestId("wheel-demo-option-thursday").getAttribute("tabindex"),
        "0",
      );
      await page.getByTestId("wheel-demo-option-thursday").focus();
      await key("ArrowDown", "friday");
      assert.equal(await count(), 1);
      await key("ArrowUp", "thursday");
      await key("ArrowUp", "tuesday");
      await key("End", "sunday");
      assert.equal(
        await page
          .getByTestId("wheel-demo-option-monday")
          .locator("[data-wheel-label]")
          .evaluate((n) => n.style.visibility),
        "hidden",
      );
      await key("Home", "monday");
      await page.getByTestId("wheel-direction").click();
      await page.getByTestId("wheel-demo-option-monday").focus();
      await key("ArrowDown", "tuesday");
      await page.getByTestId("wheel-direction").click();
      // Real browser wheel scrolling must settle to a different enabled value and center it.
      await viewport.hover();
      const beforeWheel = await output.textContent();
      await page.mouse.wheel(0, 140);
      await page.waitForFunction(
        (v) => document.querySelector('[data-testid="wheel-value"]').textContent !== v,
        beforeWheel,
      );
      await center();
      assert.notEqual(await output.textContent(), "wednesday");
      const rejectedValue = await output.textContent();
      await page.getByTestId("wheel-rejected").click();
      const before = await count();
      await viewport.evaluate((n) => {
        n.scrollTop = 0;
        n.dispatchEvent(new Event("scrollend"));
      });
      await settle(page);
      await center();
      assert.equal(await output.textContent(), rejectedValue);
      assert.ok((await count()) > before);
      await page.getByTestId("wheel-rejected").click();
      await page.getByTestId("wheel-disabled").click();
      const disabledValue = await output.textContent();
      assert.equal(await viewport.evaluate((n) => getComputedStyle(n).overflowY), "hidden");
      assert.equal(await viewport.locator('[tabindex="0"]').count(), 0);
      await viewport.evaluate((n) => {
        n.scrollTop = 32;
        n.dispatchEvent(new Event("scrollend"));
      });
      await settle(page);
      assert.equal(await output.textContent(), disabledValue);
      await page.getByTestId("wheel-disabled").click();
      await center();
      await page.getByTestId("wheel-replace").click();
      await center();
      await viewport.locator('[aria-selected="true"]').focus();
      await key("Home", "monday");
      await key("ArrowDown", "tuesday");
      await key("ArrowDown", "thursday");
      const removedLabel = await page
        .getByTestId("wheel-demo-option-thursday")
        .locator("[data-wheel-label]")
        .elementHandle();
      await page.getByTestId("wheel-removed").click();
      await center();
      assert.equal(await output.textContent(), "thursday");
      assert.equal(
        await viewport.locator('[aria-selected="true"]').getAttribute("data-lenso-value"),
        "monday",
      );
      assert.equal(await removedLabel.evaluate((n) => n.style.transform), "");
      await page.getByTestId("wheel-removed").click();
      await center();
      const labels = await viewport.locator("[data-wheel-label]").elementHandles();
      await page.getByTestId("wheel-empty").click();
      await settle(page);
      assert.equal(
        await root.locator('[data-slot="wheel-picker-empty"]').textContent(),
        "No days available",
      );
      for (const label of labels) assert.equal(await label.evaluate((n) => n.style.transform), "");
      await page.getByTestId("wheel-empty").click();
      await center();
      // Named form values use the effective value; controlled reset leaves state with the application.
      const form = await root.evaluate((n) => {
        const form = document.createElement("form");
        form.id = "wheel-form-fixture";
        document.body.append(form);
        n.querySelector('[data-slot="wheel-picker-form"]').dataset.lensoForm = form.id;
        return form.id;
      });
      await settle(page);
      assert.equal(
        await page.evaluate((id) => new FormData(document.getElementById(id)).get("weekday"), form),
        await output.textContent(),
      );
      await page.evaluate((id) => document.getElementById(id).reset(), form);
      await center();
      assert.equal(
        await root.locator('input[data-slot="wheel-picker-form"]').inputValue(),
        await output.textContent(),
      );
      await root.evaluate((n) => {
        n.querySelector('[data-slot="wheel-picker-form"]').dataset.lensoForm = "";
        document.getElementById("wheel-form-fixture").remove();
      });
      await root
        .locator('[data-slot="wheel-picker-form"]')
        .evaluate((n) => (n.dataset.lensoForm = "wheel-external-form"));
      await page.evaluate(() => {
        const f = document.createElement("form");
        f.id = "wheel-external-form";
        document.body.append(f);
      });
      await settle(page);
      assert.equal(
        await page.evaluate(() =>
          new FormData(document.getElementById("wheel-external-form")).get("weekday"),
        ),
        await output.textContent(),
      );
      await root
        .locator('[data-slot="wheel-picker-form"]')
        .evaluate((n) => (n.dataset.lensoForm = ""));
      await settle(page);
      await page.evaluate(() => document.getElementById("wheel-external-form").remove());
      await page.evaluate(() => (document.documentElement.style.fontSize = "20px"));
      await center();
      assert.equal(await viewport.evaluate((n) => n.clientHeight), 270);
      assert.equal(
        await viewport
          .locator('[role="option"]')
          .first()
          .evaluate((n) => n.offsetHeight),
        40,
      );
      await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
      await center();
      const captures = [];
      for (const width of [390, 820])
        for (const theme of ["light", "dark"]) {
          await page.setViewportSize({ width, height: 1000 });
          if ((theme === "dark") !== Boolean(await page.locator('[data-theme="dark"]').count()))
            await page.getByTestId("theme").click();
          await root.scrollIntoViewIfNeeded();
          await center();
          const geometry = await viewport.evaluate((n) => {
            const selected = n.querySelector('[aria-selected="true"]'),
              label = selected.querySelector("[data-wheel-label]");
            return {
              height: n.clientHeight,
              rowHeight: selected.offsetHeight,
              scrollTop: n.scrollTop,
              opacity: label.style.opacity,
              transform: label.style.transform,
            };
          });
          assert.equal(geometry.height, 216);
          assert.equal(geometry.rowHeight, 32);
          assert.equal(geometry.opacity, "1");
          assert.match(geometry.transform, /scale\(1\.15\)/);
          const file = path.join(artifacts, `${engine}-${width}-${theme}.png`);
          await root.screenshot({ path: file });
          captures.push({ width, theme, geometry, file, sha256: await fileHash(file) });
        }
      const label = await viewport
        .locator('[aria-selected="true"] [data-wheel-label]')
        .elementHandle();
      await viewport.evaluate((n) => {
        n.scrollTop = 32;
        n.dispatchEvent(new Event("scroll"));
      });
      await page.getByTestId("wheel-mounted").click();
      assert.equal(await label.evaluate((n) => n.style.transform), "");
      await page.getByTestId("wheel-mounted").click();
      await center();
      await page.reload();
      await page.waitForFunction(() =>
        document.getElementById("choices-list")?.hasAttribute("data-lenso-ready"),
      );
      await checkListBox(page, engine);
      const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      try {
        const p = await mobile.newPage();
        await loadContextCohort(p, server);
        await p.waitForFunction(() =>
          document.getElementById("wheel-demo-viewport")?.hasAttribute("data-lenso-ready"),
        );
        await p.getByTestId("wheel-demo-option-friday").tap();
        assert.equal(await p.getByTestId("wheel-value").textContent(), "friday");
      } finally {
        await mobile.close();
      }
      assert.deepEqual(errors, []);
      results.push({
        engine,
        version: browser.version(),
        network,
        captures,
        nativeWheel: "passed",
        nativeMobileTap: "passed",
        ListBoxRegression: "passed",
        errors,
      });
      console.log(
        engine,
        "wheel selection, projection, forms, cleanup and ListBox regression passed",
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
