import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const index = JSON.parse(
  await readFile(new URL("../src/generated/lenso-docs-index.json", import.meta.url), "utf8"),
);
const evidence = new URL("../../../test-results/components-overview/", import.meta.url);

// A route/content check cannot catch missing authored categories, broken thumbnail
// delivery, mobile reading order or a reference-link hover that matches its rest color.
export async function checkComponentsOverview(browser, base) {
  await mkdir(evidence, { recursive: true });
  const results = [];
  const errors = [];
  for (const locale of ["en", "cn"]) {
    for (const theme of ["light", "dark"]) {
      for (const width of [390, 1440]) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
        try {
          const page = await context.newPage();
          page.on("pageerror", (error) => errors.push(error.message));
          const response = await page.goto(`${base}/${locale}/docs/react/components`);
          assert.equal(response.status(), 200);
          await page.waitForFunction(
            (value) => document.documentElement.classList.contains(value),
            theme,
          );
          const galleries = page.locator("[data-component-gallery]");
          const cards = galleries.getByRole("link");
          const hrefs = await cards.evaluateAll((nodes) => nodes.map((node) => node.pathname));
          const families = index.pages.filter(
            (entry) => entry.locale === locale && entry.slug.startsWith("react/components/"),
          );
          assert.deepEqual(
            hrefs.toSorted(),
            families.map((entry) => `/${locale}/docs/${entry.slug}`).toSorted(),
            "Every current public family must have exactly one gallery link.",
          );
          assert.equal(
            await galleries.count(),
            new Set(families.map((p) => p.componentCategory)).size,
          );
          const button = cards.filter({ hasText: /^Button$/ });
          const image = button.locator("img:visible");
          await image.waitFor();
          await image.evaluate((node) => node.decode());
          assert.ok((await image.getAttribute("src")).includes(`/${theme}-button.png`));
          const geometry = await button.evaluate((node) => {
            const title = node.firstElementChild.getBoundingClientRect();
            const preview = node.lastElementChild.getBoundingClientRect();
            const grid = getComputedStyle(node.parentElement);
            return {
              columns: grid.gridTemplateColumns.split(" ").length,
              columnGap: grid.columnGap,
              rowGap: grid.rowGap,
              previewHeight: preview.height,
              titleAbove: title.top < preview.top,
            };
          });
          assert.equal(geometry.columns, width < 640 ? 1 : 3);
          assert.equal(geometry.columnGap, "16px");
          assert.equal(geometry.rowGap, "40px");
          assert.equal(geometry.previewHeight, 198);
          assert.equal(geometry.titleAbove, width < 640);
          assert.ok(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
            ),
          );
          await page.screenshot({
            path: fileURLToPath(new URL(`${locale}-${theme}-${width}-overview.png`, evidence)),
          });
          await button.focus();
          const focus = await button.evaluate((node) => ({
            active: node === document.activeElement,
            outline: getComputedStyle(node).outlineStyle,
          }));
          assert.equal(focus.active, true);
          assert.equal(focus.outline, "solid");
          await page.keyboard.press("Enter");
          await page.waitForURL(`${base}/${locale}/docs/react/components/button`);

          const references = page.getByRole("navigation", { name: "Component references" });
          const link = references.getByRole("link", { name: "Source", exact: true });
          assert.equal(await references.getByRole("button").count(), 0);
          assert.equal(await link.getAttribute("target"), "_blank");
          assert.ok((await link.getAttribute("rel")).includes("noopener"));
          await page.mouse.move(0, 0);
          const resting = await link.evaluate((node) => ({
            background: getComputedStyle(node).backgroundColor,
            height: node.getBoundingClientRect().height,
          }));
          assert.equal(resting.height, width < 768 ? 36 : 32);
          await link.hover();
          const hovered = await link.evaluate((node) => {
            const probe = document.createElement("span");
            probe.style.backgroundColor = "var(--default-hover)";
            node.parentElement.append(probe);
            const expected = getComputedStyle(probe).backgroundColor;
            probe.remove();
            return { background: getComputedStyle(node).backgroundColor, expected };
          });
          assert.notEqual(hovered.background, resting.background);
          assert.equal(hovered.background, hovered.expected);
          await page.mouse.move(0, 0);
          await link.focus();
          assert.equal(await link.evaluate((node) => node === document.activeElement), true);
          assert.notEqual(await link.evaluate((node) => getComputedStyle(node).boxShadow), "none");
          await page.screenshot({
            path: fileURLToPath(new URL(`${locale}-${theme}-${width}-links.png`, evidence)),
          });
          results.push({
            locale,
            theme,
            width,
            families: hrefs.length,
            geometry,
            resting,
            hovered,
          });
        } finally {
          await context.close();
        }
      }
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(
    new URL("results.json", evidence),
    JSON.stringify({ results, errors }, null, 2) + "\n",
  );
  console.log(
    "Components overview and reference links: EN/CN × light/dark × desktop/mobile passed.",
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const browser = await chromium.launch({ headless: true });
  try {
    await checkComponentsOverview(
      browser,
      process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:3000",
    );
  } finally {
    await browser.close();
  }
}
