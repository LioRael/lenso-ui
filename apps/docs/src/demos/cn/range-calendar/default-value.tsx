// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. */
import { RangeCalendar } from "@lenso/ui";
import { parseDate } from "@internationalized/date";
import { RangeHeader, RangeGrid } from "../../en/range-calendar/demo-parts";
export function DefaultValue() {
  return (
    <RangeCalendar
      aria-label="行程日期"
      defaultValue={{
        end: parseDate("2025-02-12"),
        start: parseDate("2025-02-03"),
      }}
      firstDayOfWeek="mon"
    >
      <RangeHeader />
      <RangeGrid />
    </RangeCalendar>
  );
}
