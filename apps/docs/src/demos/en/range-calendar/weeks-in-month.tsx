"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { RangeCalendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../calendar/demo-parts";
import { RangeHeader, RangeGrid } from "./demo-parts";
export function WeeksInMonth() {
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar aria-label="Trip dates" weeksInMonth={6}>
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>
        Always shows 6 weeks per month to avoid layout shift when navigating
      </CalendarNote>
    </div>
  );
}
