"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. */
import { RangeCalendar } from "@lenso/ui";
import type { CalendarDate } from "@internationalized/date";
import type { ReactElement } from "react";

export function RangeHeader() {
  return (
    <RangeCalendar.Header>
      <RangeCalendar.Heading />
      <RangeCalendar.NavButton slot="previous" />
      <RangeCalendar.NavButton slot="next" />
    </RangeCalendar.Header>
  );
}
export function RangeGrid({ cell }: { cell?: (date: CalendarDate) => ReactElement }) {
  return (
    <RangeCalendar.Grid>
      <RangeCalendar.GridHeader>
        {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
      </RangeCalendar.GridHeader>
      <RangeCalendar.GridBody>
        {cell ?? ((date) => <RangeCalendar.Cell date={date} />)}
      </RangeCalendar.GridBody>
    </RangeCalendar.Grid>
  );
}
export function RangeYearHeader() {
  return (
    <RangeCalendar.Header>
      <RangeCalendar.YearPickerTrigger>
        <RangeCalendar.YearPickerTriggerHeading />
        <RangeCalendar.YearPickerTriggerIndicator />
      </RangeCalendar.YearPickerTrigger>
      <RangeCalendar.NavButton slot="previous" />
      <RangeCalendar.NavButton slot="next" />
    </RangeCalendar.Header>
  );
}
export function RangeYearGrid() {
  return (
    <RangeCalendar.YearPickerGrid>
      <RangeCalendar.YearPickerGridBody>
        {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
      </RangeCalendar.YearPickerGridBody>
    </RangeCalendar.YearPickerGrid>
  );
}
