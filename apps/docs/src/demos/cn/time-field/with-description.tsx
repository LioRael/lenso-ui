"use client";

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function WithDescription() {
  return (
    <div {...stylex.props(styles.column)}>
      <TimeField xstyle={styles.field} name="time">
        <TimeField.Label>开始时间</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>输入开始时间</TimeField.Description>
      </TimeField>
      <TimeField xstyle={styles.field} name="end-time">
        <TimeField.Label>结束时间</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>输入结束时间</TimeField.Description>
      </TimeField>
    </div>
  );
}
