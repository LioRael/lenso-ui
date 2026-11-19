import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4311";
const modules = `/@fs${new URL("../../../packages/glass/src/", import.meta.url).pathname}`;
const output = process.env.BROWSER_ARTIFACTS;
const runs = Number(process.env.PERF_RUNS ?? 3);
const baseline = process.env.BASELINE_MODULE;
const results = [];
if (output) await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  for (let run = 0; run < runs; run++) {
    const page = await browser.newPage({
      viewport: { width: 1000, height: 800 },
      deviceScaleFactor: Number(process.env.DPR ?? 2),
    });
    const errors = [];
    let baselineLoads = 0;
    page.on("pageerror", (error) => errors.push(error.message));
    if (baseline)
      await page.route(/\/backdrop-scheduler\.ts(?:\?|$)/, async (route) => {
        const response = await route.fetch({ url: new URL(`/@fs${baseline}`, base).href });
        baselineLoads++;
        await route.fulfill({ response });
      });
    await page.route(`${base}/__scheduler-performance`, (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<!doctype html><title>Backdrop scheduler performance</title><style>
          body{margin:0;height:2000px;font:16px system-ui}
          #source{position:absolute;width:960px;height:1800px;background:repeating-linear-gradient(35deg,#df295a 0px,#2565c9 43px,#ebcb57 86px)}
          #source p{margin:12px;padding:6px;color:white}
          .lens{position:fixed;width:100px;height:60px;border-radius:20px;pointer-events:none}
          #unrelated{position:fixed;top:700px;left:0;display:flex}
          #unrelated i{display:block;width:6px;height:6px;background:green}
        </style><div id="source" data-lenso-backdrop>${"<p>Backdrop text and gradient</p>".repeat(16)}</div>
        ${Array.from({ length: 12 }, (_, i) => `<div class="lens" style="left:${30 + (i % 4) * 180}px;top:${30 + Math.floor(i / 4) * 110}px"></div>`).join("")}
        <div id="unrelated">${"<i></i>".repeat(48)}</div>`,
      }),
    );
    await page.goto(`${base}/__scheduler-performance`);
    await page.evaluate(async (modules) => {
      await import(`${modules}backdrop.ts`);
    }, modules);
    await page.addStyleTag({ url: new URL("/virtual:stylex.css", base).href });
    await page.evaluate(async (modules) => {
      const { copyBackdrop } = await import(`${modules}backdrop.ts`);
      window.stops = [...document.querySelectorAll(".lens")].map((lens) =>
        copyBackdrop(lens, document.querySelector("#source")),
      );
    }, modules);
    await page.waitForFunction(() => document.querySelectorAll("[inert] p").length === 192);
    assert.deepEqual(
      await page
        .locator("[inert] p")
        .first()
        .evaluate((p) => {
          const frame = p.parentElement.parentElement;
          return [getComputedStyle(frame).position, getComputedStyle(frame.parentElement).position];
        }),
      ["absolute", "absolute"],
      "The fixture must load the production backdrop copy positioning rules",
    );
    await page.waitForTimeout(300);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp.send("Performance.enable");
    const scenarios = [];
    for (const scenario of [
      "idle",
      "unrelated-paint",
      "source-paint",
      "scroll-drag",
      "unmounted",
    ]) {
      if (scenario === "unmounted")
        await page.evaluate(() => window.stops.forEach((stop) => stop()));
      const trace = [];
      const onData = ({ value }) => trace.push(...value);
      if (output) {
        cdp.on("Tracing.dataCollected", onData);
        await cdp.send("Tracing.start", {
          categories: "devtools.timeline,v8,disabled-by-default-devtools.timeline",
        });
      }
      const before = (await cdp.send("Performance.getMetrics")).metrics;
      const sample = await page.evaluate(async (scenario) => {
        const box = Element.prototype.getBoundingClientRect;
        const animations = document.getAnimations;
        let reads = 0,
          discoveries = 0;
        Element.prototype.getBoundingClientRect = function () {
          reads++;
          return box.call(this);
        };
        document.getAnimations = function (...args) {
          discoveries++;
          return animations.apply(this, args);
        };
        const longTasks = [];
        const observer = new PerformanceObserver((list) => {
          longTasks.push(...list.getEntries().map((entry) => entry.duration));
        });
        observer.observe({ type: "longtask" });
        const intervals = [];
        let previous;
        const start = performance.now();
        const effects = [];
        const source = document.querySelector("#source");
        const unrelated = [...document.querySelectorAll("#unrelated i")];
        try {
          if (scenario === "source-paint")
            effects.push(
              source.firstElementChild.animate([{ opacity: 1 }, { opacity: 0.3 }], {
                duration: 200,
                iterations: 8,
                direction: "alternate",
              }),
            );
          for (let i = 0; i < 90; i++) {
            const time = await new Promise(requestAnimationFrame);
            if (previous !== undefined) intervals.push(time - previous);
            previous = time;
            if (scenario === "unrelated-paint")
              effects.push(
                unrelated[i % unrelated.length].animate([{ opacity: 1 }, { opacity: 0.2 }], {
                  duration: 32,
                }),
              );
            if (scenario === "scroll-drag") {
              window.scrollTo(0, i * 2);
              document.querySelector(".lens").style.left = `${30 + i}px`;
            }
          }
          intervals.sort((a, b) => a - b);
          return {
            reads,
            discoveries,
            duration: performance.now() - start,
            frameP50: intervals[Math.floor(intervals.length * 0.5)],
            frameP95: intervals[Math.floor(intervals.length * 0.95)],
            over33ms: intervals.filter((time) => time > 33.4).length,
            longTasks,
          };
        } finally {
          effects.forEach((effect) => effect.cancel());
          observer.disconnect();
          Element.prototype.getBoundingClientRect = box;
          document.getAnimations = animations;
        }
      }, scenario);
      const after = (await cdp.send("Performance.getMetrics")).metrics;
      const metrics = Object.fromEntries(
        [
          "LayoutCount",
          "LayoutDuration",
          "RecalcStyleCount",
          "RecalcStyleDuration",
          "TaskDuration",
        ].map((name) => [
          name,
          after.find((m) => m.name === name).value - before.find((m) => m.name === name).value,
        ]),
      );
      if (output) {
        const complete = new Promise((done) => cdp.once("Tracing.tracingComplete", done));
        await cdp.send("Tracing.end");
        await complete;
        cdp.off("Tracing.dataCollected", onData);
        await writeFile(
          resolve(output, `scheduler-${run}-${scenario}.trace.json`),
          JSON.stringify({ traceEvents: trace }),
        );
      }
      scenarios.push({ scenario, ...sample, metrics });
      await page.waitForTimeout(200);
    }
    assert.deepEqual(errors, []);
    if (baseline) assert.ok(baselineLoads > 0, "Baseline module was not used");
    assert.equal(scenarios.find((s) => s.scenario === "unmounted").discoveries, 0);
    if (!baseline)
      assert.equal(
        scenarios.find((s) => s.scenario === "unrelated-paint").reads,
        0,
        "Unrelated opacity animations must not remeasure stationary backdrop copies",
      );
    results.push({ run, scenarios });
    const layout = await page.evaluate(async (modules) => {
      const { copyBackdrop } = await import(`${modules}backdrop.ts`);
      const spacer = document.createElement("div");
      spacer.style.height = "0px";
      document.body.prepend(spacer);
      window.scrollTo(0, 0);
      const source = document.querySelector("#source");
      const lens = document.querySelector(".lens");
      // Keep the source covering the lens throughout the sibling's layout shift.
      lens.style.top = "200px";
      const stop = copyBackdrop(lens, source);
      const frame = () => new Promise(requestAnimationFrame);
      const effect = spacer.animate([{ height: "0px" }, { height: "120px" }], { duration: 1000 });
      effect.pause();
      const positions = [];
      try {
        for (const time of [0, 600, 250, "cancel"]) {
          if (time === "cancel") effect.cancel();
          else effect.currentTime = time;
          await frame();
          await frame();
          const copy = document.querySelector("[inert] p").parentElement;
          positions.push({
            source: source.getBoundingClientRect().top,
            copy: copy.getBoundingClientRect().top,
          });
        }
        return positions;
      } finally {
        effect.cancel();
        stop();
        spacer.remove();
      }
    }, modules);
    assert.ok(
      layout[1].source > layout[2].source,
      "The sibling animation must actually move the source",
    );
    for (const position of layout)
      assert.ok(
        Math.abs(position.source - position.copy) < 0.1,
        `Layout animation lost backdrop alignment: ${JSON.stringify(layout)}`,
      );
    await page.close();
  }
  const result = {
    browser: browser.version(),
    platform: process.platform,
    architecture: process.arch,
    cpuSlowdown: 4,
    dpr: Number(process.env.DPR ?? 2),
    baseline: baseline ?? null,
    results,
  };
  console.log(JSON.stringify(result, null, 2));
  if (output)
    await writeFile(resolve(output, "scheduler-results.json"), JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
