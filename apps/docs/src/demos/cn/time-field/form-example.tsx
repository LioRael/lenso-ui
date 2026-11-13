"use client";
import { usePlaygroundLog } from "../../shared/playground-log";

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { Time } from "@internationalized/date";
import { Clock } from "@gravity-ui/icons";
import { Button, TimeField } from "@lenso/ui";
import { Form } from "@lenso/ui";
import { parseTime } from "@internationalized/date";
import { useState, type FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function FormExample() {
  const log = usePlaygroundLog();
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
      log("Time submitted:", {
        time: value,
      });
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
        <TimeField.Label>预约时间</TimeField.Label>
        <TimeField.Group>
          <TimeField.Prefix>
            <Clock {...stylex.props(styles.icon)} aria-hidden="true" />
          </TimeField.Prefix>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        {isInvalid ? (
          <TimeField.Error>时间须在上午 9:00 至下午 5:00 之间</TimeField.Error>
        ) : (
          <TimeField.Description>输入上午 9:00 至下午 5:00 之间的时间</TimeField.Description>
        )}
      </TimeField>
      <Button
        xstyle={styles.full}
        disabled={!value || isInvalid}
        isLoading={isSubmitting}
        type="submit"
        variant="prominent"
      >
        {isSubmitting ? "提交中…" : "提交"}
      </Button>
    </Form>
  );
}
