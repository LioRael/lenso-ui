import assert from "node:assert/strict";
import path from "node:path";

// Exercise value ownership, collision policy and native form fields in compiled Contract.
export async function checkSlider(page, engine) {
  const viewport = page.viewportSize();
  const theme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  const root = page.getByTestId("slider-range");
  const control = page.getByTestId("slider-range-control");
  const input = (index) => page.getByTestId(`slider-range-input-${index}`);
  const button = (name) => page.getByTestId(`slider-${name}`);
  const values = async (expected) => {
    try {
      await page.waitForFunction(
        ({ expected }) =>
          document.getElementById("slider-range").dataset.lensoValues === expected.join(","),
        { expected },
        { timeout: 5000 },
      );
    } catch (cause) {
      throw new Error(
        `${engine} Slider expected ${expected}, received ${await root.getAttribute("data-lenso-values")}`,
        { cause },
      );
    }
    for (let index = 0; index < expected.length; index++)
      assert.equal(Number(await input(index).inputValue()), expected[index]);
  };
  const reset = async () => {
    await button("reset").click();
    await values([20, 60]);
  };
  const drag = async (index, target) => {
    await control.scrollIntoViewIfNeeded();
    const thumb = await page.getByTestId(`slider-range-thumb-${index}`).boundingBox();
    const box = await control.boundingBox();
    const vertical = (await root.getAttribute("data-orientation")) === "vertical";
    const rtl = (await root.getAttribute("data-lenso-direction")) === "rtl";
    const inset = (await root.getAttribute("data-lenso-alignment")) === "edge" ? 22 : 0;
    const fraction = target / 100;
    const x = vertical
      ? box.x + box.width / 2
      : rtl
        ? box.x + box.width - inset - (box.width - inset * 2) * fraction
        : box.x + inset + (box.width - inset * 2) * fraction;
    const y = vertical
      ? box.y + box.height - inset - (box.height - inset * 2) * fraction
      : box.y + box.height / 2;
    await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
    if (process.env.EXACT_SLIDER_DEBUG && vertical)
      console.log(engine, "vertical gesture", { thumb, box, x, y, viewport: page.viewportSize() });
    await page.mouse.down();
    await page.mouse.move(x, y, { steps: 10 });
    await page.mouse.up();
  };
  await root.scrollIntoViewIfNeeded();
  assert.equal(await page.getByRole("group", { name: "Price range", exact: true }).count(), 1);
  assert.equal(await page.getByRole("slider", { name: "Minimum price", exact: true }).count(), 1);
  assert.equal(await root.evaluate((n) => getComputedStyle(n).display), "grid");
  await values([20, 60]);
  const identity = await input(0).elementHandle();
  const geometry = await control.boundingBox();
  const thumb = await page.getByTestId("slider-range-thumb-0").boundingBox();
  assert.ok(Math.abs(thumb.x + 22 - (geometry.x + 22 + (geometry.width - 44) * 0.2)) < 1);
  await input(0).focus();
  for (const [key, expected] of [
    ["ArrowRight", 25],
    ["ArrowUp", 30],
    ["ArrowLeft", 25],
    ["Home", 0],
    ["End", 55],
    ["Shift+ArrowLeft", 35],
    ["PageDown", 15],
    ["PageUp", 35],
  ]) {
    await page.keyboard.press(key);
    await values([expected, 60]);
  }
  assert.match(await page.getByTestId("slider-commits").textContent(), /\(35,60\)$/);
  const changes = await page.getByTestId("slider-changes").textContent();
  await page.keyboard.press("ArrowRight");
  await values([40, 60]);
  await input(0).focus();
  await page.keyboard.press("End");
  const atEnd = await page.getByTestId("slider-changes").textContent();
  await page.keyboard.press("ArrowRight");
  await values([55, 60]);
  assert.equal(await page.getByTestId("slider-changes").textContent(), atEnd);
  assert.notEqual(atEnd, changes);
  await reset();
  await drag(0, 85);
  await values([85, 90]);
  await drag(0, 40);
  await values([40, 90]);
  assert.equal(await input(0).evaluate((n, original) => n === original, identity), true);
  await identity.dispose();
  await button("collision").click();
  await reset();
  await drag(0, 95);
  await values([55, 60]);
  await reset();
  await button("readonly").click();
  assert.equal(await input(0).getAttribute("aria-readonly"), "true");
  await input(0).focus();
  await page.keyboard.press("End");
  await values([20, 60]);
  await button("readonly").click();
  await button("disabled").click();
  assert.equal(await input(0).isDisabled(), true);
  await button("disabled").click();
  await button("accept").click();
  await input(0).focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => document.getElementById("slider-range-input-0").value === "20");
  await values([20, 60]);
  await button("accept").click();
  await button("rtl").click();
  await input(0).focus();
  await page.keyboard.press("ArrowRight");
  await values([15, 60]);
  await button("rtl").click();
  await reset();
  for (const direction of ["ltr", "rtl"]) {
    if ((await root.getAttribute("data-lenso-direction")) !== direction)
      await button("rtl").click();
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, appearance) => n.setAttribute("data-theme", appearance), appearance);
      for (const width of [390, 820]) {
        await page.setViewportSize({ width, height: 844 });
        await control.scrollIntoViewIfNeeded();
        const box = await control.boundingBox();
        const thumb = await page.getByTestId("slider-range-thumb-0").boundingBox();
        const offset = 22 + (box.width - 44) * (direction === "rtl" ? 0.8 : 0.2);
        assert.ok(Math.abs(thumb.x + 22 - (box.x + offset)) < 1);
        await page.locator("#slider-examples").screenshot({
          path: path.resolve(
            import.meta.dirname,
            `../.cache/example/${engine}-slider-horizontal-${appearance}-${direction}-${width}.png`,
          ),
        });
      }
    }
  }
  await button("rtl").click();
  if (viewport) await page.setViewportSize(viewport);
  await root.evaluate((n) => {
    const form = document.createElement("form");
    form.id = "slider-test-form";
    document.body.append(form);
    for (const input of n.querySelectorAll("input")) input.setAttribute("form", form.id);
  });
  assert.deepEqual(
    await page.evaluate(() =>
      new FormData(document.getElementById("slider-test-form")).getAll("range"),
    ),
    ["20", "60"],
  );
  assert.deepEqual(
    await page.locator("#slider-test-form").evaluate((n) => {
      n.reset();
      return new FormData(n).getAll("range");
    }),
    ["20", "60"],
  );
  await values([20, 60]);
  await page.locator("#slider-test-form").evaluate((n) => n.remove());
  await button("single").click();
  await values([40]);
  assert.equal(await root.getByRole("slider").count(), 1);
  await button("vertical").click();
  assert.ok((await control.boundingBox()).height >= 100);
  assert.equal(
    await root.evaluate((n) => getComputedStyle(n).gridTemplateAreas),
    '"output" "track" "label"',
  );
  await drag(0, 75);
  await values([75]);
  await input(0).focus();
  await page.keyboard.press("Home");
  await values([0]);
  await page.keyboard.press("End");
  await values([100]);
  await button("alignment").click();
  const box = await control.boundingBox();
  const end = await page.getByTestId("slider-range-thumb-0").boundingBox();
  assert.ok(Math.abs(end.y + 22 - box.y) < 1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await input(0).focus();
  await page.keyboard.press("ArrowDown");
  await values([95]);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const appearance of ["light", "dark"]) {
    await page
      .locator("[data-theme]")
      .first()
      .evaluate((n, appearance) => n.setAttribute("data-theme", appearance), appearance);
    for (const width of [390, 820]) {
      await page.setViewportSize({ width, height: 844 });
      await root.scrollIntoViewIfNeeded();
      await page.locator("#slider-examples").screenshot({
        path: path.resolve(
          import.meta.dirname,
          `../.cache/example/${engine}-slider-vertical-${appearance}-${width}.png`,
        ),
      });
    }
  }
  await button("vertical").click();
  await button("alignment").click();
  await button("single").click();
  await values([20, 60]);
  const old = await page.getByTestId("slider-range-thumb-0").elementHandle();
  const b = await old.boundingBox();
  await page.mouse.move(b.x + 22, b.y + 22);
  await page.mouse.down();
  await button("visible").evaluate((n) => n.click());
  await page.mouse.up();
  assert.equal(await old.evaluate((n) => n.isConnected), false);
  assert.equal(await old.evaluate((n) => n.style.getPropertyValue("--lg-slider-face")), "");
  await button("visible").click();
  await values([20, 60]);
  await old.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, theme) => n.setAttribute("data-theme", theme), theme);
  if (viewport) await page.setViewportSize(viewport);
}
