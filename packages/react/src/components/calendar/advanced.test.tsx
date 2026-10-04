import { useState } from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { I18nProvider } from "react-aria-components/I18nProvider";
import { CalendarDate, getLocalTimeZone, today, type DateValue } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { Calendar } from "./index.js";
import { RangeCalendar } from "../range-calendar/index.js";

function EmptyMultipleCalendar() {
  const [value, setValue] = useState<readonly DateValue[]>([]);
  return (
    <Calendar aria-label="Event dates" selectionMode="multiple" value={value} onChange={setValue}>
      <Calendar.Heading />
      <Calendar.Grid>
        <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
      </Calendar.Grid>
      <output aria-label="Selected count">{value.length}</output>
    </Calendar>
  );
}

// Existing boundary coverage uses single dates, so it cannot catch RAC's empty-array focus clamp.
test("empty multiple selection starts today and keyboard toggles preserve the controlled array", async () => {
  const screen = await render(
    <I18nProvider locale="en-US">
      <EmptyMultipleCalendar />
    </I18nProvider>,
  );
  const now = today(getLocalTimeZone());
  const expectedHeading = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(now.toDate(getLocalTimeZone()));
  await expect.element(screen.getByRole("heading")).toMatchTextContent(expectedHeading);
  const tenth = now.set({ day: 10 });
  const name = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(tenth.toDate(getLocalTimeZone()));
  const first = screen.getByRole("button", { name: new RegExp(name) });
  (first.element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}{ArrowRight}{Enter}");
  await expect
    .element(screen.getByRole("status", { name: "Selected count" }))
    .toHaveTextContent("2");
  await userEvent.keyboard("{Enter}");
  await expect
    .element(screen.getByRole("status", { name: "Selected count" }))
    .toHaveTextContent("1");
});

const override = stylex.create({ button: { backgroundColor: "var(--success)", borderRadius: 6 } });

// Default cap tests do not exercise a consumer override of the contextual inner button.
test("range cell button styles reach the actual cap without replacing its keyboard contract", async () => {
  const change = vi.fn();
  const screen = await render(
    <I18nProvider locale="en-US">
      <RangeCalendar
        aria-label="Trip dates"
        defaultFocusedValue={new CalendarDate(2026, 3, 11)}
        onChange={change}
      >
        <RangeCalendar.Grid>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} buttonXstyle={override.button} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
    </I18nProvider>,
  );
  const start = screen.getByRole("button", { name: /Wednesday, March 11, 2026/ });
  await start.click();
  await userEvent.keyboard("{ArrowRight}{ArrowRight}{Enter}");
  expect(change.mock.lastCall?.[0].start.toString()).toBe("2026-03-11");
  expect(change.mock.lastCall?.[0].end.toString()).toBe("2026-03-13");
  const cap = start.element().querySelector('[data-slot="range-calendar-cell-button"]')!;
  expect(getComputedStyle(cap).borderTopLeftRadius).toBe("6px");
  expect(getComputedStyle(cap).backgroundColor).toBe("oklch(0.7329 0.1935 150.81)");
});

// The earlier year-picker regression is Gregorian/en-US, not a different calendar system.
test("Indian calendar year selection changes the localized model and restores trigger focus", async () => {
  const screen = await render(
    <I18nProvider locale="hi-IN-u-ca-indian">
      <Calendar aria-label="Event date" defaultFocusedValue={new CalendarDate(2026, 9, 30)}>
        <Calendar.Header>
          <Calendar.YearPickerTrigger>
            <Calendar.YearPickerTriggerHeading />
            <Calendar.YearPickerTriggerIndicator />
          </Calendar.YearPickerTrigger>
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
        </Calendar.Grid>
        <Calendar.YearPickerGrid>
          <Calendar.YearPickerGridBody />
        </Calendar.YearPickerGrid>
      </Calendar>
    </I18nProvider>,
  );
  const trigger = screen.getByRole("button", { name: /year selector/ });
  await trigger.click();
  await expect.element(screen.getByRole("button", { name: /^1948/ })).toHaveFocus();
  await userEvent.keyboard("{ArrowRight}{Enter}");
  await expect.element(trigger).toHaveFocus();
  await expect.element(trigger).toMatchTextContent("1949");
});
