import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4311";
const artifacts = process.env.BROWSER_ARTIFACTS;
const theme = process.env.THEME ?? "light";
const gpu = process.env.NO_GPU !== "1";
if (artifacts) await mkdir(artifacts, { recursive: true });
const snapshot = '[data-glass-backdrop-snapshot][data-glass-renderer="scene"]';
const sampleMotion = () => {
  const frames = (window.documentMenuFrames = []);
  let start;
  const sample = () => {
    for (const surface of document.querySelectorAll('[data-lenso-slot="menu-surface"]')) {
      const lens = surface.querySelector("[data-material-lens]");
      if (lens && !surface.hasAttribute("data-material-resting")) {
        start ??= performance.now();
        const canvas = surface
          .querySelector('[data-glass-renderer="scene"]')
          ?.shadowRoot?.querySelector("canvas");
        frames.push({
          width: lens.getBoundingClientRect().width,
          shadow: getComputedStyle(lens).boxShadow,
          gpu: !!surface.querySelector('[data-glass-renderer="scene"]'),
          output: canvas ? `${canvas.width}x${canvas.height}` : undefined,
          stacked:
            surface.closest('[data-lenso-slot="menu-popup"]').dataset.menuMotion === "stacked",
        });
      }
    }
    if (
      window.documentMenuFrames === frames &&
      (start === undefined || performance.now() - start < 2500)
    )
      requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
};
const assertMotion = async (page, label, stacked = false) => {
  const frames = (await page.evaluate(() => window.documentMenuFrames)).filter(
    (frame) => !stacked || frame.stacked,
  );
  assert(
    new Set(frames.filter((frame) => frame.gpu).map((frame) => Math.round(frame.width))).size >= 3,
    `${label}: GPU optics must follow multiple distinct animated geometries: ${JSON.stringify(frames)}`,
  );
  if (label === "root opening")
    assert(
      new Set(frames.flatMap((frame) => (frame.output ? [frame.output] : []))).size <= 2,
      `${label}: retain output storage instead of resizing it at every spring geometry`,
    );
};
const pixels = (index) =>
  document
    .querySelectorAll('[data-glass-backdrop-snapshot][data-glass-renderer="scene"]')
    [index]?.shadowRoot?.querySelector("canvas")
    ?.toDataURL();
const assertTriggerReturn = async (page, trigger) => {
  await trigger.click();
  await page.waitForTimeout(700);
  // Read after all rAF writes, including the first frame restoring the masked material.
  const returns = await trigger.evaluate(
    (node) =>
      new Promise((resolve) => {
        const frames = [];
        const start = performance.now();
        const sample = () => {
          setTimeout(() => {
            const id = node.getAttribute("data-material-paints");
            const paint = document.querySelector(`[data-material-local-paints="${id}"]`);
            if (Number(getComputedStyle(node).opacity) > 0 && paint) {
              const box = node.getBoundingClientRect();
              const layer = paint.firstElementChild.getBoundingClientRect();
              frames.push({
                visible: getComputedStyle(paint).display !== "none",
                error: Math.max(
                  ...["left", "top", "right", "bottom"].map((edge) =>
                    Math.abs(box[edge] - layer[edge]),
                  ),
                ),
              });
            }
            if (performance.now() - start >= 1000) resolve(frames);
          }, 0);
          if (performance.now() - start < 1000) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
        document.activeElement.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }),
        );
      }),
  );
  assert(returns.length >= 3, "sample the trigger's return, not only its hidden phase");
  assert(
    returns.every((frame) => frame.visible && frame.error < 1),
    `the returning trigger must never lose or detach its material: ${JSON.stringify(returns)}`,
  );
  assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
};
const assertFreshPaint = async (page, label) => {
  const count = await page.locator(snapshot).count();
  assert(count > 0, `${label}: GPU paint must exist before the fresh-capture comparison`);
  const retained = await Promise.all(
    Array.from({ length: count }, (_, index) => page.evaluate(pixels, index)),
  );
  await page.evaluate(() => {
    window.documentMenuPrevious = [...document.querySelectorAll('[data-glass-renderer="scene"]')];
    const changed = document.createElement("span");
    changed.hidden = true;
    document.querySelector("#nd-notebook-layout").append(changed);
  });
  await page.waitForFunction(
    (count) => {
      const surfaces = [...document.querySelectorAll('[data-glass-renderer="scene"]')];
      return (
        surfaces.length === count &&
        surfaces.every((surface) => !window.documentMenuPrevious.includes(surface))
      );
    },
    count,
    { timeout: 15000 },
  );
  for (let index = 0; index < count; index++) {
    const fresh = await page.evaluate(pixels, index);
    const difference = await page.evaluate(
      async ([before, after]) => {
        const images = await Promise.all(
          [before, after].map(async (url) => {
            const image = new Image();
            image.src = url;
            await image.decode();
            return image;
          }),
        );
        if (images[0].width !== images[1].width || images[0].height !== images[1].height)
          return Infinity;
        const canvas = document.createElement("canvas");
        canvas.width = images[0].width;
        canvas.height = images[0].height;
        const context = canvas.getContext("2d");
        const data = images.map((image) => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0);
          return context.getImageData(0, 0, canvas.width, canvas.height).data;
        });
        let total = 0;
        for (let pixel = 0; pixel < data[0].length; pixel++)
          total += Math.abs(data[0][pixel] - data[1][pixel]);
        return total / data[0].length;
      },
      [retained[index], fresh],
    );
    assert(
      difference < 0.1,
      `${label}, menu ${index}: retained paint must match fresh capture; mean byte difference ${difference}`,
    );
  }
};
for (const [engine, type] of [
  ["webkit", webkit],
  ["chromium", chromium],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== engine) continue;
  const browser = await type.launch(
    engine === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    const page = await browser.newPage({
      viewport: { width: Number(process.env.WIDTH ?? 1280), height: 1000 },
      deviceScaleFactor: Number(process.env.DPR ?? 1),
      colorScheme: theme,
    });
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
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const controlled = engine === "webkit" && gpu;
    await page.goto(`${base}/cn/docs/react/components/menu`);
    await page.waitForTimeout(1000);
    const trigger = page.getByRole("button", { name: "Menu", exact: true }).first();
    if (engine === "webkit") await assertTriggerReturn(page, trigger);
    // Step the real SDK timeline while allowing asynchronous capture/compilation
    // to finish. This checks animated geometry, not wall-clock FPS or cold latency.
    if (controlled) {
      await page.clock.install();
      // Start the controlled run with a fresh scheduler rather than replacing
      // the time origin underneath the real-clock return probe's live clients.
      await page.reload();
      await page.waitForTimeout(1000);
      await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 1000));
    }
    const advance = async (phase) => {
      if (!controlled) return;
      let captured = false;
      for (let frame = 0; frame < 48; frame++) {
        await page.clock.runFor(16);
        await page.waitForTimeout(30);
        if (artifacts && !captured && frame >= 12) {
          const moving = await page.evaluate(() =>
            [...document.querySelectorAll('[data-lenso-slot="menu-surface"]')].some(
              (surface) =>
                !surface.hasAttribute("data-material-resting") &&
                surface.querySelector('[data-glass-renderer="scene"]'),
            ),
          );
          if (moving) {
            await page.screenshot({
              path: `${artifacts}/menu-document-${theme}-${phase}.png`,
              caret: "initial",
            });
            captured = true;
          }
        }
      }
    };
    await page.evaluate(sampleMotion);
    await trigger.click({ force: controlled });
    await advance("opening");
    if (engine === "webkit" && gpu)
      await page.waitForFunction(
        () => document.querySelector('[data-glass-backdrop-snapshot][data-glass-renderer="scene"]'),
        undefined,
        { timeout: 15000 },
      );
    if (engine === "webkit" && gpu) {
      await assertMotion(page, "root opening");
      const input = await page.evaluate(() => {
        window.documentMenuInputSurface = document.querySelector('[data-glass-renderer="scene"]');
        const canvas = window.documentMenuInputSurface.shadowRoot.querySelector("canvas");
        const before = canvas.toDataURL();
        const row = document.querySelector('[role="log"] li');
        if (!row) throw new Error("Opening the real Menu must append a real log row");
        row.firstChild.textContent = "真实输入更新：Wim 42 → 关闭菜单";
        const added = row.cloneNode(true);
        added.textContent = "第二行：不同宽度的文字与数字 137";
        row.parentElement.append(added);
        return before;
      });
      await page.clock.runFor(32);
      await page.waitForTimeout(50);
      assert(
        await page.evaluate(
          () =>
            document.querySelector('[data-glass-renderer="scene"]') ===
            window.documentMenuInputSurface,
        ),
        "real text edits and appended rows must repaint without replacing the GPU surface",
      );
      assert.notEqual(await page.evaluate(pixels, 0), input, "changed input must change optics");
      if (artifacts)
        await page.screenshot({
          path: `${artifacts}/menu-input-updated-${theme}-${process.env.WIDTH ?? 1280}.png`,
        });
      const shadow = await page
        .locator('[data-lenso-slot="menu-surface"] [data-material-lens]')
        .evaluate((node) => getComputedStyle(node).boxShadow);
      const movingShadows = await page.evaluate(() =>
        window.documentMenuFrames.filter((frame) => frame.gpu).map((frame) => frame.shadow),
      );
      assert(
        movingShadows.every((moving) => moving === shadow),
        `the menu must retain its shadow across motion and rest: ${JSON.stringify([...new Set(movingShadows), shadow])}`,
      );
      await page.clock.resume();
      await assertFreshPaint(page, "real text replacement and appended row");
      const beforeRemoval = await page.evaluate(() => {
        window.documentMenuInputSurface = document.querySelector('[data-glass-renderer="scene"]');
        return window.documentMenuInputSurface.shadowRoot.querySelector("canvas").toDataURL();
      });
      await page.getByRole("log").evaluate((node) => node.querySelector("li:last-child").remove());
      await page.waitForFunction((before) => {
        const current = document.querySelector('[data-glass-renderer="scene"]');
        return current && current.shadowRoot.querySelector("canvas").toDataURL() !== before;
      }, beforeRemoval);
      assert(
        await page.evaluate(
          () =>
            document.querySelector('[data-glass-renderer="scene"]') ===
            window.documentMenuInputSurface,
        ),
        "removing a row must retain its GPU surface",
      );
      await assertFreshPaint(page, "removed log row");
      await page.getByRole("log").evaluate((node) => {
        const unsupported = document.createElement("canvas");
        unsupported.id = "menu-input-unsupported";
        node.append(unsupported);
      });
      await page.waitForFunction(() => !document.querySelector('[data-glass-renderer="scene"]'));
      assert(await page.locator("[data-material-live-paints]").last().isVisible());
      await page.locator("#menu-input-unsupported").evaluate((node) => node.remove());
      await page.waitForFunction((selector) => document.querySelector(selector), snapshot);
      await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 100));
      const rows = await page.getByRole("log").getByRole("listitem").count();
      await page.evaluate(() => {
        window.documentMenuClosingSurface = document.querySelector('[data-glass-renderer="scene"]');
        window.documentMenuClosingPixels = new Set();
      });
      await page.keyboard.press("Escape");
      const closing = [];
      for (let frame = 0; frame < 48; frame++) {
        await page.clock.runFor(16);
        await page.waitForTimeout(15);
        const result = await page.evaluate(() => {
          const lens = document.querySelector(
            '[data-lenso-slot="menu-surface"] [data-material-lens]',
          );
          if (!lens) return;
          const current = document.querySelector('[data-glass-renderer="scene"]');
          const canvas = current?.shadowRoot.querySelector("canvas");
          if (canvas) window.documentMenuClosingPixels.add(canvas.toDataURL());
          return {
            width: lens.getBoundingClientRect().width,
            retained: current === window.documentMenuClosingSurface,
            opacity: Number(getComputedStyle(lens).opacity),
            hidden: lens.parentElement.hasAttribute("data-material-hidden"),
          };
        });
        if (result) closing.push(result);
        if (artifacts && frame === 5)
          await page.screenshot({
            path: `${artifacts}/menu-input-closing-${theme}-${process.env.WIDTH ?? 1280}.png`,
          });
      }
      assert.equal(await page.getByRole("log").getByRole("listitem").count(), rows + 1);
      assert(closing.length >= 3, "sample multiple real closing geometries");
      assert(
        closing.every((frame) => frame.retained || (frame.hidden && frame.opacity === 0)),
        `visible closing must retain GPU optics: ${JSON.stringify(closing)}`,
      );
      const paints = await page.evaluate(() => window.documentMenuClosingPixels.size);
      assert(paints >= 3, "closing must produce multiple distinct optical pixel outputs");
      assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
      console.log(
        `${engine}: closing retains GPU across ${closing.filter((frame) => frame.opacity > 0).length} visible samples, ${paints} distinct optical outputs, and a real appended log`,
      );
      await page.evaluate(sampleMotion);
      await trigger.click({ force: true });
      await advance("reopening-after-input");
    }
    assert.equal(await page.locator('[data-lenso-slot="menu-content"]').count(), 1);
    await page.evaluate(sampleMotion);
    await page.getByRole("menuitem", { name: "排序方式" }).hover({ force: controlled });
    await advance("submenu-opening");
    await page.waitForFunction(
      () => document.querySelectorAll('[data-lenso-slot="menu-content"]').length === 2,
    );
    const stacked = (await page.locator('[data-lenso-slot="menu-submenu-heading"]').count()) > 0;
    if (stacked) {
      const title = await page
        .locator('[data-lenso-slot="menu-submenu-heading"]')
        .evaluate((node) => {
          const style = getComputedStyle(node);
          return { start: style.paddingInlineStart, end: style.paddingInlineEnd };
        });
      assert.equal(title.start, title.end, "the back title must not reserve item selection space");
    }
    if (engine === "webkit" && gpu)
      await page.waitForFunction(
        () =>
          document.querySelectorAll('[data-glass-backdrop-snapshot][data-glass-renderer="scene"]')
            .length === 2,
        undefined,
        { timeout: 15000 },
      );
    if (engine === "webkit" && gpu && stacked) {
      await assertMotion(page, "stacked submenu opening", true);
    }
    if (engine === "webkit" && gpu && !stacked) {
      await assertMotion(page, "submenu opening");
      await page.evaluate(sampleMotion);
      await page.getByRole("menu").last().focus();
      await page.keyboard.press("ArrowLeft");
      await advance("submenu-closing");
      await assertMotion(page, "submenu closing");
      assert.equal(await page.locator('[data-lenso-slot="menu-content"]').count(), 1);
      await page.evaluate(sampleMotion);
      await page.keyboard.press("ArrowRight");
      await advance("submenu-reopening");
      await assertMotion(page, "submenu reopening");
    }
    if (controlled) await page.clock.resume();
    if (artifacts)
      await page.screenshot({
        path: `${artifacts}/menu-document-${engine}-${theme}-${process.env.WIDTH ?? 1280}-${process.env.DPR ?? 1}-${gpu}.png`,
        caret: "initial",
      });
    if (engine === "webkit" && gpu && !stacked) {
      assert.equal(
        await page.locator(snapshot).count(),
        2,
        "taking a screenshot must not retire the GPU result",
      );
      const cascade = await page.evaluate(pixels, 1);
      await page
        .locator('[data-lenso-slot="menu-popup"]')
        .nth(1)
        .evaluate((node) => {
          node.style.translate = "-220px 0px";
        });
      await page.waitForFunction(
        (previous) => {
          const current = document
            .querySelectorAll('[data-glass-backdrop-snapshot][data-glass-renderer="scene"]')[1]
            ?.shadowRoot?.querySelector("canvas")
            ?.toDataURL();
          return current && current !== previous;
        },
        cascade,
        { timeout: 15000 },
      );
      if (artifacts)
        await page.screenshot({
          path: `${artifacts}/menu-document-overlap-${theme}-${process.env.DPR ?? 1}.png`,
          caret: "initial",
        });
      const beforeOutline = await page.evaluate(pixels, 1);
      await page.evaluate(() => {
        window.documentMenuOutlinedSurfaces = [
          ...document.querySelectorAll('[data-glass-renderer="scene"]'),
        ];
        const item = document.querySelector('[data-lenso-slot="menu-submenu-trigger"]');
        item.style.outline = "2px solid rgb(230, 20, 90)";
        item.style.outlineOffset = "-2px";
      });
      await page.waitForFunction((before) => {
        const surfaces = [...document.querySelectorAll('[data-glass-renderer="scene"]')];
        return (
          surfaces.length === 2 &&
          surfaces.every(
            (surface, index) => surface === window.documentMenuOutlinedSurfaces[index],
          ) &&
          surfaces[1].shadowRoot.querySelector("canvas").toDataURL() !== before
        );
      }, beforeOutline);
      if (artifacts)
        await page.screenshot({ path: `${artifacts}/menu-owned-outline-${theme}.png` });
      await assertFreshPaint(page, "changed lower-menu focus outline");
      const outlinedItem = page.locator('[data-lenso-slot="menu-submenu-trigger"]').first();
      await outlinedItem.evaluate((node) => (node.style.outlineStyle = "dashed"));
      await page.waitForFunction(
        () => document.querySelectorAll('[data-glass-renderer="scene"]').length === 1,
      );
      assert(await page.locator("[data-material-live-paints]").last().isVisible());
      await outlinedItem.evaluate((node) => (node.style.outlineStyle = "solid"));
      await page.waitForFunction(
        () => document.querySelectorAll('[data-glass-renderer="scene"]').length === 2,
      );
      const before = await page.evaluate(pixels, 1);
      await page
        .locator('[data-lenso-slot="menu-submenu-trigger"]')
        .first()
        .evaluate((node) => {
          node.style.color = "rgb(230, 20, 90)";
        });
      await page.waitForFunction(
        (previous) => {
          const current = document
            .querySelectorAll('[data-glass-backdrop-snapshot][data-glass-renderer="scene"]')[1]
            ?.shadowRoot?.querySelector("canvas")
            ?.toDataURL();
          return current && current !== previous;
        },
        before,
        { timeout: 15000 },
      );
      console.log(`${engine}: changing parent menu paint changes child optical pixels`);
      await page.keyboard.press("Escape");
      await page.waitForFunction(
        () => document.querySelectorAll('[data-lenso-slot="menu-popup"]').length === 1,
      );
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.querySelector('[data-lenso-slot="menu-popup"]'));
      await trigger.click();
      await page.waitForFunction((selector) => document.querySelector(selector), snapshot);
      // Put document text and code under the existing popup without replacing the real Menu.
      await page.evaluate(() => {
        const box = document
          .querySelector('[data-lenso-slot="menu-popup"]')
          .getBoundingClientRect();
        const section = document.createElement("section");
        section.id = "document-optical-probe";
        section.style.cssText = `position:fixed;left:${box.x - 30}px;top:${box.y + 30}px;width:${box.width + 60}px;background:white;color:black;font:18px system-ui;pointer-events:none`;
        const p = document.createElement("p");
        p.textContent =
          document.querySelector("article p")?.textContent ?? "Menu 提供操作菜单和多级子菜单。";
        p.style.cssText = "margin:0;padding:8px;line-height:1.5";
        const code = document.createElement("pre"),
          snippet = document.createElement("code");
        snippet.textContent =
          'import { Menu } from "@lenso/ui";\n<Menu.Content>\n  <Menu.Item>打开</Menu.Item>\n</Menu.Content>';
        code.append(snippet);
        code.style.cssText =
          "margin:0;padding:12px;background:rgb(232,238,244);color:rgb(20,40,90);font:16px monospace;white-space:pre-wrap";
        section.append(p, code);
        document.querySelector("#nd-notebook-layout").append(section);
      });
      await page.waitForFunction((selector) => document.querySelector(selector), snapshot);
      // Wait for the replacement capture, not the previous surface still being invalidated.
      await page.waitForTimeout(1000);
      for (const selector of ["#document-optical-probe p", "#document-optical-probe pre"]) {
        const before = await page.evaluate(pixels, 0);
        await page.locator(selector).evaluate((node) => {
          node.style.color = "rgb(240, 20, 90)";
        });
        await page.waitForFunction(
          (previous) => {
            const current = document
              .querySelector('[data-glass-backdrop-snapshot][data-glass-renderer="scene"]')
              ?.shadowRoot?.querySelector("canvas")
              ?.toDataURL();
            return current && current !== previous;
          },
          before,
          { timeout: 15000 },
        );
        assert.notEqual(
          await page.evaluate(pixels, 0),
          before,
          `${selector} must contribute pixels`,
        );
      }
      if (artifacts)
        await page.screenshot({
          path: `${artifacts}/menu-document-text-code-${theme}-${process.env.WIDTH ?? 1280}-${process.env.DPR ?? 1}.png`,
          caret: "initial",
        });
      await page.locator("#document-optical-probe").evaluate((node) => {
        node.style.height = "110px";
        node.style.overflow = "auto";
        const paragraph = node.querySelector("p");
        paragraph.style.whiteSpace = "pre-wrap";
        paragraph.textContent = Array.from(
          { length: 20 },
          (_, index) => `${index}: ${paragraph.textContent}`,
        ).join("\n");
      });
      await page.waitForTimeout(500);
      await page.waitForFunction((selector) => document.querySelector(selector), snapshot);
      const beforeNestedScroll = await page.evaluate(pixels, 0);
      const nestedFrames = await page.locator("#document-optical-probe").evaluate(async (node) => {
        const frames = [];
        for (const top of [7, 19, 35, 83, 169, 211, 35]) {
          node.scrollTop = top;
          await new Promise(requestAnimationFrame);
          await new Promise(requestAnimationFrame);
          frames.push({
            top: node.scrollTop,
            gpu: !!document.querySelector('[data-glass-renderer="scene"]'),
          });
        }
        return frames;
      });
      assert(
        nestedFrames.every((frame) => frame.gpu),
        `internal scrolling must keep GPU optics: ${JSON.stringify(nestedFrames)}`,
      );
      await page.waitForFunction(
        (previous) => {
          const canvas = document
            .querySelector('[data-glass-renderer="scene"]')
            ?.shadowRoot?.querySelector("canvas");
          return canvas && canvas.toDataURL() !== previous;
        },
        beforeNestedScroll,
        { timeout: 15000 },
      );
      assert.equal(
        await page.locator("#document-optical-probe").evaluate((node) => node.scrollTop),
        35,
      );
      await assertFreshPaint(page, "internal scrolling");
      console.log(`${engine}: nested document scrolling refreshes changed text pixels`);
      await page.locator("#document-optical-probe").evaluate((node) => {
        const heading = document.createElement("p");
        heading.textContent = "正文与代码的嵌套滚动";
        heading.style.cssText = "margin:0;height:24px";
        const scroller = document.createElement("div");
        scroller.id = "document-inner-scroll-probe";
        scroller.style.cssText =
          "height:72px;overflow:auto;border-radius:12px;background:rgb(232,238,244)";
        const code = document.createElement("pre");
        code.style.cssText = "margin:0;width:900px;color:rgb(20,40,90);font:16px/22px monospace";
        code.textContent = Array.from(
          { length: 16 },
          (_, index) =>
            `${index}: const opticalLayer = compose(background, foreground); // RGB refraction`,
        ).join("\n");
        scroller.append(code);
        const tail = document.createElement("p");
        tail.style.cssText = "height:180px;margin:0";
        tail.textContent = "滚动容器后方的正文";
        node.replaceChildren(heading, scroller, tail);
        node.scrollTop = 0;
      });
      await page.waitForTimeout(500);
      await page.waitForFunction((selector) => document.querySelector(selector), snapshot);
      await page.mouse.move(10, 10);
      await page.getByRole("menuitem", { name: "排序方式" }).focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction(
        () => document.querySelectorAll('[data-glass-renderer="scene"]').length === 2,
        undefined,
        { timeout: 15000 },
      );
      await page
        .locator('[data-lenso-slot="menu-popup"]')
        .nth(1)
        .evaluate((node) => {
          const box = node.getBoundingClientRect(),
            behind = document.querySelector("#document-optical-probe").getBoundingClientRect();
          node.style.translate = `${behind.x + 70 - box.x}px ${behind.y + 4 - box.y}px`;
        });
      await page.waitForTimeout(500);
      if (artifacts)
        await page.screenshot({
          path: `${artifacts}/menu-document-internal-before-${theme}.png`,
          caret: "initial",
        });
      const nestedBefore = [await page.evaluate(pixels, 0), await page.evaluate(pixels, 1)];
      const nestedLayers = await page.evaluate(async () => {
        const outer = document.querySelector("#document-optical-probe"),
          inner = document.querySelector("#document-inner-scroll-probe"),
          surfaces = [...document.querySelectorAll('[data-glass-renderer="scene"]')];
        const frames = [];
        for (const [top, left, innerTop] of [
          [0, 11, 21],
          [13, 73, 48],
          [29, 149, 170],
          [7, 33, 35],
        ]) {
          outer.scrollTop = top;
          inner.scrollLeft = left;
          inner.scrollTop = innerTop;
          for (let frame = 0; frame < 2; frame++) {
            await new Promise(requestAnimationFrame);
            const current = [...document.querySelectorAll('[data-glass-renderer="scene"]')];
            frames.push({
              gpu: current.length,
              retained: current.every((surface, index) => surface === surfaces[index]),
              top: outer.scrollTop,
              left: inner.scrollLeft,
              innerTop: inner.scrollTop,
            });
          }
        }
        return frames;
      });
      assert(
        nestedLayers.every((frame) => frame.gpu === 2 && frame.retained),
        `nested scrolling must retain both optical layers: ${JSON.stringify(nestedLayers)}`,
      );
      assert.deepEqual(
        [nestedLayers.at(-1).top, nestedLayers.at(-1).left, nestedLayers.at(-1).innerTop],
        [7, 33, 35],
      );
      for (let index = 0; index < 2; index++)
        assert.notEqual(
          await page.evaluate(pixels, index),
          nestedBefore[index],
          `nested scroll must change menu ${index} optical pixels`,
        );
      await assertFreshPaint(page, "nested two-axis scrolling through overlapping menus");
      if (artifacts)
        await page.screenshot({
          path: `${artifacts}/menu-document-internal-after-${theme}.png`,
          caret: "initial",
        });
      console.log(
        `${engine}: nested two-axis scrolling retains both GPU layers and matches fresh capture`,
      );
      await page.keyboard.press("Escape");
      await page.locator("#document-inner-scroll-probe pre").evaluate((node) => {
        node.style.height = "5000px";
      });
      await page.waitForFunction(() => !document.querySelector("[data-glass-backdrop-snapshot]"));
      await page.waitForTimeout(500);
      assert.equal(
        await page.locator(snapshot).count(),
        0,
        "oversized scroll content must retain fallback instead of allocating an unbounded raster",
      );
      await page.locator("#document-inner-scroll-probe pre").evaluate((node) => {
        node.style.removeProperty("height");
      });
      await page.waitForFunction((selector) => document.querySelector(selector), snapshot);
      await page.locator("#document-inner-scroll-probe pre").evaluate((node) => {
        node.style.backdropFilter = "blur(2px)";
      });
      await page.waitForFunction(() => !document.querySelector("[data-glass-backdrop-snapshot]"));
      await page.waitForTimeout(500);
      assert.equal(
        await page.locator(snapshot).count(),
        0,
        "a backdrop filter within scrolling content must not reuse a frozen backdrop",
      );
      await page.locator("#document-inner-scroll-probe pre").evaluate((node) => {
        node.style.removeProperty("backdrop-filter");
      });
      await page.waitForFunction((selector) => document.querySelector(selector), snapshot);
      // Unsupported source pixels must restore native paint instead of keeping a stale capture.
      await page.evaluate(() => {
        const section = document.querySelector("#document-optical-probe");
        const canvas = document.createElement("canvas");
        canvas.width = 60;
        canvas.height = 40;
        section.prepend(canvas);
      });
      await page.waitForFunction(() => !document.querySelector("[data-glass-backdrop-snapshot]"));
      await page.waitForTimeout(500);
      assert.equal(
        await page.locator(snapshot).count(),
        0,
        "unsupported input must stay on fallback",
      );
      assert(await page.locator("[data-material-live-paints]").last().isVisible());
      await page.locator("#document-optical-probe").evaluate((node) => node.remove());
      await page.waitForFunction((selector) => document.querySelector(selector), snapshot);
      await page.mouse.move(10, 10);
      await page.getByRole("menuitem", { name: "排序方式" }).focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction(
        () => document.querySelectorAll('[data-glass-renderer="scene"]').length === 2,
      );
      const scrolling = await page.evaluate(async () => {
        const tail = document.createElement("div");
        tail.id = "document-scroll-probe";
        tail.style.height = "900px";
        document.body.append(tail);
        const frames = [];
        for (let index = 0; index < 12; index++) {
          window.scrollBy(0, 8);
          await new Promise(requestAnimationFrame);
          await new Promise(requestAnimationFrame);
          frames.push({
            scroll: scrollY,
            gpu: document.querySelectorAll('[data-glass-renderer="scene"]').length,
          });
        }
        return frames;
      });
      assert(scrolling.at(-1).scroll >= 80, "the document must actually scroll");
      assert(
        scrolling.every((frame) => frame.gpu === 2),
        `document scrolling must retain certified GPU paint: ${JSON.stringify(scrolling)}`,
      );
      if (artifacts)
        await page.screenshot({
          path: `${artifacts}/menu-document-scrolling-${theme}.png`,
          caret: "initial",
        });
      await assertFreshPaint(page, "document scrolling");
      console.log(
        `${engine}: scrolling retains both GPU layers and matches a fresh document capture`,
      );
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        document.querySelector("#document-scroll-probe").remove();
      });
      await page.setViewportSize({ width: 1240, height: 1000 });
      await page.waitForFunction(
        () => document.querySelectorAll('[data-glass-renderer="scene"]').length === 2,
        undefined,
        { timeout: 15000 },
      );
      await page.evaluate(() => document.documentElement.classList.toggle("dark"));
      await page.waitForFunction(
        () => document.querySelectorAll('[data-glass-renderer="scene"]').length === 2,
        undefined,
        { timeout: 15000 },
      );
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
    } else if (engine === "webkit" && gpu && stacked) {
      const before = await page.evaluate(pixels, 1);
      const retained = await page.evaluate(async () => {
        const surfaces = [...document.querySelectorAll('[data-glass-renderer="scene"]')];
        const parent = document.querySelector('[data-lenso-slot="menu-popup"]');
        parent.querySelector('[data-lenso-slot="menu-surface"]').style.scale = "0.92";
        const content = parent.querySelector('[data-lenso-slot="menu-content"]');
        content.style.scale = "0.92";
        content.style.opacity = "0.3";
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        const current = [...document.querySelectorAll('[data-glass-renderer="scene"]')];
        return (
          current.length === 2 && current.every((surface, index) => surface === surfaces[index])
        );
      });
      assert(retained, "stack pose changes must retain both GPU surfaces");
      assert.notEqual(
        await page.evaluate(pixels, 1),
        before,
        "upper glass must sample the changed parent pose",
      );
      await assertFreshPaint(page, "stacked parent scale and foreground opacity");
      await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 16));
      await page.evaluate(sampleMotion);
      await page
        .getByRole("menuitem", { name: "排序方式", exact: true })
        .last()
        .click({ force: true });
      await advance("stacked-return");
      await page.clock.resume();
      await page.waitForFunction(
        () => document.querySelectorAll('[data-lenso-slot="menu-popup"]').length === 1,
      );
      await assertMotion(page, "stacked submenu return", true);
      assert.equal(await page.locator(snapshot).count(), 1);
      assert.equal(
        await page
          .getByRole("menuitem", { name: "排序方式", exact: true })
          .evaluate((node) => node === document.activeElement),
        true,
      );
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction(
        () => document.querySelectorAll('[data-glass-renderer="scene"]').length === 2,
      );
      await page.keyboard.press("Escape");
      await page.waitForFunction(
        () => document.querySelectorAll('[data-lenso-slot="menu-popup"]').length === 1,
      );
      await page.keyboard.press("Escape");
    } else {
      await page.waitForTimeout(500);
      assert.equal(await page.locator(snapshot).count(), 0);
      if (engine === "webkit")
        assert(await page.locator("[data-material-live-paints]").last().isVisible());
      else
        assert(
          await page
            .locator('[data-lenso-slot="menu-surface"] [data-material-lens]')
            .first()
            .evaluate((node) => getComputedStyle(node).backdropFilter.includes("url(")),
        );
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
    }
    await page.waitForFunction(() => !document.querySelector('[data-lenso-slot="menu-popup"]'));
    assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
    assert.deepEqual(errors, []);
    console.log(
      `${engine} ${theme} DPR${process.env.DPR ?? 1}: document menu ${engine === "webkit" && gpu ? "scene pixels" : "native fallback"}, dismissal and focus passed`,
    );
  } finally {
    await browser.close();
  }
}
