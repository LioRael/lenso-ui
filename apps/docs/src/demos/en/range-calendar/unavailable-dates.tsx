"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { RangeCalendar } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../calendar/demo-parts";
import { RangeHeader, RangeGrid } from "./demo-parts";
export function UnavailableDates() {
  const now = today(getLocalTimeZone());
  const blockedRanges = [
    [now.add({ days: 2 }), now.add({ days: 5 })],
    [now.add({ days: 12 }), now.add({ days: 13 })],
  ] as const;
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar
        aria-label="Trip dates"
        defaultValue={{ end: now.add({ days: 9 }), start: now.add({ days: 6 }) }}
        firstDayOfWeek="mon"
        isDateUnavailable={(date) =>
          blockedRanges.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0)
        }
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>Some days are unavailable</CalendarNote>
    </div>
  );
}
