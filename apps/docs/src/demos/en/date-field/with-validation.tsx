"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { DateValue } from "@internationalized/date";
import { DateField } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./demo-styles";

export function WithValidation() {
  const [value, setValue] = useState<DateValue | null>(null);
  const todayDate = today(getLocalTimeZone());
  const isInvalid = value !== null && value.compare(todayDate) < 0;
  return (
    <div {...stylex.props(styles.column)}>
      <DateField
        isRequired
        xstyle={styles.field}
        isInvalid={isInvalid}
        minValue={todayDate}
        name="date"
        value={value}
        onChange={setValue}
      >
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        {isInvalid ? (
          <DateField.Error>Date must be today or in the future</DateField.Error>
        ) : (
          <DateField.Description>Enter a date from today onwards</DateField.Description>
        )}
      </DateField>
    </div>
  );
}
