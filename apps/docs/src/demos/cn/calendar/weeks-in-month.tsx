"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import { Calendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "../../en/calendar/demo-parts";
export function WeeksInMonth() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar aria-label="活动日期" weeksInMonth={6}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>每月固定显示 6 周，切换月份时避免布局跳动</CalendarNote>
    </div>
  );
}
