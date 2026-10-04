// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function Disabled() {
  return (
    <div {...stylex.props(styles.column)}>
      <DateField isDisabled xstyle={styles.field} name="date" value={today(getLocalTimeZone())}>
        <DateField.Label>日期</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>该日期字段已禁用</DateField.Description>
      </DateField>
      <DateField isDisabled xstyle={styles.field} name="date-empty">
        <DateField.Label>日期</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>该日期字段已禁用</DateField.Description>
      </DateField>
    </div>
  );
}
