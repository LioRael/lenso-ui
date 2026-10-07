import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { checkAuthoredPage, checkDocumentationShell } from "../test/shell.browser.mjs";
import { checkThemeBuilder } from "../test/theme-builder.browser.mjs";
import { checkHome } from "../test/home.browser.mjs";
import { checkComponentsOverview } from "../test/components-overview.browser.mjs";

const require = createRequire(import.meta.url);
const base = process.env["LENSO_DOCS_TEST_URL"] ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.on("pageerror", (error) => errors.push(String(error)));
  async function waitForFocus(locator, contains = false) {
    await page.waitForFunction(
      ({ node, contains }) =>
        contains ? node.contains(document.activeElement) : node === document.activeElement,
      { node: await locator.elementHandle(), contains },
    );
  }
  await page.goto(`${base}/en/docs/react/components/button`, { waitUntil: "networkidle" });
  assert.equal(
    await page.getByRole("heading", { name: "Button", exact: true, level: 1 }).count(),
    1,
  );
  assert.equal(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--z-index-overlay").trim(),
    ),
    "100000",
    "The compiled base layer must apply, not become an inactive @media layer(base) rule.",
  );
  const example = page.getByRole("region", { name: "Example: button-basic", exact: true });
  await example.getByRole("button", { name: "Click me", exact: true }).focus();
  const activation = page.waitForEvent("console", {
    predicate: (message) => message.type() === "log" && message.text() === "Button pressed",
  });
  await page.keyboard.press("Enter");
  await activation;
  assert.equal(await example.getByRole("button", { name: "Click me", exact: true }).count(), 1);
  const disabled = page.getByRole("region", { name: "Example: button-disabled", exact: true });
  for (const name of ["Primary", "Secondary", "Tertiary", "Outline", "Ghost", "Danger"])
    assert.equal(await disabled.getByRole("button", { name, exact: true }).isDisabled(), true);

  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const accessibility = await page.evaluate(async () =>
    window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
      rules: { "color-contrast": { enabled: false } },
    }),
  );
  assert.deepEqual(
    accessibility.violations.map((violation) => violation.id),
    [],
    "Accessibility semantics must pass. Source-color contrast is reviewed separately.",
  );

  await page.goto(`${base}/en/docs/react/components/close-button`, { waitUntil: "networkidle" });
  const closeExample = page.getByRole("region", {
    name: "Example: close-button-default",
    exact: true,
  });
  const closeButton = closeExample.getByRole("button", { name: "Close", exact: true });
  await closeButton.focus();
  await page.keyboard.press("Enter");
  assert.equal(await closeButton.evaluate((element) => element === document.activeElement), true);

  await page.goto(`${base}/en/docs/react/components/error-message`, { waitUntil: "networkidle" });
  const errorExample = page.getByRole("region", {
    name: "Example: error-message-basic",
    exact: true,
  });
  const errorMessage = errorExample.getByText("Please select at least one category", {
    exact: true,
  });
  assert.equal(await errorMessage.count(), 1);
  await errorExample.getByRole("row", { name: "News", exact: true }).focus();
  await page.keyboard.press("Space");
  assert.equal(await errorMessage.count(), 0);

  // Previously these ten basic previews were source-only; component tests do not
  // prove that their docs registrations mount or compose the native contracts.
  async function basicExample(family, id) {
    await page.goto(`${base}/en/docs/react/components/${family}`, { waitUntil: "networkidle" });
    return page.getByRole("region", { name: `Example: ${id}`, exact: true });
  }

  const menu = await basicExample("menu", "menu-default");
  const menuTrigger = menu.getByRole("button", { name: "Menu", exact: true });
  await menuTrigger.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menuitem", { name: "New file", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await waitForFocus(menuTrigger);
  assert.equal(await menuTrigger.evaluate((node) => node === document.activeElement), true);

  const users = await basicExample("list-box", "list-box-default");
  const bob = users.getByRole("option").filter({ hasText: "bob@heroui.com" });
  await bob.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  assert.equal(
    await users
      .getByRole("option")
      .filter({ hasText: "fred@heroui.com" })
      .getAttribute("aria-selected"),
    "true",
  );

  const tags = await basicExample("tag-group", "tag-group-basic");
  await tags.getByRole("row", { name: "News", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  assert.equal(
    await tags.getByRole("row", { name: "Travel", exact: true }).getAttribute("aria-selected"),
    "true",
  );

  const table = await basicExample("table", "table-basic");
  assert.equal(
    await table.getByRole("table", { name: "Team members" }).getByRole("row").count(),
    5,
  );
  assert.equal(await table.getByRole("cell", { name: "sara@acme.com", exact: true }).count(), 1);
  assert.equal(await table.getByRole("cell", { name: "On Leave", exact: true }).count(), 1);

  for (const [family, id, triggerName, role, title, closeName] of [
    [
      "alert-dialog",
      "alert-dialog-default",
      "Delete Project",
      "alertdialog",
      "Delete project permanently?",
      "Cancel",
    ],
    ["drawer", "drawer-basic", "Open Drawer", "dialog", "Drawer Title", "Cancel"],
    ["modal", "modal-default", "Open Modal", "dialog", "Welcome to HeroUI", "Continue"],
  ]) {
    const example = await basicExample(family, id);
    const trigger = example.getByRole("button", { name: triggerName, exact: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole(role, { name: title, exact: true });
    await dialog.waitFor();
    await waitForFocus(dialog, true);
    assert.equal(await dialog.evaluate((node) => node.contains(document.activeElement)), true);
    await dialog.getByRole("button", { name: closeName, exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    await waitForFocus(trigger);
    assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
  }

  const popover = await basicExample("popover", "popover-basic");
  const popoverTrigger = popover.getByRole("button", { name: "Click me", exact: true });
  await popoverTrigger.click();
  await page.getByRole("dialog", { name: "Popover Title", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await page
    .getByRole("dialog", { name: "Popover Title", exact: true })
    .waitFor({ state: "hidden" });

  const tooltip = await basicExample("tooltip", "tooltip-basic");
  await tooltip.getByRole("button", { name: "Hover me", exact: true }).focus();
  await page.keyboard.press("Tab");
  assert.equal(
    await tooltip
      .getByRole("button", { name: "More information", exact: true })
      .evaluate((node) => node === document.activeElement),
    true,
  );
  await page.getByRole("tooltip", { name: "More information", exact: true }).waitFor();
  assert.equal(
    await tooltip
      .getByRole("button", { name: "More information", exact: true })
      .getAttribute("aria-describedby"),
    await page.getByRole("tooltip", { name: "More information", exact: true }).getAttribute("id"),
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("tooltip", { name: "More information", exact: true })
    .waitFor({ state: "hidden" });

  const toast = await basicExample("toast", "toast-default");
  await toast.getByRole("button", { name: "Show toast", exact: true }).click();
  const dismiss = page.getByRole("button", { name: "Dismiss", exact: true });
  await dismiss.waitFor();
  await dismiss.click();
  await dismiss.waitFor({ state: "hidden" });

  // Archived quick-start package-manager tabs are not a published Lenso contract.
  // Prove the authored installation MDX and copied source instead; live native
  // keyboard/focus checks above and in the shell remain independent evidence.
  await checkAuthoredPage(page, base, "react/getting-started/installation", [
    "Packages",
    "Theme stylesheet",
    "Application StyleX",
    "Verify a consumer",
  ]);

  await checkDocumentationShell(page, base);
  await checkComponentsOverview(browser, base);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await checkThemeBuilder(page, base);
  await checkHome(page, base);
  assert.deepEqual(errors, [], "Rendered documentation must not emit client errors.");
  console.log(
    "Browser proof passed: native demos, focus restoration, semantic accessibility, theme propagation, search, locale navigation, authored installation/StyleX MDX and exact Markdown copying, mobile drawer geometry, and theme builder editing/import/export.",
  );
} finally {
  await browser.close();
}
