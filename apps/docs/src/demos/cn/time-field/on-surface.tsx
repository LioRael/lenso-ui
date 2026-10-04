// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { Clock } from "@gravity-ui/icons";
import { Surface, TimeField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function OnSurface() {
  return (
    <Surface xstyle={styles.surface}>
      <TimeField xstyle={styles.full} name="time">
        <TimeField.Label>时间</TimeField.Label>
        <TimeField.Group variant="secondary">
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>输入时间</TimeField.Description>
      </TimeField>
      <TimeField xstyle={styles.full} name="time-2">
        <TimeField.Label>预约时间</TimeField.Label>
        <TimeField.Group variant="secondary">
          <TimeField.Prefix>
            <Clock {...stylex.props(styles.icon)} aria-hidden="true" />
          </TimeField.Prefix>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>输入预约时间</TimeField.Description>
      </TimeField>
    </Surface>
  );
}
