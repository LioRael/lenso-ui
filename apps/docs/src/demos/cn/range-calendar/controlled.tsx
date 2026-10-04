// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Button. */
import { Button, ButtonGroup, RangeCalendar } from "@lenso/ui";
import {
  getLocalTimeZone,
  parseDate,
  startOfMonth,
  startOfWeek,
  today,
  type DateValue,
} from "@internationalized/date";
import { useState } from "react";
import { useLocale } from "react-aria-components/I18nProvider";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../../en/calendar/demo-parts";
import { RangeHeader, RangeGrid } from "../../en/range-calendar/demo-parts";
export function Controlled() {
  const [value, setValue] = useState<{
    start: DateValue;
    end: DateValue;
  } | null>(null);
  const [focusedDate, setFocusedDate] = useState<DateValue>(() => parseDate("2025-12-25"));
  const { locale } = useLocale();
  return (
    <div {...stylex.props(layout.stack)}>
      <ButtonGroup variant="tertiary">
        <Button onClick={() => setFocusedDate(today(getLocalTimeZone()))}>本周</Button>
        <Button
          onClick={() =>
            setFocusedDate(
              startOfWeek(
                today(getLocalTimeZone()).add({
                  weeks: 1,
                }),
                locale,
              ),
            )
          }
        >
          下周
        </Button>
        <Button
          onClick={() =>
            setFocusedDate(
              startOfMonth(
                today(getLocalTimeZone()).add({
                  months: 1,
                }),
              ),
            )
          }
        >
          下月
        </Button>
      </ButtonGroup>
      <RangeCalendar
        aria-label="行程日期"
        firstDayOfWeek="mon"
        focusedValue={focusedDate}
        value={value}
        onChange={setValue}
        onFocusChange={setFocusedDate}
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>
        已选区间：{value ? `${value.start.toString()} -> ${value.end.toString()}` : "（无）"}
      </CalendarNote>
      <div {...stylex.props(layout.controls)}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            const start = today(getLocalTimeZone());
            setValue({
              end: start.add({
                days: 6,
              }),
              start,
            });
            setFocusedDate(start);
          }}
        >
          设为 1 周
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            const start = parseDate("2025-12-20");
            setValue({
              end: parseDate("2025-12-31"),
              start,
            });
            setFocusedDate(start);
          }}
        >
          设为节假日
        </Button>
        <Button size="sm" variant="tertiary" onClick={() => setValue(null)}>
          清空
        </Button>
      </div>
    </div>
  );
}
