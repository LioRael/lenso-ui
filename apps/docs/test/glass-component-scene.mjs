import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4311";
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch(
    engine === chromium ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    const page = await browser.newPage({
      viewport: { width: Number(process.env.WIDTH ?? 1280), height: 1000 },
      deviceScaleFactor: Number(process.env.DPR ?? 2),
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/cn/glass-lab?pipeline=components`);
    const stage = page.getByRole("region", { name: "玻璃交互画布" });
    const ready = () =>
      page.waitForFunction(
        () => {
          const fusion = document.querySelector("[data-lenso-glass-fusion]");
          return fusion?.previousElementSibling?.getAttribute("data-glass-renderer") === "scene";
        },
        undefined,
        { timeout: 15000 },
      );
    await ready();
    await page.getByRole("button", { name: "独立按钮", exact: true }).click();
    await page.getByText("已按下独立按钮", { exact: true }).waitFor();
    const control = page.getByRole("button", { name: "拖动添加按钮", exact: true });
    const initial = await control.boundingBox();
    await control.focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(Math.round((await control.boundingBox()).x - initial.x), 12);
    await ready();
    await page.getByRole("button", { name: "深色外观", exact: true }).click();
    await ready();
    const trigger = page.getByRole("button", { name: "照片选项", exact: true });
    const menu = page.getByRole("menu");
    const menuReady = () =>
      page.waitForFunction(
        () =>
          document.querySelector(
            '[data-lenso-slot="menu-surface"][data-material-resting] [data-glass-renderer="scene"]',
          ),
        undefined,
        { timeout: 8000 },
      );
    await page.evaluate(() => {
      window.menuMotionFrames = [];
      const start = performance.now();
      const sample = () => {
        const surface = document.querySelector('[data-lenso-slot="menu-surface"]');
        const lens = surface?.querySelector("[data-material-lens]");
        const canvas = surface?.querySelector('[data-glass-renderer="scene"] canvas');
        if (lens && !surface.hasAttribute("data-material-resting"))
          window.menuMotionFrames.push({
            width: lens.getBoundingClientRect().width,
            gpu: !!canvas,
          });
        if (performance.now() - start < 1500) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await trigger.click();
    await menuReady();
    await page.waitForTimeout(800);
    const motion = await page.evaluate(() => window.menuMotionFrames);
    assert(
      motion.filter((frame) => frame.gpu).length >= 3 &&
        new Set(motion.filter((frame) => frame.gpu).map((frame) => Math.round(frame.width))).size >=
          3,
      `${engine.name()}: GPU optics must follow multiple distinct opening geometries`,
    );
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector('[role="menu"]'));
    assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
    await page.keyboard.press("Enter");
    await menuReady();
    await menu.locator('[data-glass-renderer="scene"] canvas').evaluate((canvas) => {
      canvas.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext();
    });
    await page.waitForFunction(() => {
      const surface = document.querySelector('[data-lenso-slot="menu-surface"]');
      return surface && !surface.querySelector('[data-glass-renderer="scene"], [data-copy]');
    });
    if (engine === webkit)
      assert.equal(
        await page
          .locator("[data-material-live-paints]")
          .evaluateAll((paints) =>
            paints.some(
              (paint) =>
                getComputedStyle(paint).display !== "none" &&
                [...paint.children].some(
                  (layer) => getComputedStyle(layer).backdropFilter !== "none",
                ),
            ),
          ),
        true,
        "WebKit must restore native blur when the menu's GPU context is lost",
      );
    await page.keyboard.press("Home");
    await page.keyboard.press("Enter");
    await page.getByText("已切换照片", { exact: true }).waitFor({ timeout: 5000 });
    await page.waitForFunction(() => !document.querySelector('[role="menu"]'));
    await ready();
    await stage.evaluate((element) => {
      element.style.rotate = "1deg";
    });
    await page.waitForFunction(() => !document.querySelector('[data-glass-renderer="scene"]'));
    await stage.evaluate((element) => {
      element.style.rotate = "none";
    });
    await ready();
    const sceneCanvases = await stage
      .locator('[data-glass-renderer="scene"] canvas')
      .elementHandles();
    for (const canvas of sceneCanvases) {
      await canvas.evaluate((element) =>
        element.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext(),
      );
      await page.waitForFunction((element) => !element.isConnected, canvas);
      await canvas.dispose();
    }
    await trigger.click();
    await menuReady();
    await page.getByRole("menuitem", { name: "切换照片", exact: true }).click();
    await page.getByText("已切换照片", { exact: true }).waitFor();
    assert.equal(await control.isVisible(), true);
    await page.goto(`${base}/cn/glass-lab`);
    await page.getByRole("button", { name: "独立按钮", exact: true }).waitFor();
    assert.equal(await page.locator('[data-glass-renderer="scene"]').count(), 0);
    assert.deepEqual(errors, []);
    console.log(
      `${engine.name()}: real components, menu GPU/focus/context-loss fallback, fusion, keyboard, theme, photo, rotation fallback and navigation passed`,
    );
  } finally {
    await browser.close();
  }
}
