import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
// Timeline unit tests cannot detect a component replacing its presenter on reopen.
for (const [engine, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await type.launch();
  try {
    for (const width of [1440, 390]) {
      if (process.env.MOTION_CASE && process.env.MOTION_CASE !== `${engine}-${width}`) continue;
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/cn/docs/react/components/menu`, { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Actions", exact: true }).waitFor();
      await page.evaluate(async () => {
        const { mount } = await import("/test/menu-close-fixture.tsx");
        for (const child of document.body.children)
          if (child instanceof HTMLElement) child.hidden = true;
        const host = document.createElement("div");
        document.body.append(host);
        window.mountCase = (kind) => {
          window.dispose?.();
          window.dispose = mount(host, kind);
        };
      });
      const now = Date.now();
      await page.clock.install({ time: new Date(now) });
      await page.clock.pauseAt(new Date(now + 1000));
      for (const kind of ["text", "icon", "select", "select-anchored"]) {
        await page.evaluate((kind) => window.mountCase(kind), kind);
        const select = kind.startsWith("select");
        const trigger = page.getByRole(select ? "combobox" : "button", {
          name: select ? "Case select" : "Case menu",
          exact: true,
        });
        await trigger.waitFor();
        await page.clock.runFor(64);
        await trigger.click({ force: true });
        await page.clock.runFor(180);
        const popup = page.locator(
          `[data-slot="${select ? "select-popover" : "menu-popup"}"][data-open]`,
        );
        const handle = await popup.elementHandle();
        const measure = (e) => {
          const surface = e.querySelector(
            '[data-slot="menu-surface"], [data-slot="select-surface"]',
          );
          return {
            ...surface.getBoundingClientRect().toJSON(),
            opacity: Number(surface.style.getPropertyValue("--lg-menu-surface-opacity")),
          };
        };
        await page.keyboard.press("Escape");
        await page.clock.runFor(64);
        const before = await handle.evaluate(measure);
        assert.ok(before.opacity > 0, "reopen must interrupt a visible return");
        await trigger.click({ force: true });
        const after = await handle.evaluate(measure);
        for (const key of ["x", "y", "width", "height", "opacity"])
          assert.ok(
            Math.abs(before[key] - after[key]) < 1,
            `${engine}/${width}/${kind}: ${key} jumped on reversal (${before[key]} → ${after[key]})`,
          );
        await page.clock.runFor(700);
        assert.equal(await popup.getAttribute("data-menu-morphing"), null);
        await page.keyboard.press("Escape");
        await page.clock.runFor(700);
        assert.equal(await trigger.evaluate((e) => document.activeElement === e), true);
        console.log("PASS", engine, width, kind, "interrupted return retains its visible pose");
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
