"use client";

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function Required() {
  return (
    <div {...stylex.props(styles.column)}>
      <TimeField isRequired xstyle={styles.field} name="time">
        <TimeField.Label>时间</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
      </TimeField>
      <TimeField isRequired xstyle={styles.field} name="appointment-time">
        <TimeField.Label>预约时间</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>必填项</TimeField.Description>
      </TimeField>
    </div>
  );
}
