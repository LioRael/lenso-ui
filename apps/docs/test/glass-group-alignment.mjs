import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
// Pixel comparisons live in the reference fixture. This checks the delivered
// group recipe, contour placement and that padded drawing does not wake itself.
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.contourDraws = 0;
      const stroke = CanvasRenderingContext2D.prototype.stroke;
      CanvasRenderingContext2D.prototype.stroke = function (...args) {
        if (this.canvas.hasAttribute("data-lenso-glass-outline")) window.contourDraws++;
        return stroke.apply(this, args);
      };
    });
    await page.goto(`${base}/cn/glass-lab`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("[data-lenso-fusion-field]"));
    for (const theme of ["light", "dark"]) {
      if (theme === "dark")
        await page.getByRole("button", { name: "深色外观", exact: true }).click();
      await page.waitForTimeout(1500);
      const state = await page.evaluate(() => {
        const surface = document.querySelector("[data-lenso-glass-fusion]");
        const id = getComputedStyle(surface)
          .getPropertyValue("--lg-filter")
          .match(/#([^)"]+)/)[1];
        const filter = document.getElementById(id);
        const canvas = surface.parentElement.querySelector("canvas[data-lenso-glass-outline]");
        const shadow = surface.parentElement.querySelector("[data-lenso-glass-source-shadow]");
        window.shadowWrites = 0;
        window.shadowObserver?.disconnect();
        window.shadowObserver = new MutationObserver((records) => {
          window.shadowWrites += records.length;
        });
        for (const node of surface.parentElement.querySelectorAll(
          "[data-lenso-glass-source-shadow], [data-lenso-glass-shadow-input]",
        ))
          window.shadowObserver.observe(node, { attributes: true, subtree: true });
        const a = surface.getBoundingClientRect(),
          b = canvas.getBoundingClientRect();
        const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
        let darkPixels = 0,
          lightPixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (!pixels[i + 3]) continue;
          if (pixels[i] < 32) darkPixels++;
          if (pixels[i] > 32) lightPixels++;
        }
        window.contourDraws = 0;
        return {
          size: filter.getAttribute("data-lenso-tone-size"),
          transfer: filter.getAttribute("data-lenso-tone-transfer"),
          shade: !!filter.querySelector('[result="material-shade"]'),
          shadowVisible: getComputedStyle(shadow).visibility,
          shadowInputs: surface.parentElement.querySelectorAll("[data-lenso-glass-shadow-input]")
            .length,
          offset: [b.x - a.x, b.y - a.y, b.width - a.width, b.height - a.height],
          contourVisibility: getComputedStyle(canvas).visibility,
          contourMask: getComputedStyle(canvas).maskImage,
          darkPixels,
          lightPixels,
        };
      });
      assert.equal(state.size, "1");
      assert.equal(state.transfer, "linear");
      assert.equal(state.shade, false);
      assert.equal(state.shadowVisible, "visible");
      assert.ok(state.shadowInputs >= 1, "copied material must include the source shadow");
      assert.equal(state.contourVisibility, "visible");
      assert.equal(
        state.contourMask,
        "none",
        "the outside half of the hairline must stay unclipped",
      );
      assert.ok(state.darkPixels > 100, "the fused outline must contain the dark hairline");
      assert.ok(state.lightPixels > 100, "the fused outline must contain directional white light");
      for (const [i, expected] of [-24, -24, 48, 48].entries())
        assert.ok(Math.abs(state.offset[i] - expected) < 0.1, JSON.stringify(state));
      await page.waitForTimeout(500);
      assert.equal(
        await page.evaluate(() => window.contourDraws),
        0,
        "static contour keeps waking itself",
      );
      assert.equal(await page.evaluate(() => window.shadowWrites), 0, "idle shadow keeps mutating");
      console.log(name, theme, state);
    }
    const control = page.getByRole("button", { name: "拖动添加按钮", exact: true });
    await control.focus();
    await page.keyboard.down("Space");
    assert.equal(await control.getAttribute("data-lenso-key-pressed"), "");
    await page.keyboard.up("Space");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(() => !document.querySelector("canvas[data-lenso-glass-outline]"));
    assert.equal(await page.locator("[data-lenso-glass-source-shadow]").count(), 0);
    assert.equal(await page.locator("[data-lenso-glass-shadow-input]").count(), 0);
    await page.emulateMedia({ forcedColors: "active" });
    await page.waitForFunction(() => document.querySelector("[data-lenso-glass-opaque]"));
    assert.equal(await control.evaluate((e) => getComputedStyle(e).boxShadow), "none");
    assert.deepEqual(errors, []);
    await page.close();
  } finally {
    await browser.close();
  }
}
