"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { Calendar } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "./demo-parts";
export function Disabled() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar isDisabled aria-label="Event date" defaultValue={today(getLocalTimeZone())}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>Calendar is disabled</CalendarNote>
    </div>
  );
}
