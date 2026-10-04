// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import { Time, getLocalTimeZone, now } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function Disabled() {
  const currentTime = now(getLocalTimeZone());
  const timeValue = new Time(currentTime.hour, currentTime.minute, currentTime.second);
  return (
    <div {...stylex.props(styles.column)}>
      <TimeField isDisabled xstyle={styles.field} name="time" value={timeValue}>
        <TimeField.Label>时间</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>此时间字段已禁用</TimeField.Description>
      </TimeField>
      <TimeField isDisabled xstyle={styles.field} name="time-empty">
        <TimeField.Label>时间</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>此时间字段已禁用</TimeField.Description>
      </TimeField>
    </div>
  );
}
