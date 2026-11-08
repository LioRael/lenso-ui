import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
const out = process.env.MOTION_OUTPUT ?? "/tmp/lenso-menu-continuous";
await mkdir(out, { recursive: true });
for (const [engine, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await type.launch(
    engine === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}/cn/docs/react/components/menu`, { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Actions", exact: true }).waitFor();
      await page.evaluate(async () => {
        const { mount } = await import("/test/menu-curves-fixture.tsx");
        for (const child of document.body.children)
          if (child instanceof HTMLElement) child.hidden = true;
        const host = document.createElement("div");
        document.body.append(host);
        mount(host);
      });
      await page.locator('[data-motion-case="text"] button[aria-label="Menu"]').waitFor();
      await page.waitForTimeout(700);
      const stamp = Date.now();
      await page.clock.install({ time: new Date(stamp) });
      await page.clock.pauseAt(new Date(stamp + 1000));
      for (const [kind, selector] of [
        ["text", '[data-motion-case="text"] button[aria-label="Menu"]'],
        ["icon", '[data-motion-case="icon"] button'],
      ]) {
        const trigger = page.locator(selector).first();
        await trigger.scrollIntoViewIfNeeded();
        await page.evaluate(() => {
          window.expansionStart = undefined;
          window.expansionObserver?.disconnect();
          window.expansionObserver = new MutationObserver((records) => {
            if (
              window.expansionStart === undefined &&
              records.some(
                (r) => r.target instanceof Element && r.target.hasAttribute("data-menu-morphing"),
              )
            )
              window.expansionStart = performance.now();
          });
          window.expansionObserver.observe(document.body, {
            subtree: true,
            attributes: true,
            attributeFilter: ["data-menu-morphing"],
          });
        });
        await trigger.click({ force: true });
        for (
          let n = 0;
          n < 12 && !(await page.evaluate(() => window.expansionStart !== undefined));
          n++
        )
          await page.clock.runFor(16);
        const popup = page.locator('[data-slot="menu-popup"][data-open]');
        const frames = [];
        for (let t = 0; t <= 448; t += 16) {
          const elapsed = await page.evaluate(() => performance.now() - window.expansionStart);
          if (t > elapsed) await page.clock.runFor(t - elapsed);
          frames.push(
            await popup.evaluate((e) => {
              const r = e.querySelector('[data-slot="menu-surface"]').getBoundingClientRect();
              return {
                t: performance.now() - window.expansionStart,
                width: r.width,
                height: r.height,
                x: r.x,
                y: r.y,
              };
            }),
          );
          if ([48, 112, 224, 448].includes(t))
            await page.screenshot({
              path: `${out}/${engine}-${width}-${kind}-${t}.png`,
              animations: "allow",
            });
        }
        await writeFile(`${out}/${engine}-${width}-${kind}.json`, JSON.stringify(frames, null, 2));
        const early = frames.find((f) => f.t >= 48);
        assert.ok(early.height / early.width < 2.5, "opening became a tall narrow column");
        const speeds = frames
          .slice(1)
          .map((f, i) => ({ t: f.t, v: (f.height - frames[i].height) / (f.t - frames[i].t) }));
        const before = Math.max(...speeds.filter((f) => f.t <= 160).map((f) => f.v));
        const later = Math.max(...speeds.filter((f) => f.t > 176 && f.t < 320).map((f) => f.v));
        assert.ok(later < before * 1.5, "height began a second late expansion");
        const final = await popup.boundingBox();
        assert.ok(Math.abs(frames.at(-1).height - final.height) < 1);
        await page.keyboard.press("Escape");
        await page.clock.runFor(650);
      }
      await page.clock.resume();
      assert.deepEqual(errors, []);
      console.log("PASS", engine, width, "default example and tall icon continuous expansion");
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
