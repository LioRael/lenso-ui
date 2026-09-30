"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../date-field/demo-styles";

export function Required() {
  return (
    <div {...stylex.props(styles.column)}>
      <TimeField isRequired xstyle={styles.field} name="time">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
      </TimeField>
      <TimeField isRequired xstyle={styles.field} name="appointment-time">
        <TimeField.Label>Appointment time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>Required field</TimeField.Description>
      </TimeField>
    </div>
  );
}
