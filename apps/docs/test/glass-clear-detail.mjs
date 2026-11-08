import assert from "node:assert/strict";
import { webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
const browser = await webkit.launch();
try {
  for (const theme of ["light", "dark"])
    for (const dpr of [1, 2])
      for (const opacity of [undefined, 1])
        for (const value of [0.999, 1]) {
          const page = await browser.newPage({
            viewport: { width: 1200, height: 450 },
            deviceScaleFactor: dpr,
          });
          const errors = [];
          page.on("pageerror", (e) => errors.push(e.message));
          await page.goto(`${base}/cn/docs/react/components/toolbar`, {
            waitUntil: "domcontentloaded",
          });
          await page.getByRole("button", { name: "主题", exact: true }).waitFor();
          await page.evaluate(
            async ({ theme, opacity, value }) => {
              const { mount, ClearReference } =
                await import("/test/glass-transparency-fixture.tsx");
              for (const e of document.body.children) if (e instanceof HTMLElement) e.hidden = true;
              const host = document.createElement("div");
              host.id = "clear-detail";
              document.body.append(host);
              mount(host, ClearReference, theme, opacity).update(value);
            },
            { theme, opacity, value },
          );
          await page.waitForFunction(() =>
            document.querySelector(
              '#clear-detail [data-transparency-case="appearance"] [data-lenso-glass-foreground-rim]',
            ),
          );
          await page.waitForTimeout(600);
          const material = await page
            .locator('#clear-detail [data-transparency-case="appearance"] [data-audit-glass]')
            .evaluate(async (e) => {
              const { readOptics } = await import("/test/glass-rectangle-fixture.tsx");
              const id = e.style.getPropertyValue("--lg-filter").match(/#([^)"']+)/)?.[1];
              const filter = document.getElementById(id);
              return {
                softness: readOptics(e.style.getPropertyValue("--lg-filter"))?.softness,
                clarity: Number(getComputedStyle(e).getPropertyValue("--lenso-glass-clarity")),
                displacement: !!filter?.querySelector("feDisplacementMap"),
                face: !!filter?.querySelector('[result="material-face"]'),
              };
            });
          assert.ok(Math.abs(material.clarity - (2 * value - 1)) < 1e-8);
          assert.ok(Math.abs(material.softness - 0.8 * (1 - value)) < 1e-8);
          assert.equal(material.displacement, true);
          assert.equal(material.face, true);
          const boxes = await page
            .locator("#clear-detail [data-audit-glass]")
            .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().toJSON()));
          const png = await page.screenshot();
          const samples = await page.evaluate(
            async ({ data, boxes, dpr }) => {
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
              return [boxes[0], boxes[2]].map((b) =>
                [40, 160, 280].flatMap((x) => {
                  const pixels = ctx.getImageData(
                    (b.x + x - 2) * dpr,
                    (b.y + 33) * dpr,
                    4 * dpr,
                    4 * dpr,
                  ).data;
                  return [0, 1, 2].map((channel) => {
                    let sum = 0;
                    for (let i = channel; i < pixels.length; i += 4) sum += pixels[i];
                    return sum / (pixels.length / 4);
                  });
                }),
              );
            },
            { data: png.toString("base64"), boxes, dpr },
          );
          const error = Math.max(...samples[0].map((v, i) => Math.abs(v - samples[1][i])));
          assert.ok(
            error <= 5,
            `${theme} DPR ${dpr} opacity=${opacity} t=${value}: clear line mismatch ${error}`,
          );
          assert.deepEqual(errors, []);
          console.log(
            `PASS ${theme} DPR ${dpr} opacity=${opacity} t=${value}: max channel error ${error}`,
          );
          await page.close();
        }
} finally {
  await browser.close();
}
