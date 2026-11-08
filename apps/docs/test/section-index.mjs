import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

// The isolated section fixture does not cover docs scroll ownership, contact-row
// divider guides or the shared navigation/section-header backdrop.
const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
async function backdropDetail(page, scene) {
  await scene.evaluate(async (root) => {
    const pattern = document.createElement("div");
    pattern.dataset.sectionIndexPattern = "";
    Object.assign(pattern.style, {
      position: "absolute",
      inset: "0",
      zIndex: "0",
      pointerEvents: "none",
      background: "repeating-linear-gradient(90deg, black 0px 4px, white 4px 8px)",
    });
    root.querySelector('[data-slot="scroll-edge"]').before(pattern);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  try {
    const box = await scene.boundingBox();
    const sample = async () => {
      const png = await page.screenshot();
      return await page.evaluate(
        async ({ encoded, x, y }) => {
          const image = new Image();
          image.src = `data:image/png;base64,${encoded}`;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          const scale = image.width / innerWidth;
          const deviation = (top, height) => {
            const pixels = context.getImageData(
              Math.round(x * scale),
              Math.round((y + top) * scale),
              Math.round(96 * scale),
              Math.round(height * scale),
            ).data;
            const values = [];
            for (let i = 0; i < pixels.length; i += 4) values.push(pixels[i]);
            const mean = values.reduce((sum, n) => sum + n, 0) / values.length;
            return Math.sqrt(values.reduce((sum, n) => sum + (n - mean) ** 2, 0) / values.length);
          };
          return { protected: deviation(0, 8), tail: deviation(40, 4) };
        },
        { encoded: png.toString("base64"), x: box.x + 100, y: box.y + 76 },
      );
    };
    const detail = await sample();
    if (detail.protected >= 30) {
      await scene.evaluate(async (root) => {
        const reference = document.createElement("div");
        reference.dataset.sectionIndexBlurReference = "";
        Object.assign(reference.style, {
          position: "absolute",
          inset: "0",
          zIndex: "1",
          backdropFilter: "blur(4.2px)",
          background: "rgb(255 255 255 / .01)",
        });
        root.querySelector('[data-slot="scroll-edge"]').after(reference);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      try {
        detail.reference = (await sample()).protected;
      } finally {
        await scene
          .locator("[data-section-index-blur-reference]")
          .evaluate((node) => node.remove());
      }
    }
    return detail;
  } finally {
    await scene.locator("[data-section-index-pattern]").evaluate((node) => node.remove());
  }
}
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    for (const theme of ["light", "dark"]) {
      for (const width of [390, 1280]) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
          deviceScaleFactor: width === 390 ? 3 : 1,
          hasTouch: true,
          reducedMotion: "reduce",
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
        await page.goto(
          `${base}/${width === 390 ? "cn" : "en"}/docs/react/components/section-index`,
          {
            waitUntil: "networkidle",
            timeout: 60000,
          },
        );
        const nav = page.getByRole("navigation", { name: "Produce sections", exact: true });
        await nav.waitFor();
        await nav.scrollIntoViewIfNeeded();
        const scene = nav.locator("..");
        const viewport = scene.locator('[data-slot="section-index-viewport"]');
        await scene.locator('[data-slot="navigation-bar"]').waitFor();
        assert.equal(await nav.getByRole("link").count(), 27);
        assert.deepEqual(
          await scene.evaluate((root) => {
            const row = root.querySelector("li");
            const header = root.querySelector("h3");
            const avatar = row.querySelector('[data-slot="avatar"]');
            const title = row.querySelector('[data-slot="list-title"]');
            const rowRule = getComputedStyle(row, "::after");
            const headerRule = getComputedStyle(header, "::after");
            const index = getComputedStyle(root.querySelector('[data-slot="section-index-item"]'));
            return {
              rowHeight: row.getBoundingClientRect().height,
              avatarWidth: avatar.getBoundingClientRect().width,
              leading: avatar.getBoundingClientRect().left - row.getBoundingClientRect().left,
              titleLeading: title.getBoundingClientRect().left - row.getBoundingClientRect().left,
              paddingBlock: getComputedStyle(row).paddingBlock,
              titleSize: getComputedStyle(title).fontSize,
              headerSize: getComputedStyle(header).fontSize,
              headerHeight: header.getBoundingClientRect().height,
              indexFont: [index.fontSize, index.lineHeight, index.fontWeight],
              rowRule: [rowRule.insetInlineStart, rowRule.insetInlineEnd, rowRule.height],
              headerRule: [
                headerRule.insetInlineStart,
                headerRule.insetInlineEnd,
                headerRule.height,
              ],
            };
          }),
          {
            rowHeight: 77,
            avatarWidth: 45,
            leading: 16,
            titleLeading: 77,
            paddingBlock: "16px",
            titleSize: "17px",
            headerSize: "17px",
            headerHeight: 36,
            indexFont: ["11px", "13.8px", "600"],
            rowRule: ["77px", "16px", "1px"],
            headerRule: ["16px", "16px", "1px"],
          },
        );
        assert.equal(await scene.locator('[data-slot="scroll-edge"]').count(), 1);
        if (theme === "dark")
          assert.equal(
            await nav
              .getByRole("link")
              .first()
              .evaluate((node) => getComputedStyle(node).color),
            "rgb(0, 145, 255)",
          );
        const outerScroll = await page.evaluate(() => scrollY);
        const initial = await nav.boundingBox();
        const m = nav.getByRole("link", { name: "M", exact: true });
        const end = nav.getByRole("link", { name: "#", exact: true });
        await m.click();
        await m.and(nav.locator('[aria-current="location"]')).waitFor();
        await scene.locator('[data-slot="scroll-edge"][data-scroll-active]').waitFor();
        assert.equal(await page.evaluate(() => scrollY), outerScroll);
        assert.ok(
          await scene.evaluate((node) => {
            const scroll = node.querySelector('[data-slot="section-index-viewport"]');
            const heading = node.querySelector('[data-slot="section-index-sticky-heading"]');
            return (
              scroll.scrollTop > 1000 &&
              Math.abs(
                heading.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 60,
              ) < 1 &&
              heading.textContent === "M" &&
              getComputedStyle(heading).backgroundColor === "rgba(0, 0, 0, 0)" &&
              Math.abs(
                parseFloat(getComputedStyle(heading, "::after").height) - 1 / devicePixelRatio,
              ) < 0.02 &&
              getComputedStyle(node.querySelector('[data-slot="scroll-edge"]')).height === "120px"
            );
          }),
        );
        const detail = await backdropDetail(page, scene);
        if (detail.reference === undefined || detail.reference < 30) {
          assert.ok(
            detail.protected < 30,
            `sharp content leaked behind the pinned title (${detail.protected.toFixed(2)})`,
          );
        } else {
          console.log(
            `${name} ${theme} ${width}px: native blur control unavailable; pixel blur acceptance requires physical Safari`,
          );
        }
        assert.ok(
          detail.tail > 80,
          `the edge did not clear below the title (${detail.tail.toFixed(2)})`,
        );
        await viewport.evaluate((node) => {
          const next = [...node.querySelectorAll("h3")].find(
            (heading) => heading.textContent === "N",
          );
          node.scrollTop = next.parentElement.offsetTop - 60 - 18;
        });
        const stickyTitle = scene.locator('[data-slot="section-index-sticky-heading"] > div');
        await page.waitForFunction(
          (node) => getComputedStyle(node).transform === "matrix(1, 0, 0, 1, 0, -18)",
          await stickyTitle.elementHandle(),
          { timeout: 5000 },
        );
        assert.equal(await stickyTitle.textContent(), "M");
        await viewport.evaluate((node) => {
          node.scrollTop += 18;
        });
        await nav
          .getByRole("link", { name: "N", exact: true })
          .and(nav.locator('[aria-current="location"]'))
          .waitFor();
        await m.click();
        await m.and(nav.locator('[aria-current="location"]')).waitFor();
        await m.press("End");
        assert.ok(await end.evaluate((node) => node === node.getRootNode().activeElement));
        assert.equal(await m.getAttribute("aria-current"), "location");
        const first = await nav.getByRole("link", { name: "A", exact: true }).boundingBox();
        const last = await end.boundingBox();
        await page.mouse.move(initial.x + 4, first.y + first.height / 2);
        await page.mouse.down();
        await nav
          .getByRole("link", { name: "A", exact: true })
          .and(nav.locator('[aria-current="location"]'))
          .waitFor();
        await page.mouse.move(initial.x - 20, last.y + last.height / 2, { steps: 12 });
        await page.mouse.up();
        assert.equal(await page.evaluate(() => scrollY), outerScroll);
        const after = await nav.boundingBox();
        assert.ok(Math.abs(initial.y - after.y) < 1, "the index stays fixed while scrubbing");
        await viewport.evaluate((node) => {
          node.scrollTop = 0;
        });
        await nav
          .getByRole("link", { name: "A", exact: true })
          .and(nav.locator('[aria-current="location"]'))
          .waitFor();
        if (name === "chromium") {
          const cdp = await page.context().newCDPSession(page);
          const middle = await m.boundingBox();
          const send = (type, y) =>
            cdp.send("Input.dispatchTouchEvent", {
              type,
              touchPoints: type === "touchCancel" ? [] : [{ x: initial.x + 4, y }],
            });
          await send("touchStart", first.y + first.height / 2);
          await send("touchMove", middle.y + middle.height / 2);
          await m.and(nav.locator('[aria-current="location"]')).waitFor();
          await send("touchCancel", 0);
          assert.equal(await page.evaluate(() => scrollY), outerScroll);
          await cdp.detach();
        }
        await page.getByRole("switch", { name: "disabled", exact: true }).click();
        assert.equal(await nav.locator('[aria-disabled="true"]').count(), 27);
        assert.equal(await nav.locator('[tabindex="0"]').count(), 0);
        assert.deepEqual(errors, []);
        console.log(
          `${name} ${theme} ${width}px: local scrolling, fixed index, press/drag, scroll spy, keyboard and disabled passed`,
        );
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
