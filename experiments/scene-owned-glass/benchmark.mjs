import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(new URL("../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require("playwright");
const base = process.env.GLASS_LAB_URL ?? "http://127.0.0.1:4325";
const output = new URL("../../.amp/in/artifacts/scene-owned-glass/", import.meta.url);
await mkdir(output, { recursive: true });
const results = [];
const percentile = (values, p) =>
  [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * p))] ??
  null;
const summary = (values) => ({
  p50: percentile(values, 0.5),
  p95: percentile(values, 0.95),
  p99: percentile(values, 0.99),
});

for (const [engine, launcher] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== engine) continue;
  const browser = await launcher.launch(
    engine === "chromium" ? { headless: false, args: ["--use-angle=metal"] } : {},
  );
  try {
    for (const scene of (process.env.SCENES ?? "procedural,photo-dynamic,photo-static-small").split(
      ",",
    )) {
      for (const dpr of [1, 2]) {
        for (let run = 0; run < Number(process.env.PERF_RUNS ?? 3); run++) {
          for (const mode of run % 2 ? ["resident", "upload"] : ["upload", "resident"]) {
            const page = await browser.newPage({
              viewport: { width: 848, height: 1000 },
              deviceScaleFactor: dpr,
            });
            const errors = [];
            page.on("pageerror", (error) => errors.push(error.message));
            await page.addInitScript(() => {
              const counters = {
                texSubImage2D: 0,
                readPixels: 0,
                drawImage: 0,
                getImageData: 0,
                serializeToString: 0,
                decode: 0,
                drawArrays: 0,
                drawArraysInstanced: 0,
              };
              for (const [prototype, names] of [
                [
                  WebGL2RenderingContext.prototype,
                  ["texSubImage2D", "readPixels", "drawArrays", "drawArraysInstanced"],
                ],
                [CanvasRenderingContext2D.prototype, ["drawImage", "getImageData"]],
                [XMLSerializer.prototype, ["serializeToString"]],
                [HTMLImageElement.prototype, ["decode"]],
              ])
                for (const name of names) {
                  const original = prototype[name];
                  prototype[name] = function (...args) {
                    counters[name]++;
                    return original.apply(this, args);
                  };
                }
              const resources = {};
              for (const name of ["Texture", "Framebuffer", "Program", "Buffer", "VertexArray"]) {
                const live = new Set();
                resources[name] = live;
                const create = WebGL2RenderingContext.prototype[`create${name}`];
                const destroy = WebGL2RenderingContext.prototype[`delete${name}`];
                WebGL2RenderingContext.prototype[`create${name}`] = function (...args) {
                  const value = create.apply(this, args);
                  if (value) live.add(value);
                  return value;
                };
                WebGL2RenderingContext.prototype[`delete${name}`] = function (value) {
                  live.delete(value);
                  return destroy.call(this, value);
                };
              }
              window.probe = { counters, resources };
            });
            const start = performance.now();
            await page.goto(`${base}?dpr=${dpr}&mode=${mode}&scene=${scene}`);
            await page.waitForFunction(() => window.lab?.ready);
            const navigationToReady = performance.now() - start;
            const rendererInfo = await page.evaluate(() => window.lab.metrics().rendererInfo);
            assert.doesNotMatch(
              rendererInfo,
              /swiftshader|llvmpipe|software/i,
              "software rendering is not a hardware performance sample",
            );
            await page.evaluate(
              (mode) => window.lab.configure({ mode, running: true, time: 0, scroll: 0 }),
              mode,
            );
            await page.waitForTimeout(500);
            const cdp = engine === "chromium" ? await page.context().newCDPSession(page) : null;
            if (cdp) await cdp.send("Performance.enable");
            const before = cdp ? (await cdp.send("Performance.getMetrics")).metrics : [];
            const sample = await page.evaluate(async () => {
              window.lab.metrics(true);
              for (const key of Object.keys(window.probe.counters)) window.probe.counters[key] = 0;
              const longTasks = [];
              const supported = PerformanceObserver.supportedEntryTypes.includes("longtask");
              const observer = supported
                ? new PerformanceObserver((list) =>
                    longTasks.push(...list.getEntries().map((entry) => entry.duration)),
                  )
                : null;
              observer?.observe({ type: "longtask" });
              const start = performance.now();
              for (let index = 0; index < 180; index++) {
                await new Promise(requestAnimationFrame);
                if (index % 12 === 0) {
                  if (window.lab.metrics().scene === "photo-static-small") {
                    document.querySelector("#stage button").dispatchEvent(
                      new KeyboardEvent("keydown", {
                        key: index % 24 === 0 ? "ArrowRight" : "ArrowLeft",
                        altKey: true,
                        bubbles: true,
                      }),
                    );
                  } else {
                    const input = document.querySelector('input[type="range"]');
                    input.value = String(index * 2);
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                  }
                }
              }
              const elapsed = performance.now() - start;
              observer?.disconnect();
              return {
                ...window.lab.metrics(),
                elapsed,
                longTasks: supported ? longTasks : null,
                counters: { ...window.probe.counters },
              };
            });
            const after = cdp ? (await cdp.send("Performance.getMetrics")).metrics : [];
            assert.equal(sample.state, "ready");
            assert.equal(
              sample.counters.readPixels +
                sample.counters.getImageData +
                sample.counters.serializeToString +
                sample.counters.decode,
              0,
            );
            assert.equal(sample.scene, scene);
            assert.equal(sample.lensCount, scene === "photo-static-small" ? 1 : 4);
            assert.equal(
              sample.counters.texSubImage2D > 0,
              mode === "upload" && scene !== "photo-static-small",
            );
            if (scene === "photo-static-small")
              assert.equal(
                sample.counters.drawArrays,
                mode === "upload" ? 0 : sample.counters.drawArraysInstanced,
                "static lens movement must reuse background and blur results",
              );
            const idle =
              scene === "photo-static-small"
                ? await page.evaluate(async () => {
                    window.lab.metrics(true);
                    for (const key of Object.keys(window.probe.counters))
                      window.probe.counters[key] = 0;
                    for (let index = 0; index < 60; index++)
                      await new Promise(requestAnimationFrame);
                    return {
                      submissions: window.lab.metrics().submissions.length,
                      counters: { ...window.probe.counters },
                    };
                  })
                : null;
            if (idle) {
              assert.equal(idle.submissions, 0, "static idle must not submit frames");
              assert.ok(Object.values(idle.counters).every((value) => value === 0));
            }
            const releases = [];
            for (let repeat = 0; repeat < 6; repeat++) {
              await page.getByRole("button", { name: "Unmount renderer" }).click();
              const live = await page.evaluate(() =>
                Object.fromEntries(
                  Object.entries(window.probe.resources).map(([key, set]) => [key, set.size]),
                ),
              );
              assert.ok(
                Object.values(live).every((count) => count === 0),
                `explicit GPU objects must be deleted: ${JSON.stringify(live)}`,
              );
              releases.push(live);
              await page.getByRole("button", { name: "Mount renderer" }).click();
            }
            const metric = (list, key) => list.find((entry) => entry.name === key)?.value;
            const taskSeconds = cdp
              ? metric(after, "TaskDuration") - metric(before, "TaskDuration")
              : null;
            assert.deepEqual(errors, []);
            results.push({
              engine,
              version: browser.version(),
              rendererInfo,
              dpr,
              run,
              mode,
              scene,
              lensCount: sample.lensCount,
              navigationToReady,
              width: sample.width,
              height: sample.height,
              frames: sample.intervals.length,
              callbackFrameMs: summary(sample.intervals),
              submissionMs: summary(sample.submissions),
              syntheticInputToSubmissionMs: summary(sample.inputs),
              mainThreadTaskMs: taskSeconds === null ? null : taskSeconds * 1000,
              elapsed: sample.elapsed,
              longTasks: sample.longTasks,
              calls: sample.counters,
              idle,
              releases,
              raw: sample,
            });
            console.log(
              JSON.stringify(results.at(-1), (key, value) =>
                key === "raw" || key === "releases" ? undefined : value,
              ),
            );
            await writeFile(
              new URL("performance-photo.json", output),
              JSON.stringify(results, null, 2),
            );
            await page.close();
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
}
