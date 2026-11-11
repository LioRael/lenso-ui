import assert from "node:assert/strict";
import path from "node:path";

export async function checkMenuBarInitial(page, url) {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  await page.route("**/modules/index.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url);
    const bar = page.getByTestId("edit-bar");
    assert.equal(await bar.getAttribute("data-lenso-ready"), null);
    assert.equal(await bar.evaluate((n) => getComputedStyle(n).height), "44px");
    assert.equal(
      await page.getByTestId("edit-bar-more").evaluate((n) => getComputedStyle(n).width),
      "36px",
    );
    await page.getByTestId("edit-bar-disabled").click();
    for (const id of ["edit-bar-copy", "edit-bar-paste", "edit-bar-more"])
      assert.equal(await page.getByTestId(id).isDisabled(), true);
    await page.getByTestId("edit-bar-copy").evaluate((n) => n.click());
    assert.equal(await page.getByTestId("edit-bar-copied").textContent(), "Copied: 0");
    await page.getByTestId("edit-bar-disabled").click();
    await page.getByTestId("edit-bar-copy").click();
    assert.equal(await page.getByTestId("edit-bar-copied").textContent(), "Copied: 1");
    assert.equal(await page.getByTestId("edit-bar-paste").isDisabled(), true);
    await page.getByTestId("edit-bar-more").click();
    await page.waitForFunction(() =>
      document.getElementById("edit-bar-menu").matches(":popover-open"),
    );
    await page.keyboard.press("Escape");
    release();
    await page.waitForFunction(() =>
      document.getElementById("edit-bar")?.hasAttribute("data-lenso-ready"),
    );
    return { nativeActions: true, initialGeometry: true };
  } finally {
    release();
    await page.unroute("**/modules/index.js");
  }
}

export async function checkMenuBar(page, engine) {
  const bar = page.getByTestId("edit-bar"),
    copy = page.getByTestId("edit-bar-copy"),
    paste = page.getByTestId("edit-bar-paste"),
    trigger = page.getByTestId("edit-bar-more"),
    menu = page.getByTestId("edit-bar-menu");
  const direct = (id) => page.getByTestId(`edit-bar-${id}`).evaluate((n) => n.click());
  const opened = () =>
    page.waitForFunction(() => {
      const n = document.getElementById("edit-bar-menu"),
        p = document.getElementById("edit-bar-menu-popup");
      return (
        n.matches(":popover-open") &&
        n.hasAttribute("data-lenso-positioned") &&
        !p.hasAttribute("data-starting-style") &&
        Math.abs(p.getBoundingClientRect().width - p.offsetWidth) < 0.5
      );
    });
  const closed = () =>
    page.waitForFunction(
      () =>
        !document.getElementById("edit-bar-menu").matches(":popover-open") &&
        document.documentElement.style.overflow !== "hidden",
    );
  const focused = async (locator) => {
    const n = await locator.elementHandle();
    try {
      await page.waitForFunction((n) => document.activeElement === n, n);
    } finally {
      await n.dispose();
    }
  };
  await page.waitForFunction(() =>
    document.getElementById("edit-bar")?.hasAttribute("data-lenso-ready"),
  );
  await bar.scrollIntoViewIfNeeded();
  assert.equal(await page.getByRole("group", { name: "Edit actions", exact: true }).count(), 1);
  assert.equal(await bar.getAttribute("role"), "group");
  assert.equal(await bar.locator("[data-material-lens]").count(), 1);
  await page.waitForFunction(
    () =>
      document
        .querySelector("#edit-bar > [data-material-lens]")
        .style.getPropertyValue("--lenso-glass-clarity") !== "",
  );
  assert.equal(
    await bar
      .locator("[data-material-lens]")
      .evaluate((n) => getComputedStyle(n).getPropertyValue("--apple-material-profile").trim()),
    "medium",
  );
  await copy.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  assert.equal(await page.getByTestId("edit-bar-copied").textContent(), "Copied: 2");
  await paste.evaluate((n) => n.click());
  assert.equal(await page.getByTestId("edit-bar-pasted").textContent(), "Pasted: 0");
  await page.keyboard.press("Tab");
  await focused(trigger);
  await page.keyboard.press("ArrowUp");
  await opened();
  await focused(page.getByTestId("edit-bar-replace"));
  const anchor = await menu.evaluate((n) =>
    Number.parseFloat(n.style.getPropertyValue("--anchor-width")),
  );
  assert.ok(
    Math.abs(anchor - (await bar.boundingBox()).width) < 1,
    "popup uses the entire bar anchor",
  );
  await page.keyboard.press("Escape");
  await closed();
  await focused(trigger);
  await page.keyboard.press("ArrowDown");
  await opened();
  await focused(page.getByTestId("edit-bar-select"));
  await copy.click();
  await closed();
  assert.equal(
    await page.getByTestId("edit-bar-copied").textContent(),
    "Copied: 3",
    "backdrop cutout includes sibling bar actions",
  );
  await trigger.click();
  await opened();
  await page.getByTestId("edit-bar-select").click();
  await closed();
  assert.equal(await page.getByTestId("edit-bar-selected").textContent(), "Selected: 1");
  await direct("disabled");
  for (const item of [copy, paste, trigger]) assert.equal(await item.isDisabled(), true);
  await copy.evaluate((n) => n.click());
  assert.equal(await page.getByTestId("edit-bar-copied").textContent(), "Copied: 3");
  await direct("disabled");
  assert.equal(await copy.isDisabled(), false);
  assert.equal(await paste.isDisabled(), true);
  await direct("paste-disabled");
  await paste.click();
  assert.equal(await page.getByTestId("edit-bar-pasted").textContent(), "Pasted: 1");
  await copy.scrollIntoViewIfNeeded();
  await copy.hover();
  await page.mouse.down();
  await page.waitForFunction(() =>
    document
      .getElementById("edit-bar")
      .style.getPropertyValue("--lg-press-scale")
      .split(" ")
      .some((x) => Number(x) > 1.005),
  );
  await page.mouse.up();
  await page.waitForFunction(
    () =>
      Math.abs(
        Number(getComputedStyle(document.getElementById("edit-bar")).scale.split(" ")[0]) - 1,
      ) < 0.001,
  );
  await direct("elastic");
  await copy.hover();
  await page.mouse.down();
  assert.equal(await bar.evaluate((n) => getComputedStyle(n).scale), "none");
  await page.mouse.up();
  await direct("elastic");
  const captures = [];
  for (const direction of ["ltr", "rtl"]) {
    if (direction === "rtl") await direct("direction");
    assert.equal(await bar.evaluate((n) => getComputedStyle(n).direction), direction);
    for (const width of [390, 820]) {
      await page.setViewportSize({ width, height: 900 });
      await trigger.scrollIntoViewIfNeeded();
      await trigger.focus();
      await page.keyboard.press("ArrowDown");
      await opened();
      const geometry = await bar.evaluate((n) => ({
        height: n.offsetHeight,
        item: n.querySelector("button").offsetHeight,
        expand: n.querySelector("[aria-haspopup]").offsetWidth,
      }));
      assert.deepEqual(geometry, { height: 44, item: 44, expand: 36 });
      await page.screenshot({
        path: path.join(
          process.env.LENSO_EXACT_TEST_ARTIFACTS ??
            path.resolve(import.meta.dirname, "../.cache/example"),
          `${engine}-menu-bar-${direction}-${width}.png`,
        ),
      });
      captures.push({ direction, width, geometry });
      await page.keyboard.press("Escape");
      await closed();
    }
  }
  const lens = await bar.locator("[data-material-lens]").elementHandle();
  const filter = await lens.evaluate(
    (n) => n.style.getPropertyValue("--lg-filter").match(/#([\w-]+)/)?.[1],
  );
  await direct("mounted");
  await page.waitForFunction(
    (id) => !document.getElementById("edit-bar") && !document.getElementById(id),
    filter,
  );
  assert.equal(await lens.evaluate((n) => n.style.getPropertyValue("--lg-filter")), "");
  assert.equal(await lens.evaluate((n) => n.style.getPropertyValue("--lenso-glass-clarity")), "");
  await lens.dispose();
  await direct("mounted");
  await page.waitForFunction(() =>
    document.getElementById("edit-bar")?.hasAttribute("data-lenso-ready"),
  );
  await direct("direction");
  return { captures, sharedMaterial: true, siblingCutout: true, elastic: true, cleanup: true };
}

export async function checkMenuBarTouch(page) {
  await page.waitForFunction(() =>
    document.getElementById("edit-bar")?.hasAttribute("data-lenso-ready"),
  );
  await page.getByTestId("edit-bar-more").tap();
  await page.waitForFunction(() =>
    document.getElementById("edit-bar-menu").hasAttribute("data-lenso-positioned"),
  );
  await page.getByTestId("edit-bar-select").tap();
  await page.waitForFunction(
    () => !document.getElementById("edit-bar-menu").matches(":popover-open"),
  );
  assert.equal(await page.getByTestId("edit-bar-selected").textContent(), "Selected: 1");
  return { nativeTap: true };
}

export async function checkMenuBarThemes(page, engine) {
  const bar = page.getByTestId("edit-bar");
  await page.waitForFunction(() =>
    document.getElementById("edit-bar")?.hasAttribute("data-lenso-ready"),
  );
  await bar.scrollIntoViewIfNeeded();
  const colors = {};
  for (const appearance of ["light", "dark"]) {
    if (!(await page.locator(`[data-theme="${appearance}"]`).count()))
      await page.getByTestId("theme").evaluate((n) => n.click());
    colors[appearance] = await bar.evaluate((n) => getComputedStyle(n).color);
    for (const width of [390, 820]) {
      await page.setViewportSize({ width, height: 900 });
      await bar.scrollIntoViewIfNeeded();
      await page.locator("#menu-bar-examples").screenshot({
        path: path.join(
          process.env.LENSO_EXACT_TEST_ARTIFACTS ??
            path.resolve(import.meta.dirname, "../.cache/example"),
          `${engine}-menu-bar-${appearance}-${width}.png`,
        ),
      });
    }
  }
  assert.notEqual(colors.light, colors.dark);
  const ancestor = await bar.evaluateHandle((n) => n.parentElement);
  const original = await ancestor.evaluate((n) => n.getAttribute("data-contrast"));
  await ancestor.evaluate((n) => n.setAttribute("data-contrast", "increased"));
  await page.waitForFunction(() =>
    document.getElementById("edit-bar").hasAttribute("data-material-opaque"),
  );
  assert.equal(
    await bar.locator("[data-material-lens]").evaluate((n) => getComputedStyle(n).display),
    "none",
  );
  await ancestor.evaluate(
    (n, before) =>
      before === null
        ? n.removeAttribute("data-contrast")
        : n.setAttribute("data-contrast", before),
    original,
  );
  await ancestor.dispose();
  await page.waitForFunction(
    () => !document.getElementById("edit-bar").hasAttribute("data-material-opaque"),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  const copy = page.getByTestId("edit-bar-copy");
  await copy.hover();
  await page.mouse.down();
  assert.ok(
    await bar.evaluate((n) =>
      getComputedStyle(n)
        .scale.split(" ")
        .every((x) => Number.isFinite(Number(x)) && Math.abs(Number(x) - 1) < 0.001),
    ),
  );
  await page.mouse.up();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  return { colors, opaqueFallback: true, reducedMotion: true };
}
