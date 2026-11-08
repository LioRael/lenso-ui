"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
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
