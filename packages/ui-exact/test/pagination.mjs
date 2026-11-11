import assert from "node:assert/strict";
import path from "node:path";

export async function checkPagination(page, engine) {
  const root = page.getByRole("navigation", { name: "Document pages", exact: true });
  const one = page.getByTestId("pagination-one");
  const two = page.getByTestId("pagination-two");
  const prev = page.getByTestId("pagination-prev");
  const next = page.getByTestId("pagination-next");
  const eight = page.getByTestId("pagination-eight");
  const toggle = (name) => page.getByTestId(`pagination-${name}`).click();
  const resetURL = () => page.evaluate(() => history.replaceState(null, "", location.pathname));
  await page.waitForFunction(() =>
    document.getElementById("pagination-two")?.hasAttribute("data-lenso-ready"),
  );
  assert.equal(await root.getByRole("list").count(), 1);
  assert.equal(await root.getByRole("listitem").count(), 6);
  assert.equal(await root.getByRole("link").count(), 5);
  assert.equal(await one.evaluate((n) => n.tagName), "A");
  assert.equal(await two.getAttribute("aria-current"), "page");
  assert.equal(await one.getAttribute("aria-current"), "false");
  assert.equal(await two.getAttribute("data-active"), "");
  assert.equal(await eight.getAttribute("href"), null);
  assert.equal(await eight.getAttribute("tabindex"), "-1");
  assert.equal(await eight.getAttribute("aria-disabled"), "true");
  assert.equal(
    await root.locator('[data-slot="pagination-ellipsis"][aria-hidden="true"]').count(),
    1,
  );
  assert.equal(await two.evaluate((n) => getComputedStyle(n).borderRadius), "8px");
  await prev.focus();
  await page.keyboard.press("Tab");
  assert.equal(await one.evaluate((n) => n === document.activeElement), true);
  await page.keyboard.press("Tab");
  assert.equal(await two.evaluate((n) => n === document.activeElement), true);
  assert.notEqual(await two.evaluate((n) => getComputedStyle(n).boxShadow), "none");
  await page.keyboard.press("Tab");
  assert.equal(await next.evaluate((n) => n === document.activeElement), true);
  await one.focus();
  await page.keyboard.press("Enter");
  await page.waitForURL(/#pagination-page-1$/);
  assert.equal(
    await two.getAttribute("aria-current"),
    "page",
    "native navigation leaves current page to the owner",
  );
  await resetURL();
  await two.click();
  await page.waitForURL(/#pagination-page-2$/);
  await resetURL();
  await one.focus();
  await page.keyboard.press("Space");
  assert.equal(new URL(page.url()).hash, "");
  assert.ok((await next.getAttribute("rel")).split(" ").includes("noopener"));
  const opened = page.waitForEvent("popup");
  await next.click();
  const popup = await opened;
  try {
    await popup.waitForLoadState("domcontentloaded");
    assert.match(popup.url(), /#pagination-page-3$/);
    assert.equal(await popup.evaluate(() => window.opener), null);
  } finally {
    await popup.close();
  }
  await toggle("current");
  assert.equal(await one.getAttribute("aria-current"), "page");
  assert.equal(await two.getAttribute("aria-current"), "false");
  assert.equal(await prev.getAttribute("href"), null);
  assert.equal(await page.getByTestId("pagination-demo-summary").textContent(), "Page 1 of 8");
  await toggle("current");
  assert.notEqual(await prev.getAttribute("href"), null);
  const retained = await two.elementHandle();
  const currentTheme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  const viewport = page.viewportSize();
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
      for (const size of ["md", "lg", "sm"]) {
        const expected = {
          sm: width < 768 ? 32 : 28,
          md: width < 768 ? 36 : 32,
          lg: width < 768 ? 40 : 36,
        }[size];
        for (const rtl of [false, true]) {
          if (rtl) await toggle("direction");
          const geometry = await root.evaluate((n) => {
            const r = n.getBoundingClientRect(),
              one = n.querySelector("#pagination-one"),
              next = n.querySelector("#pagination-next"),
              icon = n.querySelector('[data-slot="pagination-previous-icon"]'),
              list = n.querySelector('[role="list"]');
            const summary = n.querySelector('[data-slot="pagination-summary"]');
            const s = getComputedStyle(one),
              i = getComputedStyle(icon);
            return {
              width: r.width,
              left: r.left,
              right: r.right,
              flex: getComputedStyle(n).flexDirection,
              linkHeight: s.height,
              linkWidth: s.width,
              summaryFont: getComputedStyle(summary).fontSize,
              icon: i.transform,
              one: one.getBoundingClientRect().x,
              next: next.getBoundingClientRect().x,
              list: list.getBoundingClientRect().width,
              doc: document.documentElement.scrollWidth,
            };
          });
          assert.equal(parseFloat(geometry.linkHeight), expected);
          assert.equal(parseFloat(geometry.linkWidth), expected);
          assert.equal(geometry.summaryFont, { sm: "12px", md: "14px", lg: "16px" }[size]);
          assert.equal(geometry.flex, width < 640 ? "column" : "row");
          assert.ok(geometry.left >= 0 && geometry.right <= width + 1 && geometry.doc <= width);
          assert.ok(geometry.list <= geometry.width);
          assert.equal(geometry.one < geometry.next, !rtl);
          assert.equal(geometry.icon, rtl ? "matrix(-1, 0, 0, -1, 0, 0)" : "none");
          assert.equal(
            await retained.evaluate((n) => n === document.getElementById("pagination-two")),
            true,
          );
          await root.screenshot({
            path: path.resolve(
              import.meta.dirname,
              `../.cache/example/${engine}-pagination-${appearance}-${width}-${size}-${rtl ? "rtl" : "ltr"}.png`,
            ),
          });
          if (rtl) await toggle("direction");
        }
        await toggle("size");
      }
    }
  }
  // Explicit CSS direction wins even when the document's HTML direction differs.
  await page.evaluate(() => (document.documentElement.dir = "rtl"));
  assert.equal(
    await root
      .locator('[data-slot="pagination-previous-icon"]')
      .evaluate((n) => getComputedStyle(n).transform),
    "none",
  );
  await toggle("direction");
  await page.evaluate(() => (document.documentElement.dir = "ltr"));
  assert.equal(
    await root
      .locator('[data-slot="pagination-previous-icon"]')
      .evaluate((n) => getComputedStyle(n).transform),
    "matrix(-1, 0, 0, -1, 0, 0)",
  );
  await toggle("direction");
  await page.evaluate(() => document.documentElement.removeAttribute("dir"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  const durations = await two.evaluate((n) => getComputedStyle(n).transitionDuration);
  assert.ok(durations.split(",").every((x) => parseFloat(x) === 0));
  await one.hover();
  await page.mouse.down();
  try {
    await page.waitForFunction(
      () =>
        getComputedStyle(document.getElementById("pagination-one")).transform ===
        "matrix(0.97, 0, 0, 0.97, 0, 0)",
    );
  } finally {
    await page.mouse.up();
  }
  await resetURL();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await toggle("disable");
  for (const link of [prev, one, two, eight, next]) {
    assert.equal(await link.getAttribute("href"), null);
    assert.equal(await link.getAttribute("tabindex"), "-1");
    assert.equal(await link.getAttribute("aria-disabled"), "true");
    assert.equal(await link.evaluate((n) => getComputedStyle(n).pointerEvents), "none");
    for (const type of ["click", "auxclick", "keydown"])
      assert.equal(
        await link.evaluate(
          (n, type) =>
            n.dispatchEvent(
              type === "keydown"
                ? new KeyboardEvent(type, { key: "Enter", bubbles: true, cancelable: true })
                : new MouseEvent(type, { bubbles: true, cancelable: true }),
            ),
          type,
        ),
        false,
      );
  }
  const detached = await one.elementHandle();
  await toggle("visible");
  assert.equal(await detached.evaluate((n) => n.isConnected), false);
  assert.equal(await detached.evaluate((n) => n.hasAttribute("data-lenso-ready")), false);
  assert.equal(
    await detached.evaluate((n) =>
      n.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })),
    ),
    true,
  );
  await toggle("visible");
  assert.equal(await one.getAttribute("href"), null);
  await toggle("disable");
  assert.equal(await eight.getAttribute("href"), null);
  assert.notEqual(await one.getAttribute("href"), null);
  await one.click();
  await page.waitForURL(/#pagination-page-1$/);
  await resetURL();
  await detached.dispose();
  await retained.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, v) => n.setAttribute("data-theme", v), currentTheme);
  await page.setViewportSize(viewport);
}
