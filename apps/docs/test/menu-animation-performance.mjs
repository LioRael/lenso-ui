import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const name = process.argv[2] ?? "candidate";
const out = process.env.MOTION_OUTPUT ?? "/tmp/lenso-menu-performance";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu"] });
try {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto("http://127.0.0.1:4337/cn/docs/react/components/menu", {
    waitUntil: "domcontentloaded",
  });
  await p.locator("[data-slot=menu-trigger][aria-label=Actions]").waitFor();
  await p.evaluate(async () => {
    const { mount } = await import("/test/menu-curves-fixture.tsx");
    for (const child of document.body.children)
      if (child instanceof HTMLElement) child.hidden = true;
    const host = document.createElement("div");
    document.body.append(host);
    mount(host);
  });
  await p.locator("[data-motion-case=text] button[aria-label=Menu]").waitFor();
  await p.waitForTimeout(2000);
  const c = await p.context().newCDPSession(p);
  await c.send("Performance.enable");
  const metrics = async () =>
    Object.fromEntries(
      (await c.send("Performance.getMetrics")).metrics.map((x) => [x.name, x.value]),
    );
  const runs = [];
  for (let round = 0; round < 4; round++)
    for (const [kind, selector] of [
      ["text", "[data-motion-case=text] button[aria-label=Menu]"],
      ["icon", "[data-motion-case=icon] button"],
    ]) {
      const t = p.locator(selector).first();
      await t.scrollIntoViewIfNeeded();
      await p.waitForTimeout(250);
      await p.evaluate(() => {
        window.samples = [];
        window.tracking = true;
        let last = 0,
          phase = false;
        const tick = (t) => {
          if (!window.tracking) return;
          const moving = !!document.querySelector("[data-menu-morphing]");
          if (moving && phase) window.samples.push(t - last);
          last = t;
          phase = moving;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      const a = await metrics();
      await t.click();
      await p.waitForTimeout(650);
      await p.keyboard.press("Escape");
      await p.waitForTimeout(650);
      const b = await metrics();
      const gaps = await p.evaluate(() => {
        window.tracking = false;
        return window.samples;
      });
      runs.push({
        round,
        kind,
        ...Object.fromEntries(
          [
            "TaskDuration",
            "ScriptDuration",
            "LayoutDuration",
            "RecalcStyleDuration",
            "LayoutCount",
            "RecalcStyleCount",
          ].map((k) => [k, b[k] - a[k]]),
        ),
        frames: gaps.length,
        p95: gaps.sort((a, b) => a - b)[Math.floor(gaps.length * 0.95)],
        over33: gaps.filter((x) => x > 33.4).length,
        max: Math.max(...gaps),
      });
    }
  await writeFile(`${out}/${name}.json`, JSON.stringify(runs, null, 2));
  console.log(runs);
} finally {
  await browser.close();
}
