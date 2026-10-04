// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6 render-function.json. Copyright NextUI Inc. Apache-2.0. RAC 1.21 owns the native DOM render contract. */
import { DateRangePicker } from "@lenso/ui";
import { PickerCalendar, RangeInput, styles } from "./render-function--parts";
export function RenderFunction() {
  return (
    <DateRangePicker
      xstyle={styles.field}
      startName="startDate"
      endName="endDate"
      render={(props) => <div data-custom="foo" {...props} />}
    >
      <DateRangePicker.Label>出行日期</DateRangePicker.Label>
      <RangeInput />
      <DateRangePicker.Popover>
        <PickerCalendar />
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}
