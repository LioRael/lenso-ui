"use client";
// Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Button.
import { GlassButton, Button, ButtonGroup, Calendar } from "@lenso/ui";
import {
  getLocalTimeZone,
  parseDate,
  startOfMonth,
  startOfWeek,
  today,
  type CalendarDate,
} from "@internationalized/date";
import { useState } from "react";
import { useLocale } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "./demo-parts";
export function Controlled() {
  const [value, setValue] = useState<CalendarDate | null>(null);
  const [focusedDate, setFocusedDate] = useState<CalendarDate>(() => parseDate("2025-12-25"));
  const { locale } = useLocale();
  const select = (date: CalendarDate) => {
    setValue(date);
    setFocusedDate(date);
  };
  return (
    <div {...stylex.props(layout.stack)}>
      <ButtonGroup fullWidth size="sm" variant="bordered">
        <Button onClick={() => select(today(getLocalTimeZone()))}>Today</Button>
        <Button onClick={() => select(startOfWeek(today(getLocalTimeZone()), locale))}>Week</Button>
        <Button onClick={() => select(startOfMonth(today(getLocalTimeZone())))}>Month</Button>
      </ButtonGroup>
      <Calendar
        aria-label="Event date"
        focusedValue={focusedDate}
        value={value}
        onChange={setValue}
        onFocusChange={setFocusedDate}
      >
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>Selected date: {value ? value.toString() : "(none)"}</CalendarNote>
      <div {...stylex.props(layout.controls)}>
        <GlassButton size="sm" variant="default" onClick={() => select(today(getLocalTimeZone()))}>
          Set Today
        </GlassButton>
        <GlassButton size="sm" variant="default" onClick={() => select(parseDate("2025-12-25"))}>
          Set Christmas
        </GlassButton>
        <GlassButton size="sm" variant="default" onClick={() => setValue(null)}>
          Clear
        </GlassButton>
      </div>
    </div>
  );
}
