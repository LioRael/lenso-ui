"use client";
/** Adapted from the pinned HeroUI v3.2.6 date-range-picker examples. Copyright NextUI Inc. Apache-2.0. */
import { Button, DateRangePicker, Form } from "@lenso/ui";
import { Icon } from "@iconify/react";
import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";
import { I18nProvider } from "react-aria-components/I18nProvider";
import { useState, type FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles as sharedStyles } from "../date-picker/parts";
import { PickerCalendar, RangeInput, styles } from "./parts";
type DateRange = { start: DateValue; end: DateValue };

export function InternationalCalendar() {
  const start = today(getLocalTimeZone());
  return (
    <I18nProvider locale="hi-IN-u-ca-indian">
      <DateRangePicker
        xstyle={styles.field}
        defaultValue={{ start, end: start.add({ days: 7 }) }}
        startName="startDate"
        endName="endDate"
      >
        <DateRangePicker.Label>Trip dates</DateRangePicker.Label>
        <RangeInput />
        <DateRangePicker.Popover>
          <PickerCalendar />
        </DateRangePicker.Popover>
      </DateRangePicker>
    </I18nProvider>
  );
}
export function Disabled() {
  const start = today(getLocalTimeZone());
  return (
    <DateRangePicker
      isDisabled
      xstyle={styles.field}
      startName="startDate"
      endName="endDate"
      value={{ start, end: start.add({ days: 4 }) }}
    >
      <DateRangePicker.Label>Trip dates</DateRangePicker.Label>
      <RangeInput />
      <DateRangePicker.Description>This date range picker is disabled.</DateRangePicker.Description>
      <DateRangePicker.Popover>
        <PickerCalendar />
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}
export function WithCustomIndicator() {
  return (
    <DateRangePicker xstyle={styles.field} startName="startDate" endName="endDate">
      <DateRangePicker.Label>Trip dates</DateRangePicker.Label>
      <RangeInput
        indicator={<Icon {...stylex.props(sharedStyles.icon)} icon="gravity-ui:chevron-down" />}
      />
      <DateRangePicker.Description>
        Replace the default calendar icon by passing custom children.
      </DateRangePicker.Description>
      <DateRangePicker.Popover>
        <PickerCalendar />
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}
export function CustomStyles() {
  return (
    <DateRangePicker xstyle={styles.field} startName="checkin" endName="checkout">
      <DateRangePicker.Label>Stay dates</DateRangePicker.Label>
      <RangeInput custom />
      <DateRangePicker.Popover xstyle={sharedStyles.popover}>
        <PickerCalendar custom label="Stay dates" />
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}
export function Controlled() {
  const start = today(getLocalTimeZone());
  const [value, setValue] = useState<DateRange | null>({ start, end: start.add({ days: 4 }) });
  return (
    <div {...stylex.props(styles.stack)}>
      <DateRangePicker startName="startDate" endName="endDate" value={value} onChange={setValue}>
        <DateRangePicker.Label>Trip dates</DateRangePicker.Label>
        <RangeInput />
        <DateRangePicker.Popover>
          <PickerCalendar />
        </DateRangePicker.Popover>
      </DateRangePicker>
      <p {...stylex.props(sharedStyles.description)}>
        Current value: {value ? `${value.start.toString()} -> ${value.end.toString()}` : "(empty)"}
      </p>
      <div {...stylex.props(sharedStyles.actions)}>
        <Button
          variant="tertiary"
          onClick={() => {
            const nextStart = today(getLocalTimeZone());
            setValue({ start: nextStart, end: nextStart.add({ days: 6 }) });
          }}
        >
          Set week
        </Button>
        <Button variant="tertiary" onClick={() => setValue(null)}>
          Clear
        </Button>
      </div>
    </div>
  );
}
export function WithValidation() {
  const [value, setValue] = useState<DateRange | null>(null);
  const currentDate = today(getLocalTimeZone());
  const isInvalid =
    value != null && (value.start.compare(currentDate) < 0 || value.end.compare(value.start) < 0);
  return (
    <DateRangePicker
      isRequired
      xstyle={styles.field}
      isInvalid={isInvalid}
      minValue={currentDate}
      startName="startDate"
      endName="endDate"
      value={value}
      onChange={setValue}
    >
      <DateRangePicker.Label>Booking period</DateRangePicker.Label>
      <RangeInput />
      <DateRangePicker.Error>Select a valid range starting today or later.</DateRangePicker.Error>
      <DateRangePicker.Popover>
        <PickerCalendar label="Booking period" />
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}
export function FormExample() {
  const [value, setValue] = useState<DateRange | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentDate = today(getLocalTimeZone());
  const isInvalid =
    value != null && (value.start.compare(currentDate) < 0 || value.end.compare(value.start) < 0);
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!value || isInvalid) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setValue(null);
      setIsSubmitting(false);
    }, 1200);
  };
  return (
    <Form xstyle={styles.form} onSubmit={handleSubmit}>
      <DateRangePicker
        isRequired
        isInvalid={isInvalid}
        minValue={currentDate}
        startName="tripStartDate"
        endName="tripEndDate"
        value={value}
        onChange={setValue}
      >
        <DateRangePicker.Label>Trip dates</DateRangePicker.Label>
        <RangeInput />
        {isInvalid ? (
          <DateRangePicker.Error>Please choose a valid range in the future.</DateRangePicker.Error>
        ) : (
          <DateRangePicker.Description>
            Select your check-in and check-out dates.
          </DateRangePicker.Description>
        )}
        <DateRangePicker.Popover>
          <PickerCalendar />
        </DateRangePicker.Popover>
      </DateRangePicker>
      <Button
        xstyle={sharedStyles.full}
        disabled={!value || isInvalid}
        isLoading={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </Form>
  );
}
