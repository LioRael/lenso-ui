import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, loadCohort, fileHash } from "./cohort-server.ts";
import { checkMenu, checkMenuTouch } from "./menu.mjs";
import { checkMenuSubmenus, checkSubmenuTouch } from "./menu-submenu.mjs";
import { checkMenuModal, checkMenuModalTouch } from "./menu-modal.mjs";
import { checkMenuBar } from "./menu-bar.mjs";
const beforeDist = process.env.EXACT_BEFORE_DIST,
  afterDist = process.env.EXACT_AFTER_DIST;
if (!beforeDist || !afterDist)
  throw new Error("Set EXACT_BEFORE_DIST and EXACT_AFTER_DIST to isolated compiled consumers");
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ??
    path.join(import.meta.dirname, "../.cache/acceptance/primitive-aggregate-artifacts"),
);
await Bun.write(path.join(artifacts, ".keep"), "");
const cohorts = [
  { name: "before", ...serveCohort(beforeDist) },
  { name: "after", ...serveCohort(afterDist) },
];
assert.notEqual(new URL(cohorts[0].url).origin, new URL(cohorts[1].url).origin);
const cases = [
  { name: "forms", root: "profile", ready: "name" },
  { name: "tabs-horizontal", root: "tabs-demo", ready: "tabs-demo-list" },
  { name: "tabs-vertical", root: "tabs-demo", ready: "tabs-demo-list", toggle: "tabs-vertical" },
  { name: "disclosure-closed", root: "details", ready: "details-content" },
  { name: "disclosure-open", root: "details", ready: "details-content", open: "details-trigger" },
  { name: "accordion", root: "settings", ready: "account-section-content" },
  {
    name: "modal",
    root: "settings-modal-popup",
    ready: "settings-modal",
    open: "modal-trigger",
    dialog: "settings-modal",
  },
  {
    name: "alert",
    root: "delete-alert-popup",
    ready: "delete-alert",
    open: "alert-trigger",
    dialog: "delete-alert",
  },
  {
    name: "popover",
    root: "export-popover",
    ready: "export-popover",
    open: "popover-open",
    popover: "export-popover",
  },
  {
    name: "menu",
    root: "document-menu",
    ready: "document-menu",
    open: "menu-open",
    popover: "document-menu",
  },
];
const results = [];
try {
  for (const [engineName, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
      page.setDefaultTimeout(15000);
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      const records = [];
      for (const cohort of cohorts) {
        const captures = [];
        await page.emulateMedia({ reducedMotion: "reduce" });
        for (const width of [390, 820])
          for (const theme of ["light", "dark"])
            for (const probe of cases) {
              await page.setViewportSize({ width, height: 900 });
              const network = await loadCohort(page, cohort);
              await page.waitForFunction(
                (id) =>
                  document.querySelector(
                    "[data-lenso-kind=search-field-group][data-lenso-ready]",
                  ) && document.getElementById(id)?.hasAttribute("data-lenso-ready"),
                probe.ready,
              );
              if (!(await page.locator(`[data-theme="${theme}"]`).count()))
                await page.getByTestId("theme").evaluate((n) => n.click());
              if (probe.toggle) await page.getByTestId(probe.toggle).click();
              if (probe.open) {
                await page.getByTestId(probe.open).focus();
                await page.keyboard.press("Enter");
              }
              if (probe.dialog)
                await page.waitForFunction((id) => document.getElementById(id).open, probe.dialog);
              if (probe.popover)
                await page.waitForFunction((id) => {
                  const n = document.getElementById(id);
                  return (
                    n.matches(":popover-open") &&
                    n.hasAttribute("data-lenso-positioned") &&
                    !n.hasAttribute("data-lenso-position-pending") &&
                    !n.querySelector("[data-starting-style]")
                  );
                }, probe.popover);
              if (probe.name === "disclosure-open")
                await page.waitForFunction(
                  () => document.getElementById("details-content").style.opacity === "1",
                );
              await page.getByTestId(probe.root).evaluate(async (root) => {
                await Promise.all(
                  root
                    .getAnimations({ subtree: true })
                    .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
                    .map((a) => a.finished.catch(() => {})),
                );
                await new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                );
              });
              await page.mouse.move(0, 0);
              const snapshot = await page.getByTestId(probe.root).evaluate((root) =>
                [root, ...root.querySelectorAll("[id]")]
                  .filter((n) => n === root || n.getAttribute("aria-hidden") !== "true")
                  .map((n) => {
                    const style = getComputedStyle(n),
                      rect = n.getBoundingClientRect();
                    return {
                      id: n.id,
                      tag: n.tagName,
                      attributes: Object.fromEntries(
                        [...n.attributes]
                          .filter(
                            (a) =>
                              a.name.startsWith("aria-") ||
                              [
                                "role",
                                "type",
                                "name",
                                "required",
                                "readonly",
                                "rows",
                                "command",
                                "commandfor",
                                "popovertarget",
                                "popovertargetaction",
                              ].includes(a.name),
                          )
                          .map((a) => [a.name, a.value]),
                      ),
                      value: n.value ?? null,
                      checked: n.checked ?? null,
                      indeterminate: n.indeterminate ?? null,
                      tabIndex: n.tabIndex,
                      width: rect.width,
                      height: rect.height,
                      display: style.display,
                      font: style.font,
                      color: style.color,
                      padding: style.padding,
                    };
                  }),
              );
              const file = path.join(
                artifacts,
                `${engineName}-${cohort.name}-${probe.name}-${width}-${theme}.png`,
              );
              await page.getByTestId(probe.root).screenshot({ path: file });
              captures.push({
                case: probe.name,
                width,
                theme,
                network,
                snapshot,
                file,
                captureSHA256: await fileHash(file),
              });
            }
        records.push({ cohort: cohort.name, origin: new URL(cohort.url).origin, captures });
      }
      for (let i = 0; i < records[0].captures.length; i++) {
        const before = records[0].captures[i],
          after = records[1].captures[i];
        assert.deepEqual(
          after.snapshot,
          before.snapshot,
          `${engineName}/${before.case}/${before.width}/${before.theme} semantics/layout`,
        );
        assert.equal(
          after.captureSHA256,
          before.captureSHA256,
          `${engineName}/${before.case}/${before.width}/${before.theme} pixels`,
        );
      }
      const behavior = {};
      if (process.env.EXACT_MIGRATION_MENU_BEHAVIOR === "1") {
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await loadCohort(page, cohorts[1]);
        behavior.menu = await checkMenu(page, engineName);
        await loadCohort(page, cohorts[1]);
        behavior.submenus = await checkMenuSubmenus(page, engineName);
        await loadCohort(page, cohorts[1]);
        behavior.modal = await checkMenuModal(page, engineName);
        await loadCohort(page, cohorts[1]);
        behavior.menuBar = await checkMenuBar(page, engineName);
        const mobile = await browser.newContext({
          viewport: { width: 390, height: 844 },
          hasTouch: true,
          isMobile: true,
        });
        try {
          const p = await mobile.newPage();
          p.on("pageerror", (e) => errors.push(String(e)));
          p.on("console", (m) => {
            if (m.type() === "error") errors.push(m.text());
          });
          await loadCohort(p, cohorts[1]);
          behavior.touchMenu = await checkMenuTouch(p);
          await loadCohort(p, cohorts[1]);
          behavior.touchSubmenus = await checkSubmenuTouch(p);
          await loadCohort(p, cohorts[1]);
          behavior.touchModal = await checkMenuModalTouch(p);
        } finally {
          await mobile.close();
        }
      }
      assert.deepEqual(errors, []);
      results.push({ engine: engineName, version: browser.version(), records, behavior });
      await Bun.write(
        path.join(artifacts, "verification.json"),
        JSON.stringify(
          {
            completedAt: new Date().toISOString(),
            cohortOrigins: cohorts.map((c) => ({ name: c.name, url: c.url, dist: c.dist })),
            results,
          },
          null,
          2,
        ) + "\n",
      );
      console.log(engineName, "independent-origin comparison passed");
    } finally {
      await browser.close();
    }
  }
} finally {
  for (const cohort of cohorts) cohort.stop();
}
