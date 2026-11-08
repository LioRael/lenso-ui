"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import { RangeCalendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../../en/calendar/demo-parts";
import { RangeHeader, RangeGrid } from "../../en/range-calendar/demo-parts";
export function WeeksInMonth() {
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar aria-label="行程日期" weeksInMonth={6}>
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>每月固定显示 6 周，切换月份时避免布局跳动</CalendarNote>
    </div>
  );
}
