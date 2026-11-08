"use client";

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function WithDescription() {
  return (
    <div {...stylex.props(styles.column)}>
      <DateField xstyle={styles.field} name="date">
        <DateField.Label>出生日期</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>输入出生日期</DateField.Description>
      </DateField>
      <DateField xstyle={styles.field} name="appointment-date">
        <DateField.Label>预约日期</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>输入预约日期</DateField.Description>
      </DateField>
    </div>
  );
}
