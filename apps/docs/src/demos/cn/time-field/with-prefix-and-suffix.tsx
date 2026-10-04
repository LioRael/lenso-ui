// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { ChevronDown, Clock } from "@gravity-ui/icons";
import { TimeField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function WithPrefixAndSuffix() {
  return (
    <TimeField xstyle={styles.field} name="time">
      <TimeField.Label>时间</TimeField.Label>
      <TimeField.Group>
        <TimeField.Prefix>
          <Clock {...stylex.props(styles.icon)} aria-hidden="true" />
        </TimeField.Prefix>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        <TimeField.Suffix>
          <ChevronDown {...stylex.props(styles.icon)} aria-hidden="true" />
        </TimeField.Suffix>
      </TimeField.Group>
      <TimeField.Description>输入时间</TimeField.Description>
    </TimeField>
  );
}
