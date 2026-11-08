"use client";

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import { styles } from "../../en/date-field/demo-styles";
export function Basic() {
  return (
    <DateField xstyle={styles.field} name="date">
      <DateField.Label>日期</DateField.Label>
      <DateField.Group>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField.Group>
    </DateField>
  );
}
