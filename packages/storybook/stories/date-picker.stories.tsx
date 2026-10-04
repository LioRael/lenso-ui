/**
 * Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DateValue } from "react-aria-components/Calendar";
import React, { useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { Button, Calendar, DateField, DatePicker } from "@lenso/ui";
import {
  DateTimeStoryIcon,
  DateTimeStoryValue,
  dateTimeStoryLocale,
  dateTimeStorySubmission,
} from "./date-time-story.fixtures";
import { dateTimeStoryStyles as s } from "./date-time-story.stylex";

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  parameters: { layout: "centered" },
  decorators: [dateTimeStoryLocale],
  tags: ["autodocs"],
  title: "Components/Date and Time/DatePicker",
};
export default meta;
type Story = StoryObj<typeof meta>;

const CalendarContent = () => (
  <Calendar aria-label="Selected date">
    <Calendar.Header>
      <Calendar.YearPickerTrigger>
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
const DatePickerField = ({ showDescription = false }: { showDescription?: boolean }) => (
  <>
    <DatePicker.Label>Date</DatePicker.Label>
    <DateField.Group fullWidth>
      <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      <DateField.Suffix>
        <DatePicker.Trigger>
          <DatePicker.TriggerIndicator />
        </DatePicker.Trigger>
      </DateField.Suffix>
    </DateField.Group>
    {showDescription ? (
      <DatePicker.Description>Select a date from the calendar.</DatePicker.Description>
    ) : null}
    <DatePicker.Popover>
      <DatePicker.Dialog aria-label="Choose date">
        <CalendarContent />
      </DatePicker.Dialog>
    </DatePicker.Popover>
  </>
);
export const Default: Story = {
  render: () => (
    <DatePicker xstyle={s.width280} name="date">
      <DatePickerField />
    </DatePicker>
  ),
};
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<DateValue | null>(today(getLocalTimeZone()));
    return (
      <div {...stylex.props(s.width256, s.column2)}>
        <DatePicker name="date" value={value} onChange={setValue}>
          <DatePickerField showDescription />
        </DatePicker>
        <DateTimeStoryValue>
          Current value: {value ? value.toString() : "(empty)"}
        </DateTimeStoryValue>
      </div>
    );
  },
};
export const Disabled: Story = {
  render: () => (
    <DatePicker isDisabled xstyle={s.width256} name="date" value={today(getLocalTimeZone())}>
      <DatePickerField />
    </DatePicker>
  ),
};
export const WithValidation: Story = {
  render: () => {
    const [value, setValue] = useState<DateValue | null>(null);
    const currentDate = today(getLocalTimeZone());
    const isInvalid = value != null && value.compare(currentDate) < 0;
    return (
      <DatePicker
        isRequired
        xstyle={s.width256}
        isInvalid={isInvalid}
        minValue={currentDate}
        name="date"
        value={value}
        onChange={setValue}
      >
        <DatePicker.Label>Appointment date</DatePicker.Label>
        <DateField.Group fullWidth>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        {isInvalid ? (
          <DatePicker.Error>Date must be today or in the future.</DatePicker.Error>
        ) : (
          <DatePicker.Description>Select a date from today onward.</DatePicker.Description>
        )}
        <DatePicker.Popover>
          <DatePicker.Dialog aria-label="Choose appointment date">
            <CalendarContent />
          </DatePicker.Dialog>
        </DatePicker.Popover>
      </DatePicker>
    );
  },
};
export const WithCustomIndicator: Story = {
  render: () => (
    <DatePicker xstyle={s.width256} name="date">
      <DatePicker.Label>Date</DatePicker.Label>
      <DateField.Group fullWidth>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator>
              <DateTimeStoryIcon name="chevron-down" muted={false} />
            </DatePicker.TriggerIndicator>
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Description>
        Use a custom trigger icon while keeping DatePicker behavior.
      </DatePicker.Description>
      <DatePicker.Popover>
        <DatePicker.Dialog aria-label="Choose date">
          <CalendarContent />
        </DatePicker.Dialog>
      </DatePicker.Popover>
    </DatePicker>
  ),
};
export const FormExample: Story = {
  render: () => {
    const [value, setValue] = useState<DateValue | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentDate = today(getLocalTimeZone());
    const isInvalid = value != null && value.compare(currentDate) < 0;
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!value || isInvalid) return;
      dateTimeStorySubmission(event);
      setIsSubmitting(true);
      setTimeout(() => {
        setValue(null);
        setIsSubmitting(false);
      }, 1200);
    };
    return (
      <form {...stylex.props(s.width256, s.column3)} onSubmit={handleSubmit}>
        <DatePicker
          isRequired
          isInvalid={isInvalid}
          minValue={currentDate}
          name="appointmentDate"
          value={value}
          onChange={setValue}
        >
          <DatePicker.Label>Appointment date</DatePicker.Label>
          <DateField.Group fullWidth>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger>
                <DatePicker.TriggerIndicator />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          {isInvalid ? (
            <DatePicker.Error>Date must be today or in the future.</DatePicker.Error>
          ) : (
            <DatePicker.Description>Choose a valid appointment date.</DatePicker.Description>
          )}
          <DatePicker.Popover>
            <DatePicker.Dialog aria-label="Choose appointment date">
              <CalendarContent />
            </DatePicker.Dialog>
          </DatePicker.Popover>
        </DatePicker>
        <Button
          xstyle={s.full}
          disabled={!value || isInvalid}
          isLoading={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    );
  },
};
