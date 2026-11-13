import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import { keepDevFixture } from "./keep-dev-fixture.mjs";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
// Runtime checks catch component overrides that bypass the shared press model.
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    page.setDefaultTimeout(30000);
    await keepDevFixture(page, base);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/cn/docs/react/components/glass-button`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");
    // Exercise the real size demo without depending on deferred article layout.
    await page.evaluate(async () => {
      const { mountElastic } = await import("/test/upstream-glass-fixture.tsx");
      for (const child of document.body.children)
        if (child instanceof HTMLElement) child.hidden = true;
      const host = document.createElement("div");
      document.body.append(host);
      mountElastic(host);
    });
    const sample = (label) =>
      page
        .locator('[data-lenso-slot="glass-button"]')
        .filter({ hasText: new RegExp(`^${label}$`) });
    await sample("Small").waitFor({ state: "attached" });
    for (const label of ["Small", "Medium", "Large"]) {
      const button = sample(label);
      await button.scrollIntoViewIfNeeded();
      for (const pointerType of ["mouse", "touch"]) {
        const state = await button.evaluate(async (element, pointerType) => {
          const rest = element.getBoundingClientRect();
          const center = { clientX: rest.x + rest.width / 2, clientY: rest.y + rest.height / 2 };
          const event = (type) =>
            new PointerEvent(type, {
              ...center,
              pointerType,
              pointerId: 31,
              isPrimary: true,
              button: 0,
              buttons: type === "pointerup" ? 0 : 1,
              bubbles: true,
            });
          const size = () => {
            const r = element.getBoundingClientRect();
            return Math.max(r.width, r.height);
          };
          element.dispatchEvent(event("pointerdown"));
          await new Promise((resolve) => setTimeout(resolve, 700));
          const held = size();
          window.dispatchEvent(event("pointerup"));
          await new Promise((resolve) => setTimeout(resolve, 35));
          element.dispatchEvent(event("pointerdown"));
          await new Promise((resolve) => setTimeout(resolve, 700));
          const repeated = size();
          window.dispatchEvent(event("pointercancel"));
          await new Promise((resolve) => setTimeout(resolve, 1200));
          return {
            rest: Math.max(rest.width, rest.height),
            held,
            repeated,
            released: size(),
            pressed: element.hasAttribute("data-lenso-pressed"),
          };
        }, pointerType);
        const growth = pointerType === "mouse" ? 6 : 16;
        assert.ok(Math.abs(state.held - state.rest - growth) < 0.15, JSON.stringify(state));
        assert.ok(Math.abs(state.repeated - state.held) < 0.15, JSON.stringify(state));
        assert.ok(Math.abs(state.released - state.rest) < 0.05, JSON.stringify(state));
        assert.equal(state.pressed, false);
        console.log(name, label, pointerType, state);
      }
    }
    const button = sample("Large");
    await button.evaluate((element) => {
      window.glassClicks = 0;
      element.addEventListener("click", () => window.glassClicks++);
    });
    const box = await button.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(box.x + box.width + 80, box.y + box.height / 2);
    await page.waitForTimeout(150);
    assert.equal(await button.getAttribute("data-lenso-pressed"), "");
    await page.mouse.up();
    assert.equal(await button.getAttribute("data-lenso-pressed"), null);
    assert.equal(
      await page.evaluate(() => window.glassClicks),
      0,
      "dragging out must not activate",
    );
    await page.waitForTimeout(1200);
    await button.focus();
    await page.keyboard.press("Space");
    assert.equal(
      await page.evaluate(() => window.glassClicks),
      1,
      "keyboard activation must remain native",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
    const reduced = await button.evaluate((element) => {
      element.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerId: 32,
          pointerType: "touch",
          isPrimary: true,
          button: 0,
          bubbles: true,
        }),
      );
      const result = {
        scale: getComputedStyle(element).scale,
        translate: getComputedStyle(element).translate,
      };
      window.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 32 }));
      return result;
    });
    assert.ok(["1", "1 1"].includes(reduced.scale), JSON.stringify(reduced));
    assert.ok(["0px", "0px 0px"].includes(reduced.translate), JSON.stringify(reduced));
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForFunction(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
    const toggle = page.locator('[data-lenso-slot="glass-toggle-button"]').first();
    await toggle.waitFor();
    await toggle.scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      Boolean(
        document
          .querySelector('[data-lenso-slot="glass-toggle-button"]')
          ?.style.getPropertyValue("--lenso-glass-clarity"),
      ),
    );
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    const toggleRest = await toggle.boundingBox();
    await toggle.evaluate((element) => {
      const box = element.getBoundingClientRect();
      element.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerId: 33,
          pointerType: "touch",
          isPrimary: true,
          button: 0,
          bubbles: true,
          clientX: box.x + box.width / 2,
          clientY: box.y + box.height / 2,
        }),
      );
    });
    await page.waitForTimeout(700);
    const toggleHeld = await toggle.boundingBox();
    assert.ok(
      Math.abs(
        Math.max(toggleHeld.width, toggleHeld.height) -
          Math.max(toggleRest.width, toggleRest.height) -
          16,
      ) < 0.15,
      JSON.stringify({ toggleRest, toggleHeld }),
    );
    await page.evaluate(() =>
      window.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 33 })),
    );
    await page.waitForTimeout(1200);
    const selected = await toggle.getAttribute("aria-pressed");
    await toggle.click();
    assert.notEqual(await toggle.getAttribute("aria-pressed"), selected);
    assert.deepEqual(errors, []);
    await page.close();
  } finally {
    await browser.close();
  }
}
