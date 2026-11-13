import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, webkit } from "playwright";
const output = process.env.LIST_REFRESH_SCREENSHOTS;
if (output) await mkdir(output, { recursive: true });
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4312";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
      await page.goto(`${base}/en/list-lab`, { waitUntil: "networkidle", timeout: 120000 });
      assert.equal(await page.getByRole("main").getAttribute("id"), "main-content");
      const list = page.getByRole("list", { name: "Library entries", exact: true });
      await list.waitFor();
      const rows = () => list.locator("[data-list-key]");
      assert.equal(await rows().count(), 9);
      assert.equal(await page.getByRole("listbox").count(), 0);
      await page.getByRole("button", { name: "Refresh", exact: true }).click();
      await page.getByText("10 entries", { exact: true }).waitFor();
      await page
        .getByRole("navigation", { name: "Library sections" })
        .getByRole("link", { name: "C", exact: true })
        .click();
      assert.ok(
        (await page
          .locator('[data-lenso-slot="refresh-control-viewport"]')
          .evaluate((node) => node.scrollTop)) > 0,
      );
      assert.equal(await page.evaluate(() => scrollY), 0);
      await page
        .getByRole("navigation", { name: "Library sections" })
        .getByRole("link", { name: "A", exact: true })
        .click();
      const a = rows().filter({ has: page.getByText("Accessibility", { exact: true }) });
      await a.getByRole("button", { name: "Actions for Accessibility", exact: true }).click();
      assert.equal(await list.locator('[data-open-side="end"]').count(), 1);
      await page.getByRole("button", { name: "Edit", exact: true }).click();
      assert.equal(await list.locator('[data-open-side="end"],[data-swipe-trigger]').count(), 0);
      assert.ok(await page.getByRole("button", { name: "Refresh", exact: true }).isDisabled());
      await page.getByRole("checkbox", { name: "Select Accessibility", exact: true }).click();
      await page.getByRole("checkbox", { name: "Select Animation", exact: true }).click();
      await page.getByRole("button", { name: "Delete selected", exact: true }).click();
      assert.equal(await rows().count(), 8);
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      assert.equal(await rows().count(), 10);
      const handle = page.getByRole("button", { name: "Move Accessibility", exact: true });
      await handle.focus();
      await handle.press("Space");
      assert.equal(await handle.getAttribute("aria-pressed"), "true");
      await handle.press("ArrowDown");
      await handle.press("Enter");
      await page.waitForFunction(
        () =>
          document
            .querySelector('[aria-label="Move Accessibility"]')
            ?.getAttribute("aria-pressed") === "false",
      );
      assert.equal(await handle.getAttribute("aria-pressed"), "false");
      assert.ok(await handle.evaluate((node) => node === document.activeElement));
      const order = await rows().evaluateAll((nodes) => nodes.map((n) => n.dataset.listKey));
      assert.ok(order.indexOf("a-access") > order.indexOf("a-animation"));
      await handle.press("Space");
      await handle.press("ArrowUp");
      await handle.press("Escape");
      assert.deepEqual(
        await rows().evaluateAll((nodes) => nodes.map((n) => n.dataset.listKey)),
        order,
      );
      assert.equal(await page.getByRole("button", { name: "Done", exact: true }).count(), 1);
      await page.getByRole("button", { name: "Done", exact: true }).click();
      await a.getByRole("button", { name: "Actions for Accessibility", exact: true }).click();
      const animation = page.getByRole("button", { name: "Open Animation", exact: true });
      await animation.click();
      assert.equal(await page.getByRole("dialog").count(), 0);
      await animation.click();
      await page.getByRole("dialog").waitFor();
      await page.getByRole("button", { name: "Close", exact: true }).click();
      await page.waitForFunction(
        () => document.activeElement?.getAttribute("aria-label") === "Open Animation",
      );
      await a.getByRole("button", { name: "Actions for Accessibility", exact: true }).click();
      await a.getByRole("button", { name: "Delete", exact: true }).click();
      assert.equal(await rows().count(), 9);
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      assert.equal(await rows().count(), 10);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.getByRole("button", { name: "Edit", exact: true }).click();
      const source = page.getByRole("button", { name: "Move Accessibility", exact: true });
      const target = page.getByRole("button", { name: "Move Additional note 1", exact: true });
      await source.scrollIntoViewIfNeeded();
      const from = await source.boundingBox(),
        to = await target.boundingBox();
      await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
      const beforeCancel = await rows().evaluateAll((nodes) =>
        nodes.map((node) => node.dataset.listKey),
      );
      await page.mouse.down();
      await page.mouse.move(from.x + from.width / 2, from.y + 20);
      await source.dispatchEvent("pointercancel", { pointerId: 1, bubbles: true });
      await page.mouse.up();
      assert.deepEqual(
        await rows().evaluateAll((nodes) => nodes.map((node) => node.dataset.listKey)),
        beforeCancel,
      );
      assert.equal(await source.getAttribute("aria-pressed"), "false");
      assert.equal(await source.evaluate((node) => node.closest("li").style.transform), "");
      await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
      await page.mouse.down();
      await page.mouse.move(to.x + to.width / 2, to.y + 3, { steps: 8 });
      await page.mouse.up();
      const pointerOrder = await rows().evaluateAll((nodes) => nodes.map((n) => n.dataset.listKey));
      assert.ok(pointerOrder.indexOf("a-access") < pointerOrder.indexOf("a-refresh-1"));
      await page.getByRole("button", { name: "Done", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library sections" })
        .getByRole("link", { name: "A", exact: true })
        .click();
      await page
        .locator('[data-lenso-slot="refresh-control-viewport"]')
        .evaluate((node) => (node.scrollTop = 0));
      if (name === "chromium") {
        const cdp = await page.context().newCDPSession(page);
        const view = await page
          .locator('[data-lenso-slot="refresh-control-viewport"]')
          .boundingBox();
        const x = view.x + 80,
          y = view.y + 60;
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
        for (let dy = 20; dy <= 180; dy += 20) {
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x, y: y + dy }],
          });
          await page.waitForTimeout(20);
        }
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await page.getByText("11 entries", { exact: true }).waitFor();
        assert.equal(await page.getByRole("dialog").count(), 0);
        const count = await rows().count();
        const first = await page
          .getByRole("button", { name: "Open Accessibility", exact: true })
          .boundingBox();
        const sy = first.y + first.height / 2;
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: first.x + first.width - 12, y: sy }],
        });
        for (let dx = 20; dx <= 140; dx += 20) {
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x: first.x + first.width - 12 - dx, y: sy }],
          });
          await page.waitForTimeout(20);
        }
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await list.locator('[data-list-key="a-access"] [data-open-side="end"]').waitFor();
        assert.equal(await rows().count(), count);
        assert.equal(await page.getByRole("dialog").count(), 0);
        await page.getByRole("button", { name: "Actions for Accessibility", exact: true }).click();
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x, y: y + 220 }],
        });
        for (let dy = 20; dy <= 160; dy += 20) {
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x, y: y + 220 - dy }],
          });
          await page.waitForTimeout(20);
        }
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await page.waitForFunction(
          () =>
            document.querySelector('[data-lenso-slot="refresh-control-viewport"]').scrollTop > 0,
        );
        assert.equal(await rows().count(), count);
        await cdp.detach();
      }
      assert.deepEqual(errors, []);
      if (output) await page.screenshot({ path: join(output, `${name}-${theme}.png`) });
      console.log(
        `${name} ${theme}: refresh, index, swipe, multi-select, delete/undo, keyboard reorder and focus passed`,
      );
      await page.setViewportSize({ width: 320, height: 740 });
      await page.evaluate(() => (document.documentElement.dir = "rtl"));
      await page.getByRole("button", { name: "Edit", exact: true }).click();
      await page.addStyleTag({
        content:
          '[data-lenso-slot="list-title"] {font-size:26px!important;line-height:34px!important} [data-lenso-slot="list-description"] {font-size:22px!important;line-height:28px!important}',
      });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.ok(
        await page.getByRole("checkbox", { name: "Select Accessibility", exact: true }).count(),
      );
      assert.ok(
        await page
          .getByRole("heading", { name: "Library", level: 1, exact: true })
          .evaluate((node) => node.clientWidth >= node.scrollWidth),
      );
      if (output) await page.screenshot({ path: join(output, `${name}-${theme}-editing-rtl.png`) });
      const beforeEmpty = await rows().count();
      await page.getByRole("button", { name: "Select all", exact: true }).click();
      await page.getByRole("button", { name: "Delete selected", exact: true }).click();
      assert.equal(await rows().count(), 0);
      await page.getByText("The library is empty", { exact: true }).waitFor();
      assert.ok(await page.getByRole("button", { name: "Load entries", exact: true }).isDisabled());
      await page.getByRole("button", { name: "Done", exact: true }).click();
      await page.getByRole("button", { name: "Load entries", exact: true }).click();
      await page.waitForFunction(() => document.querySelectorAll("[data-list-key]").length === 1);
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      assert.equal(await rows().count(), beforeEmpty + 1);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
