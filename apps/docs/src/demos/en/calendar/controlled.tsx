"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Button. */
import { Button, ButtonGroup, Calendar } from "@lenso/ui";
import {
  getLocalTimeZone,
  parseDate,
  startOfMonth,
  startOfWeek,
  today,
  type CalendarDate,
} from "@internationalized/date";
import { useState } from "react";
import { useLocale } from "react-aria-components/I18nProvider";
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
      <ButtonGroup fullWidth size="sm" variant="tertiary">
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
        <Button size="sm" variant="secondary" onClick={() => select(today(getLocalTimeZone()))}>
          Set Today
        </Button>
        <Button size="sm" variant="secondary" onClick={() => select(parseDate("2025-12-25"))}>
          Set Christmas
        </Button>
        <Button size="sm" variant="tertiary" onClick={() => setValue(null)}>
          Clear
        </Button>
      </div>
    </div>
  );
}
