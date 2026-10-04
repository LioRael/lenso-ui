// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Button. */
import { Button, RangeCalendar } from "@lenso/ui";
import { parseDate, type DateValue } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../../en/calendar/demo-parts";
import { RangeHeader, RangeGrid } from "../../en/range-calendar/demo-parts";
export function FocusedValue() {
  const [focusedDate, setFocusedDate] = useState<DateValue>(() => parseDate("2025-06-15"));
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar
        aria-label="行程日期"
        firstDayOfWeek="mon"
        focusedValue={focusedDate}
        onFocusChange={setFocusedDate}
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>聚焦：{focusedDate.toString()}</CalendarNote>
      <div {...stylex.props(layout.controls)}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setFocusedDate(parseDate("2025-01-01"))}
        >
          跳转到一月
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setFocusedDate(parseDate("2025-06-15"))}
        >
          跳转到六月
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setFocusedDate(parseDate("2025-12-25"))}
        >
          跳转到圣诞节
        </Button>
      </div>
    </div>
  );
}
