"use client";
/** Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e. Copyright NextUI Inc. Apache-2.0. Local RAC compounds and StyleX replace source utility classes. */
import { DateField, DateRangePicker, RangeCalendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { styles as customStyles } from "../date-picker/parts";

export const styles = stylex.create({
  field: { width: 320 },
  calendarFill: { width: "100%" },
  stack: { display: "flex", flexDirection: "column", gap: 16, width: 320 },
  form: { display: "flex", flexDirection: "column", gap: 12, width: 320 },
});

export function RangeInput({
  custom = false,
  indicator,
  container = false,
}: {
  custom?: boolean;
  indicator?: ReactNode;
  container?: boolean;
}) {
  const inputs = (
    <>
      <DateField.Input slot="start">
        {(segment) => <DateField.Segment segment={segment} />}
      </DateField.Input>
      <DateRangePicker.RangeSeparator xstyle={custom && customStyles.muted} />
      <DateField.Input slot="end">
        {(segment) => <DateField.Segment segment={segment} />}
      </DateField.Input>
    </>
  );
  return (
    <DateField.Group
      fullWidth={!container}
      variant={custom ? "secondary" : "primary"}
      xstyle={custom && customStyles.group}
    >
      {container ? <DateField.InputContainer>{inputs}</DateField.InputContainer> : inputs}
      <DateField.Suffix>
        <DateRangePicker.Trigger xstyle={custom && customStyles.muted}>
          <DateRangePicker.TriggerIndicator>{indicator}</DateRangePicker.TriggerIndicator>
        </DateRangePicker.Trigger>
      </DateField.Suffix>
    </DateField.Group>
  );
}

export function PickerCalendar({
  custom = false,
  label = "Trip dates",
  fill = false,
}: {
  custom?: boolean;
  label?: string;
  fill?: boolean;
}) {
  return (
    <RangeCalendar
      aria-label={label}
      xstyle={[custom && customStyles.calendar, fill && styles.calendarFill]}
    >
      <RangeCalendar.Header>
        {custom ? (
          <RangeCalendar.Heading xstyle={customStyles.heading} />
        ) : (
          <RangeCalendar.YearPickerTrigger>
            <RangeCalendar.YearPickerTriggerHeading />
            <RangeCalendar.YearPickerTriggerIndicator />
          </RangeCalendar.YearPickerTrigger>
        )}
        <RangeCalendar.NavButton slot="previous" xstyle={custom && customStyles.nav} />
        <RangeCalendar.NavButton slot="next" xstyle={custom && customStyles.nav} />
      </RangeCalendar.Header>
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day) => (
            <RangeCalendar.HeaderCell xstyle={custom && customStyles.day}>
              {day}
            </RangeCalendar.HeaderCell>
          )}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date) => <RangeCalendar.Cell date={date} />}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
      {!custom && (
        <RangeCalendar.YearPickerGrid>
          <RangeCalendar.YearPickerGridBody>
            {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
          </RangeCalendar.YearPickerGridBody>
        </RangeCalendar.YearPickerGrid>
      )}
    </RangeCalendar>
  );
}
