"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { Clock } from "@gravity-ui/icons";
import { Surface, TimeField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../date-field/demo-styles";

export function OnSurface() {
  return (
    <Surface xstyle={styles.surface}>
      <TimeField xstyle={styles.full} name="time">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group variant="secondary">
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>Enter a time</TimeField.Description>
      </TimeField>
      <TimeField xstyle={styles.full} name="time-2">
        <TimeField.Label>Appointment time</TimeField.Label>
        <TimeField.Group variant="secondary">
          <TimeField.Prefix>
            <Clock {...stylex.props(styles.icon)} aria-hidden="true" />
          </TimeField.Prefix>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>Enter a time for your appointment</TimeField.Description>
      </TimeField>
    </Surface>
  );
}
