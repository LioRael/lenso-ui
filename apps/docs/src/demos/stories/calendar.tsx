"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface CalendarStoryProps extends Pick<
  StoryComponentProps<typeof Calendar>,
  "isDisabled" | "isInvalid"
> {}
export const initialArgs: CalendarStoryProps = /* story-args:start */ {
  isDisabled: false,
  isInvalid: false,
}; /* story-args:end */

// Copyright NextUI Inc. Apache-2.0.
import { Calendar } from "@lenso/ui";

export function Basic(overrides: CalendarStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <Calendar aria-label="Event date" {...args}>
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
  );
}
