/** HeroUI v3.2.6 derived stories. Copyright NextUI Inc. Apache-2.0.
 * Adapted from e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e for native Lenso APIs and StyleX.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DateValue } from "@internationalized/date";
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
import { Button, ButtonGroup, Calendar, Description } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { calendarStoryStyles as s } from "./calendar.stylex";
import {
  CalendarTemplate,
  CalendarMonths,
  FocusActions,
  ViewSelect,
  BookingLegend,
  bookedDays,
  events,
  type CalendarArgs,
} from "./calendar.fixtures";

const meta: Meta<typeof Calendar> = {
  title: "Components/Date and Time/Calendar",
  component: Calendar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
    selectionMode: { control: "select", options: ["single", "multiple"] },
    weeksInMonth: { control: { type: "number", min: 4, max: 6, step: 1 } },
  },
};
export default meta;
type Story = StoryObj<CalendarArgs>;
export const Default: Story = {
  render: (args) => <CalendarTemplate {...args} aria-label="Event date" />,
};
export const WithYearPicker: Story = {
  render: (args) => (
    <CalendarTemplate {...args} aria-label="Event date" composition={{ year: true }} />
  ),
};
export const DefaultValue: Story = {
  render: (args) => (
    <CalendarTemplate {...args} aria-label="Event date" defaultValue={parseDate("2025-02-14")} />
  ),
};
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateValue | null>(null);
    const [focusedDate, setFocusedDate] = useState<DateValue>(parseDate("2025-12-25"));
    const { locale } = useLocale();
    const set = (date: DateValue) => {
      setValue(date);
      setFocusedDate(date);
    };
    return (
      <div {...stylex.props(s.stack)}>
        <ButtonGroup variant="tertiary">
          <Button onClick={() => set(today(getLocalTimeZone()))}>Today</Button>
          <Button
            onClick={() => set(startOfWeek(today(getLocalTimeZone()).add({ weeks: 1 }), locale))}
          >
            Next week
          </Button>
          <Button onClick={() => set(startOfMonth(today(getLocalTimeZone()).add({ months: 1 })))}>
            Next month
          </Button>
        </ButtonGroup>
        <CalendarTemplate
          {...args}
          aria-label="Event date"
          focusedValue={focusedDate}
          value={value}
          onChange={setValue}
          onFocusChange={setFocusedDate}
        />
        <Description xstyle={s.center}>
          Selected date: {value ? value.toString() : "(none)"}
        </Description>
        <div {...stylex.props(s.actions)}>
          <Button size="sm" variant="secondary" onClick={() => set(today(getLocalTimeZone()))}>
            Set Today
          </Button>
          <Button size="sm" variant="secondary" onClick={() => set(parseDate("2025-12-25"))}>
            Set Christmas
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
        <CalendarTemplate
          {...args}
          aria-label="Appointment date"
          minValue={now}
          maxValue={maxDate}
          composition={{ year: true, navFirst: true }}
        />
        <Description xstyle={s.center}>
          Select a date between today and {maxDate.toString()}
        </Description>
      </div>
    );
  },
};
export const UnavailableDates: Story = {
  render: (args) => {
    const { locale } = useLocale();
    return (
      <div {...stylex.props(s.stack)}>
        <CalendarTemplate
          {...args}
          aria-label="Appointment date"
          isDateUnavailable={(date) => isWeekend(date, locale)}
        />
        <Description xstyle={s.center}>Weekends are unavailable</Description>
      </div>
    );
  },
};
export const WeeksInMonth: Story = {
  render: (args) => (
    <div {...stylex.props(s.stack)}>
      <CalendarTemplate {...args} aria-label="Event date" weeksInMonth={6} />
      <Description xstyle={s.center}>Fixed to 6 weeks per month to avoid layout shift</Description>
    </div>
  ),
};
export const MultipleSelection: Story = {
  render: (args) => {
    const [value, setValue] = useState<readonly DateValue[]>([]);
    const {
      value: _value,
      defaultValue: _defaultValue,
      onChange: _onChange,
      selectionMode: _selectionMode,
      render: _render,
      style: _style,
      ...rest
    } = args;
    return (
      <div {...stylex.props(s.stack)}>
        <Calendar<DateValue, "multiple">
          {...rest}
          aria-label="Event dates"
          selectionMode="multiple"
          value={value}
          onChange={setValue}
        >
          <Calendar.Header>
            <Calendar.Heading />
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
        <Description xstyle={s.center}>
          {value.length ? `${value.length} date(s) selected` : "Select multiple dates"}
        </Description>
      </div>
    );
  },
};
export const CustomUnavailableDates: Story = {
  render: (args) => {
    const blocked = [parseDate("2025-02-14"), parseDate("2025-02-17"), parseDate("2025-03-17")];
    return (
      <div {...stylex.props(s.stack)}>
        <CalendarTemplate
          {...args}
          aria-label="Event date"
          isDateUnavailable={(date) =>
            blocked.some(
              (b) => b.year === date.year && b.month === date.month && b.day === date.day,
            )
          }
        />
        <Description xstyle={s.center}>Feb 14, Feb 17, and Mar 17 are unavailable</Description>
      </div>
    );
  },
};
export const Disabled: Story = {
  render: (args) => (
    <div {...stylex.props(s.stack)}>
      <CalendarTemplate
        {...args}
        isDisabled
        aria-label="Event date"
        defaultValue={today(getLocalTimeZone())}
      />
      <Description xstyle={s.center}>Calendar is disabled</Description>
    </div>
  ),
};
export const ReadOnly: Story = {
  render: (args) => (
    <div {...stylex.props(s.stack)}>
      <CalendarTemplate
        {...args}
        isReadOnly
        aria-label="Event date"
        defaultValue={today(getLocalTimeZone())}
      />
      <Description xstyle={s.center}>Calendar is read-only</Description>
    </div>
  ),
};
export const Invalid: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateValue | null>(parseDate("2025-01-15"));
    const isInvalid = value !== null && value.compare(today(getLocalTimeZone())) < 0;
    return (
      <div {...stylex.props(s.stack)}>
        <CalendarTemplate
          {...args}
          aria-label="Event date"
          isInvalid={isInvalid}
          value={value}
          onChange={setValue}
        />
        {isInvalid ? (
          <p {...stylex.props(s.danger)}>Date must be today or in the future</p>
        ) : (
          <Description xstyle={s.center}>Select a future date</Description>
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
        <CalendarTemplate
          {...args}
          aria-label="Event date"
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
    <CalendarTemplate
      {...args}
      aria-label="Event date"
      composition={{ navFirst: true, indicators: "events" }}
    />
  ),
};
export const TodayIndicator: Story = {
  render: (args) => (
    <CalendarTemplate
      {...args}
      aria-label="Event date"
      defaultValue={today(getLocalTimeZone())}
      composition={{ navFirst: true, indicators: "today" }}
    />
  ),
};
export const MultipleMonths: Story = {
  render: (args) => <CalendarMonths {...args} count={2} aria-label="Trip dates" />,
};
export const DayView: Story = {
  render: (args) => {
    const [days, setDays] = useState(5);
    return (
      <div {...stylex.props(s.stack6)}>
        <ViewSelect unit="days" value={days} onChange={setDays} />
        <CalendarTemplate {...args} aria-label="Day view" visibleDuration={{ days }} />
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
        <CalendarTemplate {...args} aria-label="Week view" visibleDuration={{ weeks }} />
      </div>
    );
  },
};
export const InternationalCalendar: Story = {
  render: (args) => (
    <I18nProvider locale="hi-IN-u-ca-indian">
      <CalendarTemplate
        {...args}
        aria-label="Event date"
        defaultValue={today(getLocalTimeZone())}
        composition={{ year: true }}
      />
    </I18nProvider>
  ),
};
export const ThreeMonths: Story = {
  render: (args) => <CalendarMonths {...args} count={3} aria-label="Vacation planning" />,
};
export const BookingCalendar: Story = {
  render: (args) => {
    const [selectedDate, setSelectedDate] = useState<DateValue | null>(null);
    const { locale } = useLocale();
    return (
      <div {...stylex.props(s.stack)}>
        <Calendar
          {...args}
          aria-label="Booking date"
          isDateUnavailable={(date) => isWeekend(date, locale) || bookedDays.includes(date.day)}
          minValue={today(getLocalTimeZone())}
          value={selectedDate}
          onChange={setSelectedDate}
        >
          <Calendar.Header>
            <Calendar.NavButton slot="previous" />
            <Calendar.Heading />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => (
                <Calendar.Cell date={date}>
                  {({ formattedDate, isUnavailable }) => (
                    <>
                      {formattedDate}
                      {!isUnavailable &&
                      !isWeekend(date, locale) &&
                      bookedDays.includes(date.day) ? (
                        <Calendar.CellIndicator />
                      ) : null}
                    </>
                  )}
                </Calendar.Cell>
              )}
            </Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
        <div {...stylex.props(s.legendColumn)}>
          <BookingLegend />
          {selectedDate ? (
            <Button size="sm" variant="primary">
              Book {selectedDate.toString()}
            </Button>
          ) : null}
        </div>
      </div>
    );
  },
};
export const YearPicker: Story = {
  render: (args) => (
    <CalendarTemplate {...args} aria-label="Event date" composition={{ year: true }} />
  ),
};
export const YearPickerStyledCells: Story = {
  render: (args) => (
    <CalendarTemplate
      {...args}
      aria-label="Event date with styled year cells"
      composition={{ year: true, years: "styled" }}
    />
  ),
};
export const YearPickerCustomCells: Story = {
  render: (args) => (
    <CalendarTemplate
      {...args}
      aria-label="Event date with custom year cells"
      composition={{ year: true, years: "custom" }}
    />
  ),
};
export const CustomNavIcons: Story = {
  render: (args) => (
    <CalendarTemplate
      {...args}
      aria-label="Event date"
      composition={{ navFirst: true, customIcons: true }}
    />
  ),
};
export const EventCalendar: Story = {
  render: (args) => (
    <div {...stylex.props(s.stack)}>
      <Calendar {...args} aria-label="Event calendar">
        <Calendar.Header>
          <Calendar.Heading />
          <Calendar.NavButton slot="previous" />
          <Calendar.NavButton slot="next" />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHeader>
            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
          </Calendar.GridHeader>
          <Calendar.GridBody>
            {(date) => (
              <Calendar.Cell date={date}>
                {({ formattedDate }) => (
                  <>
                    {formattedDate}
                    {events[date.day] ? <Calendar.CellIndicator /> : null}
                  </>
                )}
              </Calendar.Cell>
            )}
          </Calendar.GridBody>
        </Calendar.Grid>
      </Calendar>
      <div {...stylex.props(s.events)}>
        <p>Dates with indicators have scheduled events</p>
      </div>
    </div>
  ),
};
