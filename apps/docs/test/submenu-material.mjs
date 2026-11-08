import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
const out = process.env.MOTION_OUTPUT ?? "/tmp/lenso-submenu-material/owned";
await mkdir(out, { recursive: true });
const records = [];
for (const [engine, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  if (process.env.MATERIAL_ENGINE && process.env.MATERIAL_ENGINE !== engine) continue;
  const browser = await type.launch(
    engine === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const theme of ["light", "dark"])
      for (const tint of [0, 0.5, 1]) {
        if (process.env.MATERIAL_THEME && process.env.MATERIAL_THEME !== theme) continue;
        if (process.env.MATERIAL_TINT && Number(process.env.MATERIAL_TINT) !== tint) continue;
        const page = await browser.newPage({
          viewport: { width: 1440, height: 1000 },
          deviceScaleFactor: 2,
          colorScheme: theme,
        });
        const errors = [];
        page.on("pageerror", (e) => {
          errors.push(e.message);
          console.error(`${engine} page error: ${e.message}`);
        });
        await page.goto(`${base}/en/docs/react/components/menu`, {
          waitUntil: "domcontentloaded",
          timeout: 90000,
        });
        const trigger = page.getByRole("button", { name: "Actions", exact: true });
        await trigger.waitFor();
        await trigger.and(page.locator('[style*="--lenso-glass-clarity:"]')).waitFor();
        await trigger.evaluate((e, tint) => {
          const root = e.getRootNode();
          const target =
            root instanceof ShadowRoot
              ? root.host
              : (e.closest('[style*="--lenso-glass-tint-amount"]') ?? document.documentElement);
          target.style.setProperty("--lenso-glass-tint-amount", String(tint));
        }, tint);
        await trigger.focus();
        await page.keyboard.press("Enter");
        let parent = page.locator('[data-slot="menu-popup"][data-open]').first();
        await parent.waitFor();
        parent = page.locator(`[id=${JSON.stringify(await parent.getAttribute("id"))}]`);
        await parent.locator("[data-glass-backdrop-snapshot]").waitFor({ timeout: 20000 });
        await page.getByRole("menuitem", { name: "Sort by", exact: true }).focus();
        await page.keyboard.press("ArrowRight");
        let child = page.locator('[data-slot="menu-popup"][data-open]').last();
        await child.waitFor();
        child = page.locator(`[id=${JSON.stringify(await child.getAttribute("id"))}]`);
        await child.locator("[data-glass-backdrop-snapshot]").waitFor({ timeout: 20000 });
        const state = await child.evaluate((e) => ({
          id: e.id,
          tintAmount: Number(
            getComputedStyle(e.querySelector("[data-material-lens]")).getPropertyValue(
              "--lenso-glass-tint-amount",
            ),
          ),
          mode: getComputedStyle(e.querySelector("[data-material-lens]"))
            .getPropertyValue("--lenso-material-action-mode")
            .trim(),
          box: e.getBoundingClientRect().toJSON(),
        }));
        assert.equal(state.mode, theme);
        assert.equal(state.tintAmount, tint);
        await page.waitForTimeout(100);
        const png = await page.screenshot({
          caret: "initial",
          path: `${out}/${engine}-${theme}-${tint}.png`,
        });
        const rgb = await page.evaluate(
          async ({ encoded, box }) => {
            const image = new Image();
            image.src = `data:image/png;base64,${encoded}`;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            return [0.2, 0.5, 0.8].map((t) =>
              [
                ...ctx.getImageData(
                  Math.round((box.x + box.width * 0.85) * 2),
                  Math.round((box.y + box.height * t) * 2),
                  1,
                  1,
                ).data,
              ].slice(0, 3),
            );
          },
          { encoded: png.toString("base64"), box: state.box },
        );
        assert.equal(await child.locator("[data-glass-backdrop-snapshot]").count(), 1);
        records.push({ engine, theme, tint, rgb, ...state });
        await writeFile(`${out}/samples.json`, JSON.stringify(records, null, 2));
        await page.keyboard.press("Escape");
        await child.waitFor({ state: "hidden" });
        assert.equal(
          await page
            .getByRole("menuitem", { name: "Sort by", exact: true })
            .evaluate((e) => e === e.getRootNode().activeElement),
          true,
        );
        await page.keyboard.press("Escape");
        await parent.waitFor({ state: "hidden" });
        assert.equal(await trigger.evaluate((e) => e === e.getRootNode().activeElement), true);
        assert.deepEqual(errors, []);
        console.log(
          `PASS ${engine} ${theme} tint=${tint}: parent and submenu use owned input; focus restored`,
        );
        await page.close();
      }
  } finally {
    await browser.close();
  }
}
for (const sample of records.filter((x) => x.engine === "chromium")) {
  const other = records.find(
    (x) => x.engine === "webkit" && x.theme === sample.theme && x.tint === sample.tint,
  );
  if (!other) continue;
  const diff = Math.max(
    ...sample.rgb.flatMap((a, i) => a.map((n, k) => Math.abs(n - other.rgb[i][k]))),
  );
  console.log(`${sample.theme} tint=${sample.tint}: max interior RGB difference=${diff}`);
  assert.ok(diff <= 6, JSON.stringify({ sample, other, diff }));
}
