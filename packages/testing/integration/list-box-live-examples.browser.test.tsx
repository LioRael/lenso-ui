import { test, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { ListBox } from "@lenso/ui";
import { ListBoxItem } from "@lenso/ui";

// Mount coverage does not check the required owned roles or navigation across section dividers.
test.each([false, true])(
  "action sections keep a decorative divider out of the accessible collection (disabled: %s)",
  async (disabled) => {
    const { Actions } = await import("../../../apps/docs/src/demos/en/list-box/actions");
    const axe = (await import("axe-core")).default;
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    const screen = await render(
      <main>
        <Actions disabled={disabled} />
      </main>,
    );
    const list = screen.getByRole("listbox").element();
    expect(
      (await axe.run(list, { runOnly: ["aria-required-children", "aria-allowed-attr"] }))
        .violations,
    ).toEqual([]);
    const divider = list.querySelector<HTMLElement>('[data-slot="separator"]')!;
    expect(divider.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(divider.tabIndex).toBe(-1);
    const options = screen.getByRole("option").elements();
    options[0]!.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(options[disabled ? 0 : 2]);
    await userEvent.keyboard("{Enter}");
    expect(alert).toHaveBeenCalledWith(`Selected item: ${disabled ? "new-file" : "delete-file"}`);
    alert.mockRestore();
  },
);

// Imported reference text did not prove these modules could mount as interactive examples.
const examples = [
  [
    "list-box/default",
    () => import("../../../apps/docs/src/demos/en/list-box/default").then((m) => m.Default),
  ],
  [
    "list-box/controlled",
    () => import("../../../apps/docs/src/demos/en/list-box/controlled").then((m) => m.Controlled),
  ],
  [
    "list-box/custom-check-icon",
    () =>
      import("../../../apps/docs/src/demos/en/list-box/custom-check-icon").then(
        (m) => m.CustomCheckIcon,
      ),
  ],
  [
    "list-box/custom-styles",
    () =>
      import("../../../apps/docs/src/demos/en/list-box/custom-styles").then((m) => m.CustomStyles),
  ],
  [
    "list-box/multi-select",
    () =>
      import("../../../apps/docs/src/demos/en/list-box/multi-select").then((m) => m.MultiSelect),
  ],
  [
    "list-box/release-scrollbar-modes",
    () =>
      import("../../../apps/docs/src/demos/en/list-box/release-scrollbar-modes").then(
        (m) => m.ScrollbarModes,
      ),
  ],
  [
    "list-box/render-function",
    () =>
      import("../../../apps/docs/src/demos/en/list-box/render-function").then(
        (m) => m.RenderFunction,
      ),
  ],
  [
    "list-box/virtualization",
    () =>
      import("../../../apps/docs/src/demos/en/list-box/virtualization").then(
        (m) => m.Virtualization,
      ),
  ],
  [
    "list-box/with-disabled-items",
    () =>
      import("../../../apps/docs/src/demos/en/list-box/with-disabled-items").then(
        (m) => m.WithDisabledItems,
      ),
  ],
  [
    "list-box/with-sections",
    () =>
      import("../../../apps/docs/src/demos/en/list-box/with-sections").then((m) => m.WithSections),
  ],
  [
    "tag-group/basic",
    () => import("../../../apps/docs/src/demos/en/tag-group/basic").then((m) => m.TagGroupBasic),
  ],
  [
    "tag-group/controlled",
    () =>
      import("../../../apps/docs/src/demos/en/tag-group/controlled").then(
        (m) => m.TagGroupControlled,
      ),
  ],
  [
    "tag-group/custom-styles",
    () =>
      import("../../../apps/docs/src/demos/en/tag-group/custom-styles").then((m) => m.CustomStyles),
  ],
  [
    "tag-group/disabled",
    () =>
      import("../../../apps/docs/src/demos/en/tag-group/disabled").then((m) => m.TagGroupDisabled),
  ],
  [
    "tag-group/render-function",
    () =>
      import("../../../apps/docs/src/demos/en/tag-group/render-function").then(
        (m) => m.RenderFunction,
      ),
  ],
  [
    "tag-group/selection-modes",
    () =>
      import("../../../apps/docs/src/demos/en/tag-group/selection-modes").then(
        (m) => m.TagGroupSelectionModes,
      ),
  ],
  [
    "tag-group/sizes",
    () => import("../../../apps/docs/src/demos/en/tag-group/sizes").then((m) => m.TagGroupSizes),
  ],
  [
    "tag-group/variants",
    () =>
      import("../../../apps/docs/src/demos/en/tag-group/variants").then((m) => m.TagGroupVariants),
  ],
  [
    "tag-group/with-error-message",
    () =>
      import("../../../apps/docs/src/demos/en/tag-group/with-error-message").then(
        (m) => m.TagGroupWithErrorMessage,
      ),
  ],
  [
    "tag-group/with-list-data",
    () =>
      import("../../../apps/docs/src/demos/en/tag-group/with-list-data").then(
        (m) => m.TagGroupWithListData,
      ),
  ],
  [
    "tag-group/with-prefix",
    () =>
      import("../../../apps/docs/src/demos/en/tag-group/with-prefix").then(
        (m) => m.TagGroupWithPrefix,
      ),
  ],
  [
    "tag-group/with-remove-button",
    () =>
      import("../../../apps/docs/src/demos/en/tag-group/with-remove-button").then(
        (m) => m.TagGroupWithRemoveButton,
      ),
  ],
  ["table/basic", () => import("../../../apps/docs/src/demos/en/table/basic").then((m) => m.Basic)],
  [
    "table/async-loading",
    () => import("../../../apps/docs/src/demos/en/table/async-loading").then((m) => m.AsyncLoading),
  ],
  [
    "table/column-resizing",
    () =>
      import("../../../apps/docs/src/demos/en/table/column-resizing").then((m) => m.ColumnResizing),
  ],
  [
    "table/custom-cells",
    () => import("../../../apps/docs/src/demos/en/table/custom-cells").then((m) => m.CustomCells),
  ],
  [
    "table/custom-styles",
    () => import("../../../apps/docs/src/demos/en/table/custom-styles").then((m) => m.CustomStyles),
  ],
  [
    "table/empty-state",
    () => import("../../../apps/docs/src/demos/en/table/empty-state").then((m) => m.EmptyStateDemo),
  ],
  [
    "table/expandable-rows",
    () =>
      import("../../../apps/docs/src/demos/en/table/expandable-rows").then((m) => m.ExpandableRows),
  ],
  [
    "table/pagination",
    () => import("../../../apps/docs/src/demos/en/table/pagination").then((m) => m.PaginationDemo),
  ],
  [
    "table/secondary-variant",
    () =>
      import("../../../apps/docs/src/demos/en/table/secondary-variant").then(
        (m) => m.SecondaryVariant,
      ),
  ],
  [
    "table/selection",
    () => import("../../../apps/docs/src/demos/en/table/selection").then((m) => m.SelectionDemo),
  ],
  [
    "table/sorting",
    () => import("../../../apps/docs/src/demos/en/table/sorting").then((m) => m.Sorting),
  ],
  [
    "table/tanstack-table",
    () =>
      import("../../../apps/docs/src/demos/en/table/tanstack-table").then((m) => m.TanstackTable),
  ],
  [
    "table/virtualization",
    () =>
      import("../../../apps/docs/src/demos/en/table/virtualization").then((m) => m.Virtualization),
  ],
] as const;
for (const [name, load] of examples) {
  test(`pinned example ${name} mounts a native collection`, async () => {
    const Example = await load();
    const screen = await render(<Example />);
    expect(screen.container.querySelector('[role="listbox"],[role="grid"],table')).not.toBeNull();
  });
}

// Mounted-only registries cannot select or focus the last offscreen item.
test("virtual list scrolling and End focus reach row 1000 without mounting all rows", async () => {
  const { Virtualization } =
    await import("../../../apps/docs/src/demos/en/list-box/virtualization");
  await render(<Virtualization />);
  const list = page.getByRole("listbox").element() as HTMLElement;
  expect(list.querySelectorAll('[role="option"]').length).toBeLessThan(20);
  expect(list.querySelector('[role="option"]')?.getAttribute("aria-setsize")).toBe("1000");
  list.scrollTop = 20000;
  list.dispatchEvent(new Event("scroll", { bubbles: true }));
  await expect.poll(() => list.querySelector('[data-window-index="400"]')).not.toBeNull();
  const option = list.querySelector<HTMLElement>('[data-window-index="400"] [role="option"]')!;
  option.focus();
  await userEvent.keyboard("{End}");
  await expect
    .poll(
      () =>
        document.activeElement?.closest<HTMLElement>("[data-window-index]")?.dataset["windowIndex"],
    )
    .toBe("999");
  expect(list.querySelectorAll('[role="option"]').length).toBeLessThan(20);
});

// The baseline navigation tests did not cover range shrink or the platform select-all chord.
test("range selection skips disabled options and select-all includes enabled options", async () => {
  await render(
    <ListBox aria-label="Range" selectionMode="multiple" disabledKeys={new Set(["b"])}>
      {["a", "b", "c", "d"].map((key) => (
        <ListBoxItem key={key} itemKey={key} textValue={key}>
          {key}
        </ListBoxItem>
      ))}
    </ListBox>,
  );
  await page.getByRole("option", { name: "a" }).click();
  await userEvent.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
  await expect
    .element(page.getByRole("option", { name: "d" }))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(page.getByRole("option", { name: "b" }))
    .toHaveAttribute("aria-selected", "false");
  await userEvent.keyboard("{Control>}a{/Control}");
  await expect
    .element(page.getByRole("option", { name: "c" }))
    .toHaveAttribute("aria-selected", "true");
});

test("pinned tree example exposes nested rows only while each ancestor is expanded", async () => {
  const { ExpandableRows } = await import("../../../apps/docs/src/demos/en/table/expandable-rows");
  await render(<ExpandableRows />);
  await page.getByRole("button", { name: "Toggle Project" }).click();
  await expect.element(page.getByRole("gridcell", { name: "Weekly Report" })).toBeVisible();
  const cell = page.getByRole("gridcell", { name: "Weekly Report" }).element();
  expect(getComputedStyle(cell).paddingInlineStart).toBe("56px");
  await page.getByRole("button", { name: "Toggle Documents" }).click();
  await expect
    .element(page.getByRole("gridcell", { name: "Weekly Report" }))
    .not.toBeInTheDocument();
  await page.getByRole("button", { name: "Toggle Documents" }).click();
  await expect.element(page.getByRole("gridcell", { name: "Weekly Report" })).toBeVisible();
});

test("tree-column keyboard expansion and parent navigation follow RTL", async () => {
  const { ExpandableRows } = await import("../../../apps/docs/src/demos/en/table/expandable-rows");
  await render(
    <div dir="rtl">
      <ExpandableRows />
    </div>,
  );
  const project = page.getByRole("gridcell", { name: /Project/ });
  project.element().focus();
  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(page.getByRole("gridcell", { name: "Weekly Report" })).toBeVisible();
  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(page.getByRole("gridcell", { name: "Weekly Report" })).toHaveFocus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(project).toHaveFocus();
  await userEvent.keyboard("{ArrowRight}");
  await expect
    .element(page.getByRole("gridcell", { name: "Weekly Report" }))
    .not.toBeInTheDocument();
});

test("pinned table virtualization scrolls and navigates to the last native row", async () => {
  const { Virtualization } = await import("../../../apps/docs/src/demos/en/table/virtualization");
  await render(<Virtualization />);
  const table = page.getByRole("table").element() as HTMLTableElement;
  const viewport = table.parentElement!;
  expect(table.getAttribute("aria-rowcount")).toBe("1001");
  expect(table.tBodies[0]!.querySelectorAll('[data-slot="table-row"]').length).toBeLessThan(20);
  viewport.scrollTop = 21000;
  viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
  await expect.poll(() => table.querySelector('[data-window-index="500"]')).not.toBeNull();
  table.querySelector<HTMLElement>('[data-window-index="500"] td')!.focus();
  await userEvent.keyboard("{Control>}{End}{/Control}");
  await expect
    .poll(
      () =>
        document.activeElement?.closest<HTMLElement>("[data-window-index]")?.dataset["windowIndex"],
    )
    .toBe("999");
});

test("pinned TanStack example actually sorts and paginates its v9 row model", async () => {
  const { TanstackTable } = await import("../../../apps/docs/src/demos/en/table/tanstack-table");
  await render(<TanstackTable />);
  await page.getByRole("columnheader", { name: "Name" }).click();
  await expect.element(page.getByRole("cell", { name: "Davis Wilson" })).toBeVisible();
  await page.getByRole("link", { name: "Next page" }).click();
  await expect.element(page.getByRole("cell", { name: "Olivia Martinez" })).toBeVisible();
});

test("virtual select-all addresses the logical collection, not only the visible window", async () => {
  const changed = vi.fn();
  const items = Array.from({ length: 1000 }, (_, index) => ({
    key: index,
    textValue: `Item ${index}`,
  }));
  await render(
    <ListBox
      aria-label="Virtual selection"
      items={items}
      selectionMode="multiple"
      onSelectionChange={changed}
      disabledKeys={new Set([500])}
      virtualized={{ height: 200, rowHeight: 40 }}
    >
      {(item) => (
        <ListBoxItem itemKey={item.key} textValue={item.textValue}>
          {item.textValue}
        </ListBoxItem>
      )}
    </ListBox>,
  );
  page.getByRole("option", { name: "Item 0", exact: true }).element().focus();
  await userEvent.keyboard("{Control>}a{/Control}");
  expect(changed.mock.lastCall?.[0].size).toBe(999);
  expect(changed.mock.lastCall?.[0].has(999)).toBe(true);
  expect(changed.mock.lastCall?.[0].has(500)).toBe(false);
});

test("the source checkmark persists and transitions between its exact dash offsets", async () => {
  await render(
    <ListBox aria-label="Checkmark" selectionMode="single">
      <ListBoxItem itemKey="a" textValue="Alpha">
        Alpha
        <ListBoxItem.Indicator />
      </ListBoxItem>
    </ListBox>,
  );
  const option = page.getByRole("option", { name: "Alpha" });
  const svg = option.element().querySelector("svg")!;
  expect(svg.getAttribute("stroke-dashoffset")).toBe("66");
  await option.click();
  expect(option.element().querySelector("svg")).toBe(svg);
  await expect.poll(() => getComputedStyle(svg).strokeDashoffset).toBe("44px");
  expect(getComputedStyle(svg).transitionDuration).toBe(
    matchMedia("(prefers-reduced-motion: reduce)").matches ? "0s" : "0.25s",
  );
  expect(getComputedStyle(svg).transitionTimingFunction).toBe("linear");
});

test("pinned removable team data prunes selection and restores next-row focus", async () => {
  const { TagGroupWithListData } =
    await import("../../../apps/docs/src/demos/en/tag-group/with-list-data");
  await render(<TagGroupWithListData />);
  await page.getByRole("button", { name: "Remove Fred" }).click();
  await expect.element(page.getByRole("row", { name: /Michael/ })).toHaveFocus();
  await expect.element(page.getByRole("row", { name: /Fred/ })).not.toBeInTheDocument();
  for (const name of ["Michael", "Jane", "Alice", "Bob", "Charlie"])
    await page.getByRole("button", { name: `Remove ${name}` }).click();
  await expect.element(page.getByRole("grid", { name: "Team Members" })).toHaveFocus();
});

test("the pinned async table loads all three source pages from real scroll intersections", async () => {
  const { AsyncLoading } = await import("../../../apps/docs/src/demos/en/table/async-loading");
  await render(<AsyncLoading />);
  const table = page.getByRole("table").element();
  const viewport = table.parentElement!;
  const count = () => table.querySelectorAll('[data-slot="table-row"]').length;
  expect(count()).toBe(6);
  viewport.scrollTop = viewport.scrollHeight;
  await expect.poll(count, { timeout: 3000 }).toBe(12);
  viewport.scrollTop = viewport.scrollHeight;
  await expect.poll(count, { timeout: 3000 }).toBe(18);
  expect(table.querySelector('[data-slot="table-load-more"]')).toBeNull();
});
