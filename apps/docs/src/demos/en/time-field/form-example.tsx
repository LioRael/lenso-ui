"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { Time } from "@internationalized/date";
import { Clock } from "@gravity-ui/icons";
import { Button, TimeField } from "@lenso/ui";
import { Form } from "react-aria-components/Form";
import { parseTime } from "@internationalized/date";
import { useState, type FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../date-field/demo-styles";

export function FormExample() {
  const [value, setValue] = useState<Time | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minTime = parseTime("09:00");
  const maxTime = parseTime("17:00");
  const isInvalid = value !== null && (value.compare(minTime) < 0 || value.compare(maxTime) > 0);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value || isInvalid || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("Time submitted:", { time: value });
      setValue(null);
      setIsSubmitting(false);
    }, 1500);
  };
  return (
    <Form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
      <TimeField
        isRequired
        xstyle={styles.full}
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
            <Clock {...stylex.props(styles.icon)} aria-hidden="true" />
          </TimeField.Prefix>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        {isInvalid ? (
          <TimeField.Error>Time must be between 9:00 AM and 5:00 PM</TimeField.Error>
        ) : (
          <TimeField.Description>Enter a time between 9:00 AM and 5:00 PM</TimeField.Description>
        )}
      </TimeField>
      <Button
        xstyle={styles.full}
        disabled={!value || isInvalid}
        isLoading={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </Form>
  );
}
