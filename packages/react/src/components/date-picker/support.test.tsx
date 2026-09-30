import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { parseDate } from "@internationalized/date";
import { DatePicker } from "./index.js";
import { DateField } from "../date-field/index.js";
import { DateRangePicker } from "../date-range-picker/index.js";

// The existing overlay proof uses DatePicker.Suffix; source demos use the passive DateField.Suffix.
test("source suffix composition keeps the picker trigger pointer-clickable", async () => {
  const screen = await render(
    <DatePicker defaultValue={parseDate("2026-03-11")}>
      <DatePicker.Label>Event date</DatePicker.Label>
      <DateField.Group>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger aria-label="Choose date">
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <DatePicker.Dialog>Calendar content</DatePicker.Dialog>
      </DatePicker.Popover>
    </DatePicker>,
  );
  const trigger = screen.getByRole("button", { name: "Choose date" });
  expect(getComputedStyle(trigger.element()).pointerEvents).toBe("auto");
  (trigger.element() as HTMLElement).focus();
  await trigger.click();
  await expect.element(screen.getByRole("dialog")).toBeVisible();
});

// No existing test exercises the self-closing source RangeSeparator API.
test("range separators provide the source default while preserving explicit content", async () => {
  const screen = await render(
    <div>
      <DateRangePicker.RangeSeparator data-testid="default" />
      <DateRangePicker.RangeSeparator data-testid="custom"> to </DateRangePicker.RangeSeparator>
      <DateRangePicker.RangeSeparator data-testid="empty">{null}</DateRangePicker.RangeSeparator>
    </div>,
  );
  const separator = screen.getByTestId("default").element();
  expect(separator.textContent).toBe(" - ");
  expect(separator.getAttribute("aria-hidden")).toBe("true");
  expect(separator.getBoundingClientRect().width).toBeGreaterThan(8);
  expect(screen.getByTestId("custom").element().textContent).toBe(" to ");
  expect(screen.getByTestId("empty").element().textContent).toBe("");
});
