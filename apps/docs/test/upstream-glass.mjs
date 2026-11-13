import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import { keepDevFixture } from "./keep-dev-fixture.mjs";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
const baseline = process.env.BASELINE === "1";
const capture = process.env.CAPTURE_DIR;

for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        deviceScaleFactor: 2,
        colorScheme: theme,
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await keepDevFixture(page, base);
      await page.goto(`${base}/en/docs/react/components/sheet`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");
      await page.evaluate(async (theme) => {
        const { mount } = await import("/test/upstream-glass-fixture.tsx");
        for (const child of document.body.children)
          if (child instanceof HTMLElement) child.hidden = true;
        const host = document.createElement("div");
        document.body.append(host);
        window.mountComparison = (direction) => mount(host, theme, direction);
        window.disposeComparison = mount(host, theme);
      }, theme);
      const group = page.locator("[data-tab-bar-group]").last();
      await group.locator("[data-tab-bar-destination]").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      const links = group.locator("[data-tab-bar-list] [data-tab-bar-destination]");
      const indicator = group.locator('[data-lenso-slot="tab-bar-indicator"]');
      assert.equal(await indicator.count(), 1);
      // Record presentation each frame, including the down/up distinction of a quick tap.
      await indicator.evaluate((node) => {
        window.tabSamples = [];
        const start = performance.now();
        const tick = () => {
          window.tabSamples.push({
            t: performance.now() - start,
            x: new DOMMatrix(getComputedStyle(node).transform).m41,
          });
          if (performance.now() - start < 1000) requestAnimationFrame(tick);
        };
        tick();
      });
      const destination = links.nth(2);
      const box = await destination.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(60);
      await page.mouse.up();
      await page.waitForTimeout(1100);
      const motion = await page.evaluate(() => {
        const samples = window.tabSamples;
        const start = samples[0].x,
          target = samples.at(-1).x,
          distance = target - start;
        const values = samples.map((s) => ({ t: s.t, progress: (s.x - start) / distance }));
        const peak = Math.max(...values.map((s) => s.progress));
        return { peak, reaches90: values.find((s) => s.progress >= 0.9)?.t, final: target };
      });
      assert.equal(await destination.getAttribute("aria-current"), "page");
      if (!baseline) assert.ok(motion.peak > 1.015 && motion.peak < 1.1, JSON.stringify(motion));
      console.log(name, theme, "tap", motion);
      await links.first().focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(700);
      assert.equal(await links.first().getAttribute("aria-current"), "page");
      await links.nth(1).click();
      await links.nth(3).click();
      await page.waitForTimeout(700);
      assert.equal(
        await links.nth(3).getAttribute("aria-current"),
        "page",
        "interruption retains the latest destination",
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await links.first().click();
      assert.equal(await links.first().getAttribute("aria-current"), "page");
      const reduced = await indicator.evaluate(
        (node) => new DOMMatrix(getComputedStyle(node).transform).m41,
      );
      await page.waitForTimeout(100);
      assert.equal(
        await indicator.evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).m41),
        reduced,
      );
      await page.emulateMedia({ reducedMotion: "no-preference" });

      const glass = page.getByRole("button", { name: "Stationary glass", exact: true });
      await page.waitForFunction(
        (node) => node.hasAttribute("data-lenso-glass-foreground-rim"),
        await glass.elementHandle(),
      );
      const rim = () =>
        glass.evaluate(
          (node) =>
            node.querySelector("[data-lenso-live-rim]")?.toDataURL() ??
            /url\("?([^")]+)/.exec(getComputedStyle(node, "::after").backgroundImage)?.[1],
        );
      const resting = await rim();
      const filter = await glass.evaluate((node) => node.style.getPropertyValue("--lg-filter"));
      if (capture) await glass.screenshot({ path: `${capture}/${name}-${theme}-rest.png` });
      await glass.focus();
      await page.keyboard.down("Space");
      await page.waitForTimeout(100);
      const held = await rim();
      if (capture) await glass.screenshot({ path: `${capture}/${name}-${theme}-held.png` });
      await page.keyboard.up("Space");
      await page.waitForTimeout(300);
      assert.equal(await page.getByRole("status", { name: "Actions" }).textContent(), "1");
      assert.equal(await rim(), resting, "release restores the original rim");
      if (!baseline) assert.notEqual(held, resting, "held glass must brighten its edge");
      assert.equal(
        await glass.evaluate((node) => node.style.getPropertyValue("--lg-filter")),
        filter,
        "pressing does not refit the backdrop filter",
      );
      const light = await page.evaluate(
        async (images) => {
          const totals = [];
          for (const src of images) {
            const image = new Image();
            image.src = src;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0);
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
            let total = 0;
            for (let i = 0; i < pixels.length; i += 4) total += (pixels[i] * pixels[i + 3]) / 255;
            totals.push(total);
          }
          return totals;
        },
        [resting, held],
      );
      if (!baseline) assert.ok(light[1] > light[0] * 1.2, `rim light ${light}`);
      await glass.evaluate((node) =>
        node.dispatchEvent(
          new PointerEvent("pointerdown", {
            pointerId: 37,
            isPrimary: true,
            pointerType: "touch",
            button: 0,
            bubbles: true,
          }),
        ),
      );
      await page.waitForTimeout(50);
      await page.evaluate(() =>
        window.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 37 })),
      );
      await page.waitForTimeout(100);
      assert.equal(await rim(), resting, "cancellation restores the rim");
      console.log(name, theme, "rim changed", held !== resting);
      const disabled = page.getByRole("button", { name: "Disabled glass", exact: true });
      await disabled.dispatchEvent("pointerdown", {
        pointerId: 38,
        isPrimary: true,
        pointerType: "touch",
        button: 0,
      });
      assert.equal(await disabled.getAttribute("data-lenso-light-pressed"), null);

      const trigger = page.getByRole("button", { name: "Open comparison sheet", exact: true });
      await trigger.click();
      const sheet = page.getByRole("dialog", { name: "Comparison sheet", exact: true });
      await sheet.waitFor();
      await page.waitForTimeout(700);
      const body = sheet.locator('[data-lenso-slot="sheet-body"]');
      const measure = () =>
        sheet.evaluate((node) => ({
          y: node.getBoundingClientRect().y,
          scroll: node.querySelector('[data-lenso-slot="sheet-body"]').scrollTop,
          expanded: node.hasAttribute("data-expanded"),
        }));
      if (name === "chromium") {
        const session = await page.context().newCDPSession(page);
        const drag = async (x, y, dx, dy, end = "touchEnd") => {
          await session.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [{ x, y }],
          });
          for (let i = 1; i <= 12; i++) {
            await session.send("Input.dispatchTouchEvent", {
              type: "touchMove",
              touchPoints: [{ x: x + (dx * i) / 12, y: y + (dy * i) / 12 }],
            });
            await page.waitForTimeout(25);
          }
          const during = await measure();
          await page.waitForTimeout(180);
          await session.send("Input.dispatchTouchEvent", { type: end, touchPoints: [] });
          await page.waitForTimeout(600);
          return during;
        };
        const before = await measure();
        const b = await body.boundingBox();
        const upward = await drag(b.x + b.width - 20, b.y + b.height - 30, 0, -180);
        assert.ok(
          upward.scroll > 0 && Math.abs(upward.y - before.y) < 1,
          "Base UI retains native body scrolling at a partial detent",
        );
        console.log(name, theme, "sheet upward body", {
          before,
          during: upward,
          after: await measure(),
        });
        await sheet.getByRole("button", { name: "Toggle detent" }).click();
        await page.waitForTimeout(650);
        assert.equal((await measure()).expanded, true);
        await body.evaluate((node) => (node.scrollTop = 200));
        const full = await measure();
        const fb = await body.boundingBox();
        await drag(fb.x + fb.width - 20, fb.y + 80, 0, 75);
        const scrolled = await measure();
        assert.ok(scrolled.scroll < full.scroll && scrolled.scroll > 0);
        assert.ok(Math.abs(scrolled.y - full.y) < 1, "content scrolls before sheet shrinks");
        await body.evaluate((node) => (node.scrollTop = 0));
        const canceled = await drag(fb.x + fb.width - 20, fb.y + 80, 0, 100, "touchCancel");
        assert.ok(canceled.y > full.y + 30, "body can start a sheet drag at its scroll edge");
        assert.equal((await measure()).expanded, true, "canceled touch retains the detent");
        const horizontal = sheet.locator('[data-case="horizontal"]');
        await horizontal.scrollIntoViewIfNeeded();
        const hb = await horizontal.boundingBox();
        await drag(hb.x + hb.width - 35, hb.y + hb.height / 2, -130, 0);
        assert.ok(await horizontal.evaluate((node) => node.scrollLeft > 0));
        assert.ok(
          Math.abs((await measure()).y - full.y) < 1,
          "horizontal scrolling retains its axis",
        );
        const range = sheet.getByRole("slider", { name: "Sheet range" });
        const rb = await range.boundingBox();
        const oldValue = Number(await range.getAttribute("aria-valuenow"));
        await drag(rb.x + rb.width / 2, rb.y + rb.height / 2, 70, 0);
        assert.notEqual(Number(await range.getAttribute("aria-valuenow")), oldValue);
        assert.ok(
          Math.abs((await measure()).y - full.y) < 1,
          "Slider retains native value and gesture ownership",
        );
        await session.detach();
      }
      await sheet.getByRole("textbox", { name: "Sheet text" }).fill("Retained input");
      assert.equal(
        await sheet.getByRole("textbox", { name: "Sheet text" }).inputValue(),
        "Retained input",
      );
      await page.keyboard.press("Escape");
      await sheet.waitFor({ state: "hidden" });
      assert.equal(await trigger.evaluate((node) => document.activeElement === node), true);
      await page.setViewportSize({ width: 1100, height: 900 });
      await page.evaluate(() => {
        window.disposeComparison();
        window.disposeComparison = window.mountComparison("rtl");
      });
      const rtl = page.getByRole("navigation", { name: "Main navigation", exact: true });
      await rtl.waitFor();
      await page.waitForTimeout(500);
      const rtlDestination = rtl.getByRole("link", { name: "Recent", exact: true });
      await rtlDestination.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(700);
      assert.equal(await rtlDestination.getAttribute("aria-current"), "page");
      const aligned = await rtl.evaluate((node) => {
        const target = node.querySelector("[data-current]").getBoundingClientRect();
        const lens = node
          .querySelector('[data-lenso-slot="tab-bar-indicator"]')
          .getBoundingClientRect();
        return Math.abs(target.x + target.width / 2 - lens.x - lens.width / 2) < 1;
      });
      assert.ok(aligned, "desktop RTL indicator aligns with the keyboard-selected destination");
      if (name === "chromium") {
        await page.emulateMedia({ forcedColors: "active" });
        const stationary = page.getByRole("button", { name: "Stationary glass", exact: true });
        await page.waitForFunction(
          (node) => node.hasAttribute("data-lenso-glass-opaque"),
          await stationary.elementHandle(),
        );
        await stationary.focus();
        await page.keyboard.down("Space");
        assert.equal(await stationary.locator("[data-lenso-live-rim]").count(), 0);
        await page.keyboard.up("Space");
      }
      console.log(
        name,
        theme,
        "keyboard, interruption, reduced motion, cancellation, Sheet controls, focus and desktop RTL passed",
      );
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
