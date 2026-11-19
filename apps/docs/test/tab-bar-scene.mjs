import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4311";
const artifacts = process.env.BROWSER_ARTIFACTS;
const theme = process.env.THEME ?? "light";
const width = Number(process.env.WIDTH ?? 1280);
const gpu = process.env.NO_GPU !== "1";
const snapshot = '[data-glass-backdrop-snapshot][data-glass-renderer="scene"]';
if (artifacts) await mkdir(artifacts, { recursive: true });

for (const [name, engine] of Object.entries({ webkit, chromium })) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue;
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      deviceScaleFactor: Number(process.env.DPR ?? 2),
      colorScheme: theme,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(
      ({ theme, gpu }) => {
        localStorage.setItem("theme", theme);
        if (!gpu) {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
            return kind === "webgl2" ? null : original.call(this, kind, ...args);
          };
        }
      },
      { theme, gpu },
    );
    await page.goto(`${base}/en/docs/react/components/tab-bar`);
    const nav = page.getByRole("navigation", { name: "Main navigation", exact: true }).first();
    await nav.locator("[data-indicator-ready][data-minimize-ready]").waitFor();
    if (process.env.LAYOUT === "tablet") {
      await page.getByRole("combobox", { name: "layout", exact: true }).click();
      await page.getByRole("option", { name: "tablet", exact: true }).click();
    }
    await nav.scrollIntoViewIfNeeded();
    const capture = async (state) => {
      if (!artifacts) return;
      const box = await nav
        .locator("xpath=ancestor::*[@data-playground-activity][1]")
        .boundingBox();
      const x = Math.max(0, box.x - 24),
        y = Math.max(0, box.y - 24);
      await page.screenshot({
        path: `${artifacts}/tab-bar-${name}-${theme}-${width}-${state}.png`,
        clip: {
          x,
          y,
          width: Math.min(width - x, box.x + box.width + 24 - x),
          height: Math.min(1000 - y, box.y + box.height + 24 - y),
        },
      });
    };
    await nav.evaluate((node) => {
      const host = node.parentElement;
      host.style.position = "relative";
      const band = document.createElement("div");
      band.dataset.tabBarTestBackdrop = "";
      // A stationary optical reference, independent of the navigation's shrinking row height.
      band.style.cssText =
        "position:absolute;top:-30px;left:-8px;right:-8px;height:150px;pointer-events:none;z-index:-1;background:linear-gradient(110deg,#bbd9ed 0%,#bbd9ed 20%,#ea9d55 20%,#ea9d55 40%,#f6efdf 40%,#f6efdf 60%,#8eb3c9 60%,#8eb3c9 80%,#f6efdf 80%,#f6efdf 100%)";
      host.prepend(band);
      const distant = document.createElement("div");
      distant.id = "tab-bar-distant-input";
      distant.textContent = "Outside captured pixels";
      distant.style.cssText = "position:fixed;top:5000px;left:0;width:100px;height:50px";
      node.closest("#nd-notebook-layout").append(distant);
    });
    const groups = nav.locator("[data-tab-bar-group]");
    const group = groups.first();
    const links = group.locator("[data-tab-bar-list] [data-tab-bar-destination]");
    const capsules = process.env.LAYOUT === "tablet" ? 1 : 2;
    if (name === "webkit" && gpu) {
      await nav
        .locator(snapshot)
        .nth(capsules - 1)
        .waitFor({ state: "attached", timeout: 15000 });
      assert.equal(
        await nav.locator(snapshot).count(),
        capsules,
        "all navigation capsules use GPU optics",
      );
      assert(
        await group.evaluate(async (node) => {
          const surface = node.querySelector('[data-glass-renderer="scene"]');
          document.getElementById("tab-bar-distant-input").textContent = "Unrelated text edit";
          await new Promise((resolve) => setTimeout(resolve, 0));
          return surface.isConnected;
        }),
        "a previously culled subtree can change without retiring unrelated optics",
      );
      assert(
        await group.evaluate(async (node) => {
          const surface = node.querySelector('[data-glass-renderer="scene"]');
          const box = node.getBoundingClientRect();
          const child = document.createElement("span");
          child.textContent = "New contributing pixels";
          child.style.cssText = `position:fixed;left:${box.x}px;top:${box.y}px;width:100px;height:30px;background:red`;
          document.getElementById("tab-bar-distant-input").append(child);
          await new Promise((resolve) => setTimeout(resolve, 0));
          return !surface.isConnected;
        }),
        "a new descendant entering the capture must retire stale optics",
      );
      await page.locator("#tab-bar-distant-input").evaluate((node) => node.remove());
      await nav
        .locator(snapshot)
        .nth(capsules - 1)
        .waitFor({ state: "attached", timeout: 15000 });
      assert(
        await nav.evaluate(async (node) => {
          const surface = node.querySelector('[data-glass-renderer="scene"]');
          node.parentElement.querySelector("[data-tab-bar-test-backdrop]").style.height = "160px";
          await new Promise((resolve) => setTimeout(resolve, 0));
          return !surface.isConnected;
        }),
        "changing gradient geometry retires stale optical input",
      );
      await page
        .locator("[data-tab-bar-test-backdrop]")
        .evaluate((node) => (node.style.height = "150px"));
      await nav
        .locator(snapshot)
        .nth(capsules - 1)
        .waitFor({ state: "attached", timeout: 15000 });
      await group.evaluate((node) => {
        window.tabBarScene = node.querySelector('[data-glass-renderer="scene"]');
      });
      const sample = () =>
        group.evaluate((node) => {
          const surface = node.querySelector('[data-glass-renderer="scene"]');
          const canvas = surface?.shadowRoot?.querySelector("canvas");
          return {
            retained: surface === window.tabBarScene,
            width: node.getBoundingClientRect().width,
            pixels: canvas?.toDataURL(),
          };
        });
      const held = await links.first().boundingBox();
      await page.mouse.move(held.x + held.width / 2, held.y + held.height / 2);
      await page.mouse.down();
      const pressing = [];
      for (let frame = 0; frame < 12; frame++) {
        await page.waitForTimeout(16);
        pressing.push(await sample());
        if (frame === 3) await capture("held");
      }
      await page.mouse.up();
      assert(
        pressing.every((frame) => frame.retained && frame.pixels),
        "GPU ownership survives elastic pressing",
      );
      assert(
        new Set(pressing.map((frame) => frame.pixels)).size >= 4,
        "optical pixels, not only rAF, change during pressing",
      );
      const minimize = nav
        .locator("..")
        .getByRole("button", { name: "Minimize navigation", exact: true });
      const motion = async (button, label, reverse = false) => {
        // Arm before the real click: automation round trips miss the early spring frames.
        await nav.evaluate((node, selector) => {
          const surfaces = [...node.querySelectorAll(selector)];
          const tile = document.createElement("canvas");
          tile.width = 64;
          tile.height = 16;
          const context = tile.getContext("2d", { willReadFrequently: true });
          const result = { frames: [], done: false };
          window.tabBarMotion = result;
          const record = () => {
            const current = [...node.querySelectorAll(selector)];
            result.frames.push({
              width: node.querySelector("[data-tab-bar-group]").getBoundingClientRect().width,
              gpu: current.length === surfaces.length && current.every((s, i) => s === surfaces[i]),
              pixels: current.map((surface) => {
                const canvas = surface.shadowRoot?.querySelector("canvas");
                if (!canvas?.width || !canvas.height) return null;
                context.clearRect(0, 0, 64, 16);
                context.drawImage(canvas, 0, 0, 64, 16);
                let hash = 2166136261;
                for (const byte of context.getImageData(0, 0, 64, 16).data)
                  hash = Math.imul(hash ^ byte, 16777619);
                return hash;
              }),
            });
          };
          document.addEventListener(
            "click",
            () => {
              const start = performance.now();
              record();
              const next = () => {
                record();
                if (performance.now() - start < 1100) requestAnimationFrame(next);
                else result.done = true;
              };
              requestAnimationFrame(next);
            },
            { capture: true, once: true },
          );
        }, snapshot);
        await button.click();
        if (label === "document contraction") await capture("contracting");
        if (reverse) {
          await page.waitForFunction(() => {
            const frames = window.tabBarMotion.frames;
            return frames.some((frame) => frame.width < frames[0].width - 8);
          });
          await nav
            .getByRole("button", { name: "Expand navigation", exact: true })
            .click({ force: true });
        }
        await page.waitForFunction(() => window.tabBarMotion.done);
        const frames = await page.evaluate(() => window.tabBarMotion.frames);
        assert(
          frames.every((frame) => frame.gpu),
          `${label} retains the original GPU surfaces: ${JSON.stringify(frames)}`,
        );
        assert(
          new Set(frames.map((frame) => Math.round(frame.width))).size >= 4,
          `${label}: distinct spring geometries`,
        );
        for (let capsule = 0; capsule < capsules; capsule++) {
          assert(
            frames.every(
              (frame) => frame.pixels[capsule] !== null && frame.pixels[capsule] !== undefined,
            ),
            `${label}: capsule ${capsule} has optical output`,
          );
          assert(
            new Set(frames.map((frame) => frame.pixels[capsule])).size >= 4,
            `${label}: capsule ${capsule} actual optical pixels change`,
          );
        }
        if (reverse)
          assert(
            Math.abs(frames.at(-1).width - frames[0].width) < 1,
            "reversal returns to expanded geometry",
          );
        console.log(
          `${name} ${label}: ${frames.length} samples, ${new Set(frames.map((frame) => frame.pixels[0])).size} optical outputs; continuous GPU`,
        );
        return frames;
      };
      await motion(minimize, "contraction");
      assert.equal(await group.locator("[data-tab-bar-list]").getAttribute("inert"), "");
      await nav
        .locator(snapshot)
        .nth(capsules - 1)
        .waitFor({ state: "attached", timeout: 15000 });
      await motion(
        nav.getByRole("button", { name: "Expand navigation", exact: true }),
        "expansion",
      );
      await nav
        .locator(snapshot)
        .nth(capsules - 1)
        .waitFor({ state: "attached", timeout: 15000 });
      await page.waitForTimeout(800);
      await motion(minimize, "mid-flight reversal", true);
      await page.locator("[data-tab-bar-test-backdrop]").evaluate((node) => node.remove());
      await nav
        .locator(snapshot)
        .nth(capsules - 1)
        .waitFor({ state: "attached", timeout: 15000 });
      await motion(minimize, "document contraction");
      await capture("collapsed");
      await motion(
        nav.getByRole("button", { name: "Expand navigation", exact: true }),
        "document expansion",
      );
      console.log(
        `${name}: press has ${new Set(pressing.map((frame) => frame.pixels)).size} distinct optical outputs`,
      );
    } else {
      await page.waitForTimeout(1200);
      assert.equal(
        await nav.locator(snapshot).count(),
        0,
        "unsupported or native-refraction path retains fallback",
      );
      await nav
        .locator("..")
        .getByRole("button", { name: "Minimize navigation", exact: true })
        .click();
      assert.equal(await group.locator("[data-tab-bar-list]").getAttribute("inert"), "");
      await nav.getByRole("button", { name: "Expand navigation", exact: true }).click();
      await page.waitForTimeout(800);
      assert.equal(
        await nav.locator(snapshot).count(),
        0,
        "fallback also survives minimize and expand",
      );
    }
    await links.nth(1).click();
    assert.equal(await links.nth(1).getAttribute("aria-current"), "page");
    await links.nth(2).focus();
    await page.keyboard.press("Enter");
    assert.equal(await links.nth(2).getAttribute("aria-current"), "page");
    const from = await links.nth(2).boundingBox();
    const to = await links.first().boundingBox();
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
    await page.mouse.up();
    assert.equal(await links.first().getAttribute("aria-current"), "page");
    await page.waitForTimeout(700);
    await capture("expanded");
    assert.deepEqual(errors, []);
    console.log(`${name} ${theme} ${width}: TabBar optics, click, keyboard and drag passed`);
  } finally {
    await browser.close();
  }
}
