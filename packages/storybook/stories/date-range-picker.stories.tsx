/**
 * Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DateValue } from "react-aria-components/Calendar";
import React, { useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { Button, DateField, DateRangePicker, RangeCalendar } from "@lenso/ui";
import {
  DateTimeStoryIcon,
  DateTimeStoryValue,
  dateTimeStoryLocale,
  dateTimeStorySubmission,
} from "./date-time-story.fixtures";
import { dateTimeStoryStyles as s } from "./date-time-story.stylex";

const meta: Meta<typeof DateRangePicker> = {
  component: DateRangePicker,
  parameters: { layout: "centered" },
  decorators: [dateTimeStoryLocale],
  tags: ["autodocs"],
  title: "Components/Date and Time/DateRangePicker",
};
export default meta;
type Story = StoryObj<typeof meta>;
type DateRange = { start: DateValue; end: DateValue };

const RangeCalendarContent = () => (
  <RangeCalendar aria-label="Selected range">
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
);
const DateRangePickerField = ({ showDescription = false }: { showDescription?: boolean }) => (
  <>
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
    {showDescription ? (
      <DateRangePicker.Description>
        Select your check-in and check-out dates.
      </DateRangePicker.Description>
    ) : null}
    <DateRangePicker.Popover>
      <DateRangePicker.Dialog aria-label="Choose trip dates">
        <RangeCalendarContent />
      </DateRangePicker.Dialog>
    </DateRangePicker.Popover>
  </>
);
export const Default: Story = {
  render: () => (
    <DateRangePicker xstyle={s.width320} endName="endDate" startName="startDate">
      <DateRangePickerField />
    </DateRangePicker>
  ),
};
export const Controlled: Story = {
  render: () => {
    const start = today(getLocalTimeZone());
    const [value, setValue] = useState<DateRange | null>({ end: start.add({ days: 4 }), start });
    return (
      <div {...stylex.props(s.width320, s.column2)}>
        <DateRangePicker endName="endDate" startName="startDate" value={value} onChange={setValue}>
          <DateRangePickerField showDescription />
        </DateRangePicker>
        <DateTimeStoryValue>
          Current value:{" "}
          {value ? `${value.start.toString()} -> ${value.end.toString()}` : "(empty)"}
        </DateTimeStoryValue>
      </div>
    );
  },
};
export const Disabled: Story = {
  render: () => {
    const start = today(getLocalTimeZone());
    return (
      <DateRangePicker
        isDisabled
        xstyle={s.width320}
        endName="endDate"
        startName="startDate"
        value={{ end: start.add({ days: 4 }), start }}
      >
        <DateRangePickerField />
      </DateRangePicker>
    );
  },
};
export const WithValidation: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange | null>(null);
    const currentDate = today(getLocalTimeZone());
    const isInvalid =
      value != null && (value.start.compare(currentDate) < 0 || value.end.compare(value.start) < 0);
    return (
      <DateRangePicker
        isRequired
        xstyle={s.width320}
        endName="endDate"
        isInvalid={isInvalid}
        minValue={currentDate}
        startName="startDate"
        value={value}
        onChange={setValue}
      >
        <DateRangePicker.Label>Booking period</DateRangePicker.Label>
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
        {isInvalid ? (
          <DateRangePicker.Error>
            Select a valid range starting today or later.
          </DateRangePicker.Error>
        ) : (
          <DateRangePicker.Description>
            Choose a check-in and check-out date.
          </DateRangePicker.Description>
        )}
        <DateRangePicker.Popover>
          <DateRangePicker.Dialog aria-label="Choose booking period">
            <RangeCalendarContent />
          </DateRangePicker.Dialog>
        </DateRangePicker.Popover>
      </DateRangePicker>
    );
  },
};
export const WithCustomIndicator: Story = {
  render: () => (
    <DateRangePicker xstyle={s.width320} endName="endDate" startName="startDate">
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
            <DateRangePicker.TriggerIndicator>
              <DateTimeStoryIcon name="chevron-down" muted={false} />
            </DateRangePicker.TriggerIndicator>
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DateRangePicker.Description>
        Use a custom trigger icon while preserving DateRangePicker behavior.
      </DateRangePicker.Description>
      <DateRangePicker.Popover>
        <DateRangePicker.Dialog aria-label="Choose trip dates">
          <RangeCalendarContent />
        </DateRangePicker.Dialog>
      </DateRangePicker.Popover>
    </DateRangePicker>
  ),
};
export const FormExample: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentDate = today(getLocalTimeZone());
    const isInvalid =
      value != null && (value.start.compare(currentDate) < 0 || value.end.compare(value.start) < 0);
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
      <form {...stylex.props(s.width320, s.column3)} onSubmit={handleSubmit}>
        <DateRangePicker
          isRequired
          endName="tripEndDate"
          isInvalid={isInvalid}
          minValue={currentDate}
          startName="tripStartDate"
          value={value}
          onChange={setValue}
        >
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
          {isInvalid ? (
            <DateRangePicker.Error>
              Please choose a valid range in the future.
            </DateRangePicker.Error>
          ) : (
            <DateRangePicker.Description>
              Select your check-in and check-out dates.
            </DateRangePicker.Description>
          )}
          <DateRangePicker.Popover>
            <DateRangePicker.Dialog aria-label="Choose trip dates">
              <RangeCalendarContent />
            </DateRangePicker.Dialog>
          </DateRangePicker.Popover>
        </DateRangePicker>
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
