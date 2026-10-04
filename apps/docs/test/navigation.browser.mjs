import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const docs = fileURLToPath(new URL("../", import.meta.url));
const output = path.resolve(docs, "../../test-results/docs-navigation");
const base = process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:3000";
const index = JSON.parse(
  await readFile(path.join(docs, "src/generated/lenso-docs-index.json"), "utf8"),
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = { cases: [], errors: [] };

async function assertIndicator(page, navigation) {
  const active = navigation.locator('a[aria-current="location"]');
  assert.equal(await active.count(), 1);
  const indicator = await active.evaluate((element) => {
    const marker = getComputedStyle(element, "::before");
    return {
      width: marker.width,
      color: marker.backgroundColor,
      height: element.getBoundingClientRect().height,
    };
  });
  assert.equal(indicator.width, "2px");
  assert.notEqual(indicator.color, "rgba(0, 0, 0, 0)");
  assert.ok(indicator.height >= 20);
}

try {
  for (const locale of ["en", "cn"]) {
    const guides = index.pages
      .filter((page) => page.locale === locale && page.navigationGroup)
      .sort((a, b) => a.navigationOrder - b.navigationOrder);
    assert.equal(guides.length, 15);
    for (const width of [1440, 390])
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
        });
        await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
        const page = await context.newPage();
        page.on("pageerror", (error) => report.errors.push(error.message));
        const url = `${base}/${locale}/docs/react/getting-started`;
        assert.equal((await page.goto(url, { waitUntil: "networkidle" })).status(), 200);
        const tocLabel = locale === "cn" ? "本页内容" : "On this page";
        const navigation =
          width === 1440
            ? page.locator("#nd-toc nav")
            : page.getByRole("navigation", { name: tocLabel });
        if (width === 390) {
          const trigger = page.getByRole("button", { name: tocLabel, exact: true });
          await trigger.focus();
          await page.keyboard.press("Enter");
        }
        await assertIndicator(page, navigation);
        const second = navigation.locator("a").nth(1);
        const destination = await second.getAttribute("href");
        await second.focus();
        await page.keyboard.press("Enter");
        await page.waitForFunction(
          (hash) => location.hash === new URL(hash, location.href).hash,
          destination,
        );
        await page.waitForFunction(
          (hash) => document.querySelector(`#nd-toc a[href="${hash}"][aria-current="location"]`),
          destination,
        );
        if (width === 390) await page.getByRole("button", { name: tocLabel, exact: true }).click();
        await assertIndicator(page, navigation);
        if (width === 1440) {
          const labels = await page.locator("#nd-sidebar nav a").allTextContents();
          assert.deepEqual(
            labels.map((label) => label.trim()),
            guides.map((guide) => guide.title),
          );
          const hiddenIndicator = await page.addStyleTag({
            content:
              '#nd-toc a[aria-current="location"]::before { background-color: transparent !important; }',
          });
          await assert.rejects(() => assertIndicator(page, navigation));
          await hiddenIndicator.evaluate((element) => element.remove());
          await assertIndicator(page, navigation);
        }
        const footer = page.getByRole("navigation", { name: "Adjacent pages" });
        const next = footer.getByRole("link");
        assert.equal(await next.count(), 1);
        assert.ok((await next.getAttribute("href")).endsWith("/getting-started/installation"));
        await next.scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForFunction(
          () =>
            document.querySelector("#nd-toc nav a:last-child")?.getAttribute("aria-current") ===
            "location",
        );
        const geometry = await next.evaluate((element) => {
          const css = getComputedStyle(element);
          return {
            border: css.borderTopWidth,
            radius: css.borderRadius,
            gap: css.gap,
            width: element.getBoundingClientRect().width,
          };
        });
        assert.equal(geometry.border, "0px");
        assert.equal(geometry.radius, "16px");
        assert.equal(geometry.gap, "8px");
        assert.ok(geometry.width > 200);
        await page.screenshot({
          path: path.join(output, `${locale}-${theme}-${width}-footer.png`),
        });
        await next.focus();
        await page.keyboard.press("Enter");
        await page.waitForURL(`**/${locale}/docs/react/getting-started/installation`);
        await page.getByRole("heading", { name: guides[1].title, level: 1, exact: true }).waitFor();
        const adjacent = page.getByRole("navigation", { name: "Adjacent pages" }).getByRole("link");
        assert.equal(await adjacent.count(), 2);
        for (const guide of guides) {
          const response = await page.request.get(`${base}/${locale}/docs/${guide.slug}`);
          assert.equal(response.status(), 200, guide.slug);
          await response.dispose();
        }
        await page.goto(url, { waitUntil: "networkidle" });
        await page.screenshot({ path: path.join(output, `${locale}-${theme}-${width}.png`) });
        report.cases.push({ locale, theme, width, guides: guides.length });
        await context.close();
      }
  }
  assert.deepEqual(report.errors, []);
  console.log(
    "Navigation proof passed: visible active TOC indicators, keyboard anchors, authored guide order, adjacent-page geometry and 30 live guide routes.",
  );
} finally {
  await browser.close();
  await writeFile(path.join(output, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
}
