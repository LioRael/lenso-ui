"use client";
// Copyright NextUI Inc. Apache-2.0.
import { RangeCalendar } from "@lenso/ui";
import { RangeYearHeader, RangeGrid, RangeYearGrid } from "./demo-parts";
export function YearPicker() {
  return (
    <RangeCalendar aria-label="Trip dates">
      <RangeYearHeader />
      <RangeGrid />
      <RangeYearGrid />
    </RangeCalendar>
  );
}
