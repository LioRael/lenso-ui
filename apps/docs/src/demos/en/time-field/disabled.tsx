"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import { Time, getLocalTimeZone, now } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../date-field/demo-styles";

export function Disabled() {
  const currentTime = now(getLocalTimeZone());
  const timeValue = new Time(currentTime.hour, currentTime.minute, currentTime.second);
  return (
    <div {...stylex.props(styles.column)}>
      <TimeField isDisabled xstyle={styles.field} name="time" value={timeValue}>
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>This time field is disabled</TimeField.Description>
      </TimeField>
      <TimeField isDisabled xstyle={styles.field} name="time-empty">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>This time field is disabled</TimeField.Description>
      </TimeField>
    </div>
  );
}
