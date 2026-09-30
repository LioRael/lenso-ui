"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. */
import { Calendar } from "@lenso/ui";
import { parseDate } from "@internationalized/date";
import { CalendarHeader, CalendarGrid } from "./demo-parts";
export function DefaultValue() {
  return (
    <Calendar aria-label="Event date" defaultValue={parseDate("2025-02-14")}>
      <CalendarHeader />
      <CalendarGrid />
    </Calendar>
  );
}
