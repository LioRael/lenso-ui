/**
 * Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TimeValue } from "react-aria-components/TimeField";
import React, { useState } from "react";
import { Time, getLocalTimeZone, now, parseTime } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { Button, TimeField } from "@lenso/ui";
import {
  DateTimeStoryIcon,
  dateTimeStoryLocale,
  dateTimeStorySubmission,
} from "./date-time-story.fixtures";
import { dateTimeStoryStyles as s } from "./date-time-story.stylex";

const meta: Meta<typeof TimeField> = {
  component: TimeField,
  parameters: { layout: "centered" },
  decorators: [dateTimeStoryLocale],
  tags: ["autodocs"],
  title: "Components/Date and Time/TimeField",
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TimeField xstyle={s.width256} name="time">
      <TimeField.Label>Time</TimeField.Label>
      <TimeField.Group>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
      </TimeField.Group>
    </TimeField>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(s.width400, s.column4)}>
      <TimeField fullWidth name="time">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group fullWidth>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
      </TimeField>
      <TimeField fullWidth name="time-icons">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group fullWidth>
          <TimeField.Prefix>
            <DateTimeStoryIcon name="clock" />
          </TimeField.Prefix>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
          <TimeField.Suffix>
            <DateTimeStoryIcon name="chevron-down" />
          </TimeField.Suffix>
        </TimeField.Group>
      </TimeField>
    </div>
  ),
};
export const WithDescription: Story = {
  render: () => (
    <div {...stylex.props(s.column4)}>
      <TimeField xstyle={s.width256} name="time">
        <TimeField.Label>Start time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>Enter the start time</TimeField.Description>
      </TimeField>
      <TimeField xstyle={s.width256} name="end-time">
        <TimeField.Label>End time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>Enter the end time</TimeField.Description>
      </TimeField>
    </div>
  ),
};
export const Required: Story = {
  render: () => (
    <div {...stylex.props(s.column4)}>
      <TimeField isRequired xstyle={s.width256} name="time">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
      </TimeField>
      <TimeField isRequired xstyle={s.width256} name="appointment-time">
        <TimeField.Label>Appointment time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>Required field</TimeField.Description>
      </TimeField>
    </div>
  ),
};
export const Invalid: Story = {
  render: () => (
    <div {...stylex.props(s.column4)}>
      <TimeField isInvalid isRequired xstyle={s.width256} name="time">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Error>Please enter a valid time</TimeField.Error>
      </TimeField>
      <TimeField isInvalid xstyle={s.width256} name="invalid-time">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Error>Time must be within business hours</TimeField.Error>
      </TimeField>
    </div>
  ),
};
export const Disabled: Story = {
  render: () => {
    const currentTime = now(getLocalTimeZone());
    const timeValue = new Time(currentTime.hour, currentTime.minute, currentTime.second);
    return (
      <div {...stylex.props(s.column4)}>
        <TimeField isDisabled xstyle={s.width256} name="time" value={timeValue}>
          <TimeField.Label>Time</TimeField.Label>
          <TimeField.Group>
            <TimeField.Input>
              {(segment) => <TimeField.Segment segment={segment} />}
            </TimeField.Input>
          </TimeField.Group>
          <TimeField.Description>This time field is disabled</TimeField.Description>
        </TimeField>
        <TimeField isDisabled xstyle={s.width256} name="time-empty">
          <TimeField.Label>Time</TimeField.Label>
          <TimeField.Group>
            <TimeField.Input>
              {(segment) => <TimeField.Segment segment={segment} />}
            </TimeField.Input>
          </TimeField.Group>
          <TimeField.Description>This time field is disabled</TimeField.Description>
        </TimeField>
      </div>
    );
  },
};
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<TimeValue | null>(null);
    return (
      <div {...stylex.props(s.column4)}>
        <TimeField xstyle={s.width256} name="time" value={value} onChange={setValue}>
          <TimeField.Label>Time</TimeField.Label>
          <TimeField.Group>
            <TimeField.Input>
              {(segment) => <TimeField.Segment segment={segment} />}
            </TimeField.Input>
          </TimeField.Group>
          <TimeField.Description>
            Current value: {value ? value.toString() : "(empty)"}
          </TimeField.Description>
        </TimeField>
        <div {...stylex.props(s.row2)}>
          <Button
            variant="tertiary"
            onClick={() => {
              const currentTime = now(getLocalTimeZone());
              setValue(new Time(currentTime.hour, currentTime.minute, currentTime.second));
            }}
          >
            Set now
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
    const [value, setValue] = useState<Time | null>(null);
    const minTime = parseTime("09:00");
    const maxTime = parseTime("17:00");
    const isInvalid = value !== null && (value.compare(minTime) < 0 || value.compare(maxTime) > 0);
    return (
      <div {...stylex.props(s.column4)}>
        <TimeField
          isRequired
          xstyle={s.width256}
          isInvalid={isInvalid}
          maxValue={maxTime}
          minValue={minTime}
          name="time"
          value={value}
          onChange={setValue}
        >
          <TimeField.Label>Time</TimeField.Label>
          <TimeField.Group>
            <TimeField.Input>
              {(segment) => <TimeField.Segment segment={segment} />}
            </TimeField.Input>
          </TimeField.Group>
          {isInvalid ? (
            <TimeField.Error>Time must be between 9:00 AM and 5:00 PM</TimeField.Error>
          ) : (
            <TimeField.Description>Enter a time between 9:00 AM and 5:00 PM</TimeField.Description>
          )}
        </TimeField>
      </div>
    );
  },
};
export const WithPrefixIcon: Story = {
  render: () => (
    <TimeField xstyle={s.width256} name="time">
      <TimeField.Label>Time</TimeField.Label>
      <TimeField.Group>
        <TimeField.Prefix>
          <DateTimeStoryIcon name="clock" />
        </TimeField.Prefix>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
      </TimeField.Group>
    </TimeField>
  ),
};
export const WithSuffixIcon: Story = {
  render: () => (
    <TimeField xstyle={s.width256} name="time">
      <TimeField.Label>Time</TimeField.Label>
      <TimeField.Group>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        <TimeField.Suffix>
          <DateTimeStoryIcon name="clock" />
        </TimeField.Suffix>
      </TimeField.Group>
    </TimeField>
  ),
};
export const WithPrefixAndSuffix: Story = {
  render: () => (
    <TimeField xstyle={s.width256} name="time">
      <TimeField.Label>Time</TimeField.Label>
      <TimeField.Group>
        <TimeField.Prefix>
          <DateTimeStoryIcon name="clock" />
        </TimeField.Prefix>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        <TimeField.Suffix>
          <DateTimeStoryIcon name="chevron-down" />
        </TimeField.Suffix>
      </TimeField.Group>
      <TimeField.Description>Enter a time</TimeField.Description>
    </TimeField>
  ),
};
export const FormExample: Story = {
  render: () => {
    const [value, setValue] = useState<Time | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const minTime = parseTime("09:00");
    const maxTime = parseTime("17:00");
    const isInvalid = value !== null && (value.compare(minTime) < 0 || value.compare(maxTime) > 0);
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
        <TimeField
          isRequired
          xstyle={s.full}
          isInvalid={isInvalid}
          maxValue={maxTime}
          minValue={minTime}
          name="time"
          value={value}
          onChange={setValue}
        >
          <TimeField.Label>Appointment time</TimeField.Label>
          <TimeField.Group>
            <TimeField.Prefix>
              <DateTimeStoryIcon name="clock" />
            </TimeField.Prefix>
            <TimeField.Input>
              {(segment) => <TimeField.Segment segment={segment} />}
            </TimeField.Input>
          </TimeField.Group>
          {isInvalid ? (
            <TimeField.Error>Time must be between 9:00 AM and 5:00 PM</TimeField.Error>
          ) : (
            <TimeField.Description>Enter a time between 9:00 AM and 5:00 PM</TimeField.Description>
          )}
        </TimeField>
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
export const AllVariations: Story = {
  render: () => (
    <div {...stylex.props(s.column6)}>
      <div {...stylex.props(s.column4)}>
        <TimeField isRequired xstyle={s.width256} name="time1">
          <TimeField.Label>Time</TimeField.Label>
          <TimeField.Group>
            <TimeField.Prefix>
              <DateTimeStoryIcon name="clock" />
            </TimeField.Prefix>
            <TimeField.Input>
              {(segment) => <TimeField.Segment segment={segment} />}
            </TimeField.Input>
          </TimeField.Group>
          <TimeField.Description>Enter a time</TimeField.Description>
        </TimeField>
        <TimeField isRequired xstyle={s.width256} name="time2">
          <TimeField.Label>Time</TimeField.Label>
          <TimeField.Group>
            <TimeField.Input>
              {(segment) => <TimeField.Segment segment={segment} />}
            </TimeField.Input>
            <TimeField.Suffix>
              <DateTimeStoryIcon name="clock" />
            </TimeField.Suffix>
          </TimeField.Group>
          <TimeField.Description>Enter a time</TimeField.Description>
        </TimeField>
        <TimeField isRequired xstyle={s.width256} name="time3">
          <TimeField.Label>Time</TimeField.Label>
          <TimeField.Group>
            <TimeField.Prefix>
              <DateTimeStoryIcon name="clock" />
            </TimeField.Prefix>
            <TimeField.Input>
              {(segment) => <TimeField.Segment segment={segment} />}
            </TimeField.Input>
            <TimeField.Suffix>
              <DateTimeStoryIcon name="chevron-down" />
            </TimeField.Suffix>
          </TimeField.Group>
          <TimeField.Description>Enter a time</TimeField.Description>
        </TimeField>
      </div>
    </div>
  ),
};
