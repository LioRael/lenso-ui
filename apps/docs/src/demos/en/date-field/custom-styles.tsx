"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import { styles } from "./demo-styles";

export function CustomStyles() {
  return (
    <DateField xstyle={styles.field} name="due-date">
      <DateField.Label>Due date</DateField.Label>
      <DateField.Group xstyle={styles.dateCustom} variant="secondary">
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField.Group>
    </DateField>
  );
}
