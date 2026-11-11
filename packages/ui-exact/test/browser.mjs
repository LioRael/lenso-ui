import { checkToolbar } from "./toolbar.mjs";
import { checkPagination } from "./pagination.mjs";
import { checkSearchField } from "./search-field.mjs";
import { checkScrollShadow, checkScrollShadowColdKeyboard } from "./scroll-shadow.mjs";
import { checkPageControl } from "./page-control.mjs";
import { checkButtonGroup } from "./button-group.mjs";
import { checkSegmented } from "./segmented-control.mjs";
import { checkTabs } from "./tabs.mjs";
import { checkSlider } from "./slider.mjs";
import { checkSwitch } from "./switch.mjs";
import { checkAvatar } from "./avatar.mjs";
import { checkLayout } from "./layout.mjs";
import { checkContent } from "./content.mjs";
import { checkVisualCapabilities } from "./visual-capabilities.mjs";
import { checkAlertDialog } from "./alert-dialog.mjs";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import path from "node:path";
import { buildExample } from "../scripts/example.ts";
import { checkModal } from "./modal.mjs";
import { checkCallerStyles } from "./caller-styles.mjs";
import { checkToggle } from "./toggle.mjs";
import { checkFeedback } from "./feedback.mjs";
import { checkNavigation } from "./navigation.mjs";
import { checkForms } from "./forms.mjs";
import { checkDisclosure } from "./disclosure.mjs";
import { checkInitialStyles } from "./initial-styles.mjs";
import { checkPresentationCases } from "./presentation-cases.mjs";

const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const dist = await buildExample();
const verifiedBrowsers = [];
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request) {
    const url = new URL(request.url);
    const file = path.resolve(dist, url.pathname === "/" ? "index.html" : url.pathname.slice(1));
    if (!file.startsWith(`${dist}/`)) return new Response("Forbidden", { status: 403 });
    return (await Bun.file(file).exists())
      ? new Response(Bun.file(file))
      : new Response("Not found", { status: 404 });
  },
});

try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    if (process.env.TEST_BROWSER && process.env.TEST_BROWSER !== name) continue;
    const browser = await engine.launch({
      channel: name === "chromium" ? process.env.CHROMIUM_CHANNEL : undefined,
    });
    try {
      const visualCapture = await checkVisualCapabilities(browser, name);
      if (!visualCapture.backdropBlurCaptured)
        console.log(
          `${name}: glass screenshot gate NOT QUALIFIED (backdrop blur missing from capture)`,
        );
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await checkInitialStyles(page, server.url.href, name);
      // First-entry scrolling activates offscreen materials. Keep the glass teardown fixture fresh.
      const firstEntry = await browser.newPage({ viewport: page.viewportSize() });
      try {
        await firstEntry.goto(server.url.href);
        await checkScrollShadowColdKeyboard(firstEntry);
      } finally {
        await firstEntry.close();
      }
      await page.bringToFront();
      const presentationCount = await checkPresentationCases(page);
      const button = page.getByTestId("glass-action");
      await page.waitForFunction(() => {
        const node = document.querySelector('[data-testid="glass-action"]');
        return node && getComputedStyle(node).borderRadius === "1000px";
      });
      assert.equal(await button.evaluate((node) => node.tagName), "BUTTON");
      assert.equal(await button.evaluate((node) => getComputedStyle(node).appearance), "none");
      assert.equal(await button.evaluate((node) => getComputedStyle(node).borderTopWidth), "0px");
      await button.focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.getByTestId("count").textContent(), "Count: 1");
      await page.keyboard.press("Space");
      assert.equal(await page.getByTestId("count").textContent(), "Count: 2");
      await button.click();
      assert.equal(await button.textContent(), "Add 3");
      await page.getByTestId("disable").click();
      assert.equal(await button.isDisabled(), true);
      await button.evaluate((node) => node.click());
      assert.equal(await page.getByTestId("count").textContent(), "Count: 3");
      await page.getByTestId("disable").click();
      await page.getByTestId("size").click();
      await page.waitForFunction(
        () =>
          getComputedStyle(document.querySelector('[data-testid="glass-action"]')).height ===
          "50px",
      );
      const labelColor = await button.evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--lenso-label-primary"),
      );
      await page.getByTestId("theme").click();
      assert.equal(await page.locator('[data-theme="dark"]').count(), 1);
      assert.notEqual(
        await button.evaluate((node) =>
          getComputedStyle(node).getPropertyValue("--lenso-label-primary"),
        ),
        labelColor,
      );
      // Other examples keep their own filters alive when these two surfaces unmount.
      const surfaceFilters = () => {
        const ids = ["glass-panel", "glass-action"].map((testId) => {
          const node = document.querySelector(`[data-testid="${testId}"]`);
          const filter = node?.style.getPropertyValue("--lg-filter");
          return filter?.match(/#([\w-]+)/)?.[1];
        });
        return ids.every((id) => id && document.getElementById(id)?.localName === "filter")
          ? ids
          : null;
      };
      const beforeHide = await (await page.waitForFunction(surfaceFilters)).jsonValue();
      await page.getByTestId("visibility").click();
      assert.equal(await page.getByTestId("glass-panel").count(), 0);
      await page.waitForFunction(
        (ids) => ids.every((id) => !document.getElementById(id)),
        beforeHide,
      );
      await page.getByTestId("visibility").click();
      await page.waitForFunction(surfaceFilters);
      await page.getByTestId("glass-action").click();
      assert.equal(await page.getByTestId("count").textContent(), "Count: 4");
      const modalMotion = await checkModal(page, name);
      const alertDialogMotion = await checkAlertDialog(page, name);
      await checkContent(page, name);
      const layoutSemantics = await checkLayout(page, name);
      await checkAvatar(page, name);
      await checkSwitch(page, name);
      await checkSlider(page, name);
      await checkTabs(page, name);
      await checkSegmented(page, name);
      await checkButtonGroup(page, name);
      await checkPageControl(page, name);
      await checkScrollShadow(page, name);
      await checkCallerStyles(page);
      await checkToggle(page, name);
      await checkFeedback(page, name);
      await checkForms(page);
      await checkSearchField(page, name);
      await checkNavigation(page, name);
      await checkPagination(page, name);
      await checkToolbar(page, name);
      await checkDisclosure(page, name);
      for (const width of [390, 820]) {
        await page.setViewportSize({ width, height: 844 });
        for (const appearance of ["dark", "light"]) {
          if (!(await page.locator(`[data-theme="${appearance}"]`).count()))
            await page.getByTestId("theme").click();
          const profile = page.getByRole("group", { name: "Profile", exact: true });
          await profile.screenshot({
            path: path.resolve(
              import.meta.dirname,
              `../.cache/example/${name}-forms-${appearance}-${width}.png`,
            ),
          });
          await page.locator("#disclosure-examples").screenshot({
            path: path.resolve(
              import.meta.dirname,
              `../.cache/example/${name}-disclosure-${appearance}-${width}.png`,
            ),
          });
          await page.locator("#navigation-examples").screenshot({
            path: path.resolve(
              import.meta.dirname,
              `../.cache/example/${name}-navigation-${appearance}-${width}.png`,
            ),
          });
          await page.locator("#feedback-examples").screenshot({
            path: path.resolve(
              import.meta.dirname,
              `../.cache/example/${name}-feedback-${appearance}-${width}.png`,
            ),
          });
          await page.locator("#toggle-examples").screenshot({
            path: path.resolve(
              import.meta.dirname,
              `../.cache/example/${name}-toggle-${appearance}-${width}.png`,
            ),
          });
          const overflow = await page.evaluate(() => ({
            width: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            boxes: [...document.querySelectorAll("#exact-root *")]
              .map((node) => ({
                tag: node.tagName,
                id: node.id,
                kind: node.getAttribute("data-lenso-kind"),
                style: node.getAttribute("style"),
                html: node.outerHTML.slice(0, 500),
                left: node.getBoundingClientRect().left,
                right: node.getBoundingClientRect().right,
              }))
              .filter((box) => box.right > innerWidth + 1),
          }));
          assert.equal(overflow.scrollWidth <= overflow.width, true, JSON.stringify(overflow));
        }
      }
      assert.deepEqual(errors, []);
      const capture = path.resolve(import.meta.dirname, `../.cache/example/${name}.png`);
      await page.screenshot({ path: capture });
      console.log(
        `${name} ${browser.version()}: actions, modal, alert dialog, content, layout, avatars, switches, sliders, tabs, segmented controls, toggles, feedback, forms, navigation, disclosure, accordion, keyboard, motion, theme and disposal passed`,
      );
      verifiedBrowsers.push({
        engine: name,
        version: browser.version(),
        presentationCount,
        modalMotion,
        alertDialogMotion,
        visualCapture,
        layoutSemantics,
      });
      await page.close();
    } finally {
      await browser.close();
    }
  }
  if (!verifiedBrowsers.length) throw new Error("TEST_BROWSER must select chromium or webkit");
  const assets = {};
  for (const file of [...new Bun.Glob("**/*").scanSync(dist)].sort())
    assets[file] = createHash("sha256")
      .update(new Uint8Array(await Bun.file(path.join(dist, file)).arrayBuffer()))
      .digest("hex");
  await Bun.write(
    path.resolve(import.meta.dirname, "../.cache/example/verification.json"),
    `${JSON.stringify({ completedAt: new Date().toISOString(), browsers: verifiedBrowsers, viewports: [390, 820], themes: ["light", "dark"], assets }, null, 2)}\n`,
  );
} finally {
  server.stop(true);
}
