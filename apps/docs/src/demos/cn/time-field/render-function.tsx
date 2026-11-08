"use client";

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { TimeField } from "@lenso/ui";
import { styles } from "../../en/date-field/demo-styles";
export function RenderFunction() {
  return (
    <TimeField
      xstyle={styles.field}
      name="time"
      render={(props) => <div {...props} data-custom="foo" />}
    >
      <TimeField.Label>时间</TimeField.Label>
      <TimeField.Group>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
}
