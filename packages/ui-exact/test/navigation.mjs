import assert from "node:assert/strict";
import path from "node:path";

/** Exercise the compiled consumer's native navigation and dynamic semantics. */
export async function checkNavigation(page, engine) {
  const navigation = page.getByRole("navigation", { name: "Location", exact: true });
  assert.equal(await navigation.getByRole("list").count(), 1);
  assert.equal(await navigation.getByRole("listitem").count(), 3);
  const local = page.getByTestId("navigation-local");
  const home = page.getByTestId("trail-home");
  const locked = page.getByTestId("trail-library");
  const current = page.getByTestId("trail-current");
  assert.equal(await local.evaluate((node) => node.tagName), "A");
  assert.equal(await locked.getAttribute("href"), null);
  assert.equal(await locked.getAttribute("role"), "link");
  assert.equal(await locked.getAttribute("aria-disabled"), "true");
  assert.equal(await locked.getAttribute("tabindex"), "-1");
  assert.equal(await current.getAttribute("aria-current"), "page");
  assert.equal(await home.getAttribute("aria-current"), "false");
  assert.equal(await page.getByRole("link", { name: "Exact source", exact: true }).count(), 1);
  const external = page.getByTestId("navigation-external");
  assert.equal(await external.getAttribute("target"), "_blank");
  assert.ok((await external.getAttribute("rel")).split(" ").includes("noopener"));
  assert.equal(await local.locator('[data-slot="link-icon"][aria-hidden="true"]').count(), 1);

  await page.getByTestId("navigation-current").click();
  assert.equal(await home.getAttribute("aria-current"), "page");
  assert.equal(await current.getAttribute("aria-current"), "false");
  await page.getByTestId("navigation-current").click();
  // Fulfill the external destination locally so navigation does not need GitHub.
  await page.context().route("https://github.com/expo/exact", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Exact source</title>",
    }),
  );
  try {
    const opened = page.waitForEvent("popup");
    await external.click();
    const popup = await opened;
    await popup.waitForLoadState("domcontentloaded");
    assert.equal(popup.url(), "https://github.com/expo/exact");
    assert.equal(await popup.title(), "Exact source");
    await popup.close();
  } finally {
    await page.context().unroute("https://github.com/expo/exact");
  }

  await home.focus();
  await page.keyboard.press("Tab");
  assert.equal(await current.evaluate((node) => document.activeElement === node), true);
  await page.keyboard.press("Tab");
  assert.equal(await local.evaluate((node) => document.activeElement === node), true);
  assert.notEqual(await local.evaluate((node) => getComputedStyle(node).boxShadow), "none");
  await page.keyboard.press("Enter");
  await page.waitForURL(/#navigation-target$/);
  await page.evaluate(() => history.replaceState(null, "", location.pathname));
  await local.click();
  await page.waitForURL(/#navigation-target$/);
  await page.evaluate(() => history.replaceState(null, "", location.pathname));

  await page.getByTestId("navigation-disabled").click();
  for (const link of [local, home, current, external]) {
    assert.equal(await link.getAttribute("href"), null);
    assert.equal(await link.getAttribute("aria-disabled"), "true");
    assert.equal(await link.getAttribute("tabindex"), "-1");
    for (const type of ["click", "auxclick", "keydown"])
      assert.equal(
        await link.evaluate((node, type) => {
          const event =
            type === "keydown"
              ? new KeyboardEvent(type, { key: "Enter", bubbles: true, cancelable: true })
              : new MouseEvent(type, { bubbles: true, cancelable: true });
          return node.dispatchEvent(event);
        }, type),
        false,
        `disabled ${type} must be canceled`,
      );
  }
  assert.equal(new URL(page.url()).hash, "");
  const retired = await local.elementHandle();
  await page.getByTestId("navigation-visible").click();
  assert.equal(await local.count(), 0);
  assert.equal(await retired.evaluate((node) => node.isConnected), false);
  assert.equal(
    await retired.evaluate((node) =>
      node.dispatchEvent(new MouseEvent("click", { cancelable: true })),
    ),
    true,
    "removed hatch must release its activation guard",
  );
  await retired.dispose();
  await page.getByTestId("navigation-visible").click();
  assert.equal(await local.getAttribute("href"), null);
  await page.getByTestId("navigation-disabled").click();
  assert.equal(await local.getAttribute("href"), "#navigation-target");
  assert.equal(
    await locked.getAttribute("href"),
    null,
    "item disabled state survives group changes",
  );

  const horizontal = page.getByTestId("navigation-horizontal");
  const vertical = page.getByTestId("navigation-vertical");
  assert.equal(await horizontal.getAttribute("role"), "separator");
  assert.equal(await horizontal.getAttribute("aria-orientation"), "horizontal");
  assert.equal(await vertical.getAttribute("aria-hidden"), "true");
  assert.equal(await vertical.getAttribute("role"), "presentation");
  assert.equal(await horizontal.evaluate((node) => node.getBoundingClientRect().height), 1);
  assert.equal(await vertical.evaluate((node) => node.getBoundingClientRect().width), 1);
  assert.ok(await vertical.evaluate((node) => node.getBoundingClientRect().height >= 8));
  const ordinary = await horizontal.evaluate((node) => getComputedStyle(node).backgroundColor);
  await page.getByTestId("navigation-variant").click();
  assert.notEqual(
    await horizontal.evaluate((node) => getComputedStyle(node).backgroundColor),
    ordinary,
  );
  await page.getByTestId("navigation-variant").click();
  const chevron = navigation.locator('[data-lenso-kind="breadcrumbs-chevron"]');
  assert.equal(await chevron.evaluate((node) => getComputedStyle(node).transform), "none");
  await page.getByTestId("navigation-direction").click();
  assert.equal(await navigation.evaluate((node) => getComputedStyle(node).direction), "rtl");
  assert.match(
    await chevron.evaluate((node) => getComputedStyle(node).transform),
    /^matrix\(-1, 0, 0, -1,/,
  );
  await page.locator("#navigation-examples").screenshot({
    path: path.resolve(import.meta.dirname, `../.cache/example/${engine}-navigation-rtl.png`),
  });
  await page.getByTestId("navigation-direction").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector('[data-testid="navigation-local"]'))
        .transitionDuration === "0s",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
}
