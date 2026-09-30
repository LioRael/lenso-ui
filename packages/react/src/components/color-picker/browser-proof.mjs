/**
 * HeroUI v3.2.6 color-demo browser proof. Apache-2.0.
 * Run against a compiled source-demo harness whose ?demo=family/basename
 * selects an exact registered example. COLOR_DEMO_URL supplies its origin.
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { PNG } from "pngjs";

function pixel(image, x, y) {
  const offset = (Math.floor(y) * image.width + Math.floor(x)) * 4;
  return [...image.data.subarray(offset, offset + 3)];
}
function distance(a, b) {
  return a.reduce((total, value, index) => total + Math.abs(value - b[index]), 0);
}
async function image(locator) {
  return PNG.sync.read(await locator.screenshot({ animations: "disabled" }));
}
async function choose(page, label, value) {
  await page.getByRole("combobox", { name: label }).click();
  await page.getByRole("option", { name: new RegExp(`^${value}$`, "i") }).click();
  await page.getByRole("listbox").waitFor({ state: "hidden" });
}

// The earlier basic proofs did not exercise dynamic channels, raw invalid edits,
// controlled cross-component state, actual gradient paint or vertical track size.
export async function proveColorDemos(page, openDemo) {
  await openDemo("color-area/controlled");
  const initialArea = await page.locator("p").textContent();
  const areaSliders = page.getByRole("slider");
  await areaSliders.first().focus();
  await page.keyboard.press("ArrowRight");
  assert.notEqual(await page.locator("p").textContent(), initialArea);
  const area = page.locator('[data-slot="color-area"]');
  const areaBox = await area.boundingBox();
  assert.ok(areaBox.width > 200 && Math.abs(areaBox.width - areaBox.height) < 1);
  await page.mouse.click(areaBox.x + areaBox.width * 0.2, areaBox.y + areaBox.height * 0.7);
  assert.notEqual(await page.locator("p").textContent(), initialArea);

  await openDemo("color-area/disabled");
  const disabledThumb = page.locator('[data-slot="color-area-thumb"]');
  const disabledPosition = await disabledThumb.getAttribute("style");
  const disabledAreaBox = await page.locator('[data-slot="color-area"]').boundingBox();
  await page.mouse.click(disabledAreaBox.x + 40, disabledAreaBox.y + 40);
  assert.equal(await disabledThumb.getAttribute("style"), disabledPosition);
  for (const input of await page.getByRole("slider").all())
    assert.equal(await input.isDisabled(), true);

  await openDemo("color-area/space-and-channels");
  await choose(page, "Color Space", "RGB");
  await choose(page, "X Axis", "Red");
  await page.getByRole("combobox", { name: "Y Axis" }).click();
  await page.getByRole("listbox").waitFor();
  assert.equal(await page.getByRole("option", { name: /^red$/i }).count(), 0);
  await page.keyboard.press("Escape");
  await page.getByRole("listbox").waitFor({ state: "hidden" });
  assert.match(await page.locator("code").textContent(), /^rgb/);
  await choose(page, "Color Space", "HSL");
  assert.match(await page.locator("code").textContent(), /^hsl/);
  await choose(page, "Color Space", "HSB");
  assert.match(await page.locator("code").textContent(), /^hsb/);

  await openDemo("color-slider/rgb-channels");
  const rgb = await page.locator("code").textContent();
  await page.getByRole("slider", { name: /^green$/i }).focus();
  await page.keyboard.press("ArrowRight");
  assert.notEqual(await page.locator("code").textContent(), rgb);
  await openDemo("color-slider/alpha-channel");
  await page.getByRole("slider", { name: "Alpha" }).focus();
  await page.keyboard.press("End");
  assert.equal(await page.locator("output").textContent(), "100%");
  await page.keyboard.press("Home");
  assert.equal(await page.locator("output").textContent(), "0%");
  const alphaPaint = await image(page.locator('[data-slot="color-slider-track"]'));
  const alphaStart = pixel(alphaPaint, 8, 10);
  const alphaEnd = pixel(alphaPaint, alphaPaint.width - 8, 10);
  assert.ok(alphaStart[1] > 190 && alphaStart[2] > 190, "transparent end paints checkerboard");
  assert.ok(alphaEnd[0] > 240 && alphaEnd[1] < 20, "opaque end paints red");

  await openDemo("color-slider/vertical");
  for (const track of await page.locator('[data-slot="color-slider-track"]').all()) {
    const box = await track.boundingBox();
    assert.equal(box.width, 20);
    assert.equal(box.height, 172);
  }
  const verticalHue = page.getByRole("slider", { name: "hue" });
  await verticalHue.focus();
  await page.keyboard.press("ArrowUp");
  assert.equal(await verticalHue.inputValue(), "1");
  const huePaint = await image(page.locator('[data-slot="color-slider-track"]').first());
  assert.ok(distance(pixel(huePaint, 10, 30), pixel(huePaint, 10, 100)) > 200);

  await openDemo("color-slider/disabled");
  assert.equal(await page.getByRole("slider", { name: "Hue" }).isDisabled(), true);
  const disabledOutput = await page.locator("output").textContent();
  const disabledTrackBox = await page.locator('[data-slot="color-slider-track"]').boundingBox();
  await page.mouse.click(disabledTrackBox.x + 30, disabledTrackBox.y + 10);
  assert.equal(await page.locator("output").textContent(), disabledOutput);
  await openDemo("color-slider/custom-styles");
  const customTrackBox = await page.locator('[data-slot="color-slider-track"]').boundingBox();
  assert.equal(customTrackBox.height, 16);
  const customThumbBox = await page.locator('[data-slot="color-slider-thumb"]').boundingBox();
  assert.equal(customThumbBox.width, 16);
  assert.equal(customThumbBox.height, 16);

  await openDemo("color-field/controlled");
  await page.getByRole("button", { name: "Set Red" }).click();
  assert.equal(await page.getByRole("textbox", { name: "Color" }).inputValue(), "#EF4444");
  await page.getByRole("button", { name: "Clear" }).click();
  assert.equal(await page.getByRole("textbox", { name: "Color" }).inputValue(), "");
  await page.getByRole("textbox", { name: "Color" }).fill("#10B981");
  await page.keyboard.press("Tab");
  assert.match(await page.locator('[data-slot="description"]').textContent(), /#10B981/);
  await openDemo("color-field/channel-editing");
  const channelValue = await page.locator("span").last().textContent();
  await page.getByLabel(/^hue$/i).fill("120");
  await page.keyboard.press("Tab");
  assert.notEqual(await page.locator("span").last().textContent(), channelValue);
  await openDemo("color-field/invalid");
  assert.equal(
    await page.getByRole("textbox", { name: "Background Color" }).inputValue(),
    "not-a-color",
  );
  assert.equal(
    await page.getByRole("textbox", { name: "Background Color" }).getAttribute("aria-invalid"),
    "true",
  );
  await openDemo("color-field/form-example");
  assert.equal(await page.getByRole("button", { name: "Save Color" }).isDisabled(), true);
  await page.getByRole("textbox", { name: "Brand Color" }).fill("#0485F7");
  await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "Save Color" }).click();
  await page.getByRole("button", { name: "Saving..." }).waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Saving..." }).getAttribute("aria-busy"),
    "true",
  );
  await page.getByRole("button", { name: "Save Color" }).waitFor();
  assert.equal(await page.getByRole("textbox", { name: "Brand Color" }).inputValue(), "");

  await openDemo("color-field/disabled");
  for (const field of await page.getByRole("textbox").all())
    assert.equal(await field.isDisabled(), true);

  await openDemo("color-picker/controlled");
  const trigger = page.getByRole("button", { name: "Pick a color" });
  await trigger.click();
  const hex = page.getByRole("textbox", { name: "Color field" });
  await hex.fill("#10B981");
  await page.keyboard.press("Tab");
  assert.match(await page.locator("p").textContent(), /#10B981/);
  await page.getByRole("button", { name: "Shuffle color" }).click();
  assert.notEqual(await hex.inputValue(), "#10B981");
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
  await openDemo("color-picker/with-fields");
  await page.getByRole("button", { name: "Pick a color" }).click();
  await choose(page, "Color space", "RGB");
  assert.equal(await page.getByLabel("red", { exact: true }).count(), 1);
  await page.getByLabel("red", { exact: true }).fill("255");
  await page.keyboard.press("Tab");
  assert.equal(await page.getByLabel("red", { exact: true }).inputValue(), "255");
  await openDemo("color-picker/with-sliders");
  await page.getByRole("button", { name: "Pick a color" }).click();
  await choose(page, "Color space", "HSB");
  assert.equal(await page.getByRole("slider", { name: "brightness" }).count(), 1);
  await choose(page, "Color space", "RGB");
  assert.equal(await page.getByRole("slider", { name: "red" }).count(), 1);
  assert.equal(await page.getByRole("slider", { name: "alpha" }).count(), 1);

  await openDemo("color-swatch-picker/controlled");
  const options = page.getByRole("option");
  await options.first().focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  assert.match(await page.locator("p").textContent(), /#D946EF/);
  await openDemo("color-swatch-picker/render-function");
  await page.getByRole("option").nth(2).click();
  assert.equal(await page.getByRole("option").nth(2).getAttribute("aria-selected"), "true");
  await openDemo("color-swatch-picker/disabled");
  for (const option of await page.getByRole("option").all())
    assert.equal(await option.getAttribute("aria-disabled"), "true");
  await page.getByRole("listbox").focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("Space");
  assert.equal(await page.getByRole("option", { selected: true }).count(), 0);
  await openDemo("color-field/render-function");
  await page.getByRole("textbox", { name: "Color" }).fill("#EF4444");
  await page.keyboard.press("Tab");
  assert.equal(await page.getByRole("textbox", { name: "Color" }).inputValue(), "#EF4444");
  await openDemo("color-slider/render-function");
  await page.getByRole("slider", { name: "Hue" }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator("output").textContent(), "1°");
  await openDemo("color-area/render-function");
  await page.getByRole("slider").first().focus();
  const firstValue = await page.getByRole("slider").first().inputValue();
  await page.keyboard.press("ArrowRight");
  assert.notEqual(await page.getByRole("slider").first().inputValue(), firstValue);

  await openDemo("color-swatch/custom-styles");
  const gradient = await image(page.getByRole("img").nth(5));
  assert.equal(gradient.width, 40);
  assert.equal(gradient.height, 40);
  assert.ok(
    distance(pixel(gradient, 10, 10), pixel(gradient, 30, 30)) > 150,
    "135-degree source gradient really paints",
  );
  await openDemo("color-swatch/transparency");
  const opaque = await image(page.getByRole("img", { name: /100% opacity/ }));
  const transparent = await image(page.getByRole("img", { name: /0% opacity/ }).last());
  assert.ok(distance(pixel(opaque, 16, 16), [4, 133, 247]) < 8);
  assert.ok(pixel(transparent, 16, 16).every((channel) => channel > 230));
}

if (process.env["COLOR_DEMO_URL"]) {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const theme of ["light", "dark"]) {
      for (const reducedMotion of ["no-preference", "reduce"]) {
        const context = await browser.newContext({
          colorScheme: theme,
          reducedMotion,
          viewport: { width: 1000, height: 900 },
        });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await proveColorDemos(page, async (demo) => {
          const url = new URL(process.env["COLOR_DEMO_URL"]);
          url.searchParams.set("demo", demo);
          url.searchParams.set("theme", theme);
          await page.goto(url.href);
          await page.locator("#root [data-slot]").first().waitFor();
        });
        assert.deepEqual(errors, []);
        console.log(`Color workflow, geometry and paint proof passed: ${theme}, ${reducedMotion}`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
