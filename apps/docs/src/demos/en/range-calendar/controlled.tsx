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
import { CalendarNote, layout } from "../calendar/demo-parts";
import { RangeHeader, RangeGrid } from "./demo-parts";
export function Controlled() {
  const [value, setValue] = useState<{ start: DateValue; end: DateValue } | null>(null);
  const [focusedDate, setFocusedDate] = useState<DateValue>(() => parseDate("2025-12-25"));
  const { locale } = useLocale();
  return (
    <div {...stylex.props(layout.stack)}>
      <ButtonGroup variant="tertiary">
        <Button onClick={() => setFocusedDate(today(getLocalTimeZone()))}>This week</Button>
        <Button
          onClick={() =>
            setFocusedDate(startOfWeek(today(getLocalTimeZone()).add({ weeks: 1 }), locale))
          }
        >
          Next week
        </Button>
        <Button
          onClick={() => setFocusedDate(startOfMonth(today(getLocalTimeZone()).add({ months: 1 })))}
        >
          Next month
        </Button>
      </ButtonGroup>
      <RangeCalendar
        aria-label="Trip dates"
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
        Selected range: {value ? `${value.start.toString()} -> ${value.end.toString()}` : "(none)"}
      </CalendarNote>
      <div {...stylex.props(layout.controls)}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            const start = today(getLocalTimeZone());
            setValue({ end: start.add({ days: 6 }), start });
            setFocusedDate(start);
          }}
        >
          Set 1 week
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            const start = parseDate("2025-12-20");
            setValue({ end: parseDate("2025-12-31"), start });
            setFocusedDate(start);
          }}
        >
          Set Holidays
        </Button>
        <Button size="sm" variant="tertiary" onClick={() => setValue(null)}>
          Clear
        </Button>
      </div>
    </div>
  );
}
