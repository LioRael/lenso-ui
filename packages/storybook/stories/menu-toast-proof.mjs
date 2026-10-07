// Production iframe behavior proof, limited to the exact pinned dropdown/toast exports.
// node menu-toast-proof.mjs <storybook-static> <absolute-playwright-module> [artifact-directory]
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";

const [directory, playwrightModule = "playwright", artifactsArgument] = process.argv.slice(2);
assert(directory, "Provide a production Storybook directory");
const artifacts = artifactsArgument && resolve(artifactsArgument);
if (artifacts) await mkdir(artifacts, { recursive: true });
const { chromium } = await import(
  playwrightModule.startsWith("/") ? pathToFileURL(playwrightModule).href : playwrightModule
);
const expected = {
  dropdown: [
    "Default",
    "WithSingleSelection",
    "SingleWithCustomIndicator",
    "WithMultipleSelection",
    "WithSectionLevelSelection",
    "WithKeyboardShortcuts",
    "WithIcons",
    "LongPressTrigger",
    "WithDescriptions",
    "WithSections",
    "WithDisabledItems",
    "WithSubmenus",
    "WithCustomSubmenuIndicator",
    "Controlled",
    "ControlledOpenState",
    "CustomTrigger",
  ],
  toast: [
    "Default",
    "Placements",
    "Expanded",
    "SimpleToast",
    "PromiseToast",
    "CustomIndicator",
    "LoadingState",
    "WithCallbacks",
    "CustomToast",
    "CustomQueue",
    "ToastInModal",
  ],
};
const sourceHashes = {
  dropdown: "15424e5b7383decf00dcc9f2bb6d4543593866c8a1bc4de5b56454e48cc4ec4c",
  toast: "29acf55a1cbcb7114fff53ff4d649ffc0bbf769e4bc4a6a92a5ec65b9218be6b",
};
const curl = promisify(execFile);
const iconSource = await readFile(
  new URL("./menu-toast-icons.fixtures.tsx", import.meta.url),
  "utf8",
);
const iconPaths = Object.fromEntries(
  [...iconSource.split("} as const;")[0].matchAll(/(?:"([\w-]+)"|(\w+)):\s*"([^"]+)"/g)].map(
    (match) => [match[1] ?? match[2], match[3]],
  ),
);
assert.equal(Object.keys(iconPaths).length, 14);
const iconHashes = Object.fromEntries(
  Object.entries(iconPaths).map(([name, path]) => [
    name,
    createHash("sha256").update(path).digest("hex"),
  ]),
);
if (process.env.MENU_TOAST_VERIFY_PIN === "1") {
  const { stdout } = await curl("curl", [
    "-fsSL",
    "--max-time",
    "30",
    `https://api.iconify.design/gravity-ui.json?icons=${Object.keys(iconPaths).join(",")}`,
  ]);
  const remote = JSON.parse(stdout);
  for (const [name, path] of Object.entries(iconPaths)) {
    assert.equal(
      remote.icons[name].body.match(/ d="([^"]+)"/)[1],
      path,
      `genuine gravity-ui:${name} SVG path bytes`,
    );
  }
}
for (const [family, names] of Object.entries(expected)) {
  const localFamily = family === "dropdown" ? "menu" : family;
  const source = await readFile(new URL(`./${localFamily}.stories.tsx`, import.meta.url), "utf8");
  assert.deepEqual(
    [...source.matchAll(/export const (\w+)/g)].map((match) => match[1]),
    names,
  );
  if (process.env.MENU_TOAST_VERIFY_PIN === "1") {
    const { stdout } = await curl(
      "curl",
      [
        "-fsSL",
        "--max-time",
        "30",
        `https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/${family}/${family}.stories.tsx`,
      ],
      { encoding: "buffer" },
    );
    assert.equal(createHash("sha256").update(stdout).digest("hex"), sourceHashes[family]);
    assert.deepEqual(
      [...stdout.toString().matchAll(/export const (\w+)/g)].map((match) => match[1]),
      names,
    );
  }
}
assert.equal(Object.values(expected).flat().length, 27);
const root = resolve(directory);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!file.startsWith(root + sep)) return response.writeHead(403).end();
  try {
    response.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1100, height: 900 },
  ignoreHTTPSErrors: true,
});
const errors = [];
const dialogs = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("dialog", async (dialog) => {
  dialogs.push(dialog.message());
  await dialog.dismiss();
});
// Original CDN bytes only; this bridges Chromium's local TLS/network limitations.
const assetBytes = new Map();
await page.route("https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/**", async (route) => {
  const url = route.request().url();
  if (!assetBytes.has(url))
    assetBytes.set(
      url,
      curl("curl", ["-fsSL", "--max-time", "30", url], {
        encoding: "buffer",
        maxBuffer: 8 * 1024 * 1024,
      }),
    );
  const { stdout } = await assetBytes.get(url);
  await route.fulfill({ status: 200, contentType: "image/jpeg", body: stdout });
});
const index = JSON.parse(await readFile(resolve(root, "index.json"), "utf8"));
const entries = Object.values(index.entries).filter(
  (entry) =>
    entry.type === "story" &&
    Object.keys(expected).some(
      (family) =>
        entry.importPath === `./stories/${family === "dropdown" ? "menu" : family}.stories.tsx`,
    ),
);
assert.equal(entries.length, 27);
const report = {
  sourceHashes,
  iconHashes,
  mounts: [],
  assertions: [],
  assetHashes: {},
  nativeAdaptations: [
    "Base UI limit marks older entries data-limited, matching the pinned source visual-only newest-first cap.",
    "Public Toast.Viewport alwaysExpanded owns permanent stack geometry without forcing hover/focus state.",
  ],
  nativeLimits: [
    "Native Toast.Viewport exposes F6 focus navigation, not the pinned source configurable Alt+T hotkey.",
  ],
};
async function mount(family, name, theme = "light", args = "") {
  const localFamily = family === "dropdown" ? "menu" : family;
  const entry = entries.find(
    (entry) =>
      entry.importPath === `./stories/${localFamily}.stories.tsx` && entry.exportName === name,
  );
  assert(entry, `${family}/${name}`);
  await page.goto(
    `${base}/iframe.html?id=${entry.id}&viewMode=story&globals=theme:${theme}${args ? `&args=${args}` : ""}`,
  );
  await page.waitForFunction(() => document.querySelector("#storybook-root")?.children.length > 0);
  assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
  assert.equal(await page.locator("#storybook-root").getAttribute("hidden"), null);
  assert.equal(
    await page
      .locator("#storybook-root")
      .evaluate((node) => node.getBoundingClientRect().height > 0),
    true,
  );
}
async function openMenu(name) {
  const trigger = page.locator('[data-slot="menu-trigger"]');
  if (name === "LongPressTrigger") {
    const box = await trigger.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(600);
    await page.mouse.up();
  } else await trigger.click();
  await page.getByRole("menu").first().waitFor();
}
const firstToast = {
  Default: "Default toast",
  Placements: "top start",
  Expanded: "Show 3 toasts",
  SimpleToast: "Default",
  PromiseToast: "Upload file",
  CustomIndicator: "Custom indicator",
  LoadingState: "Upload with loading",
  WithCallbacks: "Persistent toast",
  CustomToast: "Custom toast",
  CustomQueue: "Add notification (max 2)",
  ToastInModal: "Open modal",
};
async function enqueue(name) {
  await page.getByRole("button", { name: firstToast[name], exact: true }).click();
  if (name === "ToastInModal")
    await page.getByRole("button", { name: "Show toast", exact: true }).click();
  await page.locator('[data-slot="toast"]').first().waitFor();
}
function passed(message) {
  report.assertions.push(message);
  console.log(`PASS ${message}`);
}
try {
  for (const theme of ["light", "dark"])
    for (const [family, names] of Object.entries(expected))
      for (const name of names) {
        await mount(family, name, theme);
        if (family === "dropdown") await openMenu(name);
        else await enqueue(name);
        await page.waitForTimeout(400);
        const target = page
          .locator(family === "dropdown" ? '[data-slot="menu-popup"]' : '[data-slot="toast"]')
          .first();
        const geometry = await target.evaluate((node) => {
          const box = node.getBoundingClientRect();
          const css = getComputedStyle(node);
          return {
            width: box.width,
            height: box.height,
            color: css.color,
            background: css.backgroundColor,
          };
        });
        assert(
          geometry.width > 100 && geometry.height > 20,
          `${family}/${name} usable overlay geometry`,
        );
        if (family === "toast")
          assert(Math.abs(geometry.width - 460) < 1, "source default toast width460");
        if (
          name === "WithSingleSelection" ||
          name === "WithMultipleSelection" ||
          name === "SingleWithCustomIndicator" ||
          name === "WithSectionLevelSelection"
        )
          assert(geometry.width >= 256);
        if (name === "CustomTrigger")
          await page.waitForFunction(() =>
            [...document.querySelectorAll("img")].every(
              (image) => image.complete && image.naturalWidth > 0,
            ),
          );
        report.mounts.push({ family, name, theme, geometry });
        if (artifacts)
          await page.screenshot({ path: resolve(artifacts, `${family}-${name}-${theme}.png`) });
      }
  assert.equal(report.mounts.length, 54);
  passed(
    "54 actual production light/dark iframe mounts, every dropdown opened and every toast enqueued",
  );
  for (const theme of ["light", "dark"]) {
    await mount("dropdown", "Default", theme);
    const trigger = page.locator('[data-slot="menu-trigger"]');
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const firstItem = page.getByRole("menuitem", { name: "New file", exact: true });
    await firstItem.waitFor();
    // Base UI queues initial focus on the next animation frame, after visibility.
    await page.waitForFunction(
      (node) => document.activeElement === node,
      await firstItem.elementHandle(),
      { timeout: 1000 },
    );
    assert.equal(
      await page
        .getByRole("menuitem", { name: "New file", exact: true })
        .evaluate((node) => document.activeElement === node),
      true,
    );
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    assert.equal(dialogs.at(-1), "Selected: copy-link");
    await page.getByRole("menu").waitFor({ state: "hidden" });
    assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
    await trigger.press("Enter");
    await page.getByRole("menu").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("menu").waitFor({ state: "hidden" });
    assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
    await mount("dropdown", "WithDisabledItems", theme);
    await openMenu("WithDisabledItems");
    const disabled = page.getByRole("menuitem", { name: "Delete file", exact: false });
    assert.equal(await disabled.getAttribute("aria-disabled"), "true");
    const before = dialogs.length;
    await disabled.click({ force: true });
    assert.equal(dialogs.length, before);
    await page.getByRole("menu").waitFor();
    await page.getByRole("menuitem", { name: "New file", exact: false }).focus();
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    assert.equal(dialogs.length, before);
    await page.getByRole("menu").waitFor();
    await mount("dropdown", "WithSingleSelection", theme);
    await openMenu("WithSingleSelection");
    assert.equal(
      await page
        .getByRole("menuitemradio", { name: "Apple", exact: true })
        .getAttribute("aria-checked"),
      "true",
    );
    await page.getByRole("menuitemradio", { name: "Banana", exact: true }).click();
    if ((await page.getByRole("menu").count()) === 0) await openMenu("WithSingleSelection");
    assert.equal(
      await page
        .getByRole("menuitemradio", { name: "Banana", exact: true })
        .getAttribute("aria-checked"),
      "true",
    );
    assert.equal(
      await page
        .getByRole("menuitemradio", { name: "Apple", exact: true })
        .getAttribute("aria-checked"),
      "false",
    );
    await mount("dropdown", "Controlled", theme);
    await openMenu("Controlled");
    await page.getByRole("menuitemcheckbox", { name: "Italic", exact: true }).focus();
    await page.keyboard.press("Space");
    assert.equal(
      await page
        .getByRole("menuitemcheckbox", { name: "Italic", exact: true })
        .getAttribute("aria-checked"),
      "true",
    );
    assert.match(await page.locator("#storybook-root").textContent(), /Selected: bold, italic/);
    await mount("dropdown", "WithSectionLevelSelection", theme);
    await openMenu("WithSectionLevelSelection");
    await page.getByRole("menuitemcheckbox", { name: /^Underline/ }).click();
    await page.getByRole("menuitemradio", { name: /^Center/ }).click();
    assert.equal(
      await page.getByRole("menuitemcheckbox", { name: /^Bold/ }).getAttribute("aria-checked"),
      "true",
    );
    assert.equal(
      await page.getByRole("menuitemcheckbox", { name: /^Underline/ }).getAttribute("aria-checked"),
      "true",
    );
    assert.equal(
      await page.getByRole("menuitemradio", { name: /^Center/ }).getAttribute("aria-checked"),
      "true",
    );
    await mount("dropdown", "ControlledOpenState", theme);
    await openMenu("ControlledOpenState");
    assert.match(await page.locator("#storybook-root").textContent(), /Menu is: open/);
    await page.keyboard.press("Escape");
    assert.match(await page.locator("#storybook-root").textContent(), /Menu is: closed/);
    for (const name of ["WithSubmenus", "WithCustomSubmenuIndicator"]) {
      await mount("dropdown", name, theme);
      await openMenu(name);
      await page
        .getByRole("menuitem", {
          name: name === "WithSubmenus" ? "Other" : "More options",
          exact: true,
        })
        .focus();
      await page.keyboard.press("ArrowRight");
      await page.getByRole("menuitem", { name: "WhatsApp", exact: true }).waitFor();
      await page.waitForFunction(() => document.activeElement?.textContent === "WhatsApp");
      await page.getByRole("menuitem", { name: "Email", exact: true }).focus();
      await page.keyboard.press("ArrowRight");
      await page.getByRole("menuitem", { name: "Work email", exact: true }).waitFor();
      await page.waitForFunction(() => document.activeElement?.textContent === "Work email");
      await page.keyboard.press("ArrowLeft");
      await page.waitForFunction(() => document.activeElement?.textContent === "Email");
      assert.equal(
        await page
          .getByRole("menuitem", { name: "Email", exact: true })
          .evaluate((node) => node === document.activeElement),
        true,
      );
      await page.keyboard.press("ArrowLeft");
      await page.waitForFunction(
        (text) => document.activeElement?.textContent === text,
        name === "WithSubmenus" ? "Other" : "More options",
      );
      assert.equal(
        await page
          .getByRole("menuitem", {
            name: name === "WithSubmenus" ? "Other" : "More options",
            exact: true,
          })
          .evaluate((node) => node === document.activeElement),
        true,
      );
      await page.keyboard.press("Escape");
    }
  }
  passed(
    "both themes: native arrow/Enter/Escape focus return, disabled action blocking, controlled check/radio/section selection, two-depth submenu keyboard return",
  );
  await mount("dropdown", "LongPressTrigger");
  const longTrigger = page.locator('[data-slot="menu-trigger"]');
  await longTrigger.click();
  assert.equal(await page.getByRole("menu").count(), 0);
  await openMenu("LongPressTrigger");
  await page.keyboard.press("Escape");
  await longTrigger.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menu").waitFor();
  await page.keyboard.press("Escape");
  const box = await longTrigger.boundingBox();
  await page.mouse.move(box.x + 5, box.y + 5);
  await page.mouse.down();
  await page.mouse.move(box.x + 30, box.y + 5);
  await page.waitForTimeout(600);
  await page.mouse.up();
  assert.equal(await page.getByRole("menu").count(), 0);
  await page.mouse.move(box.x + 5, box.y + 5);
  await page.mouse.down();
  await longTrigger.dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse" });
  await page.waitForTimeout(600);
  await page.mouse.up();
  assert.equal(await page.getByRole("menu").count(), 0);
  await mount("dropdown", "LongPressTrigger", "dark", "disabled:!true");
  assert(
    await longTrigger.evaluate(
      (node) => node.hasAttribute("disabled") || node.getAttribute("aria-disabled") === "true",
    ),
    "native disabled semantics",
  );
  const disabledBox = await longTrigger.boundingBox();
  await page.mouse.move(disabledBox.x + 5, disabledBox.y + 5);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  assert.equal(await page.getByRole("menu").count(), 0);
  passed(
    "long press: short click blocked, actual 500ms hold opens, movement/pointercancel cancel, disabled hold blocked, native keyboard activation retained",
  );
  for (const theme of ["light", "dark"]) {
    await mount("toast", "Default", theme);
    for (const [button, action, variant] of [
      ["Default toast", "Dismiss", "default"],
      ["Accent toast", "Upgrade", "accent"],
      ["Success toast", "Billing", "success"],
      ["Warning toast", "Upgrade", "warning"],
      ["Danger toast", "Remove", "danger"],
    ]) {
      await page.getByRole("button", { name: button, exact: true }).click();
      await page.locator('[data-slot="toast"]').waitFor();
      assert.equal(await page.locator('[data-slot="toast"]').getAttribute("data-variant"), variant);
      await page.getByRole("button", { name: action, exact: true }).click();
      await page.locator('[data-slot="toast"]').waitFor({ state: "hidden" });
    }
    for (const placement of [
      "bottom",
      "bottom-start",
      "bottom-end",
      "top",
      "top-start",
      "top-end",
    ]) {
      await mount("toast", "Default", theme, `timeout:0;placement:${placement.replace("-", " ")}`);
      for (const name of ["Default toast", "Success toast", "Danger toast"])
        await page.getByRole("button", { name, exact: true }).click();
      await page.mouse.move(10, 450);
      await page.waitForTimeout(500);
      const hiddenChildren = await page
        .locator('[data-slot="toast"]:not([data-frontmost]) > :not([data-slot="toast-close"])')
        .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).opacity));
      assert(
        hiddenChildren.every((opacity) => opacity === "0"),
        "all collapsed rear content fades",
      );
      const front = page.locator('[data-slot="toast"][data-frontmost]');
      await front.hover();
      await page.waitForTimeout(500);
      const geometry = await page.locator('[data-slot="toast"]').evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return {
            y: box.y,
            height: box.height,
            expanded: node.hasAttribute("data-expanded"),
            inBounds: box.left >= 0 && box.right <= innerWidth,
          };
        }),
      );
      assert(geometry.every((item) => item.expanded && item.inBounds));
      const ordered = geometry.toSorted((a, b) => a.y - b.y);
      for (let index = 1; index < ordered.length; index++)
        assert(
          Math.abs(ordered[index].y - ordered[index - 1].y - ordered[index - 1].height - 12) < 1,
          `${placement}: hover-expanded cards have the source 12px gap`,
        );
      const close = front.locator('[data-slot="toast-close"]');
      assert.equal(await close.evaluate((node) => getComputedStyle(node).pointerEvents), "auto");
      assert.equal(
        await close.evaluate((node) => {
          const probe = document.createElement("span");
          probe.style.backgroundColor = "var(--overlay)";
          node.append(probe);
          const overlay = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return getComputedStyle(node).backgroundColor === overlay;
        }),
        true,
        "desktop close uses the overlay surface until the close itself is hovered",
      );
      const iconGeometry = await close.evaluate((node) => {
        const button = node.getBoundingClientRect();
        const icon = node.querySelector("svg").getBoundingClientRect();
        return {
          width: icon.width,
          height: icon.height,
          dx: icon.x + icon.width / 2 - button.x - button.width / 2,
          dy: icon.y + icon.height / 2 - button.y - button.height / 2,
        };
      });
      assert.equal(iconGeometry.width, 12);
      assert.equal(iconGeometry.height, 12);
      assert(
        Math.abs(iconGeometry.dx) < 1 && Math.abs(iconGeometry.dy) < 1,
        "close icon is centered",
      );
      // The hit-area bridge must keep expansion while crossing the visible gap.
      const frontBox = await front.boundingBox();
      await page.mouse.move(
        frontBox.x + frontBox.width / 2,
        placement.startsWith("top") ? frontBox.y + frontBox.height + 6 : frontBox.y - 6,
      );
      await page.waitForTimeout(100);
      assert.equal(await page.locator('[data-slot="toast"][data-expanded]').count(), 3);
      await front.hover();
      const closingRoot = await front.elementHandle();
      await close.click();
      assert.equal(
        await closingRoot.evaluate(
          (node) => getComputedStyle(node.querySelector('[data-slot="toast-close"]')).pointerEvents,
        ),
        "none",
        "an exiting close cannot remain interactive while hovered or focused",
      );
      await page.waitForTimeout(500);
      assert.equal(await page.locator('[data-slot="toast"]').count(), 2);
      await page.mouse.move(10, 450);
      await page.waitForTimeout(500);
      await page.keyboard.press("F6");
      assert.equal(await page.locator('[data-slot="toast"][data-expanded]').count(), 2);
    }
    passed(
      `${theme}: collapsed content, six hover placements, 12px gaps, close geometry, gap traversal and F6`,
    );
    await mount("toast", "PromiseToast", theme);
    await enqueue("PromiseToast");
    await page.getByText("Uploading file...", { exact: true }).waitFor();
    await page.getByText("File document.pdf uploaded (1024KB)", { exact: true }).waitFor();
    assert.equal(await page.locator('[data-slot="toast"]').getAttribute("data-variant"), "success");
    await page.getByRole("button", { name: "Create event (error)", exact: true }).click();
    await page.getByText("Creating event...", { exact: true }).waitFor();
    await page.getByText("Network error. Please try again.", { exact: true }).waitFor();
    assert.equal(
      await page.locator('[data-slot="toast"][data-frontmost]').getAttribute("data-variant"),
      "danger",
    );
    await mount("toast", "LoadingState", theme);
    await enqueue("LoadingState");
    await page.locator('[data-slot="spinner"]').waitFor();
    await page.getByText("File uploaded", { exact: true }).waitFor();
    assert.equal(await page.locator('[data-slot="toast"]').getAttribute("data-variant"), "success");
    await mount("toast", "Expanded", theme, "timeout:0");
    await enqueue("Expanded");
    await page.getByText("New update available", { exact: true }).waitFor();
    await page.mouse.move(10, 10);
    await page.waitForTimeout(500);
    const expanded = await page.locator('[data-slot="toast"]').evaluateAll((nodes) =>
      nodes.map((node) => ({
        expanded: node.hasAttribute("data-layout-expanded"),
        opacity: getComputedStyle(node.querySelector('[data-slot="toast-content"]')).opacity,
        y: node.getBoundingClientRect().y,
        height: node.getBoundingClientRect().height,
      })),
    );
    assert.equal(expanded.length, 3);
    assert(expanded.every((item) => item.expanded && item.opacity === "1"));
    const positions = expanded.toSorted((a, b) => a.y - b.y);
    assert(
      positions
        .slice(1)
        .every(
          (item, index) => Math.abs(item.y - positions[index].y - positions[index].height - 12) < 1,
        ),
      "permanently expanded stack retains source 12px gaps without hover/focus",
    );
    await mount("toast", "CustomQueue", theme, "timeout:0");
    for (let i = 0; i < 4; i++)
      await page.getByRole("button", { name: "Add notification (max 2)", exact: true }).click();
    for (let i = 0; i < 4; i++)
      await page.getByRole("button", { name: "Add error (max 3)", exact: true }).click();
    for (let i = 0; i < 3; i++)
      await page.getByRole("button", { name: "Add success (max 1)", exact: true }).click();
    assert.equal(
      await page
        .locator('[data-slot="toast"][data-placement="bottom"]:not([data-limited])')
        .count(),
      2,
    );
    assert.equal(
      await page.locator('[data-slot="toast"][data-placement="top"]:not([data-limited])').count(),
      3,
    );
    assert.equal(
      await page
        .locator('[data-slot="toast"][data-placement="bottom-end"]:not([data-limited])')
        .count(),
      1,
    );
    assert.equal(await page.locator('[data-slot="toast"][data-limited]').count(), 5);
    assert.equal(
      await page
        .locator('[data-slot="toast"][data-limited]')
        .first()
        .evaluate((node) => getComputedStyle(node).pointerEvents),
      "none",
    );
    await mount("toast", "Placements", theme, "timeout:0");
    for (const placement of ["top start", "top", "top end", "bottom start", "bottom", "bottom end"])
      await page.getByRole("button", { name: placement, exact: true }).click();
    assert.equal(await page.locator('[data-slot="toast"]').count(), 6);
    for (const placement of ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"])
      assert.equal(
        await page.locator(`[data-slot="toast"][data-placement="${placement}"]`).count(),
        1,
      );
    await mount("toast", "ToastInModal", theme);
    await enqueue("ToastInModal");
    const toastZ = await page
      .locator('[data-slot="toast-viewport"]')
      .evaluate((node) => Number(getComputedStyle(node).zIndex));
    const modalZ = await page
      .locator('[data-slot="modal-viewport"]')
      .evaluate((node) => Number(getComputedStyle(node).zIndex));
    assert(toastZ > modalZ);
    await page.locator('[data-slot="toast"]').hover();
    await page.getByRole("button", { name: "Close notification", exact: true }).click();
    await page.locator('[data-slot="toast"]').waitFor({ state: "hidden" });
    await page.keyboard.press("Escape");
  }
  passed(
    "both themes: action dismiss; native promise loading/success/error; manual loading update; alwaysExpanded visible nonoverlapping geometry; independent native manager limits; six placements; toast above modal and dismiss",
  );
  await mount("toast", "WithCallbacks");
  await enqueue("WithCallbacks");
  await page.waitForTimeout(5200);
  assert.equal(await page.locator('[data-slot="toast"]').count(), 1);
  await page.locator('[data-slot="toast"]').hover();
  await page.getByRole("button", { name: "Close notification", exact: true }).click();
  await page.getByText("Important notification (manually closed)", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Custom timeout (3s)", exact: true }).click();
  await page.mouse.move(10, 10);
  await page
    .getByText("File saved (closed after 3 seconds)", { exact: true })
    .waitFor({ timeout: 6000 });
  assert.equal(
    await page
      .getByRole("button", { name: "Clear", exact: true })
      .evaluate((node) => node.getBoundingClientRect().height),
    24,
  );
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByText("No toasts closed yet. Try closing one above!", { exact: true }).waitFor();
  passed("persistent timeout0, manual onClose history, 3s timeout callback and history clear");
  await mount("toast", "Expanded");
  await enqueue("Expanded");
  await page.getByText("New update available", { exact: true }).waitFor();
  await page.mouse.move(10, 10);
  await page.waitForFunction(
    () => document.querySelectorAll('[data-slot="toast"]').length === 0,
    null,
    { timeout: 7000 },
  );
  passed("alwaysExpanded does not pause native timers, source default4000ms still dismisses");
  await mount("toast", "WithCallbacks");
  await enqueue("WithCallbacks");
  await page.keyboard.press("F6");
  await page.waitForFunction(() => document.activeElement?.closest('[data-slot="toast-viewport"]'));
  await page.keyboard.press("Shift+Tab");
  await page.waitForFunction(
    () => !document.activeElement?.closest('[data-slot="toast-viewport"]'),
  );
  passed(
    "native F6 focus entry and Shift+Tab return; source Alt+T customization is not a native public contract",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount("toast", "Default", "dark");
  await enqueue("Default");
  assert.equal(
    await page
      .locator('[data-slot="toast"]')
      .evaluate((node) => getComputedStyle(node).transitionDuration),
    "0s",
  );
  assert.equal(
    await page.locator('[data-slot="toast"]').evaluate((node) => {
      const box = node.getBoundingClientRect();
      return box.left >= 0 && box.right <= innerWidth;
    }),
    true,
  );
  assert.equal(await page.getByRole("button", { name: "Dismiss", exact: true }).count(), 1);
  assert.equal(
    await page
      .locator('[data-slot="toast-close"] svg')
      .evaluate((node) => node.getBoundingClientRect().width),
    14,
    "source mobile close icon size",
  );
  const mobileAction = await page
    .getByRole("button", { name: "Dismiss", exact: true })
    .boundingBox();
  const mobileDescription = await page.locator('[data-slot="toast-description"]').boundingBox();
  assert(
    mobileAction.y >= mobileDescription.y + mobileDescription.height,
    "source mobile action is below toast description",
  );
  await page.getByRole("button", { name: "Dismiss", exact: true }).click();
  await page.locator('[data-slot="toast"]').waitFor({ state: "hidden" });
  passed("390px mobile viewport toast bounds and reduced-motion transition");
  for (const [url, bytes] of assetBytes) {
    const { stdout } = await bytes;
    report.assetHashes[url] = createHash("sha256").update(stdout).digest("hex");
  }
  assert.deepEqual(errors, []);
  if (artifacts)
    await writeFile(
      resolve(artifacts, "menu-toast-proof.json"),
      `${JSON.stringify(report, null, 2)}\n`,
    );
  console.log(
    "PASS exact27 exports; 54 active light/dark iframe mounts; zero uncaught browser errors",
    JSON.stringify(report.assetHashes),
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
