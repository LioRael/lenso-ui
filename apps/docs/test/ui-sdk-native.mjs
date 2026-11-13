import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium, webkit } from "playwright";
const root = fileURLToPath(new URL("../", import.meta.url));
const fixture = root + "test/ui-sdk-native-fixture.tsx";
let server;
try {
  server = await createServer({
    root,
    server: { port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "native-sdk-qa",
        configureServer(s) {
          s.middlewares.use(async (req, res, next) => {
            if (!req.url.startsWith("/__native-sdk-qa")) return next();
            try {
              const html = await s.transformIndexHtml(
                req.url,
                '<!doctype html><html><head><title>Forms QA</title><link rel="icon" href="data:,"><link rel="stylesheet" href="/src/styles/global.css"><link rel="stylesheet" href="/virtual:stylex.css"></head><body><div id="fixture"></div><script type="module" src="/test/' +
                  fixture.split("/").at(-1) +
                  '"></script></body></html>',
              );
              res.setHeader("content-type", "text/html");
              res.end(html);
            } catch (e) {
              next(e);
            }
          });
        },
      },
    ],
  });
  await server.listen();
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch(
      name === "chromium" && process.env.UI_SDK_CHROMIUM_CHANNEL
        ? { channel: process.env.UI_SDK_CHROMIUM_CHANNEL }
        : name === "webkit" && process.env.UI_SDK_WEBKIT_EXECUTABLE
          ? { executablePath: process.env.UI_SDK_WEBKIT_EXECUTABLE }
          : {},
    );
    try {
      const page = await browser.newPage({
        viewport: { width: 900, height: 1000 },
        reducedMotion: "reduce",
      });
      page.setDefaultTimeout(10000);
      const errors = [];
      page.on("pageerror", (e) => {
        errors.push(e.message);
        console.log("PAGE ERROR", e.message);
      });
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.goto(server.resolvedUrls.local[0] + "__native-sdk-qa", {
        timeout: 60000,
        waitUntil: "domcontentloaded",
      });
      await page
        .getByRole("button", { name: "Enable preferences", exact: true })
        .waitFor({ timeout: 60000 });
      for (const width of [900, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.getByRole("button", { name: "Actions", exact: true }).click();
        const parentMenu = page.getByRole("menu", { name: "Actions", exact: true });
        await page.waitForFunction(() => {
          const parent = document.querySelector('[data-lenso-slot="menu-popup"][data-open]');
          return parent && !parent.hasAttribute("data-menu-morphing");
        });
        const before = await parentMenu.boundingBox();
        const [frames] = await Promise.all([
          parentMenu.evaluate(async (parent) => {
            const frames = [];
            for (let frame = 0; frame < 60; frame++) {
              await new Promise(requestAnimationFrame);
              const { x, y, width, height } = parent.getBoundingClientRect();
              frames.push({ x, y, width, height });
            }
            return frames;
          }),
          page.getByRole("menuitem", { name: "Move item", exact: true }).click(),
        ]);
        await page.getByRole("menuitem", { name: "Archive item", exact: true }).waitFor();
        for (const frame of frames)
          for (const edge of ["x", "y", "width", "height"])
            assert.ok(
              Math.abs(frame[edge] - before[edge]) < 0.5,
              `${name} ${width}px: submenu changed parent ${edge}: ${before[edge]} → ${frame[edge]}`,
            );
        await page.keyboard.press("Escape");
        await page.keyboard.press("Escape");
        await parentMenu.waitFor({ state: "hidden" });
      }
      await page.setViewportSize({ width: 900, height: 1000 });
      const sidebarTrigger = page.getByRole("button", {
        name: "Toggle SDK navigation",
        exact: true,
      });
      await sidebarTrigger.click();
      assert.equal(await sidebarTrigger.getAttribute("aria-expanded"), "true");
      await sidebarTrigger.focus();
      await page.keyboard.press(name === "webkit" ? "Alt+Tab" : "Tab");
      assert.equal(
        await page.evaluate(() => document.activeElement.textContent),
        "Native sidebar link",
      );
      await page.keyboard.press("Escape");
      assert.equal(await sidebarTrigger.getAttribute("aria-expanded"), "false");
      assert.equal(
        await sidebarTrigger.evaluate((element) => document.activeElement === element),
        true,
      );
      await page.getByRole("button", { name: "Open sidebar externally", exact: true }).click();
      assert.equal(await sidebarTrigger.getAttribute("aria-expanded"), "true");
      const sidebarAgent = await page.evaluate(() =>
        window.sdkAgent
          .snapshot()
          .find((entry) => entry.component === "sidebar" && entry.label === "SDK navigation"),
      );
      assert.ok(sidebarAgent?.actions.includes("setOpen"));
      const sidebarAction = await page.evaluate(
        (ref) => window.sdkAgent.act({ steps: [{ ref, action: "setOpen", args: [false] }] }),
        sidebarAgent.ref,
      );
      assert.equal(sidebarAction.ok, true);
      await page
        .getByRole("complementary", { name: "SDK navigation panel" })
        .waitFor({ state: "hidden" });
      assert.equal(
        await sidebarTrigger.evaluate((element) => getComputedStyle(element).direction),
        "rtl",
      );
      assert.equal(await page.getByLabel("Nickname", { exact: true }).isDisabled(), true);
      assert.deepEqual(
        await page.evaluate(() => [...new FormData(document.querySelector("#settings")).entries()]),
        [],
      );
      await page.getByRole("button", { name: "Enable preferences" }).click();
      await page.getByLabel("Nickname", { exact: true }).fill("New name");
      await page.getByRole("radio", { name: "Basic", exact: true }).focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(
        await page.getByRole("radio", { name: "Pro", exact: true }).getAttribute("aria-checked"),
        "true",
      );
      assert.equal(
        await page.evaluate(() => new FormData(document.querySelector("#settings")).get("plan")),
        "pro",
      );
      const agentEntry = await page.evaluate(() =>
        window.sdkAgent.snapshot().find((e) => e.component === "switch" && e.label === "Sync"),
      );
      assert.ok(agentEntry);
      const agentResult = await page.evaluate(
        (ref) => window.sdkAgent.act({ steps: [{ ref, action: "setChecked", args: [false] }] }),
        agentEntry.ref,
      );
      assert.equal(agentResult.ok, true);
      await page.getByRole("button", { name: "Reset preferences" }).click();
      assert.equal(await page.getByLabel("Nickname", { exact: true }).inputValue(), "Leo");
      await page.getByRole("textbox", { name: "Quantity", exact: true }).focus();
      await page.keyboard.press("ArrowUp");
      assert.equal(
        await page.evaluate(() => new FormData(document.querySelector("#values")).get("quantity")),
        "3",
      );
      assert.equal(
        await page.evaluate(() => new FormData(document.querySelector("#values")).get("date")),
        "2026-11-13",
      );
      await page.getByRole("spinbutton", { name: /month/i }).press("ArrowUp");
      assert.equal(
        await page.evaluate(() => new FormData(document.querySelector("#values")).get("date")),
        "2026-12-13",
      );
      const colorInput = page.getByRole("textbox", { name: "Color", exact: true });
      await colorInput.fill("#FF0000");
      await colorInput.press("Tab");
      assert.equal(
        (
          await page.evaluate(() => new FormData(document.querySelector("#values")).get("color"))
        )?.toUpperCase(),
        "#FF0000",
      );
      const colorArea = page.locator("[data-lenso-slot=color-area]");
      await colorArea.click({ position: { x: 50, y: 50 } });
      await page.getByRole("slider", { name: "Volume" }).focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await page.getByRole("slider", { name: "Volume" }).inputValue(), "21");
      const sliderBoundary = page.locator("[data-slider-boundary]");
      const sliderTrack = sliderBoundary.locator('[data-lenso-slot="slider-track"]');
      await sliderTrack.scrollIntoViewIfNeeded();
      const trackBox = await sliderTrack.boundingBox();
      assert.ok(trackBox.width <= 200, "Field must not prevent the slider from shrinking");
      const thumb = sliderBoundary.locator('[data-lenso-slot="slider-thumb"]');
      const thumbBox = await thumb.boundingBox();
      await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
      await page.mouse.down();
      for (const percent of [0, 100, 0, 100, 50]) {
        await page.mouse.move(trackBox.x + (trackBox.width * percent) / 100, trackBox.y + 3, {
          steps: 30,
        });
        await page.waitForFunction(
          (value) => Number(document.querySelector('input[type="range"]')?.value) === value,
          percent,
        );
        assert.equal(
          Number(await page.getByRole("slider", { name: "Volume" }).inputValue()),
          percent,
        );
        const glass = await thumb.locator('[data-lenso-slot="slider-optical"]').boundingBox();
        const boundary = await sliderBoundary.boundingBox();
        assert.ok(
          glass.x >= boundary.x && glass.x + glass.width <= boundary.x + boundary.width,
          "The lifted thumb must remain visible at both endpoints",
        );
      }
      const heldGlass = await thumb.locator('[data-lenso-slot="slider-optical"]').boundingBox();
      const insideProgress = await page.screenshot({
        clip: {
          x: heldGlass.x + heldGlass.width * 0.25,
          y: heldGlass.y + heldGlass.height * 0.43,
          width: heldGlass.width * 0.2,
          height: heldGlass.height * 0.14,
        },
      });
      const bluePixels = await page.evaluate(async (base64) => {
        const bitmap = await createImageBitmap(
          await (await fetch(`data:image/png;base64,${base64}`)).blob(),
        );
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const context = canvas.getContext("2d");
        context.drawImage(bitmap, 0, 0);
        const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
        bitmap.close();
        let blue = 0;
        for (let i = 0; i < data.length; i += 4)
          if (data[i + 2] > data[i] + 35 && data[i + 2] > data[i + 1] * 1.1) blue++;
        return blue;
      }, insideProgress.toString("base64"));
      assert.ok(bluePixels > 3, "The progress remains visible inside the moved glass");
      await page.mouse.up();
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-slider-boundary] [data-lenso-slot="slider-thumb"]')
            .style.getPropertyValue("--lg-slider-face") === "1",
      );
      await page.getByRole("textbox", { name: "Verification code" }).fill("1234");
      assert.equal(
        await page
          .locator('[data-lenso-slot="input-otp-slot"]')
          .allTextContents()
          .then((v) => v.join("")),
        "1234",
      );
      const topics = page.getByRole("listbox", { name: "Topics", exact: true });
      await topics.getByRole("option", { name: "Mentions", exact: true }).click();
      assert.deepEqual(
        await page.evaluate(() =>
          new FormData(document.querySelector("#list-preferences")).getAll("topics"),
        ),
        ["comments", "mentions"],
      );
      await page.keyboard.press("ArrowDown");
      assert.equal(await page.evaluate(() => document.activeElement.textContent), "Reactions");
      await page.keyboard.press("Space");
      assert.equal(
        await topics
          .getByRole("option", { name: "Reactions", exact: true })
          .getAttribute("aria-selected"),
        "true",
      );
      await page.getByRole("button", { name: "Reset topics" }).click();
      await page.waitForFunction(
        () =>
          JSON.stringify(
            new FormData(document.querySelector("#list-preferences")).getAll("topics"),
          ) === JSON.stringify(["comments"]),
      );
      const listboxAgent = await page.evaluate(() =>
        window.sdkAgent
          .snapshot()
          .find((entry) => entry.component === "listbox" && entry.label === "Topics"),
      );
      assert.ok(listboxAgent?.actions.includes("setValue"));
      const listboxAction = await page.evaluate(
        (ref) =>
          window.sdkAgent.act({ steps: [{ ref, action: "setValue", args: [["mentions"]] }] }),
        listboxAgent.ref,
      );
      assert.equal(listboxAction.ok, true);
      assert.deepEqual(
        await page.evaluate(() =>
          new FormData(document.querySelector("#list-preferences")).getAll("topics"),
        ),
        ["mentions"],
      );
      const virtual = page.getByRole("listbox", { name: "Virtualized list with 1000 items" });
      assert.ok((await virtual.getByRole("option").count()) < 30);
      await virtual.getByRole("option").first().focus();
      await page.keyboard.press("End");
      await virtual.locator('[aria-posinset="1000"]').waitFor();
      assert.equal(
        await virtual.locator('[aria-posinset="1000"]').getAttribute("aria-selected"),
        "true",
      );
      assert.equal(
        await virtual.locator('[aria-posinset="1000"]').getAttribute("aria-setsize"),
        "1000",
      );
      await page.waitForFunction(
        () => document.activeElement?.getAttribute("aria-posinset") === "1000",
      );
      const asyncAction = page.getByRole("button", { name: "Async action", exact: true });
      await asyncAction.click();
      assert.equal(await asyncAction.getAttribute("aria-busy"), "true");
      await page.waitForFunction(
        () =>
          ![...document.querySelectorAll("button")]
            .find((button) => button.textContent === "Async action")
            ?.hasAttribute("data-pending"),
      );
      await page.getByRole("button", { name: "Actions", exact: true }).click();
      await page.getByRole("menuitem", { name: "Move item", exact: true }).focus();
      await page.keyboard.press("ArrowRight");
      await page.getByRole("menuitem", { name: "Archive item", exact: true }).waitFor();
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
      await page.getByText("Context target", { exact: true }).click({ button: "right" });
      await page.getByRole("menuitem", { name: "Inspect item" }).waitFor();
      await page.keyboard.press("Escape");
      await page.getByRole("menuitem", { name: "Inspect item" }).waitFor({ state: "hidden" });
      await page.getByRole("combobox", { name: "Fruit", exact: true }).click();
      await page.getByRole("option", { name: "Pear", exact: true }).click();
      assert.equal(
        await page
          .getByRole("combobox", { name: "Fruit", exact: true })
          .textContent()
          .then((s) => s.includes("Pear")),
        true,
      );
      await page.getByRole("combobox", { name: "Country", exact: true }).fill("Jap");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      assert.equal(
        await page.getByRole("combobox", { name: "Country", exact: true }).inputValue(),
        "Japan",
      );
      await page.getByRole("combobox", { name: "Search city", exact: true }).fill("Unlisted city");
      await page.keyboard.press("Tab");
      assert.equal(
        await page.getByRole("combobox", { name: "Search city", exact: true }).inputValue(),
        "Unlisted city",
      );
      for (const [trigger, title, close] of [
        ["Open modal", "Edit profile", "Done editing"],
        ["Delete file", "Delete document?", "Keep document"],
        ["Show details", "Details", "Close details"],
      ]) {
        await page.getByRole("button", { name: trigger, exact: true }).click();
        await page.getByRole("heading", { name: title, exact: true }).waitFor();
        if (title === "Details")
          assert.equal(
            await page
              .locator('[data-lenso-slot="popover-popup"]')
              .evaluate((node) => getComputedStyle(node).colorScheme),
            "dark",
          );
        await page.getByRole("button", { name: close, exact: true }).click();
        await page.waitForFunction((t) => document.activeElement?.textContent === t, trigger);
      }
      await page.getByRole("button", { name: "Help control" }).hover();
      await page.getByRole("tooltip").waitFor();
      await page.keyboard.press("Escape");
      await page.getByRole("tooltip").waitFor({ state: "hidden" });
      await page.getByRole("button", { name: "Open drawer", exact: true }).click();
      await page.getByRole("heading", { name: "Settings drawer" }).waitFor();
      await page.getByRole("button", { name: "Close drawer", exact: true }).click();
      await page.getByRole("heading", { name: "Settings drawer" }).waitFor({ state: "hidden" });
      await page.waitForFunction(() => document.activeElement?.textContent === "Open drawer");
      await page.getByRole("button", { name: "Open sheet", exact: true }).click();
      await page.getByRole("heading", { name: "Review sheet" }).waitFor();
      const handle = page.getByRole("button", { name: "Resize sheet" });
      await handle.focus();
      await page.keyboard.press("End");
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-lenso-slot="sheet-popup"]')
            ?.getAttribute("data-snap-point") === "1",
      );
      await handle.click();
      await page.waitForFunction(
        () =>
          document
            .querySelector("[data-lenso-slot=sheet-popup]")
            ?.getAttribute("data-snap-point") !== "1",
      );
      await handle.focus();
      await page.keyboard.press("End");
      await page.waitForFunction(
        () =>
          document
            .querySelector("[data-lenso-slot=sheet-popup]")
            ?.getAttribute("data-snap-point") === "1",
      );
      await page.waitForFunction(() => {
        const node = document.querySelector("[data-lenso-slot=sheet-popup]");
        return (
          node && parseFloat(getComputedStyle(node).getPropertyValue("--drawer-progress")) > 0.999
        );
      });
      await page.getByRole("button", { name: "Close sheet", exact: true }).click();
      await page.getByRole("heading", { name: "Review sheet" }).waitFor({ state: "hidden" });
      await page.getByRole("button", { name: "Notify", exact: true }).click();
      await page.waitForFunction(() => {
        const node = document.querySelector("[data-lenso-slot=toast]");
        if (!node || node.hasAttribute("data-starting-style")) return false;
        const rect = node.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= innerHeight + 1;
      });
      const toastRect = await page.locator("[data-lenso-slot=toast]").boundingBox();
      assert.ok(
        toastRect &&
          toastRect.x >= 0 &&
          toastRect.x + toastRect.width <= 900 &&
          toastRect.y >= 0 &&
          toastRect.y + toastRect.height <= 1001,
      );
      await page.getByRole("button", { name: "Undo save", exact: true }).click();
      assert.equal(await page.locator("body").getAttribute("data-undo"), "yes");
      assert.deepEqual(errors, []);
      console.log(name, "PASS", browser.version());
      await page.close();
    } finally {
      await browser.close();
    }
  }
} finally {
  await server?.close();
}
