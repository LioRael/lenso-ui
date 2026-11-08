"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import { Calendar } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "../../en/calendar/demo-parts";
export function MinMaxDates() {
  const now = today(getLocalTimeZone());
  const maxDate = now.add({
    months: 3,
  });
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar aria-label="预约日期" maxValue={maxDate} minValue={now}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>Select a date between today and {maxDate.toString()}</CalendarNote>
    </div>
  );
}
