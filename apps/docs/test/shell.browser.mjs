import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function checkAuthoredPage(page, base, slug, headings) {
  const index = JSON.parse(
    await readFile(path.join(process.cwd(), "src/generated/lenso-docs-index.json"), "utf8"),
  );
  const entry = index.pages.find(
    (candidate) => candidate.locale === "en" && candidate.slug === slug,
  );
  assert.ok(entry, `The authored index must publish ${slug}.`);
  const url = `${base}/${entry.locale}/docs/${entry.slug}`;
  const response = await page.goto(url, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, "Authored documentation must render successfully.");
  assert.equal(page.url(), url, "The smoke must exercise the indexed page, not a fallback route.");
  await page.getByRole("heading", { name: entry.title, level: 1, exact: true }).waitFor();
  assert.equal(
    await page.locator('meta[name="description"]').getAttribute("content"),
    entry.description,
  );
  assert.equal(
    new URL(await page.locator('link[rel="canonical"]').getAttribute("href")).pathname,
    new URL(url).pathname,
  );
  for (const heading of headings)
    await page.getByRole("heading", { name: heading, level: 2, exact: true }).waitFor();
  assert.ok(
    (await page.locator("#nd-page pre code").count()) > 0,
    "Authored MDX must render code blocks.",
  );
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  const copy = page.getByRole("button", { name: "Copy Markdown", exact: true });
  await copy.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("status").filter({ hasText: "Markdown copied" }).waitFor();
  const markdown = await readFile(path.join(process.cwd(), entry.markdownFile), "utf8");
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    markdown,
    "Copied Markdown must exactly match the indexed authored source, not an archive or reformatter.",
  );
}

/**
 * Replaces the shell portion of scripts/browser-check.mjs, not its live-demo proof.
 * Regressions: the old shell had no keyboard search dialog, native theme controls,
 * locale-preserving language menu, or focus-trapped mobile navigation.
 */
export async function checkDocumentationShell(page, base) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/en/docs/react/components/button`, { waitUntil: "networkidle" });
  const title = page.getByRole("heading", { name: "Button", level: 1, exact: true });
  await title.waitFor();
  const theme = page.getByRole("group", { name: "Color theme", exact: true });
  await theme.getByRole("button", { name: "Light theme", exact: true }).click();
  const light = await page
    .locator("body")
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await theme.getByRole("button", { name: "Light theme", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await theme
      .getByRole("button", { name: "Dark theme", exact: true })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await page.keyboard.press("Space");
  await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
  const dark = await page
    .locator("body")
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  assert.notEqual(
    dark,
    light,
    "Theme controls must change actual CSS, not only their selected icon.",
  );

  // Plain text and icon-only theme selection did not prove token colors or native RTL focus.
  const example = page.locator('[data-example-name="button-basic"]');
  const importToken = example
    .locator("pre code span span")
    .filter({ hasText: /^import$/ })
    .first();
  const darkToken = await importToken.evaluate((element) => getComputedStyle(element).color);
  await theme.getByRole("button", { name: "Light theme", exact: true }).click();
  const lightToken = await importToken.evaluate((element) => getComputedStyle(element).color);
  assert.notEqual(
    lightToken,
    darkToken,
    "Code tokens must switch their actual Shiki color with the theme.",
  );
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  await theme.getByRole("button", { name: "Light theme", exact: true }).focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal(
    await theme
      .getByRole("button", { name: "Dark theme", exact: true })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await page.evaluate(() => {
    document.documentElement.dir = "ltr";
  });
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await example.getByRole("button", { name: "Copy local example source", exact: true }).click();
  const manifest = JSON.parse(
    await readFile(path.join(process.cwd(), "src/demos/live-manifest.json"), "utf8"),
  );
  const sourceFile = manifest.en?.["button-basic"];
  assert.equal(typeof sourceFile, "string", "English Button must have a registered live source.");
  assert.ok(sourceFile.length > 0, "English Button source path must not be empty.");
  const source = await readFile(path.join(process.cwd(), "src/demos", sourceFile), "utf8");
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    source,
    "Highlighting must not change raw clipboard source or add line numbers.",
  );
  const pane = example.locator("pre");
  await pane.focus();
  assert.equal(await pane.evaluate((element) => element === document.activeElement), true);

  const search = page.getByRole("button", { name: "Search documentation", exact: true });
  const searchBox = await search.boundingBox();
  const shortcutBox = await search.locator("kbd").last().boundingBox();
  assert.ok(
    Math.abs(searchBox.x + searchBox.width - shortcutBox.x - shortcutBox.width) <= 16,
    "The keyboard hint must remain right-aligned when local xstyle overrides built library styles.",
  );
  await search.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
  const input = dialog.getByRole("searchbox", { name: "Find a page", exact: true });
  await input.waitFor();
  assert.equal(await input.evaluate((element) => element === document.activeElement), true);
  await input.fill("Color area");
  const result = dialog.getByRole("link", { name: /^Color\s?Area$/i });
  await result.waitFor();
  await page.keyboard.press("ArrowDown");
  assert.equal(await result.evaluate((element) => element === document.activeElement), true);
  await page.keyboard.press("ArrowUp");
  assert.equal(await input.evaluate((element) => element === document.activeElement), true);
  await input.fill("No such documentation page");
  assert.equal(
    await dialog.getByRole("status").filter({ hasText: "No matching pages." }).count(),
    1,
  );
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await search.evaluate((element) => element === document.activeElement), true);

  await page.keyboard.press("Control+k");
  await input.waitFor();
  await input.fill("Color area");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/en/docs/react/components/color-area");
  await page.getByRole("heading", { name: /^Color\s?Area$/, level: 1 }).waitFor();

  await page.goto(`${base}/en/docs/react/components/button`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Change language", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menuitemradio", { name: "中文", exact: true }).click();
  await page.waitForURL("**/cn/docs/react/components/button");
  assert.equal(await page.locator("html").getAttribute("lang"), "zh-CN");
  assert.equal(await page.locator('link[rel="canonical"]').count(), 1);
  assert.ok(
    (await page.locator('link[rel="canonical"]').getAttribute("href")).endsWith(
      "/cn/docs/react/components/button",
    ),
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/en/docs/react/components/button`, { waitUntil: "networkidle" });
  const toc = page.getByRole("button", { name: "On this page", exact: true });
  await toc.focus();
  await page.keyboard.press("Enter");
  assert.equal(await toc.getAttribute("aria-expanded"), "true");
  await page.getByRole("link", { name: "Usage", exact: true }).click();
  assert.equal(await toc.getAttribute("aria-expanded"), "false");
  assert.equal(new URL(page.url()).hash, "#usage");
  const browse = page.getByRole("button", { name: "Browse documentation", exact: true });
  await browse.focus();
  await page.keyboard.press("Enter");
  const drawer = page.getByRole("dialog", { name: "Browse documentation", exact: true });
  await drawer.waitFor();
  const close = drawer.getByRole("button", { name: "Close documentation navigation", exact: true });
  await close.focus();
  await page.keyboard.press("Tab");
  assert.equal(await drawer.evaluate((element) => element.contains(document.activeElement)), true);
  await page.keyboard.press("Escape");
  await drawer.waitFor({ state: "hidden" });
  assert.equal(await browse.evaluate((element) => element === document.activeElement), true);
  await browse.click();
  await drawer.getByRole("link", { name: "Accordion", exact: true }).click();
  await page.waitForURL("**/en/docs/react/components/accordion");
  await page.getByRole("heading", { name: "Accordion", level: 1, exact: true }).waitFor();
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "Mobile docs must not overflow.",
  );

  // The archived colors page's JSX swatch inventory is not published Lenso.
  // Authored StyleX prose/code and exact source copying prove current MDX delivery.
  await checkAuthoredPage(page, base, "react/getting-started/stylex", [
    "Local overrides",
    "Preserve native composition",
    "Themes and tokens",
  ]);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/en/docs/react/components/button`, { waitUntil: "networkidle" });
}
