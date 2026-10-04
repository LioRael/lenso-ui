// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
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
