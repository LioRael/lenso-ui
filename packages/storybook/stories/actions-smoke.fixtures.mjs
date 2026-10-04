// Scoped proof for the 42 pinned HeroUI action-story adaptations.
// No shared inventory or smoke-runner ownership is implied.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [directory, playwrightModule] = process.argv.slice(2);
assert(
  directory && playwrightModule,
  "Usage: node actions-smoke.fixtures.mjs <storybook-static> <playwright/index.mjs>",
);
const { chromium } = await import(pathToFileURL(resolve(playwrightModule)).href);
const root = resolve(directory);
const mime = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".html": "text/html",
  ".svg": "image/svg+xml",
};
const server = createServer(async (request, response) => {
  try {
    const path = resolve(root, `.${new URL(request.url, "http://localhost").pathname}`);
    assert(path.startsWith(`${root}/`));
    response.setHeader("Content-Type", mime[extname(path)] ?? "application/octet-stream");
    response.end(await readFile(path));
  } catch {
    response.statusCode = 404;
    response.end();
  }
});
await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const failures = [];
page.on("pageerror", (error) => failures.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") failures.push(message.text());
});
const inventory = {
  Button: [
    "Default",
    "WithLinkButton",
    "Sizes",
    "FullWidth",
    "WithIcon",
    "WithIconOnly",
    "WithSpinner",
    "WithLoadingState",
    "WithSocialButton",
  ],
  ButtonGroup: [
    "Default",
    "Sizes",
    "FullWidth",
    "Variants",
    "Disabled",
    "WithIcons",
    "WithoutSeparator",
    "Examples",
  ],
  CloseButton: ["Default", "WithCustomIcon", "Interactive"],
  ToggleButton: ["Default", "Variants", "Sizes", "IconOnly", "Controlled", "Disabled", "RealWorld"],
  ToggleButtonGroup: [
    "Default",
    "Sizes",
    "Orientation",
    "AttachedVsDetached",
    "FullWidth",
    "SelectionMode",
    "Controlled",
    "Disabled",
    "WithoutSeparator",
    "WithLabels",
    "Examples",
  ],
  Toolbar: ["Default", "Vertical", "WithButtonGroup", "Attached"],
};
let mounted = 0;
async function visit(family, name, theme, args = "") {
  const layout = family === "Toolbar" ? "layout" : "buttons";
  const kebab = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  const id = `components-${layout}-${family.toLowerCase()}--${kebab}`;
  await page.goto(
    `${base}/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}&args=${args}`,
    { waitUntil: "networkidle" },
  );
  await page.locator("#storybook-root button, #storybook-root a").first().waitFor();
  assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
  assert.equal(await page.locator(".sb-errordisplay").isVisible(), false, id);
  assert.deepEqual(failures, [], id);
  const boxes = await page
    .locator("#storybook-root button, #storybook-root a")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const { width, height } = element.getBoundingClientRect();
        return { width, height };
      }),
    );
  assert(
    boxes.every(({ width, height }) => width > 0 && height > 0),
    id,
  );
}
async function pressed(name, value, nth = 0) {
  assert.equal(
    await page.getByRole("button", { name, exact: true }).nth(nth).getAttribute("aria-pressed"),
    String(value),
  );
}
async function focused(name) {
  assert.equal(
    await page
      .getByRole("button", { name, exact: true })
      .evaluate((element) => element === document.activeElement),
    true,
    `Focus: ${name}`,
  );
}
async function joined(selector, vertical = false) {
  const boxes = await page.locator(selector).evaluateAll((elements) =>
    elements.map((element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }),
  );
  assert(boxes.length > 1);
  for (let i = 1; i < boxes.length; i++) {
    const previous = boxes[i - 1],
      current = boxes[i];
    assert(
      Math.abs(
        vertical
          ? previous.y + previous.height - current.y
          : previous.x + previous.width - current.x,
      ) < 1,
      JSON.stringify(boxes),
    );
  }
}
try {
  const index = await (await fetch(`${base}/index.json`)).json();
  for (const [family, names] of Object.entries(inventory)) {
    const entries = Object.values(index.entries).filter(
      (entry) => entry.type === "story" && entry.title.split("/").at(-1) === family,
    );
    const expected = names
      .map((name) => name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase())
      .sort();
    assert.deepEqual(entries.map((entry) => entry.id.split("--")[1]).sort(), expected, family);
    for (const name of names) {
      for (const theme of ["light", "dark"]) {
        await visit(family, name, theme);
        mounted++;
        console.log("MOUNT", family, name, theme);
      }
    }
  }
  for (const theme of ["light", "dark"]) {
    await visit("Button", "Default", theme, "disabled:true;size:lg");
    assert.equal(await page.locator("button:disabled").count(), 7);
    await visit("Button", "WithLinkButton", theme);
    const link = page.getByRole("link", { name: "Google" });
    assert.equal(await link.getAttribute("href"), "https://www.google.com");
    assert.equal(await link.getAttribute("target"), "_blank");
    assert.equal(await page.locator("#storybook-root button").count(), 0);
    await visit("Button", "WithSpinner", theme, "disabled:true;variant:danger");
    const pending = page.getByRole("button");
    assert.equal(
      await pending.isDisabled(),
      false,
      "Source pending scene ignores disabled control",
    );
    await pending.focus();
    assert.equal(await pending.evaluate((element) => element === document.activeElement), true);
    assert.equal(await pending.getAttribute("aria-busy"), "true");
    await pending.press("Enter");
    assert.equal(await pending.getAttribute("aria-busy"), "true");
    await visit("Button", "WithLoadingState", theme);
    await page.clock.install();
    const upload = page.getByRole("button", { name: "Upload File" });
    await upload.click();
    const loading = page.getByRole("button", { name: "Uploading..." });
    assert.equal(await loading.isDisabled(), false);
    await loading.focus();
    await loading.press("Enter");
    await loading.press("Space");
    assert.equal(await loading.getAttribute("aria-busy"), "true");
    await page.clock.fastForward(4500);
    await page.getByRole("button", { name: "Upload File" }).waitFor();
    await page.clock.resume();

    await visit("ButtonGroup", "Disabled", theme);
    assert.equal(await page.locator("button:disabled").count(), 5);
    assert(await page.getByRole("button", { name: "Third (enabled)" }).isEnabled());
    await visit("ButtonGroup", "Default", theme);
    await joined('[data-slot="button-group"] button');
    await visit("ButtonGroup", "Examples", theme);
    await page.getByRole("button", { name: "More options", exact: true }).first().click();
    const menu = page.getByRole("menu");
    await menu.waitFor();
    assert((await menu.boundingBox()).width <= 290);
    await page.evaluate(() => {
      window.actionsAlerts = [];
      window.alert = (message) => window.actionsAlerts.push(message);
    });
    await page.getByRole("menuitem", { name: /Squash and merge/ }).click();
    assert.deepEqual(await page.evaluate(() => window.actionsAlerts), [
      "Selected: squash-and-merge",
    ]);

    await visit("CloseButton", "Interactive", theme);
    await page.getByRole("button").press("Enter");
    assert(await page.getByRole("button", { name: "Close (clicked 1 times)" }).isVisible());
    await visit("CloseButton", "Interactive", theme, "disabled:true");
    assert(await page.getByRole("button").isDisabled());
    await visit("ToggleButton", "Controlled", theme);
    await page.getByRole("button", { name: "Like", exact: true }).press("Space");
    await pressed("Liked", true);
    assert(await page.getByText("Status: Selected").isVisible());
    await visit("ToggleButton", "Default", theme, "disabled:true;size:sm");
    assert.equal(await page.locator("button:disabled").count(), 2);
    await visit("ToggleButton", "RealWorld", theme);
    await pressed("Like", false);
    await pressed("Save", false);
    const pin = page.locator('[data-slot="toggle-button"]').last();
    assert.equal(await pin.getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: "Like", exact: true }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await pin.click();
    await pressed("Like", true);
    await pressed("Save", true);
    assert.equal(await pin.getAttribute("aria-pressed"), "false");

    await visit("ToggleButtonGroup", "SelectionMode", theme);
    await pressed("Center", true);
    await page.getByRole("button", { name: "Right", exact: true }).click();
    await pressed("Center", false);
    await pressed("Right", true);
    await pressed("Bold", true);
    await pressed("Underline", true);
    await page.getByRole("button", { name: "Italic", exact: true }).click();
    await pressed("Bold", true);
    await pressed("Italic", true);
    await pressed("Underline", true);
    await visit("ToggleButtonGroup", "Controlled", theme);
    await page.getByRole("button", { name: "Italic", exact: true }).press("Space");
    assert(await page.getByText("Selected: bold, italic").isVisible());
    await visit("ToggleButtonGroup", "Disabled", theme);
    assert.equal(await page.locator("button:disabled").count(), 4);
    await visit("ToggleButtonGroup", "Orientation", theme);
    const groups = page.locator('[data-slot="toggle-button-group"]');
    await joined(
      '#storybook-root > div > div:nth-child(2) [data-slot="toggle-button-group"] button',
      true,
    );
    await groups.nth(1).getByRole("button", { name: "Bold" }).focus();
    await page.keyboard.press("ArrowDown");
    assert.equal(
      await groups
        .nth(1)
        .getByRole("button", { name: "Italic" })
        .evaluate((element) => element === document.activeElement),
      true,
    );
    await visit("ToggleButtonGroup", "Examples", theme);
    await page.getByRole("button", { name: "Align left", exact: true }).click();
    await pressed("Align left", true);
    await page.getByRole("button", { name: "Grid view", exact: true }).click();
    await pressed("Grid view", true);
    await page.getByRole("button", { name: "List view", exact: true }).click();
    await pressed("Grid view", false);
    await pressed("List view", true);

    await visit("Toolbar", "Default", theme);
    await page.getByRole("button", { name: "Bold" }).focus();
    for (const name of ["Italic", "Underline", "Copy", "Cut", "Bold"]) {
      await page.keyboard.press("ArrowRight");
      await focused(name);
    }
    await page.keyboard.press("Space");
    await pressed("Bold", true);
    await visit("Toolbar", "Vertical", theme);
    await page.getByRole("button", { name: "Bold" }).focus();
    await page.keyboard.press("ArrowDown");
    await focused("Italic");
    await page.keyboard.press("ArrowDown");
    await focused("Underline");
    await page.keyboard.press("ArrowDown");
    await focused("Undo");
    const groupPositions = await page
      .getByRole("toolbar")
      .locator('[data-slot="toggle-button-group"], [data-slot="button-group"]')
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().y));
    assert(groupPositions[1] > groupPositions[0], JSON.stringify(groupPositions));

    for (const family of ["Button", "ButtonGroup", "ToggleButtonGroup"]) {
      await visit(family, "FullWidth", theme);
      const widths = await page
        .locator("#storybook-root > div > [data-slot]")
        .evaluateAll((elements) =>
          elements.map((element) => element.getBoundingClientRect().width),
        );
      assert(
        widths.every((width) => Math.abs(width - 400) < 1),
        `${family}: ${widths}`,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await visit("Button", "Sizes", theme);
    const heights = await page
      .locator("#storybook-root > div > div:first-child button")
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
    assert.deepEqual(heights, [36, 40, 44]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await visit("Button", "WithSpinner", theme);
    assert.equal(
      await page
        .getByRole("button")
        .evaluate((element) => getComputedStyle(element).transitionDuration),
      "0s",
    );
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await visit("ButtonGroup", "Default", theme);
    await page.locator("html").evaluate((element) => element.setAttribute("dir", "rtl"));
    const x = await page
      .locator('[data-slot="button-group"] button')
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().x));
    assert(x[0] > x[1] && x[1] > x[2], JSON.stringify(x));
    await page.locator("html").evaluate((element) => element.removeAttribute("dir"));
  }
  assert.deepEqual(failures, []);
  console.log(
    `PASS ${mounted} iframe mounts / 42 exact exports; two-theme action, native-disabled, loading, selection, toolbar-keyboard, geometry, responsive, RTL and reduced-motion assertions.`,
  );
} finally {
  await browser.close();
  server.close();
}
