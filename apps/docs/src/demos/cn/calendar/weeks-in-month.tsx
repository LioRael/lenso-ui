// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
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
