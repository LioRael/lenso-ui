import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { chromium, webkit } from "playwright";

/** Catch stale optical contours at the rendered TabBar/material boundary. */
export async function assertTabBarMotion(page, base, appearance = "light") {
  await page.goto(`${base}/en/photos`, { waitUntil: "domcontentloaded" });
  const navigation = page.getByRole("navigation", { name: "Photos navigation" });
  await navigation.locator("[data-minimize-ready]").first().waitFor();
  if (appearance === "dark") {
    await page.getByRole("button", { name: "Sort and filter", exact: true }).click();
    await page.getByRole("menuitem", { name: "View Options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Dark appearance", exact: true }).click();
  }
  await page.waitForFunction(
    (mode) =>
      getComputedStyle(document.querySelector("[data-tab-bar-group] [data-material-lens]"))
        .getPropertyValue("--lenso-material-action-mode")
        .trim() === mode,
    appearance,
  );
  const expand = navigation.getByRole("button", { name: "Expand navigation", exact: true });
  if (await expand.count()) await expand.click();
  await page.waitForFunction(() => {
    const group = document.querySelector("[data-tab-bar-group]");
    return (
      group.style.getPropertyValue("--tab-bar-collapse") === "0" &&
      [...group.closest("nav").querySelectorAll("[data-material-lens]")].every((lens) =>
        lens.hasAttribute("data-lenso-glass-foreground-rim"),
      )
    );
  });
  const group = navigation.locator("[data-tab-bar-group]").first();
  const links = group.locator("[data-tab-bar-list] [data-tab-bar-destination]");
  const origin = links.first();
  const destination = links.nth(1);
  const neutralColor = await group.evaluate((node) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--lenso-label-secondary)";
    node.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  await page.waitForFunction((neutral) => {
    const items = document.querySelectorAll(
      "[data-tab-bar-group] [data-tab-bar-list] [data-tab-bar-destination]",
    );
    return getComputedStyle(items[1]).color === neutral;
  }, neutralColor);
  const selectedColor = await origin.evaluate((node) => getComputedStyle(node).color);
  const from = await origin.boundingBox();
  const to = await destination.boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
  assert.equal(await group.getAttribute("data-highlight-active"), "");
  assert.equal(await origin.getAttribute("aria-current"), "page");
  assert.notEqual(selectedColor, neutralColor);
  assert.equal(
    await origin.evaluate((node) => getComputedStyle(node).color),
    neutralColor,
    "Lifting the lens must remove the original destination's tint, including consumer styles",
  );
  await page.mouse.up();
  await page.waitForFunction(() => {
    const group = document.querySelector("[data-tab-bar-group]");
    return !group.hasAttribute("data-highlight-active");
  });
  assert.equal(await destination.getAttribute("aria-current"), "page");
  assert.equal(await origin.getAttribute("aria-current"), null);
  assert.equal(await destination.evaluate((node) => getComputedStyle(node).color), selectedColor);
  await origin.click();
  await page.waitForFunction(() => {
    const group = document.querySelector("[data-tab-bar-group]");
    return !group.hasAttribute("data-highlight-active");
  });
  const result = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const group = document.querySelector("[data-tab-bar-group]");
        const lenses = [...group.closest("nav").querySelectorAll("[data-material-lens]")];
        const main = document.querySelector("main");
        const failures = [];
        let samples = 0;
        const dimensions = (url) => {
          if (!url?.startsWith("data:image/png;base64,")) return;
          const bytes = Uint8Array.from(atob(url.split(",")[1]).slice(0, 24), (c) =>
            c.charCodeAt(0),
          );
          const view = new DataView(bytes.buffer);
          return [view.getUint32(16), view.getUint32(20)];
        };
        const sample = (lens) => {
          samples++;
          const style = getComputedStyle(lens);
          const width = parseFloat(style.width),
            height = parseFloat(style.height);
          const id = /#([^"')]+)/.exec(style.getPropertyValue("--lg-filter"))?.[1];
          const field = id && document.getElementById(id)?.querySelector('feImage[result="field"]');
          const bitmap = dimensions(field?.getAttribute("href"));
          const rim = getComputedStyle(lens, "::after").backgroundImage;
          const rimSize = dimensions(/url\("?(data:image\/png;base64,[^")]+)/.exec(rim)?.[1]);
          if (
            bitmap &&
            (Math.abs(bitmap[0] / 2 - width) > 1 || Math.abs(bitmap[1] / 2 - height) > 1)
          )
            failures.push({ kind: "stretched-field", width, height, bitmap });
          if (
            rimSize &&
            (Math.abs(rimSize[0] / 2 - 2 - width) > 1 || Math.abs(rimSize[1] / 2 - 2 - height) > 1)
          )
            failures.push({
              kind: "stale-rim",
              width,
              height,
              rimSize,
              resizing: lens.hasAttribute("data-material-resizing"),
              measured: [lens.offsetWidth, lens.offsetHeight],
            });
        };
        const observer = new ResizeObserver(() => queueMicrotask(() => lenses.forEach(sample)));
        for (const lens of lenses) observer.observe(lens);
        let frame = 0;
        const tick = () => {
          frame++;
          if ([1, 16, 36].includes(frame)) main.scrollTop = 0;
          if ([8, 24, 54].includes(frame)) main.scrollTop = 140;
          if (frame < 100) requestAnimationFrame(tick);
          else {
            observer.disconnect();
            resolve({ samples, failures });
          }
        };
        requestAnimationFrame(tick);
      }),
  );
  assert.ok(result.samples >= 10, "The check must exercise intermediate material sizes");
  assert.deepEqual(result.failures, [], "A resized lens must not stretch a previous contour");
  return result.samples;
}

export async function assertVerticalMinimize(page, base, shots) {
  await page.goto(`${base}/en/docs/react/components/tab-bar?scenario=Vertical`, {
    waitUntil: "domcontentloaded",
  });
  const story = page.locator('[data-component-story="TabBar"]');
  const nav = story.getByRole("navigation", { name: "Main navigation", exact: true });
  const group = nav.locator('[data-tab-bar-group][data-layout="vertical"]');
  const selected = nav.getByRole("link", { name: "Recent", exact: true });
  const collapse = story.getByRole("button", { name: "Minimize navigation", exact: true });
  const expand = nav.getByRole("button", { name: "Expand navigation", exact: true });
  await group.and(nav.locator("[data-indicator-ready]")).waitFor();
  await selected.press("Enter");
  await selected.and(nav.locator('[aria-current="page"]')).waitFor();
  const element = await group.elementHandle();
  const settle = (height) =>
    page.waitForFunction(
      ([node, size]) => Math.abs(node.getBoundingClientRect().height - size) < 0.1,
      [element, height],
    );
  const capture = async (state) => {
    if (!shots) return;
    await group.scrollIntoViewIfNeeded();
    const { x, y, width, height } = await group.boundingBox();
    await page.screenshot({
      path: `${shots}-${state}.png`,
      clip: { x: x + width / 2 - 58, y: y - 12, width: 116, height: height + 24 },
    });
  };
  const expandedHeight = await group.evaluate((node) => node.offsetHeight);
  assert.ok(expandedHeight > 3 * 44);
  await settle(expandedHeight);
  if (shots) {
    await selected.blur();
    await page.waitForFunction((node) => {
      const current = node
        .querySelector("[data-tab-bar-list] [data-current]")
        .getBoundingClientRect();
      const paint = node
        .querySelector('[data-lenso-slot="tab-bar-indicator"]')
        .getBoundingClientRect();
      return Math.abs(current.y + current.height / 2 - paint.y - paint.height / 2) < 0.5;
    }, element);
  }
  await capture("expanded");
  await collapse.click();
  await settle(48);
  const geometry = await group.evaluate((node) => {
    const bounds = node.getBoundingClientRect();
    const current = node.querySelector("[data-tab-bar-list] [data-current]");
    const icon = current.querySelector("svg").getBoundingClientRect();
    return {
      label: current.textContent,
      width: bounds.width,
      dx: icon.x + icon.width / 2 - (bounds.x + bounds.width / 2),
      dy: icon.y + icon.height / 2 - (bounds.y + bounds.height / 2),
    };
  });
  assert.equal(geometry.label, "Recent");
  assert.ok(Math.abs(geometry.width - 48) < 0.5, "The compact rail keeps its width");
  assert.ok(Math.hypot(geometry.dx, geometry.dy) < 0.5, "Center the actual current destination");
  assert.equal(await nav.getByRole("link").count(), 0, "Collapsed links are not exposed");
  await capture("collapsed");
  await expand.press("Enter");
  await settle(expandedHeight);
  assert.ok(await selected.evaluate((node) => node === document.activeElement));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await collapse.click();
  assert.equal(await group.evaluate((node) => node.offsetHeight), 48);
  await expand.click();
  assert.equal(await group.evaluate((node) => node.offsetHeight), expandedHeight);
}

export async function assertTabletMinimize(page, base) {
  await page.goto(`${base}/en/docs/react/components/tab-bar?scenario=Tablet`, {
    waitUntil: "domcontentloaded",
  });
  const story = page.locator('[data-component-story="TabBar"]');
  const nav = story.getByRole("navigation", { name: "Main navigation", exact: true });
  const group = nav.locator('[data-tab-bar-group][data-layout="tablet"][data-indicator-ready]');
  await group.waitFor();
  const expanded = await group.boundingBox();
  const selected = nav.getByRole("link", { name: "Search", exact: true });
  await selected.press("Enter");
  await selected.and(nav.locator('[aria-current="page"]')).waitFor();
  const element = await group.elementHandle();
  await story.getByRole("button", { name: "Minimize navigation", exact: true }).click();
  await page.waitForFunction(
    (node) => node.style.getPropertyValue("--tab-bar-collapse") === "1",
    element,
  );
  assert.ok(Math.abs((await group.boundingBox()).width - 44) < 1);
  await nav.getByRole("button", { name: "Expand navigation", exact: true }).click();
  await page.waitForFunction(
    (node) => node.style.getPropertyValue("--tab-bar-collapse") === "0",
    element,
  );
  assert.ok(Math.abs((await group.boundingBox()).width - expanded.width) < 1);
  assert.ok(await selected.evaluate((node) => node === document.activeElement));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch();
    try {
      const vertical = await browser.newPage({ viewport: { width: 1280, height: 980 } });
      await assertVerticalMinimize(vertical, process.env.DOCS_URL ?? "http://127.0.0.1:3000");
      await vertical.close();
      console.log(`${name}: vertical compact geometry, focus and reduced motion passed`);
      const tablet = await browser.newPage({ viewport: { width: 1100, height: 900 } });
      await assertTabletMinimize(tablet, process.env.DOCS_URL ?? "http://127.0.0.1:3000");
      await tablet.close();
      console.log(`${name}: tablet selected destination, minimization and focus passed`);
      for (const colorScheme of ["light", "dark"]) {
        for (const width of [390, 590]) {
          const page = await browser.newPage({
            viewport: { width, height: 795 },
            deviceScaleFactor: 2,
            colorScheme,
          });
          const samples = await assertTabBarMotion(
            page,
            process.env.DOCS_URL ?? "http://127.0.0.1:3000",
            colorScheme,
          );
          console.log(
            `${name} ${colorScheme} ${width}px: ${samples} optical continuity samples passed`,
          );
          await page.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
}
