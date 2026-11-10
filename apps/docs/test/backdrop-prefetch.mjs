import assert from "node:assert/strict";
import { webkit, chromium } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
const moduleRoot = `/@fs${new URL("../../../packages/glass/src/", import.meta.url).pathname}`;
const baselineModule = process.env.BASELINE_MODULE;
for (const [name, engine] of [
  ["webkit", webkit],
  ["chromium", chromium],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue;
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    if (baselineModule)
      await page.route(
        (url) => url.pathname.endsWith("/gpu-capture.ts"),
        async (route) => {
          const response = await route.fetch({ url: new URL(`/@fs${baselineModule}`, base).href });
          await route.fulfill({ response });
        },
      );
    await page.route(`${base}/__backdrop-prefetch`, (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Backdrop prefetch</title>",
      }),
    );
    await page.goto(`${base}/__backdrop-prefetch`);
    const input = await page.evaluate(
      async ({ moduleRoot, baseline }) => {
        const { BackdropPaint, createBackdropAtlas } = await import(`${moduleRoot}gpu-capture.ts`);
        const { BackdropReads } = await import(`${moduleRoot}backdrop-scheduler.ts`);
        const source = document.createElement("div");
        source.style.cssText =
          "all:initial;display:block;position:absolute;left:0;top:0;width:2400px;height:2400px;background:repeating-linear-gradient(90deg,rgb(255,30,80),rgb(20,60,240) 40px,rgb(255,30,80) 80px)";
        document.body.append(source);
        const paint = new BackdropPaint(source);
        const read = (styles = false) => {
          paint.read({ content: false, styles, animated: new Map() }, new BackdropReads());
          return paint.snapshot();
        };
        const shape = { width: 100, height: 60, margin: 12, dpr: 2, count: 1 };
        const frame = () => new Promise(requestAnimationFrame);
        const atlas = createBackdropAtlas(shape);
        const decode = HTMLImageElement.prototype.decode;
        let active = false,
          criticalDecodes = 0;
        HTMLImageElement.prototype.decode = function () {
          if (active) criticalDecodes++;
          return decode.call(this);
        };
        const samples = [],
          intervals = [];
        let previous = performance.now();
        try {
          for (let i = 0; i <= 120; i++) {
            await frame();
            const now = performance.now();
            if (i > 1) intervals.push(now - previous);
            previous = now;
            active = true;
            const start = performance.now();
            const changed = await atlas.update(read(i === 0), [{ x: 200, y: 200 + i * 8 }]);
            samples.push(performance.now() - start);
            active = false;
            if (!changed) throw new Error("Scrolling lost an input update");
          }
        } finally {
          HTMLImageElement.prototype.decode = decode;
          active = false;
        }
        const captures = atlas.captures;
        atlas.dispose();
        const multiple = createBackdropAtlas({ ...shape, count: 11 });
        const tiles = Array.from({ length: 11 }, (_, i) => ({
          x: 200 + (i % 3) * 120,
          y: 200 + Math.floor(i / 3) * 80,
        }));
        await multiple.update(read(), tiles);
        tiles[7].x += 4;
        const dirty = await multiple.update(read(), tiles);
        const dirtyIndices = dirty.indices;
        const fresh = createBackdropAtlas(shape);
        const expected = await fresh.update(read(), [tiles[7]]);
        const firstCell = (change, slot = 0) =>
          change.pixels.canvas
            .getContext("2d")
            .getImageData(
              (slot % change.columns) * (shape.width + shape.margin * 2 + 2) * 2,
              Math.floor(slot / change.columns) * (shape.height + shape.margin * 2 + 2) * 2,
              (shape.width + shape.margin * 2) * 2,
              (shape.height + shape.margin * 2) * 2,
            ).data;
        const actualPixels = firstCell(dirty, dirtyIndices.indexOf(7)),
          expectedPixels = firstCell(expected);
        let dirtyError = 0;
        for (let i = 0; i < actualPixels.length; i++)
          dirtyError = Math.max(dirtyError, Math.abs(actualPixels[i] - expectedPixels[i]));
        fresh.dispose();
        multiple.dispose();

        // Hold decoding to prove preparation is off the current update's path.
        const held = createBackdropAtlas(shape);
        await held.update(read(), [{ x: 200, y: 200 }]);
        let release;
        let gate = new Promise((resolve) => {
          release = resolve;
        });
        let hold = true,
          decodeCalls = 0;
        HTMLImageElement.prototype.decode = async function () {
          decodeCalls++;
          const barrier = hold ? gate : undefined;
          await decode.call(this);
          if (barrier) await barrier;
        };
        let prefetched = false,
          crossingReady = false,
          pixel;
        try {
          await held.update(read(), [{ x: 272, y: 200 }]);
          for (let i = 0; i < 4 && !decodeCalls; i++) await frame();
          prefetched = decodeCalls > 0;
          release();
          hold = false;
          await frame();
          await frame();
          gate = new Promise((resolve) => {
            release = resolve;
          });
          hold = true;
          let crossed;
          const crossing = held.update(read(), [{ x: 304, y: 200 }]).then((value) => {
            crossed = value;
          });
          for (let i = 0; i < 3 && !crossed; i++) await frame();
          crossingReady = !!crossed;
          release();
          hold = false;
          await crossing;
          // A new pending region must never publish pixels from the old source revision.
          gate = new Promise((resolve) => {
            release = resolve;
          });
          hold = true;
          const previousCalls = decodeCalls;
          await held.update(read(), [{ x: 384, y: 200 }]);
          if (!baseline) for (let i = 0; i < 4 && decodeCalls === previousCalls; i++) await frame();
          hold = false;
          source.style.background = "rgb(20,180,90)";
          const green = await held.update(read(true), [{ x: 386, y: 200 }]);
          const pixels =
            "canvas" in green.pixels
              ? green.pixels.canvas.getContext("2d").getImageData(20, 20, 1, 1).data
              : green.pixels.data.slice(
                  (20 * green.pixels.width + 20) * 4,
                  (20 * green.pixels.width + 20) * 4 + 4,
                );
          if ([...pixels].join() !== "20,180,90,255")
            throw new Error("Revision update used stale pixels");
          release();
          await frame();
          const reversed = await held.update(read(), [{ x: 310, y: 200 }]);
          pixel = [...reversed.pixels.canvas.getContext("2d").getImageData(20, 20, 1, 1).data];
          held.dispose();
          const afterDispose = decodeCalls;
          await frame();
          await frame();
          if (decodeCalls !== afterDispose)
            throw new Error("Disposed cache started another capture");
        } finally {
          release();
          hold = false;
          held.dispose();
          HTMLImageElement.prototype.decode = decode;
        }
        const failed = createBackdropAtlas(shape);
        try {
          await failed.update(read(), [{ x: 200, y: 200 }]);
          HTMLImageElement.prototype.decode = () =>
            Promise.reject(new Error("Deliberate prefetch failure"));
          await failed.update(read(), [{ x: 272, y: 200 }]);
          await frame();
          await frame();
          HTMLImageElement.prototype.decode = decode;
          const recovered = await failed.update(read(), [{ x: 304, y: 200 }]);
          if (
            [...recovered.pixels.canvas.getContext("2d").getImageData(20, 20, 1, 1).data].join() !==
            "20,180,90,255"
          )
            throw new Error("Failed prefetch lost its fallback");
        } finally {
          HTMLImageElement.prototype.decode = decode;
          failed.dispose();
          source.remove();
        }
        const cold = samples.shift();
        samples.sort((a, b) => a - b);
        intervals.sort((a, b) => a - b);
        return {
          cold,
          criticalDecodes,
          captures,
          p95: samples[Math.floor(samples.length * 0.95)],
          worst: samples.at(-1),
          longFrames: intervals.filter((n) => n > 25).length,
          worstFrame: intervals.at(-1),
          dirtyIndices,
          dirtyError,
          prefetched,
          crossingReady,
          pixel,
        };
      },
      { moduleRoot, baseline: !!baselineModule },
    );
    console.log(name, "input", JSON.stringify(input));
    assert.ok(
      input.dirtyError <= 1,
      "Dirty pixels must match the requested lens, including atlas row mapping",
    );
    assert.deepEqual(input.pixel, [20, 180, 90, 255]);
    if (!baselineModule) {
      assert.deepEqual(input.dirtyIndices, [7], "Stationary lenses must not be repainted");
      assert.equal(input.prefetched, true, "Prepare before leaving the current cache");
      assert.equal(input.crossingReady, true, "Crossing must use the already prepared cache");
    }

    const presentation = await page.evaluate(async (moduleRoot) => {
      const { copyBackdrop } = await import(`${moduleRoot}backdrop.ts`);
      const { registerCoreOptics } = await import(`${moduleRoot}core-optics.ts`);
      document.body.replaceChildren();
      document.body.style.cssText = "margin:0;height:4000px";
      const source = document.createElement("div");
      source.style.cssText =
        "all:initial;display:block;position:absolute;left:0;top:0;width:2400px;height:4000px;background:repeating-linear-gradient(90deg,rgb(255,30,80),rgb(20,60,240) 47px,rgb(255,30,80) 93px)";
      const filter = document.createElement("div");
      filter.id = "prefetch-fixture";
      document.body.append(source, filter);
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
      const lenses = Array.from({ length: 3 }, (_, i) => {
        const lens = document.createElement("div");
        lens.style.cssText = `position:fixed;left:${200 + i * 140}px;top:200px;width:100px;height:60px;border-radius:20px;--lg-material:apple;--lg-blur:3px;--lg-source-reach:12;--lg-filter:url("#prefetch-fixture");z-index:1`;
        document.body.append(lens);
        return lens;
      });
      const stops = lenses.map((lens) => copyBackdrop(lens, source));
      const wait = async (ready) => {
        const end = performance.now() + 10000;
        while (!ready()) {
          if (performance.now() > end) throw new Error("Presentation timed out");
          await new Promise(requestAnimationFrame);
        }
      };
      await wait(
        () =>
          document.querySelectorAll('[data-glass-renderer="shared-core"] canvas:not([hidden])')
            .length === 3,
      );
      const targets = [
        ...document.querySelectorAll('[data-glass-renderer="shared-core"] canvas:not([hidden])'),
      ];
      const drawImage = CanvasRenderingContext2D.prototype.drawImage;
      const counts = [0, 0, 0],
        submitted = [0, 0, 0],
        samples = [],
        intervals = [];
      let resolveDraw;
      CanvasRenderingContext2D.prototype.drawImage = function (...args) {
        const value = drawImage.apply(this, args);
        const i = targets.indexOf(this.canvas);
        if (i >= 0) {
          counts[i]++;
          submitted[i] = performance.now();
          if (i === 1) resolveDraw?.();
        }
        return value;
      };
      let previous = performance.now();
      try {
        for (let i = 1; i <= 96; i++) {
          await new Promise(requestAnimationFrame);
          const now = performance.now();
          intervals.push(now - previous);
          previous = now;
          const start = performance.now();
          const completed = new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error("Missing dragged lens update")), 5000);
            resolveDraw = () => {
              clearTimeout(timer);
              resolve();
            };
          });
          lenses[1].style.left = `${340 + i * 4}px`;
          await completed;
          resolveDraw = undefined;
          samples.push(submitted[1] - start);
        }
        samples.sort((a, b) => a - b);
        intervals.sort((a, b) => a - b);
        return {
          counts,
          p95: samples[91],
          worst: samples.at(-1),
          longFrames: intervals.filter((n) => n > 25).length,
          worstFrame: intervals.at(-1),
          visible: targets.every((canvas) => !canvas.hidden),
        };
      } finally {
        CanvasRenderingContext2D.prototype.drawImage = drawImage;
        stops.forEach((stop) => stop());
      }
    }, moduleRoot);
    console.log(name, "presentation", JSON.stringify(presentation));
    assert.equal(presentation.visible, true);
    assert.deepEqual(presentation.counts, baselineModule ? [96, 96, 96] : [0, 96, 0]);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
}
