import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4333";
for (const [name, engine, executablePath] of [
  ["chromium", chromium, process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH],
  ["webkit", webkit, process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH],
]) {
  const browser = await engine.launch(executablePath ? { executablePath } : {});
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({
        viewport: { width, height: 700 },
        colorScheme: width === 390 ? "dark" : "light",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base);
      await page.locator('[data-lenso-slot="scroll-edge"]').waitFor({ state: "attached" });
      await page.waitForFunction(
        (dark) => document.documentElement.classList.contains("dark") === dark,
        width === 390,
      );
      const trigger = page.getByRole("button", { name: "Page source options", exact: true });
      const popup = page.locator('[data-lenso-slot="menu-popup"]');
      await page.evaluate(() => {
        window.__menuShellBackgrounds = [];
        const sample = () => {
          const popup = document.querySelector('[data-lenso-slot="menu-popup"]');
          if (popup) window.__menuShellBackgrounds.push(getComputedStyle(popup).backgroundColor);
          window.__menuShellFrame = requestAnimationFrame(sample);
        };
        sample();
      });
      // A static screenshot cannot catch a missing presentation hook or an early unmount.
      await trigger.click();
      await popup.locator('[data-lenso-slot="menu-content"]').waitFor();
      await page.waitForFunction(() =>
        document
          .querySelector('[data-lenso-slot="menu-popup"]')
          ?.hasAttribute("data-menu-morphing"),
      );
      assert.equal(await popup.getAttribute("data-menu-motion"), "anchored");
      assert.equal(await trigger.evaluate((node) => getComputedStyle(node).opacity), "1");
      await page.waitForFunction(() => {
        const popup = document.querySelector('[data-lenso-slot="menu-popup"]');
        return popup && !popup.hasAttribute("data-menu-morphing");
      });
      const backgrounds = await page.evaluate(() => {
        cancelAnimationFrame(window.__menuShellFrame);
        return window.__menuShellBackgrounds;
      });
      assert.ok(backgrounds.length > 0);
      assert.ok(
        backgrounds.every((color) => color === "rgba(0, 0, 0, 0)"),
        `${name}: popup shell painted before its glass surface: ${backgrounds}`,
      );
      await page.keyboard.press("Escape");
      // Native popup presence must retain the surface until Lenso's closing motion ends.
      await page.waitForTimeout(100);
      assert.equal(await popup.count(), 1, `${name}: closing surface disappeared early`);
      assert.equal(await popup.getAttribute("data-ending-style"), "");
      await popup.waitFor({ state: "detached" });
      assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);

      await trigger.click();
      await page.waitForFunction(() =>
        document
          .querySelector('[data-lenso-slot="menu-popup"]')
          ?.hasAttribute("data-menu-morphing"),
      );
      await page.keyboard.press("Escape");
      await popup.waitFor({ state: "detached" });
      await trigger.click();
      await page.getByRole("menuitem", { name: "View page source", exact: true }).waitFor();
      await page.keyboard.press("Escape");
      await popup.waitFor({ state: "detached" });

      await page.emulateMedia({ reducedMotion: "reduce" });
      await trigger.click();
      await page.getByRole("menuitem", { name: "View page source", exact: true }).waitFor();
      await page.waitForFunction(() => {
        const popup = document.querySelector('[data-lenso-slot="menu-popup"]');
        return popup && !popup.hasAttribute("data-menu-morphing");
      });
      await page.keyboard.press("Escape");
      await popup.waitFor({ state: "detached" });
      assert.deepEqual(errors, []);
      console.log(
        `${name} ${width}px: anchored entry, retained exit, interrupted entry, reopen and reduced motion passed`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
