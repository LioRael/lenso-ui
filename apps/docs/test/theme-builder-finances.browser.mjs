import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// Existing examples prove sorting and local ledger changes, but not the native
// cells' explicit font/padding or their alignment with the header slots.
export async function checkFinanceTables(page, base) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/en/theme-builder`);
  await page.getByRole("tab", { name: "Finances", exact: true }).click();
  const finances = page.getByRole("region", { name: "finances local example", exact: true });
  const transactions = finances.getByRole("table", { name: /^Recent transactions/ });
  const categories = finances.getByRole("table", { name: "Expense categories", exact: true });
  for (const mode of ["Light", "Dark"]) {
    await page.getByRole("button", { name: `${mode} theme`, exact: true }).click();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const direction of ["ltr", "rtl"]) {
        await page.evaluate((dir) => (document.documentElement.dir = dir), direction);
        const geometry = await transactions.evaluate((table) => {
          const headers = [...table.tHead.rows[0].cells];
          const rows = [...table.tBodies[0].rows];
          return {
            headerHeight: table.tHead.getBoundingClientRect().height,
            rowHeights: rows.map((row) => row.getBoundingClientRect().height),
            cells: [...rows[0].cells].map((cell, index) => {
              const rect = cell.getBoundingClientRect();
              const heading = headers[index].getBoundingClientRect();
              const style = getComputedStyle(cell);
              const headerStyle = getComputedStyle(headers[index]);
              return {
                aligned: rect.left === heading.left && rect.right === heading.right,
                gutter: style.paddingInlineStart === headerStyle.paddingInlineStart,
                fontSize: style.fontSize,
                fits: cell.scrollWidth <= cell.clientWidth + 1,
              };
            }),
          };
        });
        assert.equal(geometry.headerHeight, 36);
        assert.ok(geometry.rowHeights.every((height) => height === 56));
        assert.ok(geometry.cells.every((cell) => cell.aligned && cell.gutter));
        assert.ok(geometry.cells.every((cell) => cell.fontSize === "13px"));
        assert.ok(geometry.cells.every((cell) => cell.fits));
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
          ),
          `${mode}/${width}/${direction}: only the transaction viewport may overflow`,
        );
        assert.ok(
          await categories
            .locator("tbody tr")
            .evaluateAll((rows) => rows.every((row) => row.getBoundingClientRect().height === 40)),
        );
      }
    }
  }
  await page.evaluate(() => (document.documentElement.dir = "ltr"));
  await page.setViewportSize({ width: 1440, height: 1000 });
  const amount = transactions.getByRole("columnheader", { name: "Amount", exact: true });
  for (const [activation, direction, firstDescription] of [
    ["click", "ascending", "Studio rent"],
    ["Enter", "descending", "Brand identity project"],
    ["Space", "ascending", "Studio rent"],
  ]) {
    if (activation === "click") await amount.click();
    else {
      await amount.focus();
      await page.keyboard.press(activation);
    }
    assert.equal(await amount.getAttribute("aria-sort"), direction);
    assert.equal(await amount.locator("svg").isVisible(), true);
    assert.equal(
      await transactions.locator("tbody tr").first().getByRole("cell").nth(1).innerText(),
      firstDescription,
      `${activation} must toggle the native sort once and reorder the actual rows`,
    );
  }
  const categoryHeader = categories.getByRole("columnheader", { name: "Category", exact: true });
  await categoryHeader.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(
    await categories
      .getByRole("cell")
      .first()
      .evaluate((node) => node === document.activeElement),
    true,
  );
  const rent = categories.getByRole("button", { name: "Filter Rent transactions", exact: true });
  await rent.click();
  assert.equal(await rent.getAttribute("aria-pressed"), "true");
  assert.equal(await transactions.locator("tbody tr").count(), 1);
  await finances.getByRole("button", { name: "View all transactions", exact: true }).click();
  assert.ok((await transactions.locator("tbody tr").count()) > 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const browser = await chromium.launch({ headless: true });
  try {
    await checkFinanceTables(
      await browser.newPage(),
      process.env.DOCS_URL ?? "http://localhost:3000",
    );
    console.log(
      "Finance tables: native sorting/navigation/filter actions and responsive geometry passed.",
    );
  } finally {
    await browser.close();
  }
}
