import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
const out = process.env.MOTION_OUTPUT ?? "/tmp/lenso-menu-close/browser";
await mkdir(out, { recursive: true });
// A popup that resized while open should return along the same path as one
// mounted at its final size. Fixed-size closing tests cannot detect stale bounds.
async function checkResizedExit(page, trigger, slot) {
  const popup = page.locator(`[data-lenso-slot="${slot}"]`);
  const resizeRule = `[data-lenso-slot="${slot}"] { width: 480px !important; height: 280px !important; }`;
  const trajectories = [];
  for (const resizeWhileOpen of [true, false]) {
    let style;
    if (!resizeWhileOpen) style = await page.addStyleTag({ content: resizeRule });
    await trigger.evaluate((node) => node.click());
    await page.clock.runFor(720);
    const initial = await popup.boundingBox();
    if (resizeWhileOpen) style = await page.addStyleTag({ content: resizeRule });
    await page.clock.runFor(160);
    const final = await popup.boundingBox();
    assert.equal(final.width, 480);
    assert.equal(final.height, 280);
    if (resizeWhileOpen) assert.notEqual(initial.width, final.width);
    await page.keyboard.press("Escape");
    const surface = popup.locator('[data-lenso-slot$="-surface"]');
    const trajectory = [];
    for (const interval of [16, 64, 112, 80]) {
      await page.clock.runFor(interval);
      trajectory.push(await surface.boundingBox());
    }
    trajectories.push(trajectory);
    await page.clock.runFor(704);
    assert.equal(await popup.isVisible(), false);
    assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
    await style.evaluate((node) => node.remove());
  }
  for (const [i, actual] of trajectories[0].entries())
    for (const key of ["x", "y", "width", "height"])
      assert.ok(
        Math.abs(actual[key] - trajectories[1][i][key]) < 1,
        `${slot} resized exit, frame ${i} ${key}: ${actual[key]} vs ${trajectories[1][i][key]}`,
      );
}
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
          `[data-lenso-slot=${select ? "select-popover" : "menu-popup"}][data-open]`,
        );
        await popup.waitFor();
        if (kind === "icon") assert.equal(await popup.getAttribute("data-menu-motion"), "icon");
        const handle = await popup.elementHandle();
        const measure = (e) => {
          const s = e.querySelector(
            '[data-lenso-slot="menu-surface"], [data-lenso-slot="select-surface"]',
          );
          const r = s.getBoundingClientRect();
          const glyph = e.querySelector(
            '[data-lenso-slot="menu-glyph"], [data-lenso-slot="select-glyph"]',
          );
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
        if (viewport === 1440 && (kind === "icon" || kind === "select")) {
          await checkResizedExit(page, trigger, select ? "select-popover" : "menu-popup");
        }
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
