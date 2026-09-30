"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../date-field/demo-styles";

export function WithDescription() {
  return (
    <div {...stylex.props(styles.column)}>
      <TimeField xstyle={styles.field} name="time">
        <TimeField.Label>Start time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>Enter the start time</TimeField.Description>
      </TimeField>
      <TimeField xstyle={styles.field} name="end-time">
        <TimeField.Label>End time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>Enter the end time</TimeField.Description>
      </TimeField>
    </div>
  );
}
