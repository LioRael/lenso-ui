import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const url = `${process.env.DOCS_URL ?? "http://127.0.0.1:4311"}/cn/docs/react/getting-started/materials`;
for (const engine of [webkit, chromium]) {
  if (process.env.ENGINE && process.env.ENGINE !== engine.name()) continue;
  const browser = await engine.launch(engine === chromium ? { args: ["--use-angle=metal"] } : {});
  try {
    const page = await browser.newPage({
      viewport: { width: Number(process.env.WIDTH ?? 1440), height: 1050 },
      deviceScaleFactor: 2,
    });
    await page.addInitScript(() => {
      const contexts = (window.sceneProbe = new Map());
      const photos = new WeakMap();
      const drawImage = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
        if (
          source instanceof HTMLImageElement &&
          source.dataset.lensoBackdropRenderer === "scene-shared"
        ) {
          photos.set(this.canvas, source);
        }
        return drawImage.call(this, source, ...args);
      };
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
        const context = getContext.call(this, kind, ...args);
        if (kind !== "webgl2" || !context || contexts.has(context)) return context;
        const samples = { uploads: [], bytes: 0 };
        contexts.set(context, samples);
        for (const name of ["texImage2D", "texImage3D", "texSubImage2D"]) {
          const original = context[name];
          context[name] = function (...values) {
            if (name === "texSubImage2D" && values[6] instanceof HTMLCanvasElement) {
              const photo = photos.get(values[6]);
              if (photo) samples.uploads.push(photo);
            } else if (values[2] === this.RGBA8) {
              samples.bytes += values[3] * values[4] * (name === "texImage3D" ? values[5] : 1) * 4;
            }
            return original.apply(this, values);
          };
        }
        return context;
      };
    });
    await page.goto(url);
    const toggle = page.getByRole("button", { name: "共享 GPU 实验", exact: true });
    const light = page.getByTestId("materials-light");
    const dark = page.getByTestId("materials-dark");
    assert.equal(await toggle.getAttribute("aria-pressed", { timeout: 7500 }), "false");
    for (
      let attempt = 0;
      attempt < 3 && (await toggle.getAttribute("aria-pressed")) !== "true";
      attempt++
    ) {
      await toggle.click();
      await page.waitForTimeout(350);
    }
    const outputSelector = '[data-glass-renderer="scene-shared"] canvas';
    const outputs = light.locator(outputSelector);
    await outputs.nth(3).waitFor({ timeout: 12000 });
    for (const output of await outputs.all()) {
      assert(
        await output.evaluate((canvas) => {
          const ctx = canvas.getContext("2d");
          const data = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
          return (
            data &&
            data.some((value, index) => index % 4 === 3 && value === 255) &&
            data.some((value, index) => index % 4 === 0 && Math.abs(value - data[0]) > 16)
          );
        }),
        "all four real materials receive pixels from the shared GPU scene",
      );
    }
    const statsFor = (locator) =>
      locator.evaluate((scene) => {
        const photo = scene.querySelector("img");
        return [...window.sceneProbe]
          .filter(([gl, { uploads }]) => !gl.isContextLost() && uploads.includes(photo))
          .map(([, { uploads, bytes }]) => ({ photoUploads: uploads.length, bytes }));
      });
    const stats = await statsFor(light);
    assert.equal(stats.length, 1, JSON.stringify(stats));
    assert.equal(stats[0].photoUploads, 1);
    if (process.env.SHOTS) {
      await light.evaluate((element) => element.scrollIntoView({ block: "center" }));
      await light.screenshot({
        path: `${process.env.SHOTS}/${engine.name()}-${process.env.WIDTH ?? 1440}-shared.jpg`,
        scale: "css",
      });
    }
    await dark.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await dark.locator(outputSelector).nth(3).waitFor({ timeout: 12000 });
    assert.deepEqual(await statsFor(dark), stats);
    if (process.env.SHOTS && !process.env.WIDTH) {
      await dark.screenshot({
        path: `${process.env.SHOTS}/${engine.name()}-1440-dark.jpg`,
        scale: "css",
      });
    }
    await light.evaluate((scene) => {
      const photo = scene.querySelector("img");
      for (const [gl, { uploads }] of window.sceneProbe) {
        if (!gl.isContextLost() && uploads.includes(photo)) {
          gl.getExtension("WEBGL_lose_context").loseContext();
        }
      }
    });
    await outputs.first().waitFor({ state: "detached" });
    assert.equal(await light.locator("[data-copy]").count(), 0);
    assert.equal(await light.locator('[data-material^="glass-"]').count(), 4);
    assert.deepEqual(await statsFor(dark), stats);
    if (process.env.SHOTS) {
      await light.screenshot({
        path: `${process.env.SHOTS}/${engine.name()}-${process.env.WIDTH ?? 1440}-fallback.jpg`,
        scale: "css",
      });
    }
    await toggle.click();
    await outputs.first().waitFor({ state: "detached" });
    assert.equal(await toggle.getAttribute("aria-pressed"), "false");
    assert.equal(
      await page
        .getByRole("button", { name: "同图默认渲染", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    if (process.env.SHOTS) {
      await light.screenshot({
        path: `${process.env.SHOTS}/${engine.name()}-${process.env.WIDTH ?? 1440}-default.jpg`,
        scale: "css",
      });
    }
    console.log(
      `${engine.name()}: four outputs, fallback on context loss and off; scene allocations ${JSON.stringify(stats)}`,
    );
  } finally {
    await browser.close();
  }
}
