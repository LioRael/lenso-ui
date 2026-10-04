// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import { styles } from "../../en/date-field/demo-styles";
export function CustomStyles() {
  return (
    <DateField xstyle={styles.field} name="due-date">
      <DateField.Label>截止日期</DateField.Label>
      <DateField.Group xstyle={styles.dateCustom} variant="secondary">
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField.Group>
    </DateField>
  );
}
