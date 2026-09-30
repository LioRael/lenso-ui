"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./demo-styles";

export function Invalid() {
  return (
    <div {...stylex.props(styles.column)}>
      <DateField isInvalid isRequired xstyle={styles.field} name="date">
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Error>Please enter a valid date</DateField.Error>
      </DateField>
      <DateField isInvalid xstyle={styles.field} name="invalid-date">
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Error>Date must be in the future</DateField.Error>
      </DateField>
    </div>
  );
}
