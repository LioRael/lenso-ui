import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
// Ordinary control resizing and panel transitions share optics but have no
// common existing browser check for painted foreground continuity.
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 900 },
        colorScheme: theme,
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/en/docs/react/components/glass-button`);
      await page.evaluate(async (theme) => {
        const { mount } = await import("/test/glass-contour-fixture.tsx");
        for (const child of document.body.children)
          if (child instanceof HTMLElement) child.hidden = true;
        const host = document.createElement("div");
        document.body.append(host);
        mount(host, theme);
      }, theme);
      const inspect = async (locator, resize = false) => {
        const result = await locator.evaluate(async (root) => {
          const lens = root.querySelector("[data-material-lens]") ?? root;
          let rim;
          let samples = 0;
          const widths = new Set();
          const failures = [];
          const native = lens.matches("textarea, input");
          for (let i = 0; i < 24; i++) {
            await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
            const current = (native ? lens.nextElementSibling : lens)?.querySelector(
              "[data-lenso-live-rim]",
            );
            if (!current) {
              failures.push("missing foreground");
              continue;
            }
            rim ??= current;
            samples++;
            widths.add(current.width);
            if (current !== rim || !lens.hasAttribute("data-material-live-rim"))
              failures.push("replaced foreground");
            if (
              lens.matches('[data-lenso-slot="glass"]') &&
              getComputedStyle(lens, "::before").display !== "none"
            )
              failures.push("duplicate fitted foreground");
            if (
              Math.abs(current.width / 2 - 2 - lens.offsetWidth) > 1 ||
              Math.abs(current.height / 2 - 2 - lens.offsetHeight) > 1
            )
              failures.push("stale geometry");
            const pixels = current
              .getContext("2d")
              .getImageData(0, Math.floor(current.height / 2), 4, 1).data;
            if (!pixels.some((value, i) => i % 4 === 3 && value > 0))
              failures.push("empty hairline");
          }
          return { samples, sizes: widths.size, failures };
        });
        assert.deepEqual(result.failures, [], `${name}/${theme}: ${JSON.stringify(result)}`);
        assert.ok(result.samples >= 20);
        if (resize)
          assert.ok(result.sizes > 2, `Expected changing geometry: ${JSON.stringify(result)}`);
      };
      const controls = page.locator("[data-contour-case]");
      await controls.first().waitFor();
      await page.getByRole("button", { name: "Show toast", exact: true }).click();
      await page
        .locator('[data-contour-case="toast"] [data-lenso-live-rim]')
        .waitFor({ state: "attached" });
      await page.getByRole("button", { name: "Change geometry", exact: true }).click();
      await Promise.all([
        ...[0, 1, 2, 3].map((i) => inspect(controls.nth(i), true)),
        page
          .waitForTimeout(80)
          .then(() => page.getByRole("button", { name: "Change geometry", exact: true }).click()),
      ]);
      await page.getByRole("button", { name: "Change geometry", exact: true }).click();
      await Promise.all([0, 1, 2, 3].map((i) => inspect(controls.nth(i), true)));
      await page.getByRole("button", { name: "Dismiss contour toast", exact: true }).click();
      await page.locator('[data-contour-case="toast"]').waitFor({ state: "hidden" });
      for (const kind of ["alert", "actions", "sheet"]) {
        await page.getByRole("button", { name: `Open ${kind}`, exact: true }).click();
        const panel = page.getByRole(kind === "alert" ? "alertdialog" : "dialog", {
          name: `Contour ${kind}`,
          exact: true,
        });
        await panel.locator("[data-lenso-live-rim]").waitFor({ state: "attached" });
        await inspect(panel);
        if (kind === "sheet") {
          await panel.getByRole("button", { name: "Change detent", exact: true }).click();
          await inspect(panel, true);
        }
        await panel.getByRole("button", { name: `Close ${kind}`, exact: true }).click();
        await panel.waitFor({ state: "hidden" });
      }
      assert.deepEqual(errors, []);
      console.log(
        `PASS ${name}/${theme}: control resize, corner reversal and glass panel continuity`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
