"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import { RangeCalendar } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../../en/calendar/demo-parts";
import { RangeHeader, RangeGrid } from "../../en/range-calendar/demo-parts";
export function ReadOnly() {
  const now = today(getLocalTimeZone());
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar
        isReadOnly
        aria-label="行程日期"
        defaultValue={{
          start: now,
          end: now.add({
            days: 4,
          }),
        }}
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>区间日历为只读</CalendarNote>
    </div>
  );
}
