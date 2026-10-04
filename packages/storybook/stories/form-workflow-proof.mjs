// Concrete failures: source inventories were absent, and snippet coverage cannot
// prove iframe mounting, native clipboard/locale/FormData, or async reset.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";

const [directory, contracts, playwrightModule] = process.argv.slice(2);
assert(
  directory && contracts && playwrightModule,
  "Provide production Storybook, contract output, and absolute Playwright module",
);
const playwright = await import(pathToFileURL(playwrightModule).href);
const { chromium } = playwright.default ?? playwright;
const expected = {
  "search-field": [
    "Default",
    "Variants",
    "FullWidth",
    "WithDescription",
    "Required",
    "Invalid",
    "Disabled",
    "Controlled",
    "WithValidation",
    "CustomIcons",
    "FormExample",
    "WithKeyboardShortcut",
  ],
  "number-field": [
    "Default",
    "Variants",
    "FullWidth",
    "WithDescription",
    "Required",
    "Invalid",
    "Disabled",
    "Controlled",
    "WithValidation",
    "WithStep",
    "WithFormatOptions",
    "CustomIcons",
    "WithChevrons",
    "FormExample",
  ],
  "input-otp": [
    "Default",
    "Variants",
    "FourDigits",
    "Disabled",
    "WithPattern",
    "Controlled",
    "WithValidation",
    "OnComplete",
    "FormExample",
  ],
};
const pin = "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e";
const exec = promisify(execFile);
const sourceHashes = {};
for (const [family, names] of Object.entries(expected)) {
  const local = await readFile(new URL(`./${family}.stories.tsx`, import.meta.url), "utf8");
  const { stdout } = await exec("curl", [
    "-fsSL",
    "--max-time",
    "30",
    `https://raw.githubusercontent.com/heroui-inc/heroui/${pin}/packages/react/src/components/${family}/${family}.stories.tsx`,
  ]);
  for (const text of [local, stdout])
    assert.deepEqual(
      [...text.matchAll(/export const (\w+)/g)].map((match) => match[1]),
      names,
    );
  const paths = [...stdout.matchAll(/\bd="([^"]+)"/g)].map((match) => match[1]);
  for (const path of paths) assert(local.includes(path), `${family}: genuine pinned SVG path`);
  sourceHashes[family] = createHash("sha256").update(stdout).digest("hex");
}
assert.equal(Object.values(expected).flat().length, 35);
const root = resolve(directory);
const contractRoot = resolve(contracts);
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};
const server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  const isContract = url.pathname.startsWith("/contracts/");
  const base = isContract ? contractRoot : root;
  const path = isContract ? url.pathname.slice("/contracts".length) : url.pathname;
  const file = resolve(base, `.${path === "/" ? "/index.html" : path}`);
  if (!file.startsWith(base + sep)) return response.writeHead(403).end();
  try {
    response.setHeader("Content-Type", mime[extname(file)] ?? "application/octet-stream");
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1100, height: 900 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
page.setDefaultTimeout(5000);
const errors = [];
const logs = [];
const gaps = [];
const geometry = [];
const invalidFixtures = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "log") logs.push(message.text());
});
page.on("dialog", (dialog) => {
  logs.push(dialog.message());
  dialog.accept();
});
const index = JSON.parse(await readFile(resolve(root, "index.json"), "utf8"));
const entries = Object.values(index.entries).filter(
  (entry) =>
    entry.type === "story" &&
    Object.keys(expected).some((family) => entry.importPath === `./stories/${family}.stories.tsx`),
);
assert.equal(entries.length, 35);
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
function slots() {
  return page.locator('[data-slot="input-otp-slot"]');
}
function number() {
  return page.locator('[data-slot="number-field-input"]');
}
function search() {
  return page.locator('[data-slot="search-field-input"]');
}
function button(name) {
  return page.getByRole("button", { name, exact: true });
}
function pending() {
  return page.locator('button[aria-busy="true"]');
}
async function poll(fn, expectedValue, label = "") {
  for (let i = 0; i < 100; i++) {
    const actual = await fn();
    if (JSON.stringify(actual) === JSON.stringify(expectedValue)) return;
    await new Promise((done) => setTimeout(done, 30));
  }
  assert.deepEqual(await fn(), expectedValue, label);
}
async function paste(locator, text) {
  await locator.focus();
  await page.evaluate((value) => navigator.clipboard.writeText(value), text);
  await page.keyboard.press("ControlOrMeta+V");
}
async function otpValue() {
  return slots().evaluateAll((nodes) => nodes.map((node) => node.value).join(""));
}
async function data() {
  return page.locator("form").evaluate((form) => Object.fromEntries(new FormData(form)));
}
let mounts = 0;
try {
  for (const theme of ["light", "dark"])
    for (const [family, names] of Object.entries(expected))
      for (const name of names) {
        await mount(family, name, theme);
        const inputs = page.locator(
          family === "search-field"
            ? '[data-slot="search-field-input"]'
            : family === "number-field"
              ? '[data-slot="number-field-input"]'
              : '[data-slot="input-otp-slot"]',
        );
        assert((await inputs.count()) > 0);
        const boxes = await inputs.evaluateAll((nodes) =>
          nodes.map((node) => {
            const box = node.getBoundingClientRect();
            const css = getComputedStyle(node);
            return {
              width: box.width,
              height: box.height,
              color: css.color,
              background: css.backgroundColor,
              fontSize: css.fontSize,
            };
          }),
        );
        assert(boxes.every((box) => box.width > 0 && box.height > 0));
        const groups = await page.locator(`[data-slot="${family}-group"]`).evaluateAll((nodes) =>
          nodes.map((node) => {
            const box = node.getBoundingClientRect();
            const css = getComputedStyle(node);
            return {
              width: box.width,
              height: box.height,
              outlineWidth: css.outlineWidth,
              outlineStyle: css.outlineStyle,
              outlineColor: css.outlineColor,
              boxShadow: css.boxShadow,
            };
          }),
        );
        if (name === "Default") {
          assert.equal(
            boxes[0].width,
            family === "search-field" ? 280 : family === "number-field" ? 120 : 38,
          );
          if (family === "input-otp") assert.equal(boxes[0].height, 40);
          else if (groups[0].height !== 36)
            gaps.push({
              family,
              theme,
              gap: "Pinned ordinary group h-9 = 36px",
              actual: groups[0].height,
            });
          if (family === "search-field") {
            const opacity = await button("Clear search").evaluate(
              (node) => getComputedStyle(node).opacity,
            );
            if (opacity !== "0")
              gaps.push({
                family,
                theme,
                gap: "Pinned empty clear action opacity 0",
                actual: opacity,
              });
          }
        }
        if (name === "Invalid" && family !== "input-otp") {
          for (const group of groups)
            if (group.outlineWidth !== "1px" || group.outlineStyle !== "solid")
              gaps.push({
                family,
                theme,
                gap: "Pinned invalid-field-ring requires a 1px solid danger outline while unfocused",
                actual: {
                  outlineWidth: group.outlineWidth,
                  outlineStyle: group.outlineStyle,
                  outlineColor: group.outlineColor,
                },
              });
        }
        if (name === "FullWidth") assert.equal(groups[0].width, 400);
        geometry.push({ family, name, theme, boxes, groups });
        if (process.env.DELTA_SCRATCH_DIR && ["Default", "Invalid", "WithChevrons"].includes(name))
          await page.screenshot({
            path: resolve(
              process.env.DELTA_SCRATCH_DIR,
              `form-workflow-${family}-${name}-${theme}.png`,
            ),
          });
        mounts++;
      }
  assert.equal(mounts, 70);
  for (const theme of ["light", "dark"]) {
    await mount("search-field", "Required", theme);
    assert.equal(await search().first().getAttribute("required"), "");
    await mount("search-field", "Disabled", theme);
    assert(await search().first().isDisabled());
    assert(await button("Clear search").first().isDisabled());
    await mount("search-field", "Invalid", theme);
    assert.deepEqual(await search().evaluateAll((nodes) => nodes.map((node) => node.value)), [
      "ab",
      "invalid@query",
    ]);
    assert.equal(await page.locator('[data-slot="field-error"]').count(), 2);
    await mount("search-field", "Controlled", theme);
    await button("Set example").click();
    assert.equal(await search().inputValue(), "example query");
    await button("Clear search").click();
    await poll(() => search().inputValue(), "");
    assert(await search().evaluate((node) => document.activeElement === node));
    await search().fill("again");
    await page.keyboard.press("Escape");
    await poll(() => search().inputValue(), "");
    await mount("search-field", "WithValidation", theme);
    await search().fill("ab");
    assert.equal(await search().getAttribute("aria-invalid"), "true");
    assert(await page.getByText("Search query must be at least 3 characters").isVisible());
    await search().fill("abc");
    assert.equal(await page.locator('[data-slot="field-error"]').count(), 0);
    await mount("search-field", "WithKeyboardShortcut", theme);
    await page.keyboard.press("ControlOrMeta+k");
    assert(await search().evaluate((node) => document.activeElement === node));
    await page.keyboard.press("Escape");
    assert.equal(await search().evaluate((node) => document.activeElement === node), false);
    await mount("search-field", "FormExample", theme);
    assert(await button("Search").isDisabled());
    await search().fill("camera");
    assert.deepEqual(await data(), { search: "camera" });
    await button("Search").click();
    assert(await pending().isVisible());
    assert.match(await pending().textContent(), /Searching\.\.\./);
    assert.equal(await pending().getAttribute("tabindex"), "0");
    await pending().focus();
    await page.keyboard.press("Enter");
    await poll(() => search().inputValue(), "");
    assert(await button("Search").isDisabled());

    await mount("number-field", "Invalid", theme);
    assert.deepEqual(await number().evaluateAll((nodes) => nodes.map((node) => node.value)), [
      "-5",
      "150%",
    ]);
    assert.equal(await page.locator('[data-slot="field-error"]').count(), 2);
    await mount("number-field", "WithChevrons", theme);
    const chevronBoxes = await page
      .locator(
        '[data-slot="number-field-increment-button"],[data-slot="number-field-decrement-button"]',
      )
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return { width: box.width, height: box.height };
        }),
      );
    assert(chevronBoxes.every((box) => box.width === 24 && box.height > 0 && box.height <= 18));
    await button("Increase value").click();
    assert.equal(await number().inputValue(), "€100.00");
    await mount("number-field", "Controlled", theme);
    await button("Set to 2048").click();
    assert.equal(await number().inputValue(), "2,048");
    await button("Reset to 0").click();
    assert.equal(await number().inputValue(), "0");
    await number().focus();
    await page.keyboard.press("ArrowDown");
    assert.equal(await number().inputValue(), "0");
    assert.equal(await button("Decrease value").getAttribute("aria-disabled"), "true");
    await mount("number-field", "WithStep", theme);
    for (let i = 0; i < 3; i++) {
      await number().nth(i).focus();
      await page.keyboard.press("ArrowUp");
      assert.equal(await number().nth(i).inputValue(), String([1, 5, 10][i]));
    }
    await mount("number-field", "WithFormatOptions", theme);
    assert.deepEqual(await number().evaluateAll((nodes) => nodes.map((node) => node.value)), [
      "€99.00",
      "$99.99",
      "50%",
      "1,234.56",
      "1,000 kg",
    ]);
    await number().nth(2).focus();
    await page.keyboard.press("ArrowUp");
    assert.equal(await number().nth(2).inputValue(), "51%");
    await mount("number-field", "Disabled", theme);
    assert(await number().nth(0).isDisabled());
    await mount("number-field", "FormExample", theme);
    assert(await button("Place Order").isDisabled());
    await number().fill("4");
    await number().blur();
    assert(await page.getByText("Only 3 items left in stock").isVisible());
    assert.equal(await number().getAttribute("aria-invalid"), "true");
    assert(await button("Place Order").isDisabled());
    await number().fill("2");
    await number().blur();
    assert.deepEqual(await data(), { quantity: "2" });
    await button("Place Order").click();
    assert.match(await pending().textContent(), /Processing\.\.\./);
    await poll(() => number().inputValue(), "");
    assert(await button("Place Order").isDisabled());

    await mount("input-otp", "Controlled", theme);
    assert.equal(await slots().count(), 6);
    await paste(slots().first(), "12 3a45-6789");
    await poll(otpValue, "123456");
    const digitSize = await slots()
      .first()
      .evaluate((node) => getComputedStyle(node).fontSize);
    if (digitSize !== "18px")
      gaps.push({
        family: "input-otp",
        theme,
        gap: "Pinned visible slot-value text-lg = 18px",
        actual: digitSize,
      });
    assert(await page.getByText("Value: 123456 (6/6) •").isVisible());
    await button("Clear").click();
    await poll(otpValue, "");
    await slots().first().focus();
    await page.keyboard.type("123");
    await page.keyboard.press("Backspace");
    await poll(otpValue, "12");
    await mount("input-otp", "FourDigits", theme);
    await paste(slots().first(), "987654");
    await poll(otpValue, "9876");
    await mount("input-otp", "WithPattern", theme);
    await paste(slots().first(), "a1b2C3d4E5f6g");
    await poll(otpValue, "abCdEf");
    await mount("input-otp", "Disabled", theme);
    assert(await slots().first().isDisabled());
    await mount("input-otp", "WithValidation", theme);
    assert(await button("Submit").isDisabled());
    await paste(slots().first(), "999999");
    assert.deepEqual(await data(), { code: "999999" });
    await button("Submit").click();
    assert(await page.getByText("Invalid code. Please try again.").isVisible());
    assert.equal(await slots().first().getAttribute("aria-invalid"), "true");
    await paste(slots().first(), "123456");
    assert.equal(await page.locator('[data-slot="field-error"]').count(), 0);
    await button("Submit").click();
    await poll(otpValue, "");
    assert(logs.includes("Code verified successfully!"));
    await mount("input-otp", "OnComplete", theme);
    await paste(slots().first(), "654321");
    assert.equal(await button("Verify Code").isDisabled(), false);
    await button("Verify Code").click();
    assert.match(await pending().textContent(), /Verifying\.\.\./);
    await poll(otpValue, "");
    assert(await button("Verify Code").isDisabled());
    await mount("input-otp", "FormExample", theme);
    await paste(slots().first(), "999999");
    await button("Verify").click();
    assert.match(await pending().textContent(), /Verifying\.\.\./);
    await poll(() => page.getByText("Invalid code. Please try again.").isVisible(), true);
    await paste(slots().first(), "123456");
    await button("Verify").click();
    await poll(otpValue, "");
    assert(await button("Verify").isDisabled());
  }
  for (const theme of ["light", "dark"]) {
    await page.goto(`${base}/contracts/?case=invalid&theme=${theme}`);
    await search().waitFor();
    for (const family of ["search-field", "number-field"]) {
      const reproduction = await page.locator(`[data-slot="${family}-group"]`).evaluate((node) => {
        const css = getComputedStyle(node);
        const attrs = (element) =>
          Object.fromEntries(
            [...element.attributes]
              .filter((attribute) => attribute.name !== "class" && attribute.name !== "style")
              .map((attribute) => [attribute.name, attribute.value]),
          );
        const matchedRules = [];
        const walk = (rules) => {
          for (const rule of rules) {
            if (rule.media && !matchMedia(rule.conditionText).matches) continue;
            if (rule.selectorText && /outline|border/.test(rule.style.cssText)) {
              try {
                if (node.matches(rule.selectorText))
                  matchedRules.push({
                    selector: rule.selectorText,
                    declarations: rule.style.cssText,
                  });
              } catch {
                /* Unsupported browser selector is not a matched rule. */
              }
            }
            if (rule.cssRules) walk(rule.cssRules);
          }
        };
        for (const sheet of document.styleSheets) walk(sheet.cssRules);
        return {
          expected: {
            outlineWidth: "1px",
            outlineStyle: "solid",
            outlineColor: getComputedStyle(document.documentElement)
              .getPropertyValue("--danger")
              .trim(),
          },
          actual: {
            outlineWidth: css.outlineWidth,
            outlineStyle: css.outlineStyle,
            outlineColor: css.outlineColor,
          },
          groupAttributes: attrs(node),
          inputAttributes: attrs(node.querySelector("input")),
          ancestors: [node.parentElement, node.parentElement.parentElement].map(attrs),
          hasInvalidDescendant: node.matches(":has([data-invalid])"),
          matchedRules,
        };
      });
      invalidFixtures.push({ family, theme, ...reproduction });
    }
    await page.goto(`${base}/contracts/?theme=${theme}`);
    await number().waitFor();
    assert.equal(await number().inputValue(), "1.234,50");
    await button("Focus number ref").click();
    assert.equal(await page.getByLabel("Native result").textContent(), "refs:INPUT/DIV");
    assert(await number().evaluate((node) => node === document.activeElement));
    await number().fill("1.500,50");
    await number().blur();
    assert.equal(await number().inputValue(), "1.500,50");
    await paste(slots().first(), "a1 b2 c3 d4 e5");
    await poll(otpValue, "ABCD");
    await button("Submit native values").click();
    await poll(
      () => page.getByLabel("Native result").textContent(),
      '{"amount":"1500.5","code":"ABCD"}',
    );
    await button("Switch locale").click();
    assert.equal(await number().inputValue(), "1,500.50");
    await number().focus();
    await page.keyboard.press("ArrowUp");
    assert.equal(await number().inputValue(), "1,501.00");
    await number().fill("9999");
    await number().blur();
    assert.equal(await number().inputValue(), "2,000.00");
    assert.equal(await button("Increase value").getAttribute("aria-disabled"), "true");
    await button("Toggle disabled").click();
    assert(await number().isDisabled());
    assert.deepEqual(await data(), { code: "ABCD" });
    await button("Toggle disabled").click();
    await number().fill("");
    await number().blur();
    await button("Submit native values").click();
    assert(await page.getByText("Amount is required").isVisible());
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ["light", "dark"])
    for (const [family, names] of Object.entries(expected))
      for (const name of names) {
        await mount(family, name, theme);
        const width = await page.evaluate(() => document.documentElement.scrollWidth);
        assert(width <= 390, `${family}/${name}/${theme} mobile overflow ${width}`);
      }
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const family of Object.keys(expected)) {
    await mount(family, "FormExample", "dark");
    assert(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches));
    const transitions = await page
      .locator(`[data-slot="${family === "input-otp" ? "input-otp-slot" : `${family}-group`}"]`)
      .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).transitionDuration));
    assert(transitions.every((duration) => duration === "0s"));
  }
  assert.deepEqual(errors, []);
  assert.equal(logs.filter((message) => message.includes("Search submitted:")).length, 2);
  assert.equal(logs.filter((message) => message.includes("Order submitted:")).length, 2);
  const report = {
    pin,
    sourceHashes,
    exports: expected,
    mounts,
    mobileMounts: 70,
    geometry,
    invalidFixtures,
    errors,
    gaps,
  };
  if (process.env.DELTA_SCRATCH_DIR)
    await writeFile(
      resolve(process.env.DELTA_SCRATCH_DIR, "form-workflow-proof.json"),
      JSON.stringify(report, null, 2),
    );
  console.log(
    "PASS: exact 35 pinned exports; 70 actual light/dark iframe mounts; source workflows, clipboard/truncation, native FormData/errors/loading/reset, locale parsing/ref/keyboard/bounds/disabled, mobile/reduced-motion.",
  );
  console.log(
    `Source visual parity gaps: ${gaps.length} invalid/group measurements; see proof JSON and evidence. Native workflow acceptance is separate.`,
  );
} catch (error) {
  console.error("Failure URL:", page.url());
  console.error("Root:", await page.locator("body").innerText());
  console.error(
    "Buttons:",
    await page.getByRole("button").evaluateAll((nodes) => nodes.map((node) => node.outerHTML)),
  );
  console.error("Errors:", errors);
  throw error;
} finally {
  await browser.close();
  server.close();
}
