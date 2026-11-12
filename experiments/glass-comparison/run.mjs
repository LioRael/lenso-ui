import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_MODULE ??
    "../../node_modules/.bun/playwright@1.64.1/node_modules/playwright",
);
const root = path.join(import.meta.dirname, ".cache");
await mkdir(path.join(import.meta.dirname, "results"), { recursive: true });
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  fetch: async (r) => {
    let p = path.join(root, new URL(r.url).pathname);
    if (!p.startsWith(root + "/")) return new Response("", { status: 403 });
    if (!path.extname(p)) p = path.join(p, "index.html");
    let f = Bun.file(p);
    return (await f.exists()) ? new Response(f) : new Response("missing", { status: 404 });
  },
});
const results = [];
const rounds = Number(process.env.ROUNDS ?? 5);
const groups = [
  ["react", "react/?matched"],
  ["exact-matched", "exact/?matched"],
  ["exact-default", "exact/"],
];
function summarize(v) {
  v.sort((a, b) => a - b);
  return {
    p50: v[Math.floor(v.length * 0.5)] ?? 0,
    p95: v[Math.min(v.length - 1, Math.floor(v.length * 0.95))] ?? 0,
    max: v.at(-1) ?? 0,
    over25: v.filter((x) => x > 25).length,
    count: v.length,
  };
}
try {
  for (const [engineName, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch(
      engineName === "webkit"
        ? {
            executablePath:
              process.env.WEBKIT_EXECUTABLE ??
              "/Users/leosouthey/Library/Caches/ms-playwright/webkit-2370/pw_run.sh",
          }
        : {},
    );
    try {
      for (let round = 0; round < rounds; round++)
        for (const [group, url] of [...groups.slice(round % 3), ...groups.slice(0, round % 3)]) {
          const context = await browser.newContext({
            viewport: { width: 1200, height: 900 },
            deviceScaleFactor: 2,
            reducedMotion: "reduce",
          });
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (e) => errors.push(String(e)));
          const cdp = engineName === "chromium" ? await context.newCDPSession(page) : null;
          if (cdp) {
            await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
            await cdp.send("Network.enable");
            await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
            await cdp.send("Performance.enable");
          }
          const metrics = async () =>
            cdp
              ? Object.fromEntries(
                  (await cdp.send("Performance.getMetrics")).metrics.map((x) => [x.name, x.value]),
                )
              : null;
          const delta = (a, b) =>
            a
              ? Object.fromEntries(
                  ["TaskDuration", "ScriptDuration", "LayoutDuration", "RecalcStyleDuration"].map(
                    (k) => [k, (b[k] - a[k]) * 1000],
                  ),
                )
              : null;
          await page.addInitScript(() => {
            globalThis.receipt = { clicks: [], longtasks: [] };
            try {
              new PerformanceObserver((list) => {
                for (const e of list.getEntries())
                  receipt.longtasks.push({ start: e.startTime, duration: e.duration });
              }).observe({ type: "longtask", buffered: true });
            } catch {}
            document.addEventListener(
              "click",
              (e) => {
                let button = e.target.closest("[data-testid]");
                if (!button) return;
                let id = button.dataset.testid;
                if (id === "enable") {
                  receipt.enable = performance.now();
                  return;
                }
                if (!id.startsWith("count-")) return;
                let start = performance.now(),
                  initial = button.textContent;
                let ob = new MutationObserver(() => {
                  if (button.textContent === initial) return;
                  ob.disconnect();
                  let commit = performance.now();
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() =>
                      receipt.clicks.push({
                        commit: commit - start,
                        paint: performance.now() - start,
                      }),
                    ),
                  );
                });
                ob.observe(button, { childList: true, subtree: true, characterData: true });
              },
              true,
            );
          });
          await page.goto(new URL(url, server.url).href);
          await page.getByTestId("enable").waitFor();
          await page.waitForTimeout(250);
          const initBefore = await metrics();
          await page.getByTestId("enable").click();
          await page.waitForFunction(() => {
            let p = [...document.querySelectorAll('[data-testid^="panel-"]')];
            return (
              p.length === 8 &&
              p.every((e) =>
                getComputedStyle(e).getPropertyValue("--lg-foreground-rim").includes("url("),
              )
            );
          });
          const enabled = await page.evaluate(async () => {
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            let end = performance.now(),
              events = glassBench.events;
            globalThis.panels = [...document.querySelectorAll('[data-testid^="panel-"]')];
            globalThis.rootState = globalThis.exact?.state;
            return {
              total: end - receipt.enable,
              toAttach: events[0].time - receipt.enable,
              optics: end - events[0].time,
              events: events.slice(),
              geometry: panels.map((e) => {
                let b = e.getBoundingClientRect(),
                  s = getComputedStyle(e);
                return {
                  rect: [b.x, b.y, b.width, b.height],
                  radius: s.borderRadius,
                  blur: s.getPropertyValue("--lg-blur"),
                  profile: s.getPropertyValue("--apple-material-profile"),
                };
              }),
            };
          });
          const initCPU = delta(initBefore, await metrics());
          assert.equal(enabled.events.filter((x) => x.type === "attach").length, 8);
          for (let i = 0; i < 8; i++)
            assert.deepEqual(enabled.geometry[i].rect, [
              40 + (i % 4) * 280,
              80 + Math.floor(i / 4) * 140,
              260,
              120,
            ]);
          await page.waitForTimeout(350);
          const scrollBefore = await metrics();
          const frames = await page.evaluate(
            () =>
              new Promise((resolve) => {
                let start,
                  previous,
                  frames = [];
                function step(t) {
                  start ??= t;
                  if (previous !== undefined) frames.push(t - previous);
                  previous = t;
                  const progress = Math.min(1, (t - start) / 3000);
                  scrollTo(0, Math.round((1 - Math.cos(progress * Math.PI * 4)) * 1500));
                  if (progress < 1) requestAnimationFrame(step);
                  else resolve(frames);
                }
                requestAnimationFrame(step);
              }),
          );
          const scrollCPU = delta(scrollBefore, await metrics());
          await page.evaluate(() => scrollTo(0, 0));
          await page.waitForTimeout(150);
          const interactionBefore = await metrics();
          for (let i = 1; i <= 40; i++) {
            await page.getByTestId("count-0").click();
            await page.waitForFunction(
              (n) =>
                document.querySelector('[data-testid="count-7"]').textContent === `Count: ${n}`,
              i,
            );
            await page.waitForTimeout(35);
          }
          await page.waitForFunction(() => receipt.clicks.length === 40);
          const interactionCPU = delta(interactionBefore, await metrics());
          const end = await page.evaluate(() => ({
            events: glassBench.events,
            receipt,
            sameDOM: panels.every(
              (e, i) => e === document.querySelector(`[data-testid="panel-${i}"]`),
            ),
            sameRoot: !globalThis.exact || rootState === exact.state,
            connected: panels.filter((e) => e.isConnected).length,
          }));
          assert.equal(end.sameRoot, true);
          assert.equal(errors.length, 0, errors.join("\n"));
          if (round === 0)
            await page.screenshot({
              path: path.join(import.meta.dirname, "results", `${engineName}-${group}.png`),
            });
          const row = {
            engine: engineName,
            version: browser.version(),
            group,
            round,
            enabled,
            initCPU,
            scroll: { frames: summarize(frames), cpu: scrollCPU },
            interactions: {
              commit: summarize(end.receipt.clicks.map((x) => x.commit)),
              paint: summarize(end.receipt.clicks.map((x) => x.paint)),
              cpu: interactionCPU,
            },
            lifetime: {
              attaches: end.events.filter((x) => x.type === "attach").length,
              releases: end.events.filter((x) => x.type === "release").length,
              opticsStarts: end.events.filter((x) => x.type === "optics-start").length,
              opticsStops: end.events.filter((x) => x.type === "optics-stop").length,
              unique: new Set(end.events.filter((x) => x.type === "attach").map((x) => x.id)).size,
              sameDOM: end.sameDOM,
              sameRoot: end.sameRoot,
              connected: end.connected,
            },
            events: end.events,
            longtasks: end.receipt.longtasks,
          };
          results.push(row);
          console.log(
            engineName,
            group,
            round,
            JSON.stringify({
              enable: enabled.total,
              click: row.interactions.paint.p95,
              lifetime: row.lifetime,
            }),
          );
          await Bun.write(
            path.join(import.meta.dirname, "results/results.json"),
            JSON.stringify(
              {
                date: new Date().toISOString(),
                rounds,
                conditions: {
                  viewport: [1200, 900],
                  dpr: 2,
                  chromiumCPU: 4,
                  webkitCPU: 1,
                  scrollWindowMs: 3000,
                  scene: "marked-gradient-backdrop",
                  clicks: 40,
                },
                results,
              },
              null,
              2,
            ),
          );
          await context.close();
        }
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
