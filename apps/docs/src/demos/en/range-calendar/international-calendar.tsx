"use client";
// Copyright NextUI Inc. Apache-2.0.
import { RangeCalendar } from "@lenso/ui";
import { I18nProvider } from "@lenso/ui";
import { RangeYearHeader, RangeGrid, RangeYearGrid } from "./demo-parts";
export function InternationalCalendar() {
  return (
    <I18nProvider locale="hi-IN-u-ca-indian">
      <RangeCalendar aria-label="Trip dates">
        <RangeYearHeader />
        <RangeGrid />
        <RangeYearGrid />
      </RangeCalendar>
    </I18nProvider>
  );
}
