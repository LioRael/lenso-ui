import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    for (const theme of ["light", "dark"]) {
      for (const direction of ["ltr", "rtl"]) {
        const page = await browser.newPage({
          viewport: { width: 390, height: 900 },
          colorScheme: theme,
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`${base}/en/docs/react/components/toast`);
        await page.getByRole("heading", { name: "Toast", exact: true }).first().waitFor();
        await page.waitForLoadState("networkidle");
        await page.evaluate(
          async ({ theme, direction }) => {
            const { mount } = await import("/test/glass-contour-fixture.tsx");
            for (const child of document.body.children)
              if (child instanceof HTMLElement) child.hidden = true;
            document.documentElement.dir = direction;
            const host = document.createElement("div");
            document.body.append(host);
            mount(host, theme);
          },
          { theme, direction },
        );
        await page.getByRole("button", { name: "Show toast", exact: true }).click();
        const toast = page.locator('[data-contour-case="toast"]');
        await toast.waitFor();
        await page.waitForTimeout(500);
        for (const reverse of [false, false, true]) {
          const samples = await toast.evaluate(async (root, reverse) => {
            const close = root.querySelector('[data-lenso-slot="toast-close"]');
            const rtl = getComputedStyle(root).direction === "rtl";
            const toggle = [...document.querySelectorAll("button")].find(
              (button) => button.textContent === "Change geometry",
            );
            const start = performance.now();
            const frames = [];
            const sample = () => {
              const surface = root.getBoundingClientRect();
              const button = close.getBoundingClientRect();
              frames.push({
                width: surface.width,
                inset: rtl ? button.left - surface.left : surface.right - button.right,
                height: button.height,
                buttonWidth: button.width,
              });
            };
            sample();
            toggle.click();
            let reversed = false;
            while (performance.now() - start < 800) {
              await new Promise(requestAnimationFrame);
              sample();
              if (reverse && !reversed && performance.now() - start >= 80) {
                toggle.click();
                reversed = true;
              }
            }
            return frames;
          }, reverse);
          for (const frame of samples) {
            assert.ok(
              Math.abs(frame.inset - 10) < 1,
              `${name}/${theme}/${direction}: close detached from live edge: ${JSON.stringify(frame)}`,
            );
            assert.ok(
              Math.abs(frame.height - 24) < 1 && Math.abs(frame.buttonWidth - 24) < 1,
              "Resizing must not scale the native close control",
            );
          }
          assert.ok(
            new Set(samples.map((frame) => Math.round(frame.width))).size > 4,
            "Normal-motion surface must still animate rather than snap",
          );
        }
        await page.getByRole("button", { name: "Change geometry", exact: true }).click();
        await page.waitForTimeout(60);
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width: 320, height: 900 });
        await toast.evaluate(async (root) => {
          for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame);
          const surface = root.getBoundingClientRect();
          const button = root
            .querySelector('[data-lenso-slot="toast-close"]')
            .getBoundingClientRect();
          const inset =
            getComputedStyle(root).direction === "rtl"
              ? button.left - surface.left
              : surface.right - button.right;
          if (Math.abs(inset - 10) >= 1 || surface.left < 0 || surface.right > innerWidth)
            throw new Error(`Reduced-motion resize lost the close control: ${inset}`);
        });
        await page.getByRole("button", { name: "Dismiss contour toast", exact: true }).click();
        await toast.waitFor({ state: "hidden" });
        assert.deepEqual(errors, []);
        console.log(`PASS ${name}/${theme}/${direction}: Pill edge anchoring and reversal`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
