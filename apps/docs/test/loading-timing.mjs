import assert from "node:assert/strict";
import { chromium } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const server = await startStaticServer(process.env.DOCS_OUTPUT);
const browser = await chromium.launch();
const samples = [];
try {
  for (let run = 0; run < 3; run++) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const session = await page.context().newCDPSession(page);
    await session.send("Network.enable");
    await session.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 80,
      downloadThroughput: 200_000,
      uploadThroughput: 75_000,
    });
    await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.loadingTiming = { lcp: 0, ready: 0, flashes: [] };
      new PerformanceObserver((list) => {
        window.loadingTiming.lcp = list.getEntries().at(-1).startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      const frame = () => {
        if (
          !window.loadingTiming.ready &&
          document.querySelector('[data-component-story="Tabs"] [data-ready]')
        )
          window.loadingTiming.ready = performance.now();
        if (
          [...document.querySelectorAll("output")].some((node) =>
            /Loading document|正在加载文档/.test(node.textContent),
          )
        )
          window.loadingTiming.flashes.push(performance.now());
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
    await page.goto(server.base + "/en/docs/react/components/tabs");
    await page.waitForFunction(() => window.loadingTiming.ready > 0);
    const tab = page.locator('[data-story-preview] [role="tab"]').nth(1);
    const before = performance.now();
    await tab.click();
    await page.waitForFunction(() => {
      const tab = document.querySelectorAll('[data-story-preview] [role="tab"]')[1];
      return tab?.getAttribute("aria-selected") === "true";
    });
    const interaction = Math.round(performance.now() - before);
    await page.waitForLoadState("networkidle");
    const metrics = await page.evaluate(() => ({
      fcp: performance.getEntriesByName("first-contentful-paint")[0].startTime,
      lcp: window.loadingTiming.lcp,
      ready: window.loadingTiming.ready,
      flashes: window.loadingTiming.flashes,
    }));
    assert.deepEqual(metrics.flashes, []);
    const sample = { ...metrics, interaction };
    samples.push(sample);
    console.log(`run ${run + 1}: ${JSON.stringify(sample)}`);
    await page.close();
  }
  console.log(
    "median ms",
    Object.fromEntries(
      ["fcp", "lcp", "ready", "interaction"].map((key) => [
        key,
        Math.round(samples.map((sample) => sample[key]).sort((a, b) => a - b)[1]),
      ]),
    ),
  );
} finally {
  await browser.close();
  await server.close();
}
