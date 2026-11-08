"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import { RangeCalendar } from "@lenso/ui";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../../en/calendar/demo-parts";
import { RangeHeader, RangeGrid } from "../../en/range-calendar/demo-parts";
export function AllowsNonContiguousRanges() {
  const now = today(getLocalTimeZone());
  const blockedRanges = [
    [
      now.add({
        days: 2,
      }),
      now.add({
        days: 5,
      }),
    ],
    [
      now.add({
        days: 12,
      }),
      now.add({
        days: 13,
      }),
    ],
  ] as const;
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar
        allowsNonContiguousRanges
        aria-label="行程日期"
        defaultValue={{
          end: now.add({
            days: 9,
          }),
          start: now.add({
            days: 1,
          }),
        }}
        firstDayOfWeek="mon"
        isDateUnavailable={(date) =>
          blockedRanges.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0)
        }
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>允许跨不可选日期选择非连续区间</CalendarNote>
    </div>
  );
}
