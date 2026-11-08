"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import { Calendar } from "@lenso/ui";
import { isWeekend } from "@internationalized/date";
import { useLocale } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "../../en/calendar/demo-parts";
export function UnavailableDates() {
  const { locale } = useLocale();
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar aria-label="预约日期" isDateUnavailable={(date) => isWeekend(date, locale)}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>周末不可选</CalendarNote>
    </div>
  );
}
