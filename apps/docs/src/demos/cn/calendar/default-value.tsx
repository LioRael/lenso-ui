"use client";

// Copyright NextUI Inc. Apache-2.0.
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
