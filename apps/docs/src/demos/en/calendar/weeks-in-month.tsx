"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { Calendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "./demo-parts";
export function WeeksInMonth() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar aria-label="Event date" weeksInMonth={6}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>
        Always shows 6 weeks per month to avoid layout shift when navigating
      </CalendarNote>
    </div>
  );
}
