import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    // Keep hydration disabled so a correct final measurement cannot hide a broken first paint.
    const initialPage = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 1000 },
    });
    await initialPage.goto(base);
    const initialGeometry = await initialPage
      .locator('[data-home-showcase] [role="tablist"]')
      .evaluate((list) => {
        const tab = list.querySelector('[aria-selected="true"]').getBoundingClientRect();
        const tint = list.querySelector('[data-slot="tabs-tint"]').getBoundingClientRect();
        return {
          tabHeight: tab.height,
          tintHeight: tint.height,
          centerOffset: tint.y + tint.height / 2 - tab.y - tab.height / 2,
        };
      });
    assert.ok(
      Math.abs(initialGeometry.tintHeight - (initialGeometry.tabHeight - 4)) < 1,
      `${name}: first paint uses the wrong indicator height: ${JSON.stringify(initialGeometry)}`,
    );
    assert.ok(
      Math.abs(initialGeometry.centerOffset) < 1,
      `${name}: first paint indicator is not centered`,
    );
    await initialPage.close();
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 2,
    });
    await page.addInitScript(() => {
      window.homeTabFrames = [];
      window.sampleHomeTabs = true;
      function sample() {
        const list = document.querySelector('[data-home-showcase] [role="tablist"]');
        const tab = list?.querySelector('[aria-selected="true"]');
        const tint = list?.querySelector('[data-slot="tabs-tint"]');
        if (tab && tint && getComputedStyle(list).position === "relative") {
          const t = tab.getBoundingClientRect(),
            i = tint.getBoundingClientRect();
          if (t.height)
            window.homeTabFrames.push({
              heightError: i.height - (t.height - 4),
              centerOffset: i.y + i.height / 2 - t.y - t.height / 2,
            });
        }
        if (window.sampleHomeTabs) requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    await page.goto(base);
    const list = page.locator('[data-home-showcase] [role="tablist"]');
    await page.waitForFunction(() =>
      document.querySelector('[data-home-showcase] [role="tablist"]')?.hasAttribute("data-ready"),
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.querySelectorAll("[data-home-showcase] img")].map((image) => image.decode()),
      );
    });
    await page.waitForTimeout(1000);
    const frames = await page.evaluate(() => {
      window.sampleHomeTabs = false;
      return window.homeTabFrames;
    });
    assert.ok(frames.length > 0, `${name}: no initial frames were sampled`);
    assert.deepEqual(
      frames.filter(
        (frame) => Math.abs(frame.heightError) >= 1 || Math.abs(frame.centerOffset) >= 1,
      ),
      [],
      `${name}: indicator geometry changed during hydration`,
    );
    const sourceState = () =>
      list.locator('[data-slot="tabs-glass"]').evaluate((glass) => {
        const lens = glass.querySelector(":scope > [data-material-lens]");
        const copy = lens?.previousElementSibling;
        return {
          visible: !!copy && getComputedStyle(copy).display !== "none",
          shade:
            !!copy &&
            [copy, ...copy.querySelectorAll("*")].some((node) =>
              getComputedStyle(node).backgroundImage.includes("linear-gradient"),
            ),
        };
      });
    const initial = await sourceState();
    const sample = async () => {
      const png = (await list.screenshot()).toString("base64");
      return page.evaluate(async (png) => {
        const image = new Image();
        image.src = `data:image/png;base64,${png}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        const { data } = context.getImageData(
          Math.floor(image.width * 0.72),
          Math.floor(image.height * 0.7),
          20,
          10,
        );
        return [0, 1, 2].map((channel) => {
          let total = 0;
          for (let index = channel; index < data.length; index += 4) total += data[index];
          return total / (data.length / 4);
        });
      }, png);
    };
    const before = await sample();
    await page.getByRole("tab", { name: "Forest", exact: true }).click();
    if (name === "webkit")
      await page.waitForFunction(() => {
        const lens = document.querySelector(
          '[data-home-showcase] [data-slot="tabs-glass"] > [data-material-lens]',
        );
        return [...(lens?.previousElementSibling?.querySelectorAll("img") ?? [])].some((image) =>
          image.src.endsWith("/3.jpg"),
        );
      });
    await page.getByRole("tab", { name: "Alpine", exact: true }).click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(1800);
    const after = await sample();
    assert.ok(
      before.every((channel, index) => Math.abs(channel - after[index]) < 12),
      `${name}: initial backdrop ${before} differs from the same scene after switching back ${after}`,
    );
    if (name === "webkit") {
      assert.ok(
        initial.shade,
        `${name}: the initial copied backdrop must include the photo's shade`,
      );
      assert.ok(
        (await sourceState()).visible,
        `${name}: switching scenes must not leave a disconnected backdrop copy`,
      );
    }
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(150);
      const navigation = page.locator('[data-home-showcase] [data-slot="tabs-list-container"]');
      assert.equal(await navigation.locator('[data-slot="tabs-list-scroller"]').count(), 0);
      assert.ok(
        await navigation.evaluate((host) => {
          host.scrollTop = 100;
          host.scrollLeft = 100;
          const bounds = host.getBoundingClientRect();
          return (
            host.scrollTop === 0 &&
            host.scrollLeft === 0 &&
            [...host.querySelectorAll('[role="tab"]:not([data-tabs-overflow])')].every((tab) => {
              const rect = tab.getBoundingClientRect();
              return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1;
            })
          );
        }),
        `${name}/${width}: homepage tabs must not scroll internally`,
      );
      assert.ok(await list.getByRole("tab", { selected: true }).isVisible());
    }
    console.log(`${name}: first paint and returning Alpine retained the same shaded backdrop.`);
  } finally {
    await browser.close();
  }
}
