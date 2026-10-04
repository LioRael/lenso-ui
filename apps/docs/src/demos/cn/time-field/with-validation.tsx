// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { Time } from "@internationalized/date";
import { TimeField } from "@lenso/ui";
import { parseTime } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
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
        <TimeField.Label>时间</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        {isInvalid ? (
          <TimeField.Error>时间须在上午 9:00 至下午 5:00 之间</TimeField.Error>
        ) : (
          <TimeField.Description>输入上午 9:00 至下午 5:00 之间的时间</TimeField.Description>
        )}
      </TimeField>
    </div>
  );
}
