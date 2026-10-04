/** HeroUI v3.2.6 story adaptations. Copyright NextUI Inc. Apache-2.0.
 * Source: e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, calendar and range-calendar stories.
 * Native Base UI buttons/select replace upstream ordinary interaction props.
 */
import type { ComponentProps } from "react";
import type { DateValue } from "@internationalized/date";
import { getLocalTimeZone, isToday } from "@internationalized/date";
import { Button, Calendar, RangeCalendar, Select } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { calendarStoryStyles as s } from "./calendar.stylex";

export type CalendarArgs = Omit<ComponentProps<typeof Calendar<DateValue, "single">>, "children">;
export type RangeArgs = Omit<ComponentProps<typeof RangeCalendar>, "children">;
export type DateRange = { start: DateValue; end: DateValue };
export const eventDays = [3, 7, 12, 15, 21, 28];
export const bookedDays = [5, 6, 12, 13, 14, 20];
export const events: Record<number, { title: string; color: string }[]> = {
  3: [{ title: "Team Meeting", color: "bg-blue-500" }],
  7: [{ title: "Project Deadline", color: "bg-red-500" }],
  12: [
    { title: "Lunch", color: "bg-green-500" },
    { title: "Review", color: "bg-purple-500" },
  ],
  15: [{ title: "Conference", color: "bg-orange-500" }],
  21: [{ title: "Workshop", color: "bg-pink-500" }],
  28: [{ title: "Demo Day", color: "bg-cyan-500" }],
};
export function ViewSelect({
  unit,
  value,
  onChange,
}: {
  unit: "days" | "weeks";
  value: number;
  onChange: (value: number) => void;
}) {
  const values = unit === "days" ? [1, 5, 7, 8, 10, 14, 21] : [1, 2, 3, 4, 5, 6, 8];
  const singular = unit === "days" ? "day" : "week";
  const label = `Visible ${unit}`;
  return (
    <div {...stylex.props(s.select)}>
      <label id={`calendar-${unit}-label`}>{label}</label>
      <Select
        items={values.map((n) => ({
          value: String(n),
          label: `${n} ${n === 1 ? singular : unit}`,
        }))}
        value={String(value)}
        onValueChange={(next) => next && onChange(Number(next))}
      >
        <Select.Trigger aria-labelledby={`calendar-${unit}-label`}>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popover>
              <Select.List>
                {values.map((n) => (
                  <Select.Item key={n} value={String(n)}>
                    <Select.ItemText>
                      {n} {n === 1 ? singular : unit}
                    </Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popover>
          </Select.Positioner>
        </Select.Portal>
      </Select>
    </div>
  );
}
export function FocusActions({ onChange }: { onChange: (value: DateValue) => void }) {
  return (
    <div {...stylex.props(s.actions)}>
      <Button size="sm" variant="secondary" onClick={() => onChange(fixedDates.jan)}>
        Go to Jan
      </Button>
      <Button size="sm" variant="secondary" onClick={() => onChange(fixedDates.jun)}>
        Go to Jun
      </Button>
      <Button size="sm" variant="secondary" onClick={() => onChange(fixedDates.christmas)}>
        Go to Christmas
      </Button>
    </div>
  );
}
import { parseDate } from "@internationalized/date";
const fixedDates = {
  jan: parseDate("2025-01-01"),
  jun: parseDate("2025-06-15"),
  christmas: parseDate("2025-12-25"),
};
type Composition = {
  year?: boolean;
  navFirst?: boolean;
  indicators?: "events" | "today";
  customIcons?: boolean;
  years?: "styled" | "custom";
};
function Arrow({ next = false }: { next?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      height={24}
      width={24}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={
          next
            ? "M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6l-6 6z"
            : "M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6l6 6z"
        }
        fill="currentColor"
      />
    </svg>
  );
}
export function CalendarTemplate({
  composition = {},
  ...props
}: CalendarArgs & { composition?: Composition }) {
  const { year, navFirst, indicators, customIcons, years } = composition;
  const heading = year ? (
    <Calendar.YearPickerTrigger>
      <Calendar.YearPickerTriggerHeading />
      <Calendar.YearPickerTriggerIndicator />
    </Calendar.YearPickerTrigger>
  ) : (
    <Calendar.Heading />
  );
  const previous = (
    <Calendar.NavButton slot="previous">{customIcons ? <Arrow /> : undefined}</Calendar.NavButton>
  );
  return (
    <Calendar {...props}>
      <Calendar.Header>
        {navFirst ? previous : heading}
        {navFirst ? heading : previous}
        <Calendar.NavButton slot="next">
          {customIcons ? <Arrow next /> : undefined}
        </Calendar.NavButton>
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
                  {indicators &&
                  (isToday(date, getLocalTimeZone()) ||
                    (indicators === "events" && eventDays.includes(date.day))) ? (
                    <Calendar.CellIndicator />
                  ) : null}
                </>
              )}
            </Calendar.Cell>
          )}
        </Calendar.GridBody>
      </Calendar.Grid>
      {year ? (
        <Calendar.YearPickerGrid>
          <Calendar.YearPickerGridBody>
            {({ year: y, isCurrentYear, isSelected }) => (
              <Calendar.YearPickerCell
                year={y}
                xstyle={
                  years === "styled" && isCurrentYear && !isSelected ? s.currentYear : undefined
                }
              >
                {years === "custom" ? (
                  <span {...stylex.props(s.inline)}>
                    <span>{y}</span>
                    {isCurrentYear ? (
                      <span {...stylex.props(isSelected ? s.accentForeground : s.accent)}>Now</span>
                    ) : null}
                  </span>
                ) : undefined}
              </Calendar.YearPickerCell>
            )}
          </Calendar.YearPickerGridBody>
        </Calendar.YearPickerGrid>
      ) : null}
    </Calendar>
  );
}
export function RangeTemplate({
  composition = {},
  ...props
}: RangeArgs & { composition?: Composition }) {
  const { year, navFirst, indicators } = composition;
  const heading = year ? (
    <RangeCalendar.YearPickerTrigger>
      <RangeCalendar.YearPickerTriggerHeading />
      <RangeCalendar.YearPickerTriggerIndicator />
    </RangeCalendar.YearPickerTrigger>
  ) : (
    <RangeCalendar.Heading />
  );
  const previous = <RangeCalendar.NavButton slot="previous" />;
  return (
    <RangeCalendar {...props}>
      <RangeCalendar.Header>
        {navFirst ? previous : heading}
        {navFirst ? heading : previous}
        <RangeCalendar.NavButton slot="next" />
      </RangeCalendar.Header>
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date) => (
            <RangeCalendar.Cell date={date}>
              {({ formattedDate }) => (
                <>
                  {formattedDate}
                  {indicators &&
                  (isToday(date, getLocalTimeZone()) || eventDays.includes(date.day)) ? (
                    <RangeCalendar.CellIndicator />
                  ) : null}
                </>
              )}
            </RangeCalendar.Cell>
          )}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
      {year ? (
        <RangeCalendar.YearPickerGrid>
          <RangeCalendar.YearPickerGridBody>
            {({ year: y }) => <RangeCalendar.YearPickerCell year={y} />}
          </RangeCalendar.YearPickerGridBody>
        </RangeCalendar.YearPickerGrid>
      ) : null}
    </RangeCalendar>
  );
}
export function CalendarMonths({ count, ...props }: CalendarArgs & { count: 2 | 3 }) {
  return (
    <Calendar
      {...props}
      visibleDuration={{ months: count }}
      xstyle={count === 2 ? s.scroll : s.scrollThree}
    >
      <div {...stylex.props(count === 2 ? s.months : s.threeMonths)}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} {...stylex.props(s.month)}>
            <Calendar.Header>
              {i === 0 ? (
                <Calendar.NavButton slot="previous" />
              ) : (
                <div {...stylex.props(s.spacer)} />
              )}
              <Calendar.Heading
                offset={{ months: i }}
                xstyle={count === 2 ? s.heading : undefined}
              />
              {i === count - 1 ? (
                <Calendar.NavButton slot="next" />
              ) : (
                <div {...stylex.props(s.spacer)} />
              )}
            </Calendar.Header>
            <Calendar.Grid offset={{ months: i }}>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
            </Calendar.Grid>
          </div>
        ))}
      </div>
    </Calendar>
  );
}
export function RangeMonths({ count, ...props }: RangeArgs & { count: 2 | 3 }) {
  return (
    <RangeCalendar
      {...props}
      visibleDuration={{ months: count }}
      xstyle={count === 2 ? s.scroll : s.scrollThree}
    >
      <div {...stylex.props(count === 2 ? s.months : s.threeMonths)}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} {...stylex.props(s.month)}>
            <RangeCalendar.Header>
              {i === 0 ? (
                <RangeCalendar.NavButton slot="previous" />
              ) : (
                <div {...stylex.props(s.spacer)} />
              )}
              <RangeCalendar.Heading
                offset={{ months: i }}
                xstyle={count === 2 ? s.heading : undefined}
              />
              {i === count - 1 ? (
                <RangeCalendar.NavButton slot="next" />
              ) : (
                <div {...stylex.props(s.spacer)} />
              )}
            </RangeCalendar.Header>
            <RangeCalendar.Grid offset={{ months: i }}>
              <RangeCalendar.GridHeader>
                {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
              </RangeCalendar.GridHeader>
              <RangeCalendar.GridBody>
                {(date) => <RangeCalendar.Cell date={date} />}
              </RangeCalendar.GridBody>
            </RangeCalendar.Grid>
          </div>
        ))}
      </div>
    </RangeCalendar>
  );
}
export function BookingLegend({ range }: { range?: boolean }) {
  return (
    <div {...stylex.props(s.legend)}>
      <span {...stylex.props(s.inline)}>
        <span {...stylex.props(s.dotMuted)} /> {range ? "Blocked dates" : "Has bookings"}
      </span>
      <span {...stylex.props(s.inline)}>
        <span {...stylex.props(s.dotDefault)} /> Weekend/Unavailable
      </span>
    </div>
  );
}
