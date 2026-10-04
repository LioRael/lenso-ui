/** HeroUI v3.2.6 derived stories. Copyright NextUI Inc. Apache-2.0.
 * Adapted from e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e for native Lenso APIs and StyleX.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CalendarDate, DateValue } from "@internationalized/date";
import {
  getLocalTimeZone,
  isWeekend,
  parseDate,
  startOfMonth,
  startOfWeek,
  today,
} from "@internationalized/date";
import { useState } from "react";
import { I18nProvider, useLocale } from "react-aria-components/I18nProvider";
import { Button, ButtonGroup, Description, RangeCalendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { calendarStoryStyles as s } from "./calendar.stylex";
import {
  RangeTemplate,
  RangeMonths,
  FocusActions,
  ViewSelect,
  BookingLegend,
  bookedDays,
  type DateRange,
} from "./calendar.fixtures";

const meta: Meta<typeof RangeCalendar> = {
  title: "Components/Date and Time/RangeCalendar",
  component: RangeCalendar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    allowsNonContiguousRanges: { control: "boolean" },
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
    weeksInMonth: { control: { type: "number", min: 4, max: 6, step: 1 } },
  },
};
export default meta;
type Story = StoryObj<typeof RangeCalendar>;
export const Default: Story = {
  render: (args) => <RangeTemplate {...args} aria-label="Trip dates" />,
};
export const WithYearPicker: Story = {
  render: (args) => (
    <RangeTemplate {...args} aria-label="Trip dates" composition={{ year: true }} />
  ),
};
export const DefaultValue: Story = {
  render: (args) => (
    <RangeTemplate
      {...args}
      aria-label="Trip dates"
      defaultValue={{ start: parseDate("2025-02-03"), end: parseDate("2025-02-12") }}
    />
  ),
};
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRange | null>(null);
    const [focusedDate, setFocusedDate] = useState<DateValue>(parseDate("2025-12-25"));
    const { locale } = useLocale();
    const set = (start: DateValue, days: number) => {
      setValue({ start, end: start.add({ days }) });
      setFocusedDate(start);
    };
    return (
      <div {...stylex.props(s.stack)}>
        <ButtonGroup variant="tertiary">
          <Button onClick={() => set(today(getLocalTimeZone()), 6)}>This week</Button>
          <Button
            onClick={() => set(startOfWeek(today(getLocalTimeZone()).add({ weeks: 1 }), locale), 6)}
          >
            Next week
          </Button>
          <Button
            onClick={() => set(startOfMonth(today(getLocalTimeZone()).add({ months: 1 })), 9)}
          >
            Next month
          </Button>
        </ButtonGroup>
        <RangeTemplate
          {...args}
          aria-label="Trip dates"
          focusedValue={focusedDate}
          value={value}
          onChange={setValue}
          onFocusChange={setFocusedDate}
        />
        <Description xstyle={s.center}>
          Selected range:{" "}
          {value ? `${value.start.toString()} -> ${value.end.toString()}` : "(none)"}
        </Description>
        <div {...stylex.props(s.actions)}>
          <Button size="sm" variant="secondary" onClick={() => set(today(getLocalTimeZone()), 6)}>
            Set 1 week
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const start = parseDate("2025-12-20");
              setValue({ start, end: parseDate("2025-12-31") });
              setFocusedDate(start);
            }}
          >
            Set Holidays
          </Button>
          <Button size="sm" variant="tertiary" onClick={() => setValue(null)}>
            Clear
          </Button>
        </div>
      </div>
    );
  },
};
export const MinMaxDates: Story = {
  render: (args) => {
    const now = today(getLocalTimeZone());
    const maxDate = now.add({ months: 3 });
    return (
      <div {...stylex.props(s.stack)}>
        <RangeTemplate
          {...args}
          aria-label="Trip dates"
          defaultValue={{ start: now.add({ days: 2 }), end: now.add({ days: 5 }) }}
          minValue={now}
          maxValue={maxDate}
          composition={{ year: true, navFirst: true }}
        />
        <Description xstyle={s.center}>
          Select dates between today and {maxDate.toString()}
        </Description>
      </div>
    );
  },
};
export const UnavailableDates: Story = {
  render: (args) => {
    const now = today(getLocalTimeZone());
    const blocked = [
      [now.add({ days: 2 }), now.add({ days: 5 })],
      [now.add({ days: 12 }), now.add({ days: 13 })],
    ] as const;
    return (
      <div {...stylex.props(s.stack)}>
        <RangeTemplate
          {...args}
          aria-label="Trip dates"
          defaultValue={{ start: now.add({ days: 6 }), end: now.add({ days: 9 }) }}
          isDateUnavailable={(date) =>
            blocked.some(([a, b]) => date.compare(a) >= 0 && date.compare(b) <= 0)
          }
        />
        <Description xstyle={s.center}>Some days are unavailable</Description>
      </div>
    );
  },
};
export const WeeksInMonth: Story = {
  render: (args) => (
    <div {...stylex.props(s.stack)}>
      <RangeTemplate {...args} aria-label="Trip dates" weeksInMonth={6} />
      <Description xstyle={s.center}>Fixed to 6 weeks per month to avoid layout shift</Description>
    </div>
  ),
};
export const AnchorUnavailableDates: Story = {
  render: (args) => {
    const isDateUnavailable = (date: DateValue, anchorDate: CalendarDate | null) =>
      anchorDate != null && Math.abs(date.compare(anchorDate)) > 7;
    return (
      <div {...stylex.props(s.stack)}>
        <RangeTemplate
          {...args}
          aria-label="Trip dates"
          minValue={today(getLocalTimeZone())}
          isDateUnavailable={isDateUnavailable}
        />
        <Description xstyle={s.center}>
          After selecting a start date, only dates within 7 days are available
        </Description>
      </div>
    );
  },
};
export const AllowsNonContiguousRanges: Story = {
  render: (args) => {
    const now = today(getLocalTimeZone());
    const blocked = [
      [now.add({ days: 2 }), now.add({ days: 5 })],
      [now.add({ days: 12 }), now.add({ days: 13 })],
    ] as const;
    return (
      <div {...stylex.props(s.stack)}>
        <RangeTemplate
          {...args}
          allowsNonContiguousRanges
          aria-label="Trip dates"
          defaultValue={{ start: now.add({ days: 1 }), end: now.add({ days: 9 }) }}
          isDateUnavailable={(date) =>
            blocked.some(([a, b]) => date.compare(a) >= 0 && date.compare(b) <= 0)
          }
        />
        <Description xstyle={s.center}>
          Non-contiguous ranges are allowed across unavailable dates
        </Description>
      </div>
    );
  },
};
export const Disabled: Story = {
  render: (args) => (
    <div {...stylex.props(s.stack)}>
      <RangeTemplate
        {...args}
        isDisabled
        aria-label="Trip dates"
        defaultValue={{
          start: today(getLocalTimeZone()),
          end: today(getLocalTimeZone()).add({ days: 4 }),
        }}
      />
      <Description xstyle={s.center}>Range calendar is disabled</Description>
    </div>
  ),
};
export const ReadOnly: Story = {
  render: (args) => (
    <div {...stylex.props(s.stack)}>
      <RangeTemplate
        {...args}
        isReadOnly
        aria-label="Trip dates"
        defaultValue={{
          start: today(getLocalTimeZone()),
          end: today(getLocalTimeZone()).add({ days: 4 }),
        }}
      />
      <Description xstyle={s.center}>Range calendar is read-only</Description>
    </div>
  ),
};
export const Invalid: Story = {
  render: (args) => {
    const now = today(getLocalTimeZone());
    const [value, setValue] = useState<DateRange>({
      start: now.add({ days: 6 }),
      end: now.add({ days: 14 }),
    });
    const isInvalid = value.end.compare(value.start) > 7;
    return (
      <div {...stylex.props(s.stack)}>
        <RangeTemplate
          {...args}
          aria-label="Trip dates"
          isInvalid={isInvalid}
          value={value}
          onChange={setValue}
        />
        {isInvalid ? (
          <p {...stylex.props(s.danger)}>Maximum stay duration is 1 week</p>
        ) : (
          <Description xstyle={s.center}>Select a stay of up to 7 days</Description>
        )}
      </div>
    );
  },
};
export const FocusedValue: Story = {
  render: (args) => {
    const [focusedDate, setFocusedDate] = useState<DateValue>(parseDate("2025-06-15"));
    return (
      <div {...stylex.props(s.stack)}>
        <RangeTemplate
          {...args}
          aria-label="Trip dates"
          focusedValue={focusedDate}
          onFocusChange={setFocusedDate}
        />
        <Description xstyle={s.center}>Focused: {focusedDate.toString()}</Description>
        <FocusActions onChange={setFocusedDate} />
      </div>
    );
  },
};
export const WithIndicators: Story = {
  render: (args) => (
    <RangeTemplate
      {...args}
      aria-label="Trip dates"
      composition={{ navFirst: true, indicators: "events" }}
    />
  ),
};
export const MultipleMonths: Story = {
  render: (args) => <RangeMonths {...args} aria-label="Trip dates" count={2} />,
};
export const ThreeMonths: Story = {
  render: (args) => <RangeMonths {...args} aria-label="Vacation planning" count={3} />,
};
export const DayView: Story = {
  render: (args) => {
    const [days, setDays] = useState(5);
    return (
      <div {...stylex.props(s.stack6)}>
        <ViewSelect unit="days" value={days} onChange={setDays} />
        <RangeTemplate key={days} {...args} aria-label="Trip dates" visibleDuration={{ days }} />
      </div>
    );
  },
};
export const WeekView: Story = {
  render: (args) => {
    const [weeks, setWeeks] = useState(1);
    return (
      <div {...stylex.props(s.stack6)}>
        <ViewSelect unit="weeks" value={weeks} onChange={setWeeks} />
        <RangeTemplate key={weeks} {...args} aria-label="Trip dates" visibleDuration={{ weeks }} />
      </div>
    );
  },
};
export const InternationalCalendar: Story = {
  render: (args) => (
    <I18nProvider locale="hi-IN-u-ca-indian">
      <RangeTemplate
        {...args}
        aria-label="Trip dates"
        defaultValue={{
          start: today(getLocalTimeZone()),
          end: today(getLocalTimeZone()).add({ days: 7 }),
        }}
        composition={{ year: true }}
      />
    </I18nProvider>
  ),
};
export const BookingCalendar: Story = {
  render: (args) => {
    const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
    const { locale } = useLocale();
    return (
      <div {...stylex.props(s.stack)}>
        <RangeCalendar
          {...args}
          aria-label="Booking range"
          isDateUnavailable={(date) => isWeekend(date, locale) || bookedDays.includes(date.day)}
          minValue={today(getLocalTimeZone())}
          value={selectedRange}
          onChange={setSelectedRange}
        >
          <RangeCalendar.Header>
            <RangeCalendar.NavButton slot="previous" />
            <RangeCalendar.Heading />
            <RangeCalendar.NavButton slot="next" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid>
            <RangeCalendar.GridHeader>
              {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(date) => (
                <RangeCalendar.Cell date={date}>
                  {({ formattedDate, isUnavailable }) => (
                    <>
                      {formattedDate}
                      {!isUnavailable &&
                      !isWeekend(date, locale) &&
                      bookedDays.includes(date.day) ? (
                        <RangeCalendar.CellIndicator />
                      ) : null}
                    </>
                  )}
                </RangeCalendar.Cell>
              )}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
        </RangeCalendar>
        <div {...stylex.props(s.legendColumn)}>
          <BookingLegend range />
          {selectedRange ? (
            <Button size="sm" variant="primary">
              Book {selectedRange.start.toString()} -&gt; {selectedRange.end.toString()}
            </Button>
          ) : null}
        </div>
      </div>
    );
  },
};
