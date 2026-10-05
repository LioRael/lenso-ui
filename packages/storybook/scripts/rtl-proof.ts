import assert from "node:assert/strict";
import type { BrowserType } from "playwright";

const { chromium }: { chromium: BrowserType } = await import(
  process.env["PLAYWRIGHT_MODULE"] ?? "playwright"
);
const base = process.env["LENSO_CHOICE_URL"];
assert(base, "Run through browser-proofs.ts against the shared production artifact");
const browser = await chromium.launch();
const page = await browser.newPage();
const errors: string[] = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  for (const theme of ["light", "dark"]) {
    await page.goto(
      `${base}/iframe.html?id=local-contracts--rtl-slider&viewMode=story&globals=theme:${theme}`,
    );
    let thumb = page.getByRole("slider", { name: "Volume", exact: true });
    await thumb.focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await thumb.getAttribute("aria-valuenow"), "29");
    await page.keyboard.press("ArrowLeft");
    assert.equal(await thumb.getAttribute("aria-valuenow"), "30");
    await page.goto(
      `${base}/iframe.html?id=local-contracts--rtl-range&viewMode=story&globals=theme:${theme}`,
    );
    thumb = page.getByRole("slider", { name: "Minimum price", exact: true });
    await thumb.waitFor();
    const before = await thumb.boundingBox();
    await thumb.focus();
    await page.keyboard.press("ArrowLeft");
    assert.equal(await thumb.getAttribute("aria-valuenow"), "150");
    const after = await thumb.boundingBox();
    assert(before && after && after.x < before.x, "Native RTL increase moves left");
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
