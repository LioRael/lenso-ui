import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const docs = fileURLToPath(new URL("../", import.meta.url));
const root = path.resolve(docs, "../..");
const base = process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:3000";
const index = JSON.parse(
  await readFile(path.join(docs, "src/generated/lenso-docs-index.json"), "utf8"),
);
const packageInfo = JSON.parse(
  await readFile(path.join(root, "packages/react/package.json"), "utf8"),
);
assert.equal(index.lensoVersion, packageInfo.version);
const output = path.join(root, "test-results/lenso-docs-projection");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const checkedNavigation = new Map();
const report = {
  lensoVersion: index.lensoVersion,
  scope: "authored EN/CN guides, Menu, navigation, search, sitemap and exact Copy Markdown",
  cases: [],
  errors: [],
};
try {
  for (const locale of ["en", "cn"]) {
    for (const mode of [
      { width: 1440, theme: "light" },
      { width: 1440, theme: "dark" },
      { width: 390, theme: "light" },
      { width: 390, theme: "dark" },
    ]) {
      const context = await browser.newContext({
        viewport: { width: mode.width, height: 900 },
        permissions: ["clipboard-read", "clipboard-write"],
        colorScheme: mode.theme,
      });
      await context.addInitScript((theme) => localStorage.setItem("theme", theme), mode.theme);
      const page = await context.newPage();
      page.on("pageerror", (error) => report.errors.push(error.message));
      const corePages = index.pages.filter(
        (entry) =>
          entry.locale === locale &&
          (entry.slug.startsWith("react/getting-started") ||
            entry.slug.startsWith("react/tools") ||
            entry.slug === "react/components/menu" ||
            entry.slug === "react/components"),
      );
      for (const entry of corePages) {
        const response = await page.goto(`${base}/${locale}/docs/${entry.slug}`, {
          waitUntil: "networkidle",
        });
        assert.equal(response.status(), 200);
        assert.equal(
          await page.getByRole("heading", { level: 1, name: entry.title, exact: true }).count(),
          1,
        );
        await page.waitForFunction(
          (theme) => document.documentElement.classList.contains(theme),
          mode.theme,
        );
        assert.ok((await page.locator("header").textContent()).includes(`v${index.lensoVersion}`));
        const hrefs = await page
          .locator('a[href*="/docs/react/"]')
          .evaluateAll((elements) => elements.map((element) => element.getAttribute("href")));
        assert.ok(
          hrefs.every(
            (href) => !/\/(?:migration|releases)(?:\/|$)|\/components\/dropdown(?:\/|$)/.test(href),
          ),
        );
        const navigation = await page
          .locator("header a[href], #nd-sidebar a[href]")
          .evaluateAll((elements) => elements.map((element) => element.getAttribute("href")));
        for (const href of new Set(navigation.filter((value) => value.startsWith("/")))) {
          if (checkedNavigation.has(href)) continue;
          const destination = await page.request.get(new URL(href, base).href);
          assert.equal(
            destination.status(),
            200,
            `Unregistered public navigation destination: ${href}`,
          );
          checkedNavigation.set(href, destination.status());
          await destination.dispose();
        }
        await page.getByRole("button", { name: "Copy Markdown", exact: true }).click();
        const copied = await page.evaluate(() => navigator.clipboard.readText());
        assert.equal(copied, await readFile(path.join(docs, entry.markdownFile), "utf8"));
        if (entry.slug === "react/components/menu") {
          for (const example of entry.examples) {
            const scene = page.locator(
              `[data-example-name=${JSON.stringify(example.name)}] [data-example-mounted=${JSON.stringify(example.file)}]`,
            );
            assert.equal(
              await scene.count(),
              1,
              `Menu placement missing ${locale}:${example.name}`,
            );
          }
          assert.ok(!/\bDropdown(?:Root|Trigger|Popup|Positioner)\b/.test(copied));
        }
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
          ),
        );
        report.cases.push({ locale, slug: entry.slug, ...mode, copyMatchesAuthoredFile: true });
        await writeFile(
          path.join(output, "authored-browser.json"),
          `${JSON.stringify(report, null, 2)}\n`,
        );
        console.log(
          `${locale}/${entry.slug} ${mode.theme}/${mode.width}: exact Markdown and registered navigation passed.`,
        );
      }
      await page.keyboard.press("Control+k");
      const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
      const input = dialog.getByRole("searchbox", { name: "Find a page", exact: true });
      await input.fill("Menu");
      const results = await dialog
        .getByRole("link")
        .evaluateAll((elements) => elements.map((element) => element.getAttribute("href")));
      assert.ok(results.includes(`/${locale}/docs/react/components/menu`));
      assert.ok(results.every((href) => !href.includes("dropdown")));
      await input.fill("migration");
      assert.equal(await dialog.getByRole("link").count(), 0);
      await input.fill("Menu");
      await input.press("ArrowDown");
      await page.keyboard.press("Enter");
      await page.waitForURL(`${base}/${locale}/docs/react/components/menu`);
      await page.goto(`${base}/${locale}/docs/react/components/dropdown`, {
        waitUntil: "networkidle",
      });
      assert.equal(new URL(page.url()).pathname, `/${locale}/docs/react/components/menu`);
      const removed = await page.request.get(`${base}/${locale}/docs/react/migration`);
      assert.equal(removed.status(), 404);
      await page.screenshot({
        path: path.join(output, `${locale}-menu-${mode.width}-${mode.theme}.png`),
      });
      await context.close();
    }
  }
  const response = await fetch(`${base}/sitemap.xml`);
  assert.equal(response.status, 200);
  const sitemap = await response.text();
  assert.ok(!/\/docs\/react\/(?:migration|releases)|\/components\/dropdown/.test(sitemap));
  for (const entry of index.pages)
    assert.ok(sitemap.includes(`/${entry.locale}/docs/${entry.slug}`));
  assert.deepEqual(report.errors, []);
} finally {
  await writeFile(
    path.join(output, "authored-browser.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  await browser.close();
}
console.log(
  `${report.cases.length} authored route cases; search, canonical Menu redirects and sitemap passed.`,
);
