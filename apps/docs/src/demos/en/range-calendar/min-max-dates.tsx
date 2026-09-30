"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { RangeCalendar } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../calendar/demo-parts";
import { RangeHeader, RangeGrid } from "./demo-parts";
export function MinMaxDates() {
  const now = today(getLocalTimeZone());
  const maxDate = now.add({ months: 3 });
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar aria-label="Trip dates" maxValue={maxDate} minValue={now}>
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>Select dates between today and {maxDate.toString()}</CalendarNote>
    </div>
  );
}
