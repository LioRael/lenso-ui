import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        colorScheme: theme,
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/en/docs/react/components/input`);
      await page.evaluate(async (theme) => {
        const { mount } = await import("/test/native-editor-rim-fixture.tsx");
        for (const node of document.body.children)
          if (node instanceof HTMLElement) node.hidden = true;
        const host = document.createElement("div");
        host.id = "native-editor-rim-fixture";
        document.body.append(host);
        mount(host, theme);
      }, theme);
      const input = page.getByRole("textbox", { name: "Native input", exact: true });
      const editor = page.getByRole("textbox", { name: "Native editor", exact: true });
      const button = (label) => page.getByRole("button", { name: label, exact: true });
      const inspect = async (field) =>
        field.evaluate((field) => {
          const output = field.nextElementSibling;
          const canvas = output?.querySelector("[data-lenso-live-rim]");
          const box = field.getBoundingClientRect(),
            rim = output?.getBoundingClientRect();
          const pixels = canvas
            ?.getContext("2d")
            .getImageData(0, Math.floor(canvas.height / 2), 4, 1).data;
          return {
            native: field.tagName,
            childCanvas: field.querySelector("canvas") !== null,
            decorated: field.hasAttribute("data-material-live-rim"),
            hidden: output?.getAttribute("aria-hidden"),
            pointer: output && getComputedStyle(output).pointerEvents,
            aligned:
              rim &&
              ["left", "top", "width", "height"].every((key) => Math.abs(rim[key] - box[key]) < 1),
            geometry:
              canvas &&
              Math.abs(canvas.width / 2 - 2 - field.offsetWidth) <= 1 &&
              Math.abs(canvas.height / 2 - 2 - field.offsetHeight) <= 1,
            painted: pixels && [...pixels].some((value, i) => i % 4 === 3 && value > 0),
          };
        });
      for (const field of [input, editor]) {
        await field.waitFor();
        await page.waitForFunction(
          (field) => field.hasAttribute("data-material-live-rim"),
          await field.elementHandle(),
        );
        const state = await inspect(field);
        assert.equal(state.childCanvas, false);
        assert.equal(state.hidden, "true");
        assert.equal(state.pointer, "none");
        assert.ok(state.aligned && state.geometry && state.painted, JSON.stringify(state));
      }
      await button("Focus input").click();
      assert.equal(
        await input.evaluate(
          (field) => field === document.activeElement && field instanceof HTMLInputElement,
        ),
        true,
      );
      await input.fill("alpha beta gamma");
      await page.keyboard.press("End");
      await page.keyboard.press("Shift+ArrowLeft");
      await page.keyboard.type("!");
      assert.equal(await input.inputValue(), "alpha beta gamm!");
      await input.scrollIntoViewIfNeeded();
      const inputBox = await input.boundingBox();
      await page.mouse.move(inputBox.x + 19, inputBox.y + inputBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(inputBox.x + 95, inputBox.y + inputBox.height / 2, { steps: 8 });
      await page.mouse.up();
      await page.waitForFunction(
        (field) => field.selectionEnd > field.selectionStart,
        await input.elementHandle(),
      );
      await button("Focus editor").click();
      assert.equal(
        await editor.evaluate(
          (field) => field === document.activeElement && field instanceof HTMLTextAreaElement,
        ),
        true,
      );
      await editor.fill("first line\nsecond line\nthird line");
      await page.keyboard.press("ControlOrMeta+A");
      assert.equal(
        await editor.evaluate((field) => field.selectionEnd - field.selectionStart),
        (await editor.inputValue()).length,
      );
      await editor.evaluate((field) => field.setSelectionRange(2, 9));
      await button("Change shape").click();
      await page.waitForTimeout(80);
      await button("Change shape").click();
      await page.waitForTimeout(400);
      assert.deepEqual(
        await editor.evaluate((field) => [field.selectionStart, field.selectionEnd]),
        [2, 9],
      );
      for (const field of [input, editor]) {
        const state = await inspect(field);
        assert.ok(state.aligned && state.geometry && state.painted, JSON.stringify(state));
      }
      await page.locator("[data-editor-scroll]").evaluate((node) => {
        node.scrollTop = 35;
      });
      await page.waitForTimeout(100);
      assert.equal((await inspect(editor)).aligned, true);
      await editor.scrollIntoViewIfNeeded();
      const before = await editor.boundingBox();
      await page.mouse.move(before.x + before.width - 4, before.y + before.height - 4);
      await page.mouse.down();
      await page.mouse.move(before.x + before.width - 4, before.y + before.height + 40, {
        steps: 12,
      });
      await page.mouse.up();
      await page.waitForTimeout(300);
      const after = await editor.boundingBox();
      assert.ok(after.height > before.height + 20, JSON.stringify({ before, after }));
      assert.equal((await inspect(editor)).aligned, true);
      await button("Toggle read only").click();
      assert.equal(await editor.evaluate((field) => field.readOnly), true);
      await editor.focus();
      const value = await editor.inputValue();
      await page.keyboard.type("ignored");
      assert.equal(await editor.inputValue(), value);
      await button("Toggle read only").click();
      await button("Submit values").click();
      const submitted = JSON.parse(await page.getByLabel("Submitted values").textContent());
      assert.deepEqual(submitted, {
        title: await input.inputValue(),
        body: await editor.inputValue(),
      });
      await button("Toggle glass").click();
      await page.waitForFunction(
        () => !document.querySelector("#native-editor-rim-fixture [data-lenso-editor-rim]"),
      );
      await button("Toggle glass").click();
      for (const field of [input, editor]) {
        await field.scrollIntoViewIfNeeded();
        await page.waitForFunction(
          (field) => field.hasAttribute("data-material-live-rim"),
          await field.elementHandle(),
        );
      }
      await page.waitForFunction(
        () =>
          document.querySelectorAll("#native-editor-rim-fixture [data-lenso-editor-rim] canvas")
            .length === 2,
      );
      assert.deepEqual(errors, []);
      console.log(
        `PASS ${name}/${theme}: external rim, typing, refs, selection, resize, scroll, read-only, form and cleanup`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
