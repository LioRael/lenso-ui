"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. */
import { RangeCalendar } from "@lenso/ui";
import { I18nProvider } from "react-aria-components/I18nProvider";
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
