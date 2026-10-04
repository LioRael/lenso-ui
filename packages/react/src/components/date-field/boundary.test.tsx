import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { I18nProvider } from "react-aria-components/I18nProvider";
import { CalendarDate, Time } from "@internationalized/date";
import "@lenso/tokens/styles.css";
import { DateField } from "./index.js";
import { TimeField } from "../time-field/index.js";
import { RangeCalendar } from "../range-calendar/index.js";
import { Calendar } from "../calendar/index.js";
import { ColorSlider } from "../color-slider/index.js";
import { DatePicker } from "../date-picker/index.js";
import { DateRangePicker } from "../date-range-picker/index.js";
import { ThemeScope } from "../../utils/theme-scope.js";
import { ColorField } from "../color-field/index.js";

test("localized date segments retain label context, order and arrow-key editing", async () => {
  const change = vi.fn();
  const screen = await render(
    <I18nProvider locale="en-GB">
      <DateField defaultValue={new CalendarDate(2026, 3, 14)} onChange={change}>
        <DateField.Label>Departure</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
    </I18nProvider>,
  );
  const day = screen.getByRole("spinbutton", { name: /day/i });
  const month = screen.getByRole("spinbutton", { name: /month/i });
  await expect.element(day).toHaveAttribute("aria-valuenow", "14");
  expect(
    day.element().compareDocumentPosition(month.element()) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(day.element().getAttribute("aria-labelledby")).toBeTruthy();
  await day.click();
  await userEvent.keyboard("{ArrowUp}");
  await expect.element(day).toHaveAttribute("aria-valuenow", "15");
  expect(change.mock.lastCall?.[0].toString()).toBe("2026-03-15");
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(month).toHaveFocus();
  const group = day.element().closest('[role="group"]')!;
  const field = group.getBoundingClientRect();
  const segment = month.element().getBoundingClientRect();
  expect(segment.left).toBeGreaterThanOrEqual(field.left);
  expect(segment.right).toBeLessThanOrEqual(field.right);
});

test("time field uses the same RAC segments without losing its time context", async () => {
  const screen = await render(
    <I18nProvider locale="en-GB">
      <TimeField defaultValue={new Time(13, 30)} hourCycle={24}>
        <TimeField.Label>Appointment</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
      </TimeField>
    </I18nProvider>,
  );
  const minute = screen.getByRole("spinbutton", { name: /minute/i });
  await minute.click();
  await userEvent.keyboard("{ArrowUp}");
  await expect.element(minute).toHaveAttribute("aria-valuenow", "31");
});

test("date and time labels inherit shared required, invalid and disabled feedback", async () => {
  const screen = await render(
    <div data-theme="light">
      <DateField isRequired isInvalid>
        <DateField.Label data-testid="date-label">Departure</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <TimeField isRequired isDisabled>
        <TimeField.Label data-testid="time-label">Appointment</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
      </TimeField>
    </div>,
  );
  const dateLabel = screen.getByTestId("date-label").element();
  const timeLabel = screen.getByTestId("time-label").element();
  expect(getComputedStyle(dateLabel).fontWeight).toBe("500");
  expect(getComputedStyle(dateLabel, "::after").content).toContain("*");
  expect(getComputedStyle(dateLabel).color).not.toBe(getComputedStyle(timeLabel).color);
  expect(Number(getComputedStyle(timeLabel).opacity)).toBeLessThan(1);
  expect(
    screen.getByRole("spinbutton", { name: /day/i }).element().getAttribute("aria-labelledby"),
  ).toContain(dateLabel.id);
});

test.each(["light", "dark"])(
  "picker aliases and color labels follow required and validation changes in %s",
  async (theme) => {
    const example = (isRequired: boolean, isInvalid: boolean, isDisabled: boolean) => (
      <div data-theme={theme}>
        <DatePicker isRequired={isRequired} isInvalid={isInvalid} isDisabled={isDisabled}>
          <DatePicker.Label data-testid="picker-label">Departure</DatePicker.Label>
          <DatePicker.Group>
            <DatePicker.Input>
              {(segment) => <DatePicker.Segment segment={segment} />}
            </DatePicker.Input>
          </DatePicker.Group>
        </DatePicker>
        <DateRangePicker isRequired={isRequired} isInvalid={isInvalid} isDisabled={isDisabled}>
          <DateRangePicker.Label data-testid="range-label">Trip</DateRangePicker.Label>
          <DateRangePicker.Group>
            <DateRangePicker.Input slot="start">
              {(segment) => <DateRangePicker.Segment segment={segment} />}
            </DateRangePicker.Input>
            <DateRangePicker.Input slot="end">
              {(segment) => <DateRangePicker.Segment segment={segment} />}
            </DateRangePicker.Input>
          </DateRangePicker.Group>
        </DateRangePicker>
        <ColorField isRequired={isRequired} isInvalid={isInvalid} isDisabled={isDisabled}>
          <ColorField.Label data-testid="color-label">Brand</ColorField.Label>
          <ColorField.Group>
            <ColorField.Input />
          </ColorField.Group>
        </ColorField>
        <span data-testid="danger-probe" style={{ color: "var(--danger)" }} />
        <span data-testid="foreground-probe" style={{ color: "var(--foreground)" }} />
      </div>
    );
    const screen = await render(example(true, true, false));
    const labels = ["picker-label", "range-label", "color-label"].map((name) =>
      screen.getByTestId(name).element(),
    );
    const danger = getComputedStyle(screen.getByTestId("danger-probe").element()).color;
    for (const label of labels) {
      await expect.poll(() => getComputedStyle(label).fontWeight).toBe("500");
      expect(getComputedStyle(label, "::after").content).toContain("*");
      await expect.poll(() => getComputedStyle(label).color).toBe(danger);
    }
    await screen.rerender(example(false, false, true));
    const foreground = getComputedStyle(screen.getByTestId("foreground-probe").element()).color;
    for (const label of labels) {
      expect(getComputedStyle(label, "::after").content).not.toContain("*");
      await expect.poll(() => getComputedStyle(label).color).toBe(foreground);
      await expect.poll(() => getComputedStyle(label).opacity).toBe("0.5");
    }
  },
);

test("range calendar commits both endpoints through keyboard selection", async () => {
  const change = vi.fn();
  const screen = await render(
    <I18nProvider locale="en-US">
      <RangeCalendar
        aria-label="Travel dates"
        defaultFocusedValue={new CalendarDate(2026, 3, 11)}
        onChange={change}
      >
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
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
});

test("year picker roving focus survives rerenders and closes back to its trigger", async () => {
  const screen = await render(
    <I18nProvider locale="en-US">
      <Calendar aria-label="Event date" defaultFocusedValue={new CalendarDate(2026, 3, 11)}>
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
  const selected = screen.getByRole("button", { name: "2026", exact: true });
  await expect.element(selected).toHaveFocus();
  const selectedElement = selected.element();
  await userEvent.keyboard("{ArrowDown}");
  const next = screen.getByRole("button", { name: "2029", exact: true });
  await expect.element(next).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.element(trigger).toHaveFocus();
  await expect.element(selectedElement).not.toBeVisible();
});

test("color slider keeps RAC gradient geometry and keyboard channel editing", async () => {
  const change = vi.fn();
  const screen = await render(
    <ColorSlider defaultValue="#ff0000" channel="hue" colorSpace="hsl" onChange={change}>
      <ColorSlider.Label>Hue</ColorSlider.Label>
      <ColorSlider.Output />
      <ColorSlider.Track data-testid="track">
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>,
  );
  const thumb = screen.getByRole("slider", { name: "Hue" });
  await expect.element(thumb).toHaveValue("0");
  (thumb.element() as HTMLElement).focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(thumb).toHaveValue("1");
  expect(change.mock.lastCall?.[0].getChannelValue("hue")).toBe(1);
  const track = screen.getByTestId("track").element();
  await expect.poll(() => getComputedStyle(track).backgroundImage).toContain("linear-gradient");
  expect(track.getBoundingClientRect().height).toBeGreaterThan(0);
});

test.each([{ days: 14 }, { weeks: 2 }])(
  "multiweek %j view renders the next month and keeps date-cell keyboard navigation",
  async (visibleDuration) => {
    const screen = await render(
      <I18nProvider locale="en-US">
        <Calendar
          aria-label="Schedule"
          defaultFocusedValue={new CalendarDate(2026, 4, 1)}
          visibleDuration={visibleDuration}
          firstDayOfWeek="mon"
        >
          <Calendar.Header>
            <Calendar.Heading />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      </I18nProvider>,
    );
    const march = screen.getByRole("button", { name: /Tuesday, March 31, 2026/ });
    const april = screen.getByRole("button", { name: /Wednesday, April 1, 2026/ });
    await expect
      .element(screen.getByRole("button", { name: /Saturday, April 4, 2026/ }))
      .toBeVisible();
    await march.click();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(april).toHaveFocus();
    expect(april.element().getBoundingClientRect().width).toBeGreaterThan(0);
  },
);

test("picker suffix remains clickable and its dialog escapes clipping with the scoped theme", async () => {
  const screen = await render(
    <ThemeScope
      theme="dark"
      data-testid="scope"
      style={{ width: 220, height: 80, overflow: "hidden" }}
    >
      <div
        data-testid="overlay-reference"
        style={{ backgroundColor: "var(--overlay)", height: 1 }}
      />
      <DatePicker defaultValue={new CalendarDate(2026, 3, 14)}>
        <DatePicker.Label>Departure</DatePicker.Label>
        <DatePicker.Group>
          <DatePicker.Input>
            {(segment) => <DatePicker.Segment segment={segment} />}
          </DatePicker.Input>
          <DatePicker.Suffix>
            <DatePicker.Trigger aria-label="Open calendar">
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DatePicker.Suffix>
        </DatePicker.Group>
        <DatePicker.Popover data-testid="popover">
          <DatePicker.Dialog aria-label="Choose departure date">
            <Calendar>
              <Calendar.Header>
                <Calendar.Heading />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
              </Calendar.Grid>
            </Calendar>
          </DatePicker.Dialog>
        </DatePicker.Popover>
      </DatePicker>
    </ThemeScope>,
  );
  const trigger = screen.getByRole("button", { name: "Open calendar" });
  await trigger.click();
  await expect.element(screen.getByRole("dialog", { name: "Choose departure date" })).toBeVisible();
  const popover = screen.getByTestId("popover").element();
  const scope = screen.getByTestId("scope").element();
  expect(scope.contains(popover)).toBe(false);
  const reference = screen.getByTestId("overlay-reference").element();
  await expect
    .poll(() => getComputedStyle(popover).backgroundColor)
    .toBe(getComputedStyle(reference).backgroundColor);
  const bounds = popover.getBoundingClientRect();
  expect(
    popover.contains(
      document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2),
    ),
  ).toBe(true);
  await userEvent.keyboard("{Escape}");
  await expect.element(trigger).toHaveFocus();
});

test("source input accessories reduce their adjacent padding without shrinking segments", async () => {
  const screen = await render(
    <I18nProvider locale="en-GB">
      <DateField defaultValue={new CalendarDate(2026, 3, 14)}>
        <DateField.Label>Departure</DateField.Label>
        <DateField.Group>
          <DateField.Prefix>From</DateField.Prefix>
          <DateField.Input data-testid="date-input">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix>UTC</DateField.Suffix>
        </DateField.Group>
      </DateField>
      <ColorField defaultValue="#ff0000">
        <ColorField.Label>Brand color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Prefix>#</ColorField.Prefix>
          <ColorField.Input data-testid="color-input" />
          <ColorField.Suffix>HEX</ColorField.Suffix>
        </ColorField.Group>
      </ColorField>
    </I18nProvider>,
  );
  const date = screen.getByTestId("date-input").element();
  const color = screen.getByTestId("color-input").element();
  // Pinned CSS uses px-3 normally and ps-2/pe-2 beside an accessory.
  for (const input of [date, color]) {
    await expect.poll(() => getComputedStyle(input).paddingInlineStart).toBe("8px");
    expect(getComputedStyle(input).paddingInlineEnd).toBe("8px");
  }
  const day = screen.getByRole("spinbutton", { name: /day/i });
  expect(day.element().getBoundingClientRect().width).toBeGreaterThan(0);
  expect(day.element().getBoundingClientRect().left).toBeGreaterThan(
    date.getBoundingClientRect().left,
  );
});

test("selected ranges round row edges and keep larger endpoint caps", async () => {
  const screen = await render(
    <I18nProvider locale="en-US">
      <div data-testid="row-radius" style={{ borderRadius: "var(--radius-lg)" }} />
      <div data-testid="cap-radius" style={{ borderRadius: "var(--radius-3xl)" }} />
      <RangeCalendar
        aria-label="Travel dates"
        defaultValue={{ start: new CalendarDate(2026, 3, 11), end: new CalendarDate(2026, 3, 18) }}
      >
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
    </I18nProvider>,
  );
  const rowRadius = getComputedStyle(
    screen.getByTestId("row-radius").element(),
  ).borderTopLeftRadius;
  const capRadius = getComputedStyle(
    screen.getByTestId("cap-radius").element(),
  ).borderTopLeftRadius;
  const rowStart = screen.getByRole("button", { name: /Sunday, March 15, 2026/ }).element();
  const rowEnd = screen.getByRole("button", { name: /Saturday, March 14, 2026/ }).element();
  const middle = screen.getByRole("button", { name: /Thursday, March 12, 2026/ }).element();
  const start = screen
    .getByRole("button", { name: /Wednesday, March 11, 2026 selected$/ })
    .element();
  const end = screen.getByRole("button", { name: /Wednesday, March 18, 2026 selected$/ }).element();
  await expect.poll(() => getComputedStyle(rowStart).borderTopLeftRadius).toBe(rowRadius);
  expect(getComputedStyle(rowEnd).borderTopRightRadius).toBe(rowRadius);
  expect(getComputedStyle(middle).borderTopLeftRadius).toBe("0px");
  expect(getComputedStyle(middle).borderTopRightRadius).toBe("0px");
  expect(getComputedStyle(start).borderTopLeftRadius).toBe(capRadius);
  expect(getComputedStyle(end).borderTopRightRadius).toBe(capRadius);
  expect(rowStart.getBoundingClientRect().top).toBeGreaterThan(rowEnd.getBoundingClientRect().top);
});
