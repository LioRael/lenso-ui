/**
 * Production color-story proof. SPDX-License-Identifier: Apache-2.0
 * Existing component tests do not prove pinned Storybook compositions, contextual
 * picker propagation, source export completeness, native forms or both themes.
 * Run against a fresh production build; see COLOR-EVIDENCE.md.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(new URL("../../react/package.json", import.meta.url));
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ??
    resolve(dirname(require.resolve("playwright/package.json")), "index.mjs")
);
const pin = "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e";
const families = {
  "color-area": 6,
  "color-field": 13,
  "color-picker": 5,
  "color-slider": 9,
  "color-swatch-picker": 10,
  "color-swatch": 8,
};
const sourceHashes = {
  "color-area": "01fa1d874300796b5ca977f58888013acc4df06ec1c999cbe56edef3a4e29132",
  "color-field": "aa31aa2e950e7bead78898d2ad196db498d1ee8a1942813f3a126c1764398abf",
  "color-picker": "3daf2aab6ee1a160e55dcd2d7fc0d82d04e48b0605177b10d3cc9123b92ffbb0",
  "color-slider": "58418a096d11ef161fe23b3251728097090aaea6a3bd8b5fd34ccab677504cd2",
  "color-swatch-picker": "03dab83e09d632f54c5821dd850cdcce05046837a81531e58fb72e7b92697d4a",
  "color-swatch": "4cce881d2ecf2e663a1bdaa86a518a1f9f77d35734c626350d3e9bf26ba3a4ed",
};
const root = dirname(fileURLToPath(import.meta.url));
const output = process.env.COLOR_PROOF_OUTPUT;
const staticRoot = resolve(
  process.env.COLOR_STORYBOOK_STATIC ?? resolve(root, "../storybook-static"),
);
const hash = (text) => createHash("sha256").update(text).digest("hex");
const report = {
  pin,
  node: process.version,
  source: {},
  implementation: {},
  mounts: [],
  workflows: [],
  portalThemes: {},
  screenshots: {},
  errors: [],
  limitations: [],
};
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  const path = resolve(staticRoot, `.${new URL(req.url, "http://localhost").pathname}`);
  if (!path.startsWith(`${staticRoot}/`)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(
      (await stat(path)).isDirectory() ? resolve(path, "index.html") : path,
    );
    res
      .writeHead(200, { "content-type": mime[extname(path)] ?? "application/octet-stream" })
      .end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
let page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
const paragraph = page.locator("#storybook-root p");
page.on("pageerror", (error) => report.errors.push(error.message));
const kebab = (name) =>
  name
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
async function story(family, name, theme = "light") {
  await page.goto(
    `${base}/iframe.html?id=components-colors-${family.replaceAll("-", "")}--${kebab(name)}&viewMode=story&globals=theme:${theme}`,
  );
  await page.locator('#storybook-root [data-slot^="color-"]').first().waitFor({ state: "visible" });
  await page.waitForFunction((theme) => document.documentElement.dataset.theme === theme, theme);
  assert.equal(await page.locator("#error-message").innerText(), "");
}
async function keyChanges(control, key = "ArrowRight") {
  const before = await control.inputValue();
  await control.focus();
  await page.keyboard.press(key);
  assert.notEqual(await control.inputValue(), before);
}
async function pointer(control, x = 0.3, y = 0.6) {
  const box = await control.boundingBox();
  assert.ok(box && box.width > 0 && box.height > 0);
  await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
  await page.mouse.down();
  await page.mouse.up();
}
const nativeForm = () => page.locator("form").evaluate((form) => [...new FormData(form).entries()]);
async function capture(name) {
  if (!output) return;
  await mkdir(output, { recursive: true });
  const path = resolve(output, `${name}.png`);
  await page.screenshot({ path });
  report.screenshots[`${name}.png`] = hash(await readFile(path));
}
async function changeSpace(space) {
  await page.getByRole("combobox", { name: "Color space" }).click();
  await page.getByRole("option", { name: space, exact: true }).click();
}
try {
  const indexText = await readFile(resolve(staticRoot, "index.json"), "utf8");
  report.indexHash = hash(indexText);
  const index = JSON.parse(indexText);
  for (const [family, count] of Object.entries(families)) {
    const raw = process.env.COLOR_SOURCE_DIR
      ? await readFile(resolve(process.env.COLOR_SOURCE_DIR, `${family}.tsx`), "utf8")
      : await (
          await fetch(
            `https://raw.githubusercontent.com/heroui-inc/heroui/${pin}/packages/react/src/components/${family}/${family}.stories.tsx`,
          )
        ).text();
    const local = await readFile(resolve(root, `${family}.stories.tsx`), "utf8");
    assert.equal(hash(raw), sourceHashes[family], `${family}: complete immutable pinned source`);
    const names = [...raw.matchAll(/export const (\w+)/g)].map((match) => match[1]);
    assert.equal(names.length, count);
    assert.deepEqual(
      [...local.matchAll(/export const (\w+)/g)].map((match) => match[1]),
      names,
    );
    assert.doesNotMatch(local, /className=|tailwind|@iconify|react-aria-components/);
    report.source[family] = { sha256: hash(raw), names };
    report.implementation[`${family}.stories.tsx`] = hash(local);
    for (const theme of ["light", "dark"])
      for (const name of names) {
        const id = `components-colors-${family.replaceAll("-", "")}--${kebab(name)}`;
        assert.ok(index.entries[id], id);
        await story(family, name, theme);
        const geometry = await page.locator('[data-slot^="color-"]').first().boundingBox();
        assert.ok(geometry && geometry.width > 0 && geometry.height > 0, `${id}/${theme}`);
        report.mounts.push({ id, theme, geometry });
      }
  }
  assert.equal(report.mounts.length, 102);
  for (const file of [
    "color.stylex.ts",
    "color-fixtures.tsx",
    "color-proof.mjs",
    "color-build.fixture.mjs",
  ]) {
    report.implementation[file] = hash(await readFile(resolve(root, file)));
  }
  for (const theme of ["light", "dark"]) {
    await story("color-area", "Controlled", theme);
    const areaSliders = page.getByRole("slider");
    assert.equal(await areaSliders.count(), 1);
    const beforeArea = await paragraph.innerText();
    await areaSliders.first().focus();
    await page.keyboard.press("ArrowLeft");
    assert.notEqual(await paragraph.innerText(), beforeArea);
    const beforePointer = await paragraph.innerText();
    await pointer(page.locator('[data-slot="color-area"]'));
    assert.notEqual(await paragraph.innerText(), beforePointer);
    await story("color-area", "ColorChannels", theme);
    assert.equal(await page.getByRole("slider").count(), 3);
    await keyChanges(page.getByRole("slider").nth(1), "ArrowLeft");
    await story("color-area", "Disabled", theme);
    assert.equal(await page.getByRole("slider").first().isDisabled(), true);
    report.workflows.push(`${theme}: area pointer, keyboard, RGB axes and disabled`);

    await story("color-slider", "AlphaChannel", theme);
    const alpha = page.getByRole("slider");
    assert.equal(await alpha.inputValue(), "0.5");
    await keyChanges(alpha);
    assert.match(await page.locator("output").innerText(), /51/);
    await pointer(page.locator('[data-slot="color-slider-track"]'), 0.25, 0.5);
    assert.ok(Number(await alpha.inputValue()) < 0.5);
    await story("color-slider", "Vertical", theme);
    assert.equal(await page.getByRole("slider").count(), 3);
    for (const track of await page.locator('[data-slot="color-slider-track"]').all()) {
      const box = await track.boundingBox();
      assert.ok(box && box.height > 100 && box.width < 40);
    }
    await keyChanges(page.getByRole("slider").first(), "ArrowUp");
    await story("color-slider", "Controlled", theme);
    const beforeSlider = await paragraph.innerText();
    await keyChanges(page.getByRole("slider").first());
    assert.notEqual(await paragraph.innerText(), beforeSlider);
    await story("color-slider", "RGBChannels", theme);
    await keyChanges(page.getByRole("slider", { name: "Green", exact: true }));
    await story("color-slider", "Disabled", theme);
    assert.equal(await page.getByRole("slider").isDisabled(), true);
    report.workflows.push(
      `${theme}: slider alpha, pointer, keyboard, vertical geometry, controlled HSL, RGB and disabled`,
    );

    await story("color-field", "Controlled", theme);
    await page.getByRole("button", { name: "Set Red", exact: true }).click();
    assert.equal((await page.getByRole("textbox").inputValue()).toLowerCase(), "#ef4444");
    await page.getByRole("button", { name: "Set Green", exact: true }).click();
    assert.match(await page.locator("#storybook-root").innerText(), /#10b981/i);
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    assert.equal(await page.getByRole("textbox").inputValue(), "");
    await page.getByRole("textbox").fill("#3B82F6");
    await page.getByRole("textbox").press("Tab");
    assert.match(await page.locator("#storybook-root").innerText(), /Current value: #3b82f6/i);
    await story("color-field", "WithDescription", theme);
    const descriptionId = await page.getByRole("textbox").first().getAttribute("aria-describedby");
    assert.ok(descriptionId);
    assert.match(
      await page.locator(`[id="${descriptionId}"]`).innerText(),
      /brand's primary color/,
    );
    await story("color-field", "ChannelEditing", theme);
    await page.getByRole("textbox", { name: "Hue", exact: true }).fill("120");
    await page.getByRole("textbox", { name: "Hue", exact: true }).press("Tab");
    assert.match(await page.locator("#storybook-root").innerText(), /Current: #007f00/i);
    await story("color-field", "RGBChannels", theme);
    await page.getByRole("textbox", { name: "Red", exact: true }).fill("255");
    await page.getByRole("textbox", { name: "Red", exact: true }).press("Tab");
    assert.match(await page.locator("#storybook-root").innerText(), /Current: #ff82f6/i);
    await story("color-field", "Required", theme);
    assert.equal(
      await page
        .getByRole("textbox")
        .first()
        .evaluate((input) => input.required && input.validity.valueMissing),
      true,
    );
    assert.equal(
      await page
        .getByRole("textbox")
        .first()
        .evaluate((input) => input.reportValidity()),
      false,
    );
    assert.equal(await page.getByRole("textbox").first().getAttribute("aria-invalid"), "true");
    await story("color-field", "Invalid", theme);
    assert.equal(await page.getByRole("textbox").first().getAttribute("aria-invalid"), "true");
    assert.equal(
      await page.getByText("Please enter a valid hex color", { exact: true }).isVisible(),
      true,
    );
    await story("color-field", "WithColorPresets", theme);
    await page.getByRole("button", { name: "Set #EF4444", exact: true }).focus();
    await page.keyboard.press("Enter");
    assert.equal((await page.getByRole("textbox").inputValue()).toLowerCase(), "#ef4444");
    await story("color-field", "FormExample", theme);
    assert.equal(await page.getByRole("button", { name: "Save Color" }).isDisabled(), true);
    const field = page.getByRole("textbox", { name: "Brand Color", exact: true });
    await field.fill("#0485F7");
    await field.press("Tab");
    assert.deepEqual(await nativeForm(), [["brand-color", "#0485F7"]]);
    await page.getByRole("button", { name: "Save Color" }).click();
    assert.equal(
      await page.getByRole("button", { name: "Saving..." }).getAttribute("aria-busy"),
      "true",
    );
    await page.getByRole("button", { name: "Save Color" }).waitFor();
    assert.equal(await field.inputValue(), "");
    assert.equal(await page.getByRole("button", { name: "Save Color" }).isDisabled(), true);
    report.workflows.push(
      `${theme}: field controlled, descriptions, HSL/RGB channels, native required validation, invalid, keyboard presets, native FormData and pending/reset`,
    );

    await story("color-swatch-picker", "Controlled", theme);
    const radios = page.getByRole("option");
    const beforeSwatch = await paragraph.innerText();
    await radios.nth(1).click();
    assert.notEqual(await paragraph.innerText(), beforeSwatch);
    await radios.nth(1).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    assert.match(await paragraph.innerText(), /#8b5cf6/i);
    await story("color-swatch-picker", "Disabled", theme);
    assert.ok((await page.getByRole("option").all()).length === 7);
    assert.equal(await page.getByRole("option").first().getAttribute("aria-disabled"), "true");
    await story("color-swatch-picker", "WithCustomIndicator", theme);
    await page.getByRole("option").nth(2).click();
    assert.equal(
      await page.locator('[data-slot="color-swatch-picker-indicator"] svg').nth(2).isVisible(),
      true,
    );
    await story("color-swatch", "Transparency", theme);
    assert.match(
      await page
        .locator('[data-slot="color-swatch"]')
        .nth(2)
        .evaluate((el) => getComputedStyle(el).backgroundImage),
      /0.5/,
    );
    await story("color-swatch", "StyleRenderProps", theme);
    const shadows = await page
      .locator('[data-slot="color-swatch"]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).boxShadow));
    assert.ok(shadows.length === 15 && shadows.every((value) => value !== "none"));
    assert.ok(shadows.slice(0, 5).every((value) => /0px 0px 0px 3px/.test(value)));
    assert.ok(shadows.slice(5, 10).every((value) => /0px 4px 14px 0px/.test(value)));
    assert.ok(shadows.slice(10).every((value) => /0px 0px 0px 4px inset/.test(value)));
    await capture(`color-swatch-custom-${theme}`);
    report.workflows.push(
      `${theme}: swatch picker pointer/keyboard/controlled/disabled/custom indicator, alpha checkerboard and custom style callbacks`,
    );

    for (const name of ["Default", "Controlled", "WithSwatches", "WidthFields", "WithSliders"]) {
      await story("color-picker", name, theme);
      const trigger = page.locator('[data-slot="color-picker-trigger"]');
      await trigger.focus();
      await page.keyboard.press("Enter");
      await page.getByRole("dialog").waitFor({ state: "visible" });
      const popoverTheme = await page
        .locator('[data-slot="color-picker-popover"]')
        .evaluate((el) => getComputedStyle(el).getPropertyValue("--background"));
      assert.ok(popoverTheme.trim());
      report.portalThemes[theme] = popoverTheme.trim();
      if (name === "Controlled") {
        const before = await paragraph.innerText();
        await page.getByRole("option").first().click();
        assert.match(await paragraph.innerText(), /#ef4444/i);
        assert.notEqual(await paragraph.innerText(), before);
        await page.getByRole("textbox", { name: "Color field" }).fill("#10B981");
        await page.getByRole("textbox", { name: "Color field" }).press("Tab");
        assert.match(await paragraph.innerText(), /#10b981/i);
        await page.getByRole("button", { name: "Shuffle color" }).click();
        assert.doesNotMatch(await paragraph.innerText(), /#10b981/i);
        await capture(`color-picker-controlled-${theme}`);
      }
      if (name === "WidthFields" || name === "WithSliders") {
        for (const space of ["rgb", "hsb", "hsl"]) {
          await changeSpace(space);
          if (name === "WidthFields") assert.equal(await page.getByRole("textbox").count(), 3);
          else {
            assert.equal(await page.getByRole("slider").count(), 4);
            const control = page.getByRole("slider", {
              name: space === "rgb" ? "green" : "hue",
              exact: true,
            });
            await keyChanges(control);
            const alphaControl = page.getByRole("slider", { name: "alpha", exact: true });
            await alphaControl.focus();
            await page.keyboard.press("ArrowLeft");
            assert.ok(Number(await alphaControl.inputValue()) < 1);
          }
        }
      } else {
        await keyChanges(page.getByRole("slider").last());
        await pointer(page.locator('[data-slot="color-area"]'));
      }
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      assert.equal(await trigger.evaluate((el) => el === document.activeElement), true);
    }
    report.workflows.push(
      `${theme}: all five pickers keyboard opening/escape/focus return, portalled theme, shared models, shuffle and native select HSL/HSB/RGB/alpha`,
    );
  }
  assert.notEqual(report.portalThemes.light, report.portalThemes.dark);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const theme of ["light", "dark"]) {
    await story("color-picker", "WidthFields", theme);
    await page.locator('[data-slot="color-picker-trigger"]').click();
    await page.getByRole("dialog").waitFor();
    const box = await page.locator('[data-slot="color-picker-popover"]').boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= 390);
    const motion = await page.locator('[data-slot="color-picker-popover"]').evaluate((el) => ({
      transition: getComputedStyle(el).transitionDuration,
      animation: getComputedStyle(el).animationDuration,
    }));
    assert.ok(motion.transition.split(", ").every((duration) => parseFloat(duration) === 0));
    assert.ok(motion.animation.split(", ").every((duration) => parseFloat(duration) === 0));
    await changeSpace("rgb");
    assert.equal(await page.getByRole("textbox").count(), 3);
    await capture(`color-picker-mobile-${theme}`);
    report.workflows.push(
      `${theme}: 390px reduced-motion picker opening, containment and RGB selection`,
    );
  }
  await page.close();
  page = await browser.newPage({ viewport: { width: 1000, height: 900 }, locale: "ar-AE" });
  page.on("pageerror", (error) => report.errors.push(error.message));
  await page.addInitScript(() => {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        document.documentElement.dir = "rtl";
      },
      { once: true },
    );
  });
  await story("color-slider", "AlphaChannel");
  const rtl = page.getByRole("slider");
  await rtl.focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal(await rtl.inputValue(), "0.51");
  assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
  report.workflows.push("Arabic browser locale + RTL: alpha slider reverses horizontal ArrowLeft");
  report.limitations.push(
    "No upstream screenshot/pixel parity or full family mobile/RTL audit. No locale-specific export exists in the pinned six files; Arabic default-browser locale is supplemental coverage.",
  );
  assert.deepEqual(report.errors, []);
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.failure = error.stack;
  throw error;
} finally {
  if (output) {
    await mkdir(output, { recursive: true });
    await writeFile(resolve(output, "color-proof.json"), `${JSON.stringify(report, null, 2)}\n`);
    if (report.status === "failed")
      await writeFile(resolve(output, "color-failure.html"), await page.content());
  }
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  await new Promise((done) => server.close(done));
}
