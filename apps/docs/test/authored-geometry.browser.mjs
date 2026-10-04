import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import assert from "node:assert/strict";

const docs = fileURLToPath(new URL("../", import.meta.url));
const root = path.resolve(docs, "../..");
const { values } = parseArgs({ options: { stage: { type: "string", default: "before" } } });
const base = process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:39147";
const output = path.join(root, "test-results/lenso-docs-projection", values.stage);
await mkdir(output, { recursive: true });
const buildId = (await readFile(path.join(docs, ".next/BUILD_ID"), "utf8")).trim();
const index = JSON.parse(
  await readFile(path.join(docs, "src/generated/lenso-docs-index.json"), "utf8"),
);
const browser = await chromium.launch({ headless: true });
const cases = [];
async function geometry(locator) {
  return locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      display: style.display,
      position: style.position,
      top: style.top,
      padding: style.padding,
      gap: style.gap,
      borderRadius: style.borderRadius,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
    };
  });
}
try {
  for (const locale of ["en", "cn"])
    for (const theme of ["light", "dark"])
      for (const width of [1440, 390]) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
        });
        await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`${base}/${locale}/docs/react/components/menu`, {
          waitUntil: "networkidle",
        });
        await page.waitForFunction(
          (value) => document.documentElement.classList.contains(value),
          theme,
        );
        const record = { locale, theme, width, buildId, errors };
        record.header = await geometry(page.locator("#nd-subnav"));
        record.sidebar = await geometry(page.locator("#nd-sidebar"));
        record.tocInitial = await geometry(page.locator("#nd-toc"));
        await page.screenshot({ path: path.join(output, `${locale}-${theme}-${width}-page.png`) });
        const trigger = page
          .locator("header")
          .getByRole("button", { includeHidden: true })
          .filter({ hasText: `v${index.lensoVersion}` });
        record.versionControlVisible = await trigger.isVisible();
        if (record.versionControlVisible) {
          await trigger.click();
          const shellPopup = page.locator('[data-slot="menu-popup"]:visible');
          await shellPopup.waitFor({ state: "visible" });
          record.shellPopup = await geometry(shellPopup);
          await page.screenshot({
            path: path.join(output, `${locale}-${theme}-${width}-shell-menu.png`),
          });
          await page.keyboard.press("Escape");
          await shellPopup.waitFor({ state: "hidden" });
        }
        const scene = page.locator('[data-example-name="menu-default"] [data-example-scene]');
        await scene.scrollIntoViewIfNeeded();
        const sceneTrigger = scene.locator('[data-slot="menu-trigger"]');
        await sceneTrigger.click();
        const nativePopup = page.locator('[data-slot="menu-popup"]:visible');
        await nativePopup.waitFor({ state: "visible" });
        record.nativePopup = await geometry(nativePopup);
        await page.keyboard.press("ArrowDown");
        record.nativeFocus = await page.evaluate(() => ({
          role: document.activeElement?.getAttribute("role"),
          text: document.activeElement?.textContent,
        }));
        await page.screenshot({
          path: path.join(output, `${locale}-${theme}-${width}-native-menu.png`),
        });
        await page.keyboard.press("Escape");
        await nativePopup.waitFor({ state: "hidden" });
        await page.evaluate(() => scrollTo(0, 800));
        record.tocScrolled = await geometry(page.locator("#nd-toc"));
        assert.deepEqual(errors, []);
        cases.push(record);
        await context.close();
      }
} finally {
  await writeFile(
    path.join(output, "geometry.json"),
    JSON.stringify({ base, buildId, cases }, null, 2),
  );
  await browser.close();
}
console.log(`Recorded ${cases.length} actual application ${values.stage} geometry cases.`);
