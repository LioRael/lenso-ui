import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { webkit, chromium } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4311";
const artifacts = process.env.BROWSER_ARTIFACTS;
if (artifacts) await mkdir(artifacts, { recursive: true });
const engine = process.env.ENGINE === "chromium" ? chromium : webkit;
const colorScheme = process.env.THEME === "dark" ? "dark" : "light";
const browser = await engine.launch();
try {
  for (const [name, path, labels] of [
    [
      "docs",
      "/cn/docs/react/components/glass-button",
      ["切换语言", "主题", "Lenso UI on GitHub", "搜索文档"],
    ],
    ["home", "/cn", ["搜索文档", "外观与语言", "Lenso UI on GitHub"]],
  ]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      colorScheme,
    });
    if (process.env.NO_GPU === "1") {
      await page.addInitScript(() => {
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (id, ...args) {
          return id === "webgl2" ? null : getContext.call(this, id, ...args);
        };
      });
    }
    await page.goto(base + path);
    const header = page.locator("header").filter({ has: page.getByLabel("Lenso UI on GitHub") });
    const scene = '[data-glass-backdrop-snapshot][data-glass-renderer="scene"]';
    for (const label of labels) {
      const button = header.getByLabel(label, { exact: true }).filter({ visible: true });
      await button.waitFor({ state: "visible" });
      if (process.env.NO_GPU === "1") {
        await button.and(page.locator("[data-material-paints]")).waitFor();
        assert.equal(await button.locator(scene).count(), 0);
      } else {
        await button.locator(scene).locator("canvas[data-glass-frame]").waitFor({ timeout: 10000 });
      }
    }
    if (artifacts)
      await header.screenshot({ path: `${artifacts}/${name}-${engine.name()}-${colorScheme}.png` });
    const popup = header.getByRole("button", { name: labels[1], exact: true });
    await popup.focus();
    await popup.press("Enter");
    assert.equal(await popup.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    await page.waitForFunction(
      (label) => document.activeElement?.getAttribute("aria-label") === label,
      labels[1],
    );
    if (name === "docs") {
      const language = header.getByRole("button", { name: "切换语言", exact: true });
      await language.press("Enter");
      const menu = page.getByRole("menu", { name: "切换语言", exact: true });
      await menu.waitFor();
      if (process.env.NO_GPU === "1") {
        await page.waitForFunction(
          (lens) => {
            const box = lens.getBoundingClientRect();
            return [...document.querySelectorAll("[data-material-live-paints] > div")].some(
              (paint) => {
                const rect = paint.getBoundingClientRect();
                return (
                  Math.abs(rect.left - box.left) < 1 &&
                  Math.abs(rect.top - box.top) < 1 &&
                  Math.abs(rect.width - box.width) < 1 &&
                  Math.abs(rect.height - box.height) < 1 &&
                  getComputedStyle(paint).backdropFilter.includes("blur(")
                );
              },
            );
          },
          await menu.locator("[data-material-lens]").elementHandle(),
          { timeout: 10000 },
        );
        assert.equal(await menu.locator(scene).count(), 0);
      } else if (engine === webkit) {
        await menu.locator(scene).locator("canvas[data-glass-frame]").waitFor({ timeout: 10000 });
      }
      await page.keyboard.press("Escape");
      await menu.waitFor({ state: "hidden" });
      assert.equal(await language.evaluate((button) => document.activeElement === button), true);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
