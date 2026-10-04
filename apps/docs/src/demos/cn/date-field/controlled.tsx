// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { DateValue } from "@internationalized/date";
import { Button, DateField } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function Controlled() {
  const [value, setValue] = useState<DateValue | null>(null);
  return (
    <div {...stylex.props(styles.column)}>
      <DateField xstyle={styles.field} name="date" value={value} onChange={setValue}>
        <DateField.Label>日期</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>当前值：{value ? value.toString() : "（空）"}</DateField.Description>
      </DateField>
      <div {...stylex.props(styles.row)}>
        <Button variant="tertiary" onClick={() => setValue(today(getLocalTimeZone()))}>
          设为今天
        </Button>
        <Button variant="tertiary" onClick={() => setValue(null)}>
          清空
        </Button>
      </div>
    </div>
  );
}
