"use client";

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function Required() {
  return (
    <div {...stylex.props(styles.column)}>
      <DateField isRequired xstyle={styles.field} name="date">
        <DateField.Label>日期</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <DateField isRequired xstyle={styles.field} name="start-date">
        <DateField.Label>开始日期</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>必填项</DateField.Description>
      </DateField>
    </div>
  );
}
