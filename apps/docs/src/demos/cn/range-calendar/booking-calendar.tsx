// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Button. */
import { Button, RangeCalendar } from "@lenso/ui";
import { getLocalTimeZone, isWeekend, today, type DateValue } from "@internationalized/date";
import { useState } from "react";
import { useLocale } from "react-aria-components/I18nProvider";
import * as stylex from "@stylexjs/stylex";
import { layout } from "../../en/calendar/demo-parts";
import { RangeHeader, RangeGrid } from "../../en/range-calendar/demo-parts";
const blockedDates = [5, 6, 12, 13, 14, 20];
export function BookingCalendar() {
  const [selectedRange, setSelectedRange] = useState<{
    start: DateValue;
    end: DateValue;
  } | null>(null);
  const { locale } = useLocale();
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar
        aria-label="预订区间"
        isDateUnavailable={(date) => isWeekend(date, locale) || blockedDates.includes(date.day)}
        minValue={today(getLocalTimeZone())}
        value={selectedRange}
        onChange={setSelectedRange}
      >
        <RangeHeader />
        <RangeGrid
          cell={(date) => (
            <RangeCalendar.Cell date={date}>
              {({ formattedDate, isUnavailable }) => (
                <>
                  {formattedDate}
                  {!isUnavailable &&
                    !isWeekend(date, locale) &&
                    blockedDates.includes(date.day) && <RangeCalendar.CellIndicator />}
                </>
              )}
            </RangeCalendar.Cell>
          )}
        />
      </RangeCalendar>
      <div {...stylex.props(layout.bookingDetails)}>
        <div {...stylex.props(layout.legend)}>
          <span {...stylex.props(layout.legendItem)}>
            <span {...stylex.props(layout.mutedDot)} />
            不可订日期
          </span>
          <span {...stylex.props(layout.legendItem)}>
            <span {...stylex.props(layout.defaultDot)} />
            周末/不可用
          </span>
        </div>
        {selectedRange ? (
          <Button size="sm" variant="primary">
            预订{selectedRange.start.toString()} {"→"} {selectedRange.end.toString()}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
