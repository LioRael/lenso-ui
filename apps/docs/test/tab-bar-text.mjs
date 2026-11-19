import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4311";
const artifacts = process.env.BROWSER_ARTIFACTS;
const locale = process.env.LOCALE ?? "en";
if (artifacts) await mkdir(artifacts, { recursive: true });
for (const [name, engine] of Object.entries({ webkit, chromium })) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue;
  const browser = await engine.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-webgl"] } : {},
  );
  try {
    const page = await browser.newPage({
      viewport: { width: Number(process.env.WIDTH ?? 1280), height: 1000 },
      deviceScaleFactor: Number(process.env.DPR ?? 2),
      colorScheme: process.env.THEME ?? "light",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript((theme) => {
      localStorage.setItem("theme", theme);
      window.textFrames = [];
      window.textDecodes = 0;
      window.glyphUploads = [];
      const upload = WebGL2RenderingContext.prototype.texSubImage2D;
      WebGL2RenderingContext.prototype.texSubImage2D = function (...args) {
        if (this.canvas.hasAttribute("data-tab-bar-text-canvas")) {
          window.glyphUploads.push({ x: args[2], width: args[6].width, row: this.canvas.width });
        }
        return upload.apply(this, args);
      };
      const decode = HTMLImageElement.prototype.decode;
      HTMLImageElement.prototype.decode = function () {
        if (this.src.includes("tab-bar-highlight-centre-row")) window.textDecodes++;
        return decode.call(this);
      };
      const draw = WebGL2RenderingContext.prototype.drawArrays;
      WebGL2RenderingContext.prototype.drawArrays = function (...args) {
        draw.apply(this, args);
        if (!this.canvas.hasAttribute("data-tab-bar-text-canvas")) return;
        const pixels = new Uint8Array(this.drawingBufferWidth * this.drawingBufferHeight * 4);
        this.readPixels(
          0,
          0,
          this.drawingBufferWidth,
          this.drawingBufferHeight,
          this.RGBA,
          this.UNSIGNED_BYTE,
          pixels,
        );
        let hash = 2166136261,
          covered = 0,
          red = 0;
        for (let i = 0; i < pixels.length; i++) {
          hash = Math.imul(hash ^ pixels[i], 16777619);
          if (i % 4 === 3 && pixels[i]) {
            covered++;
            if (pixels[i - 3] > pixels[i - 2] + 20 && pixels[i - 3] > pixels[i - 1] + 20) red++;
          }
        }
        window.textFrames.push({
          hash,
          covered,
          red,
          time: performance.now(),
          uploads: window.glyphUploads.length,
        });
      };
    }, process.env.THEME ?? "light");
    if (process.env.NO_GPU === "1")
      await page.addInitScript(() => {
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
          return kind === "webgl2" ? null : getContext.call(this, kind, ...args);
        };
      });
    await page.goto(`${base}/${locale}/docs/react/components/tab-bar`);
    const nav = page
      .getByRole("navigation", {
        name: locale === "cn" ? "主导航" : "Main navigation",
        exact: true,
      })
      .first();
    await nav.locator("[data-indicator-ready]").first().waitFor();
    if (process.env.LAYOUT === "tablet") {
      await page.getByRole("combobox", { name: "layout", exact: true }).click();
      await page.getByRole("option", { name: "tablet", exact: true }).click();
    }
    const preview = nav.locator("..");
    const toggle = preview.getByRole("button", { name: "GPU text refraction", exact: true });
    assert.equal(await toggle.count(), 1, "the real TabBar exposes a text-only A/B switch");
    await toggle.click();
    const canvas = nav.locator("canvas[data-tab-bar-text-canvas]");
    if (process.env.NO_GPU === "1") {
      await preview.getByText(/SVG fallback/).waitFor();
      await nav.locator("[data-tab-bar-list] a").nth(1).click();
      assert.equal(await canvas.count(), 0);
      assert.deepEqual(errors, []);
      console.log(`${name}: missing-WebGL2 fallback remains navigable`);
      continue;
    }
    await canvas.waitFor({ state: "attached" });
    const cold = await canvas.getAttribute("data-preparation-ms");
    const decoded = await page.evaluate(() => window.textDecodes);
    await toggle.click();
    await canvas.waitFor({ state: "detached" });
    await toggle.click();
    await canvas.waitFor({ state: "attached" });
    const warm = await canvas.getAttribute("data-preparation-ms");
    const warmDecodes = (await page.evaluate(() => window.textDecodes)) - decoded;
    console.log(`${name}: cold ${cold} ms, warm ${warm} ms, warm decodes ${warmDecodes}`);
    assert(decoded > 0, "the cold path decoded a real glyph image");
    assert.equal(warmDecodes, 0, "unchanged text does not decode again on GPU re-enable");
    const group = nav.locator("[data-tab-bar-group]").first();
    await group.evaluate(async (node) => {
      const optics = node.querySelector("[data-tab-bar-text-gpu]");
      let changes = 0;
      const watch = new MutationObserver((records) => (changes += records.length));
      watch.observe(optics, { attributes: true, attributeFilter: ["data-tab-bar-text-gpu"] });
      node.parentElement.classList.add("unrelated-class-for-optics-test");
      for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame);
      watch.disconnect();
      if (changes) throw Error("Unchanged ancestor paint released GPU ownership");
    });
    const links = group.locator("[data-tab-bar-list] [data-tab-bar-destination]");
    const capture = async (state) => {
      if (!artifacts) return;
      if (state !== "drag") await page.waitForTimeout(400);
      const box = await preview.boundingBox();
      const x = Math.max(0, box.x - 12),
        y = Math.max(0, box.y - 12);
      await page.screenshot({
        path: `${artifacts}/${name}-${state}.png`,
        clip: {
          x,
          y,
          width: Math.min(page.viewportSize().width - x, box.x + box.width + 12 - x),
          height: Math.min(page.viewportSize().height - y, box.y + box.height + 12 - y),
        },
      });
    };
    await capture("rest");
    const from = await links.first().boundingBox();
    const to = await links.nth(2).boundingBox();
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(150);
    for (let step = 1; step <= 12; step++) {
      await page.mouse.move(
        from.x + from.width / 2 + ((to.x - from.x) * step) / 24,
        from.y + from.height / 2,
      );
      await page.waitForTimeout(20);
    }
    assert.equal(await group.getAttribute("data-highlight-active"), "");
    assert.equal(
      await nav
        .locator("[data-tab-bar-text-gpu]")
        .evaluate((node) => getComputedStyle(node).filter),
      "none",
      "GPU text is not filtered a second time by the SVG lens",
    );
    await capture("drag");
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
    await page.mouse.up();
    const optics = await page.evaluate(() => ({
      frames: window.textFrames.length,
      distinct: new Set(window.textFrames.map((frame) => frame.hash)).size,
      covered: Math.max(...window.textFrames.map((frame) => frame.covered)),
    }));
    assert(
      optics.frames > 8 && optics.distinct > 8 && optics.covered > 50,
      `actual glyph pixels must change during real input: ${JSON.stringify(optics)}`,
    );
    await page.waitForFunction(() => {
      const group = document.querySelector("[data-tab-bar-group]");
      return !group.hasAttribute("data-highlight-active");
    });
    assert.equal(await links.nth(2).getAttribute("aria-current"), "page");
    await links.nth(1).focus();
    await page.keyboard.press("Enter");
    assert.equal(await links.nth(1).getAttribute("aria-current"), "page");
    const expand = locale === "cn" ? "展开导航" : "Expand navigation";
    await preview
      .getByRole("button", {
        name: locale === "cn" ? "收起导航" : "Minimize navigation",
        exact: true,
      })
      .click();
    await nav.getByRole("button", { name: expand, exact: true }).waitFor();
    await capture("minimized");
    await nav.getByRole("button", { name: expand, exact: true }).click();
    await canvas.waitFor({ state: "attached" });
    await capture("expanded");
    await links.first().click();
    await page.waitForFunction(
      () => !document.querySelector("[data-tab-bar-group][data-highlight-active]"),
    );
    await canvas.waitFor({ state: "attached" });
    await group.evaluate((node) => {
      window.previousTextCanvas = node.querySelector("[data-tab-bar-text-canvas]");
    });
    const label = links.first().locator("[data-tab-bar-content]").last();
    await label.evaluate((node) => {
      // Same geometry, different paint: a stale texture cannot pass.
      window.editStarted = performance.now();
      node.style.color = "rgb(213, 47, 83)";
    });
    await page.waitForFunction(() => window.textFrames.at(-1).red > 10);
    assert(await canvas.evaluate((node) => node === window.previousTextCanvas));
    console.log(
      `${name}: same-size paint to changed pixels ${await page.evaluate(() => window.textFrames.at(-1).time - window.editStarted)} ms`,
    );
    await capture("edited");
    await label.evaluate((node) => {
      node.style.removeProperty("color");
    });
    await page.waitForFunction(() => window.textFrames.at(-1).red < 10);
    await links.nth(1).press("Enter");
    await page.waitForFunction(
      () => !document.querySelector("[data-tab-bar-group][data-highlight-active]"),
    );
    await canvas.waitFor({ state: "attached" });
    await links
      .nth(1)
      .locator("[data-tab-bar-content]")
      .last()
      .evaluate((node) => {
        window.glyphUploads = [];
        const watch = new MutationObserver(() => {
          window.labelEdit = {
            baseline: window.textFrames.at(-1).hash,
            started: performance.now(),
          };
          watch.disconnect();
        });
        watch.observe(node, { childList: true, characterData: true, subtree: true });
      });
    await preview
      .getByRole("button", { name: locale === "cn" ? "改名为资料室" : "Change Library label" })
      .click();
    await page.waitForFunction(() => window.glyphUploads.length > 0);
    const [tile] = await page.evaluate(() => window.glyphUploads);
    if (process.env.LAYOUT !== "tablet") {
      assert(
        tile.x > 0 && tile.width < tile.row,
        `a stable relabel uploads only its destination strip: ${JSON.stringify(tile)}`,
      );
    }
    const first = await page.waitForFunction(() => {
      const { baseline, started } = window.labelEdit;
      const frame = window.textFrames.find(
        (frame) => frame.time >= started && frame.uploads && frame.hash !== baseline,
      );
      return frame && { ms: frame.time - started, hash: frame.hash };
    });
    console.log(
      `${name}: label mutation to first new GPU pixels ${JSON.stringify(await first.jsonValue())}`,
    );
    await capture("relabeled");
    const stripHash = await page.evaluate(() => window.textFrames.at(-1).hash);
    await toggle.click();
    await canvas.waitFor({ state: "detached" });
    await toggle.click();
    await canvas.waitFor({ state: "attached" });
    assert.equal(
      await page.evaluate(() => window.textFrames.at(-1).hash),
      stripHash,
      "rebuilding the whole row yields the same rendered pixels as the retained glyph texture",
    );
    const rowWidth = await canvas.evaluate((node) => node.width);
    await page.setViewportSize({ ...page.viewportSize(), width: 345 });
    await page.waitForFunction((width) => {
      const canvas = document.querySelector("[data-tab-bar-text-canvas]");
      return canvas && canvas.width !== width;
    }, rowWidth);
    await preview.getByText(/full glyph row/).waitFor();
    await capture("reflow");
    await canvas.evaluate((node) =>
      node.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext(),
    );
    await page.waitForFunction(() => !document.querySelector("[data-tab-bar-text-gpu]"));
    await links.first().click();
    assert.equal(await links.first().getAttribute("aria-current"), "page");
    await page.waitForFunction(
      () => !document.querySelector("[data-tab-bar-group][data-highlight-active]"),
    );
    await capture("fallback");
    await toggle.click();
    assert.equal(await canvas.count(), 0);
    assert.deepEqual(errors, []);
    console.log(
      `${name}: real TabBar drag, pixel updates ${JSON.stringify(optics)}, selection, keyboard, minimize/expand, changed labels and context-loss fallback passed`,
    );
  } finally {
    await browser.close();
  }
}
