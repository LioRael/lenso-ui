import assert from "node:assert/strict";
import type { Page } from "playwright";
export async function verifyAdapterParity(page: Page, closeLabel: string) {
  await page.getByText("File options", { exact: true }).click({ button: "right" });
  await page.getByRole("menuitem", { name: "Quick action" }).waitFor();
  await page.getByRole("menuitem", { name: "More actions" }).click();
  const check = page.getByRole("menuitemcheckbox", { name: "Show details" });
  await check.press("Space");
  assert.equal(await check.getAttribute("aria-checked"), "true");
  await page.getByRole("menuitem", { name: "Move file" }).press("ArrowRight");
  await page.getByRole("menuitem", { name: "Archive file" }).waitFor();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  const localState = page.getByLabel("Local state");
  await localState.getByText("true/false/1").waitFor();
  await page.getByRole("button", { name: "Update local state" }).click();
  await localState.getByText("true/true/2").waitFor();
  const monthSegment = page
    .getByRole("group", { name: "Segmented date" })
    .getByRole("spinbutton", { name: "month", exact: true });
  await monthSegment.press("ArrowUp");
  await page.waitForFunction(() =>
    /6|Jun/i.test(
      document.querySelector<HTMLInputElement>('[aria-label="Picker text"]')?.value ?? "",
    ),
  );
  const windowed = page.getByRole("table", { name: "Windowed records" });
  const first = windowed.getByRole("cell", { name: "Record 1", exact: true });
  await first.waitFor();
  assert.ok((await windowed.getByRole("row").count()) < 15);
  await first.press("Control+a");
  await page.getByLabel("Window selection").getByText("99").waitFor();
  await first.press("Control+End");
  const last = windowed.getByRole("cell", { name: "Record 100", exact: true });
  await last.waitFor();
  await page.waitForFunction(() => document.activeElement?.textContent === "Record 100");
  await last.press("ArrowUp");
  await page.waitForFunction(() => document.activeElement?.textContent === "Record 98");
  assert.equal(await windowed.getAttribute("aria-rowcount"), "101");

  const tree = page.getByRole("treegrid", { name: "Folders" });
  const parent = tree.getByRole("gridcell", { name: /Parent row/ });
  const child = tree.getByRole("gridcell", { name: "Child row" });
  await parent.press("ArrowRight");
  await child.waitFor();
  assert.equal(await tree.getByRole("row", { name: "Child row" }).getAttribute("aria-level"), "2");
  await parent.press("ArrowRight");
  await page.waitForFunction(() => document.activeElement?.textContent === "Child row");
  await child.press("ArrowLeft");
  assert.equal(await parent.evaluate((node) => document.activeElement === node), true);
  await parent.press("ArrowLeft");
  await child.waitFor({ state: "detached" });
  await tree.getByRole("button", { name: "Drag parent" }).press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.getByLabel("Last drop").getByText("parent before peer").waitFor();
  await tree.evaluate((element) => {
    const rows = [...element.querySelectorAll<HTMLTableRowElement>("tbody tr")];
    const source = rows.find((row) => row.textContent?.includes("Parent row"))!;
    const target = rows.find((row) => row.textContent === "Peer row")!;
    const dataTransfer = new DataTransfer();
    source.dispatchEvent(
      new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer }),
    );
    const clientY = target.getBoundingClientRect().bottom - 1;
    target.dispatchEvent(
      new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer, clientY }),
    );
    source.dispatchEvent(new DragEvent("dragend", { bubbles: true, dataTransfer }));
  });
  await page.getByLabel("Last drop").getByText("parent after peer").waitFor();

  const tags = page.getByRole("grid", { name: "Topics" });
  const alpha = tags.getByRole("row", { name: "Alpha" });
  const beta = tags.getByRole("row", { name: "Beta" });
  await alpha.press("ArrowRight");
  await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Beta");
  await page.evaluate(async () => {
    const agent = (
      window as Window & {
        agent?: {
          act(input: {
            steps: { ref: string; action: string; args: unknown[] }[];
          }): Promise<unknown>;
        };
      }
    ).agent!;
    await agent.act({ steps: [{ ref: "Topics", action: "setValue", args: [["string:alpha"]] }] });
  });
  assert.equal(await alpha.getAttribute("aria-selected"), "true");
  await beta.press("Space");
  assert.equal(await beta.getAttribute("aria-selected"), "true");
  await beta.press("Delete");
  assert.equal(await beta.count(), 1);
  await page.getByRole("button", { name: "Allow tag removal" }).click();
  await beta.press("Delete");
  await beta.waitFor({ state: "detached" });
  await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Gamma");

  const grid = page.locator('[data-lenso-slot="calendar-grid"]');
  const headers = await grid
    .getByRole("columnheader")
    .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().x));
  assert.equal(new Set(headers).size, 7);
  const day = grid.locator('[data-value="2025-05-12"]');
  const initialFill = await day.evaluate((node) => getComputedStyle(node).backgroundColor);
  await day.press("Enter");
  assert.equal(await day.getAttribute("aria-selected"), "true");
  assert.notEqual(
    await day.evaluate((node) => getComputedStyle(node).backgroundColor),
    initialFill,
  );
  const trigger = page.getByRole("button", { name: "May 2025, year selector" });
  await trigger.click();
  const years = page.getByRole("group", { name: "Years" });
  await years.waitFor();
  await page.waitForFunction(() => document.activeElement?.getAttribute("data-year") === "2025");
  await page.keyboard.press("ArrowLeft");
  await page.waitForFunction(() => document.activeElement?.getAttribute("data-year") === "2024");
  await page.keyboard.press("Enter");
  await page.getByLabel("Calendar month").getByText("2025-05").waitFor();
  assert.equal(await trigger.getAttribute("aria-expanded"), "true");
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => document.activeElement?.getAttribute("aria-label") === "May 2025, year selector",
  );
  await page.getByRole("button", { name: "Allow 2024" }).click();
  await trigger.click();
  await years.getByRole("button", { name: "2024" }).click();
  await page.getByLabel("Calendar month").getByText("2024-05").waitFor();
  await years.waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Show pill" }).click();
  const pill = page.locator('[data-lenso-slot="toast"][data-variant="pill"]');
  await pill.getByText("Sending").waitFor();
  const close = pill.getByRole("button", { name: closeLabel });
  const originalClose = await close.elementHandle();
  const width = await pill.evaluate((node) =>
    parseFloat(node.style.getPropertyValue("--toast-pill-width")),
  );
  assert.ok(width > 0);
  await page.getByRole("button", { name: "Update pill" }).click();
  await pill.getByText("The report was sent to all recipients").waitFor();
  await pill.getByRole("button", { name: "View" }).waitFor();
  await page.waitForFunction(
    ({ previous }) => {
      const pill = document.querySelector<HTMLElement>(
        '[data-lenso-slot="toast"][data-variant="pill"]',
      );
      return pill && parseFloat(pill.style.getPropertyValue("--toast-pill-width")) > previous;
    },
    { previous: width },
  );
  assert.equal(await close.evaluate((node, original) => node === original, originalClose), true);
  await originalClose?.dispose();
  await close.click();
  await pill.waitFor({ state: "hidden" });
}
