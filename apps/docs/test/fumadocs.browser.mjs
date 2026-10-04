import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { checkAuthoredPage, checkDocumentationShell } from "./shell.browser.mjs";

const require = createRequire(import.meta.url);
const base = process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:3000";
const evidence = process.env.LENSO_FUMA_EVIDENCE ?? "../../test-results/fumadocs";
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();
const errors = [];
const results = [];
try {
  for (const locale of ["en", "cn"]) {
    for (const theme of ["light", "dark"]) {
      for (const width of [1440, 390]) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
          reducedMotion: "reduce",
        });
        const requests = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("request", (request) => {
          const path = new URL(request.url()).pathname;
          if (path.includes("/search")) requests.push(path);
        });
        const name = `${locale}-${theme}-${width}`;
        await page.goto(`${base}/${locale}/docs/react/components/button`, {
          waitUntil: "networkidle",
        });
        await page.evaluate((theme) => localStorage.setItem("theme", theme), theme);
        await page.reload({ waitUntil: "networkidle" });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (width === 390) {
          const toc = page.getByRole("button", {
            name: locale === "cn" ? "本页内容" : "On this page",
            exact: true,
          });
          await toc.click();
          assert.equal(await toc.getAttribute("aria-expanded"), "true");
          await page.screenshot({ path: `${evidence}/${name}-toc.png` });
          await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
          assert.deepEqual(
            await page.evaluate(
              async () =>
                (
                  await window.axe.run(document, {
                    rules: { "color-contrast": { enabled: false } },
                  })
                ).violations,
            ),
            [],
          );
          await toc.click();
          const browse = page.getByRole("button", { name: "Browse documentation", exact: true });
          await browse.click();
          await page.screenshot({ path: `${evidence}/${name}-sidebar.png` });
          await page.keyboard.press("Escape");
          assert.equal(await browse.evaluate((node) => node === document.activeElement), true);
        }
        await page.screenshot({ path: `${evidence}/${name}-page.png` });
        const trigger = page.getByRole("button", { name: "Search documentation", exact: true });
        await trigger.focus();
        await page.keyboard.press("Control+k");
        const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
        const input = dialog.getByRole("textbox", { name: "Find a page", exact: true });
        await input.waitFor();
        assert.equal(await input.evaluate((node) => node === document.activeElement), true);
        await input.fill(locale === "cn" ? "键盘" : "Button");
        const expected = dialog
          .getByRole("button", {
            name: locale === "cn" ? "Kbd" : "Button",
            exact: true,
          })
          .and(dialog.locator('[data-docs-result-type="page"]'));
        await expected.waitFor();
        const popup = await dialog.boundingBox();
        assert.equal(popup.width, width === 390 ? 374 : 640);
        assert.equal(popup.x + popup.width / 2, width / 2);
        const escapeKey = await dialog
          .getByRole("button", { name: "Close search", exact: true })
          .locator("kbd")
          .evaluate((node) => ({
            height: node.getBoundingClientRect().height,
            font: getComputedStyle(node).fontSize,
            radius: getComputedStyle(node).borderRadius,
          }));
        assert.equal(escapeKey.height, 24);
        assert.equal(escapeKey.font, "14px");
        assert.equal(
          await page
            .locator("[data-docs-search-overlay]")
            .evaluate((node) => getComputedStyle(node).animationName),
          "none",
        );
        const active = await dialog.locator('[aria-current="true"]').textContent();
        await input.dispatchEvent("keydown", { key: "ArrowDown", isComposing: true });
        assert.equal(await dialog.locator('[aria-current="true"]').textContent(), active);
        await input.dispatchEvent("keydown", { key: "Enter", isComposing: true });
        assert.equal(await dialog.count(), 1);
        await page.screenshot({ path: `${evidence}/${name}-search.png` });
        await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
        const axe = async () =>
          page.evaluate(
            async () =>
              (
                await window.axe.run(document, {
                  rules: { "color-contrast": { enabled: false } },
                })
              ).violations,
          );
        assert.deepEqual(await axe(), []);
        await input.fill("zzzzzzzznotadocument");
        await dialog.getByRole("status").filter({ hasText: "No matching pages." }).waitFor();
        assert.deepEqual(await axe(), []);
        await page.screenshot({ path: `${evidence}/${name}-empty.png` });
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
        assert.ok(requests.includes(`/search/${locale}.json`));
        assert.ok(requests.every((path) => !path.startsWith("/api/")));
        const table = page
          .locator('section[aria-labelledby="native-api-button"] section[tabindex]')
          .first();
        await table.focus();
        const geometry = await table.evaluate((node) => ({
          scroll: getComputedStyle(node).overflowX,
          keyboard: node === document.activeElement,
          font: getComputedStyle(node.querySelector("table")).fontSize,
        }));
        assert.equal(geometry.scroll, "auto");
        assert.equal(geometry.keyboard, true);
        assert.equal(geometry.font, "14px");
        await page.screenshot({ path: `${evidence}/${name}-table.png` });
        results.push({ name, requests, geometry, escapeKey });
        await page.close();
      }
    }
  }
  // A delayed static asset is a new state that the title-only search never had.
  // Hold the real JSON request: the public icon must reflect native query loading.
  const loading = await browser.newPage({ reducedMotion: "reduce" });
  const loadingRequests = [];
  let release;
  let requested;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  const started = new Promise((resolve) => {
    requested = resolve;
  });
  await loading.route("**/search/en.json", async (route) => {
    loadingRequests.push(new URL(route.request().url()).pathname);
    requested();
    await held;
    await route.continue();
  });
  await loading.goto(`${base}/en/docs/react/components/button`, { waitUntil: "domcontentloaded" });
  await loading.getByRole("button", { name: "Search documentation", exact: true }).click();
  const loadingDialog = loading.getByRole("dialog", { name: "Search documentation", exact: true });
  await loadingDialog.getByRole("textbox", { name: "Find a page" }).fill("Button");
  await started;
  await loadingDialog.locator("svg.animate-pulse").waitFor();
  await loading.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  assert.deepEqual(
    await loading.evaluate(
      async () =>
        (
          await window.axe.run(document, {
            rules: { "color-contrast": { enabled: false } },
          })
        ).violations,
    ),
    [],
  );
  await loading.screenshot({ path: `${evidence}/held-static-loading.png` });
  release();
  await loadingDialog
    .getByRole("button", { name: "Button", exact: true })
    .and(loadingDialog.locator('[data-docs-result-type="page"]'))
    .waitFor();
  await loadingDialog.locator("svg.animate-pulse").waitFor({ state: "hidden" });
  assert.deepEqual(loadingRequests, ["/search/en.json"]);
  await loading.close();
  const motion = await browser.newPage({ reducedMotion: "no-preference" });
  await motion.goto(`${base}/en/docs/react/components/button`, { waitUntil: "networkidle" });
  await motion.getByRole("button", { name: "Search documentation", exact: true }).click();
  const openMotion = await motion.locator("[data-docs-search-overlay]").evaluate((node) => ({
    state: node.getAttribute("data-state"),
    duration: getComputedStyle(node).animationDuration,
    name: getComputedStyle(node).animationName,
  }));
  assert.equal(openMotion.state, "open");
  assert.equal(openMotion.duration, "0.2s");
  assert.notEqual(openMotion.name, "none");
  assert.equal(
    await motion
      .locator("[data-docs-search]")
      .evaluate((node) => getComputedStyle(node).animationDuration),
    "0.3s",
  );
  await motion.evaluate(() => {
    const node = document.querySelector("[data-docs-search-overlay]");
    window.docsClosedMotion = new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        if (node.getAttribute("data-state") !== "closed") return;
        observer.disconnect();
        resolve({
          state: node.getAttribute("data-state"),
          duration: getComputedStyle(node).animationDuration,
          name: getComputedStyle(node).animationName,
        });
      });
      observer.observe(node, { attributes: true, attributeFilter: ["data-state"] });
    });
  });
  await motion.keyboard.press("Escape");
  const closedMotion = await motion.evaluate(() => window.docsClosedMotion);
  assert.equal(closedMotion.state, "closed");
  assert.equal(closedMotion.duration, "0.15s");
  assert.notEqual(closedMotion.name, openMotion.name);
  results.push({ name: "native-motion-states", openMotion, closedMotion });
  await motion.close();
  const page = await browser.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await checkDocumentationShell(page, base);
  await checkAuthoredPage(page, base, "react/getting-started/frameworks", [
    "Next.js",
    "Vite and Rolldown",
    "Other frameworks",
  ]);
  await page.getByRole("button", { name: "Search documentation", exact: true }).click();
  const headingSearch = page.getByRole("dialog", { name: "Search documentation", exact: true });
  await headingSearch.getByRole("textbox", { name: "Find a page" }).fill("Next.js");
  await headingSearch.getByRole("button", { name: "Next.js", exact: true }).click();
  await page.waitForURL("**/react/getting-started/frameworks#nextjs");
  const heading = page.locator("#nextjs");
  assert.equal(await heading.count(), 1);
  await page.waitForFunction(() => {
    const bounds = document.getElementById("nextjs").getBoundingClientRect();
    return bounds.top >= 0 && bounds.top < innerHeight;
  });
  await page.getByRole("button", { name: "Search documentation", exact: true }).click();
  await headingSearch.getByRole("textbox", { name: "Find a page" }).fill("establish support");
  const prose = headingSearch
    .locator('[data-docs-result-type="text"]')
    .filter({ hasText: "establish support" });
  await prose.waitFor();
  const total = await headingSearch.locator("[data-docs-result]").count();
  for (let index = 0; index < total; index++) {
    if ((await prose.getAttribute("aria-current")) === "true") break;
    await page.keyboard.press("ArrowDown");
  }
  assert.equal(await prose.getAttribute("aria-current"), "true");
  const bodyGeometry = await prose.getByText("establish", { exact: true }).evaluate((node) => {
    const row = node.closest("[data-docs-result]");
    const view = row.parentElement.getBoundingClientRect();
    const match = node.getBoundingClientRect();
    return {
      matchTop: match.top,
      matchBottom: match.bottom,
      viewTop: view.top,
      viewBottom: view.bottom,
    };
  });
  assert.ok(
    bodyGeometry.matchTop >= bodyGeometry.viewTop &&
      bodyGeometry.matchBottom <= bodyGeometry.viewBottom,
  );
  await page.screenshot({ path: `${evidence}/prose-only-native-result.png` });
  await page.keyboard.press("Enter");
  await page.waitForURL("**/react/getting-started/frameworks#other-frameworks");
  await page.waitForFunction(() => {
    const bounds = document.getElementById("other-frameworks").getBoundingClientRect();
    return bounds.top >= 0 && bounds.top < innerHeight;
  });
  results.push({ name: "prose-only-native-result", phrase: "establish support", bodyGeometry });
  await page.close();
  assert.deepEqual(errors, []);
  console.log(
    "Fumadocs static shell: eight modes, matched/empty axe, IME, keyboard, focus and authored clipboard passed.",
  );
} finally {
  await browser.close();
  await writeFile(`${evidence}/results.json`, JSON.stringify({ results, errors }, null, 2));
}
