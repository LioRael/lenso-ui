"use client";

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function Variants() {
  return (
    <div {...stylex.props(styles.column)}>
      <DateField xstyle={styles.field} name="primary-date">
        <DateField.Label>主要变体</DateField.Label>
        <DateField.Group variant="primary">
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <DateField xstyle={styles.field} name="secondary-date">
        <DateField.Label>次要变体</DateField.Label>
        <DateField.Group variant="secondary">
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
    </div>
  );
}
