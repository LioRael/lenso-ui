/**
 * Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 * Native Lenso RAC supporting parts; ordinary actions and selection use Base UI.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DateValue } from "react-aria-components/Calendar";
import React, { useState } from "react";
import { getLocalTimeZone, parseDate, parseZonedDateTime, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { Button, DateField, Select, Tooltip } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import {
  DateTimeStoryIcon,
  dateTimeStoryLocale,
  dateTimeStorySubmission,
} from "./date-time-story.fixtures";
import { dateTimeStoryStyles as s } from "./date-time-story.stylex";

const meta: Meta<typeof DateField> = {
  component: DateField,
  parameters: { layout: "centered" },
  decorators: [dateTimeStoryLocale],
  tags: ["autodocs"],
  title: "Components/Date and Time/DateField",
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DateField xstyle={s.width256} name="date">
      <DateField.Label>Date</DateField.Label>
      <DateField.Group>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField.Group>
    </DateField>
  ),
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(s.column4)}>
      <DateField xstyle={s.width256} name="primary-date">
        <DateField.Label>Primary variant</DateField.Label>
        <DateField.Group variant="primary">
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <DateField xstyle={s.width256} name="secondary-date">
        <DateField.Label>Secondary variant</DateField.Label>
        <DateField.Group variant="secondary">
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
    </div>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(s.width400, s.column4)}>
      <DateField fullWidth name="date">
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <DateField fullWidth name="date-icons">
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Prefix>
            <DateTimeStoryIcon name="calendar" />
          </DateField.Prefix>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <DateTimeStoryIcon name="chevron-down" />
          </DateField.Suffix>
        </DateField.Group>
      </DateField>
    </div>
  ),
};
export const WithDescription: Story = {
  render: () => (
    <div {...stylex.props(s.column4)}>
      <DateField xstyle={s.width256} name="date">
        <DateField.Label>Birth date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>Enter your date of birth</DateField.Description>
      </DateField>
      <DateField xstyle={s.width256} name="appointment-date">
        <DateField.Label>Appointment date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>Enter a date for your appointment</DateField.Description>
      </DateField>
    </div>
  ),
};
export const Required: Story = {
  render: () => (
    <div {...stylex.props(s.column4)}>
      <DateField isRequired xstyle={s.width256} name="date">
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <DateField isRequired xstyle={s.width256} name="start-date">
        <DateField.Label>Start date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>Required field</DateField.Description>
      </DateField>
    </div>
  ),
};
export const Invalid: Story = {
  render: () => (
    <div {...stylex.props(s.column4)}>
      <DateField isInvalid isRequired xstyle={s.width256} name="date">
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Error>Please enter a valid date</DateField.Error>
      </DateField>
      <DateField isInvalid xstyle={s.width256} name="invalid-date">
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Error>Date must be in the future</DateField.Error>
      </DateField>
    </div>
  ),
};
export const Disabled: Story = {
  render: () => (
    <div {...stylex.props(s.column4)}>
      <DateField isDisabled xstyle={s.width256} name="date" value={today(getLocalTimeZone())}>
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>This date field is disabled</DateField.Description>
      </DateField>
      <DateField isDisabled xstyle={s.width256} name="date-empty">
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>This date field is disabled</DateField.Description>
      </DateField>
    </div>
  ),
};
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<DateValue | null>(null);
    return (
      <div {...stylex.props(s.column4)}>
        <DateField xstyle={s.width256} name="date" value={value} onChange={setValue}>
          <DateField.Label>Date</DateField.Label>
          <DateField.Group>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
          </DateField.Group>
          <DateField.Description>
            Current value: {value ? value.toString() : "(empty)"}
          </DateField.Description>
        </DateField>
        <div {...stylex.props(s.row2)}>
          <Button variant="tertiary" onClick={() => setValue(today(getLocalTimeZone()))}>
            Set today
          </Button>
          <Button variant="tertiary" onClick={() => setValue(null)}>
            Clear
          </Button>
        </div>
      </div>
    );
  },
};
export const WithValidation: Story = {
  render: () => {
    const [value, setValue] = useState<DateValue | null>(null);
    const todayDate = today(getLocalTimeZone());
    const isInvalid = value !== null && value.compare(todayDate) < 0;
    return (
      <div {...stylex.props(s.column4)}>
        <DateField
          isRequired
          xstyle={s.width256}
          isInvalid={isInvalid}
          minValue={todayDate}
          name="date"
          value={value}
          onChange={setValue}
        >
          <DateField.Label>Date</DateField.Label>
          <DateField.Group>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
          </DateField.Group>
          {isInvalid ? (
            <DateField.Error>Date must be today or in the future</DateField.Error>
          ) : (
            <DateField.Description>Enter a date from today onwards</DateField.Description>
          )}
        </DateField>
      </div>
    );
  },
};
export const WithPrefixIcon: Story = {
  render: () => (
    <DateField xstyle={s.width256} name="date">
      <DateField.Label>Date</DateField.Label>
      <DateField.Group>
        <DateField.Prefix>
          <DateTimeStoryIcon name="calendar" />
        </DateField.Prefix>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField.Group>
    </DateField>
  ),
};
export const WithSuffixIcon: Story = {
  render: () => (
    <DateField xstyle={s.width256} name="date">
      <DateField.Label>Date</DateField.Label>
      <DateField.Group>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DateTimeStoryIcon name="calendar" />
        </DateField.Suffix>
      </DateField.Group>
    </DateField>
  ),
};
export const WithPrefixAndSuffix: Story = {
  render: () => (
    <DateField xstyle={s.width256} name="date">
      <DateField.Label>Date</DateField.Label>
      <DateField.Group>
        <DateField.Prefix>
          <DateTimeStoryIcon name="calendar" />
        </DateField.Prefix>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DateTimeStoryIcon name="chevron-down" />
        </DateField.Suffix>
      </DateField.Group>
      <DateField.Description>Enter a date</DateField.Description>
    </DateField>
  ),
};
export const FormExample: Story = {
  render: () => {
    const [value, setValue] = useState<DateValue | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const todayDate = today(getLocalTimeZone());
    const isInvalid = value !== null && value.compare(todayDate) < 0;
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!value || isInvalid) return;
      dateTimeStorySubmission(event);
      setIsSubmitting(true);
      setTimeout(() => {
        setValue(null);
        setIsSubmitting(false);
      }, 1500);
    };
    return (
      <form {...stylex.props(s.width280, s.column4)} onSubmit={handleSubmit}>
        <DateField
          isRequired
          xstyle={s.full}
          isInvalid={isInvalid}
          minValue={todayDate}
          name="date"
          value={value}
          onChange={setValue}
        >
          <DateField.Label>Appointment date</DateField.Label>
          <DateField.Group>
            <DateField.Prefix>
              <DateTimeStoryIcon name="calendar" />
            </DateField.Prefix>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
          </DateField.Group>
          {isInvalid ? (
            <DateField.Error>Date must be today or in the future</DateField.Error>
          ) : (
            <DateField.Description>Enter a date from today onwards</DateField.Description>
          )}
        </DateField>
        <Button
          xstyle={s.full}
          disabled={!value || isInvalid}
          isLoading={isSubmitting}
          type="submit"
          variant="primary"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    );
  },
};
export const Granularity: Story = {
  render: () => {
    const granularityOptions = [
      { id: "day", label: "Day" },
      { id: "hour", label: "Hour" },
      { id: "minute", label: "Minute" },
      { id: "second", label: "Second" },
    ] as const;
    const [granularity, setGranularity] = useState<"day" | "hour" | "minute" | "second">("day");
    const defaultValue: DateValue =
      granularity === "day"
        ? parseDate("2025-02-03")
        : parseZonedDateTime("2025-02-03T08:45:00[America/Los_Angeles]");
    return (
      <div {...stylex.props(s.row4)}>
        <DateField
          key={granularity}
          xstyle={s.width256}
          defaultValue={defaultValue}
          granularity={granularity}
          name="granularity-date"
        >
          <DateField.Label>Appointment Date</DateField.Label>
          <DateField.Group>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
          </DateField.Group>
        </DateField>
        <div {...stylex.props(s.column1)}>
          <div {...stylex.props(s.center2)}>
            <span id="date-time-story-granularity-label" {...stylex.props(labelStyles.label)}>
              Granularity
            </span>
            <Tooltip>
              <Tooltip.Trigger delay={0} aria-label="Granularity information">
                <DateTimeStoryIcon name="circle-question" />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner side="bottom" align="start">
                  <Tooltip.Popup>
                    <p>
                      Determines the smallest unit displayed in the date picker. By default, this is
                      "day" for dates, and "minute" for times.
                    </p>
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip>
          </div>
          <Select
            items={granularityOptions.map((option) => ({ value: option.id, label: option.label }))}
            value={granularity}
            variant="secondary"
            onValueChange={(value) => {
              if (value) setGranularity(value);
            }}
          >
            <Select.Trigger aria-labelledby="date-time-story-granularity-label" xstyle={s.width110}>
              <Select.Value placeholder="Select granularity" />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popover>
                  <Select.List>
                    {granularityOptions.map((option) => (
                      <Select.Item key={option.id} value={option.id}>
                        <Select.ItemText>{option.label}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popover>
              </Select.Positioner>
            </Select.Portal>
          </Select>
        </div>
      </div>
    );
  },
};
export const AllVariations: Story = {
  render: () => (
    <div {...stylex.props(s.column6)}>
      <div {...stylex.props(s.column4)}>
        <DateField isRequired xstyle={s.width256} name="date1">
          <DateField.Label>Date</DateField.Label>
          <DateField.Group>
            <DateField.Prefix>
              <DateTimeStoryIcon name="calendar" />
            </DateField.Prefix>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
          </DateField.Group>
          <DateField.Description>Enter a date</DateField.Description>
        </DateField>
        <DateField isRequired xstyle={s.width256} name="date2">
          <DateField.Label>Date</DateField.Label>
          <DateField.Group>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
            <DateField.Suffix>
              <DateTimeStoryIcon name="calendar" />
            </DateField.Suffix>
          </DateField.Group>
          <DateField.Description>Enter a date</DateField.Description>
        </DateField>
        <DateField isRequired xstyle={s.width256} name="date3">
          <DateField.Label>Date</DateField.Label>
          <DateField.Group>
            <DateField.Prefix>
              <DateTimeStoryIcon name="calendar" />
            </DateField.Prefix>
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
            <DateField.Suffix>
              <DateTimeStoryIcon name="chevron-down" />
            </DateField.Suffix>
          </DateField.Group>
          <DateField.Description>Enter a date</DateField.Description>
        </DateField>
      </div>
    </div>
  ),
};
