import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

function clippedRing(node) {
  const rect = node.getBoundingClientRect();
  const clipping = [];
  for (let ancestor = node.parentElement; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    const bounds = ancestor.getBoundingClientRect();
    const clipsX =
      style.overflowX !== "visible" &&
      (rect.left - 4 < bounds.left - 0.1 || rect.right + 4 > bounds.right + 0.1);
    const clipsY =
      style.overflowY !== "visible" &&
      (rect.top - 4 < bounds.top - 0.1 || rect.bottom + 4 > bounds.bottom + 0.1);
    if (clipsX || clipsY) clipping.push({ tag: ancestor.tagName, overflow: style.overflow });
  }
  return clipping;
}

// Selection/overflow coverage does not prove the content is centered or that
// the outside keyboard focus ring is actually paintable at collection edges.
export async function checkThemeBuilderControls(page, base) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${base}/en/theme-builder`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() =>
    document.querySelector("[data-testid=theme-builder]")?.hasAttribute("data-theme"),
  );
  for (const mode of ["Light", "Dark"]) {
    await page.getByRole("button", { name: `${mode} theme`, exact: true }).click();
    for (const label of ["Radius", "Radius Form"]) {
      await page.getByRole("button", { name: `Choose ${label}`, exact: true }).click();
      const option = page.getByRole("option", { name: `${label} medium`, exact: true });
      const alignment = await option.evaluate((node) => {
        const outer = node.getBoundingClientRect();
        const first = node.firstElementChild.getBoundingClientRect();
        const last = node.lastElementChild.getBoundingClientRect();
        return Math.abs((first.top + last.bottom) / 2 - (outer.top + outer.height / 2));
      });
      assert.ok(
        alignment <= 1,
        `${mode} ${label} icon/caption group is off-center by ${alignment}px`,
      );
      await page.keyboard.press("Escape");
    }
    const trigger = page.getByRole("button", { name: "Choose Theme", exact: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const last = page.getByRole("option", { name: "Apply Rabbit theme", exact: true });
    await last.focus();
    const clipped = await last.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const clipping = [];
      for (let ancestor = node.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        const bounds = ancestor.getBoundingClientRect();
        const clipsX =
          style.overflowX !== "visible" &&
          (rect.left - 4 < bounds.left || rect.right + 4 > bounds.right);
        const clipsY =
          style.overflowY !== "visible" &&
          (rect.top - 4 < bounds.top || rect.bottom + 4 > bounds.bottom);
        if (clipsX || clipsY) clipping.push({ tag: ancestor.tagName, overflow: style.overflow });
      }
      return clipping;
    });
    assert.deepEqual(clipped, [], `${mode} Rabbit's focus ring is clipped by an ancestor`);
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Choose Font Family", exact: true }).click();
    await page.getByRole("button", { name: "Add from CDN", exact: true }).click();
    const fontInput = page.getByRole("textbox", { name: "Font URL", exact: true });
    const importFont = page.getByRole("button", { name: "Import font", exact: true });
    assert.equal(await importFont.isDisabled(), true);
    await fontInput.fill("http://example.com/font.css");
    await page.getByRole("button", { name: "Back", exact: true }).focus();
    assert.equal(await fontInput.getAttribute("aria-invalid"), "true");
    assert.equal(await importFont.isDisabled(), true);
    await fontInput.fill("https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap");
    assert.equal(await importFont.isDisabled(), false);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await page.getByRole("option", { name: "Inter", exact: true }).waitFor();
    await page.keyboard.press("Escape");

    const colorTrigger = page.getByRole("button", { name: "Pick accent color", exact: true });
    const triggerRect = await colorTrigger.boundingBox();
    assert.equal(triggerRect.width, 24);
    assert.equal(triggerRect.height, 24);
    await colorTrigger.click();
    const picker = page.getByRole("dialog", { name: "Accent color", exact: true });
    await picker.waitFor();
    await page.waitForFunction(
      (node) => !node.hasAttribute("data-starting-style") && getComputedStyle(node).opacity === "1",
      await picker.elementHandle(),
    );
    assert.equal((await picker.boundingBox()).width, 248);
    const area = await picker.locator("[data-slot=color-area]").boundingBox();
    assert.equal(area.width, 232);
    assert.equal(area.height, 232);
    const swatches = picker.getByRole("listbox", { name: "Accent color swatches", exact: true });
    assert.equal(
      await swatches.count(),
      1,
      "The offscreen swatch page must be excluded from the accessibility tree.",
    );
    for (const swatch of [
      swatches.getByRole("option").first(),
      swatches.getByRole("option").last(),
    ]) {
      await swatch.focus();
      assert.deepEqual(
        await swatch.evaluate(clippedRing),
        [],
        `${mode} edge swatch focus ring is clipped`,
      );
    }
    await picker.getByRole("button", { name: "Next color swatches", exact: true }).click();
    assert.equal(
      await picker.getByRole("button", { name: "Next color swatches", exact: true }).isDisabled(),
      true,
    );
    await picker.getByRole("button", { name: "Previous color swatches", exact: true }).click();
    await picker.getByRole("combobox", { name: "Color format", exact: true }).click();
    await page.getByRole("option", { name: "OKLCH", exact: true }).click();
    const colorInput = picker.getByRole("textbox", { name: "Accent color", exact: true });
    await colorInput.fill("oklch(0.7 0.15 140)");
    const accent = () =>
      page
        .getByTestId("theme-builder")
        .evaluate((node) => getComputedStyle(node).getPropertyValue("--accent").trim());
    const validAccent = await accent();
    assert.match(validAccent, /70\.00% 0\.1500 140\.00/);
    await colorInput.fill("not a color");
    assert.equal(await colorInput.getAttribute("aria-invalid"), "true");
    assert.equal(await accent(), validAccent);
    await colorInput.press("Tab");
    assert.equal(await colorInput.getAttribute("aria-invalid"), null);
    await page.keyboard.press("Escape");
    await picker.waitFor({ state: "hidden" });
    await page.waitForFunction(
      (node) => node === document.activeElement,
      await colorTrigger.elementHandle(),
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await checkThemeBuilderControls(
      page,
      process.env["LENSO_DOCS_TEST_URL"] ?? "http://127.0.0.1:3000",
    );
    console.log("Builder control geometry and edge focus rings passed in both modes.");
  } finally {
    await browser.close();
  }
}
