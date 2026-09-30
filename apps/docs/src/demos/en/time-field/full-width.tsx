"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { ChevronDown, Clock } from "@gravity-ui/icons";
import { TimeField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../date-field/demo-styles";

export function FullWidth() {
  return (
    <div {...stylex.props(styles.wide)}>
      <TimeField fullWidth name="time">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group fullWidth>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
      </TimeField>
      <TimeField fullWidth name="time-icons">
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group fullWidth>
          <TimeField.Prefix>
            <Clock {...stylex.props(styles.icon)} aria-hidden="true" />
          </TimeField.Prefix>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
          <TimeField.Suffix>
            <ChevronDown {...stylex.props(styles.icon)} aria-hidden="true" />
          </TimeField.Suffix>
        </TimeField.Group>
      </TimeField>
    </div>
  );
}
