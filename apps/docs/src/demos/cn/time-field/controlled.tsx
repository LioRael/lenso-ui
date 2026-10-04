// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { TimeValue } from "react-aria-components/TimeField";
import { Button, TimeField } from "@lenso/ui";
import { Time, getLocalTimeZone, now } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function Controlled() {
  const [value, setValue] = useState<TimeValue | null>(null);
  return (
    <div {...stylex.props(styles.column)}>
      <TimeField xstyle={styles.field} name="time" value={value} onChange={setValue}>
        <TimeField.Label>时间</TimeField.Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <TimeField.Description>当前值：{value ? value.toString() : "（空）"}</TimeField.Description>
      </TimeField>
      <div {...stylex.props(styles.row)}>
        <Button
          variant="tertiary"
          onClick={() => {
            const currentTime = now(getLocalTimeZone());
            setValue(new Time(currentTime.hour, currentTime.minute, currentTime.second));
          }}
        >
          设为当前时间
        </Button>
        <Button variant="tertiary" onClick={() => setValue(null)}>
          清空
        </Button>
      </div>
    </div>
  );
}
