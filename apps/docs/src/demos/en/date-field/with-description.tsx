"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./demo-styles";

export function WithDescription() {
  return (
    <div {...stylex.props(styles.column)}>
      <DateField xstyle={styles.field} name="date">
        <DateField.Label>Birth date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>Enter your date of birth</DateField.Description>
      </DateField>
      <DateField xstyle={styles.field} name="appointment-date">
        <DateField.Label>Appointment date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>Enter a date for your appointment</DateField.Description>
      </DateField>
    </div>
  );
}
