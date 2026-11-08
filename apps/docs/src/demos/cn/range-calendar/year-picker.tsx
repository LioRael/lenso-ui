"use client";

// Copyright NextUI Inc. Apache-2.0.
import { RangeCalendar } from "@lenso/ui";
import { RangeYearHeader, RangeGrid, RangeYearGrid } from "../../en/range-calendar/demo-parts";
export function YearPicker() {
  return (
    <RangeCalendar aria-label="行程日期">
      <RangeYearHeader />
      <RangeGrid />
      <RangeYearGrid />
    </RangeCalendar>
  );
}
