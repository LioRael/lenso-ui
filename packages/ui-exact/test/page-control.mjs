import assert from "node:assert/strict";
import path from "node:path";

// Keyboard destinations can be outside the mounted window and require owner approval.
export async function checkPageControl(page, engine) {
  const viewport = page.viewportSize();
  const appearance = await page.locator("[data-theme]").first().getAttribute("data-theme");
  const root = page.getByTestId("pages"),
    track = page.getByTestId("pages-track");
  const item = (index) => page.getByTestId(`pages-page-${index}`);
  const toggle = (name) => page.getByTestId(`pages-${name}`).click();
  const requests = () => page.getByTestId("pages-requests").textContent();
  const focused = async (index) =>
    assert.equal(await item(index).evaluate((n) => n === document.activeElement), true);
  const selected = async (index) => {
    await page.waitForFunction(
      (index) =>
        document.getElementById(`pages-page-${index}`)?.getAttribute("aria-current") === "page",
      index,
    );
    assert.equal(await root.locator('[aria-current="page"]').count(), 1);
    assert.equal(await item(index).getAttribute("tabindex"), "0");
  };
  const indices = () =>
    root.getByRole("button").evaluateAll((nodes) => nodes.map((n) => Number(n.dataset.lensoIndex)));
  const style = (node, property) =>
    node.evaluate((n, p) => getComputedStyle(n).getPropertyValue(p), property);
  await root.scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    document.getElementById("pages").hasAttribute("data-lenso-ready"),
  );
  assert.equal(
    await page.getByRole("navigation", { name: "Gallery pages", exact: true }).count(),
    1,
  );
  await selected(0);
  assert.deepEqual(await indices(), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(await item(0).getAttribute("aria-label"), "Page 1 of 17");
  assert.equal((await track.boundingBox()).height, 26);
  assert.equal((await root.boundingBox()).height, 44);
  assert.equal((await item(8).boundingBox()).width, 14);
  assert.equal((await item(7).boundingBox()).width, 16);
  assert.equal(
    await style(item(8).locator('[data-slot="page-control-dot"]'), "transform"),
    "matrix(0.5, 0, 0, 0.5, 0, 0)",
  );
  assert.equal(
    await root.locator('[data-slot="page-control-request"]').evaluate((n) => n.form),
    null,
  );
  await item(0).focus();
  await page.keyboard.press("Tab");
  assert.equal(
    await page.getByTestId("pages-rich-page-0").evaluate((n) => n === document.activeElement),
    true,
  );
  await item(0).focus();
  await page.keyboard.press("ArrowRight");
  await selected(1);
  await focused(1);
  await page.keyboard.press("End");
  await selected(16);
  await focused(16);
  assert.deepEqual(await indices(), [8, 9, 10, 11, 12, 13, 14, 15, 16]);
  const endRequests = await requests();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("End");
  assert.equal(await requests(), endRequests);
  await page.keyboard.press("Home");
  await selected(0);
  await focused(0);
  const firstRequests = await requests();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  assert.equal(await requests(), firstRequests);
  await item(4).click();
  await selected(4);
  const original = await item(4).elementHandle();
  await item(4).focus();
  await page.keyboard.press("ArrowRight");
  await selected(5);
  await focused(5);
  assert.equal(await item(4).evaluate((n, old) => n === old, original), true);
  await item(6).focus();
  await page.keyboard.press("ArrowLeft");
  await focused(5);
  await item(7).focus();
  await page.keyboard.press("ArrowLeft");
  await selected(6);
  await focused(6);
  await page.keyboard.press("ArrowUp");
  await selected(5);
  await focused(5);
  await page.keyboard.press("ArrowDown");
  await selected(6);
  await focused(6);
  await toggle("rtl");
  await item(6).focus();
  await page.keyboard.press("ArrowLeft");
  await selected(7);
  await focused(7);
  await page.keyboard.press("ArrowRight");
  await selected(6);
  await focused(6);
  await toggle("rtl");
  const ignored = await requests();
  await item(6).evaluate((n) =>
    n.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", ctrlKey: true, bubbles: true, cancelable: true }),
    ),
  );
  await root.evaluate((n) => {
    window.pageControlCancel = new AbortController();
    n.addEventListener("keydown", (e) => e.preventDefault(), {
      capture: true,
      signal: window.pageControlCancel.signal,
    });
  });
  await item(6).focus();
  await page.keyboard.press("End");
  assert.equal(await requests(), ignored);
  await root.evaluate(() => {
    window.pageControlCancel.abort();
    delete window.pageControlCancel;
  });
  await toggle("accept");
  await item(6).focus();
  await page.keyboard.press("ArrowRight");
  await selected(6);
  await focused(6);
  await page.waitForFunction(
    () => document.querySelector('#pages [data-slot="page-control-request"]').value === "6",
  );
  await page.getByTestId("pages-apply").evaluate((n) => n.click());
  await selected(7);
  await focused(7);
  // Replacing the page collection invalidates an earlier deferred focus request.
  await toggle("first");
  await item(0).focus();
  await page.keyboard.press("End");
  await toggle("seven");
  await toggle("normal");
  await page.getByTestId("pages-rich-page-0").focus();
  await page.getByTestId("pages-apply").evaluate((n) => n.click());
  await selected(16);
  assert.equal(
    await page.getByTestId("pages-rich-page-0").evaluate((n) => n === document.activeElement),
    true,
  );
  await toggle("first");
  await item(7).click();
  await page.getByTestId("pages-apply").evaluate((n) => n.click());
  await selected(7);
  await toggle("accept");
  await toggle("disabled");
  const disabledRequests = await requests();
  for (const button of await root.getByRole("button").all()) {
    assert.equal(await button.isDisabled(), true);
    await button.evaluate((n) => n.click());
  }
  await item(7).evaluate((n) =>
    n.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true })),
  );
  assert.equal(await requests(), disabledRequests);
  await toggle("disabled");
  await toggle("labels");
  assert.equal(await item(7).getAttribute("aria-label"), "第 8 页");
  await toggle("labels");
  await toggle("seven");
  await selected(6);
  assert.equal(await root.getByRole("button").count(), 7);
  assert.equal((await track.boundingBox()).width, 140);
  assert.equal((await item(0).boundingBox()).width, 18);
  await toggle("plain");
  assert.equal((await track.boundingBox()).width, 126);
  assert.equal(await style(track, "backdrop-filter"), "none");
  assert.equal(await track.getAttribute("data-material"), null);
  await toggle("plain");
  assert.equal(await track.getAttribute("data-material"), "glass-small");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.waitForFunction(() =>
    document.querySelector('[data-testid="pages-track"]').hasAttribute("data-lenso-glass-opaque"),
  );
  assert.equal(await style(track, "backdrop-filter"), "none");
  assert.equal(
    await style(item(6).locator('[data-slot="page-control-dot"]'), "transition-duration"),
    "0s",
  );
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "no-preference" });
  await toggle("single");
  await selected(0);
  assert.equal(await root.getByRole("button").count(), 1);
  await item(0).focus();
  const singleRequests = await requests();
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowDown");
  assert.equal(await requests(), singleRequests);
  for (const name of ["empty", "negative-count"]) {
    await toggle(name);
    assert.equal(await root.count(), 0);
  }
  await toggle("fraction-count");
  assert.equal(await root.getByRole("button").count(), 7);
  await toggle("normal");
  await toggle("outside");
  await selected(16);
  await toggle("negative-page");
  await selected(0);
  await toggle("fraction-page");
  await selected(3);
  await toggle("first");
  await selected(0);
  await toggle("many");
  await item(0).focus();
  await page.keyboard.press("End");
  await selected(999);
  await focused(999);
  assert.equal(await root.getByRole("button").count(), 9);
  assert.deepEqual(await indices(), [991, 992, 993, 994, 995, 996, 997, 998, 999]);
  await page.keyboard.press("Home");
  await selected(0);
  await focused(0);
  const rich = page.getByTestId("pages-rich");
  await rich.getByRole("button", { name: "Introduction", exact: true }).focus();
  await page.keyboard.press("End");
  assert.equal(
    await rich.getByRole("button", { name: "Appendix", exact: true }).getAttribute("aria-current"),
    "page",
  );
  await selected(0);
  await toggle("normal");
  await item(8).click();
  await selected(8);
  for (const variant of ["prominent", "plain"]) {
    if (variant === "plain") await toggle("plain");
    for (const direction of ["ltr", "rtl"]) {
      if ((await style(root, "direction")) !== direction) await toggle("rtl");
      for (const theme of ["light", "dark"]) {
        await page
          .locator("[data-theme]")
          .first()
          .evaluate((n, v) => n.setAttribute("data-theme", v), theme);
        for (const width of [390, 820]) {
          await page.setViewportSize({ width, height: 844 });
          await root.scrollIntoViewIfNeeded();
          assert.ok((await track.boundingBox()).width <= (await root.boundingBox()).width);
          await root.screenshot({
            path: path.resolve(
              import.meta.dirname,
              `../.cache/example/${engine}-pages-${variant}-${theme}-${direction}-${width}.png`,
            ),
          });
        }
      }
    }
  }
  const old = await root.elementHandle();
  const oldButton = await item(8).elementHandle();
  await toggle("accept");
  await item(8).focus();
  await page.keyboard.press("End");
  await toggle("visible");
  assert.equal(await old.evaluate((n) => n.isConnected), false);
  assert.equal(await old.evaluate((n) => n.hasAttribute("data-lenso-ready")), false);
  const endedRequests = await requests();
  await oldButton.evaluate((n) =>
    n.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true })),
  );
  assert.equal(await requests(), endedRequests);
  await toggle("visible");
  await page.getByTestId("pages-rich-page-2").focus();
  await page.getByTestId("pages-apply").evaluate((n) => n.click());
  await selected(16);
  assert.equal(
    await page.getByTestId("pages-rich-page-2").evaluate((n) => n === document.activeElement),
    true,
  );
  await toggle("accept");
  await old.dispose();
  await oldButton.dispose();
  await original.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
  await page.setViewportSize(viewport);
}
