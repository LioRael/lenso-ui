"use client";
// Copyright NextUI Inc. Apache-2.0.
import type { ComponentProps } from "react";
export interface CalendarYearPickerStoryProps extends Pick<
  ComponentProps<typeof Calendar.YearPickerTrigger>,
  "disabled"
> {}
export const initialArgs: CalendarYearPickerStoryProps = /* story-args:start */ {
  disabled: false,
}; /* story-args:end */
import { Calendar } from "@lenso/ui";

export function Preview(overrides: CalendarYearPickerStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <Calendar aria-label="Event date">
      <Calendar.Header>
        <Calendar.YearPickerTrigger disabled={args.disabled}>
          <Calendar.YearPickerTriggerHeading />
          <Calendar.YearPickerTriggerIndicator />
        </Calendar.YearPickerTrigger>
        <Calendar.NavButton slot="previous" />
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
      </Calendar.Grid>
      <Calendar.YearPickerGrid>
        <Calendar.YearPickerGridBody>
          {({ year }) => <Calendar.YearPickerCell year={year} />}
        </Calendar.YearPickerGridBody>
      </Calendar.YearPickerGrid>
    </Calendar>
  );
}
