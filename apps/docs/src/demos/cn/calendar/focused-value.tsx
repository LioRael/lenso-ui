"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Button.
import { GlassButton, Calendar } from "@lenso/ui";
import { parseDate, type DateValue } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "../../en/calendar/demo-parts";
export function FocusedValue() {
  const [focusedDate, setFocusedDate] = useState<DateValue>(() => parseDate("2025-06-15"));
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar aria-label="活动日期" focusedValue={focusedDate} onFocusChange={setFocusedDate}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>聚焦：{focusedDate.toString()}</CalendarNote>
      <div {...stylex.props(layout.controls)}>
        <GlassButton
          size="sm"
          variant="default"
          onClick={() => setFocusedDate(parseDate("2025-01-01"))}
        >
          跳转到一月
        </GlassButton>
        <GlassButton
          size="sm"
          variant="default"
          onClick={() => setFocusedDate(parseDate("2025-06-15"))}
        >
          跳转到六月
        </GlassButton>
        <GlassButton
          size="sm"
          variant="default"
          onClick={() => setFocusedDate(parseDate("2025-12-25"))}
        >
          跳转到圣诞节
        </GlassButton>
      </div>
    </div>
  );
}
