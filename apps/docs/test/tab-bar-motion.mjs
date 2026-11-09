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

export async function assertTabletMinimize(page, base) {
  await page.goto(`${base}/en/docs/react/components/tab-bar`);
  await page.locator("summary").filter({ hasText: "Composition and actions (1)" }).click();
  const example = page.locator('[data-example-name="tab-bar-tablet"]');
  await example.scrollIntoViewIfNeeded();
  const nav = example.getByRole("navigation", { name: "Main navigation", exact: true });
  const group = nav.locator("[data-tab-bar-group]");
  // Nearby deferred previews can move this scene after the first scroll.
  for (let attempt = 0; attempt < 12 && !(await group.count()); attempt++) {
    await example.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
  }
  await group.locator("[data-tab-bar-list]").waitFor();
  await page.waitForLoadState("networkidle");
  const expanded = await group.boundingBox();
  const selected = nav.getByRole("link", { name: "Search", exact: true });
  await selected.click();
  const element = await group.elementHandle();
  await example.getByRole("button", { name: "Minimize navigation", exact: true }).click();
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
