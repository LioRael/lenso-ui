import assert from "node:assert/strict";
import path from "node:path";

export async function checkInitialStyles(page, url, engine) {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const hold = async (route) => {
    await gate;
    await route.continue();
  };
  const stylesheets = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith("/lenso-ui/web.css"))
      stylesheets.push(request.url());
  });
  await page.route("**/modules/index.js", hold);
  const snapshot = async () => {
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime))
          .map((animation) => animation.finished.catch(() => {})),
      ),
    );
    return page.evaluate(() => {
      const ids = [
        "fusion-demo",
        "fusion-first",
        "fusion-second",
        "toolbar-demo",
        "toolbar-clipboard",
        "toolbar-copy",
        "toolbar-paste",
        "toolbar-save",
        "toolbar-help",
        "pagination-demo",
        "pagination-demo-summary",
        "pagination-one",
        "pagination-two",
        "pagination-prev",
        "pagination-next",
        "pagination-eight",
        "search-demo",
        "search-demo-group",
        "search-demo-input",
        "search-demo-clear",
        "shadow-sample",
        "shadow-draft",
        "pages",
        "pages-track",
        "pages-page-0",
        "pages-page-8",
        "pages-rich",
        "pages-rich-page-0",
        "actions-group",
        "actions-save",
        "actions-duplicate",
        "actions-more",
        "segments",
        "segments-item-0",
        "segments-item-0-input",
        "segments-rich",
        "segments-rich-auto",
        "tabs-demo-list",
        "tabs-account",
        "tabs-account-panel",
        "tabs-security-panel",
        "slider-range",
        "slider-range-control",
        "slider-range-input-0",
        "slider-range-thumb-0",
        "layout-card",
        "layout-card-title",
        "layout-empty",
        "layout-empty-title",
        "layout-create",
        "content-chip",
        "content-close",
        "content-alert",
        "content-badge",
        "modal-trigger",
        "alert-trigger",
        "feedback-skeleton-line-two",
        "favorite",
        "favorite-icon",
        "format-italic",
        "upload",
        "storage",
        "sync-track",
        "feedback-spinner",
        "feedback-skeleton",
        "navigation-local",
        "trail-current",
        "navigation-horizontal",
        "navigation-vertical",
        "action",
        "glass-action",
        "name",
        "notes",
        "subscribe",
        "personal",
        "details-trigger",
        "details-content",
        "account-section-trigger",
        "account-section-content",
        "settings",
      ];
      return Object.fromEntries(
        ids.map((id) => {
          const node = document.querySelector(`[data-testid="${id}"]`);
          const style = getComputedStyle(node);
          const props = [
            "display",
            "height",
            "width",
            "fontSize",
            "lineHeight",
            "borderRadius",
            "paddingLeft",
            "paddingRight",
            "opacity",
          ];
          if (id !== "glass-action") props.push("color", "backgroundColor");
          return [id, Object.fromEntries(props.map((property) => [property, style[property]]))];
        }),
      );
    });
  };
  const attachedToolbar = () =>
    page.getByTestId("toolbar-demo").evaluate((node) => {
      const root = getComputedStyle(node),
        group = getComputedStyle(document.getElementById("toolbar-clipboard")),
        action = getComputedStyle(document.getElementById("toolbar-save"));
      return {
        padding: root.paddingTop,
        groupPadding: group.paddingTop,
        actionHeight: action.height,
      };
    });
  const disabledPagination = () =>
    page.getByTestId("pagination-eight").evaluate((node) => ({
      tag: node.tagName,
      href: node.getAttribute("href"),
      role: node.getAttribute("role"),
      tabIndex: node.tabIndex,
      disabled: node.getAttribute("aria-disabled"),
    }));
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const node = document.querySelector('[data-testid="action"]');
      return node && getComputedStyle(node).borderRadius === "8px";
    });
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    assert.equal(
      await page.locator("[data-lenso-ready]").count(),
      0,
      "hatches must remain blocked for this capture",
    );
    assert.equal(
      await page
        .getByTestId("fusion-demo-fusion")
        .evaluate((node) => getComputedStyle(node).display),
      "none",
    );
    const morphInitial = await page.evaluate(() => {
      const ids = ["morph-cut", "morph-copy", "morph-paste"];
      const rects = ids.map((id) => document.getElementById(id).getBoundingClientRect());
      return {
        supported: CSS.supports("width", "calc(sibling-count() * 1px)"),
        gaps: rects.slice(1).map((rect, index) => rect.left - rects[index].right),
      };
    });
    if (morphInitial.supported)
      for (const gap of morphInitial.gaps)
        assert.ok(Math.abs(gap) < 0.5, `${engine}: joined Toolbar must touch before hatches`);
    const scrollInitial = await page.evaluate(() => {
      const node = document.getElementById("shadow-sample"),
        style = getComputedStyle(node);
      return {
        timeline: CSS.supports("animation-timeline", "scroll(self)"),
        start: style.getPropertyValue("--scroll-shadow-start-fade"),
        end: style.getPropertyValue("--scroll-shadow-end-fade"),
        properties: [...document.styleSheets]
          .flatMap((sheet) => [...sheet.cssRules])
          .filter((rule) => rule.cssText.startsWith("@property --scroll-shadow-"))
          .map((rule) => rule.cssText),
      };
    });
    assert.equal(
      scrollInitial.properties.length,
      2,
      "typed scroll fades must be linked before the hatch",
    );
    if (scrollInitial.timeline) {
      assert.equal(parseFloat(scrollInitial.start), 0);
      assert.equal(parseFloat(scrollInitial.end), 40);
    }
    await Bun.write(
      path.resolve(import.meta.dirname, `../.cache/example/${engine}-scroll-initial.json`),
      JSON.stringify(scrollInitial, null, 2) + "\n",
    );
    assert.equal(
      await page
        .getByTestId("details-content")
        .evaluate((node) => node.getBoundingClientRect().height),
      0,
    );
    assert.equal(await page.getByTestId("trail-library").getAttribute("href"), null);
    await page.getByTestId("navigation-disabled").click();
    assert.equal(await page.getByTestId("navigation-local").getAttribute("href"), null);
    assert.equal(await page.getByTestId("trail-home").getAttribute("href"), null);
    await page.getByTestId("navigation-disabled").click();
    await page.getByTestId("navigation-direction").click();
    assert.match(
      await page
        .locator('[data-lenso-kind="breadcrumbs-chevron"]')
        .evaluate((node) => getComputedStyle(node).transform),
      /^matrix\(-1, 0, 0, -1,/,
    );
    await page.getByTestId("navigation-direction").click();
    assert.equal(await page.getByTestId("upload").getAttribute("aria-valuenow"), "35");
    await page.getByTestId("feedback-indeterminate").click();
    assert.equal(await page.getByTestId("upload").getAttribute("aria-valuenow"), null);
    assert.equal(await page.getByTestId("sync").getAttribute("aria-valuenow"), null);
    await page.getByTestId("feedback-indeterminate").click();
    await page.getByTestId("favorite").click();
    assert.equal(await page.getByTestId("favorite").getAttribute("aria-pressed"), "true");
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime))
          .map((a) => a.finished.catch(() => {})),
      ),
    );
    const selectedFill = await page
      .getByTestId("favorite")
      .evaluate((n) => getComputedStyle(n).backgroundColor);
    await page.getByTestId("favorite").click();
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime))
          .map((a) => a.finished.catch(() => {})),
      ),
    );
    assert.notEqual(
      await page.getByTestId("favorite").evaluate((n) => getComputedStyle(n).backgroundColor),
      selectedFill,
    );
    assert.equal(
      await page.getByTestId("action").evaluate((n) => getComputedStyle(n).borderRadius),
      "8px",
    );
    assert.equal(
      await page.getByTestId("favorite").evaluate((n) => getComputedStyle(n).borderRadius),
      "0px",
    );
    assert.equal(
      await page.getByTestId("favorite").evaluate((n) => getComputedStyle(n).fontWeight),
      "700",
    );
    assert.equal(
      await page
        .getByTestId("feedback-skeleton-line-two")
        .evaluate((n) => getComputedStyle(n).backgroundColor),
      "rgba(0, 0, 0, 0)",
    );
    await page.getByTestId("modal-trigger").click();
    await page.waitForFunction(() => document.querySelector('[data-testid="settings-modal"]').open);
    assert.equal(
      await page.getByTestId("settings-modal").evaluate((n) => n.matches(":modal")),
      true,
    );
    assert.equal(
      await page.getByTestId("modal-name").evaluate((n) => document.activeElement === n),
      true,
    );
    await page.getByTestId("modal-cancel").click();
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[data-testid="settings-modal"]')).display ===
        "none",
    );
    await page.getByTestId("alert-trigger").click();
    assert.equal(await page.getByTestId("delete-alert").evaluate((n) => n.matches(":modal")), true);
    assert.equal(
      await page.getByTestId("alert-cancel").evaluate((n) => n === document.activeElement),
      true,
    );
    assert.equal(
      await page
        .getByTestId("delete-alert-popup")
        .evaluate((n) => getComputedStyle(n).borderRadius),
      "34px",
    );
    assert.equal(
      await page
        .getByTestId("delete-alert")
        .evaluate((n) => getComputedStyle(n, "::before").content),
      "none",
    );
    assert.equal(
      await page
        .getByTestId("alert-confirmation")
        .evaluate((n) => n.getBoundingClientRect().height),
      52,
    );
    await page.getByTestId("alert-cancel").click();
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[data-testid="delete-alert"]')).display === "none",
    );
    await page.getByTestId("toolbar-attached").click();
    const toolbarAttachedInitial = await attachedToolbar();
    assert.deepEqual(toolbarAttachedInitial, {
      padding: "4px",
      groupPadding: "0px",
      actionHeight: "36px",
    });
    await page.getByTestId("toolbar-attached").click();
    const initial = {
      light: await snapshot(),
      dark: null,
      disabledPagination: await disabledPagination(),
    };
    assert.equal(initial.disabledPagination.href, null);
    assert.equal(initial.disabledPagination.tabIndex, -1);
    assert.equal(initial.disabledPagination.disabled, "true");
    await page.screenshot({
      path: path.resolve(import.meta.dirname, `../.cache/example/${engine}-before-hatches.png`),
      fullPage: true,
    });
    await page.getByTestId("theme").click();
    initial.dark = await snapshot();
    await page.screenshot({
      path: path.resolve(
        import.meta.dirname,
        `../.cache/example/${engine}-before-hatches-dark.png`,
      ),
      fullPage: true,
    });
    assert.equal(await page.locator("[data-lenso-ready]").count(), 0);
    await page.getByTestId("theme").click();
    await page.getByTestId("form-readonly").click();
    for (const id of ["name", "notes"])
      assert.equal(await page.getByTestId(id).evaluate((node) => node.readOnly), true);
    await page.getByTestId("form-readonly").click();
    await page.evaluate(() => {
      const unrelated = document.createElement("link");
      unrelated.rel = "stylesheet";
      document.head.prepend(unrelated);
    });
    release();
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[data-hatch="lenso-ui"]')].every((node) =>
        node.hasAttribute("data-lenso-ready"),
      ),
    );
    const enhanced = {
      light: await snapshot(),
      dark: null,
      disabledPagination: await disabledPagination(),
    };
    assert.equal(enhanced.disabledPagination.role, "link");
    await page.getByTestId("theme").click();
    enhanced.dark = await snapshot();
    await page.getByTestId("theme").click();
    for (const appearance of ["light", "dark"])
      for (const [id, properties] of Object.entries(initial[appearance]))
        for (const [property, before] of Object.entries(properties)) {
          const after = enhanced[appearance][id][property];
          if (/^-?[\d.]+px$/.test(before) && /^-?[\d.]+px$/.test(after))
            assert.ok(
              Math.abs(parseFloat(before) - parseFloat(after)) < 0.5,
              `${id}.${property}: ${before} -> ${after}`,
            );
          else assert.equal(after, before, `${id}.${property}`);
        }
    await page.getByTestId("toolbar-attached").click();
    const toolbarAttachedEnhanced = await attachedToolbar();
    assert.deepEqual(toolbarAttachedEnhanced, toolbarAttachedInitial);
    await page.getByTestId("toolbar-attached").click();
    assert.equal(stylesheets.length, 1, "the hatch must reuse the blocking stylesheet");
    await Bun.write(
      path.resolve(import.meta.dirname, `../.cache/example/${engine}-initial-styles.json`),
      JSON.stringify(
        {
          initial,
          enhanced,
          stylesheets,
          toolbarAttached: { initial: toolbarAttachedInitial, enhanced: toolbarAttachedEnhanced },
        },
        null,
        2,
      ),
    );
  } finally {
    release();
    await page.unroute("**/modules/index.js", hold);
  }
}
