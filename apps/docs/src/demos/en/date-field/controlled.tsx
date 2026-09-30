"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { DateValue } from "@internationalized/date";
import { Button, DateField } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./demo-styles";

export function Controlled() {
  const [value, setValue] = useState<DateValue | null>(null);
  return (
    <div {...stylex.props(styles.column)}>
      <DateField xstyle={styles.field} name="date" value={value} onChange={setValue}>
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>
          Current value: {value ? value.toString() : "(empty)"}
        </DateField.Description>
      </DateField>
      <div {...stylex.props(styles.row)}>
        <Button variant="tertiary" onClick={() => setValue(today(getLocalTimeZone()))}>
          Set today
        </Button>
        <Button variant="tertiary" onClick={() => setValue(null)}>
          Clear
        </Button>
      </div>
    </div>
  );
}
