import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
const out = process.env.MOTION_OUTPUT ?? "/tmp/lenso-menu-close/browser";
await mkdir(out, { recursive: true });
for (const [engine, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await type.launch(
    engine === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const viewport of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width: viewport, height: 1000 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}/cn/docs/react/components/menu`, { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Actions", exact: true }).waitFor();
      await page.evaluate(async () => {
        const { mount } = await import("/test/menu-close-fixture.tsx");
        for (const e of document.body.children) if (e instanceof HTMLElement) e.hidden = true;
        const h = document.createElement("div");
        h.id = "close-fixture";
        document.body.append(h);
        window.closeMount = mount;
        window.closeHost = h;
      });
      await page.waitForTimeout(400);
      const now = Date.now();
      await page.clock.install({ time: new Date(now) });
      await page.clock.pauseAt(new Date(now + 1000));
      for (const kind of [
        "demo",
        "text",
        "icon",
        "select",
        "menu-anchored",
        "select-anchored",
        "above",
      ]) {
        await page.evaluate((kind) => {
          window.closeStop?.();
          window.closeStop = window.closeMount(window.closeHost, kind);
        }, kind);
        const select = kind.startsWith("select");
        const trigger = page.getByRole(select ? "combobox" : "button", {
          name: kind === "demo" ? "Menu" : select ? "Case select" : "Case menu",
          exact: true,
        });
        await trigger.waitFor();
        await page.clock.runFor(64);
        await trigger.click({ force: true });
        await page.clock.runFor(700);
        const popup = page.locator(
          `[data-slot=${select ? "select-popover" : "menu-popup"}][data-open]`,
        );
        await popup.waitFor();
        if (kind === "icon") assert.equal(await popup.getAttribute("data-menu-motion"), "icon");
        const handle = await popup.elementHandle();
        const measure = (e) => {
          const s = e.querySelector('[data-slot="menu-surface"], [data-slot="select-surface"]');
          const r = s.getBoundingClientRect();
          const glyph = e.querySelector('[data-slot="menu-glyph"], [data-slot="select-glyph"]');
          const g = glyph?.getBoundingClientRect();
          return {
            width: r.width,
            height: r.height,
            x: r.x,
            y: r.y,
            opacity: getComputedStyle(s).getPropertyValue("--lg-menu-surface-opacity"),
            glyphOpacity: glyph ? Number(getComputedStyle(glyph).opacity) : 0,
            glyph: g?.toJSON(),
          };
        };
        const initial = await handle.evaluate(measure);
        assert.ok(initial.width > 0 && initial.height > 0);
        await page.keyboard.press("Escape");
        const frames = [];
        let previous = 0;
        for (let t = 0; t <= 288; t += 16) {
          if (t > previous) await page.clock.runFor(t - previous);
          previous = t;
          const f = await handle.evaluate(measure);
          frames.push({ t, ...f });
          if ([48, 128, 208, 288].includes(t) && engine === "chromium" && viewport === 1440)
            await page.screenshot({ path: `${out}/${kind}-${t}.png` });
        }
        for (const f of frames)
          if (f.glyphOpacity > 0.05 && Number(f.opacity) > 0) {
            assert.ok(
              f.glyph.y >= f.y - 2 && f.glyph.y + f.glyph.height <= f.y + f.height + 2,
              `${kind}: returning source label detached from the glass`,
            );
          }
        const visible = frames.filter((f) => Number(f.opacity) > 0);
        const limit = Math.max(1.3, (initial.height / initial.width) * 1.1);
        assert.ok(
          visible.every((f) => f.height / f.width <= limit),
          `${engine} ${viewport} ${kind}: exit became a tall narrow column`,
        );
        for (let i = 1; i < visible.length; i++)
          assert.ok(
            visible[i].height <= visible[i - 1].height + 1,
            `${kind}: height expanded again during close`,
          );
        await writeFile(
          `${out}/${engine}-${viewport}-${kind}.json`,
          JSON.stringify(frames, null, 2),
        );
        await page.clock.runFor(700);
        assert.equal(await handle.evaluate((e) => e.isConnected && e.checkVisibility()), false);
        assert.equal(await trigger.evaluate((e) => document.activeElement === e), true);
        assert.equal(await trigger.evaluate((e) => getComputedStyle(e).opacity), "1");
        console.log(
          `PASS ${engine} ${viewport} ${kind}: whole-panel contraction and source restoration`,
        );
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
