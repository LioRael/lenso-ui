"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import { styles } from "../date-field/demo-styles";

export function CustomStyles() {
  return (
    <TimeField xstyle={styles.reminder} name="reminder">
      <TimeField.Label xstyle={styles.reminderLabel}>Reminder time</TimeField.Label>
      <TimeField.Description>Daily check-in notification.</TimeField.Description>
      <TimeField.Group xstyle={styles.reminderGroup}>
        <TimeField.Input>
          {(segment) => <TimeField.Segment xstyle={styles.foreground} segment={segment} />}
        </TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
}
