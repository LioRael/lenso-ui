import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
const out = process.env.MOTION_OUTPUT ?? "/tmp/lenso-menu-select/browser";
await mkdir(out, { recursive: true });
const records = [];
for (const [engine, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await type.launch(
    engine === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const width of [1440, 390]) {
      if (process.env.MOTION_CASE && process.env.MOTION_CASE !== `${engine}-${width}`) continue;
      const page = await browser.newPage({
        viewport: { width, height: width === 390 ? 844 : 1000 },
        hasTouch: width === 390,
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push({ message: error.message, url: page.url() }));
      await page.addInitScript(() => {
        window.sampleMotion = (family, trigger) => {
          window.motionFrames = [];
          const started = performance.now();
          let card;
          const frame = () => {
            if (!card?.isConnected) {
              const slot = family === "menu" ? "menu-popup" : "select-popover";
              const owned = document.getElementById(trigger.getAttribute("aria-controls") ?? "");
              card =
                owned?.closest(`[data-slot="${slot}"]`) ??
                document.querySelector(`[data-slot="${slot}"][data-open]`);
            }
            if (card) {
              const surface = card.querySelector(`[data-slot="${family}-surface"]`);
              const glyph = card.querySelector(`[data-slot="${family}-glyph"]`);
              const icon = glyph?.querySelector("svg");
              const box = surface?.getBoundingClientRect();
              const content = card.querySelector(
                family === "menu" ? '[data-slot="menu-content"]' : "[data-select-content]",
              );
              window.motionFrames.push({
                t: performance.now() - started,
                morphing: card.hasAttribute("data-menu-morphing"),
                width: box?.width,
                height: box?.height,
                x: box?.x,
                y: box?.y,
                glyphOpacity: Number(glyph?.style.opacity),
                iconWidth: icon?.getBoundingClientRect().width,
                iconHeight: icon?.getBoundingClientRect().height,
                triggerTransform: trigger.style.transform,
                triggerHeight: trigger.getBoundingClientRect().height,
                triggerWidth: trigger.getBoundingClientRect().width,
                triggerOpacity: Number(getComputedStyle(trigger).opacity),
                sourceIconWidth: trigger.querySelector("svg")?.getBoundingClientRect().width,
                sourceIconHeight: trigger.querySelector("svg")?.getBoundingClientRect().height,
                glyphTransform: glyph?.style.transform,
                contentFilter: content?.style.filter,
              });
            }
            if (performance.now() - started < 650) requestAnimationFrame(frame);
          };
          frame();
        };
      });
      await page.goto(`${base}/cn/docs/react/components/select`, { waitUntil: "domcontentloaded" });
      const select = page.getByRole("combobox", { name: "State", exact: true });
      await select.waitFor();
      await select.scrollIntoViewIfNeeded();
      await select.evaluate((e) => window.sampleMotion("select", e));
      if (width === 390) await select.tap();
      else await select.click();
      await page.getByRole("option", { name: "Washington", exact: true }).waitFor();
      await page.waitForTimeout(700);
      const side = await page
        .locator('[data-slot="select-popover"][data-open]')
        .getAttribute("data-side");
      if (width === 390) assert.notEqual(side, "none", "touch must exercise ordinary placement");
      const opening = await page.evaluate(() => window.motionFrames);
      assert.ok(
        opening.some((f) => f.morphing),
        "Select must use the shared morph timeline",
      );
      assert.ok(
        opening.every((f) => Number.isFinite(f.width) && Number.isFinite(f.height)),
        "invalid Select geometry",
      );
      // Opening samples do not catch a plate misplaced after keyboard scrolling.
      for (const key of ["Home", "ArrowDown", "End"]) {
        await page.keyboard.press(key);
        await page.waitForTimeout(140);
        const error = await page
          .locator('[data-slot="select-popover"][data-open]')
          .evaluate((e) => {
            const row = e.querySelector('[role="option"][data-highlighted]');
            const plate = e.querySelector('[data-slot="select-plate"]');
            if (!row || !plate) return Infinity;
            const a = row.getBoundingClientRect(),
              b = plate.getBoundingClientRect();
            return Math.max(...["x", "y", "width", "height"].map((k) => Math.abs(a[k] - b[k])));
          });
        assert.ok(error < 1, `Select highlight drift after ${key}: ${error}px`);
      }
      await page.screenshot({ path: `${out}/${engine}-${width}-select.png` });
      if (width === 390) await page.getByRole("option", { name: "Washington", exact: true }).tap();
      else {
        await page.keyboard.press("End");
        await page.keyboard.press("Enter");
      }
      await page.getByRole("listbox").waitFor({ state: "hidden" });
      assert.match(await select.textContent(), /Washington/);
      assert.equal(await select.evaluate((e) => document.activeElement === e), true);
      await select.click();
      await page.getByRole("listbox").waitFor();
      await page.keyboard.press("Escape");
      await page.getByRole("listbox").waitFor({ state: "hidden" });
      assert.match(await select.textContent(), /Washington/, "Escape must preserve selection");
      assert.equal(await select.evaluate((e) => getComputedStyle(e).opacity), "1");
      records.push({ engine, width, family: "select", side, opening });

      await page.goto(`${base}/cn/docs/react/components/menu`, { waitUntil: "domcontentloaded" });
      const trigger = page.getByRole("button", { name: "Actions", exact: true });
      await trigger.scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        Boolean(
          document
            .querySelector('[data-slot="menu-trigger"][aria-label="Actions"]')
            ?.style.getPropertyValue("--lenso-glass-clarity"),
        ),
      );
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      // Sample shape against the animation clock, independently of host frame scheduling.
      const stamp = Date.now();
      await page.clock.install({ time: new Date(stamp) });
      await page.clock.pauseAt(new Date(stamp + 1000));
      const sourceBox = await trigger.boundingBox();
      await trigger.evaluate((e) => window.sampleMotion("menu", e));
      await trigger.click({ force: true });
      await page.clock.runFor(16);
      const popup = page.locator('[data-slot="menu-popup"][data-open]');
      await popup.waitFor();
      await page.clock.runFor(650);
      assert.equal(await popup.getAttribute("data-menu-motion"), "icon");
      const iconOpening = await page.evaluate(() => window.motionFrames);
      await writeFile(
        `${out}/${engine}-${width}-opening.json`,
        JSON.stringify(iconOpening, null, 2),
      );
      const first = iconOpening.find((f) => f.morphing);
      assert.ok(first, "missing icon opening frames");
      const early = iconOpening.filter((f) => f.morphing && f.t - first.t <= 100);
      assert.ok(
        early.some((f) => f.width > sourceBox.width * 1.5),
        "icon stayed narrow during early height expansion",
      );
      assert.ok(
        early.every((f) => f.height / f.width < 1.5),
        "icon became a falling stem",
      );
      const targetBox = await popup.boundingBox();
      const moving = early.find((f) => f.width > sourceBox.width * 1.5);
      const dx = targetBox.x + targetBox.width / 2 - sourceBox.x - sourceBox.width / 2;
      if (Math.abs(dx) > sourceBox.width / 2)
        assert.ok(
          (moving.x + moving.width / 2 - sourceBox.x - sourceBox.width / 2) * dx > 0,
          "icon did not travel toward the menu centre",
        );
      records.push({ engine, width, family: "menu-opening", opening: iconOpening });
      const iconSize = await trigger.locator("svg").first().boundingBox();
      await page.screenshot({ path: `${out}/${engine}-${width}-menu-open.png` });
      await trigger.evaluate((e) => window.sampleMotion("menu", e));
      await page.keyboard.press("Escape");
      await page.clock.runFor(700);
      const closing = await page.evaluate(() => window.motionFrames);
      await writeFile(`${out}/${engine}-${width}-closing.json`, JSON.stringify(closing, null, 2));
      const visible = closing.filter((f) => f.triggerOpacity > 0.5 && f.sourceIconWidth > 0);
      assert.ok(visible.length > 0, "returning source was never sampled");
      for (const f of visible) {
        assert.ok(Math.abs(f.sourceIconWidth - iconSize.width) < 1, JSON.stringify(f));
        assert.ok(Math.abs(f.sourceIconHeight - iconSize.height) < 1, JSON.stringify(f));
        assert.ok(
          Math.abs(f.triggerWidth / f.triggerHeight - sourceBox.width / sourceBox.height) < 0.02,
          "returning circle became an oval",
        );
      }
      assert.ok(
        closing.every((f) => !f.triggerTransform.includes("scaleX")),
        "icon source borrowed text-trigger squeeze",
      );
      assert.equal(await trigger.evaluate((e) => document.activeElement === e), true);
      assert.equal(await trigger.evaluate((e) => getComputedStyle(e).opacity), "1");
      records.push({ engine, width, family: "menu", closing });
      await page.clock.resume();

      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForFunction(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
      await trigger.click();
      await popup.waitFor();
      await page.waitForTimeout(100);
      assert.equal(await popup.getAttribute("data-menu-morphing"), null);
      await page.keyboard.press("Escape");
      await popup.waitFor({ state: "hidden" });
      await page.goto(`${base}/cn/docs/react/components/select`, { waitUntil: "domcontentloaded" });
      const reducedSelect = page.getByRole("combobox", { name: "State", exact: true });
      await reducedSelect.click();
      const reducedPopup = page.locator('[data-slot="select-popover"][data-open]');
      await reducedPopup.waitFor();
      await page.waitForTimeout(100);
      assert.equal(await reducedPopup.getAttribute("data-menu-morphing"), null);
      await page.keyboard.press("Escape");
      await reducedPopup.waitFor({ state: "hidden" });

      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.waitForFunction(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
      await page.goto(`${base}/cn/glass-lab`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => document.querySelector("[data-lenso-fusion-field]"));
      const label = page.getByRole("button", { name: "照片选项", exact: true });
      await label.click();
      await page.locator('[data-slot="menu-popup"][data-open]').waitFor();
      await page.waitForTimeout(650);
      const labelHeight = (await label.boundingBox()).height;
      await label.evaluate((e) => window.sampleMotion("menu", e));
      await page.keyboard.press("Escape");
      await page.waitForTimeout(700);
      const labelClosing = await page.evaluate(() => window.motionFrames);
      const returning = labelClosing.filter((f) => f.triggerTransform.includes("scaleX"));
      assert.ok(returning.length > 0, "text menu lost its return trajectory");
      assert.ok(
        returning.every((f) => Math.abs(f.triggerHeight - labelHeight) < 0.5),
        "text return stretched vertically",
      );
      records.push({ engine, width, family: "menu-label", closing: labelClosing });
      assert.deepEqual(errors, []);
      console.log("PASS", engine, width, "Select selection/focus and icon return");
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(`${out}/frames.json`, JSON.stringify(records, null, 2));
