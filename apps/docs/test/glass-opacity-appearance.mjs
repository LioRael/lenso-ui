import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
for (const [name, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await type.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
      await page.goto(`${base}/cn/docs/react/components/toolbar`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("button", { name: "主题", exact: true }).waitFor();
      await page.evaluate(async (theme) => {
        const { mount } = await import("/test/glass-rectangle-fixture.tsx");
        for (const e of document.body.children) if (e instanceof HTMLElement) e.hidden = true;
        const host = document.createElement("div");
        host.id = "opacity-appearance";
        document.body.append(host);
        mount(host, 1, theme, 0.5);
      }, theme);
      const card = page
        .locator("#opacity-appearance [data-slot=glass]")
        .filter({ hasText: "清晰文字" });
      await card.scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      const menu = page.getByRole("menu").first();
      await menu.waitFor();
      await page.waitForTimeout(700);
      const owner = (await menu.evaluate((e) => e.hasAttribute("data-material-lens")))
        ? menu
        : menu.locator("[data-material-lens]");
      const read = (e) => ({
        paint: getComputedStyle(e).getPropertyValue("--lenso-glass-preference-paint"),
        clarity: getComputedStyle(e).getPropertyValue("--lenso-glass-clarity"),
        opaque: e.hasAttribute("data-lenso-glass-opaque"),
      });
      const a = await card.evaluate(read),
        b = await owner.evaluate(read);
      assert.equal(a.paint, b.paint);
      assert.ok(a.paint.includes("50%"));
      assert.ok(a.paint.includes(theme === "light" ? "247 247 249" : "30 30 32"));
      await page
        .locator("#opacity-appearance > div")
        .evaluate((e) => e.style.setProperty("--lenso-glass-transparency", "0"));
      await page.waitForFunction(() =>
        document.querySelector(
          "[role=menu] [data-lenso-glass-opaque], [role=menu][data-lenso-glass-opaque]",
        ),
      );
      assert.equal((await card.evaluate(read)).opaque, true);
      assert.equal((await owner.evaluate(read)).opaque, true);
      await page.locator("#opacity-appearance > div").evaluate((e) => {
        e.style.setProperty("--lenso-glass-transparency", "1");
        e.style.setProperty("--lenso-glass-tint-amount", "0");
      });
      await page.waitForFunction(() => {
        const e = document.querySelector(
          "[role=menu] [data-material-lens], [role=menu][data-material-lens]",
        );
        return (
          e &&
          getComputedStyle(e).getPropertyValue("--lenso-glass-clarity") === "1" &&
          !e.hasAttribute("data-lenso-glass-opaque")
        );
      });
      assert.equal((await card.evaluate(read)).clarity, "1");
      assert.equal((await owner.evaluate(read)).paint, "none");
      console.log(
        `PASS ${name} ${theme}: opacity and appearance compose through the open menu portal`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
