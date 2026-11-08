import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await type.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const theme of ["light", "dark"])
      for (const tint of [0, 0.5, 1]) {
        const page = await browser.newPage({ viewport: { width: 1000, height: 500 } });
        await page.goto(`${base}/en/docs/react/components/glass-button`, {
          waitUntil: "domcontentloaded",
        });
        await page.getByRole("button", { name: "Theme", exact: true }).waitFor();
        await page.evaluate(
          async ({ theme, tint }) => {
            const { mount } = await import("/test/glass-prominent-fixture.tsx");
            for (const e of document.body.children) if (e instanceof HTMLElement) e.hidden = true;
            const host = document.createElement("div");
            host.id = "prominent-test";
            document.body.append(host);
            mount(host, tint, theme);
          },
          { theme, tint },
        );
        await page.waitForFunction(() => {
          const e = document.querySelector('#prominent-test [data-variant="prominent"]');
          return (
            e &&
            (e.hasAttribute("data-material-filter") ||
              e.hasAttribute("data-copy") ||
              e.style.getPropertyValue("--lg-rim").startsWith("url("))
          );
        });
        await page.waitForTimeout(400);
        const controls = await page
          .locator("#prominent-test [data-variant=prominent]")
          .evaluateAll((es) =>
            es.map((e) => ({
              text: e.textContent,
              opacity: getComputedStyle(e).opacity,
              visible: e.checkVisibility(),
              box: e.getBoundingClientRect().toJSON(),
              disabled: e.hasAttribute("disabled"),
            })),
          );
        for (const c of controls) {
          assert.equal(
            c.opacity,
            "1",
            `${name} ${theme} tint=${tint}: ${c.text} host became transparent`,
          );
          assert.equal(c.visible, true);
        }
        const png = await page.screenshot();
        const colors = await page.evaluate(
          async ({ data, controls }) => {
            const bmp = await createImageBitmap(
              new Blob([Uint8Array.from(atob(data), (c) => c.charCodeAt(0))], {
                type: "image/png",
              }),
            );
            const canvas = document.createElement("canvas");
            canvas.width = bmp.width;
            canvas.height = bmp.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(bmp, 0, 0);
            return controls
              .filter((c) => !c.disabled)
              .map((c) =>
                [
                  ...ctx.getImageData(
                    Math.round(c.box.x + 9),
                    Math.round(c.box.y + c.box.height / 2),
                    1,
                    1,
                  ).data,
                ].slice(0, 3),
              );
          },
          { data: png.toString("base64"), controls },
        );
        for (const rgb of colors)
          assert.ok(
            Math.max(...rgb) - Math.min(...rgb) > 40,
            `${name}: prominent fill disappeared (${rgb})`,
          );
        const done = page
          .locator("#prominent-test [data-variant=prominent]")
          .filter({ hasText: "Done" });
        await done.focus();
        assert.equal(await done.evaluate((e) => e.matches(":focus-visible")), true);
        await done.dispatchEvent("pointerdown", {
          pointerId: 1,
          pointerType: "mouse",
          button: 0,
          buttons: 1,
        });
        assert.equal(await done.evaluate((e) => getComputedStyle(e).opacity), "1");
        await done.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse", button: 0 });
        console.log(
          `PASS ${name} ${theme} tint=${tint}: visible default/destructive/custom/disabled prominent controls`,
        );
        await page.close();
      }
  } finally {
    await browser.close();
  }
}
