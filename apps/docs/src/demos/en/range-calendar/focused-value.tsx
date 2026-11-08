"use client";
// Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Button.
import { GlassButton, RangeCalendar } from "@lenso/ui";
import { parseDate, type DateValue } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../calendar/demo-parts";
import { RangeHeader, RangeGrid } from "./demo-parts";
export function FocusedValue() {
  const [focusedDate, setFocusedDate] = useState<DateValue>(() => parseDate("2025-06-15"));
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar
        aria-label="Trip dates"
        firstDayOfWeek="mon"
        focusedValue={focusedDate}
        onFocusChange={setFocusedDate}
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>Focused: {focusedDate.toString()}</CalendarNote>
      <div {...stylex.props(layout.controls)}>
        <GlassButton
          size="sm"
          variant="default"
          onClick={() => setFocusedDate(parseDate("2025-01-01"))}
        >
          Go to Jan
        </GlassButton>
        <GlassButton
          size="sm"
          variant="default"
          onClick={() => setFocusedDate(parseDate("2025-06-15"))}
        >
          Go to Jun
        </GlassButton>
        <GlassButton
          size="sm"
          variant="default"
          onClick={() => setFocusedDate(parseDate("2025-12-25"))}
        >
          Go to Christmas
        </GlassButton>
      </div>
    </div>
  );
}
