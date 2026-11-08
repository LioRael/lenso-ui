"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface RangeCalendarStoryProps extends Pick<
  StoryComponentProps<typeof RangeCalendar>,
  "isDisabled" | "isInvalid"
> {}
export const initialArgs: RangeCalendarStoryProps = /* story-args:start */ {
  isDisabled: false,
  isInvalid: false,
}; /* story-args:end */

// Copyright NextUI Inc. Apache-2.0.
import { RangeCalendar } from "@lenso/ui";

export function Basic(overrides: RangeCalendarStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <RangeCalendar aria-label="Trip dates" firstDayOfWeek="mon" {...args}>
      <RangeCalendar.Header>
        <RangeCalendar.Heading />
        <RangeCalendar.NavButton slot="previous" />
        <RangeCalendar.NavButton slot="next" />
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
  );
}
