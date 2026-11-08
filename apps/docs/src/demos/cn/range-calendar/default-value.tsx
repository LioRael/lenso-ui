"use client";

// Copyright NextUI Inc. Apache-2.0.
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
