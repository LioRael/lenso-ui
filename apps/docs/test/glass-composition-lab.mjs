import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/cn/glass-lab?pipeline=scene`);
    await page.getByRole("heading", { name: "叠层玻璃实验", exact: true }).waitFor();
    const stage = page.locator("#stage");
    await page.waitForFunction(() => document.querySelector("#stage")?.dataset.state === "ready");
    const lens = page.getByRole("button", { name: "移动上层玻璃", exact: true });
    const initial = await lens.boundingBox();
    await lens.focus();
    await page.keyboard.press("Alt+ArrowRight");
    assert.equal(Math.round((await lens.boundingBox()).x - initial.x), 8);
    await page.getByLabel("场景文字", { exact: true }).fill("真实文字");
    assert.ok((await stage.textContent()).includes("真实文字"));
    const ordered = await stage.screenshot();
    await page.getByLabel("采样方式", { exact: true }).selectOption("shared");
    assert.notDeepEqual(
      await stage.screenshot(),
      ordered,
      "Layer order must change rendered pixels",
    );
    await page.getByLabel("采样方式", { exact: true }).selectOption("ordered");
    for (const value of ["text", "boundary", "overlap"]) {
      await page.getByLabel("验证场景", { exact: true }).selectOption(value);
      assert.equal(await lens.isVisible(), true);
    }
    await page.getByRole("button", { name: "模拟上下文丢失" }).click();
    await page.waitForFunction(() => document.querySelector("#stage")?.dataset.state === "lost");
    assert.equal(await lens.isVisible(), false);
    await page.getByRole("button", { name: "恢复上下文", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("#stage")?.dataset.state === "ready");
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForFunction(
        () =>
          document.querySelector("#stage canvas")?.width ===
          Math.round(document.querySelector("#stage").clientWidth * devicePixelRatio),
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
    }
    await page.getByRole("button", { name: "深色外观", exact: true }).click();
    await page.getByRole("button", { name: "浅色外观", exact: true }).waitFor();
    await page.waitForFunction(() => document.querySelector("#stage")?.dataset.state === "ready");
    await page.getByRole("link", { name: "原有组件", exact: true }).click();
    await page.getByRole("button", { name: "独立按钮", exact: true }).waitFor();
    assert.equal(
      await page.locator("#stage").count(),
      0,
      "Leaving the experiment must remove its canvas",
    );
    await page.getByRole("link", { name: "叠层实验", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("#stage")?.dataset.state === "ready");
    assert.equal(await stage.locator("canvas").count(), 1);
    assert.deepEqual(errors, []);
    console.log(
      `${engine.name()}: docs composition controls, pixels, keyboard, resize, recovery and navigation passed`,
    );
  } finally {
    await browser.close();
  }
}
