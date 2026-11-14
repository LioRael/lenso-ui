import assert from "node:assert/strict";
import { keepDevFixture } from "./keep-dev-fixture.mjs";
import { chromium, webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://localhost:3000";
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
        hasTouch: width < 640,
      });
      page.setDefaultNavigationTimeout(90000);
      await keepDevFixture(page, base);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/en/docs/react/components/modal`, { waitUntil: "domcontentloaded" });
      await page.evaluate(async () => {
        const { mount } = await import("/test/presentation-panels-fixture.tsx");
        for (const child of document.body.children)
          if (child instanceof HTMLElement) child.hidden = true;
        const host = document.createElement("div");
        document.body.append(host);
        window.mountPresentation = (theme, direction) => mount(host, theme, direction);
      });
      for (const theme of ["light", "dark"]) {
        await page.evaluate((theme) => {
          window.disposePresentation?.();
          window.disposePresentation = window.mountPresentation(theme);
        }, theme);
        const profile = page.getByRole("button", { name: "Edit profile", exact: true });
        await profile.click();
        const modal = page.getByRole("dialog", { name: "Edit profile", exact: true });
        await modal.waitFor();
        await page.waitForFunction(
          (e) => !e.hasAttribute("data-starting-style"),
          await modal.elementHandle(),
        );
        const style = await modal.evaluate((e) => {
          const s = getComputedStyle(e),
            title = getComputedStyle(e.querySelector('[data-lenso-slot="modal-title"]'));
          const body = getComputedStyle(e.querySelector('[data-lenso-slot="modal-body"]'));
          const box = e.getBoundingClientRect();
          return {
            radius: s.borderRadius,
            filter: s.backdropFilter,
            background: s.backgroundColor,
            title: title.fontSize,
            body: body.fontSize,
            left: box.left,
            right: box.right,
            overflow: e.scrollWidth - e.clientWidth,
            buttonHeights: [...e.querySelector('[data-lenso-slot="modal-footer"]').children].map(
              (b) => b.getBoundingClientRect().height,
            ),
          };
        });
        assert.equal(style.radius, "32px");
        assert.notEqual(style.background, "rgba(0, 0, 0, 0)");
        assert.equal(style.filter, "none");
        assert.equal(style.title, "20px");
        assert.equal(style.body, "17px");
        assert.ok(style.left >= 0 && style.right <= width && style.overflow <= 1);
        assert.deepEqual(style.buttonHeights, [50, 50]);
        await modal.getByRole("textbox", { name: "Name", exact: true }).fill("Taylor");
        await modal.getByRole("textbox", { name: "Email", exact: true }).fill("taylor@example.com");
        await modal.getByRole("button", { name: "Save changes" }).click();
        await modal.waitFor({ state: "hidden" });
        await page.getByRole("status").filter({ hasText: "Profile saved for Taylor." }).waitFor();
        assert.equal(await profile.evaluate((e) => document.activeElement === e), true);
        await profile.click();
        await modal.waitFor();
        await page.waitForFunction(
          (e) => !e.hasAttribute("data-starting-style"),
          await modal.elementHandle(),
        );
        assert.equal(
          await modal.getByRole("textbox", { name: "Email", exact: true }).inputValue(),
          "taylor@example.com",
        );
        await modal.getByRole("textbox", { name: "Name", exact: true }).fill("Discarded");
        await modal.getByRole("button", { name: "Cancel", exact: true }).click();
        await profile.click();
        await modal.waitFor();
        await page.waitForFunction(
          (e) => !e.hasAttribute("data-starting-style"),
          await modal.elementHandle(),
        );
        assert.equal(
          await modal.getByRole("textbox", { name: "Name", exact: true }).inputValue(),
          "Taylor",
        );
        await page.keyboard.press("Escape");
        await modal.waitFor({ state: "hidden" });
        const preferences = page.getByRole("button", { name: "Reading preferences", exact: true });
        await preferences.click();
        const drawer = page.getByRole("dialog", { name: "Reading preferences", exact: true });
        await drawer.waitFor();
        assert.equal(
          await page.locator('[data-lenso-slot="drawer-backdrop"][data-open]').count(),
          1,
        );
        await page.waitForFunction(
          (e) => !e.hasAttribute("data-starting-style"),
          await drawer.elementHandle(),
        );
        const geometry = await drawer.evaluate((e) => {
          const s = getComputedStyle(e),
            b = e.getBoundingClientRect();
          const body = e.querySelector('[data-lenso-slot="drawer-body"]');
          return {
            top: b.top,
            bottom: b.bottom,
            right: b.right,
            radius: s.borderRadius,
            background: s.backgroundColor,
            overflow: e.scrollWidth - e.clientWidth,
            scrollable: getComputedStyle(body).overflowY,
            buttonHeights: [...e.querySelector('[data-lenso-slot="drawer-footer"]').children].map(
              (b) => b.getBoundingClientRect().height,
            ),
          };
        });
        const inset = width >= 640 ? 12 : 8;
        assert.ok(
          Math.abs(geometry.top - inset) < 1 && Math.abs(900 - geometry.bottom - inset) < 1,
        );
        assert.ok(Math.abs(width - geometry.right - inset) < 1);
        assert.equal(geometry.radius, "32px");
        assert.equal(geometry.background, style.background);
        assert.equal(geometry.scrollable, "auto");
        assert.ok(geometry.overflow <= 1);
        assert.deepEqual(geometry.buttonHeights, [50, 50]);
        const images = drawer.getByRole("switch", { name: "Show images", exact: true });
        await images.click();
        assert.equal(await images.getAttribute("aria-checked"), "false");
        await drawer.getByRole("button", { name: "Reset", exact: true }).click();
        assert.equal(await images.getAttribute("aria-checked"), "true");
        await drawer.getByRole("button", { name: "Done", exact: true }).click();
        await drawer.waitFor({ state: "hidden" });
        assert.equal(await preferences.evaluate((e) => document.activeElement === e), true);
        await page.getByRole("button", { name: "Full-screen content", exact: true }).click();
        const full = page.getByRole("dialog", { name: "Full-screen content", exact: true });
        await full.waitFor();
        await page.waitForFunction(
          (e) => !e.hasAttribute("data-starting-style"),
          await full.elementHandle(),
        );
        assert.deepEqual(
          await full.evaluate((e) => {
            const b = e.getBoundingClientRect(),
              s = getComputedStyle(e);
            return [b.x, b.y, b.width, b.height, s.borderRadius, s.backgroundColor];
          }),
          [0, 0, width, 900, "0px", "rgb(17, 23, 31)"],
        );
        await full.getByRole("button", { name: "Close full screen" }).click();
        await full.waitFor({ state: "hidden" });
        for (const side of ["left", "top", "bottom"]) {
          await page.getByRole("button", { name: `${side} panel`, exact: true }).click();
          const panel = page.getByRole("dialog", { name: `${side} panel`, exact: true });
          await panel.waitFor();
          await page.waitForFunction(
            (e) => !e.hasAttribute("data-starting-style"),
            await panel.elementHandle(),
          );
          await panel.getByRole("button", { name: "Close panel" }).click();
          await panel.waitFor({ state: "hidden" });
        }
        await page.getByRole("button", { name: "Photo actions", exact: true }).click();
        const actions = page.getByRole("dialog", { name: "Manage this photo", exact: true });
        await actions.waitFor();
        assert.equal(
          await page.locator('[data-lenso-slot="action-sheet-backdrop"][data-open]').count(),
          1,
        );
        await actions.getByRole("button", { name: "Cancel", exact: true }).click();
        await actions.waitFor({ state: "hidden" });
        console.log(
          "PASS",
          name,
          width,
          theme,
          "panel geometry, form save/cancel, preferences, focus, full-screen overrides and native directional presentations",
        );
      }
      await page.evaluate(() => {
        window.disposePresentation();
        window.disposePresentation = window.mountPresentation("light", "rtl");
      });
      await page.getByRole("button", { name: "Reading preferences", exact: true }).click();
      const rtl = page.getByRole("dialog", { name: "Reading preferences", exact: true });
      await rtl.waitFor();
      await page.waitForFunction(
        (e) => !e.hasAttribute("data-starting-style"),
        await rtl.elementHandle(),
      );
      assert.ok(
        await rtl.evaluate(
          (e) =>
            Math.abs(
              e.querySelector('[data-lenso-slot="drawer-close"]').getBoundingClientRect().left -
                e.getBoundingClientRect().left -
                16,
            ) < 1,
        ),
      );
      if (name === "chromium" && width === 390) {
        const box = await rtl.boundingBox();
        const session = await page.context().newCDPSession(page);
        const x = box.x + 60,
          y = box.y + 36;
        await session.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x, y }],
        });
        for (const distance of [20, 80, 160, 230]) {
          await session.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x: x + distance, y }],
          });
          await page.waitForTimeout(20);
        }
        await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await rtl.waitFor({ state: "hidden", timeout: 3000 });
        await session.detach();
      } else {
        await page.keyboard.press("Escape");
        await rtl.waitFor({ state: "hidden" });
      }
      await page.getByRole("button", { name: "Long content", exact: true }).click();
      const long = page.getByRole("dialog", { name: "Long content", exact: true });
      await long.waitFor();
      const fixed = await long.evaluate((e) => {
        const body = e.querySelector('[data-lenso-slot="modal-body"]');
        const header = e.querySelector('[data-lenso-slot="modal-header"]'),
          footer = e.querySelector('[data-lenso-slot="modal-footer"]');
        const before = [header.getBoundingClientRect().y, footer.getBoundingClientRect().y];
        body.scrollTop = body.scrollHeight;
        return {
          scrolled: body.scrollTop > 0,
          before,
          after: [header.getBoundingClientRect().y, footer.getBoundingClientRect().y],
        };
      });
      assert.equal(fixed.scrolled, true);
      assert.deepEqual(fixed.after, fixed.before);
      await long.getByRole("button", { name: "Done reading" }).click();
      await long.waitFor({ state: "hidden" });
      await page.getByRole("button", { name: "Confirm deletion" }).click();
      const alert = page.getByRole("alertdialog", { name: "Delete note?", exact: true });
      await alert.waitFor();
      await alert.locator("[data-lenso-live-rim]").waitFor({ state: "attached" });
      const alertOverflow = await alert.evaluate((e) =>
        [e, ...e.querySelectorAll("*")]
          .filter((node) => /auto|scroll/.test(getComputedStyle(node).overflow))
          .map((node) => [
            node.scrollWidth - node.clientWidth,
            node.scrollHeight - node.clientHeight,
          ]),
      );
      assert.ok(
        alertOverflow.every(([x, y]) => x === 0 && y === 0),
        "short alert must not scroll",
      );
      await page.setViewportSize({ width, height: 160 });
      const alertScroll = await alert.evaluate((e) => {
        const scroller = [e, ...e.querySelectorAll("*")].find(
          (node) =>
            /auto|scroll/.test(getComputedStyle(node).overflowY) &&
            node.scrollHeight > node.clientHeight,
        );
        if (!scroller) return null;
        scroller.scrollTop = scroller.scrollHeight;
        return { top: scroller.scrollTop, horizontal: scroller.scrollWidth - scroller.clientWidth };
      });
      assert.ok(alertScroll?.top > 0, "alert content stays scrollable in a short viewport");
      assert.equal(alertScroll.horizontal, 0);
      await page.setViewportSize({ width, height: 900 });
      await page.mouse.click(2, 2);
      assert.equal(await alert.isVisible(), true);
      await alert.getByRole("button", { name: "Keep note" }).click();
      await alert.waitFor({ state: "hidden" });
      await page.getByRole("button", { name: "Bottom sheet" }).click();
      const sheet = page.getByRole("dialog", { name: "Bottom sheet", exact: true });
      await sheet.waitFor();
      const surface = sheet.locator('[data-lenso-slot="sheet-surface"]');
      await page.waitForFunction(
        (e) => !e.hasAttribute("data-starting-style"),
        await sheet.elementHandle(),
      );
      const partialFilter = await surface.evaluate((e) => getComputedStyle(e).backdropFilter);
      if (width < 768) assert.notEqual(partialFilter, "none", "partial mobile sheet retains Glass");
      else assert.equal(partialFilter, "none", "desktop sheet uses a solid frame");
      await sheet.getByRole("button", { name: "Expand sheet" }).click();
      await page.waitForFunction(
        (e) => e.hasAttribute("data-expanded"),
        await sheet.elementHandle(),
      );
      assert.equal(await surface.evaluate((e) => getComputedStyle(e).backdropFilter), "none");
      assert.notEqual(
        await surface.evaluate((e) => getComputedStyle(e).backgroundColor),
        "rgba(0, 0, 0, 0)",
      );
      await sheet.getByRole("button", { name: "Close", exact: true }).click();
      await sheet.waitFor({ state: "hidden" });
      console.log(
        "PASS",
        name,
        width,
        "RTL dismissal, scroll ownership, distinct AlertDialog semantics and Sheet composition",
      );
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
