"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { RangeCalendar } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../calendar/demo-parts";
import { RangeHeader, RangeGrid } from "./demo-parts";
export function AnchorUnavailableDates() {
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar
        aria-label="Trip dates"
        isDateUnavailable={(date, anchorDate) =>
          anchorDate != null && Math.abs(date.compare(anchorDate)) > 7
        }
        minValue={today(getLocalTimeZone())}
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>
        After selecting a start date, only dates within 7 days are available
      </CalendarNote>
    </div>
  );
}
