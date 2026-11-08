"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface DateRangePickerStoryProps extends Pick<
  StoryComponentProps<typeof DateRangePicker>,
  | "disabled"
  | "required"
  | "readOnly"
  | "defaultOpen"
  | "hourCycle"
  | "isInvalid"
  | "hideTimeZone"
  | "shouldForceLeadingZeros"
> {}
export const initialArgs: DateRangePickerStoryProps = /* story-args:start */ {
  disabled: false,
  required: false,
  readOnly: false,
  defaultOpen: false,
  hourCycle: 12,
  isInvalid: false,
  hideTimeZone: false,
  shouldForceLeadingZeros: false,
}; /* story-args:end */

// Copyright NextUI Inc. Apache-2.0. Local RAC label and StyleX replace source Label and utility classes.
import { DateField, DateRangePicker, RangeCalendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ field: { width: 320 } });
export function Basic(overrides: DateRangePickerStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <DateRangePicker xstyle={styles.field} endName="endDate" startName="startDate" {...args}>
      <DateRangePicker.Label>Trip dates</DateRangePicker.Label>
      <DateField.Group fullWidth>
        <DateField.Input slot="start">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateRangePicker.RangeSeparator />
        <DateField.Input slot="end">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DateRangePicker.Trigger>
            <DateRangePicker.TriggerIndicator />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DateRangePicker.Popover>
        <RangeCalendar aria-label="Trip dates">
          <RangeCalendar.Header>
            <RangeCalendar.YearPickerTrigger>
              <RangeCalendar.YearPickerTriggerHeading />
              <RangeCalendar.YearPickerTriggerIndicator />
            </RangeCalendar.YearPickerTrigger>
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
          <RangeCalendar.YearPickerGrid>
            <RangeCalendar.YearPickerGridBody>
              {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
            </RangeCalendar.YearPickerGridBody>
          </RangeCalendar.YearPickerGrid>
        </RangeCalendar>
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}
