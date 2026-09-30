"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { Calendar } from "@gravity-ui/icons";
import { DateField, Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./demo-styles";

export function OnSurface() {
  return (
    <Surface xstyle={styles.surface}>
      <DateField xstyle={styles.full} name="date">
        <DateField.Label>Date</DateField.Label>
        <DateField.Group variant="secondary">
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>Enter a date</DateField.Description>
      </DateField>
      <DateField xstyle={styles.full} name="date-2">
        <DateField.Label>Appointment date</DateField.Label>
        <DateField.Group variant="secondary">
          <DateField.Prefix>
            <Calendar {...stylex.props(styles.icon)} aria-hidden="true" />
          </DateField.Prefix>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>Enter a date for your appointment</DateField.Description>
      </DateField>
    </Surface>
  );
}
