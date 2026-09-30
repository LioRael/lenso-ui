"use client";
/** Adapted from HeroUI v3.2.6 render-function.json. Copyright NextUI Inc. Apache-2.0. RAC 1.21 native DOM render functions preserve props, refs and input semantics. */
import { DateField, DatePicker } from "@lenso/ui";
import { PickerCalendar, styles } from "./parts";

export function RenderFunction() {
  return (
    <DatePicker
      xstyle={styles.field}
      name="date"
      render={(props) => <div {...props} data-custom="date-picker" />}
    >
      <DatePicker.Label render={(props) => <span {...props} data-custom="date-picker-label" />}>
        Date
      </DatePicker.Label>
      <DateField.Group
        fullWidth
        render={(props) => <div {...props} data-custom="date-field-group" />}
      >
        <DateField.Input render={(props) => <div {...props} data-custom="date-field-input" />}>
          {(segment) => (
            <DateField.Segment
              render={(props) => <span {...props} data-custom="date-field-segment" />}
              segment={segment}
            />
          )}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger
            render={(props) => <button {...props} data-custom="date-picker-trigger" />}
          >
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <PickerCalendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
