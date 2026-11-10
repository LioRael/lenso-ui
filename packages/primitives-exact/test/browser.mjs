import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { buildExample } from "../scripts/example.ts";

const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const { dist } = await buildExample();
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request) {
    const url = new URL(request.url);
    const file = path.resolve(dist, url.pathname === "/" ? "index.html" : url.pathname.slice(1));
    if (!file.startsWith(`${dist}/`)) return new Response("Forbidden", { status: 403 });
    return (await Bun.file(file).exists())
      ? new Response(Bun.file(file))
      : new Response("Not found", { status: 404 });
  },
});

try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      await page.goto(server.url.href);
      const control = (id) => page.getByTestId(id);
      const focused = (id) => control(id).evaluate((node) => node === document.activeElement);
      assert.equal(await page.getByRole("group", { name: "Profile", exact: true }).count(), 1);
      assert.equal(await page.getByRole("textbox", { name: "Name", exact: true }).count(), 1);
      assert.equal(await control("name").getAttribute("aria-describedby"), "name-hint name-error");
      assert.equal(await control("name-error").getAttribute("role"), "status");
      assert.equal(await control("name").getAttribute("aria-invalid"), "true");
      await control("name").fill("Ada");
      await control("name").press("Enter");
      assert.equal(await control("committed").textContent(), "Ada");
      assert.equal(await control("name").getAttribute("aria-invalid"), "false");
      assert.equal(await control("name-error").textContent(), "");
      await control("name").evaluate((node) => node.setSelectionRange(1, 3));
      assert.deepEqual(
        await control("name").evaluate((node) => [node.selectionStart, node.selectionEnd]),
        [1, 3],
      );
      await control("readonly").click();
      await control("name").press("End");
      await control("name").press("X");
      assert.equal(await control("name").inputValue(), "Ada");
      assert.equal(await control("notes").evaluate((node) => node.readOnly), true);
      await control("readonly").click();
      await control("notes").fill("Native editor");
      await control("subscribe").press("Space");
      assert.equal(await control("subscribe").isChecked(), true);
      await control("notifications").press("Space");
      assert.equal(await control("notifications").isChecked(), true);
      await control("free").focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await control("pro").isChecked(), true);
      await control("region").selectOption("us");
      assert.equal(await control("region").inputValue(), "us");
      assert.equal(await control("region").locator('option[value="locked"]').isDisabled(), true);
      await control("volume").focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await control("volume").inputValue(), "30");
      assert.equal(await control("progress").getAttribute("value"), "30");
      await control("increment").press("Space");
      assert.equal(await control("count").textContent(), "Count: 1");
      await control("pin").click();
      assert.equal(await control("pin").getAttribute("aria-pressed"), "true");
      await control("disable").click();
      for (const id of [
        "increment",
        "pin",
        "name",
        "notes",
        "subscribe",
        "notifications",
        "free",
        "pro",
        "region",
        "volume",
        "details-trigger",
        "first-trigger",
        "open-dialog",
        "open-menu",
      ]) {
        assert.equal(await control(id).isDisabled(), true, `${id} disabled`);
      }
      await control("increment").evaluate((node) => node.click());
      assert.equal(await control("count").textContent(), "Count: 1");
      await control("disable").click();
      await control("visibility").click();
      assert.equal(await control("name").count(), 0);
      await control("visibility").click();
      assert.equal(await control("name").inputValue(), "Ada");
      assert.equal(await control("notes").inputValue(), "Native editor");
      assert.equal(await control("pin").getAttribute("aria-pressed"), "true");

      assert.equal(await control("details-panel").isVisible(), false);
      await control("details-trigger").press("Space");
      assert.equal(await control("details-panel").isVisible(), true);
      assert.equal(await control("details-trigger").getAttribute("aria-controls"), "details-panel");
      assert.equal(
        await control("details-panel").getAttribute("aria-labelledby"),
        "details-trigger",
      );
      await control("details-trigger").press("Space");
      await control("details-trigger").press("Tab");
      assert.equal(await focused("details-action"), false);
      await control("first-trigger").click();
      await control("second-trigger").click();
      assert.equal(await control("first-panel").isVisible(), false);
      assert.equal(await control("second-panel").isVisible(), true);
      await control("multiple").click();
      await control("first-trigger").click();
      await control("second-trigger").click();
      assert.equal(await control("first-panel").isVisible(), true);
      assert.equal(await control("second-panel").isVisible(), true);
      assert.equal(await control("locked-trigger").isDisabled(), true);

      await control("profile-tab").focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await focused("settings-tab"), true);
      assert.equal(await control("profile-tab").getAttribute("aria-selected"), "true");
      await page.keyboard.press("Space");
      assert.equal(await control("settings-tab").getAttribute("aria-selected"), "true");
      assert.equal(await control("profile-panel").isVisible(), false);
      assert.equal(await control("settings-panel").isVisible(), true);
      assert.equal(await control("settings-panel").getAttribute("aria-labelledby"), "settings-tab");

      await control("open-dialog").focus();
      await control("open-dialog").press("Space");
      assert.equal(
        await page.getByRole("dialog", { name: "Edit profile", exact: true }).isVisible(),
        true,
      );
      assert.equal(await control("edit-dialog").evaluate((node) => node.matches(":modal")), true);
      await control("increment").evaluate((node) => node.focus());
      assert.equal(await focused("increment"), false);
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        // Native Tab can visit browser chrome; background app controls remain inert.
        assert.equal(
          await control("edit-dialog").evaluate(
            (node) =>
              document.activeElement === document.body || node.contains(document.activeElement),
          ),
          true,
        );
      }
      await page.keyboard.press("Escape");
      assert.equal(await control("edit-dialog").isVisible(), false);
      assert.equal(await focused("open-dialog"), true);
      await control("open-dialog").press("Space");
      await control("close-dialog").click();
      assert.equal(await focused("open-dialog"), true);
      await control("open-alert").focus();
      await control("open-alert").press("Space");
      assert.equal(
        await page.getByRole("alertdialog", { name: "Increment count?", exact: true }).isVisible(),
        true,
      );
      await control("cancel").click();
      assert.equal(await control("count").textContent(), "Count: 1");
      await control("open-alert").press("Space");
      await control("confirm").click();
      assert.equal(await control("count").textContent(), "Count: 2");
      assert.equal(await focused("open-alert"), true);

      await control("open-popover").click();
      assert.equal(await control("info").isVisible(), true);
      await control("close-popover").click();
      assert.equal(await control("info").isVisible(), false);
      await control("open-menu").click();
      assert.equal(await control("actions").isVisible(), true);
      await control("menu-increment").focus();
      await page.keyboard.press("ArrowDown");
      assert.equal(await focused("more-actions"), true);
      await page.keyboard.press("Escape");
      assert.equal(await control("actions").isVisible(), false);
      await control("open-menu").click();
      await control("menu-increment").click();
      assert.equal(await control("actions").isVisible(), false);
      assert.equal(await control("count").textContent(), "Count: 3");
      await control("open-menu").click();
      await control("more-actions").click();
      await control("more-menu").waitFor({ state: "visible" });
      assert.equal(await control("more-menu").isVisible(), true);
      await control("nested-increment").click();
      assert.equal(await control("count").textContent(), "Count: 4");
      assert.equal(await control("actions").isVisible(), false);
      const ids = await page.locator("[id]").evaluateAll((nodes) => nodes.map((node) => node.id));
      assert.deepEqual(
        ids.filter((id, index) => ids.indexOf(id) !== index),
        [],
        "unique IDs",
      );
      for (const width of [390, 820]) {
        await page.setViewportSize({ width, height: 844 });
        for (const colorScheme of ["light", "dark"]) {
          await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            true,
          );
        }
      }
      assert.deepEqual(errors, []);
      console.log(
        `${name} ${browser.version()}: native controls, keyboard, associations, overlays, tabs, remounting and layout passed`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop(true);
}
