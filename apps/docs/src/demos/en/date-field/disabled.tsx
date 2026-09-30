"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./demo-styles";

export function Disabled() {
  return (
    <div {...stylex.props(styles.column)}>
      <DateField isDisabled xstyle={styles.field} name="date" value={today(getLocalTimeZone())}>
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>This date field is disabled</DateField.Description>
      </DateField>
      <DateField isDisabled xstyle={styles.field} name="date-empty">
        <DateField.Label>Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <DateField.Description>This date field is disabled</DateField.Description>
      </DateField>
    </div>
  );
}
