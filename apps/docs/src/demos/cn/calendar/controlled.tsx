// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
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
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "../../en/calendar/demo-parts";
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
        <Button onClick={() => select(today(getLocalTimeZone()))}>今天</Button>
        <Button onClick={() => select(startOfWeek(today(getLocalTimeZone()), locale))}>本周</Button>
        <Button onClick={() => select(startOfMonth(today(getLocalTimeZone())))}>本月</Button>
      </ButtonGroup>
      <Calendar
        aria-label="活动日期"
        focusedValue={focusedDate}
        value={value}
        onChange={setValue}
        onFocusChange={setFocusedDate}
      >
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>已选日期：{value ? value.toString() : "（未选）"}</CalendarNote>
      <div {...stylex.props(layout.controls)}>
        <Button size="sm" variant="secondary" onClick={() => select(today(getLocalTimeZone()))}>
          设为今天
        </Button>
        <Button size="sm" variant="secondary" onClick={() => select(parseDate("2025-12-25"))}>
          设为圣诞节
        </Button>
        <Button size="sm" variant="tertiary" onClick={() => setValue(null)}>
          清空
        </Button>
      </div>
    </div>
  );
}
