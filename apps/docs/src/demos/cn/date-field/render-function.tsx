// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import { styles } from "../../en/date-field/demo-styles";
export function RenderFunction() {
  return (
    <DateField
      xstyle={styles.field}
      name="date"
      render={(props) => <div {...props} data-custom="date-field" />}
    >
      <DateField.Label render={(props) => <span {...props} data-custom="date-field-label" />}>
        日期
      </DateField.Label>
      <DateField.Group render={(props) => <div {...props} data-custom="date-field-group" />}>
        <DateField.Input render={(props) => <div {...props} data-custom="date-field-input" />}>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
      </DateField.Group>
    </DateField>
  );
}
