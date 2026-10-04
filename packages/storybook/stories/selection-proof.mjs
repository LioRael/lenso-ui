/**
 * Production proof for the pinned selection batch.
 * Existing generic smoke does not prove native popup ownership, selection,
 * required FormData, asynchronous races/cursors or offscreen keyboard windowing.
 * node selection-proof.mjs <production-storybook-directory> <readonly-dependency-checkout>
 * Optional SELECTION_PROOF_OUTPUT writes the report; SELECTION_REPLAY_DIR saves
 * captured bytes and their provenance for repeatable offline replay (scratch paths).
 * Network responses are genuine captured replay, never fabricated options/images.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { extname, resolve } from "node:path";

const [directory, dependency] = process.argv.slice(2);
if (!directory || !dependency)
  throw new Error("Supply production directory and dependency checkout");
const require = createRequire(resolve(dependency, "packages/react/package.json"));
const { chromium } = require("playwright");
const families = {
  select: {
    count: 17,
    hash: "db0fb20b5cd4732adb0fba9e02b6503a59f0b2377acad107bc9e3de29911fb8f",
    prefix: "components-pickers-select",
  },
  "combo-box": {
    count: 19,
    hash: "0b421789a72382d9fd21c8d025f2d022ddd43d49b307c01b9f38374ad407dd0c",
    prefix: "components-pickers-combobox",
  },
  autocomplete: {
    count: 21,
    hash: "59678ac699363858b12cb2d5f466746838912c6301a778a1016a7475297827f9",
    prefix: "components-pickers-autocomplete",
  },
  "list-box": {
    count: 7,
    hash: "6f82cd82172feb2d8d98c610e6f3354d701bd75d609cf82e06324a3aaab9f981",
    prefix: "components-collections-listbox",
  },
};
const pin = "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e";
const report = {
  node: process.version,
  sourceExports: 0,
  mounts: 0,
  popups: 0,
  failures: [],
  checks: [],
  sources: {},
  replay: {},
  geometry: {},
  pageErrors: [],
};
const replay = new Map();
async function capture(url) {
  if (replay.has(url)) return replay.get(url);
  const cache = process.env.SELECTION_REPLAY_DIR;
  const key = createHash("sha256").update(url).digest("hex");
  let record;
  if (cache) {
    try {
      const metadata = JSON.parse(await readFile(resolve(cache, `${key}.json`), "utf8"));
      const body = await readFile(resolve(cache, `${key}.bin`));
      assert.equal(metadata.url, url);
      assert.equal(createHash("sha256").update(body).digest("hex"), metadata.sha256);
      record = { body, contentType: metadata.contentType };
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  if (!record) {
    const response = await fetch(url);
    assert.equal(response.status, 200, `Genuine replay capture: ${url}`);
    const body = Buffer.from(await response.arrayBuffer());
    record = { body, contentType: response.headers.get("content-type") };
    if (cache) {
      await mkdir(cache, { recursive: true });
      await writeFile(resolve(cache, `${key}.bin`), body);
      await writeFile(
        resolve(cache, `${key}.json`),
        JSON.stringify({
          url,
          contentType: record.contentType,
          sha256: createHash("sha256").update(body).digest("hex"),
        }),
      );
    }
  }
  replay.set(url, record);
  report.replay[url] = {
    sha256: createHash("sha256").update(record.body).digest("hex"),
    bytes: record.body.length,
  };
  return record;
}
const server = createServer(async (request, response) => {
  const path = new URL(request.url, "http://localhost").pathname;
  try {
    const body = await readFile(resolve(directory, `.${path === "/" ? "/index.html" : path}`));
    const types = {
      ".js": "text/javascript",
      ".css": "text/css",
      ".html": "text/html",
      ".json": "application/json",
      ".svg": "image/svg+xml",
    };
    response.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
report.browser = await browser.version();
report.playwright = require("playwright/package.json").version;
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
page.setDefaultTimeout(8000);
page.on("pageerror", (error) => report.pageErrors.push(error.message));
await page.route("https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/**", async (route) => {
  try {
    const record = await capture(route.request().url());
    await route.fulfill({ status: 200, ...record });
  } catch {
    await route.continue();
  }
});
await page.route("https://swapi.py4e.com/**", async (route) => {
  try {
    const url = route.request().url();
    const record = await capture(url);
    if (new URL(url).searchParams.get("search") === "Luke")
      await new Promise((done) => setTimeout(done, 250));
    await route.fulfill({ status: 200, ...record });
  } catch {
    await route.continue();
  }
});
await page.route("https://pokeapi.co/**", async (route) => {
  try {
    const record = await capture(route.request().url());
    await route.fulfill({ status: 200, ...record });
  } catch {
    await route.continue();
  }
});
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
async function story(family, name, theme = "light") {
  await page.goto(
    `${base}/iframe.html?id=${families[family].prefix}--${kebab(name)}&viewMode=story&globals=theme:${theme}`,
  );
  await page.locator("#storybook-root > *").first().waitFor();
  await page.waitForFunction((theme) => document.documentElement.dataset.theme === theme, theme);
  assert.equal(await page.locator("#error-message").textContent(), "");
}
async function checked(locator, selected) {
  assert.equal(await locator.getAttribute("aria-selected"), String(selected));
}
async function test(name, run) {
  try {
    await run();
    report.checks.push(name);
  } catch (error) {
    report.failures.push({ name, message: error.message });
  }
}
try {
  const index = JSON.parse(await readFile(resolve(directory, "index.json"), "utf8"));
  for (const [family, config] of Object.entries(families)) {
    const record = await capture(
      `https://raw.githubusercontent.com/heroui-inc/heroui/${pin}/packages/react/src/components/${family}/${family}.stories.tsx`,
    );
    const source = record.body.toString("utf8");
    assert.equal(createHash("sha256").update(source).digest("hex"), config.hash);
    const upstream = [...source.matchAll(/export const (\w+): Story/g)].map((match) => match[1]);
    const local = await readFile(new URL(`./${family}.stories.tsx`, import.meta.url), "utf8");
    assert.deepEqual(
      [...local.matchAll(/export const (\w+): Story/g)].map((match) => match[1]),
      upstream,
    );
    assert.equal(upstream.length, config.count);
    for (const name of upstream)
      assert.ok(
        index.entries[`${config.prefix}--${kebab(name)}`],
        `${family}/${name} production index`,
      );
    report.sources[family] = { sha256: config.hash, exports: upstream };
    report.sourceExports += upstream.length;
    for (const theme of ["light", "dark"])
      for (const name of upstream)
        await test(`mount/open ${family}/${name}/${theme}`, async () => {
          await story(family, name, theme);
          assert.ok((await page.locator("#storybook-root").boundingBox()).height > 0);
          report.mounts++;
          const triggers = page.locator(
            "[data-slot=select-trigger]:enabled,[data-slot=combo-box-trigger]:enabled,[data-slot=autocomplete-trigger]:enabled",
          );
          const count = await triggers.count();
          for (let i = 0; i < count; i++) {
            const trigger = triggers.nth(i);
            await trigger.click();
            const popup = page
              .locator(
                "[data-slot=select-popover],[data-slot=combo-box-popover],[data-slot=autocomplete-popover]",
              )
              .last();
            await popup.waitFor();
            await page.waitForTimeout(250);
            assert.ok((await popup.boundingBox()).height > 0);
            await page.keyboard.press("Escape");
            await popup.waitFor({ state: "hidden" });
            report.popups++;
          }
        });
  }
  for (const theme of ["light", "dark"]) {
    await test(`select native keyboard + controlled ${theme}`, async () => {
      await story("select", "Controlled", theme);
      const trigger = page.locator("[data-slot=select-trigger]");
      await trigger.focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("End");
      await page.keyboard.press("Enter");
      assert.match(await page.locator("#storybook-root").innerText(), /Selected: Pennsylvania/);
      await story("select", "ControlledMultiple", theme);
      await page.locator("[data-slot=select-trigger]").click();
      const option = page.getByRole("option", { name: "California", exact: true });
      await checked(option, true);
      await option.click();
      await checked(option, false);
      assert.match(await page.locator("#storybook-root").innerText(), /Selected: texas/);
    });
    await test(`controlled open state ${theme}`, async () => {
      for (const family of ["select", "autocomplete"]) {
        await story(family, "ControlledOpenState", theme);
        await page
          .getByRole("button", {
            name: `Open ${family === "select" ? "Select" : "Autocomplete"}`,
            exact: true,
          })
          .click();
        await page.getByRole("listbox").waitFor();
        await page.keyboard.press("Escape");
        assert.match(await page.locator("#storybook-root").innerText(), /is closed/);
      }
    });
    await test(`combobox input filtering + controlled selection ${theme}`, async () => {
      await story("combo-box", "DefaultSelectedKey", theme);
      assert.equal(await page.locator("[data-slot=combo-box-input]").inputValue(), "Cat");
      await page.locator("[data-slot=combo-box-trigger]").click();
      await page.getByRole("option").first().waitFor();
      assert.equal(await page.getByRole("option").count(), 6);
      await story("combo-box", "Controlled", theme);
      const input = page.getByRole("combobox");
      await input.fill("bird");
      await page.getByRole("option", { name: "Bird", exact: true }).waitFor();
      assert.equal(await page.getByRole("option").count(), 1);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      assert.match(await page.locator("#storybook-root").innerText(), /Selected: Bird/);
      await story("combo-box", "ControlledInputValue", theme);
      await page.getByRole("combobox").fill("panda");
      assert.match(await page.locator("#storybook-root").innerText(), /Input value: panda/);
    });
    await test(`native chip removal ${theme}`, async () => {
      await story("combo-box", "MultipleSelectionControlled", theme);
      await page.locator("[data-slot=combo-box-input]").focus();
      await page.keyboard.press("Escape");
      await page.keyboard.press("ArrowLeft");
      assert.ok(
        await page
          .locator("[data-slot=combo-box-chip]")
          .last()
          .evaluate((element) => element === document.activeElement),
      );
      await page.keyboard.press("Backspace");
      assert.match(await page.locator("#storybook-root").innerText(), /Selected: cat/);
      await story("combo-box", "MultipleSelectionControlled", theme);
      await page.getByRole("button", { name: "Remove Cat", exact: true }).click();
      assert.match(await page.locator("#storybook-root").innerText(), /Selected: dog/);
      if (
        (await page.locator("[data-slot=combo-box-trigger]").getAttribute("aria-expanded")) !==
        "true"
      )
        await page.locator("[data-slot=combo-box-trigger]").click();
      await page.getByRole("option", { name: "Bird", exact: true }).click();
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "Remove Bird", exact: true }).waitFor();
    });
    await test(`focus/input/manual menu trigger ${theme}`, async () => {
      await story("combo-box", "MenuTrigger", theme);
      const inputs = page.locator("[data-slot=combo-box-input]");
      await inputs.nth(0).focus();
      await page.getByRole("listbox").waitFor();
      await page.keyboard.press("Escape");
      await page.locator("[data-slot=combo-box-popover]:visible").waitFor({ state: "hidden" });
      await inputs.nth(1).focus();
      assert.equal(await page.getByRole("listbox").count(), 0);
      await inputs.nth(1).fill("cat");
      await page.getByRole("option", { name: "Cat", exact: true }).waitFor();
      await page.keyboard.press("Escape");
      await page.locator("[data-slot=combo-box-popover]:visible").waitFor({ state: "hidden" });
      await inputs.nth(2).fill("dog");
      assert.equal(await page.getByRole("listbox").count(), 0);
      await page.keyboard.press("ArrowDown");
      await page.getByRole("option", { name: "Dog", exact: true }).waitFor();
    });
    await test(`native custom value Enter/blur/selection + named FormData ${theme}`, async () => {
      await story("combo-box", "AllowsCustomValue", theme);
      await page.evaluate(() => {
        const root = document.getElementById("storybook-root");
        const form = document.createElement("form");
        root.before(form);
        form.append(root);
      });
      const data = () =>
        page.locator("form").evaluate((form) => Object.fromEntries(new FormData(form)));
      const input = page.locator("[data-slot=combo-box-input]");
      await input.fill("Axolotl");
      await page.keyboard.press("Enter");
      assert.deepEqual(await data(), { animal: "Axolotl" });
      assert.equal(await input.inputValue(), "Axolotl");
      await input.fill("Capybara");
      await page.keyboard.press("Tab");
      assert.deepEqual(await data(), { animal: "Capybara" });
      await input.fill("cat");
      await page.getByRole("option", { name: "Cat", exact: true }).click();
      assert.deepEqual(await data(), { animal: "cat" });
      assert.equal(await input.inputValue(), "Cat");
    });
    await test(`clear value + focus + callback ${theme}`, async () => {
      await story("select", "WithClearButton", theme);
      await page.getByRole("button", { name: "Clear selection", exact: true }).click();
      assert.match(await page.locator("[data-slot=select-trigger]").innerText(), /Select one/);
      assert.ok(
        await page
          .locator("[data-slot=select-trigger]")
          .evaluate((element) => element === document.activeElement),
      );
      await story("autocomplete", "WithOnClearCallback", theme);
      await page.locator("[data-slot=autocomplete-trigger]").click();
      await page.getByRole("option", { name: "Cat", exact: true }).click();
      await page.getByRole("button", { name: "Clear selection", exact: true }).click();
      assert.match(
        await page.locator("#storybook-root").innerText(),
        /Clear button clicked: 1 time\(s\)/,
      );
      assert.match(await page.locator("#storybook-root").innerText(), /No selection/);
      await story("autocomplete", "Controlled", theme);
      await page.locator("[data-slot=autocomplete-trigger]").click();
      await page.locator("[data-slot=autocomplete-input]").fill("tex");
      await page.getByRole("button", { name: "Clear search", exact: true }).click();
      assert.match(await page.locator("#storybook-root").innerText(), /Selected: California/);
      assert.equal(await page.locator("[data-slot=autocomplete-input]").inputValue(), "");
    });
    await test(`source rich avatars + form/list geometry ${theme}`, async () => {
      await story("select", "CustomValue", theme);
      await page.locator("[data-slot=select-trigger]").click();
      await page.waitForFunction(() => {
        const images = [...document.querySelectorAll("[data-slot=select-popover] img")];
        return (
          images.length === 5 && images.every((image) => image.complete && image.naturalWidth > 0)
        );
      });
      await page.getByRole("option", { name: /Bob/ }).click();
      const avatar = page.locator("[data-slot=select-trigger] [data-slot=avatar]");
      assert.equal((await avatar.boundingBox()).width, 16);
      assert.equal((await avatar.boundingBox()).height, 16);
      for (const family of ["select", "combo-box", "autocomplete"]) {
        await story(family, "Required", theme);
        assert.equal((await page.locator("form").boundingBox()).width, 256);
      }
      await story("list-box", "WithSections", theme);
      assert.equal((await page.locator("[data-slot=surface]").boundingBox()).width, 256);
      assert.notEqual(
        await page
          .locator("[data-slot=surface]")
          .evaluate((element) => getComputedStyle(element).boxShadow),
        "none",
      );
    });
    await test(`autocomplete recipients + popup search ${theme}`, async () => {
      await story("autocomplete", "EmailRecipients", theme);
      await page.locator("[data-slot=autocomplete-trigger]").click();
      await page.locator("[data-slot=autocomplete-input]").fill("alice@");
      assert.equal(await page.getByRole("option").count(), 1);
      await page.getByRole("option").click();
      await page.getByRole("button", { name: "Remove alice@example.com", exact: true }).click();
      assert.equal(await page.locator("[data-slot=autocomplete-chip]").count(), 0);
    });
    await test(`groups + disabled options ${theme}`, async () => {
      for (const family of ["select", "combo-box", "autocomplete"]) {
        await story(family, "WithSections", theme);
        await page.locator(`[data-slot=${family}-trigger]`).click();
        await page.getByRole("option").first().waitFor();
        assert.equal(
          await page
            .getByRole("group")
            .filter({ has: page.getByRole("option") })
            .count(),
          3,
        );
        await story(family, "WithDisabledOptions", theme);
        await page.locator(`[data-slot=${family}-trigger]`).click();
        assert.equal(
          await page
            .getByRole("option", { name: "Cat", exact: true })
            .getAttribute("aria-disabled"),
          "true",
        );
        assert.equal(
          await page
            .getByRole("option", { name: "Kangaroo", exact: true })
            .getAttribute("aria-disabled"),
          "true",
        );
      }
    });
    await test(`required validation + FormData ${theme}`, async () => {
      for (const family of ["select", "combo-box", "autocomplete"]) {
        await story(family, "Required", theme);
        await page.getByRole("button", { name: "Submit", exact: true }).click();
        assert.equal(await page.locator("output").count(), 0);
        const triggers = page.locator(`[data-slot=${family}-trigger]`);
        const count = await triggers.count();
        for (let i = 0; i < count; i++) {
          if ((await triggers.nth(i).getAttribute("aria-expanded")) !== "true")
            await triggers.nth(i).click();
          await page.locator("[role=option]:visible").first().click();
          await page.locator(`[data-slot=${family}-popover]:visible`).waitFor({ state: "hidden" });
        }
        const data = await page
          .locator("form")
          .evaluate((form) => Object.fromEntries(new FormData(form)));
        assert.deepEqual(
          data,
          family === "combo-box" ? { animal: "aardvark" } : { state: "florida", country: "usa" },
        );
        await page.getByRole("button", { name: "Submit", exact: true }).click();
        await page.locator("output").waitFor();
      }
    });
    await test(`listbox selection + disabled action ${theme}`, async () => {
      await story("list-box", "Controlled", theme);
      const bob = page.getByRole("option", { name: /Bob/ });
      await checked(bob, true);
      await bob.focus();
      await page.keyboard.press("Space");
      await checked(bob, false);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Space");
      await checked(page.getByRole("option", { name: /Fred/ }), true);
      await story("list-box", "WithDisabledItems", theme);
      await page.getByRole("option", { name: /New file/ }).click();
      assert.match(await page.locator("output").innerText(), /new-file/);
      await page.getByRole("option", { name: /Delete file/ }).click({ force: true });
      assert.match(await page.locator("output").innerText(), /new-file/);
    });
    await test(`listbox offscreen keyboard + window bounds ${theme}`, async () => {
      await story("list-box", "Virtualization", theme);
      assert.ok((await page.getByRole("option").count()) < 30);
      await page.getByRole("option").first().focus();
      await page.keyboard.press("End");
      await page.waitForFunction(
        () => document.activeElement?.getAttribute("aria-posinset") === "1000",
      );
      assert.ok((await page.getByRole("listbox").evaluate((element) => element.scrollTop)) > 49000);
      await page.keyboard.press("Home");
      await page.waitForFunction(
        () => document.activeElement?.getAttribute("aria-posinset") === "1",
      );
    });
    await test(`autocomplete offscreen keyboard + filtering ${theme}`, async () => {
      await story("autocomplete", "Virtualization", theme);
      await page.locator("[data-slot=autocomplete-trigger]").click();
      const input = page.locator("[data-slot=autocomplete-input]");
      await input.focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("End");
      await page.waitForFunction(() => document.querySelector("[data-window-index='999']"));
      assert.ok((await page.getByRole("option").count()) < 30);
      await page.keyboard.press("Enter");
      assert.match(
        await page.locator("[data-slot=autocomplete-trigger]").innerText(),
        /Benjamin Martinez/,
      );
      await page.locator("[data-slot=autocomplete-trigger]").click();
      await input.fill("emma.smith");
      assert.equal(await page.getByRole("option").count(), 3);
    });
    await test(`mobile anchoring + opacity ancestors ${theme}`, async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      for (const family of ["select", "combo-box", "autocomplete"]) {
        await story(family, "Default", theme);
        const trigger = page.locator(`[data-slot=${family}-trigger]`);
        await trigger.click();
        const popup = page.locator(`[data-slot=${family}-popover]`);
        await popup.waitFor();
        await page.waitForTimeout(300);
        const a = await trigger.boundingBox();
        const b = await popup.boundingBox();
        report.geometry[`${family}/${theme}`] = {
          trigger: a,
          popup: b,
          background: await popup.evaluate((element) => getComputedStyle(element).backgroundColor),
        };
        assert.ok(b.x >= 0 && b.x + b.width <= 390 && Math.abs(b.y - (a.y + a.height)) < 40);
        const opacity = await trigger.evaluate((element) => {
          const values = [];
          for (let node = element; node; node = node.parentElement)
            values.push(getComputedStyle(node).opacity);
          return values;
        });
        assert.ok(
          opacity.every((value) => value === "1"),
          `${family}: ${opacity}`,
        );
        await story(family, "Disabled", theme);
        const ancestorOpacity = await page.locator("#storybook-root").evaluate((element) => {
          const values = [];
          for (let node = element; node; node = node.parentElement)
            values.push(getComputedStyle(node).opacity);
          return values;
        });
        assert.ok(
          ancestorOpacity.every((value) => value === "1"),
          `${family} disabled ancestor leak: ${ancestorOpacity}`,
        );
        await story(family, "FullWidth", theme);
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${family} FullWidth overflow`,
        );
      }
      await page.setViewportSize({ width: 1000, height: 800 });
    });
  }
  await test("genuine asynchronous cursor replay + query race", async () => {
    await story("combo-box", "AsynchronousLoading");
    await page.locator("[data-slot=combo-box-trigger]").click();
    await page.getByRole("option", { name: "Luke Skywalker", exact: true }).waitFor();
    const before = await page.getByRole("option").count();
    await page.locator("[data-slot=combo-box-list]").evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await page.waitForFunction(
      (before) => document.querySelectorAll("[role=option]").length > before,
      before,
    );
    const input = page.locator("[data-slot=combo-box-input]");
    await input.fill("Luke");
    await input.fill("Leia");
    await page.getByRole("option", { name: "Leia Organa", exact: true }).waitFor();
    await page.waitForTimeout(350);
    assert.equal(
      await page.getByRole("option", { name: "Luke Skywalker", exact: true }).count(),
      0,
    );
    await story("select", "AsynchronousLoading");
    await page.locator("[data-slot=select-trigger]").click();
    await page.getByRole("option", { name: "bulbasaur", exact: true }).waitFor();
    await page.locator("[data-slot=select-popover]").evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await page.getByRole("option", { name: "spearow", exact: true }).waitFor();
  });
  assert.equal(report.sourceExports, 64);
  assert.equal(report.mounts, 128);
  for (const family of ["select", "combo-box", "autocomplete"])
    assert.notEqual(
      report.geometry[`${family}/light`].background,
      report.geometry[`${family}/dark`].background,
    );
  assert.deepEqual(report.pageErrors, []);
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
  if (process.env.SELECTION_PROOF_OUTPUT)
    await writeFile(process.env.SELECTION_PROOF_OUTPUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
assert.deepEqual(report.failures, []);
