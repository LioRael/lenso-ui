import assert from "node:assert/strict";
import path from "node:path";

export async function checkLayout(page, engine) {
  const card = page.getByTestId("layout-card");
  const empty = page.getByTestId("layout-empty");
  const title = page.getByTestId("layout-card-title");
  const emptyTitle = page.getByTestId("layout-empty-title");
  const create = page.getByTestId("layout-create");
  const count = page.getByTestId("layout-count");
  await card.scrollIntoViewIfNeeded();
  assert.equal(await page.getByRole("region", { name: "Workspace", exact: true }).count(), 1);
  assert.equal(await card.getAttribute("aria-describedby"), "layout-card-description");
  assert.equal(await page.getByRole("region", { name: "No documents", exact: true }).count(), 1);
  assert.equal(await empty.getAttribute("aria-describedby"), "layout-empty-description");
  assert.equal(
    await page.getByRole("heading", { name: "Workspace", level: 3, exact: true }).count(),
    1,
  );
  assert.equal(await title.getAttribute("data-slot"), "card-title");
  assert.equal(await title.evaluate((n) => getComputedStyle(n).fontWeight), "600");
  assert.equal(await title.evaluate((n) => getComputedStyle(n).fontSize), "14px");
  assert.equal(await emptyTitle.evaluate((n) => getComputedStyle(n).fontSize), "22px");
  assert.equal(await title.evaluate((n) => getComputedStyle(n).marginBlockStart), "0px");
  assert.equal(await card.locator("[data-material-lens]").count(), 0);
  const icon = empty.locator('[data-slot="empty-state-icon"]');
  assert.equal(await icon.getAttribute("aria-hidden"), "true");
  assert.deepEqual(
    await icon.evaluate((n) => ({
      width: n.getBoundingClientRect().width,
      height: n.getBoundingClientRect().height,
    })),
    { width: 49, height: 49 },
  );
  await page.getByTestId("layout-icon").click();
  assert.deepEqual(
    await icon.evaluate((n) => ({
      width: n.getBoundingClientRect().width,
      height: n.getBoundingClientRect().height,
    })),
    { width: 50, height: 50 },
  );
  assert.equal(await icon.evaluate((n) => getComputedStyle(n).borderRadius), "50%");
  await page.getByTestId("layout-icon").click();
  const actions = empty.locator('[data-slot="empty-state-actions"]');
  assert.equal(await actions.evaluate((n) => getComputedStyle(n).flexDirection), "column");
  assert.equal(await actions.evaluate((n) => getComputedStyle(n).gap), "8px");
  assert.ok(Math.abs((await create.boundingBox()).width - (await actions.boundingBox()).width) < 1);
  await create.focus();
  await page.keyboard.press("Enter");
  assert.equal(await empty.count(), 0);
  assert.equal(
    await page.getByTestId("layout-loaded").textContent(),
    "Your first document is ready.",
  );
  assert.equal(await count.textContent(), "Actions: 1");
  const link = page.getByTestId("layout-link");
  assert.equal(await link.getAttribute("target"), "_self");
  assert.equal(await link.evaluate((n) => n === document.activeElement), true);
  await link.focus();
  await page.keyboard.press("Enter");
  assert.equal(new URL(page.url()).hash, "#layout-examples");
  await page.getByTestId("layout-activity").focus();
  await page.keyboard.press("Space");
  assert.equal(await count.textContent(), "Actions: 2");
  await page.getByTestId("layout-reset").click();
  await page.getByTestId("layout-import").click();
  assert.equal(await count.textContent(), "Actions: 3");
  await page.getByTestId("layout-reset").click();
  let lensHandle;
  const originalCard = await card.elementHandle();
  const originalEmpty = await empty.elementHandle();
  for (const variant of ["secondary", "tertiary", "transparent", "glass", "default"]) {
    await page.getByTestId("layout-variant").click();
    assert.equal(await card.getAttribute("data-lenso-variant"), variant);
    if (variant === "glass") {
      assert.equal(await card.getAttribute("data-material"), "glass-medium");
      const lens = card.locator("[data-material-lens]");
      assert.equal(await lens.count(), 1);
      assert.equal(
        await lens.evaluate((n) =>
          getComputedStyle(n).getPropertyValue("--apple-material-profile").trim(),
        ),
        "medium",
      );
      lensHandle = await lens.elementHandle();
      await card.evaluate((n) => n.setAttribute("data-contrast", "increased"));
      await page.waitForFunction(() =>
        document.querySelector('[data-testid="layout-card"]').hasAttribute("data-material-opaque"),
      );
      assert.equal(await lens.evaluate((n) => getComputedStyle(n).display), "none");
      await card.evaluate((n) => n.removeAttribute("data-contrast"));
      await page.waitForFunction(
        () =>
          !document
            .querySelector('[data-testid="layout-card"]')
            .hasAttribute("data-material-opaque"),
      );
      await page.emulateMedia({ forcedColors: "active" });
      await page.waitForFunction(() =>
        document.querySelector('[data-testid="layout-card"]').hasAttribute("data-material-opaque"),
      );
      assert.equal(await lens.evaluate((n) => getComputedStyle(n).display), "none");
      await page.emulateMedia({ forcedColors: "none" });
    } else {
      assert.equal(await card.getAttribute("data-material"), null);
      assert.equal(await card.locator("[data-material-lens]").count(), 0);
      if (lensHandle) {
        assert.equal(await lensHandle.evaluate((n) => n.isConnected), false);
        assert.equal(await lensHandle.evaluate((n) => n.childElementCount), 0);
      }
    }
    assert.equal(await empty.count(), 1);
    assert.equal(await card.evaluate((n, original) => n === original, originalCard), true);
    assert.equal(await empty.evaluate((n, original) => n === original, originalEmpty), true);
  }
  await page.getByTestId("layout-long").click();
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const direction of ["ltr", "rtl"]) {
      if (
        (await page.locator("#layout-examples").evaluate((n) => getComputedStyle(n).direction)) !==
        direction
      )
        await page.getByTestId("layout-rtl").click();
      for (const theme of ["light", "dark"]) {
        if (!(await page.locator(`[data-theme="${theme}"]`).count()))
          await page.getByTestId("theme").click();
        const rect = await card.boundingBox();
        assert.ok(rect.x >= 0 && rect.x + rect.width <= width + 1);
        assert.equal(await card.evaluate((n) => n.scrollWidth <= n.clientWidth), true);
        const bounds = await card.evaluate((n) => {
          const card = n.getBoundingClientRect();
          return [...n.querySelectorAll('[data-slot$="title"],[data-slot$="description"]')].flatMap(
            (part) => {
              const range = document.createRange();
              range.selectNodeContents(part);
              return [...range.getClientRects()]
                .filter((rect) => rect.width)
                .map((rect) => ({
                  left: rect.left,
                  right: rect.right,
                  inside: rect.left >= card.left && rect.right <= card.right,
                }));
            },
          );
        });
        assert.ok(bounds.length > 4 && bounds.every((b) => b.inside), JSON.stringify(bounds));
        await page.locator("#layout-examples").screenshot({
          path: path.resolve(
            import.meta.dirname,
            `../.cache/example/${engine}-layout-${theme}-${direction}-${width}.png`,
          ),
        });
      }
    }
  }
  await page.getByTestId("layout-long").click();
  if (
    (await page.locator("#layout-examples").evaluate((n) => getComputedStyle(n).direction)) !==
    "ltr"
  )
    await page.getByTestId("layout-rtl").click();
  await page.setViewportSize({ width: 390, height: 844 });
  return {
    cardHeadingTag: await title.evaluate((n) => n.localName),
    emptyHeadingTag: await emptyTitle.evaluate((n) => n.localName),
  };
}
