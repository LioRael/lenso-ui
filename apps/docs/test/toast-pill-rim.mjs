import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
// DOM tests cannot resolve the composed StyleX pseudo-element rules during a live resize.
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({
        viewport: { width: theme === "light" ? 1000 : 390, height: 800 },
        colorScheme: theme,
        deviceScaleFactor: 2,
      });
      await page.goto(`${base}/cn/docs/react/components/toast`, {
        waitUntil: "domcontentloaded",
      });
      await page.evaluate(async (theme) => {
        const { mount } = await import("/test/toast-pill-fixture.tsx");
        for (const child of document.body.children)
          if (child instanceof HTMLElement) child.hidden = true;
        const host = document.createElement("div");
        host.setAttribute("data-theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
        document.body.append(host);
        mount(host);
        window.rimSamples = [];
        window.stopRimSampling = false;
        const sample = () => {
          const lens = document.querySelector('[data-slot="toast"] [data-material-lens]');
          if (lens?.hasAttribute("data-material-resizing")) {
            const canvas = lens.querySelector("[data-lenso-live-rim]");
            const edge = canvas
              ?.getContext("2d")
              .getImageData(0, Math.floor(canvas.height / 2), 4, 1).data;
            window.rimSamples.push({
              visible: canvas && getComputedStyle(canvas).display !== "none",
              edgeAlpha: edge ? Math.max(edge[3], edge[7], edge[11], edge[15]) : 0,
              width: lens.getBoundingClientRect().width,
            });
          }
          if (!window.stopRimSampling) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }, theme);
      await page.getByRole("button", { name: "Check for updates", exact: true }).click();
      const download = page.getByRole("button", { name: "Download", exact: true });
      await download.waitFor();
      await page.waitForFunction(() => {
        const lens = document.querySelector('[data-slot="toast"] [data-material-lens]');
        return (
          lens?.hasAttribute("data-lenso-glass-foreground-rim") &&
          !lens.hasAttribute("data-material-resizing")
        );
      });
      const box = await page.locator('[data-slot="toast"]').boundingBox();
      const clip = { x: box.x - 3, y: box.y - 3, width: box.width + 6, height: box.height + 6 };
      const settled = await page.screenshot({ clip });
      // Hold the exact presentation state used while the next optical map is pending.
      await page.evaluate(() =>
        document
          .querySelector('[data-slot="toast"] [data-material-lens]')
          .setAttribute("data-material-resizing", ""),
      );
      const moving = await page.screenshot({ clip });
      const difference = await page.evaluate(
        async ({ settled, moving }) => {
          const decode = async (data) => {
            const image = new Image();
            image.src = `data:image/png;base64,${data}`;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            return {
              width: canvas.width,
              height: canvas.height,
              pixels: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
            };
          };
          const a = await decode(settled),
            b = await decode(moving);
          let sum = 0,
            count = 0;
          for (let y = 2; y < a.height - 2; y++)
            for (let x = 2; x < a.width - 2; x++) {
              if (y > 11 && y < a.height - 12 && x > 11 && x < a.width - 12) continue;
              for (let channel = 0; channel < 3; channel++) {
                const i = (y * a.width + x) * 4 + channel;
                sum += Math.abs(a.pixels[i] - b.pixels[i]);
                count++;
              }
            }
          const pixel = (x, y) => [
            ...a.pixels.slice((y * a.width + x) * 4, (y * a.width + x) * 4 + 3),
          ];
          const center = Math.floor(a.width / 2);
          return {
            difference: sum / count,
            top: pixel(center, 6),
            face: pixel(center, 26),
            inner: pixel(center, 12),
            outside: pixel(center, 0),
          };
        },
        { settled: settled.toString("base64"), moving: moving.toString("base64") },
      );
      assert.ok(
        difference.difference < 0.5,
        `The fine edge changes after optical fitting: ${JSON.stringify(difference)}`,
      );
      if (theme === "light") {
        // Rex's supplied light reference has a white crest, a bright inward
        // falloff and a quiet exterior; any nonempty shadow is insufficient.
        assert.ok(
          difference.top.every((v) => v >= 250),
          `Missing white reflection: ${JSON.stringify(difference)}`,
        );
        assert.ok(
          difference.inner[0] >= difference.face[0],
          "The inner reflection must not become a dark band",
        );
        assert.ok(
          difference.outside.every((v) => v >= 247),
          `Panel shadow obscures the background: ${JSON.stringify(difference)}`,
        );
      }
      await page.evaluate(() =>
        document
          .querySelector('[data-slot="toast"] [data-material-lens]')
          .removeAttribute("data-material-resizing"),
      );
      await download.click();
      const completed = page.getByRole("button", {
        name: "Update installed. Your terminal tabs won't be lost",
        exact: true,
      });
      await completed.waitFor();
      await completed.click();
      await page.waitForTimeout(1000);
      await completed.click();
      await page.waitForTimeout(1000);
      const samples = await page.evaluate(() => {
        window.stopRimSampling = true;
        return window.rimSamples;
      });
      assert.ok(samples.length > 0, "The workflow must exercise material resizing");
      for (const sample of samples) {
        assert.ok(sample.visible, "The actual foreground must stay visible during resize");
        assert.ok(sample.edgeAlpha > 0, `Missing fine edge pixels: ${JSON.stringify(sample)}`);
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      await completed.focus();
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: "Dismiss update notification" }).click();
      await page.locator('[data-slot="toast"]').waitFor({ state: "detached" });
      console.log(
        `PASS ${name} ${theme}: ${samples.length} painted resize frames; edge pixel difference ${difference.difference.toFixed(3)}; top ${difference.top}`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
