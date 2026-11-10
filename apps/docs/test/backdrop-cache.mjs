import assert from "node:assert/strict";
import { webkit, chromium } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
const baseline = process.env.BASELINE === "1";
const moduleRoot = `/@fs${new URL("../../../packages/glass/src/", import.meta.url).pathname}`;
for (const [name, engine] of [
  ["webkit", webkit],
  ["chromium", chromium],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue;
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    if (baseline)
      await page.route("**/gpu-capture.ts", async (route) => {
        const response = await route.fetch();
        const source = await response.text();
        assert.match(source, /Retain source pixels/);
        const body = source.replace(/\/\/ Retain source pixels[\s\S]*?(?=const nextPlacement)/, "");
        await route.fulfill({ response, body });
      });
    await page.goto(base);
    const result = await page.evaluate(async (moduleRoot) => {
      const { BackdropPaint, createBackdropAtlas } = await import(`${moduleRoot}gpu-capture.ts`);
      const { BackdropReads } = await import(`${moduleRoot}backdrop-scheduler.ts`);
      const source = document.createElement("div");
      source.style.cssText =
        "all:initial;display:block;position:absolute;width:1200px;height:1600px;background:repeating-linear-gradient(30deg,rgb(255,30,80) 0px,rgb(20,60,240) 37px,rgb(255,30,80) 83px)";
      document.body.append(source);
      const paint = new BackdropPaint(source);
      const shape = { width: 100, height: 60, margin: 12, dpr: 2, count: 1 };
      const atlas = createBackdropAtlas(shape);
      const read = (styles = false) => {
        paint.read({ content: false, styles, animated: new Map() }, new BackdropReads());
        return paint.snapshot();
      };
      let tile = { x: 200, y: 200 };
      await atlas.update(read(true), [tile]);
      const samples = [];
      for (let index = 1; index <= 48; index++) {
        await new Promise(requestAnimationFrame);
        // Relative source/lens movement: vertical scrolling, then horizontal dragging.
        tile = { x: 200 + Math.max(0, index - 24) * 2, y: 200 + Math.min(index, 24) * 2 };
        const start = performance.now();
        const change = await atlas.update(read(), [tile]);
        samples.push(performance.now() - start);
        if (!change) throw new Error("Movement did not update the input pixels");
      }
      const captures = atlas.captures;
      // A fresh atlas is an independent rasterization at the destination.
      const actual = await atlas.update(read(), [{ x: 250, y: 250 }]);
      const reference = createBackdropAtlas(shape);
      const expected = await reference.update(read(), [{ x: 250, y: 250 }]);
      const bytes = (change) =>
        "canvas" in change.pixels
          ? change.pixels.canvas
              .getContext("2d")
              .getImageData(0, 0, change.pixels.width, change.pixels.height).data
          : change.pixels.data;
      const a = bytes(actual),
        b = bytes(expected);
      let maxError = 0,
        totalError = 0;
      for (let index = 0; index < a.length; index++) {
        const error = Math.abs(a[index] - b[index]);
        maxError = Math.max(maxError, error);
        totalError += error;
      }
      source.style.background = "rgb(20,180,90)";
      const changed = await atlas.update(read(true), [{ x: 250, y: 250 }]);
      const pixel = bytes(changed).slice(
        (20 * changed.pixels.width + 20) * 4,
        (20 * changed.pixels.width + 20) * 4 + 4,
      );
      const beforeBoundary = atlas.captures;
      await atlas.update(read(), [{ x: 800, y: 900 }]);
      const boundaryCaptures = atlas.captures - beforeBoundary;
      const cases = [];
      source.style.background =
        "repeating-linear-gradient(90deg,rgb(255,30,80) 0px,rgb(20,60,240) 40px,rgb(255,30,80) 80px)";
      read(true);
      for (const [label, dpr, tiles] of [
        [
          "multiple lenses",
          2,
          Array.from({ length: 11 }, (_, i) => ({
            x: 180 + (i % 3) * 110,
            y: 180 + Math.floor(i / 3) * 70,
          })),
        ],
        ["DPR 1", 1, [{ x: 200, y: 200 }]],
        ["half CSS pixel", 2, [{ x: 200.5, y: 200.5 }]],
        ["fractional fallback", 2, [{ x: 200.25, y: 200.25 }]],
        ["scaled fallback", 2, [{ x: 200, y: 200, scaleX: 0.9, scaleY: 0.9 }]],
        [
          "budget fallback",
          2,
          [
            { x: 200, y: 200 },
            { x: 10000, y: 10000 },
          ],
        ],
        ["source boundary", 2, [{ x: 0, y: 0 }]],
      ]) {
        const shapeCase = { ...shape, dpr, count: tiles.length };
        const candidate = createBackdropAtlas(shapeCase);
        await candidate.update(read(), tiles);
        const next = tiles.map((tile) => ({ ...tile, x: tile.x + 2, y: tile.y + 2 }));
        const updated = await candidate.update(read(), next);
        const fresh = createBackdropAtlas(shapeCase);
        const comparison = await fresh.update(read(), next);
        const pixels = bytes(updated),
          expected = bytes(comparison);
        let peak = 0;
        for (let i = 0; i < pixels.length; i++)
          peak = Math.max(peak, Math.abs(pixels[i] - expected[i]));
        cases.push({ label, peak, captures: candidate.captures });
        candidate.dispose();
        fresh.dispose();
      }
      reference.dispose();
      atlas.dispose();
      source.remove();
      samples.sort((a, b) => a - b);
      return {
        captures,
        median: samples[24],
        p95: samples[45],
        maxError,
        meanError: totalError / a.length,
        pixel: [...pixel],
        boundaryCaptures,
        cases,
      };
    }, moduleRoot);
    console.log(name, JSON.stringify(result));
    const presentation = await page.evaluate(async (moduleRoot) => {
      const { copyBackdrop } = await import(`${moduleRoot}backdrop.ts`);
      const { registerCoreOptics } = await import(`${moduleRoot}core-optics.ts`);
      document.body.replaceChildren();
      document.body.style.cssText = "margin:0;height:2400px";
      const source = document.createElement("div");
      source.style.cssText =
        "all:initial;display:block;position:absolute;left:0;top:0;width:1200px;height:2400px;background:repeating-linear-gradient(90deg,rgb(255,30,80),rgb(20,60,240) 47px,rgb(255,30,80) 93px)";
      const lens = document.createElement("div");
      lens.style.cssText =
        'position:fixed;left:200px;top:200px;width:100px;height:60px;border-radius:20px;--lg-material:apple;--lg-blur:3px;--lg-source-reach:12;--lg-filter:url("#cache-fixture");z-index:1';
      const filter = document.createElement("div");
      filter.id = "cache-fixture";
      document.body.append(source, filter, lens);
      registerCoreOptics(filter, {
        mode: "light",
        profile: "small",
        width: 100,
        height: 60,
        radius: 20,
        bezel: 7,
        thickness: 12,
        level: 1,
      });
      const stop = copyBackdrop(lens, source);
      const wait = async (ready) => {
        const deadline = performance.now() + 10000;
        while (!ready()) {
          if (performance.now() > deadline) throw new Error("Presentation timed out");
          await new Promise(requestAnimationFrame);
        }
      };
      await wait(() =>
        document.querySelector('[data-glass-renderer="shared-core"] canvas:not([hidden])'),
      );
      const target = document.querySelector(
        '[data-glass-renderer="shared-core"] canvas:not([hidden])',
      );
      const drawImage = CanvasRenderingContext2D.prototype.drawImage;
      let presented = 0;
      CanvasRenderingContext2D.prototype.drawImage = function (...args) {
        const value = drawImage.apply(this, args);
        if (this.canvas === target) presented = performance.now();
        return value;
      };
      const samples = [];
      const scroll = [],
        drag = [];
      try {
        for (let index = 1; index <= 48; index++) {
          await new Promise(requestAnimationFrame);
          presented = 0;
          const start = performance.now();
          if (index <= 24) window.scrollTo(0, index * 2);
          else lens.style.left = `${200 + (index - 24) * 2}px`;
          await wait(() => presented > 0);
          samples.push(presented - start);
          (index <= 24 ? scroll : drag).push(presented - start);
        }
        samples.sort((a, b) => a - b);
        scroll.sort((a, b) => a - b);
        drag.sort((a, b) => a - b);
        return {
          median: samples[24],
          p95: samples[45],
          scrollMedian: scroll[12],
          dragMedian: drag[12],
          samples: samples.length,
          visible: !target.hidden,
        };
      } finally {
        CanvasRenderingContext2D.prototype.drawImage = drawImage;
        stop();
      }
    }, moduleRoot);
    console.log(name, "presentation", JSON.stringify(presentation));
    assert.equal(presentation.visible, true);
    assert.equal(presentation.samples, 48);
    assert.ok(
      result.maxError <= 4 && result.meanError < 0.5,
      "Cached gradient must stay within rasterization rounding (4/255 peak, 0.5/255 mean)",
    );
    assert.deepEqual(result.pixel, [20, 180, 90, 255], "Source edits invalidate retained pixels");
    assert.equal(result.boundaryCaptures, 1);
    for (const item of result.cases) {
      assert.ok(item.peak <= 1, `${item.label}: unexpected pixel difference ${item.peak}`);
      const fallback = item.label.includes("fallback");
      assert.equal(item.captures, baseline || fallback ? 2 : 1, item.label);
    }
    if (!baseline)
      assert.equal(result.captures, 1, "Scroll and drag must reuse the retained capture");
  } finally {
    await browser.close();
  }
}
