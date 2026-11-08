import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
const out = process.env.MOTION_OUTPUT ?? "/tmp/lenso-menu-contour/browser";
await mkdir(out, { recursive: true });
for (const [engine, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  if (process.env.CONTOUR_ENGINE && process.env.CONTOUR_ENGINE !== engine) continue;
  const browser = await type.launch(
    engine === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const theme of ["light", "dark"]) {
      if (process.env.CONTOUR_THEME && process.env.CONTOUR_THEME !== theme) continue;
      const page = await browser.newPage({
        viewport: { width: 900, height: 1000 },
        deviceScaleFactor: 2,
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}/cn/docs/react/components/menu`, { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Actions", exact: true }).waitFor();
      await page.evaluate(async () => {
        const { mount } = await import("/test/menu-close-fixture.tsx");
        for (const e of document.body.children) if (e instanceof HTMLElement) e.hidden = true;
        window.contourHost = document.createElement("div");
        document.body.append(window.contourHost);
        window.contourMount = mount;
      });
      const stamp = Date.now();
      await page.clock.install({ time: new Date(stamp) });
      await page.clock.pauseAt(new Date(stamp + 1000));
      const records = [];
      const kinds = process.env.CONTOUR_KIND
        ? [process.env.CONTOUR_KIND]
        : ["text", "icon", "select", "menu-anchored", "select-anchored"];
      for (const kind of kinds) {
        await page.evaluate(
          ({ kind, theme }) => {
            window.contourStop?.();
            window.contourStop = window.contourMount(window.contourHost, kind, theme);
          },
          { kind, theme },
        );
        await page.clock.runFor(64);
        const select = kind.startsWith("select");
        const trigger = page.getByRole(select ? "combobox" : "button", {
          name: select ? "Case select" : "Case menu",
          exact: true,
        });
        await page.clock.resume();
        await trigger.click();
        await page.waitForTimeout(1200);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(700);
        await page.clock.pauseAt(await page.evaluate(() => new Date(Date.now() + 1500)));
        await trigger.click({ force: true });
        let popup = page.locator(
          `[data-slot=${select ? "select-popover" : "menu-popup"}][data-open]`,
        );
        await page.clock.runFor(16);
        await popup.waitFor();
        if (kind === "cascade") {
          await page.clock.runFor(650);
          await page.getByRole("menuitem", { name: "Nested actions", exact: true }).focus();
          await page.keyboard.press("ArrowRight");
          await page.clock.runFor(16);
          popup = page.locator('[data-menu-motion="cascade"]');
          await popup.waitFor();
        }
        const handle = await popup.elementHandle();
        assert.equal(
          await handle.evaluate((e) =>
            getComputedStyle(e.querySelector("[data-material-lens]"))
              .getPropertyValue("--lenso-material-action-mode")
              .trim(),
          ),
          theme,
          "actual material appearance must match the test case",
        );
        for (const phase of ["opening", "closing"]) {
          if (phase === "closing") {
            await page.clock.runFor(600);
            await page.keyboard.press("Escape");
          }
          let previous = 0;
          let visibleSamples = 0;
          for (const t of kind === "cascade"
            ? [16, 32, 48, 64, 88, 112]
            : [32, 64, 96, 128, 176, 224]) {
            await page.clock.runFor(t - previous);
            previous = t;
            const sample = await handle.evaluate(async (e) => {
              const surface = e.querySelector(
                '[data-slot="menu-surface"], [data-slot="select-surface"]',
              );
              const lens = surface.querySelector("[data-material-lens]");
              if (Number(surface.style.getPropertyValue("--lg-menu-surface-opacity") || 1) <= 0.01)
                return { hidden: true };
              const r = surface.getBoundingClientRect(),
                style = getComputedStyle(surface);
              const sx = r.width / surface.offsetWidth,
                sy = r.height / surface.offsetHeight;
              const parts = style.borderTopLeftRadius.split(" ").map(parseFloat);
              const radius = Math.min(
                r.width / 2,
                r.height / 2,
                parts[0] * sx,
                (parts[1] ?? parts[0]) * sy,
              );
              const live = lens.querySelector("[data-lenso-live-rim]");
              let canvas, box;
              if (live) {
                canvas = live;
                box = live.getBoundingClientRect();
              } else {
                const pseudo = getComputedStyle(lens, "::after");
                const url = pseudo.backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
                if (!url)
                  return {
                    missing: true,
                    connected: e.isConnected,
                    lens: lens.outerHTML.slice(0, 1200),
                    surface: surface.getAttribute("style"),
                  };
                const img = new Image();
                img.src = url;
                await img.decode();
                canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext("2d").drawImage(img, 0, 0);
                const b = lens.getBoundingClientRect();
                box = {
                  x: b.x - sx,
                  y: b.y - sy,
                  width: b.width + 2 * sx,
                  height: b.height + 2 * sy,
                };
              }
              const pixels = canvas
                .getContext("2d")
                .getImageData(0, 0, canvas.width, canvas.height).data;
              let total = 0,
                outside = 0;
              for (let y = 0; y < canvas.height; y++)
                for (let x = 0; x < canvas.width; x++) {
                  const alpha = pixels[(y * canvas.width + x) * 4 + 3];
                  if (!alpha) continue;
                  const px = box.x + ((x + 0.5) * box.width) / canvas.width - r.x - r.width / 2;
                  const py = box.y + ((y + 0.5) * box.height) / canvas.height - r.y - r.height / 2;
                  const qx = Math.abs(px) - (r.width / 2 - radius),
                    qy = Math.abs(py) - (r.height / 2 - radius);
                  const d =
                    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
                    Math.min(Math.max(qx, qy), 0) -
                    radius;
                  total += alpha;
                  if (d > 2) outside += alpha;
                }
              return {
                width: r.width,
                height: r.height,
                radius,
                total,
                outside,
                fraction: outside / total,
                live: !!live,
              };
            });
            records.push({ kind, phase, t, ...sample });
            await writeFile(`${out}/${engine}-${theme}.json`, JSON.stringify(records, null, 2));
            if (sample.hidden) continue;
            visibleSamples++;
            assert.ok(
              !sample.missing && sample.total > 100,
              `${engine} ${theme} ${kind}: no visible contour`,
            );
            assert.ok(
              sample.fraction < 0.01,
              `${engine} ${theme} ${kind} ${phase} ${t}: foreground contour escaped current glass (${sample.fraction})`,
            );
            if (t === 96)
              await page.screenshot({ path: `${out}/${engine}-${theme}-${kind}-${phase}.png` });
          }
          assert.ok(visibleSamples > 0, `${kind} ${phase}: no visible animation samples`);
        }
        await page.clock.runFor(700);
        if (kind === "cascade") {
          await page.keyboard.press("Escape");
          await page.clock.runFor(700);
        }
        assert.equal(await trigger.evaluate((e) => getComputedStyle(e).opacity), "1");
      }
      assert.deepEqual(errors, []);
      console.log(
        `PASS ${engine} ${theme}: foreground contour follows opening and closing for ${kinds.length} source types`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
