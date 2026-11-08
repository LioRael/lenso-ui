"use client";
import { GlassButton } from "@lenso/ui";

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { TimeValue } from "@lenso/ui";
import { TimeField } from "@lenso/ui";
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
        <GlassButton
          variant="default"
          onClick={() => {
            const currentTime = now(getLocalTimeZone());
            setValue(new Time(currentTime.hour, currentTime.minute, currentTime.second));
          }}
        >
          设为当前时间
        </GlassButton>
        <GlassButton variant="default" onClick={() => setValue(null)}>
          清空
        </GlassButton>
      </div>
    </div>
  );
}
