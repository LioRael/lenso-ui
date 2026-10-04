// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { RangeCalendar } from "@lenso/ui";
import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../../en/calendar/demo-parts";
import { RangeHeader, RangeGrid } from "../../en/range-calendar/demo-parts";
const styles = stylex.create({
  error: {
    fontSize: 14,
    color: "var(--danger)",
  },
});
export function Invalid() {
  const now = today(getLocalTimeZone());
  const [value, setValue] = useState<{
    start: DateValue;
    end: DateValue;
  }>({
    end: now.add({
      days: 14,
    }),
    start: now.add({
      days: 6,
    }),
  });
  const isInvalid = value.end.compare(value.start) > 7;
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar
        aria-label="行程日期"
        firstDayOfWeek="mon"
        isInvalid={isInvalid}
        value={value}
        onChange={setValue}
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      {isInvalid ? (
        <p {...stylex.props(styles.error)}>最长入住时间为 1 周</p>
      ) : (
        <CalendarNote>请选择最多 7 天的入住区间</CalendarNote>
      )}
    </div>
  );
}
