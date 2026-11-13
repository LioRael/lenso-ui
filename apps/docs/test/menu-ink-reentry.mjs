import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
const out = process.env.MOTION_OUTPUT ?? "/tmp/lenso-menu-ink-reentry";
await mkdir(out, { recursive: true });
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
        viewport: { width, height: 1000 },
        hasTouch: width === 390,
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/cn`, { waitUntil: "domcontentloaded" });
      await page.locator("[data-home-showcase]").waitFor();
      await page.evaluate(async () => {
        const { mount } = await import("/test/menu-motion-fixture.tsx");
        for (const child of document.body.children)
          if (child instanceof HTMLElement) child.hidden = true;
        const host = document.createElement("div");
        document.body.append(host);
        mount(host);
      });
      for (const [family, role, name] of [
        ["menu", "button", "Plain actions"],
        ["select", "combobox", "Plain sort"],
      ]) {
        const trigger = page.getByRole(role, { name, exact: true });
        await trigger.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        const before = await trigger.boundingBox();
        await trigger.evaluate((source, family) => {
          window.inkFrames = [];
          const start = performance.now();
          const sample = () => {
            const popup = document.querySelector(
              `[data-lenso-slot="${family === "menu" ? "menu-popup" : "select-popover"}"][data-open]`,
            );
            const content = popup?.querySelector(
              family === "menu" ? '[data-lenso-slot="menu-content"]' : "[data-select-content]",
            );
            if (popup)
              window.inkFrames.push({
                t: performance.now() - start,
                filter: content?.style.filter,
                opacity: getComputedStyle(source).opacity,
                morphing: popup.hasAttribute("data-menu-morphing"),
              });
            if (performance.now() - start < 700) requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
        }, family);
        await trigger.click();
        const popup = page.locator('[data-menu-motion="anchored"][data-open]');
        await popup.waitFor();
        await page.waitForTimeout(750);
        const frames = await page.evaluate(() => window.inkFrames);
        await writeFile(
          `${out}/${engine}-${width}-${family}.json`,
          JSON.stringify(frames, null, 2),
        );
        const first = frames.find((f) => f.morphing);
        assert.ok(first, "anchored popup skipped its shape motion");
        assert.ok(
          frames.some(
            (f) =>
              f.t - first.t > 200 &&
              f.t - first.t < 380 &&
              f.filter?.includes("url(") &&
              f.filter.includes("blur("),
          ),
          "menu ink lost its late blur/refraction tail",
        );
        assert.ok(
          frames.every((f) => Number(f.opacity) === 1),
          "non-morph trigger was masked",
        );
        const after = await trigger.boundingBox();
        assert.ok(
          Math.abs(after.x - before.x) < 0.5 && Math.abs(after.y - before.y) < 0.5,
          "non-morph trigger moved",
        );
        const content = popup.locator(
          family === "menu" ? '[data-lenso-slot="menu-content"]' : "[data-select-content]",
        );
        assert.equal(await content.evaluate((e) => e.style.filter), "");
        if (family === "menu") {
          const geometry = await popup
            .getByRole("menuitem")
            .first()
            .evaluate((e) => ({
              height: e.getBoundingClientRect().height,
              padding: getComputedStyle(e).paddingInlineStart,
              inset: e.getBoundingClientRect().left - e.parentElement.getBoundingClientRect().left,
            }));
          assert.equal(geometry.height, 42);
          assert.equal(geometry.padding, "20px");
          assert.equal(geometry.inset, 8);
          await page.screenshot({ path: `${out}/${engine}-${width}-anchored-menu.png` });
          await page.keyboard.press("Escape");
        } else {
          await page.keyboard.press("End");
          await page.keyboard.press("Enter");
          await page.waitForTimeout(450);
          assert.match(await trigger.innerText(), /Size/);
        }
        await popup.waitFor({ state: "hidden" });
        await page.waitForFunction(
          (e) => e === document.activeElement,
          await trigger.elementHandle(),
        );
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.getByRole("button", { name: "Plain actions", exact: true }).click();
      await page.waitForTimeout(100);
      assert.equal(
        await page.locator('[data-lenso-slot="menu-popup"]').getAttribute("data-menu-morphing"),
        null,
      );
      await page.keyboard.press("Escape");
      await page.goto(`${base}/cn`, { waitUntil: "domcontentloaded" });
      const showcase = page.locator("[data-home-showcase]");
      await showcase.scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        document.querySelector("[data-home-showcase] [data-material-lens][data-material-filter]"),
      );
      if (engine === "webkit")
        await page.waitForFunction(() =>
          document.querySelector("[data-home-showcase] [inert] img"),
        );
      await page.waitForTimeout(700);
      await page.evaluate(() => {
        window.retainedGlass = [
          ...document.querySelectorAll(
            "[data-home-showcase] [data-material-lens], [data-home-showcase] [inert] img",
          ),
        ];
        window.homeScroll = scrollY;
        scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
      });
      await page.waitForTimeout(500);
      await page.evaluate(() => scrollTo({ top: window.homeScroll, behavior: "instant" }));
      await page.waitForTimeout(700);
      assert.equal(
        await page.evaluate(() => window.retainedGlass.every((e) => e.isConnected)),
        true,
        "unchanged glass rebuilt after re-entry",
      );
      if (engine === "webkit") {
        await page.evaluate(() =>
          scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
        );
        await page.waitForTimeout(300);
        await page.evaluate(() => {
          document.querySelector(
            "[data-home-showcase] [data-lenso-backdrop] [role=tabpanel] > img",
          ).src = "/assets/demo/photos/10.jpg";
        });
        await page.waitForTimeout(400);
        await page.evaluate(() => scrollTo({ top: window.homeScroll, behavior: "instant" }));
        await page.waitForFunction(() =>
          [...document.querySelectorAll("[data-home-showcase] [inert] img")].some((e) =>
            e.src.endsWith("/10.jpg"),
          ),
        );
      }
      assert.deepEqual(errors, []);
      console.log(
        "PASS",
        engine,
        width,
        "anchored Menu/Select ink, spacing, focus and glass re-entry",
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
