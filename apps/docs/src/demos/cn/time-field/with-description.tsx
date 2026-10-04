// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
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
