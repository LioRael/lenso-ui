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
      <ButtonGroup fullWidth size="sm" variant="bordered">
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
        <GlassButton size="sm" variant="default" onClick={() => select(today(getLocalTimeZone()))}>
          设为今天
        </GlassButton>
        <GlassButton size="sm" variant="default" onClick={() => select(parseDate("2025-12-25"))}>
          设为圣诞节
        </GlassButton>
        <GlassButton size="sm" variant="default" onClick={() => setValue(null)}>
          清空
        </GlassButton>
      </div>
    </div>
  );
}
