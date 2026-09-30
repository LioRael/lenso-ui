"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import { styles } from "../date-field/demo-styles";

export function Basic() {
  return (
    <TimeField xstyle={styles.field} name="time">
      <TimeField.Label>Time</TimeField.Label>
      <TimeField.Group>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
}
