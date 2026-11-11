import assert from "node:assert/strict";
import path from "node:path";

// A value choice must preserve radio semantics, form values and owner rejection.
export async function checkSegmented(page, engine) {
  const viewport = page.viewportSize();
  const theme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  const group = page.getByTestId("segments");
  const choice = (index) => page.getByTestId(`segments-item-${index}`);
  const input = (index) => page.getByTestId(`segments-item-${index}-input`);
  const button = (name) => page.getByTestId(`segments-${name}`);
  const selected = async (index) => {
    await page.waitForFunction(
      ({ index }) =>
        document.getElementById(`segments-item-${index}`)?.getAttribute("aria-checked") === "true",
      { index },
    );
    assert.equal(await input(index).isChecked(), true);
  };
  const focused = async (index) =>
    assert.equal(await choice(index).evaluate((n) => n === document.activeElement), true);
  const count = () => page.getByTestId("segments-changes").textContent();
  const day = async () => {
    await button("day").click();
    await selected(0);
  };
  await group.scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    document.getElementById("segments").hasAttribute("data-lenso-ready"),
  );
  assert.equal(await page.getByRole("radiogroup", { name: "Billing period" }).count(), 1);
  assert.equal(await group.getByRole("radio").count(), 3);
  await selected(0);
  await input(0).focus();
  await focused(0);
  assert.equal(await choice(1).getAttribute("aria-disabled"), "true");
  await choice(0).focus();
  await page.keyboard.press("ArrowRight");
  await selected(2);
  await focused(2);
  await page.keyboard.press("ArrowRight");
  await selected(0);
  await page.keyboard.press("ArrowUp");
  await selected(2);
  await page.keyboard.press("Home");
  await selected(0);
  await page.keyboard.press("End");
  await selected(2);
  await choice(0).focus();
  await page.keyboard.press("Enter");
  await selected(2);
  await page.keyboard.press("Space");
  await selected(0);
  const noOp = await count();
  await choice(0).evaluate((n) => n.click());
  assert.equal(await count(), noOp);
  await choice(1).evaluate((n) => n.click());
  await selected(0);
  await button("readonly").click();
  assert.equal(await group.getAttribute("aria-readonly"), "true");
  await choice(0).focus();
  await page.keyboard.press("ArrowRight");
  await focused(2);
  await selected(0);
  await page.keyboard.press("Space");
  await selected(0);
  await input(2).evaluate((n) => n.click());
  await selected(0);
  await button("readonly").click();
  await button("disabled").click();
  const disabled = await count();
  await choice(2).evaluate((n) => n.click());
  assert.equal(await count(), disabled);
  assert.equal(await input(0).isDisabled(), true);
  await button("disabled").click();
  await button("accept").click();
  await choice(2).click();
  await selected(0);
  await input(2).evaluate((n) => n.click());
  await page.waitForFunction(
    () =>
      document.getElementById("segments-item-0-input").checked &&
      !document.getElementById("segments-item-2-input").checked,
  );
  await button("accept").click();
  await button("rtl").click();
  await choice(0).focus();
  await page.keyboard.press("ArrowLeft");
  await selected(2);
  await button("rtl").click();
  await day();
  const original = await choice(0).elementHandle();
  await group.scrollIntoViewIfNeeded();
  const a = await choice(0).boundingBox(),
    b = await choice(2).boundingBox();
  const before = Number((await count()).split(": ")[1]);
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 });
  await page.mouse.up();
  await selected(2);
  assert.equal(Number((await count()).split(": ")[1]), before + 1);
  assert.equal(await choice(0).evaluate((n, original) => n === original, original), true);
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.id = "segments-native-form";
    document.body.append(form);
  });
  const formValue = () =>
    page.evaluate(() =>
      new FormData(document.getElementById("segments-native-form")).get("billing-period"),
    );
  assert.equal(await formValue(), "month");
  assert.equal(
    await page.locator("#segments-native-form").evaluate((n) => {
      n.reset();
      return new FormData(n).get("billing-period");
    }),
    "month",
  );
  await button("clear").click();
  assert.equal(await formValue(), null);
  await button("required").click();
  assert.equal(await input(0).evaluate((n) => n.checkValidity()), false);
  await focused(0);
  assert.equal(
    await page.locator("#segments-native-form").evaluate((n) => n.reportValidity()),
    false,
  );
  await focused(0);
  await page.keyboard.press("Space");
  await selected(0);
  assert.equal(await input(0).evaluate((n) => n.checkValidity()), true);
  await button("required").click();
  const rich = page.getByTestId("segments-rich");
  const auto = page.getByTestId("segments-rich-auto");
  const custom = page.getByTestId("segments-rich-custom");
  assert.equal(
    await page.evaluate(() =>
      new FormData(document.getElementById("segments-native-form")).get("display-mode"),
    ),
    null,
  );
  await auto.click();
  assert.equal(await auto.getAttribute("aria-checked"), "true");
  assert.equal(
    await page.evaluate(() =>
      new FormData(document.getElementById("segments-native-form")).get("display-mode"),
    ),
    "",
  );
  await custom.click();
  assert.equal(
    await page.evaluate(() =>
      new FormData(document.getElementById("segments-native-form")).get("display-mode"),
    ),
    "custom profile",
  );
  await page.getByTestId("segments-rich-clear").click();
  assert.equal(await rich.locator('[role="radio"][aria-checked="true"]').count(), 0);
  await page.locator("#segments-native-form").evaluate((n) => n.remove());
  await button("empty").click();
  assert.equal(await group.getByRole("radio").count(), 0);
  assert.equal(await group.getByText("No billing periods").count(), 1);
  await button("empty").click();
  await selected(0);
  await button("middle").click();
  await choice(0).focus();
  await page.keyboard.press("ArrowRight");
  await selected(1);
  await button("size").click();
  assert.equal(Math.round((await choice(1).boundingBox()).height), 46);
  await button("glass").click();
  const track = group.locator('[data-slot="segmented-control-glass"]');
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-slot="segmented-control-glass"]')
        .getAttribute("data-material") === "glass-small",
  );
  const lens = track.locator('[data-lenso-kind="tabs-track-lens"]');
  await page.emulateMedia({ forcedColors: "active" });
  await page.waitForFunction(() =>
    document
      .querySelector('[data-slot="segmented-control-glass"]')
      .hasAttribute("data-material-opaque"),
  );
  assert.equal(await lens.evaluate((n) => getComputedStyle(n).display), "none");
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
  await choice(2).click();
  await selected(2);
  const indicator = await group.locator('[data-slot="segmented-control-fallback"]').boundingBox();
  const active = await choice(2).boundingBox();
  assert.ok(Math.abs(indicator.x + indicator.width / 2 - active.x - active.width / 2) < 1);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await button("glass").click();
  await button("long").click();
  const label = choice(2).locator('[data-slot="segmented-control-label"]');
  assert.equal(await label.evaluate((n) => getComputedStyle(n).textOverflow), "ellipsis");
  assert.equal(
    await label.evaluate((n) => getComputedStyle(n.firstElementChild).whiteSpace),
    "nowrap",
  );
  assert.equal(
    await label.evaluate((n) => getComputedStyle(n.firstElementChild).display),
    "inline",
  );
  assert.ok(await label.evaluate((n) => n.scrollWidth > n.clientWidth));
  assert.ok((await label.boundingBox()).height <= (await choice(2).boundingBox()).height);
  for (const direction of ["ltr", "rtl"]) {
    if ((await group.evaluate((n) => getComputedStyle(n).direction)) !== direction)
      await button("rtl").click();
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, appearance) => n.setAttribute("data-theme", appearance), appearance);
      for (const width of [390, 820]) {
        await page.setViewportSize({ width, height: 844 });
        await group.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => {
          const root = document.getElementById("segments");
          const active = root
            .querySelector('[role="radio"][aria-checked="true"]')
            .getBoundingClientRect();
          const lens = root
            .querySelector('[data-slot="segmented-control-fallback"]')
            .getBoundingClientRect();
          return Math.abs(active.x + active.width / 2 - lens.x - lens.width / 2) < 1;
        });
        await page.locator("#segmented-examples").screenshot({
          path: path.resolve(
            import.meta.dirname,
            `../.cache/example/${engine}-segmented-${appearance}-${direction}-${width}.png`,
          ),
        });
      }
    }
  }
  const old = await group.elementHandle();
  await button("visible").click();
  assert.equal(await old.evaluate((n) => n.isConnected), false);
  assert.equal(await old.evaluate((n) => n.hasAttribute("data-lenso-ready")), false);
  await button("visible").click();
  await selected(2);
  await old.dispose();
  await original.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, theme) => n.setAttribute("data-theme", theme), theme);
  if (viewport) await page.setViewportSize(viewport);
}
