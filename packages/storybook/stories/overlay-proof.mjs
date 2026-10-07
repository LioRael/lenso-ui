// Production iframe proof, not a source-snippet render.
// node overlay-proof.mjs <storybook-static> <absolute-playwright-module>
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";

const [directory, playwrightModule = "playwright"] = process.argv.slice(2);
assert(directory, "Provide production Storybook output");
const playwright = await import(
  playwrightModule.startsWith("/") ? pathToFileURL(playwrightModule).href : playwrightModule
);
const { chromium } = playwright.default ?? playwright;
const expected = {
  "alert-dialog": [
    "Default",
    "Statuses",
    "Placements",
    "Sizes",
    "BackdropVariants",
    "CustomIcon",
    "CustomBackdrop",
    "DismissBehavior",
    "CloseMethods",
    "Controlled",
    "CustomTrigger",
    "CustomAnimations",
    "CustomPortal",
  ],
  drawer: [
    "Default",
    "Placements",
    "BackdropVariants",
    "WithForm",
    "WithScrollableContent",
    "NavigationDrawer",
    "NonDismissable",
    "Controlled",
  ],
  modal: [
    "Default",
    "Placements",
    "BackdropVariants",
    "Sizes",
    "CustomBackdrop",
    "DismissBehavior",
    "CloseMethods",
    "ScrollComparison",
    "Controlled",
    "WithForm",
    "CustomTrigger",
    "CustomAnimations",
    "CustomPortal",
  ],
  popover: ["Default", "WithArrow", "WithCustomContent", "SpringAnimation", "CardWithHelptext"],
  tooltip: ["Default", "WithTrigger", "CardWithTooltip"],
};
const exec = promisify(execFile);
for (const [family, names] of Object.entries(expected)) {
  const source = await readFile(new URL(`./${family}.stories.tsx`, import.meta.url), "utf8");
  assert.deepEqual(
    [...source.matchAll(/export const (\w+)/g)].map((match) => match[1]),
    names,
  );
  if (process.env.OVERLAY_VERIFY_PIN === "1") {
    const { stdout } = await exec("curl", [
      "-fsSL",
      "--max-time",
      "30",
      `https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/${family}/${family}.stories.tsx`,
    ]);
    assert.deepEqual(
      [...stdout.matchAll(/export const (\w+)/g)].map((match) => match[1]),
      names,
    );
  }
}
assert.equal(Object.values(expected).flat().length, 42);
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
const assets = new Map();
const assetEvidence = [];
page.on("pageerror", (error) => errors.push(error.message));
if (process.env.OVERLAY_ASSET_REPLAY === "1") {
  await page.route(/https:\/\/(?:img\.heroui\.chat|api\.iconify\.design)\//, async (route) => {
    const url = route.request().url();
    if (!assets.has(url))
      assets.set(
        url,
        exec("curl", ["-fsSL", "--max-time", "30", url], {
          encoding: "buffer",
          maxBuffer: 8 * 1024 * 1024,
        }),
      );
    try {
      const { stdout } = await assets.get(url);
      if (!assetEvidence.some((asset) => asset.url === url))
        assetEvidence.push({
          url,
          bytes: stdout.length,
          sha256: createHash("sha256").update(stdout).digest("hex"),
        });
      await route.fulfill({
        status: 200,
        contentType: url.includes("iconify") ? "image/svg+xml" : "image/jpeg",
        body: stdout,
        headers: { "access-control-allow-origin": "*" },
      });
    } catch {
      await route.abort("failed");
    }
  });
}
const index = JSON.parse(await readFile(resolve(root, "index.json"), "utf8"));
const entries = Object.values(index.entries).filter(
  (entry) =>
    entry.type === "story" &&
    Object.keys(expected).some((family) => entry.importPath === `./stories/${family}.stories.tsx`),
);
assert.equal(entries.length, 42);
async function mount(family, name, theme = "light", args = "") {
  const story = entries.find(
    (entry) => entry.importPath === `./stories/${family}.stories.tsx` && entry.exportName === name,
  );
  assert(story);
  await page.goto(
    `${base}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}${args ? `&args=${args}` : ""}`,
  );
  await page.waitForFunction(() => document.querySelector("#storybook-root")?.children.length > 0);
  assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
}
function popup(family) {
  return page.locator(`[data-slot="${family}-popup"]`);
}
function trigger(family) {
  return page.locator(`[data-slot="${family}-trigger"]`);
}
async function open(family, i = 0) {
  if (family === "tooltip") await trigger(family).nth(i).focus();
  else await trigger(family).nth(i).click();
  await popup(family).waitFor({ state: "visible" });
  await page.waitForFunction((slot) => {
    const node = document.querySelector(`[data-slot="${slot}-popup"]`);
    return (
      node && !node.hasAttribute("data-starting-style") && node.getBoundingClientRect().width > 0
    );
  }, family);
  await popup(family).evaluate(async (node) => {
    await document.fonts.ready;
    await Promise.all(node.getAnimations().map((animation) => animation.finished.catch(() => {})));
  });
  if (process.env.OVERLAY_ASSET_REPLAY === "1") {
    await page.evaluate(async () => {
      await Promise.all(
        [...document.querySelectorAll("[data-source-icon]")].map(
          (node) =>
            new Promise((done, reject) => {
              const image = new Image();
              image.onload = done;
              image.onerror = reject;
              image.src = `https://api.iconify.design/gravity-ui/${node.getAttribute("data-source-icon")}.svg`;
            }),
        ),
      );
    });
    if (await page.locator('[data-slot="avatar"]').count())
      await page.waitForFunction(() => {
        const avatars = [...document.querySelectorAll('[data-slot="avatar"]')];
        return avatars.every((avatar) => {
          const image = avatar.querySelector("img");
          return image?.complete && image.naturalWidth > 0;
        });
      });
  }
}
async function close(family) {
  if (family === "tooltip") {
    await page.keyboard.press("Escape");
    await trigger(family).blur();
  } else if (family === "popover") await page.keyboard.press("Escape");
  else {
    const actions = popup(family).locator(`[data-slot="${family}-close"]`);
    if (await actions.count()) await actions.last().click();
    else await popup(family).getByRole("button").last().click();
  }
  await popup(family).waitFor({ state: "hidden" });
}
let openings = 0;
try {
  for (const theme of ["light", "dark"])
    for (const [family, names] of Object.entries(expected))
      for (const name of names) {
        await mount(family, name, theme);
        const count = await trigger(family).count();
        assert(count > 0, `${family}/${name} exposes native trigger`);
        for (let i = 0; i < count; i++) {
          if (i) await mount(family, name, theme);
          await open(family, i);
          assert.equal(
            await popup(family).getAttribute("role"),
            family === "tooltip" ? "tooltip" : family === "alert-dialog" ? "alertdialog" : "dialog",
          );
          const box = await popup(family).boundingBox();
          assert(box.width > 0 && box.height > 0);
          if (name === "Sizes" && i < 4) assert(Math.abs(box.width - [320, 384, 448, 512][i]) < 1);
          if (name === "Placements") {
            if (family === "drawer") {
              const side = ["bottom", "top", "left", "right"][i];
              if (side === "bottom") assert(Math.abs(box.y + box.height - 900) < 1);
              if (side === "top") assert(Math.abs(box.y) < 1);
              if (side === "left") assert(Math.abs(box.x) < 1);
              if (side === "right") assert(Math.abs(box.x + box.width - 1100) < 1);
            } else {
              if (i === 0 || i === 2) assert(Math.abs(box.y + box.height / 2 - 450) < 1);
              if (i === 1) assert(box.y < 50);
              if (i === 3) assert(900 - box.y - box.height < 50);
            }
          }
          if (name === "BackdropVariants") {
            const backdropStyle = await page
              .locator(`[data-slot="${family}-backdrop"]`)
              .evaluate((node) => ({
                background: getComputedStyle(node).backgroundColor,
                blur: getComputedStyle(node).backdropFilter,
              }));
            if (i === 1) assert.match(backdropStyle.blur, /blur\(/);
            if (i === 2) assert.match(backdropStyle.background, /(?:rgba\(.*,\s*0\)|transparent)/);
          }
          if (
            process.env.DELTA_SCRATCH_DIR &&
            i === 0 &&
            ["Default", "CustomBackdrop", "WithCustomContent", "CustomAnimations"].includes(name)
          )
            await page.screenshot({
              path: `${process.env.DELTA_SCRATCH_DIR}/overlay-${family}-${name}-${theme}.png`,
            });
          await close(family);
          openings++;
        }
      }
  for (const family of ["modal", "drawer", "popover"]) {
    await mount(family, "Default");
    await trigger(family).focus();
    await page.keyboard.press("Enter");
    await popup(family).waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    await popup(family).waitFor({ state: "hidden" });
    assert.equal(await trigger(family).evaluate((node) => node === document.activeElement), true);
  }
  for (const family of ["modal", "alert-dialog"]) {
    await mount(family, "DismissBehavior");
    await open(family);
    await page.mouse.click(2, 2);
    assert.equal(await popup(family).isVisible(), true);
    await close(family);
    await mount(family, "DismissBehavior");
    await open(family, 1);
    await page.keyboard.press("Escape");
    assert.equal(await popup(family).isVisible(), true);
    await close(family);
    await mount(family, "Controlled");
    await open(family);
    await close(family);
    assert.match(await page.locator("#storybook-root").textContent(), /closed/);
    await mount(family, "CustomPortal");
    await open(family);
    assert.equal(
      await popup(family).evaluate((node) => !!node.closest("[data-overlay-portal-host]")),
      true,
    );
    await close(family);
    await mount(family, "CustomAnimations");
    await open(family);
    assert.equal(
      await popup(family).evaluate((node) => getComputedStyle(node).transitionDuration),
      "0.4s",
    );
    await close(family);
  }
  await mount("drawer", "NonDismissable");
  await open("drawer");
  await page.mouse.click(2, 2);
  assert.equal(await popup("drawer").isVisible(), true);
  await close("drawer");
  await mount("popover", "WithCustomContent");
  await open("popover");
  await page.getByRole("button", { name: "Follow", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: "Following", exact: true }).count(), 1);
  if (process.env.OVERLAY_ASSET_REPLAY === "1")
    await page.waitForFunction(() =>
      [...document.querySelectorAll("img")].every((node) => node.complete && node.naturalWidth > 0),
    );
  await close("popover");
  await mount("popover", "WithArrow", "light", "placement:right;offset:12");
  await open("popover");
  assert.equal(await popup("popover").getAttribute("data-side"), "right");
  const arrow = popup("popover").locator('[data-slot="popover-arrow"]');
  assert.equal(await arrow.count(), 1);
  await close("popover");
  for (const theme of ["light", "dark"]) {
    for (const family of ["tooltip", "popover"]) {
      for (const side of ["top", "bottom", "left", "right"]) {
        await mount(
          family,
          family === "tooltip" ? "Default" : "WithArrow",
          theme,
          `placement:${side}`,
        );
        await open(family);
        const geometry = await popup(family).evaluate((node) => {
          const arrow = node.querySelector('[data-slot$="-arrow"]');
          const svg = arrow.querySelector("svg");
          const box = arrow.getBoundingClientRect();
          const icon = svg.getBoundingClientRect();
          return {
            side: node.getAttribute("data-side"),
            lineHeight: getComputedStyle(node).lineHeight,
            dx: box.x - icon.x,
            dy: box.y - icon.y,
            width: icon.width,
            height: icon.height,
            sameSurface: getComputedStyle(svg).fill === getComputedStyle(node).backgroundColor,
          };
        });
        assert.equal(geometry.side, side);
        assert.equal(geometry.lineHeight, family === "tooltip" ? "16px" : "20px");
        assert(
          Math.abs(geometry.dx) < 0.1 && Math.abs(geometry.dy) < 0.1,
          `${family}: no SVG baseline gap`,
        );
        assert.equal(geometry.width, 12);
        assert.equal(geometry.height, 12);
        assert(geometry.sameSurface, `${family}: arrow fill joins the popup surface`);
        await close(family);
      }
    }
  }
  await mount("popover", "SpringAnimation");
  await open("popover");
  assert.equal(
    await popup("popover").evaluate((node) => getComputedStyle(node).transitionDuration),
    "0.6s",
  );
  await close("popover");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const family of ["modal", "drawer"]) {
    await mount(family, "WithForm");
    await open(family);
    await page.getByRole("textbox", { name: "Name", exact: true }).fill("Zoey Lang");
    await page.getByRole("textbox", { name: "Email", exact: true }).fill("zoe@heroui.com");
    assert.equal(
      await page.getByRole("textbox", { name: "Email", exact: true }).inputValue(),
      "zoe@heroui.com",
    );
    assert((await popup(family).boundingBox()).width <= 390);
    await close(family);
  }
  for (const [family, name] of [
    ["modal", "ScrollComparison"],
    ["drawer", "WithScrollableContent"],
  ]) {
    await mount(family, name);
    await open(family);
    const body = popup(family).locator(`[data-slot="${family}-body"]`);
    const footer = popup(family).locator(`[data-slot="${family}-footer"]`);
    const before = await footer.boundingBox();
    assert.equal(await body.evaluate((node) => node.scrollHeight > node.clientHeight), true);
    await body.evaluate((node) => {
      node.scrollTop = 200;
    });
    assert.equal(await body.evaluate((node) => node.scrollTop > 0), true);
    const after = await footer.boundingBox();
    assert(Math.abs(before.y - after.y) < 1, `${family}: footer stays outside internal scroller`);
    await close(family);
  }
  for (const family of ["modal", "alert-dialog"]) {
    await mount(family, "Placements");
    await open(family);
    const box = await popup(family).boundingBox();
    assert(844 - box.y - box.height < 20, `${family}: auto moves to bottom on mobile`);
    await close(family);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const family of ["modal", "alert-dialog"]) {
    await mount(family, "CustomAnimations");
    await open(family);
    assert.equal(
      await popup(family).evaluate((node) => getComputedStyle(node).transitionDuration),
      "0s",
    );
    await close(family);
  }
  await mount("popover", "SpringAnimation");
  await open("popover");
  assert.equal(
    await popup("popover").evaluate((node) => getComputedStyle(node).transitionDuration),
    "0s",
  );
  await close("popover");
  assert.deepEqual(errors, []);
  console.log(
    `PASS: 42 exact exports; 84 light/dark production story mounts; ${openings} popup openings; keyboard/focus-return, dismissal, controlled, portal, profile, placement/arrow, animation/reduced-motion, mobile form and internal scroll.`,
  );
  console.log("Original asset replay:", JSON.stringify(assetEvidence));
  if (process.env.DELTA_SCRATCH_DIR)
    await writeFile(
      resolve(process.env.DELTA_SCRATCH_DIR, "overlay-proof.json"),
      JSON.stringify(
        { exports: expected, storyMounts: 84, openings, errors, assetEvidence },
        null,
        2,
      ),
    );
} finally {
  await browser.close();
  server.close();
}
