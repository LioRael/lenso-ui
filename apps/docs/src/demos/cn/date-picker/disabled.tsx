// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from the pinned HeroUI v3.2.6 date-picker examples. Copyright NextUI Inc. Apache-2.0. */
import { Button, DatePicker, Form } from "@lenso/ui";
import { Icon } from "@iconify/react";
import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";
import { I18nProvider } from "react-aria-components/I18nProvider";
import { useState, type FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { PickerCalendar, PickerInput, styles } from "./disabled--parts";
export function InternationalCalendar() {
  return (
    <I18nProvider locale="hi-IN-u-ca-indian">
      <DatePicker
        xstyle={styles.field}
        defaultValue={today(getLocalTimeZone())}
        name="international-date"
      >
        <DatePicker.Label>活动日期</DatePicker.Label>
        <PickerInput />
        <DatePicker.Popover>
          <PickerCalendar />
        </DatePicker.Popover>
      </DatePicker>
    </I18nProvider>
  );
}
export function Disabled() {
  return (
    <DatePicker isDisabled xstyle={styles.field} name="date" value={today(getLocalTimeZone())}>
      <DatePicker.Label>日期</DatePicker.Label>
      <PickerInput />
      <DatePicker.Description>该日期选择器已禁用。</DatePicker.Description>
      <DatePicker.Popover>
        <PickerCalendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
export function WithCustomIndicator() {
  return (
    <DatePicker xstyle={styles.field} name="date">
      <DatePicker.Label>日期</DatePicker.Label>
      <PickerInput
        indicator={<Icon {...stylex.props(styles.icon)} icon="gravity-ui:chevron-down" />}
      />
      <DatePicker.Description>
        Replace the default calendar icon by passing custom children.
      </DatePicker.Description>
      <DatePicker.Popover>
        <PickerCalendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
export function CustomStyles() {
  return (
    <DatePicker xstyle={styles.field} name="event-date">
      <DatePicker.Label>活动日期</DatePicker.Label>
      <PickerInput custom />
      <DatePicker.Popover xstyle={styles.popover}>
        <PickerCalendar custom />
      </DatePicker.Popover>
    </DatePicker>
  );
}
export function Controlled() {
  const [value, setValue] = useState<DateValue | null>(today(getLocalTimeZone()));
  return (
    <div {...stylex.props(styles.stack)}>
      <DatePicker name="date" value={value} onChange={setValue}>
        <DatePicker.Label>日期</DatePicker.Label>
        <PickerInput />
        <DatePicker.Popover>
          <PickerCalendar />
        </DatePicker.Popover>
      </DatePicker>
      <p {...stylex.props(styles.description)}>
        Current value: {value ? value.toString() : "(empty)"}
      </p>
      <div {...stylex.props(styles.actions)}>
        <Button variant="tertiary" onClick={() => setValue(today(getLocalTimeZone()))}>
          Set today
        </Button>
        <Button variant="tertiary" onClick={() => setValue(null)}>
          Clear
        </Button>
      </div>
    </div>
  );
}
export function WithValidation() {
  const [value, setValue] = useState<DateValue | null>(null);
  const currentDate = today(getLocalTimeZone());
  const isInvalid = value != null && value.compare(currentDate) < 0;
  return (
    <DatePicker
      isRequired
      xstyle={styles.field}
      isInvalid={isInvalid}
      minValue={currentDate}
      name="date"
      value={value}
      onChange={setValue}
    >
      <DatePicker.Label>Appointment date</DatePicker.Label>
      <PickerInput />
      <DatePicker.Error>Date must be today or in the future.</DatePicker.Error>
      <DatePicker.Popover>
        <PickerCalendar />
      </DatePicker.Popover>
    </DatePicker>
  );
}
export function FormExample() {
  const [value, setValue] = useState<DateValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentDate = today(getLocalTimeZone());
  const isInvalid = value != null && value.compare(currentDate) < 0;
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
      <DatePicker
        isRequired
        isInvalid={isInvalid}
        minValue={currentDate}
        name="appointmentDate"
        value={value}
        onChange={setValue}
      >
        <DatePicker.Label>Appointment date</DatePicker.Label>
        <PickerInput />
        {isInvalid ? (
          <DatePicker.Error>Date must be today or in the future.</DatePicker.Error>
        ) : (
          <DatePicker.Description>Choose a valid appointment date.</DatePicker.Description>
        )}
        <DatePicker.Popover>
          <PickerCalendar />
        </DatePicker.Popover>
      </DatePicker>
      <Button
        xstyle={styles.full}
        disabled={!value || isInvalid}
        isLoading={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </Form>
  );
}
