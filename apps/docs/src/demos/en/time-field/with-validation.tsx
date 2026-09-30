"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { Time } from "@internationalized/date";
import { TimeField } from "@lenso/ui";
import { parseTime } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../date-field/demo-styles";

export function WithValidation() {
  const [value, setValue] = useState<Time | null>(null);
  const minTime = parseTime("09:00");
  const maxTime = parseTime("17:00");
  const isInvalid = value !== null && (value.compare(minTime) < 0 || value.compare(maxTime) > 0);
  return (
    <div {...stylex.props(styles.column)}>
      <TimeField
        isRequired
        xstyle={styles.field}
        isInvalid={isInvalid}
        maxValue={maxTime}
        minValue={minTime}
        name="time"
        value={value}
        onChange={setValue}
      >
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        {isInvalid ? (
          <TimeField.Error>Time must be between 9:00 AM and 5:00 PM</TimeField.Error>
        ) : (
          <TimeField.Description>Enter a time between 9:00 AM and 5:00 PM</TimeField.Description>
        )}
      </TimeField>
    </div>
  );
}
