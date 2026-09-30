"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./demo-styles";

export function Required() {
  return (
    <div {...stylex.props(styles.column)}>
      <DateField isRequired xstyle={styles.field} name="date">
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <DateField isRequired xstyle={styles.field} name="start-date">
        <DateField.Label>Start date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>Required field</DateField.Description>
      </DateField>
    </div>
  );
}
