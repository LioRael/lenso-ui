import assert from "node:assert/strict";
import path from "node:path";

export async function checkContent(page, engine) {
  const panel = page.getByTestId("content-alert");
  const chip = page.getByTestId("content-chip");
  const badge = page.getByTestId("content-badge");
  const close = page.getByTestId("content-close");
  const count = page.getByTestId("content-count");
  const lens = panel.locator("[data-material-lens]");
  assert.equal(await panel.getAttribute("role"), "status");
  assert.equal(await panel.getAttribute("aria-labelledby"), "content-alert-title");
  assert.equal(await panel.getAttribute("aria-describedby"), "content-alert-description");
  assert.equal(await badge.getAttribute("aria-label"), "3 unread messages");
  assert.equal(await badge.getAttribute("role"), "img");
  assert.equal(await chip.evaluate((n) => getComputedStyle(n).borderRadius), "8px");
  assert.equal(await close.evaluate((n) => getComputedStyle(n).boxSizing), "border-box");
  assert.deepEqual(
    await close.evaluate((n) => ({
      width: n.getBoundingClientRect().width,
      height: n.getBoundingClientRect().height,
    })),
    { width: 24, height: 24 },
  );
  assert.equal(await close.locator("svg").getAttribute("aria-hidden"), "true");
  assert.equal(await chip.locator('[data-slot="chip-label"]').textContent(), "Design");
  assert.equal(await chip.getAttribute("role"), null);
  await close.focus();
  await page.keyboard.press("Enter");
  assert.equal(await count.textContent(), "4");
  await page.keyboard.press("Space");
  assert.equal(await count.textContent(), "5");
  assert.equal(await badge.getAttribute("aria-label"), "5 unread messages");
  await page.getByTestId("content-custom-close").click();
  assert.equal(await count.textContent(), "6");
  await page.getByTestId("content-chip-close").click();
  assert.equal(await count.textContent(), "7");
  await page.getByTestId("content-loading").click();
  await close.focus();
  assert.equal(await close.evaluate((n) => n.disabled), false);
  assert.equal(await close.getAttribute("aria-busy"), "true");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await close.evaluate((n) => n.click());
  const pendingBox = await close.boundingBox();
  await page.mouse.click(pendingBox.x + pendingBox.width / 2, pendingBox.y + pendingBox.height / 2);
  assert.equal(await count.textContent(), "7");
  assert.equal(await close.evaluate((n) => n === document.activeElement), true);
  await page.getByTestId("content-loading").click();
  await page.getByTestId("content-disabled").click();
  assert.equal(await close.isDisabled(), true);
  await close.evaluate((n) => n.click());
  assert.equal(await count.textContent(), "7");
  await page.getByTestId("content-disabled").click();
  await page.getByTestId("content-destructive").click();
  assert.equal(await close.getAttribute("data-lenso-destructive"), "true");
  await page.getByTestId("content-destructive").click();
  for (const [size, height] of [
    ["lg", 28],
    ["sm", 20],
    ["md", 24],
  ]) {
    await page.getByTestId("content-size").click();
    assert.equal(await chip.getAttribute("data-lenso-size"), size);
    assert.equal(
      await chip.evaluate((n) => parseFloat(getComputedStyle(n).fontSize)),
      size === "lg" ? 14 : 12,
    );
    // The composed close control establishes a 24 px content minimum in this example.
    assert.ok((await chip.boundingBox()).height >= height);
  }
  const variants = [];
  for (const variant of ["soft", "primary", "tertiary", "secondary"]) {
    await page.getByTestId("content-variant").click();
    assert.equal(await chip.getAttribute("data-lenso-variant"), variant);
    assert.equal(
      await badge.getAttribute("data-lenso-variant"),
      variant === "tertiary" ? "secondary" : variant,
    );
    variants.push(await chip.evaluate((n) => getComputedStyle(n).backgroundColor));
  }
  assert.equal(variants[2], "rgba(0, 0, 0, 0)");
  for (const color of ["accent", "success", "warning", "danger", "default"]) {
    await page.getByTestId("content-color").click();
    assert.equal(await chip.getAttribute("data-lenso-color"), color);
    assert.equal(await badge.getAttribute("data-lenso-color"), color);
    assert.equal(
      await panel.locator('[data-slot="alert-title"]').getAttribute("data-lenso-color"),
      color,
    );
    const glyph = panel.locator('[data-slot="alert-default-icon"]');
    assert.equal(await glyph.evaluate((n) => getComputedStyle(n).fillRule), "evenodd");
    assert.equal(await glyph.locator("path").count(), 1);
    assert.deepEqual(
      await glyph.evaluate((n) => ({
        width: n.getBoundingClientRect().width,
        height: n.getBoundingClientRect().height,
      })),
      { width: 16, height: 16 },
    );
  }
  for (const placement of ["bottom-right", "bottom-left", "top-left", "top-right"]) {
    await page.getByTestId("content-placement").click();
    assert.equal(await badge.getAttribute("data-placement"), placement);
    const anchor = await page.getByTestId("content-badge-anchor").boundingBox();
    const rect = await badge.boundingBox();
    const x = placement.endsWith("right")
      ? anchor.x + anchor.width - rect.width * 0.75
      : anchor.x - rect.width * 0.25;
    const y = placement.startsWith("top")
      ? anchor.y - rect.height * 0.25
      : anchor.y + anchor.height - rect.height * 0.75;
    assert.ok(
      Math.abs(rect.x - x) < 1 && Math.abs(rect.y - y) < 1,
      `${placement}: ${JSON.stringify({ anchor, rect })}`,
    );
  }
  await panel.evaluate((n) => n.setAttribute("data-contrast", "increased"));
  await page.waitForFunction(() =>
    document.querySelector('[data-testid="content-alert"]').hasAttribute("data-material-opaque"),
  );
  assert.equal(await lens.evaluate((n) => getComputedStyle(n).display), "none");
  await panel.evaluate((n) => n.removeAttribute("data-contrast"));
  await page.waitForFunction(
    () =>
      !document.querySelector('[data-testid="content-alert"]').hasAttribute("data-material-opaque"),
  );
  await page.emulateMedia({ forcedColors: "active" });
  await page.waitForFunction(() =>
    document.querySelector('[data-testid="content-badge"]').hasAttribute("data-material-opaque"),
  );
  assert.equal(
    await badge.locator("[data-material-lens]").evaluate((n) => getComputedStyle(n).display),
    "none",
  );
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
  assert.equal(await close.evaluate((n) => getComputedStyle(n).transitionDuration), "0s");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const oldLens = await lens.elementHandle();
  await page.getByTestId("content-alert-close").click();
  assert.equal(await panel.count(), 0);
  assert.equal(await badge.count(), 0);
  assert.equal(await oldLens.evaluate((n) => n.isConnected), false);
  assert.equal(await oldLens.evaluate((n) => n.childElementCount), 0);
  await page.getByTestId("content-visible").click();
  assert.equal(await panel.count(), 1);
  assert.equal(await badge.count(), 1);
  await page.getByTestId("content-long").click();
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const theme of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").click();
      const rect = await panel.boundingBox();
      const control = await page.getByTestId("content-alert-close").boundingBox();
      assert.ok(rect.x >= 0 && rect.x + rect.width <= width + 1);
      assert.ok(control.x + control.width <= rect.x + rect.width + 1);
      const wrapping = await panel.evaluate((n) => {
        const content = n.querySelector('[data-slot="alert-content"]');
        const description = n.querySelector('[data-slot="alert-description"]');
        const box = content.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(description);
        return {
          withinContent: [...range.getClientRects()].every(
            (rect) => rect.left >= box.left - 0.1 && rect.right <= box.right + 0.1,
          ),
          lineCount: range.getClientRects().length,
          scrollWidth: n.scrollWidth,
          clientWidth: n.clientWidth,
        };
      });
      assert.equal(wrapping.withinContent, true, JSON.stringify(wrapping));
      assert.ok(wrapping.lineCount > 1, "unbroken message must wrap");
      // The optical rim deliberately extends 1 px; text is checked independently above.
      assert.ok(wrapping.scrollWidth <= wrapping.clientWidth + 1, JSON.stringify(wrapping));
      await page.locator("#content-examples").screenshot({
        path: path.resolve(
          import.meta.dirname,
          `../.cache/example/${engine}-content-${theme}-${width}.png`,
        ),
      });
    }
  }
  await page.getByTestId("content-long").click();
  await page.setViewportSize({ width: 390, height: 844 });
}
