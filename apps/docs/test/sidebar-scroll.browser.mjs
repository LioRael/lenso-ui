import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

// Run against either the product or the exact-route CLI export; no builds or server ownership here.
const base = process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:3000";
const start = process.env.LENSO_DOCS_SCROLL_START ?? "/en/docs/react/components/button";
const otherScope = process.env.LENSO_DOCS_SCROLL_OTHER_SCOPE ?? "/en/docs/react/getting-started";
const returnScope = process.env.LENSO_DOCS_SCROLL_RETURN_SCOPE ?? "/en/docs/react/components";
const output = new URL("../../../test-results/sidebar-scroll/", import.meta.url);
const report = { transitions: [], errors: [], nestedBranches: 0 };
const browser = await chromium.launch();
await mkdir(output, { recursive: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (error) => report.errors.push(error.message));
  await page.goto(new URL(start, base).href, { waitUntil: "networkidle" });
  const sidebar = page.locator("#nd-sidebar");
  await sidebar.waitFor({ state: "visible" });
  // Wait for hydration before modifying native scroll state.
  await page.waitForTimeout(300);
  const branchButtons = sidebar.locator("button[aria-expanded]");
  report.nestedBranches = await branchButtons.count();
  if (report.nestedBranches) {
    // Exercise a user decision rather than only relying on a route-derived default.
    const firstBranch = branchButtons.first();
    if ((await firstBranch.getAttribute("aria-expanded")) === "true") await firstBranch.click();
    await firstBranch.click();
    await page.waitForTimeout(300);
  }
  const expectedBranches = await branchButtons.evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("aria-expanded")),
  );

  const snapshot = () =>
    sidebar.evaluate((element) => ({
      top: element.scrollTop,
      maximum: element.scrollHeight - element.clientHeight,
      body: window.scrollY,
      sameDOM: window.__sidebarBefore === element,
      oldConnected: window.__sidebarBefore?.isConnected ?? false,
    }));
  const rememberNode = () =>
    sidebar.evaluate((element) => {
      window.__sidebarBefore = element;
    });
  async function scroll(top) {
    await sidebar.evaluate((element, value) => {
      element.scrollTop = value;
    }, top);
    await page.waitForTimeout(100);
    return (await snapshot()).top;
  }
  async function clickRoute(href, container = sidebar) {
    const target = new URL(href, page.url()).pathname;
    const link = container.locator(`a[href="${target}"]`).first();
    await rememberNode();
    await link.click();
    await page.waitForURL((url) => url.pathname === target);
    await sidebar.waitFor({ state: "visible" });
    await page.waitForTimeout(300);
  }
  async function assertPosition(name, expected, sameCollection = true) {
    const after = await snapshot();
    report.transitions.push({ name, expected, ...after, url: page.url() });
    assert.equal(after.top, Math.min(expected, after.maximum), `${name}: sidebar scroll drift`);
    assert.equal(after.body, 0, `${name}: sidebar restoration moved document`);
    if (sameCollection) {
      assert.deepEqual(
        await branchButtons.evaluateAll((buttons) =>
          buttons.map((button) => button.getAttribute("aria-expanded")),
        ),
        expectedBranches,
        `${name}: nested branch expansion drift`,
      );
    }
  }
  const initialBody = (await snapshot()).body;
  assert.equal(initialBody, 0);
  const maximum = (await snapshot()).maximum;
  assert.ok(maximum > 800, "Regression requires a genuinely long desktop menu");
  const remembered = await scroll(Math.min(900, maximum - 100));
  const visibleLinks = await sidebar.locator("a[href]").evaluateAll((links) =>
    links
      .filter((link) => {
        const box = link.getBoundingClientRect();
        const frame = link.closest("aside").getBoundingClientRect();
        return box.top >= frame.top && box.bottom <= frame.bottom;
      })
      .map((link) => link.getAttribute("href"))
      .filter((href) => new URL(href, location.href).pathname !== location.pathname),
  );
  assert.ok(visibleLinks.length >= 2, "Need two visible article links for real route clicks");
  const first = visibleLinks[0];
  const second = visibleLinks[1];
  await clickRoute(first);
  await assertPosition("same collection next", remembered);
  await clickRoute(second);
  await assertPosition("same collection next again", remembered);
  await clickRoute(first);
  await assertPosition("same collection previous", remembered);
  await rememberNode();
  await page.goBack();
  await page.waitForTimeout(300);
  await assertPosition("browser back", remembered);

  // Use actual section links, not goto/reload, so these exercise the host's routing contract.
  const sections = page.locator('header nav[aria-label="Documentation sections"]');
  await clickRoute(otherScope, sections);
  await assertPosition("separate collection starts independently", 0, false);
  const otherTop = await scroll(Math.min(160, (await snapshot()).maximum));
  await clickRoute(returnScope, sections);
  await assertPosition("return to first collection", remembered);
  await clickRoute(otherScope, sections);
  await assertPosition("return to second collection", otherTop, false);
  await clickRoute(returnScope, sections);
  await assertPosition("return before mobile", remembered);

  await page.setViewportSize({ width: 390, height: 844 });
  const trigger = page.getByRole("button", { name: "Browse documentation", exact: true });
  await trigger.click();
  const drawer = page.getByRole("dialog");
  await drawer.waitFor({ state: "visible" });
  await drawer.getByRole("navigation", { name: "Documentation pages" }).evaluate((element) => {
    element.parentElement.scrollTop = 100;
  });
  await page.keyboard.press("Escape");
  await drawer.waitFor({ state: "hidden" });
  assert.ok(await trigger.evaluate((element) => document.activeElement === element));
  await trigger.click();
  await page.getByRole("button", { name: "Close documentation navigation" }).click();
  await drawer.waitFor({ state: "hidden" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);
  await assertPosition("mobile drawer does not overwrite desktop", remembered);
  assert.deepEqual(report.errors, []);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await writeFile(new URL("report.json", output), `${JSON.stringify(report, null, 2)}\n`);
}
