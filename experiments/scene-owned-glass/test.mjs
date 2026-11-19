import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(new URL("../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require("playwright");
const base = process.env.GLASS_LAB_URL ?? "http://127.0.0.1:4325";
const output = new URL("../../.amp/in/artifacts/scene-owned-glass/", import.meta.url);
await mkdir(output, { recursive: true });
const results = [];
async function pixelDifference(page, captures) {
  return page.evaluate(
    async (captures) => {
      const images = [];
      for (const base64 of captures) {
        const image = new Image();
        image.src = `data:image/png;base64,${base64}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        images.push({
          width: image.width,
          height: image.height,
          data: context.getImageData(0, 0, image.width, image.height).data,
        });
      }
      let maximum = 0,
        sum = 0,
        changed = 0;
      const [a, b] = images;
      if (a.width !== b.width || a.height !== b.height)
        throw new Error("mismatched capture dimensions");
      for (let i = 0; i < a.data.length; i++) {
        const delta = Math.abs(a.data[i] - b.data[i]);
        maximum = Math.max(maximum, delta);
        sum += delta;
        if (delta) changed++;
      }
      const mean = sum / a.data.length;
      return { maximum, mean, changed };
    },
    captures.map((buffer) => buffer.toString("base64")),
  );
}
async function assertRetainedPhoto(page, expected, message) {
  const difference = await pixelDifference(page, [
    expected,
    await page.locator("#stage").screenshot(),
  ]);
  // Fractional CSS positions can change rounded clip antialiasing by one channel unit at DPR 3.
  assert.ok(
    difference.maximum <= 1 && difference.mean < 0.001,
    `${message}: ${JSON.stringify(difference)}`,
  );
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue;
  const browser = await engine.launch(
    name === "chromium" ? { headless: false, args: ["--use-angle=metal"] } : {},
  );
  try {
    for (const dpr of [1, 2, 3]) {
      const page = await browser.newPage({
        viewport: { width: dpr === 3 ? 390 : 1000, height: 900 },
        deviceScaleFactor: dpr,
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(`${base}?mode=upload`);
      assert.equal(response.status(), 200, "the independent experiment must be served");
      await page.waitForFunction(() => window.lab?.ready, { timeout: 15000 });
      assert.equal(await page.getByLabel("Rendering path").inputValue(), "upload");
      await page.getByRole("button", { name: "Pause animation" }).click();
      assert.equal(
        await page.getByLabel("Scene", { exact: true }).count(),
        1,
        "the experiment must expose photo and static-small scenes",
      );
      const parity = [];
      for (const scene of ["procedural", "photo-dynamic", "photo-static-small"]) {
        await page.getByLabel("Scene", { exact: true }).selectOption(scene);
        assert.equal(
          await page.locator("#stage button:visible").count(),
          scene === "photo-static-small" ? 1 : 4,
        );
        for (const dark of [false, true]) {
          const captures = [];
          for (const mode of ["resident", "upload"]) {
            await page.evaluate(
              ({ mode, dark }) => window.lab.configure({ mode, dark, time: 1.25, scroll: 37 }),
              { mode, dark },
            );
            const buffer = await page.locator("#stage").screenshot();
            await writeFile(
              new URL(`${name}-dpr${dpr}-${scene}-${dark ? "dark" : "light"}-${mode}.png`, output),
              buffer,
            );
            captures.push(buffer);
          }
          const difference = await pixelDifference(page, captures);
          assert.ok(
            difference.maximum <= 4 && difference.mean < 0.2,
            `${scene} optics must match: ${JSON.stringify(difference)}`,
          );
          parity.push({ scene, dark, ...difference });
        }
      }
      await page.getByLabel("Scene", { exact: true }).selectOption("photo-dynamic");
      await page.evaluate(() =>
        window.lab.configure({ mode: "resident", dark: false, time: 0, scroll: 0 }),
      );
      const photo = await page.locator("#stage").screenshot();
      await page.evaluate(() => window.lab.configure({ time: 1.25 }));
      assert.notDeepEqual(
        await page.locator("#stage").screenshot(),
        photo,
        "the real photo must pan when scene time changes",
      );
      await page.getByLabel("Scene", { exact: true }).selectOption("photo-static-small");
      for (const mode of ["resident", "upload"]) {
        await page.evaluate((mode) => window.lab.configure({ mode, time: 0, scroll: 0 }), mode);
        const staticPhoto = await page.locator("#stage").screenshot();
        await page.evaluate(() => window.lab.configure({ time: 9 }));
        await assertRetainedPhoto(
          page,
          staticPhoto,
          "static photo must not change with animation time",
        );
        const smallLens = page.getByRole("button", { name: "Move glass" });
        const initial = await smallLens.boundingBox();
        await smallLens.focus();
        await page.keyboard.press("Alt+ArrowRight");
        assert.equal((await smallLens.boundingBox()).x, initial.x + 4);
        await smallLens.blur();
        const movedPhoto = await page.locator("#stage").screenshot();
        assert.notDeepEqual(movedPhoto, staticPhoto, "moving retained glass must change pixels");
        await page.getByLabel("Background scroll").fill("170");
        const scrolledPhoto = await page.locator("#stage").screenshot();
        assert.notDeepEqual(scrolledPhoto, movedPhoto, "scroll must invalidate retained photo");
        await page.getByRole("button", { name: "Unmount renderer" }).click();
        await page.getByRole("button", { name: "Mount renderer" }).click();
        await page.waitForFunction(() => window.lab.state === "ready");
        await assertRetainedPhoto(
          page,
          scrolledPhoto,
          "cached photo rendering must match a fresh renderer",
        );
        await page.getByRole("button", { name: "Simulate context loss" }).click();
        await page.waitForFunction(() => window.lab.state === "lost");
        await page.getByRole("button", { name: "Restore context" }).click();
        await page.waitForFunction(() => window.lab.state === "ready");
        await assertRetainedPhoto(
          page,
          scrolledPhoto,
          "context restoration must restore photo pixels",
        );
      }
      await page.getByLabel("Scene", { exact: true }).selectOption("procedural");
      await page.evaluate(() =>
        window.lab.configure({ mode: "resident", dark: false, time: 0, scroll: 0 }),
      );
      const before = await page.locator("#stage").screenshot();
      await page.getByLabel("Background scroll").fill("170");
      assert.notDeepEqual(
        await page.locator("#stage").screenshot(),
        before,
        "scroll must update actual background pixels",
      );
      const lens = page.getByRole("button", { name: "Move glass" });
      const box = await lens.boundingBox();
      await page.mouse.move(box.x + 30, box.y + 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 85, box.y + 60, { steps: 6 });
      await page.mouse.up();
      assert.ok(
        (await lens.boundingBox()).x > box.x + 30,
        "pointer drag must move the DOM and GPU lens",
      );
      await lens.focus();
      const moved = await lens.boundingBox();
      await page.keyboard.press("Alt+ArrowLeft");
      assert.ok((await lens.boundingBox()).x < moved.x, "keyboard movement must remain available");
      const originalWidth = (await lens.boundingBox()).width;
      await page.getByRole("button", { name: "Press spring" }).click();
      assert.ok(
        (await lens.boundingBox()).width < originalWidth,
        "press state must change GPU-aligned DOM geometry",
      );
      await page.getByRole("button", { name: "Press spring" }).click();
      const lightColor = await lens.evaluate((node) => getComputedStyle(node).color);
      await page.getByRole("button", { name: "Switch material" }).click();
      assert.notEqual(await lens.evaluate((node) => getComputedStyle(node).color), lightColor);
      await page.getByRole("button", { name: "Shared optical model" }).click();
      assert.equal(await lens.evaluate((node) => getComputedStyle(node).color), lightColor);
      for (const mode of ["upload", "resident"]) {
        await page.getByLabel("Rendering path").selectOption(mode);
        await page.getByRole("button", { name: "Simulate context loss" }).click();
        await page.waitForFunction(() => window.lab.state === "lost");
        await page.getByRole("button", { name: "Restore context" }).click();
        await page.waitForFunction(() => window.lab.state === "ready");
      }
      await page.getByRole("button", { name: "Unmount renderer" }).click();
      assert.equal(await page.locator("#stage canvas").count(), 0);
      await page.getByRole("button", { name: "Mount renderer" }).click();
      await page.waitForFunction(() => window.lab.state === "ready");
      await page.evaluate(() => window.lab.configure({ mode: "resident", time: 1.25, scroll: 37 }));
      await page.screenshot({ path: new URL(`${name}-dpr${dpr}-desktop.png`, output).pathname });
      await page.setViewportSize({ width: 320, height: 844 });
      await page.waitForFunction(
        () => window.lab.metrics().width === document.querySelector("#stage").clientWidth,
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      const geometry = await page.evaluate(() => {
        const stage = document.querySelector("#stage").getBoundingClientRect();
        return [...document.querySelectorAll("#stage button")].map((node) => {
          const box = node.getBoundingClientRect();
          return (
            box.left >= stage.left &&
            box.right <= stage.right + 1 &&
            box.top >= stage.top &&
            box.bottom <= stage.bottom + 1
          );
        });
      });
      assert.ok(geometry.every(Boolean), "all labels and hit targets must stay inside the scene");
      await page.screenshot({ path: new URL(`${name}-dpr${dpr}-narrow.png`, output).pathname });
      await page.getByRole("button", { name: "Resume animation" }).click();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.getByRole("button", { name: "Resume animation" }).waitFor();
      assert.deepEqual(errors, []);
      results.push({
        engine: name,
        version: browser.version(),
        dpr,
        parity,
        interactions:
          "photo pan, static time retention, static lens move, photo scroll invalidation, photo remount/context pixel recovery on both paths, scroll, pointer/keyboard move, spring, material, procedural context restores, remount, 320px geometry, reduced motion",
      });
      await writeFile(new URL("correctness-photo.json", output), JSON.stringify(results, null, 2));
      console.log(JSON.stringify(results.at(-1)));
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
