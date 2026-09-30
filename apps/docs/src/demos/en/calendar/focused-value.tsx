"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Button. */
import { Button, Calendar } from "@lenso/ui";
import { parseDate, type DateValue } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "./demo-parts";
export function FocusedValue() {
  const [focusedDate, setFocusedDate] = useState<DateValue>(() => parseDate("2025-06-15"));
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar aria-label="Event date" focusedValue={focusedDate} onFocusChange={setFocusedDate}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>Focused: {focusedDate.toString()}</CalendarNote>
      <div {...stylex.props(layout.controls)}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setFocusedDate(parseDate("2025-01-01"))}
        >
          Go to Jan
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setFocusedDate(parseDate("2025-06-15"))}
        >
          Go to Jun
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setFocusedDate(parseDate("2025-12-25"))}
        >
          Go to Christmas
        </Button>
      </div>
    </div>
  );
}
