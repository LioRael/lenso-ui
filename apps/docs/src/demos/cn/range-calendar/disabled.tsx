"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import { RangeCalendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../../en/calendar/demo-parts";
import { RangeHeader, RangeGrid } from "../../en/range-calendar/demo-parts";
export function Disabled() {
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar isDisabled aria-label="行程日期">
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>区间日历已禁用</CalendarNote>
    </div>
  );
}
