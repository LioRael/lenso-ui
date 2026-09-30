"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { RangeCalendar } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../calendar/demo-parts";
import { RangeHeader, RangeGrid } from "./demo-parts";
export function ReadOnly() {
  const now = today(getLocalTimeZone());
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar
        isReadOnly
        aria-label="Trip dates"
        defaultValue={{ start: now, end: now.add({ days: 4 }) }}
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>Range calendar is read-only</CalendarNote>
    </div>
  );
}
