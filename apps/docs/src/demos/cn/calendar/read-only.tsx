"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import { Calendar } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "../../en/calendar/demo-parts";
export function ReadOnly() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar isReadOnly aria-label="活动日期" defaultValue={today(getLocalTimeZone())}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>日历为只读</CalendarNote>
    </div>
  );
}
