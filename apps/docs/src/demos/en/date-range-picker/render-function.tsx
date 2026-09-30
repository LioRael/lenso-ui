"use client";
/** Adapted from HeroUI v3.2.6 render-function.json. Copyright NextUI Inc. Apache-2.0. RAC 1.21 owns the native DOM render contract. */
import { DateRangePicker } from "@lenso/ui";
import { PickerCalendar, RangeInput, styles } from "./parts";

export function RenderFunction() {
  return (
    <DateRangePicker
      xstyle={styles.field}
      startName="startDate"
      endName="endDate"
      render={(props) => <div data-custom="foo" {...props} />}
    >
      <DateRangePicker.Label>Trip dates</DateRangePicker.Label>
      <RangeInput />
      <DateRangePicker.Popover>
        <PickerCalendar />
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}
