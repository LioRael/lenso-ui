// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { RangeCalendar } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../../en/calendar/demo-parts";
import { RangeHeader, RangeGrid } from "../../en/range-calendar/demo-parts";
export function AnchorUnavailableDates() {
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar
        aria-label="行程日期"
        isDateUnavailable={(date, anchorDate) =>
          anchorDate != null && Math.abs(date.compare(anchorDate)) > 7
        }
        minValue={today(getLocalTimeZone())}
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>选择开始日期后，仅前后 7 天内的日期可选</CalendarNote>
    </div>
  );
}
