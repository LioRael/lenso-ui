// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. */
import { Calendar } from "@lenso/ui";
import { parseDate } from "@internationalized/date";
import { CalendarHeader, CalendarGrid } from "../../en/calendar/demo-parts";
export function DefaultValue() {
  return (
    <Calendar aria-label="活动日期" defaultValue={parseDate("2025-02-14")}>
      <CalendarHeader />
      <CalendarGrid />
    </Calendar>
  );
}
