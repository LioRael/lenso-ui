"use client";

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function Invalid() {
  return (
    <div {...stylex.props(styles.column)}>
      <TimeField isInvalid isRequired xstyle={styles.field} name="time">
        <TimeField.Label>时间</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Error>请输入有效时间</TimeField.Error>
      </TimeField>
      <TimeField isInvalid xstyle={styles.field} name="invalid-time">
        <TimeField.Label>时间</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Error>时间须在工作时间内</TimeField.Error>
      </TimeField>
    </div>
  );
}
