import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const theme of ["light", "dark"])
      for (const tint of [0.5, 1]) {
        const page = await browser.newPage({
          viewport: { width: 1000, height: 900 },
          deviceScaleFactor: 2,
        });
        await page.goto(`${base}/cn/docs/react/components/toolbar`, {
          waitUntil: "domcontentloaded",
        });
        await page.getByRole("button", { name: "主题", exact: true }).waitFor();
        await page.evaluate(
          async ({ theme, tint }) => {
            const { mount } = await import("/test/glass-rectangle-fixture.tsx");
            for (const e of document.body.children) if (e instanceof HTMLElement) e.hidden = true;
            const host = document.createElement("div");
            host.id = "rectangle-fixture";
            document.body.append(host);
            mount(host, tint, theme);
          },
          { theme, tint },
        );
        await page.waitForFunction(() => {
          const e = document.querySelector(
            '#rectangle-fixture section[aria-label="工具栏滚动预览"]',
          );
          return (
            e &&
            getComputedStyle(e).height === "280px" &&
            getComputedStyle(e.querySelector("[data-lenso-backdrop]")).backgroundImage !== "none"
          );
        });
        const glass = page
          .locator('#rectangle-fixture [data-lenso-slot="glass"]')
          .filter({ hasText: "清晰文字" });
        await glass.scrollIntoViewIfNeeded();
        const check = async (locator) => {
          await page.waitForFunction(
            (selector) => {
              const e = document.querySelector(selector);
              return e?.hasAttribute("data-lenso-glass-foreground-rim");
            },
            await locator.evaluate((e) => {
              e.setAttribute("data-rectangle-probe", "");
              return "[data-rectangle-probe]";
            }),
          );
          await page.waitForTimeout(500);
          const result = await locator.evaluate((e) => {
            const copied = e.hasAttribute("data-copy") ? e.previousElementSibling : null;
            const value =
              [
                getComputedStyle(e).getPropertyValue("--lg-filter"),
                ...[...(copied?.querySelectorAll("*") ?? [])].map(
                  (n) => getComputedStyle(n).filter,
                ),
              ].find((v) => v.includes("#")) ?? "";
            const f = document.getElementById(value.match(/#([^)"']+)/)?.[1]);
            return {
              paint: getComputedStyle(e).backdropFilter,
              fitted: f?.hasAttribute("data-lenso-material-foreground"),
              face: !!f?.querySelector('[result="material-face"]'),
              displacement: !!f?.querySelector("feDisplacementMap"),
              shade: !!f?.querySelector('[result="material-shade"],[result="contour-paint"]'),
              rim: e.style.getPropertyValue("--lg-foreground-rim").startsWith("url("),
            };
          });
          delete result.paint;
          assert.deepEqual(result, {
            fitted: true,
            face: true,
            displacement: true,
            shade: false,
            rim: true,
          });
          const innerShade = await locator.evaluate(async (e) => {
            const src = e.style.getPropertyValue("--lg-foreground-rim").slice(5, -2);
            const image = new Image();
            image.src = src;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            return Array.from({ length: 21 }, (_, i) => {
              const p = ctx.getImageData(Math.floor(image.width / 2), (i + 5) * 2, 1, 1).data;
              return p[3] * (1 - p[0] / 255);
            });
          });
          assert.ok(Math.max(...innerShade) > 1, `${name}: inner depth disappeared`);
          for (let i = 1; i < innerShade.length; i++)
            assert.ok(
              innerShade[i] <= innerShade[i - 1],
              `${name}: detached inner shadow at ${i + 4}px`,
            );
          const accelerated = await locator.evaluate(async (e) => {
            const { readOptics, createOpticsBatch } =
              await import("/test/glass-rectangle-fixture.tsx");
            const copied = e.hasAttribute("data-copy") ? e.previousElementSibling : null;
            const value =
              [
                getComputedStyle(e).getPropertyValue("--lg-filter"),
                ...[...(copied?.querySelectorAll("*") ?? [])].map(
                  (n) => getComputedStyle(n).filter,
                ),
              ].find((v) => v.includes("#")) ?? "";
            const optics = readOptics(value);
            if (optics && navigator.gpu) {
              const adapter = await navigator.gpu.requestAdapter();
              if (adapter) {
                const device = await adapter.requestDevice();
                device.pushErrorScope("validation");
                for (const softness of [optics.softness, 0, 0.2]) {
                  const batch = await createOpticsBatch(
                    device,
                    { ...optics, softness },
                    {
                      width: e.offsetWidth,
                      height: e.offsetHeight,
                      margin: 0,
                      dpr: 1,
                      count: 1,
                    },
                  );
                  batch.dispose();
                }
                const error = await device.popErrorScope();
                device.destroy();
                if (error) throw new Error(error.message);
              }
            }
            return (
              optics && {
                material: optics.material,
                shade: optics.shade === null,
                contour: optics.contour === null,
              }
            );
          });
          assert.deepEqual(accelerated, { material: "calibrated", shade: true, contour: true });
          await locator.evaluate((e) => e.removeAttribute("data-rectangle-probe"));
        };
        await check(glass);
        await page.getByRole("button", { name: "Menu", exact: true }).click();
        const menu = page.getByRole("menu").first();
        await menu.waitFor();
        const owner = menu.locator("[data-lenso-glass-foreground-rim]");
        await check(
          (await menu.evaluate((e) => e.hasAttribute("data-lenso-glass-foreground-rim")))
            ? menu
            : owner,
        );
        console.log(
          `${name} ${theme} tint=${tint}: card and menu retain optics with one edge owner`,
        );
        await page.close();
      }
  } finally {
    await browser.close();
  }
}
