"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { TimeValue } from "react-aria-components/TimeField";
import { Button, TimeField } from "@lenso/ui";
import { Time, getLocalTimeZone, now } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../date-field/demo-styles";

export function Controlled() {
  const [value, setValue] = useState<TimeValue | null>(null);
  return (
    <div {...stylex.props(styles.column)}>
      <TimeField xstyle={styles.field} name="time" value={value} onChange={setValue}>
        <TimeField.Label>Time</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>
          Current value: {value ? value.toString() : "(empty)"}
        </TimeField.Description>
      </TimeField>
      <div {...stylex.props(styles.row)}>
        <Button
          variant="tertiary"
          onClick={() => {
            const currentTime = now(getLocalTimeZone());
            setValue(new Time(currentTime.hour, currentTime.minute, currentTime.second));
          }}
        >
          Set now
        </Button>
        <Button variant="tertiary" onClick={() => setValue(null)}>
          Clear
        </Button>
      </div>
    </div>
  );
}
