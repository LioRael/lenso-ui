import assert from "node:assert/strict";
import path from "node:path";

// Catch cached-image, failed-image and source-replacement regressions in the hatch.
export async function checkAvatar(page, engine) {
  const avatar = page.getByTestId("avatar-person");
  await avatar.scrollIntoViewIfNeeded();
  assert.equal(await page.getByRole("img", { name: "Ada Lovelace", exact: true }).count(), 1);
  assert.equal(await page.getByRole("group", { name: "Document collaborators" }).count(), 1);
  const handle = await avatar.elementHandle();
  const image = avatar.locator("img");
  assert.equal(await image.getAttribute("alt"), "");
  const loaded = (value) =>
    page.waitForFunction(
      ({ value }) =>
        document.getElementById("avatar-person").hasAttribute("data-lenso-image-loaded") === value,
      { value },
    );
  await loaded(true);
  assert.equal(
    await avatar
      .locator('[data-slot="avatar-fallback"]')
      .evaluate((n) => getComputedStyle(n).visibility),
    "hidden",
  );
  await page.getByTestId("avatar-image-toggle").click();
  await loaded(false);
  assert.equal(
    await avatar
      .locator('[data-slot="avatar-fallback"]')
      .evaluate((n) => getComputedStyle(n).visibility),
    "visible",
  );
  await page.getByTestId("avatar-image-toggle").click();
  await loaded(true);
  assert.equal(await avatar.evaluate((n, old) => n === old, handle), true);
  for (const size of [48, 32, 40]) {
    await page.getByTestId("avatar-size-toggle").click();
    assert.equal(Math.round((await avatar.boundingBox()).width), size);
  }
  const items = page.getByTestId("avatar-team").locator('[data-lenso-kind="avatar-group-item"]');
  assert.equal(await items.nth(1).evaluate((n) => getComputedStyle(n).marginInlineStart), "-8px");
  assert.notEqual(await items.first().evaluate((n) => getComputedStyle(n).maskImage), "none");
  await page.getByTestId("avatar-ring-toggle").click();
  assert.equal(await items.first().evaluate((n) => getComputedStyle(n).maskImage), "none");
  assert.notEqual(await items.first().evaluate((n) => getComputedStyle(n).boxShadow), "none");
  await page.getByTestId("avatar-grid-toggle").click();
  assert.equal(await items.nth(1).evaluate((n) => getComputedStyle(n).marginInlineStart), "0px");
  assert.equal(
    await page.getByTestId("avatar-team").evaluate((n) => getComputedStyle(n).gap),
    "12px",
  );
  for (const direction of ["ltr", "rtl"]) {
    await page
      .getByTestId("avatar-team")
      .evaluate((n, direction) => (n.dir = direction), direction);
    await page.getByTestId("avatar-grid-toggle").click();
    const a = await avatar.boundingBox();
    const b = await page.getByTestId("avatar-other").boundingBox();
    assert.equal(Math.round(Math.abs(b.x - a.x)), 32);
    await page.locator("#avatar-examples").screenshot({
      path: path.resolve(
        import.meta.dirname,
        `../.cache/example/${engine}-avatar-${direction}.png`,
      ),
    });
    await page.getByTestId("avatar-grid-toggle").click();
  }
  await handle.dispose();
}
