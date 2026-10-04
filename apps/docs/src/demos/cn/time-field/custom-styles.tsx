// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import { styles } from "../../en/date-field/demo-styles";
export function CustomStyles() {
  return (
    <TimeField xstyle={styles.reminder} name="reminder">
      <TimeField.Label xstyle={styles.reminderLabel}>提醒时间</TimeField.Label>
      <TimeField.Description>每日签到通知。</TimeField.Description>
      <TimeField.Group xstyle={styles.reminderGroup}>
        <TimeField.Input>
          {(segment) => <TimeField.Segment xstyle={styles.foreground} segment={segment} />}
        </TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
}
