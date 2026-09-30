"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../date-field/demo-styles";

export function Invalid() {
  return (
    <div {...stylex.props(styles.column)}>
      <TimeField isInvalid isRequired xstyle={styles.field} name="time">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Error>Please enter a valid time</TimeField.Error>
      </TimeField>
      <TimeField isInvalid xstyle={styles.field} name="invalid-time">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Error>Time must be within business hours</TimeField.Error>
      </TimeField>
    </div>
  );
}
