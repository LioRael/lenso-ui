import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { Select, type SelectPosition } from "./index.js";

const options = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
];

function Example({
  defaultOpen = false,
  position,
}: {
  defaultOpen?: boolean;
  position: SelectPosition;
}) {
  return (
    <Select.Root defaultOpen={defaultOpen} defaultValue="tuesday" items={options}>
      <Select.Trigger aria-label="Day" data-testid={`${position}-trigger`}>
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner data-testid={`${position}-positioner`} position={position}>
          <Select.Popup data-testid={`${position}-popup`}>
            <Select.List>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

const stageStyle = {
  minHeight: "520px",
  padding: "180px 220px",
} as const;

test("item-aligned mode anchors the selected option to the trigger", async () => {
  const screen = await render(
    <>
      <style>
        {'button[data-slot="select-trigger"] { font-family: "IBM Plex Sans", sans-serif; }'}
      </style>
      <ThemeScope style={stageStyle} theme="light">
        <Example position="item-aligned" />
      </ThemeScope>
    </>,
  );

  const trigger = screen.getByTestId("item-aligned-trigger");
  await trigger.click();
  const popup = screen.getByTestId("item-aligned-popup");
  await expect.element(popup).toBeVisible();

  const positioner = screen.getByTestId("item-aligned-positioner").element();
  const selectedItem = popup.element().querySelector<HTMLElement>("[data-selected]");
  expect(positioner.dataset.position).toBe("item-aligned");
  expect(selectedItem).not.toBeNull();

  const triggerRect = trigger.element().getBoundingClientRect();
  const popupRect = popup.element().getBoundingClientRect();
  const selectedRect = selectedItem!.getBoundingClientRect();
  expect(triggerRect.height).toBe(32);
  expect(popupRect.width).toBeCloseTo(180, 0);
  expect(selectedRect.height).toBeCloseTo(32, 0);
  expect(getComputedStyle(selectedItem!).backgroundColor).toBe("rgba(0, 0, 0, 0)");

  const value = trigger.element().querySelector<HTMLElement>('[data-slot="select-value"]')!;
  const itemText = selectedItem!.firstElementChild as HTMLElement;
  const valueStyle = getComputedStyle(value);
  const itemTextStyle = getComputedStyle(itemText);
  expect(itemTextStyle.fontFamily).toBe(valueStyle.fontFamily);
  expect(itemTextStyle.fontSize).toBe(valueStyle.fontSize);
  expect(itemTextStyle.fontWeight).toBe(valueStyle.fontWeight);
  expect(itemTextStyle.lineHeight).toBe(valueStyle.lineHeight);

  await expect
    .poll(() => {
      const triggerRect = trigger.element().getBoundingClientRect();
      const itemRect = selectedItem!.getBoundingClientRect();
      return Math.abs(triggerRect.top - itemRect.top);
    })
    .toBeLessThanOrEqual(1);

  const accessibility = await axe.run(document.body, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
  });
  expect(accessibility.violations).toEqual([]);
});

test("popper mode preserves the five pixel trigger gap", async () => {
  const screen = await render(
    <ThemeScope style={stageStyle} theme="light">
      <Example position="popper" />
    </ThemeScope>,
  );

  const trigger = screen.getByTestId("popper-trigger");
  await trigger.click();
  const popup = screen.getByTestId("popper-popup");
  await expect.element(popup).toBeVisible();

  const gap =
    popup.element().getBoundingClientRect().top - trigger.element().getBoundingClientRect().bottom;
  expect(gap).toBeGreaterThanOrEqual(4.5);
  expect(gap).toBeLessThanOrEqual(5.5);
});

test("selection updates the trigger and closes the popup", async () => {
  const screen = await render(
    <ThemeScope style={stageStyle} theme="light">
      <Example position="item-aligned" />
    </ThemeScope>,
  );

  const trigger = screen.getByTestId("item-aligned-trigger");
  await trigger.click();
  await screen.getByText("Thursday", { exact: true }).click();
  await expect.element(trigger).toHaveTextContent("Thursday");
  await expect.element(screen.getByTestId("item-aligned-popup")).not.toBeVisible();
});

test("item-aligned mode moves the popup with the current selection", async () => {
  const screen = await render(
    <ThemeScope style={stageStyle} theme="light">
      <Example position="item-aligned" />
    </ThemeScope>,
  );

  const trigger = screen.getByTestId("item-aligned-trigger");
  const popup = screen.getByTestId("item-aligned-popup");
  await trigger.click();
  await expect.element(popup).toBeVisible();
  const initialPopupTop = popup.element().getBoundingClientRect().top;

  await screen.getByText("Thursday", { exact: true }).click();
  await trigger.click();
  await expect.element(popup).toBeVisible();

  await expect
    .poll(() => initialPopupTop - popup.element().getBoundingClientRect().top)
    .toBeCloseTo(64, 0);
  const selectedItem = popup.element().querySelector<HTMLElement>("[data-selected]")!;
  expect(
    Math.abs(
      trigger.element().getBoundingClientRect().top - selectedItem.getBoundingClientRect().top,
    ),
  ).toBeLessThanOrEqual(1);
});

for (const theme of ["light", "dark"] as const) {
  test(`Select item-aligned ${theme} visual`, async () => {
    const screen = await render(
      <ThemeScope style={stageStyle} theme={theme}>
        <Example position="item-aligned" />
      </ThemeScope>,
    );

    await screen.getByTestId("item-aligned-trigger").click();
    const popup = screen.getByTestId("item-aligned-popup");
    await expect.element(popup).toBeVisible();
    expect(screen.getByTestId("item-aligned-positioner").element().dataset.position).toBe(
      "item-aligned",
    );
    await expect.element(document.body).toMatchScreenshot(`select-item-aligned-${theme}`, {
      comparatorName: "pixelmatch",
      comparatorOptions: { allowedMismatchedPixelRatio: 0.04 },
    });
  });
}
