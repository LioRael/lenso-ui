import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(
    `${process.env.DOCS_URL ?? "http://127.0.0.1:3000"}/en/docs/react/components/tabs`,
  );
  await page.waitForFunction(() =>
    document.querySelector('[aria-label="Documentation navigation"] [data-minimize-ready]'),
  );
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await client.send("Performance.enable");
  const before = (await client.send("Performance.getMetrics")).metrics;
  const result = await page.evaluate(async () => {
    let reads = 0;
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      if (this.closest("[data-tab-bar-group]")) reads++;
      return original.call(this);
    };
    const intervals = [];
    const activeIntervals = [];
    const endpoints = [];
    let last = 0;
    let wasMoving = false;
    const group = document.querySelector(
      '[aria-label="Documentation navigation"] [data-tab-bar-group]',
    );
    let frame;
    const sample = (time) => {
      const progress = Number(group.style.getPropertyValue("--tab-bar-collapse"));
      const moving = progress !== (group.hasAttribute("data-minimized") ? 1 : 0);
      if (last) {
        intervals.push(time - last);
        if (moving || wasMoving) activeIntervals.push(time - last);
      }
      wasMoving = moving;
      last = time;
      frame = requestAnimationFrame(sample);
    };
    frame = requestAnimationFrame(sample);
    try {
      for (const top of [300, 0, 300, 0, 300, 0]) {
        window.scrollTo(0, top);
        await new Promise((resolve) => setTimeout(resolve, 1100));
        const group = document.querySelector(
          '[aria-label="Documentation navigation"] [data-tab-bar-group]',
        );
        endpoints.push({
          top,
          progress: group.style.getPropertyValue("--tab-bar-collapse"),
          width: original.call(group).width,
        });
      }
    } finally {
      cancelAnimationFrame(frame);
      Element.prototype.getBoundingClientRect = original;
    }
    intervals.sort((a, b) => a - b);
    activeIntervals.sort((a, b) => a - b);
    return {
      reads,
      endpoints,
      frames: intervals.length,
      p95: intervals[Math.floor(intervals.length * 0.95)],
      max: intervals.at(-1),
      over33ms: intervals.filter((n) => n > 33.4).length,
      active: {
        frames: activeIntervals.length,
        p95: activeIntervals[Math.floor(activeIntervals.length * 0.95)],
        over33ms: activeIntervals.filter((n) => n > 33.4).length,
      },
    };
  });
  const after = (await client.send("Performance.getMetrics")).metrics;
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
  for (const endpoint of result.endpoints) {
    assert.equal(endpoint.progress, endpoint.top ? "1" : "0");
    assert.ok(endpoint.top ? Math.abs(endpoint.width - 44) < 1 : endpoint.width > 200);
  }
  console.log(JSON.stringify({ ...result, metrics }, null, 2));
  assert.ok(
    result.reads <= 200,
    `TabBar remeasured during animation: ${result.reads} geometry reads`,
  );
} finally {
  await browser.close();
}
